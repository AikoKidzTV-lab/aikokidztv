export const ECONOMY_TIER = {
  STANDARD: 'standard',
  PACK_1: 'pack_1',
  PACK_2: 'pack_2',
  PACK_3: 'pack_3',
  VIP: 'vip',
  EDUCATOR: 'educator',
};

export const ACTIVE_PACK_TIER_STORAGE_KEY = 'aiko_active_pack_tier_v1';

const DEFAULT_STORY_RULE = {
  limit: 2,
  windowDays: 3,
  resetLabel: 'Resets in 3 Days',
};

const STORY_RULES_BY_TIER = {
  [ECONOMY_TIER.STANDARD]: DEFAULT_STORY_RULE,
  [ECONOMY_TIER.PACK_1]: DEFAULT_STORY_RULE,
  [ECONOMY_TIER.PACK_2]: {
    limit: 5,
    windowDays: 3,
    resetLabel: 'Resets in 3 Days',
  },
  [ECONOMY_TIER.PACK_3]: {
    limit: 8,
    windowDays: 3,
    resetLabel: 'Resets in 3 Days',
  },
  [ECONOMY_TIER.VIP]: {
    limit: 15,
    windowDays: 1,
    resetLabel: 'Daily',
  },
  [ECONOMY_TIER.EDUCATOR]: {
    limit: 120,
    windowDays: 1,
    resetLabel: 'Daily',
  },
};

const DEFAULT_MAGIC_ART_RULE = {
  costGems: 80,
  packUses: 10,
  unlimited: false,
};

const MAGIC_ART_RULES_BY_TIER = {
  [ECONOMY_TIER.STANDARD]: DEFAULT_MAGIC_ART_RULE,
  [ECONOMY_TIER.PACK_1]: DEFAULT_MAGIC_ART_RULE,
  [ECONOMY_TIER.PACK_2]: DEFAULT_MAGIC_ART_RULE,
  [ECONOMY_TIER.PACK_3]: DEFAULT_MAGIC_ART_RULE,
  [ECONOMY_TIER.VIP]: {
    costGems: 120,
    packUses: 150,
    unlimited: false,
  },
  [ECONOMY_TIER.EDUCATOR]: {
    costGems: 0,
    packUses: 0,
    unlimited: true,
  },
};

const TIER_LABELS = {
  [ECONOMY_TIER.STANDARD]: 'Standard',
  [ECONOMY_TIER.PACK_1]: 'Pack 1',
  [ECONOMY_TIER.PACK_2]: 'Pack 2',
  [ECONOMY_TIER.PACK_3]: 'Pack 3',
  [ECONOMY_TIER.VIP]: 'VIP Pass',
  [ECONOMY_TIER.EDUCATOR]: 'School / Educator',
};

const CANDIDATE_VALUE_FIELDS = [
  'active_pack',
  'active_pack_name',
  'active_pack_tier',
  'account_type',
  'membership',
  'membership_type',
  'membership_tier',
  'pack',
  'pack_name',
  'pack_tier',
  'pass',
  'pass_name',
  'pass_type',
  'plan',
  'plan_name',
  'plan_tier',
  'subscription',
  'subscription_name',
  'subscription_tier',
  'story_pack',
  'story_pack_tier',
  'tier',
  'tier_name',
  'user_type',
];

const EDUCATOR_BOOLEAN_FIELDS = [
  'is_school',
  'is_educator',
  'school_account',
  'educator_account',
  'is_school_educator',
  'has_custom_pass',
];

const VIP_BOOLEAN_FIELDS = [
  'is_vip',
  'vip_pass_active',
  'has_vip_pass',
  'is_vip_pass',
  'vip_active',
];

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const normalizeToken = (value) => String(value || '').trim().toLowerCase();

const isTruthyValue = (value) => {
  if (value === true) return true;
  if (typeof value === 'number') return value === 1;
  const normalized = normalizeToken(value);
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'active';
};

const isKnownTier = (value) => Object.values(ECONOMY_TIER).includes(value);

