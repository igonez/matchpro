export type PlanTier = 'starter' | 'pro' | 'studio';

export interface PlanLimits {
  name: string;
  badgeText: string;
  priceMonthly: number;
  maxActiveChallenges: number;
  maxStudentsPerChallenge: number;
  hasSquads: boolean;
  hasMysteryBox: boolean;
  hasSponsors: boolean;
  hasMultiCoach: boolean;
  platformFeePercent: number; // Taxa de split da plataforma ArenaFit
  description: string;
}

export const PLAN_CONFIG: Record<PlanTier, PlanLimits> = {
  starter: {
    name: 'Starter Coach',
    badgeText: 'GRÁTIS',
    priceMonthly: 0,
    maxActiveChallenges: 1,
    maxStudentsPerChallenge: 15,
    hasSquads: false,
    hasMysteryBox: false,
    hasSponsors: false,
    hasMultiCoach: false,
    platformFeePercent: 18,
    description: 'Ideal para personais iniciando seus primeiros desafios online.',
  },
  pro: {
    name: 'Pro Coach',
    badgeText: 'PRO',
    priceMonthly: 89.90,
    maxActiveChallenges: 5,
    maxStudentsPerChallenge: 100,
    hasSquads: true,
    hasMysteryBox: true,
    hasSponsors: false,
    hasMultiCoach: false,
    platformFeePercent: 12,
    description: 'Gamificação completa com Squads, Mystery Box e taxa reduzida de 12%.',
  },
  studio: {
    name: 'Studio & Gym Elite',
    badgeText: 'ELITE',
    priceMonthly: 279.90,
    maxActiveChallenges: 9999,
    maxStudentsPerChallenge: 9999,
    hasSquads: true,
    hasMysteryBox: true,
    hasSponsors: true,
    hasMultiCoach: true,
    platformFeePercent: 8,
    description: 'Para boxes de CrossFit, estúdios e academias com escala e patrocinadores.',
  },
};

export type FeatureKey = 'hasSquads' | 'hasMysteryBox' | 'hasSponsors' | 'hasMultiCoach';

export function canAccessFeature(tier: PlanTier | string | null | undefined, feature: FeatureKey): boolean {
  const currentTier = (tier as PlanTier) || 'starter';
  const config = PLAN_CONFIG[currentTier] || PLAN_CONFIG.starter;
  return Boolean(config[feature]);
}

export function getPlanLimits(tier: PlanTier | string | null | undefined): PlanLimits {
  const currentTier = (tier as PlanTier) || 'starter';
  return PLAN_CONFIG[currentTier] || PLAN_CONFIG.starter;
}
