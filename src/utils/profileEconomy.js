import { supabase } from '../supabaseClient';

export const DEFAULT_MAGIC_ART_USES = 10;
export const PREMIUM_VIDEO_UNLOCK_COST_GEMS = 10;
export const FREE_VIDEO_REWARD_GEMS = 5;
const MISSING_MAGIC_ART_USES_FALLBACK = 0;

const ECONOMY_SELECT_COLUMNS = '*';
const LOCAL_MAGIC_ART_USES_PREFIX = 'aiko_magic_art_uses_v1_';

let supportsMagicArtUsesColumn = true;

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);

const isMissingColumnError = (error, columnName) => {
  if (!columnName) return false;
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  const normalizedColumn = String(columnName).toLowerCase();
  return (
    text.includes(normalizedColumn) &&
    (
      text.includes('column') ||
      text.includes('schema cache') ||
      error?.code === '42703' ||
      error?.code === 'PGRST204'
    )
  );
};

const markMagicArtUsesUnsupported = () => {
  supportsMagicArtUsesColumn = false;
};

const getLocalMagicUsesKey = (userId) => `${LOCAL_MAGIC_ART_USES_PREFIX}${userId || 'guest'}`;

const readLocalMagicUses = (userId, fallback = MISSING_MAGIC_ART_USES_FALLBACK) => {
  if (typeof window === 'undefined' || !userId) return fallback;
  try {
    const raw = window.localStorage.getItem(getLocalMagicUsesKey(userId));
    return normalizeNumber(raw, fallback);
  } catch {
    return fallback;
  }
};

const writeLocalMagicUses = (userId, uses) => {
  if (typeof window === 'undefined' || !userId) return;
  try {
    window.localStorage.setItem(
      getLocalMagicUsesKey(userId),
      String(normalizeNumber(uses, MISSING_MAGIC_ART_USES_FALLBACK))
    );
  } catch {
    // Ignore storage write failures in private mode / quota issues.
  }
};

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
};

const normalizeStringArray = (value) =>
  Array.isArray(value)
    ? [
        ...new Set(
          value
            .map((item) => {
              if (item === null || item === undefined) return '';
              if (typeof item === 'string') return item.trim();
              if (typeof item === 'number' || typeof item === 'boolean') return String(item).trim();
              return '';
            })
            .filter(Boolean)
        ),
      ]
    : [];

export const normalizeEconomyProfile = (profile = null) => {
  if (!profile) return null;
  const hasMagicArtUses = hasOwn(profile, 'magic_art_uses');
  const magicArtFallback = hasMagicArtUses ? DEFAULT_MAGIC_ART_USES : MISSING_MAGIC_ART_USES_FALLBACK;

  return {
    ...profile,
    gems: normalizeNumber(profile.gems, 0),
    magic_art_uses: normalizeNumber(profile.magic_art_uses, magicArtFallback),
    unlocked_zones: normalizeStringArray(profile.unlocked_zones),
    unlocked_videos: normalizeStringArray(profile.unlocked_videos),
    unlocked_items: normalizeStringArray(profile.unlocked_items),
    claimed_rewards: normalizeStringArray(profile.claimed_rewards),
  };
};

const applyMagicUsesFallback = (userId, profile) => {
  if (!profile) return null;
  if (supportsMagicArtUsesColumn) return profile;

  const localUses = readLocalMagicUses(
    userId,
    normalizeNumber(profile.magic_art_uses, MISSING_MAGIC_ART_USES_FALLBACK)
  );
  return {
    ...profile,
    magic_art_uses: localUses,
  };
};

const getEconomyDefaults = () => ({
  gems: 0,
  unlocked_zones: [],
  unlocked_videos: [],
  unlocked_items: [],
  claimed_rewards: [],
  ...(supportsMagicArtUsesColumn ? { magic_art_uses: DEFAULT_MAGIC_ART_USES } : {}),
});

const buildEconomyBackfill = (profile = null) => {
  const patch = {};

  const hasMagicArtUses = hasOwn(profile, 'magic_art_uses');
  if (!hasMagicArtUses) {
    markMagicArtUsesUnsupported();
  }

  if (supportsMagicArtUsesColumn && hasMagicArtUses && !Number.isFinite(Number(profile?.magic_art_uses))) {
    patch.magic_art_uses = DEFAULT_MAGIC_ART_USES;
  }
  if (!Array.isArray(profile?.unlocked_zones)) {
    patch.unlocked_zones = [];
  }
  if (!Array.isArray(profile?.unlocked_videos)) {
    patch.unlocked_videos = [];
  }
  if (!Array.isArray(profile?.unlocked_items)) {
    patch.unlocked_items = [];
  }
  if (!Array.isArray(profile?.claimed_rewards)) {
    patch.claimed_rewards = [];
  }

  return patch;
};

