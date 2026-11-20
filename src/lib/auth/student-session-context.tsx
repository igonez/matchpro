'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isMasterAdmin } from '@/lib/master-auth';
import type {
  EnrolledChallengeItem,
  PendingChallengeSummary,
  ServerStudentSession,
  StudentChallengeSummary,
  StudentProfileSummary,
} from './session-server';
import type { User } from '@supabase/supabase-js';

export interface StudentSessionContextValue {
  user: User | null;
  student: StudentProfileSummary | null;
  activeChallengeId: string | null;
  activeChallenge: StudentChallengeSummary | null;
  enrolledChallenges: EnrolledChallengeItem[];
  pendingChallenge: PendingChallengeSummary | null;
  hasAccess: boolean;
  isPreviewMode: boolean;
  previewChallengeId: string | null;
  isReady: boolean;
  refreshSession: () => Promise<void>;
}

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null);

const CHALLENGE_SELECT =
  'id, title, start_date, end_date, is_active, price, professional_id, challenge_weeks(id, week_number, title, bonus_points, start_date, end_date), professionals(id, full_name, avatar_url, brand_name, brand_logo_url)';

function normalizeChallenge(raw: unknown): StudentChallengeSummary | null {
  const ch = (Array.isArray(raw) ? raw[0] : raw) as Record<string, any> | null | undefined;
  if (!ch || !ch.id) return null;
  const prof = Array.isArray(ch.professionals) ? ch.professionals[0] : ch.professionals;
  return {
    id: String(ch.id),
    title: String(ch.title || 'Desafio'),
    description: ch.description ?? null,
    start_date: ch.start_date ?? null,
    end_date: ch.end_date ?? null,
    is_active: ch.is_active !== false,
    price: ch.price ?? 0,
    professional_id: String(ch.professional_id || ''),
    challenge_weeks: Array.isArray(ch.challenge_weeks) ? ch.challenge_weeks : [],
    professionals: prof
      ? {
          id: String(prof.id),
          full_name: prof.full_name ?? null,
          avatar_url: prof.avatar_url ?? null,
          brand_name: prof.brand_name ?? null,
          brand_logo_url: prof.brand_logo_url ?? null,
        }
      : null,
  };
}

export function StudentSessionProvider({
  initialSession,
  children,
}: {
  initialSession: ServerStudentSession;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<ServerStudentSession>(initialSession);
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
        student: null,
        activeChallengeId: null,
        activeChallenge: null,
        enrolledChallenges: [],
        pendingChallenge: null,
        hasAccess: false,
        isPreviewMode: false,
        previewChallengeId: null,
      });
      return;
    }

    const previewMode = session.isPreviewMode;

    const [studentRes, participationsRes, profRes, ownedChallengeRes] = await Promise.all([
      supabase
        .from('students')
        .select('id, full_name, avatar_url, phone')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('challenge_participants')
        .select(`id, challenge_id, payment_status, joined_at, challenges(${CHALLENGE_SELECT})`)
        .eq('student_id', user.id)
        .order('joined_at', { ascending: false }),
      previewMode
        ? supabase
            .from('professionals')
            .select('id, full_name, brand_name, avatar_url, brand_logo_url, is_master_admin')
            .eq('id', user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      previewMode
        ? supabase
            .from('challenges')
            .select(CHALLENGE_SELECT)
            .eq('professional_id', user.id)
            .order('is_active', { ascending: false })
            .order('start_date', { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const studentRow = (studentRes.data as StudentProfileSummary | null) ?? null;
    const allParticipations = (participationsRes.data as Array<Record<string, any>> | null) ?? [];
    const profRow = (profRes.data as Record<string, any> | null) ?? null;
    const ownedChallenge = normalizeChallenge(ownedChallengeRes.data);

    const isCoachOrMaster =
      previewMode &&
      (Boolean(profRow) ||
        user.app_metadata?.role === 'professional' ||
        isMasterAdmin(user));

    const confirmedParts = allParticipations.filter(
      (p) => p.payment_status === 'paid' || p.payment_status === 'complimentary'
    );
    const pendingPart = allParticipations.find((p) => p.payment_status === 'pending') ?? null;

    const enrolledChallenges: EnrolledChallengeItem[] = confirmedParts.map((p) => ({
      challengeId: String(p.challenge_id),
      paymentStatus: String(p.payment_status),
      joinedAt: p.joined_at ?? null,
      challenge: normalizeChallenge(p.challenges),
    }));

    if (isCoachOrMaster) {
      const previewChallengeId = ownedChallenge?.id ?? null;
      setSession({
        user,
        student: studentRow ?? {
          id: user.id,
          full_name:
            profRow?.brand_name ||
            profRow?.full_name ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'Coach',
          avatar_url: profRow?.avatar_url || profRow?.brand_logo_url || null,
          phone: null,
        },
        activeChallengeId: previewChallengeId,
        activeChallenge: ownedChallenge ?? null,
        enrolledChallenges,
        pendingChallenge: null,
        hasAccess: Boolean(previewChallengeId),
        isPreviewMode: true,
        previewChallengeId,
      });
      return;
    }

    const primaryEnrolled = enrolledChallenges[0] ?? null;
    const activeChallenge = primaryEnrolled?.challenge ?? null;
    const activeChallengeId = primaryEnrolled?.challengeId ?? activeChallenge?.id ?? null;
    const hasAccess = Boolean(activeChallengeId);
    const pendingChObj = !hasAccess ? normalizeChallenge(pendingPart?.challenges) : null;

    setSession({
      user,
      student: studentRow,
      activeChallengeId,
      activeChallenge,
      enrolledChallenges,
      pendingChallenge: pendingChObj
        ? {
            id: pendingChObj.id,
            title: pendingChObj.title,
            price: pendingChObj.price,
            is_active: pendingChObj.is_active,
          }
        : null,
      hasAccess,
      isPreviewMode: false,
      previewChallengeId: null,
    });
  }, [session.isPreviewMode, supabase]);

  const value = useMemo<StudentSessionContextValue>(
    () => ({
      ...session,
      isReady: true,
      refreshSession,
    }),
    [session, refreshSession]
  );

  return (
    <StudentSessionContext.Provider value={value}>
      {children}
    </StudentSessionContext.Provider>
  );
}

export function useStudentSession(): StudentSessionContextValue {
  const ctx = useContext(StudentSessionContext);
  if (!ctx) {
    throw new Error('useStudentSession deve ser usado dentro de StudentSessionProvider.');
  }
  return ctx;
}
