import { supabase } from '../supabaseClient';

export const DEFAULT_MAGIC_ART_USES = 0;
export const PREMIUM_VIDEO_UNLOCK_COST_GEMS = 0;
export const FREE_VIDEO_REWARD_GEMS = 0;

const LOCAL_MAGIC_ART_USES_PREFIX = 'aiko_magic_art_uses_fallback_v1_';

const normalizeWholeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
};

const toStorageKey = (userId) => `${LOCAL_MAGIC_ART_USES_PREFIX}${String(userId || '')}`;

const readLocalMagicArtUses = (userId, fallback = DEFAULT_MAGIC_ART_USES) => {
  if (!userId || typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(toStorageKey(userId));
  return normalizeWholeNumber(raw, fallback);
};

const writeLocalMagicArtUses = (userId, uses) => {
  if (!userId || typeof window === 'undefined') return;
  window.localStorage.setItem(toStorageKey(userId), String(normalizeWholeNumber(uses, DEFAULT_MAGIC_ART_USES)));
};

const isMissingColumnError = (error, columnName) => {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  const normalizedColumn = String(columnName || '').toLowerCase();
  if (!normalizedColumn) return false;
  return (
    text.includes(normalizedColumn) &&
    (text.includes('column') || text.includes('schema cache') || error?.code === '42703' || error?.code === 'PGRST204')
  );
};

const isMissingTableError = (error, tableName) => {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  const normalizedTable = String(tableName || '').toLowerCase();
  if (!normalizedTable) return false;
  return text.includes(normalizedTable) || error?.code === '42P01';
};

const toStringArray = (value) =>
  Array.isArray(value)
    ? [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))]
    : [];

const mergeProfileWithUses = (profile, userId, uses) => {
  const source = profile && typeof profile === 'object' ? profile : {};
  return {
    ...source,
    id: source.id || userId || null,
    gems: normalizeWholeNumber(source.gems),
    magic_art_uses: normalizeWholeNumber(uses, DEFAULT_MAGIC_ART_USES),
  };
};

export const getMagicArtUsesFromProfile = (profile, userId, fallback = DEFAULT_MAGIC_ART_USES) => {
  const profileUses = normalizeWholeNumber(profile?.magic_art_uses, -1);
  if (profileUses >= 0) return profileUses;
  return readLocalMagicArtUses(userId, fallback);
};

const loadProfileEconomy = async (userId) => {
  if (!userId) {
    return { ok: false, code: 'auth_required', message: 'Please log in to continue.' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return { ok: false, code: 'profile_error', message: error.message || 'Failed to load profile.' };
  }

  const profile = data && typeof data === 'object' ? data : { id: userId, gems: 0 };
  const safeUses = getMagicArtUsesFromProfile(profile, userId, DEFAULT_MAGIC_ART_USES);
  return { ok: true, profile: mergeProfileWithUses(profile, userId, safeUses) };
};

const updateProfileMagicArtEconomy = async ({ userId, nextGems, nextUses }) => {
  const payload = {
    gems: normalizeWholeNumber(nextGems),
    magic_art_uses: normalizeWholeNumber(nextUses, DEFAULT_MAGIC_ART_USES),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .maybeSingle();

  if (!error) {
    writeLocalMagicArtUses(userId, payload.magic_art_uses);
    return {
      ok: true,
      profile: mergeProfileWithUses(data || payload, userId, payload.magic_art_uses),
    };
  }

  if (!isMissingColumnError(error, 'magic_art_uses')) {
    return { ok: false, code: 'update_error', message: error.message || 'Failed to update profile.' };
  }

  const { data: gemsData, error: gemsError } = await supabase
    .from('profiles')
    .update({ gems: payload.gems })
    .eq('id', userId)
    .select('*')
    .maybeSingle();

  if (gemsError) {
    return { ok: false, code: 'update_error', message: gemsError.message || 'Failed to update gem wallet.' };
  }

  writeLocalMagicArtUses(userId, payload.magic_art_uses);
  return {
    ok: true,
    profile: mergeProfileWithUses(gemsData || { id: userId, gems: payload.gems }, userId, payload.magic_art_uses),
  };
};

export const unlockZoneWithGems = async ({ userId, zoneId, costGems } = {}) => {
  if (!userId) {
    return { ok: false, code: 'auth_required', message: 'Please log in to continue.' };
  }

  const normalizedZoneId = String(zoneId || '').trim().toLowerCase();
  if (!normalizedZoneId) {
    return { ok: false, code: 'invalid_zone', message: 'Invalid learning zone unlock request.' };
  }

  const spendAmount = normalizeWholeNumber(costGems);
  if (spendAmount <= 0) {
    return { ok: false, code: 'invalid_cost', message: 'Invalid unlock cost configuration.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, gems, unlocked_zones, unlocked_features')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false,
      code: 'profile_error',
      message: profileError.message || 'Failed to load profile.',
    };
  }

  const sourceProfile = profile && typeof profile === 'object' ? profile : { id: userId, gems: 0 };
  const currentGems = normalizeWholeNumber(sourceProfile.gems);
  const currentUnlockedZones = toStringArray(sourceProfile.unlocked_zones);
  const currentUnlockedFeatures = toStringArray(sourceProfile.unlocked_features);
  const isAlreadyUnlocked =
    currentUnlockedZones.includes(normalizedZoneId) || currentUnlockedFeatures.includes(normalizedZoneId);

  if (isAlreadyUnlocked) {
    return {
      ok: true,
      alreadyUnlocked: true,
      gems: currentGems,
      zoneId: normalizedZoneId,
    };
  }

  if (currentGems < spendAmount) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `Not enough Gems. ${spendAmount} Gems required.`,
      gems: currentGems,
      required: spendAmount,
    };
  }

  const nextGems = Math.max(0, currentGems - spendAmount);
  const nextUnlockedZones = [...new Set([...currentUnlockedZones, normalizedZoneId])];
  const nextUnlockedFeatures = [...new Set([...currentUnlockedFeatures, normalizedZoneId])];

  let { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      gems: nextGems,
      unlocked_zones: nextUnlockedZones,
      unlocked_features: nextUnlockedFeatures,
    })
    .eq('id', userId);

  if (profileUpdateError && isMissingColumnError(profileUpdateError, 'unlocked_features')) {
    ({ error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        gems: nextGems,
        unlocked_zones: nextUnlockedZones,
      })
      .eq('id', userId));
  }

  if (profileUpdateError && isMissingColumnError(profileUpdateError, 'unlocked_zones')) {
    ({ error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        gems: nextGems,
        unlocked_features: nextUnlockedFeatures,
      })
      .eq('id', userId));
  }

  if (profileUpdateError) {
    return {
      ok: false,
      code: 'update_error',
      message: profileUpdateError.message || 'Failed to unlock module.',
    };
  }

  // Persist unlock in dedicated table when available.
  const unlockRecord = {
    user_id: userId,
    module_id: normalizedZoneId,
    status: 'active',
    unlocked_at: new Date().toISOString(),
  };

  let { error: insertUnlockRecordError } = await supabase
    .from('unlocked_modules')
    .upsert(unlockRecord, { onConflict: 'user_id,module_id' });

  if (insertUnlockRecordError && isMissingColumnError(insertUnlockRecordError, 'module_id')) {
    ({ error: insertUnlockRecordError } = await supabase
      .from('unlocked_modules')
      .upsert(
        {
          user_id: userId,
          zone_id: normalizedZoneId,
          status: 'active',
          unlocked_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,zone_id' }
      ));
  }

  const canIgnoreUnlockRecordError =
    isMissingTableError(insertUnlockRecordError, 'unlocked_modules') ||
    isMissingColumnError(insertUnlockRecordError, 'module_id') ||
    isMissingColumnError(insertUnlockRecordError, 'zone_id') ||
    isMissingColumnError(insertUnlockRecordError, 'status') ||
    isMissingColumnError(insertUnlockRecordError, 'unlocked_at');

  if (insertUnlockRecordError && !canIgnoreUnlockRecordError) {
    await supabase
      .from('profiles')
      .update({
        gems: currentGems,
        unlocked_zones: currentUnlockedZones,
        unlocked_features: currentUnlockedFeatures,
      })
      .eq('id', userId);

    return {
      ok: false,
      code: 'unlock_record_error',
      message: insertUnlockRecordError.message || 'Failed to persist unlock record. Transaction rolled back.',
    };
  }

  return {
    ok: true,
    gems: nextGems,
    spent: spendAmount,
    zoneId: normalizedZoneId,
    unlockedZones: nextUnlockedZones,
    unlockedFeatures: nextUnlockedFeatures,
  };
};
export const claimRewardOnce = async () => ({ ok: true, alreadyClaimed: false });

