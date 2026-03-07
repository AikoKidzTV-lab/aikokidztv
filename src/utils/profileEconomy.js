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

export const unlockZoneWithGems = async () => ({ ok: true });
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
