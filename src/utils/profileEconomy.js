import { supabase } from '../supabaseClient';

export const DEFAULT_MAGIC_ART_USES = 10;
export const PREMIUM_VIDEO_UNLOCK_COST_GEMS = 10;
export const FREE_VIDEO_REWARD_GEMS = 5;
const MISSING_MAGIC_ART_USES_FALLBACK = 0;

const ECONOMY_SELECT_COLUMNS = '*';
const ECONOMY_SELECT_COLUMNS_FALLBACK =
  'id, role, gems, unlocked_zones, unlocked_videos, unlocked_items, claimed_rewards, created_at, updated_at';
const ECONOMY_SELECT_COLUMNS_FALLBACK_NO_UNLOCKED_VIDEOS =
  'id, role, gems, unlocked_zones, unlocked_items, claimed_rewards, created_at, updated_at';
const LOCAL_MAGIC_ART_USES_PREFIX = 'aiko_magic_art_uses_v1_';

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

const isMissingRpcFunctionError = (error, functionName) => {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  const fn = String(functionName || '').toLowerCase();
  return (
    error?.code === '42883' ||
    error?.code === 'PGRST202' ||
    (text.includes('function') && text.includes('does not exist')) ||
    (fn && text.includes(fn) && text.includes('not found'))
  );
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
    magic_art_uses: normalizeNumber(profile.magic_art_uses, magicArtFallback),
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
  unlocked_zones: [],
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

  // DB-first unlock flow:
  // 1) always fetch the latest profile from Supabase
  // 2) do a constrained update (id + exact gems + gte gems)
  // 3) retry on race, so stale local state never causes persistent sync errors
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readEconomyState(userId);
    if (!current.ok) return current;

    const profile = normalizeEconomyProfile(current.profile);
    const currentGems = normalizeNumber(profile?.gems, 0);
    const currentUnlockedZones = normalizeStringArray(profile?.unlocked_zones);

    if (currentUnlockedZones.includes(zoneId)) {
      return { ok: true, alreadyUnlocked: true, profile };
    }

    const nextUnlockedZones = [...new Set([...currentUnlockedZones, zoneId])];
    const patch = stripUnsupportedColumnsFromPatch({
      gems: Math.max(0, currentGems - spend),
      unlocked_zones: nextUnlockedZones,
    });

    const runUpdate = (columns) => supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .eq('gems', currentGems)
      .gte('gems', spend)
      .select(columns)
      .maybeSingle();

    let { data: updated, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS);

    if (updateError && isMissingColumnError(updateError, 'magic_art_uses')) {
      markMagicArtUsesUnsupported();
      ({ data: updated, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK));
    }

    if (updateError && isMissingColumnError(updateError, 'unlocked_videos')) {
      markUnlockedVideosUnsupported();
      ({ data: updated, error: updateError } = await runUpdate(ECONOMY_SELECT_COLUMNS_FALLBACK_NO_UNLOCKED_VIDEOS));
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

    if (updated) {
      return { ok: true, profile: applyMagicUsesFallback(userId, normalizeEconomyProfile(updated)) };
    }

    const latest = await readEconomyState(userId);
    if (!latest.ok) return latest;

    const latestProfile = normalizeEconomyProfile(latest.profile);
    if (normalizeStringArray(latestProfile?.unlocked_zones).includes(zoneId)) {
      return { ok: true, alreadyUnlocked: true, profile: latestProfile };
    }

    const latestGems = normalizeNumber(latestProfile?.gems, 0);
    if (latestGems < spend) {
      return {
        ok: false,
        code: 'insufficient_gems',
        message: `You need ${spend} Gems but only have ${latestGems}.`,
        gems: latestGems,
        required: spend,
      };
    }
  }

  return {
    ok: false,
    code: 'profile_sync_conflict',
    message: 'Profile was updated from another session. Please try again.',
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

  const runRead = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && isMissingColumnError(error, 'unlocked_features')) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('gems')
        .eq('id', userId)
        .single();

      if (fallbackError) {
        return { data: null, error: fallbackError, hasUnlockedFeaturesColumn: false };
      }

      return {
        data: {
          gems: normalizeNumber(fallbackData?.gems, 0),
          unlocked_features: [],
        },
        error: null,
        hasUnlockedFeaturesColumn: false,
      };
    }

    return { data, error, hasUnlockedFeaturesColumn: true };
  };

  const tryRpcUnlock = async () => {
    const { error } = await supabase.rpc('unlock_feature_with_gems', {
      p_user_id: userId,
      p_feature_id: featureId,
      p_cost_gems: spend,
    });

    if (error) return { ok: false, error };
    return { ok: true };
  };

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data: latestProfile, error: latestProfileError, hasUnlockedFeaturesColumn } = await runRead();

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

    if (!hasUnlockedFeaturesColumn) {
      return {
        ok: false,
        code: 'missing_unlocked_features_column',
        message: 'profiles.unlocked_features column is missing from the active schema.',
      };
    }

    const currentGems = normalizeNumber(latestProfile?.gems, 0);
    const currentUnlockedFeatures = normalizeStringArray(latestProfile?.unlocked_features ?? []);

    if (currentUnlockedFeatures.includes(featureId)) {
      const latest = await readEconomyState(userId);
      if (latest.ok) {
        return { ok: true, alreadyUnlocked: true, profile: latest.profile };
      }
      return {
        ok: true,
        alreadyUnlocked: true,
        profile: normalizeEconomyProfile({
          gems: currentGems,
          unlocked_features: currentUnlockedFeatures,
        }),
      };
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

    const rpcResult = await tryRpcUnlock();
    if (rpcResult.ok) {
      const latest = await readEconomyState(userId);
      if (latest.ok && normalizeStringArray(latest.profile?.unlocked_features).includes(featureId)) {
        return { ok: true, profile: latest.profile };
      }
    } else if (!isMissingRpcFunctionError(rpcResult.error, 'unlock_feature_with_gems')) {
      if (isRlsDeniedError(rpcResult.error)) {
        return {
          ok: false,
          code: 'rls_update_denied',
          message: 'Profile update blocked by Supabase RLS policy for the profiles table.',
        };
      }
      return {
        ok: false,
        code: 'rpc_unlock_error',
        message: rpcResult.error?.message || 'Could not unlock feature right now.',
      };
    }

    const nextUnlockedFeatures = [...new Set([...currentUnlockedFeatures, featureId])];
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        gems: Math.max(0, currentGems - spend),
        unlocked_features: nextUnlockedFeatures,
      })
      .eq('id', userId)
      .gte('gems', spend)
      .select(ECONOMY_SELECT_COLUMNS)
      .maybeSingle();

    if (updateError) {
      if (isMissingColumnError(updateError, 'magic_art_uses')) {
        markMagicArtUsesUnsupported();
      }

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

    const latest = await readEconomyState(userId);
    if (!latest.ok) return latest;

    const latestFeatures = normalizeStringArray(latest.profile?.unlocked_features);
    if (latestFeatures.includes(featureId)) {
      return { ok: true, alreadyUnlocked: true, profile: latest.profile };
    }

    const latestGems = normalizeNumber(latest.profile?.gems, 0);
    if (latestGems < spend) {
      return {
        ok: false,
        code: 'insufficient_gems',
        message: `You need ${spend} Gems but only have ${latestGems}.`,
        gems: latestGems,
        required: spend,
      };
    }
  }

  return {
    ok: false,
    code: 'profile_sync_conflict',
    message: 'Could not finalize unlock because profile data changed during update. Please retry.',
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
