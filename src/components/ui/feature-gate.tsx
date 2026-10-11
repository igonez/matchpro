'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SpotlightCard3D } from './spotlight-card-3d';
import { Button } from './button';
import { Badge } from './badge';
import { PLAN_CONFIG, PlanTier, FeatureKey } from '@/lib/permissions';

interface FeatureGateProps {
  currentTier?: PlanTier | string | null;
  requiredTier?: PlanTier;
  featureName: string;
  featureDescription?: string;
  benefits?: string[];
  children: React.ReactNode;
}

export function FeatureGate({
  currentTier = 'starter',
  requiredTier = 'pro',
  featureName,
  featureDescription,
  benefits = [],
  children,
}: FeatureGateProps) {
  const activeTier = (currentTier as PlanTier) || 'starter';

  // Hierarquia de planos
  const tierWeight: Record<PlanTier, number> = {
    starter: 1,
    pro: 2,
    studio: 3,
  };

  const hasAccess = tierWeight[activeTier] >= tierWeight[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  const targetPlan = PLAN_CONFIG[requiredTier];

  return (
    <div className="relative w-full py-12 px-4 flex items-center justify-center">
      <SpotlightCard3D className="max-w-xl w-full p-8 text-center border-white/[0.1] bg-zinc-950/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-900/90 border border-white/[0.15] flex items-center justify-center mb-6 shadow-inner">
          <Lock className="w-8 h-8 text-zinc-300 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-zinc-300 mb-4 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          Exclusivo Plano {targetPlan.name}
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
          Desbloqueie {featureName}
        </h2>

        <p className="text-sm text-zinc-400 mb-6 leading-relaxed max-w-md mx-auto">
          {featureDescription ||
            `Este recurso de alta performance está reservado para treinadores no plano ${targetPlan.name}. Faça o upgrade e leve seus desafios a outro patamar.`}
        </p>

        {benefits.length > 0 && (
          <div className="bg-black/50 border border-white/[0.05] rounded-xl p-4 mb-6 text-left space-y-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/finance" className="w-full sm:w-auto">
            <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold px-6 py-2.5 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
              Ver Planos e Fazer Upgrade
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-zinc-400">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </SpotlightCard3D>
    </div>
  );
}
