import { supabase } from '../supabaseClient';

export const DEFAULT_MAGIC_ART_USES = 10;
export const PREMIUM_VIDEO_UNLOCK_COST_GEMS = 10;
export const FREE_VIDEO_REWARD_GEMS = 5;
const MISSING_MAGIC_ART_USES_FALLBACK = 0;

const ECONOMY_SELECT_COLUMNS = '*';
const ECONOMY_SELECT_COLUMNS_FALLBACK =
  'id, role, gems, aiko_gems, niko_gems, kinu_gems, mimi_gems, miko_gems, chiko_gems, unlocked_cards, unlocked_zones, unlocked_features, unlocked_videos, unlocked_items, claimed_rewards, created_at, updated_at';
const ECONOMY_SELECT_COLUMNS_FALLBACK_NO_UNLOCKED_VIDEOS =
  'id, role, gems, aiko_gems, niko_gems, kinu_gems, mimi_gems, miko_gems, chiko_gems, unlocked_cards, unlocked_zones, unlocked_features, unlocked_items, claimed_rewards, created_at, updated_at';
const LOCAL_MAGIC_ART_USES_PREFIX = 'aiko_magic_art_uses_v1_';
const UNIVERSAL_TO_CHARACTER_GEM_COST = 50;
const CHARACTER_GEM_REWARD = 10;

let supportsMagicArtUsesColumn = true;
let supportsUnlockedVideosColumn = true;

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

const isRlsDeniedError = (error) => {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return error?.code === '42501' || text.includes('row-level security');
};

const markMagicArtUsesUnsupported = () => {
  supportsMagicArtUsesColumn = false;
};

const markUnlockedVideosUnsupported = () => {
  supportsUnlockedVideosColumn = false;
};

const stripUnsupportedColumnsFromPatch = (patch = {}) => {
  const dbPatch = { ...patch };
  if (!supportsMagicArtUsesColumn) {
    delete dbPatch.magic_art_uses;
  }
  if (!supportsUnlockedVideosColumn) {
    delete dbPatch.unlocked_videos;
  }
  return dbPatch;
};

const reconcileColumnSupportFromRow = (profile = null) => {
  if (!profile) return;
  if (!hasOwn(profile, 'magic_art_uses')) {
    markMagicArtUsesUnsupported();
  }
  if (!hasOwn(profile, 'unlocked_videos')) {
    markUnlockedVideosUnsupported();
  }
};

const readProfileRowById = async ({ userId, maybeSingle = false }) => {
  const runQuery = (columns) => {
    let query = supabase.from('profiles').select(columns).eq('id', userId);
    query = maybeSingle ? query.maybeSingle() : query.single();
    return query;
  };

  let { data, error } = await runQuery(ECONOMY_SELECT_COLUMNS);

  if (error && isMissingColumnError(error, 'magic_art_uses')) {
    markMagicArtUsesUnsupported();
    ({ data, error } = await runQuery(ECONOMY_SELECT_COLUMNS_FALLBACK));
  }

  if (error && isMissingColumnError(error, 'unlocked_videos')) {
    markUnlockedVideosUnsupported();
    ({ data, error } = await runQuery(ECONOMY_SELECT_COLUMNS_FALLBACK_NO_UNLOCKED_VIDEOS));
  }

  if (data) {
    reconcileColumnSupportFromRow(data);
  }

  return { data, error };
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
    aiko_gems: normalizeNumber(profile.aiko_gems, 0),
    niko_gems: normalizeNumber(profile.niko_gems, 0),
    kinu_gems: normalizeNumber(profile.kinu_gems, 0),
    mimi_gems: normalizeNumber(profile.mimi_gems, 0),
    miko_gems: normalizeNumber(profile.miko_gems, 0),
    chiko_gems: normalizeNumber(profile.chiko_gems, 0),
    magic_art_uses: normalizeNumber(profile.magic_art_uses, magicArtFallback),
    unlocked_cards: normalizeStringArray(profile.unlocked_cards),
    unlocked_zones: normalizeStringArray(profile.unlocked_zones),
    unlocked_features: normalizeStringArray(profile.unlocked_features),
    unlocked_videos: supportsUnlockedVideosColumn
      ? normalizeStringArray(profile.unlocked_videos)
      : [],
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
  aiko_gems: 0,
  niko_gems: 0,
  kinu_gems: 0,
  mimi_gems: 0,
  miko_gems: 0,
  chiko_gems: 0,
  unlocked_cards: [],
  unlocked_zones: [],
  unlocked_features: [],
  ...(supportsUnlockedVideosColumn ? { unlocked_videos: [] } : {}),
  unlocked_items: [],
  claimed_rewards: [],
  ...(supportsMagicArtUsesColumn ? { magic_art_uses: DEFAULT_MAGIC_ART_USES } : {}),
});

