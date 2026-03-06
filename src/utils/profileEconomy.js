export const DEFAULT_MAGIC_ART_USES = 999;
export const PREMIUM_VIDEO_UNLOCK_COST_GEMS = 0;
export const FREE_VIDEO_REWARD_GEMS = 0;

export const unlockZoneWithGems = async () => ({ ok: true });
export const claimRewardOnce = async () => ({ ok: true, alreadyClaimed: false });
export const buyMagicArtPack = async () => ({ ok: true });
export const consumeMagicArtUse = async () => ({ ok: true, remaining: 999 });
export const unlockVideoWithGems = async () => ({ ok: true });
export const unlockItemWithGems = async () => ({ ok: true });
