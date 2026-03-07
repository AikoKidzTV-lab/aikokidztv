import { supabase } from '../supabaseClient';

export const CHARACTER_SUBSCRIPTION_COST_GEMS = 200;
export const CHARACTER_SUBSCRIPTION_DAYS = 7;

const toSafeWholeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
};

const getNowIso = () => new Date().toISOString();

const getExpiryIso = () =>
  new Date(Date.now() + CHARACTER_SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

const isMissingTableOrColumnError = (error) => {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return (
    text.includes('character_subscriptions') ||
    text.includes('character_id') ||
    text.includes('expires_at') ||
    text.includes('status') ||
    error?.code === '42P01' ||
    error?.code === '42703' ||
    error?.code === 'PGRST204'
  );
};

export const fetchActiveCharacterSubscriptions = async ({ userId }) => {
  if (!userId) {
    return {
      ok: false,
      code: 'auth_required',
      message: 'Please log in to check your character unlocks.',
      characterIds: [],
    };
  }

  const { data, error } = await supabase
    .from('character_subscriptions')
    .select('character_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', getNowIso());

  if (error) {
    return {
      ok: false,
      code: isMissingTableOrColumnError(error) ? 'schema_error' : 'query_error',
      message: error.message || 'Could not load active character subscriptions.',
      characterIds: [],
    };
  }

  const ids = Array.isArray(data)
    ? data
      .map((row) => String(row?.character_id || '').trim())
      .filter(Boolean)
    : [];

  return { ok: true, characterIds: [...new Set(ids)] };
};

export const hasActiveCharacterSubscription = async ({ userId, characterId }) => {
  if (!userId) {
    return {
      ok: false,
      code: 'auth_required',
      active: false,
      message: 'Please log in to access this character zone.',
    };
  }

  const normalizedCharacterId = String(characterId || '').trim().toLowerCase();
  if (!normalizedCharacterId) {
    return {
      ok: false,
      code: 'invalid_character',
      active: false,
      message: 'Invalid character route.',
    };
  }

  const { data, error } = await supabase
    .from('character_subscriptions')
    .select('character_id')
    .eq('user_id', userId)
    .eq('character_id', normalizedCharacterId)
    .eq('status', 'active')
    .gt('expires_at', getNowIso())
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      code: isMissingTableOrColumnError(error) ? 'schema_error' : 'query_error',
      active: false,
      message: error.message || 'Could not verify character access.',
    };
  }

  return { ok: true, active: Boolean(data?.character_id) };
};

export const purchaseCharacterSubscription = async ({ userId, characterId }) => {
  if (!userId) {
    return {
      ok: false,
      code: 'auth_required',
      message: 'Please log in to unlock characters.',
    };
  }

  const normalizedCharacterId = String(characterId || '').trim().toLowerCase();
  if (!normalizedCharacterId) {
    return {
      ok: false,
      code: 'invalid_character',
      message: 'Invalid character unlock request.',
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('gems')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false,
      code: 'profile_error',
      message: profileError.message || 'Could not read your gem balance.',
    };
  }

  const currentGems = toSafeWholeNumber(profile?.gems);
  if (currentGems < CHARACTER_SUBSCRIPTION_COST_GEMS) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: 'Not enough gems! Keep learning to earn more.',
      gems: currentGems,
      required: CHARACTER_SUBSCRIPTION_COST_GEMS,
    };
  }

  const nextGems = Math.max(0, currentGems - CHARACTER_SUBSCRIPTION_COST_GEMS);
  const { error: deductError } = await supabase
    .from('profiles')
    .update({ gems: nextGems })
    .eq('id', userId);

  if (deductError) {
    return {
      ok: false,
      code: 'deduct_error',
      message: deductError.message || 'Failed to deduct gems.',
    };
  }

  const expiresAt = getExpiryIso();
  const { error: upsertError } = await supabase
    .from('character_subscriptions')
    .upsert(
      {
        user_id: userId,
        character_id: normalizedCharacterId,
        status: 'active',
        expires_at: expiresAt,
      },
      { onConflict: 'user_id,character_id' }
    );

  if (!upsertError) {
    return {
      ok: true,
      gems: nextGems,
      expiresAt,
      characterId: normalizedCharacterId,
    };
  }

  // Best-effort rollback if subscription creation fails after gems deduction.
  await supabase
    .from('profiles')
    .update({ gems: currentGems })
    .eq('id', userId);

  return {
    ok: false,
    code: 'subscription_error',
    message: upsertError.message || 'Failed to activate subscription. Gems restored.',
  };
};
