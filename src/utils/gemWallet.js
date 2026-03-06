import { supabase } from '../supabaseClient';

const normalizeGems = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
};

export const getCurrentUserGems = async (userId) => {
  if (!userId) {
    return { ok: false, code: 'auth_required', message: 'Please log in to manage gems.' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('gems')
    .eq('id', userId)
    .single();

  if (error) {
    // If profile doesn't exist, we can treat it as 0 gems or let the caller handle initialization
    if (error.code === 'PGRST116') {
       return { ok: true, gems: 0 };
    }
    return { ok: false, code: 'profile_error', message: error.message || 'Failed to load gem balance.' };
  }

  return { ok: true, gems: normalizeGems(data?.gems) };
};

export const spendUserGems = async ({ userId, amount }) => {
  const spendAmount = normalizeGems(amount);
  if (spendAmount <= 0) {
    return { ok: false, code: 'invalid_amount', message: 'Invalid gem amount.' };
  }

  const current = await getCurrentUserGems(userId);
  if (!current.ok) return current;

  if (current.gems < spendAmount) {
    return {
      ok: false,
      code: 'insufficient_gems',
      message: `You need ${spendAmount} Gems but only have ${current.gems}.`,
      gems: current.gems,
      required: spendAmount,
    };
  }

  const nextGems = current.gems - spendAmount;
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ gems: nextGems })
    .eq('id', userId);

  if (updateError) {
    return { ok: false, code: 'update_error', message: updateError.message || 'Failed to spend gems.' };
  }

  return { ok: true, spent: spendAmount, gems: nextGems };
};

export const addUserGems = async ({ userId, amount }) => {
  const addAmount = normalizeGems(amount);
  if (addAmount <= 0) {
    return { ok: false, code: 'invalid_amount', message: 'Invalid gem amount.' };
  }

  const current = await getCurrentUserGems(userId);
  if (!current.ok) return current;

  const nextGems = current.gems + addAmount;
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ gems: nextGems })
    .eq('id', userId);

  if (updateError) {
    return { ok: false, code: 'update_error', message: updateError.message || 'Failed to add gems.' };
  }

  return { ok: true, added: addAmount, gems: nextGems };
};