const normalizeTier = (value) => {
  const normalized = normalizeToken(value);
  switch (normalized) {
    case ECONOMY_TIER.PACK_1:
    case 'pack1':
    case 'pack_01':
    case 'tier1':
    case 'tier_1':
      return ECONOMY_TIER.PACK_1;
    case ECONOMY_TIER.PACK_2:
    case 'pack2':
    case 'pack_02':
    case 'tier2':
    case 'tier_2':
      return ECONOMY_TIER.PACK_2;
    case ECONOMY_TIER.PACK_3:
    case 'pack3':
    case 'pack_03':
    case 'tier3':
    case 'tier_3':
      return ECONOMY_TIER.PACK_3;
    case ECONOMY_TIER.VIP:
      return ECONOMY_TIER.VIP;
    case ECONOMY_TIER.EDUCATOR:
    case 'school':
      return ECONOMY_TIER.EDUCATOR;
    case ECONOMY_TIER.STANDARD:
    case 'basic':
    case 'free':
      return ECONOMY_TIER.STANDARD;
    default:
      return null;
  }
};

const includesAny = (tokens, needles) =>
  needles.some((needle) => tokens.some((token) => token.includes(needle)));

const getSourceObjects = ({ profile = null, user = null } = {}) => {
  const sources = [];
  if (isObject(profile)) sources.push(profile);
  if (isObject(user)) sources.push(user);
  if (isObject(user?.user_metadata)) sources.push(user.user_metadata);
  if (isObject(user?.app_metadata)) sources.push(user.app_metadata);
  return sources;
};

const readTierFromLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_PACK_TIER_STORAGE_KEY);
    const normalized = normalizeTier(raw);
    return isKnownTier(normalized) ? normalized : null;
  } catch {
    return null;
  }
};

export const persistEconomyTier = (tier) => {
  if (typeof window === 'undefined') return;
  const normalizedTier = normalizeTier(tier);
  if (!isKnownTier(normalizedTier)) return;
  window.localStorage.setItem(ACTIVE_PACK_TIER_STORAGE_KEY, normalizedTier);
};

export const resolveEconomyTier = ({ profile = null, user = null } = {}) => {
  const sources = getSourceObjects({ profile, user });
  const tokens = [];

  for (const source of sources) {
    for (const key of CANDIDATE_VALUE_FIELDS) {
      const value = source?.[key];
      if (value == null) continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          const token = normalizeToken(item);
          if (token) tokens.push(token);
        }
        continue;
      }
      const token = normalizeToken(value);
      if (token) tokens.push(token);
    }
  }

  const hasEducatorBoolean = sources.some((source) =>
    EDUCATOR_BOOLEAN_FIELDS.some((field) => isTruthyValue(source?.[field]))
  );
  if (hasEducatorBoolean) return ECONOMY_TIER.EDUCATOR;

  const hasVipBoolean = sources.some((source) =>
    VIP_BOOLEAN_FIELDS.some((field) => isTruthyValue(source?.[field]))
  );
  if (hasVipBoolean) return ECONOMY_TIER.VIP;

  if (
    includesAny(tokens, ['school', 'educator', 'teacher', 'institution', 'custom pass', 'custom_pass'])
  ) {
    return ECONOMY_TIER.EDUCATOR;
  }

  if (includesAny(tokens, ['vip'])) {
    return ECONOMY_TIER.VIP;
  }

  if (
    includesAny(tokens, ['1699', 'treasure gems', 'pack 3', 'pack3', 'tier 3', 'tier3', 'pack_3', 'tier_3'])
  ) {
    return ECONOMY_TIER.PACK_3;
  }

  if (
    includesAny(tokens, ['899', 'jungle king', 'pack 2', 'pack2', 'tier 2', 'tier2', 'pack_2', 'tier_2'])
  ) {
    return ECONOMY_TIER.PACK_2;
  }

  if (
    includesAny(tokens, ['499', 'safari pro', 'pack 1', 'pack1', 'tier 1', 'tier1', 'pack_1', 'tier_1'])
  ) {
    return ECONOMY_TIER.PACK_1;
  }

  const directTier = tokens.map((token) => normalizeTier(token)).find((tier) => isKnownTier(tier));
  if (directTier) return directTier;

  const localTier = readTierFromLocalStorage();
  if (localTier) return localTier;

  return ECONOMY_TIER.STANDARD;
};

export const getStorySessionRuleForTier = (tier) =>
  STORY_RULES_BY_TIER[tier] || STORY_RULES_BY_TIER[ECONOMY_TIER.STANDARD];

export const getMagicArtRuleForTier = (tier) =>
  MAGIC_ART_RULES_BY_TIER[tier] || MAGIC_ART_RULES_BY_TIER[ECONOMY_TIER.STANDARD];

export const getEconomyTierLabel = (tier) => TIER_LABELS[tier] || TIER_LABELS[ECONOMY_TIER.STANDARD];
