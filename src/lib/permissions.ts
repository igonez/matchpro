export type PlanTier = 'starter' | 'pro';

export interface PlanLimits {
  name: string;
  badgeText: string;
  priceMonthly: number;
  maxActiveChallenges: number;
  maxStudentsPerChallenge: number;
  hasSquads: boolean;
  platformFeePercent: number; // Taxa de split da plataforma ArenaFit
  description: string;
}

export const PLAN_CONFIG: Record<PlanTier, PlanLimits> = {
  starter: {
    name: 'Starter Coach',
    badgeText: 'GRÁTIS',
    priceMonthly: 0,
    maxActiveChallenges: 1,
    maxStudentsPerChallenge: 10,
    hasSquads: false,
    platformFeePercent: 15,
    description: 'Ideal para personais iniciando seus primeiros desafios online com até 10 alunos.',
  },
  pro: {
    name: 'Pro Coach',
    badgeText: 'PRO',
    priceMonthly: 49.90,
    maxActiveChallenges: 5,
    maxStudentsPerChallenge: 100,
    hasSquads: true,
    platformFeePercent: 8,
    description: 'Gamificação completa com Squads e taxa ultra-reduzida de 8%.',
  },
};

export type FeatureKey = 'hasSquads';

export function canAccessFeature(tier: PlanTier | string | null | undefined, feature: FeatureKey): boolean {
  const currentTier = (tier as PlanTier) || 'starter';
  const config = PLAN_CONFIG[currentTier] || PLAN_CONFIG.starter;
  return Boolean(config[feature]);
}

export function getPlanLimits(tier: PlanTier | string | null | undefined): PlanLimits {
  const currentTier = (tier as PlanTier) || 'starter';
  return PLAN_CONFIG[currentTier] || PLAN_CONFIG.starter;
}
