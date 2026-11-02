import { randomInt } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  computeTopPercentile,
  formatPublicName,
  getInitials,
  PublicRankingEntry,
  PublicRankingSharer,
  PublicRankingSnapshot,
  truncateWithEllipsis,
} from './ranking-format';

const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const SHARE_CODE_REGEX = /^[A-Za-z0-9]{8}$/;
export const SHARE_EXPIRATION_DAYS = 30;

export function generateShortCode(length = 8): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += BASE62_ALPHABET[randomInt(0, BASE62_ALPHABET.length)];
  }
  return out;
}

export function getPublicAppOrigin(requestOrigin?: string): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/+$/, '');
  }
  if (requestOrigin && /^https?:\/\//i.test(requestOrigin)) {
    return requestOrigin.replace(/\/+$/, '');
  }
  return 'https://arenafitpro.com.br';
}

export async function verifyUserCanShareChallenge(
  challengeId: string,
  userId: string
): Promise<{
  allowed: boolean;
  challenge: { id: string; title: string; professional_id: string; is_active: boolean } | null;
}> {
  const { data: challenge, error } = await supabaseAdmin
    .from('challenges')
    .select('id, title, professional_id, is_active')
    .eq('id', challengeId)
    .maybeSingle();

  if (error || !challenge) {
    return { allowed: false, challenge: null };
  }

  if (challenge.professional_id === userId) {
    return { allowed: true, challenge };
  }

  const [{ data: participant }, { data: standing }] = await Promise.all([
    supabaseAdmin
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('student_id', userId)
      .maybeSingle(),
    supabaseAdmin
      .from('leaderboard_standings')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('student_id', userId)
      .maybeSingle(),
  ]);

  return {
    allowed: Boolean(participant || standing),
    challenge,
  };
}

export async function buildRankingSnapshot(
  challengeId: string,
  challengeTitle: string,
  userId: string
): Promise<PublicRankingSnapshot | null> {
  const { data: standingsData, error } = await supabaseAdmin
    .from('leaderboard_standings')
    .select(
      `
      id,
      student_id,
      total_points,
      students (
        full_name
      )
    `
    )
    .eq('challenge_id', challengeId)
    .order('total_points', { ascending: false });

  if (error) {
    throw new Error(`Falha ao consultar ranking: ${error.message}`);
  }

  const rows: Array<{ studentId: string; fullName: string; points: number }> = (
    standingsData || []
  ).map((row: any) => {
    const st = Array.isArray(row.students) ? row.students[0] : row.students;
    return {
      studentId: String(row.student_id),
      fullName: String(st?.full_name || 'Atleta'),
      points: Math.max(0, Number(row.total_points || 0)),
    };
  });

  if (rows.length === 0) {
    return null;
  }

  const totalParticipants = rows.length;
  const top: PublicRankingEntry[] = rows.slice(0, 10).map((item, idx) => ({
    rank: idx + 1,
    name: formatPublicName(item.fullName, 18),
    initials: getInitials(item.fullName),
    points: item.points,
  }));

  const myIdx = rows.findIndex((r) => r.studentId === userId);
  let sharer: PublicRankingSharer | undefined;

  if (myIdx >= 0) {
    const me = rows[myIdx];
    const myRank = myIdx + 1;
    sharer = {
      rank: myRank,
      name: formatPublicName(me.fullName, 18),
      initials: getInitials(me.fullName),
      points: me.points,
      percentile: computeTopPercentile(myRank, totalParticipants),
    };
  }

  return {
    v: 1,
    challengeId,
    challengeTitle: truncateWithEllipsis(challengeTitle || 'Desafio Oficial', 80),
    totalParticipants,
    top,
    sharer,
    generatedAt: new Date().toISOString(),
  };
}

export interface ShareLookupResult {
  status: 'ok' | 'expired' | 'revoked' | 'not_found';
  record?: {
    id: string;
    code: string;
    challengeId: string;
    createdBy: string;
    expiresAt: string;
    revokedAt: string | null;
    viewCount: number;
    createdAt: string;
    snapshot: PublicRankingSnapshot;
  };
}

export async function getPublicShareByCode(code: string): Promise<ShareLookupResult> {
  if (!SHARE_CODE_REGEX.test(code)) {
    return { status: 'not_found' };
  }

  const { data, error } = await supabaseAdmin
    .from('ranking_share_links')
    .select('id, code, challenge_id, created_by, snapshot, expires_at, revoked_at, view_count, created_at')
    .eq('code', code)
    .maybeSingle();

  if (error || !data) {
    return { status: 'not_found' };
  }

  const record = {
    id: String(data.id),
    code: String(data.code),
    challengeId: String(data.challenge_id),
    createdBy: String(data.created_by),
    expiresAt: String(data.expires_at),
    revokedAt: data.revoked_at ? String(data.revoked_at) : null,
    viewCount: Number(data.view_count || 0),
    createdAt: String(data.created_at),
    snapshot: data.snapshot as PublicRankingSnapshot,
  };

  if (record.revokedAt) {
    return { status: 'revoked', record };
  }

  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    return { status: 'expired', record };
  }

  return { status: 'ok', record };
}
