import { cache } from 'react';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { isMasterAdmin } from '@/lib/master-auth';
import type { PlanTier } from '@/lib/permissions';

export interface ChallengeCoachBrand {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  brand_name: string | null;
  brand_logo_url: string | null;
}

export interface ChallengeWeekSummary {
  id: string;
  week_number: number;
  title: string | null;
  bonus_points: number | null;
  start_date: string | null;
  end_date: string | null;
}

export interface StudentChallengeSummary {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  price: number | null;
  professional_id: string;
  challenge_weeks: ChallengeWeekSummary[];
  professionals: ChallengeCoachBrand | null;
}

export interface EnrolledChallengeItem {
  challengeId: string;
  paymentStatus: string;
  joinedAt: string | null;
  challenge: StudentChallengeSummary | null;
}

export interface PendingChallengeSummary {
  id: string;
  title: string;
  price: number | null;
  is_active?: boolean;
}

export interface StudentProfileSummary {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export interface ServerStudentSession {
  user: User | null;
  student: StudentProfileSummary | null;
  activeChallengeId: string | null;
  activeChallenge: StudentChallengeSummary | null;
  enrolledChallenges: EnrolledChallengeItem[];
  pendingChallenge: PendingChallengeSummary | null;
  hasAccess: boolean;
  isPreviewMode: boolean;
  previewChallengeId: string | null;
}

export interface CoachProfileSummary {
  id: string;
  full_name: string | null;
  specialty: string | null;
  phone: string | null;
  bio: string | null;
  instagram: string | null;
  avatar_url: string | null;
  document_type: string | null;
  document_number: string | null;
  plan_tier: string | null;
  plan_status: string | null;
  asaas_customer_id: string | null;
  asaas_wallet_id: string | null;
  asaas_pix_key: string | null;
  asaas_subscription_id: string | null;
  platform_fee_percent: number | null;
  plan_cycle: string | null;
  current_period_end: string | null;
  birth_date: string | null;
  postal_code: string | null;
  address: string | null;
  address_number: string | null;
  province: string | null;
  city: string | null;
  state: string | null;
  is_master_admin: boolean | null;
  brand_name: string | null;
  brand_logo_url: string | null;
  is_vip: boolean | null;
}

export interface ServerCoachSession {
  user: User | null;
  professional: CoachProfileSummary | null;
  planTier: PlanTier;
  isMaster: boolean;
}

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

export const getServerStudentSession = cache(async (): Promise<ServerStudentSession> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      student: null,
      activeChallengeId: null,
      activeChallenge: null,
      enrolledChallenges: [],
      pendingChallenge: null,
      hasAccess: false,
      isPreviewMode: false,
      previewChallengeId: null,
    };
  }

  const cookieStore = await cookies();
  const previewCookie = cookieStore.get('arena_preview')?.value === 'true';

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
    previewCookie
      ? supabase
          .from('professionals')
          .select('id, full_name, brand_name, avatar_url, brand_logo_url, is_master_admin')
          .eq('id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    previewCookie
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
    previewCookie &&
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
    return {
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
    };
  }

  const primaryEnrolled = enrolledChallenges[0] ?? null;
  const activeChallenge = primaryEnrolled?.challenge ?? null;
  const activeChallengeId = primaryEnrolled?.challengeId ?? activeChallenge?.id ?? null;
  const hasAccess = Boolean(activeChallengeId);
  const pendingChObj = !hasAccess ? normalizeChallenge(pendingPart?.challenges) : null;

  return {
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
  };
});

export const getServerCoachSession = cache(async (): Promise<ServerCoachSession> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      professional: null,
      planTier: 'starter',
      isMaster: false,
    };
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

  return {
    user,
    professional: prof,
    planTier,
    isMaster,
  };
});