const buildEconomyBackfill = (profile = null) => {
  const patch = {};

  const hasMagicArtUses = hasOwn(profile, 'magic_art_uses');
  const hasUnlockedVideos = hasOwn(profile, 'unlocked_videos');
  if (!hasMagicArtUses) {
    markMagicArtUsesUnsupported();
  }
  if (!hasUnlockedVideos) {
    markUnlockedVideosUnsupported();
  }

  if (supportsMagicArtUsesColumn && hasMagicArtUses && !Number.isFinite(Number(profile?.magic_art_uses))) {
    patch.magic_art_uses = DEFAULT_MAGIC_ART_USES;
  }
  if (hasOwn(profile, 'unlocked_zones') && !Array.isArray(profile?.unlocked_zones)) {
    patch.unlocked_zones = [];
  }
  if (hasOwn(profile, 'unlocked_features') && !Array.isArray(profile?.unlocked_features)) {
    patch.unlocked_features = [];
  }
  if (supportsUnlockedVideosColumn && hasUnlockedVideos && !Array.isArray(profile?.unlocked_videos)) {
    patch.unlocked_videos = [];
  }
  if (hasOwn(profile, 'unlocked_items') && !Array.isArray(profile?.unlocked_items)) {
    patch.unlocked_items = [];
  }
  if (hasOwn(profile, 'unlocked_cards') && !Array.isArray(profile?.unlocked_cards)) {
    patch.unlocked_cards = [];
  }
  if (hasOwn(profile, 'claimed_rewards') && !Array.isArray(profile?.claimed_rewards)) {
    patch.claimed_rewards = [];
  }

  return patch;
};