export const buyMagicArtPack = async ({ userId, costGems, packUses } = {}) => {
  const spendAmount = normalizeWholeNumber(costGems);
  const addUses = normalizeWholeNumber(packUses);

  if (addUses <= 0) {
    return { ok: false, code: 'invalid_pack', message: 'Invalid Magic Art pack configuration.' };
  }

  const current = await loadProfileEconomy(userId);
  if (!current.ok) return current;

  const currentGems = normalizeWholeNumber(current.profile?.gems);
  const currentUses = getMagicArtUsesFromProfile(current.profile, userId, DEFAULT_MAGIC_ART_USES);

  if (spendAmount > 0 && currentGems < spendAmount) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spendAmount} Gems but only have ${currentGems}.`,
      gems: currentGems,
      required: spendAmount,
    };
  }

  const nextGems = Math.max(0, currentGems - spendAmount);
  const nextUses = Math.max(0, currentUses + addUses);

  const updateResult = await updateProfileMagicArtEconomy({
    userId,
    nextGems,
    nextUses,
  });

  if (!updateResult.ok) return updateResult;

  return {
    ok: true,
    gems: nextGems,
    spent: spendAmount,
    remaining: nextUses,
    profile: updateResult.profile,
  };
};

export const consumeMagicArtUse = async ({ userId, amount = 1 } = {}) => {
  const spendUses = normalizeWholeNumber(amount);
  if (spendUses <= 0) {
    return { ok: false, code: 'invalid_amount', message: 'Invalid usage amount.' };
  }

  const current = await loadProfileEconomy(userId);
  if (!current.ok) return current;

  const currentUses = getMagicArtUsesFromProfile(current.profile, userId, DEFAULT_MAGIC_ART_USES);
  if (currentUses < spendUses) {
    return {
      ok: false,
      code: 'insufficient_uses',
      message: 'No Magic Art uses left. Buy a new pack to continue.',
      remaining: currentUses,
      required: spendUses,
    };
  }

  const nextUses = Math.max(0, currentUses - spendUses);
  const nextGems = normalizeWholeNumber(current.profile?.gems);

  const updateResult = await updateProfileMagicArtEconomy({
    userId,
    nextGems,
    nextUses,
  });

  if (!updateResult.ok) return updateResult;

  return {
    ok: true,
    remaining: nextUses,
    profile: updateResult.profile,
  };
};

export const unlockVideoWithGems = async () => ({ ok: true });
export const unlockItemWithGems = async () => ({ ok: true });
