'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isMasterAdmin } from '@/lib/master-auth';
import type { PlanTier } from '@/lib/permissions';
import type { CoachProfileSummary, ServerCoachSession } from './session-server';
import type { User } from '@supabase/supabase-js';

export interface CoachSessionContextValue {
  user: User | null;
  professional: CoachProfileSummary | null;
  planTier: PlanTier;
  isMaster: boolean;
  isReady: boolean;
  refreshSession: () => Promise<void>;
}

const CoachSessionContext = createContext<CoachSessionContextValue | null>(null);

export function CoachSessionProvider({
  initialSession,
  children,
}: {
  initialSession: ServerCoachSession;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<ServerCoachSession>(initialSession);
  const supabase = createClient();

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const refreshSession = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSession({
        user: null,
        professional: null,
        planTier: 'starter',
        isMaster: false,
      });
      return;
    }

    const { data: professional } = await supabase
      .from('professionals')
      .select(
        'id, full_name, specialty, phone, bio, instagram, avatar_url, document_type, document_number, plan_tier, plan_status, asaas_customer_id, asaas_wallet_id, asaas_pix_key, asaas_subscription_id, platform_fee_percent, plan_cycle, current_period_end, birth_date, postal_code, address, address_number, province, city, state, is_master_admin, brand_name, brand_logo_url, is_vip'
      )
      .eq('id', user.id)
      .maybeSingle();

    const prof = (professional as CoachProfileSummary | null) ?? null;
    const planTier: PlanTier = prof?.plan_tier === 'pro' ? 'pro' : 'starter';
    const isMaster = isMasterAdmin(user) || prof?.is_master_admin === true;

    setSession({
      user,
      professional: prof,
      planTier,
      isMaster,
    });
  }, [supabase]);

  const value = useMemo<CoachSessionContextValue>(
    () => ({
      ...session,
      isReady: true,
      refreshSession,
    }),
    [session, refreshSession]
  );

  return (
    <CoachSessionContext.Provider value={value}>
      {children}
    </CoachSessionContext.Provider>
  );
}

export function useCoachSession(): CoachSessionContextValue {
  const ctx = useContext(CoachSessionContext);
  if (!ctx) {
    throw new Error('useCoachSession deve ser usado dentro de CoachSessionProvider.');
  }
  return ctx;
}