export const ensureEconomyProfile = async (userId) => {
  if (!userId) {
    return { ok: false, code: 'auth_required', message: 'Please log in first.' };
  }

  try {
    const { data: existing, error: fetchError } = await readProfileRowById({
      userId,
      maybeSingle: true,
    });

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

      if (insertError) {
        const retryPayload = { ...defaults };
        let shouldRetryInsert = false;

        if (hasOwn(retryPayload, 'magic_art_uses') && isMissingColumnError(insertError, 'magic_art_uses')) {
          markMagicArtUsesUnsupported();
          delete retryPayload.magic_art_uses;
          shouldRetryInsert = true;
        }

        if (hasOwn(retryPayload, 'unlocked_videos') && isMissingColumnError(insertError, 'unlocked_videos')) {
          markUnlockedVideosUnsupported();
          delete retryPayload.unlocked_videos;
          shouldRetryInsert = true;
        }

        if (shouldRetryInsert) {
          ({ data: inserted, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: userId, ...retryPayload })
            .select('*')
            .single());
        }
      }

      if (insertError) {
        return { ok: false, code: 'profile_insert_error', message: insertError.message || 'Failed to create profile.' };
      }

      return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(inserted)) };
    }

    const patch = stripUnsupportedColumnsFromPatch(buildEconomyBackfill(existing));
    if (Object.keys(patch).length === 0) {
      return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(existing)) };
    }

    let { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select('*')
      .single();

    if (updateError) {
      const retryPatch = { ...patch };
      let shouldRetryPatch = false;

      if (hasOwn(retryPatch, 'magic_art_uses') && isMissingColumnError(updateError, 'magic_art_uses')) {
        markMagicArtUsesUnsupported();
        delete retryPatch.magic_art_uses;
        shouldRetryPatch = true;
      }

      if (hasOwn(retryPatch, 'unlocked_videos') && isMissingColumnError(updateError, 'unlocked_videos')) {
        markUnlockedVideosUnsupported();
        delete retryPatch.unlocked_videos;
        shouldRetryPatch = true;
      }

      if (shouldRetryPatch) {
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

    const { data, error } = await readProfileRowById({ userId, maybeSingle: false });

    if (error) {
      if (ensured.profile) {
        return {
          ok: true,
          profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(ensured.profile)),
          warning: error.message || 'Profile refresh failed. Using last known profile data.',
        };
      }

      return {
        ok: false,
        code: 'profile_fetch_error',
        message: error.message || 'Failed to read profile economy.',
      };
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

  const dbPatch = stripUnsupportedColumnsFromPatch(patch);
  delete dbPatch.magic_art_uses;

  if (Object.keys(dbPatch).length === 0) {
    const { data, error } = await readProfileRowById({ userId, maybeSingle: false });

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
  const dbPatch = stripUnsupportedColumnsFromPatch(patch);
  if (Object.keys(dbPatch).length === 0) {
    const { data, error } = await readProfileRowById({ userId, maybeSingle: false });
    if (error) {
      return { ok: false, code: 'profile_fetch_error', message: error.message || 'Failed to read profile economy.' };
    }
    return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(data)) };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(dbPatch)
    .eq('id', userId)
    .select(ECONOMY_SELECT_COLUMNS)
    .single();

  if (error && isMissingColumnError(error, 'magic_art_uses')) {
    markMagicArtUsesUnsupported();
    return persistWithoutMagicArtColumn(userId, patch);
  }

  if (error && isMissingColumnError(error, 'unlocked_videos')) {
    markUnlockedVideosUnsupported();
    return persistEconomyState(userId, patch);
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

  const { data: latestProfileRaw, error: latestProfileError } = await readProfileRowById({
    userId,
    maybeSingle: false,
  });

  if (latestProfileError) {
    return {
      ok: false,
      code: 'profile_fetch_error',
      message: latestProfileError.message || 'Failed to load latest profile before unlock.',
    };
  }

  const latestProfile = normalizeEconomyProfile(latestProfileRaw);
  const currentGems = normalizeNumber(latestProfile?.gems, 0);
  const currentUnlockedZones = normalizeStringArray(latestProfileRaw?.unlocked_zones ?? []);
  const currentUnlockedFeatures = normalizeStringArray(latestProfileRaw?.unlocked_features ?? []);
  const alreadyUnlocked =
    currentUnlockedZones.includes(zoneId) || currentUnlockedFeatures.includes(zoneId);

  if (alreadyUnlocked) {
    return { ok: true, alreadyUnlocked: true, profile: applyMagicUsesFallback(userId, latestProfile) };
  }

  if (currentGems < spend) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spend} Gems but only have ${currentGems}.`,
      gems: currentGems,
      required: spend,
    };
  }

  const patch = {
    gems: Math.max(0, currentGems - spend),
  };

  if (hasOwn(latestProfileRaw, 'unlocked_zones')) {
    patch.unlocked_zones = [...new Set([...currentUnlockedZones, zoneId])];
  }
  if (hasOwn(latestProfileRaw, 'unlocked_features')) {
    patch.unlocked_features = [...new Set([...currentUnlockedFeatures, zoneId])];
  }

  if (!hasOwn(patch, 'unlocked_zones') && !hasOwn(patch, 'unlocked_features')) {
    return {
      ok: false,
      code: 'missing_unlock_columns',
      message: 'Profile is missing both unlocked_zones and unlocked_features columns.',
    };
  }

  const runUpdate = (columns) => supabase
    .from('profiles')
    .update(stripUnsupportedColumnsFromPatch(patch))
    .eq('id', userId)
    .eq('gems', currentGems)
    .gte('gems', spend)
    .select(columns)
    .maybeSingle();

  let { data: updatedProfile, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS);

  if (updateError && isMissingColumnError(updateError, 'magic_art_uses')) {
    markMagicArtUsesUnsupported();
    ({ data: updatedProfile, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK));
  }

  if (updateError && isMissingColumnError(updateError, 'unlocked_videos')) {
    markUnlockedVideosUnsupported();
    ({ data: updatedProfile, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK_NO_UNLOCKED_VIDEOS));
  }

  if (updateError) {
    if (isRlsDeniedError(updateError)) {
      return {
        ok: false,
        code: 'rls_update_denied',
        message: 'Profile update blocked by Supabase RLS policy for the profiles table.',
      };
    }
    return {
      ok: false,
      code: 'profile_update_error',
      message: updateError.message || 'Failed to update profile.',
    };
  }

  if (updatedProfile) {
    return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(updatedProfile)) };
  }

  const { data: postUpdateProfileRaw, error: postUpdateError } = await readProfileRowById({
    userId,
    maybeSingle: false,
  });
  if (postUpdateError) {
    return {
      ok: false,
      code: 'profile_update_error',
      message: postUpdateError.message || 'Unlock update did not complete.',
    };
  }

  const postUpdateProfile = normalizeEconomyProfile(postUpdateProfileRaw);
  const postUnlockedZones = normalizeStringArray(postUpdateProfileRaw?.unlocked_zones ?? []);
  const postUnlockedFeatures = normalizeStringArray(postUpdateProfileRaw?.unlocked_features ?? []);
  if (postUnlockedZones.includes(zoneId) || postUnlockedFeatures.includes(zoneId)) {
    return { ok: true, alreadyUnlocked: true, profile: applyMagicUsesFallback(userId, postUpdateProfile) };
  }

  const postGems = normalizeNumber(postUpdateProfile?.gems, 0);
  if (postGems < spend) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spend} Gems but only have ${postGems}.`,
      gems: postGems,
      required: spend,
    };
  }

  const retryPatch = {
    gems: Math.max(0, postGems - spend),
  };
  if (hasOwn(postUpdateProfileRaw, 'unlocked_zones')) {
    retryPatch.unlocked_zones = [...new Set([...postUnlockedZones, zoneId])];
  }
  if (hasOwn(postUpdateProfileRaw, 'unlocked_features')) {
    retryPatch.unlocked_features = [...new Set([...postUnlockedFeatures, zoneId])];
  }
  if (!hasOwn(retryPatch, 'unlocked_zones') && !hasOwn(retryPatch, 'unlocked_features')) {
    return {
      ok: false,
      code: 'missing_unlock_columns',
      message: 'Profile is missing both unlocked_zones and unlocked_features columns.',
    };
  }

  const runRetryUpdate = (columns) =>
    supabase
      .from('profiles')
      .update(stripUnsupportedColumnsFromPatch(retryPatch))
      .eq('id', userId)
      .eq('gems', postGems)
      .gte('gems', spend)
      .select(columns)
      .maybeSingle();

  let { data: retriedProfile, error: retryError } = await runRetryUpdate(ECONOMY_SELECT_COLUMNS);

  if (retryError && isMissingColumnError(retryError, 'magic_art_uses')) {
    markMagicArtUsesUnsupported();
    ({ data: retriedProfile, error: retryError } = await runRetryUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK));
  }

  if (retryError && isMissingColumnError(retryError, 'unlocked_videos')) {
    markUnlockedVideosUnsupported();
    ({ data: retriedProfile, error: retryError } = await runRetryUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK_NO_UNLOCKED_VIDEOS));
  }

  if (retryError) {
    if (isRlsDeniedError(retryError)) {
      return {
        ok: false,
        code: 'rls_update_denied',
        message: 'Profile update blocked by Supabase RLS policy for the profiles table.',
      };
    }
    return {
      ok: false,
      code: 'profile_update_error',
      message: retryError.message || 'Failed to update profile.',
    };
  }

  if (retriedProfile) {
    return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(retriedProfile)) };
  }

  const { data: finalProfileRaw, error: finalProfileError } = await readProfileRowById({
    userId,
    maybeSingle: false,
  });
  if (finalProfileError) {
    return {
      ok: false,
      code: 'profile_update_error',
      message: finalProfileError.message || 'Failed to confirm unlock status.',
    };
  }

  const finalProfile = normalizeEconomyProfile(finalProfileRaw);
  const finalUnlockedZones = normalizeStringArray(finalProfileRaw?.unlocked_zones ?? []);
  const finalUnlockedFeatures = normalizeStringArray(finalProfileRaw?.unlocked_features ?? []);
  if (finalUnlockedZones.includes(zoneId) || finalUnlockedFeatures.includes(zoneId)) {
    return { ok: true, alreadyUnlocked: true, profile: applyMagicUsesFallback(userId, finalProfile) };
  }

  return {
    ok: false,
    code: 'profile_update_error',
    message: 'Profile unlock is busy right now. Please try again.',
  };
};