export const ensureEconomyProfile = async (userId) => {
  if (!userId) {
    return { ok: false, code: 'auth_required', message: 'Please log in first.' };
  }

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      return { ok: false, code: 'profile_fetch_error', message: fetchError.message || 'Failed to load profile.' };
    }

    if (!existing) {
      const defaults = getEconomyDefaults();
      let { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, ...defaults })
        .select('*')
        .single();

      if (insertError && isMissingColumnError(insertError, 'magic_art_uses') && hasOwn(defaults, 'magic_art_uses')) {
        markMagicArtUsesUnsupported();

        const retryPayload = { ...defaults };
        delete retryPayload.magic_art_uses;

        ({ data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, ...retryPayload })
          .select('*')
          .single());
      }

      if (insertError) {
        return { ok: false, code: 'profile_insert_error', message: insertError.message || 'Failed to create profile.' };
      }

      return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(inserted)) };
    }

    const patch = buildEconomyBackfill(existing);
    if (Object.keys(patch).length === 0) {
      return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(existing)) };
    }

    let { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select('*')
      .single();

    if (updateError && isMissingColumnError(updateError, 'magic_art_uses') && hasOwn(patch, 'magic_art_uses')) {
      markMagicArtUsesUnsupported();
      const retryPatch = { ...patch };
      delete retryPatch.magic_art_uses;

      if (Object.keys(retryPatch).length === 0) {
        return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(existing)) };
      }

      ({ data: updated, error: updateError } = await supabase
        .from('profiles')
        .update(retryPatch)
        .eq('id', userId)
        .select('*')
        .single());
    }

    if (updateError) {
      return { ok: false, code: 'profile_backfill_error', message: updateError.message || 'Failed to patch profile.' };
    }

    return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(updated)) };
  } catch (error) {
    return { ok: false, code: 'unexpected_error', message: error?.message || 'Unexpected profile error.' };
  }
};

export const readEconomyState = async (userId) => {
  if (!userId) {
    return { ok: false, code: 'auth_required', message: 'Please log in first.' };
  }

  try {
    const ensured = await ensureEconomyProfile(userId);
    if (!ensured.ok) {
      return ensured;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(ECONOMY_SELECT_COLUMNS)
      .eq('id', userId)
      .single();

    if (error) {
      return { ok: false, code: 'profile_fetch_error', message: error.message || 'Failed to read profile economy.' };
    }

    return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(data)) };
  } catch (error) {
    return { ok: false, code: 'unexpected_error', message: error?.message || 'Unexpected profile read error.' };
  }
};

const persistWithoutMagicArtColumn = async (userId, patch) => {
  const patchHasMagicUses = hasOwn(patch, 'magic_art_uses');
  const nextMagicUses = patchHasMagicUses
    ? normalizeNumber(patch.magic_art_uses, MISSING_MAGIC_ART_USES_FALLBACK)
    : readLocalMagicUses(userId, MISSING_MAGIC_ART_USES_FALLBACK);

  if (patchHasMagicUses) {
    writeLocalMagicUses(userId, nextMagicUses);
  }

  const dbPatch = { ...patch };
  delete dbPatch.magic_art_uses;

  if (Object.keys(dbPatch).length === 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select(ECONOMY_SELECT_COLUMNS)
      .eq('id', userId)
      .single();

    if (error) {
      return { ok: false, code: 'profile_fetch_error', message: error.message || 'Failed to read profile economy.' };
    }

    return {
      ok: true,
      profile: applyMagicUsesFallback(
        userId,
        normalizeEconomyProfile({
          ...data,
          magic_art_uses: nextMagicUses,
        })
      ),
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(dbPatch)
    .eq('id', userId)
    .select(ECONOMY_SELECT_COLUMNS)
    .single();

  if (error) {
    return { ok: false, code: 'profile_update_error', message: error.message || 'Failed to update profile.' };
  }

  return {
    ok: true,
    profile: applyMagicUsesFallback(
      userId,
      normalizeEconomyProfile({
        ...data,
        magic_art_uses: nextMagicUses,
      })
    ),
  };
};

const persistEconomyState = async (userId, patch) => {
  if (!supportsMagicArtUsesColumn && hasOwn(patch, 'magic_art_uses')) {
    return persistWithoutMagicArtColumn(userId, patch);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select(ECONOMY_SELECT_COLUMNS)
    .single();

  if (error && isMissingColumnError(error, 'magic_art_uses')) {
    markMagicArtUsesUnsupported();
    return persistWithoutMagicArtColumn(userId, patch);
  }

  if (error) {
    return { ok: false, code: 'profile_update_error', message: error.message || 'Failed to update profile.' };
  }

  return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(data)) };
};

export const buyMagicArtPack = async ({ userId, costGems, packUses }) => {
  if (!userId) return { ok: false, code: 'auth_required', message: 'Please log in first.' };

  const spend = normalizeNumber(costGems, 0);
  const usesToAdd = normalizeNumber(packUses, 0);
  if (spend <= 0 || usesToAdd <= 0) {
    return { ok: false, code: 'invalid_input', message: 'Invalid pack configuration.' };
  }

  const current = await readEconomyState(userId);
  if (!current.ok) return current;

  const { profile } = current;
  if (profile.gems < spend) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spend} Gems but only have ${profile.gems}.`,
      gems: profile.gems,
      required: spend,
    };
  }

  return persistEconomyState(userId, {
    gems: profile.gems - spend,
    magic_art_uses: profile.magic_art_uses + usesToAdd,
  });
};

export const consumeMagicArtUse = async ({ userId, amount = 1 }) => {
  if (!userId) return { ok: false, code: 'auth_required', message: 'Please log in first.' };

  const consume = normalizeNumber(amount, 1);
  if (consume <= 0) {
    return { ok: false, code: 'invalid_input', message: 'Invalid consume amount.' };
  }

  const current = await readEconomyState(userId);
  if (!current.ok) return current;

  const { profile } = current;
  if (profile.magic_art_uses < consume) {
    return { ok: false, code: 'no_uses_left', message: 'No Magic Art uses left.', uses: profile.magic_art_uses };
  }

  return persistEconomyState(userId, {
    magic_art_uses: profile.magic_art_uses - consume,
  });
};

export const unlockZoneWithGems = async ({ userId, zoneId, costGems }) => {
  if (!userId) return { ok: false, code: 'auth_required', message: 'Please log in first.' };
  if (!zoneId || typeof zoneId !== 'string') {
    return { ok: false, code: 'invalid_zone', message: 'Invalid zone id.' };
  }

  const spend = normalizeNumber(costGems, 0);
  if (spend <= 0) {
    return { ok: false, code: 'invalid_cost', message: 'Invalid unlock cost.' };
  }

  const current = await readEconomyState(userId);
  if (!current.ok) return current;

  const { profile } = current;
  if (profile.unlocked_zones.includes(zoneId)) {
    return { ok: true, alreadyUnlocked: true, profile };
  }
  if (profile.gems < spend) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spend} Gems but only have ${profile.gems}.`,
      gems: profile.gems,
      required: spend,
    };
  }

  return persistEconomyState(userId, {
    gems: profile.gems - spend,
    unlocked_zones: [...profile.unlocked_zones, zoneId],
  });
};

