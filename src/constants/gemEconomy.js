export const NEW_USER_BONUS_GEMS = 50;

export const MIN_SMALL_ITEM_COST_GEMS = 15;
export const SMALL_ITEM_COST_INCREASE_GEMS = 8;

export const STORY_COST_GEMS = 18;

export const MAGIC_ART_PACK_COST_GEMS = 60;
export const MAGIC_ART_PACK_USES = 10;

export const LEARNING_ZONE_ENTRY_FEE_GEMS = 25;
export const LEARNING_ZONE_UNLOCK_STORAGE_PREFIX = 'aiko_learning_zone_unlocks_v2_';

export const applySmallItemEconomy = (baseCost = 0) => {
  const parsed = Number(baseCost);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.max(MIN_SMALL_ITEM_COST_GEMS, parsed + SMALL_ITEM_COST_INCREASE_GEMS);
};

export const LEARNING_ZONE_PREMIUM_UNLOCKS = {
  colors: applySmallItemEconomy(20),
  animals: 49,
};

export const calculateDonationGems = (amount = 0) => {
  const safeAmount = Number(amount);
  if (!Number.isFinite(safeAmount) || safeAmount <= 0) return 0;
  return Math.max(100, Math.round(safeAmount));
};