export const unlockFeatureWithGems = async ({ userId, featureId, costGems }) => {
  if (!userId) return { ok: false, code: 'auth_required', message: 'Please log in first.' };
  if (!featureId || typeof featureId !== 'string') {
    return { ok: false, code: 'invalid_feature', message: 'Invalid feature id.' };
  }

  const spend = normalizeNumber(costGems, 0);
  if (spend <= 0) {
    return { ok: false, code: 'invalid_cost', message: 'Invalid unlock cost.' };
  }

  const { data: latestProfileRaw, error: latestProfileError } = await readProfileRowById({
    userId,
    maybeSingle: false,
  });

  if (latestProfileError) {
    if (isRlsDeniedError(latestProfileError)) {
      return {
        ok: false,
        code: 'rls_update_denied',
        message: 'Profile update blocked by Supabase RLS policy for the profiles table.',
      };
    }
    return {
      ok: false,
      code: 'profile_fetch_error',
      message: latestProfileError.message || 'Failed to refresh profile before unlock.',
    };
  }

  if (!hasOwn(latestProfileRaw, 'unlocked_features')) {
    return {
      ok: false,
      code: 'missing_unlocked_features_column',
      message: 'profiles.unlocked_features column is missing from the active schema.',
    };
  }

  const latestProfile = normalizeEconomyProfile(latestProfileRaw);
  const currentGems = normalizeNumber(latestProfile?.gems, 0);
  const currentUnlockedFeatures = normalizeStringArray(latestProfileRaw?.unlocked_features || []);
  const baseUnlockedFeatures = Array.isArray(latestProfileRaw?.unlocked_features)
    ? latestProfileRaw.unlocked_features
    : [];

  if (currentUnlockedFeatures.includes(featureId)) {
    return { ok: true, alreadyUnlocked: true, profile: applyMagicUsesFallback(userId, latestProfile) };
  }

  if (currentGems < spend) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spend} Gems but only have ${currentGems}.`,
      gems: currentGems,
      required: spend,
    };
  }

  const nextUnlockedFeatures = [...new Set([...baseUnlockedFeatures, featureId])];
  const runUpdate = (columns) => supabase
    .from('profiles')
    .update({
      gems: Math.max(0, currentGems - spend),
      unlocked_features: nextUnlockedFeatures,
    })
    .eq('id', userId)
    .eq('gems', currentGems)
    .gte('gems', spend)
    .select(columns)
    .maybeSingle();

  let { data: updatedProfile, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS);

  if (updateError && isMissingColumnError(updateError, 'magic_art_uses')) {
    markMagicArtUsesUnsupported();
    ({ data: updatedProfile, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK));
  }

  if (updateError && isMissingColumnError(updateError, 'unlocked_videos')) {
    markUnlockedVideosUnsupported();
    ({ data: updatedProfile, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK_NO_UNLOCKED_VIDEOS));
  }

  if (updateError) {
    if (isRlsDeniedError(updateError)) {
      return {
        ok: false,
        code: 'rls_update_denied',
        message: 'Profile update blocked by Supabase RLS policy for the profiles table.',
      };
    }

    if (isMissingColumnError(updateError, 'unlocked_features')) {
      return {
        ok: false,
        code: 'missing_unlocked_features_column',
        message: 'profiles.unlocked_features column is missing from the active schema.',
      };
    }

    return {
      ok: false,
      code: 'profile_update_error',
      message: updateError.message || 'Could not unlock feature right now.',
    };
  }

  if (updatedProfile) {
    return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(updatedProfile)) };
  }

  const { data: postUpdateProfileRaw, error: postUpdateError } = await readProfileRowById({
    userId,
    maybeSingle: false,
  });
  if (postUpdateError) {
    return {
      ok: false,
      code: 'profile_update_error',
      message: postUpdateError.message || 'Could not finalize feature unlock.',
    };
  }

  const postUpdateProfile = normalizeEconomyProfile(postUpdateProfileRaw);
  const postUnlockedFeatures = normalizeStringArray(postUpdateProfileRaw?.unlocked_features || []);
  if (postUnlockedFeatures.includes(featureId)) {
    return { ok: true, alreadyUnlocked: true, profile: applyMagicUsesFallback(userId, postUpdateProfile) };
  }

  const postGems = normalizeNumber(postUpdateProfile?.gems, 0);
  if (postGems < spend) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spend} Gems but only have ${postGems}.`,
      gems: postGems,
      required: spend,
    };
  }

  const retryRawFeatures = Array.isArray(postUpdateProfileRaw?.unlocked_features)
    ? postUpdateProfileRaw.unlocked_features
    : [];
  const retryNextUnlockedFeatures = [...new Set([...retryRawFeatures, featureId])];

  const runRetryUpdate = (columns) =>
    supabase
      .from('profiles')
      .update({
        gems: Math.max(0, postGems - spend),
        unlocked_features: retryNextUnlockedFeatures,
      })
      .eq('id', userId)
      .eq('gems', postGems)
      .gte('gems', spend)
      .select(columns)
      .maybeSingle();

  let { data: retriedProfile, error: retryError } = await runRetryUpdate(ECONOMY_SELECT_COLUMNS);

  if (retryError && isMissingColumnError(retryError, 'magic_art_uses')) {
    markMagicArtUsesUnsupported();
    ({ data: retriedProfile, error: retryError } = await runRetryUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK));
  }

  if (retryError && isMissingColumnError(retryError, 'unlocked_videos')) {
    markUnlockedVideosUnsupported();
    ({ data: retriedProfile, error: retryError } = await runRetryUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK_NO_UNLOCKED_VIDEOS));
  }

  if (retryError) {
    if (isRlsDeniedError(retryError)) {
      return {
        ok: false,
        code: 'rls_update_denied',
        message: 'Profile update blocked by Supabase RLS policy for the profiles table.',
      };
    }

    if (isMissingColumnError(retryError, 'unlocked_features')) {
      return {
        ok: false,
        code: 'missing_unlocked_features_column',
        message: 'profiles.unlocked_features column is missing from the active schema.',
      };
    }

    return {
      ok: false,
      code: 'profile_update_error',
      message: retryError.message || 'Could not unlock feature right now.',
    };
  }

  if (retriedProfile) {
    return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(retriedProfile)) };
  }

  const { data: finalProfileRaw, error: finalProfileError } = await readProfileRowById({
    userId,
    maybeSingle: false,
  });
  if (finalProfileError) {
    return {
      ok: false,
      code: 'profile_update_error',
      message: finalProfileError.message || 'Failed to confirm feature unlock.',
    };
  }

  const finalProfile = normalizeEconomyProfile(finalProfileRaw);
  const finalUnlockedFeatures = normalizeStringArray(finalProfileRaw?.unlocked_features || []);
  if (finalUnlockedFeatures.includes(featureId)) {
    return { ok: true, alreadyUnlocked: true, profile: applyMagicUsesFallback(userId, finalProfile) };
  }

  const finalGems = normalizeNumber(finalProfile?.gems, 0);
  if (finalGems < spend) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spend} Gems but only have ${finalGems}.`,
      gems: finalGems,
      required: spend,
    };
  }

  if (!hasOwn(finalProfileRaw, 'unlocked_features')) {
    return {
      ok: false,
      code: 'missing_unlocked_features_column',
      message: 'profiles.unlocked_features column is missing from the active schema.',
    };
  }

  return {
    ok: false,
    code: 'profile_update_error',
    message: 'Profile unlock is busy right now. Please try again.',
  };
};

const CHARACTER_GEM_FIELD_BY_KEY = {
  aiko: 'aiko_gems',
  niko: 'niko_gems',
  kinu: 'kinu_gems',
  mimi: 'mimi_gems',
  miko: 'miko_gems',
  chiko: 'chiko_gems',
};

export const convertUniversalToCharacterGems = async ({ userId, characterKey }) => {
  if (!userId) return { ok: false, code: 'auth_required', message: 'Please log in first.' };

  const normalizedCharacterKey = String(characterKey || '').trim().toLowerCase();
  const characterGemField = CHARACTER_GEM_FIELD_BY_KEY[normalizedCharacterKey];
  if (!characterGemField) {
    return { ok: false, code: 'invalid_character_key', message: 'Invalid character key.' };
  }

  const { data: latestProfileRaw, error: latestProfileError } = await readProfileRowById({
    userId,
    maybeSingle: false,
  });

  if (latestProfileError) {
    return {
      ok: false,
      code: 'profile_fetch_error',
      message: latestProfileError.message || 'Failed to load profile before gem conversion.',
    };
  }

  const latestProfile = normalizeEconomyProfile(latestProfileRaw);
  const currentUniversalGems = normalizeNumber(latestProfile?.gems, 0);
  if (currentUniversalGems < UNIVERSAL_TO_CHARACTER_GEM_COST) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${UNIVERSAL_TO_CHARACTER_GEM_COST} Gems but only have ${currentUniversalGems}.`,
      gems: currentUniversalGems,
      required: UNIVERSAL_TO_CHARACTER_GEM_COST,
    };
  }

  const currentCharacterGems = normalizeNumber(latestProfile?.[characterGemField], 0);
  const patch = {
    gems: Math.max(0, currentUniversalGems - UNIVERSAL_TO_CHARACTER_GEM_COST),
    [characterGemField]: currentCharacterGems + CHARACTER_GEM_REWARD,
  };

  const runUpdate = (columns) =>
    supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .eq('gems', currentUniversalGems)
      .gte('gems', UNIVERSAL_TO_CHARACTER_GEM_COST)
      .select(columns)
      .maybeSingle();

  let { data: updatedProfile, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS);

  if (updateError && isMissingColumnError(updateError, 'magic_art_uses')) {
    markMagicArtUsesUnsupported();
    ({ data: updatedProfile, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK));
  }

  if (updateError && isMissingColumnError(updateError, 'unlocked_videos')) {
    markUnlockedVideosUnsupported();
    ({ data: updatedProfile, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK_NO_UNLOCKED_VIDEOS));
  }

  if (updateError) {
    return {
      ok: false,
      code: 'profile_update_error',
      message: updateError.message || 'Failed to convert universal gems.',
    };
  }

  if (!updatedProfile) {
    return {
      ok: false,
      code: 'profile_update_error',
      message: 'Conversion could not be confirmed. Please try again.',
    };
  }

  return {
    ok: true,
    profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(updatedProfile)),
    conversion: {
      spentUniversalGems: UNIVERSAL_TO_CHARACTER_GEM_COST,
      gainedCharacterGems: CHARACTER_GEM_REWARD,
      characterKey: normalizedCharacterKey,
    },
  };
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