export const unlockVideoWithGems = async ({ userId, videoId, costGems = PREMIUM_VIDEO_UNLOCK_COST_GEMS }) => {
  if (!userId) return { ok: false, code: 'auth_required', message: 'Please log in first.' };
  if (!videoId || typeof videoId !== 'string') {
    return { ok: false, code: 'invalid_video', message: 'Invalid video id.' };
  }

  const spend = normalizeNumber(costGems, PREMIUM_VIDEO_UNLOCK_COST_GEMS);
  if (spend <= 0) {
    return { ok: false, code: 'invalid_cost', message: 'Invalid unlock cost.' };
  }

  const current = await readEconomyState(userId);
  if (!current.ok) return current;

  const { profile } = current;
  if (profile.unlocked_videos.includes(videoId)) {
    return { ok: true, alreadyUnlocked: true, profile };
  }
  if (profile.gems < spend) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spend} Gems but only have ${profile.gems}.`,
      gems: profile.gems,
      required: spend,
    };
  }

  return persistEconomyState(userId, {
    gems: profile.gems - spend,
    unlocked_videos: [...profile.unlocked_videos, videoId],
  });
};

export const unlockItemWithGems = async ({ userId, itemKey, costGems }) => {
  if (!userId) return { ok: false, code: 'auth_required', message: 'Please log in first.' };
  if (!itemKey || typeof itemKey !== 'string') {
    return { ok: false, code: 'invalid_item_key', message: 'Invalid item key.' };
  }

  const spend = normalizeNumber(costGems, 0);
  if (spend <= 0) {
    return { ok: false, code: 'invalid_cost', message: 'Invalid unlock cost.' };
  }

  const current = await readEconomyState(userId);
  if (!current.ok) return current;

  const { profile } = current;
  if (profile.unlocked_items.includes(itemKey)) {
    return { ok: true, alreadyUnlocked: true, profile };
  }
  if (profile.gems < spend) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spend} Gems but only have ${profile.gems}.`,
      gems: profile.gems,
      required: spend,
    };
  }

  return persistEconomyState(userId, {
    gems: profile.gems - spend,
    unlocked_items: [...profile.unlocked_items, itemKey],
  });
};

export const claimRewardOnce = async ({ userId, rewardKey, gemReward = 0 }) => {
  if (!userId) return { ok: false, code: 'auth_required', message: 'Please log in first.' };
  if (!rewardKey || typeof rewardKey !== 'string') {
    return { ok: false, code: 'invalid_reward_key', message: 'Invalid reward key.' };
  }

  const reward = normalizeNumber(gemReward, 0);

  const current = await readEconomyState(userId);
  if (!current.ok) return current;

  const { profile } = current;
  if (profile.claimed_rewards.includes(rewardKey)) {
    return { ok: true, alreadyClaimed: true, profile };
  }

  return persistEconomyState(userId, {
    gems: profile.gems + reward,
    claimed_rewards: [...profile.claimed_rewards, rewardKey],
  });
};
