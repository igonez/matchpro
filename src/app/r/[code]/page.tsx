import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Trophy, Crown, Award, Sparkles, ArrowUpRight, ShieldCheck, Clock } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatRankOfTotal } from '@/lib/share/ranking-format';
import { getPublicAppOrigin, getPublicShareByCode } from '@/lib/share/ranking-share.server';

interface SharePageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { code } = await params;
  const result = await getPublicShareByCode(code);
  const origin = getPublicAppOrigin();
  const pageUrl = `${origin}/r/${code}`;

  if (result.status !== 'ok' || !result.record) {
    return {
      title: 'Link de Ranking Expirado • ArenaFitPro',
      description: 'Este link compartilhado expirou ou foi desativado pelo atleta. Acesse o ArenaFitPro para acompanhar os desafios ao vivo.',
      robots: { index: false, follow: false },
      openGraph: {
        title: 'Link de Ranking Expirado • ArenaFitPro',
        description: 'Este link compartilhado expirou ou foi desativado. Abra o ArenaFitPro para acompanhar os desafios ao vivo.',
        type: 'website',
        url: pageUrl,
        siteName: 'ArenaFitPro',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Link de Ranking Expirado • ArenaFitPro',
        description: 'Este link compartilhado expirou ou foi desativado.',
      },
    };
  }

  const { snapshot } = result.record;
  const sharer = snapshot.sharer;
  const rankLabel = sharer
    ? formatRankOfTotal(sharer.rank, snapshot.totalParticipants)
    : `${snapshot.totalParticipants} atletas na disputa`;
  const pctBadge = sharer?.percentile ? ` • Top ${sharer.percentile}%` : '';

  const ogTitle = sharer
    ? `${sharer.name} está em ${rankLabel} no desafio ${snapshot.challengeTitle}`
    : `Ranking Oficial • ${snapshot.challengeTitle} | ArenaFitPro`;

  const ogDescription = sharer
    ? `${sharer.points} XP acumulados (${rankLabel}${pctBadge}). Veja o pódio Top 3 e a classificação oficial no ArenaFitPro!`
    : `Confira o pódio Top 3 e a classificação oficial com ${snapshot.totalParticipants} atletas no ArenaFitPro.`;

  return {
    title: ogTitle,
    description: ogDescription,
    robots: { index: false, follow: false },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'website',
      url: pageUrl,
      siteName: 'ArenaFitPro',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
    },
  };
}

export default async function PublicRankingSharePage({ params }: SharePageProps) {
  const { code } = await params;
  const result = await getPublicShareByCode(code);

  if (result.status === 'not_found') {
    notFound();
  }

  if (result.status === 'expired' || result.status === 'revoked' || !result.record) {
    const isRevoked = result.status === 'revoked';
    return (
      <main className="min-h-screen bg-[#000000] text-[#FAFAFA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full bg-white/[0.06] blur-3xl" />

        <div className="w-full max-w-md rounded-3xl border border-[#27272A] bg-[#0E0E10] p-7 text-center space-y-5 relative z-10 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto text-[#D4D4D8]">
            <Clock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-[10px] font-mono font-bold uppercase tracking-widest text-[#A1A1AA]">
              ARENAFITPRO • RANKING PÚBLICO
            </span>
            <h1 className="text-xl font-black text-[#FAFAFA]">
              {isRevoked ? 'Este link foi desativado' : 'Este link de ranking expirou'}
            </h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {isRevoked
                ? 'A pessoa que compartilhou este placar desativou o acesso público a este snapshot.'
                : 'Por privacidade, os links públicos de classificação têm validade limitada de 30 dias.'}
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              href="/app/leaderboard"
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#3478F6] hover:bg-[#75A7FF] text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <span>Abrir no ArenaFitPro</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] font-mono text-xs font-semibold flex items-center justify-center transition-colors"
            >
              Conhecer a plataforma
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Incrementar contador de visualizações de forma assíncrona (fire-and-forget)
  supabaseAdmin.rpc('increment_share_view', { p_code: code }).then(() => {}).catch(() => {});

  const { snapshot, expiresAt } = result.record;
  const sharer = snapshot.sharer;
  const topList = snapshot.top || [];
  const top1 = topList[0] || null;
  const top2 = topList[1] || null;
  const top3 = topList[2] || null;
  const deepLinkHref = `/app/leaderboard?challenge=${encodeURIComponent(snapshot.challengeId)}`;
  const leaderPts = Math.max(1, top1?.points || 1);

  return (
    <main className="min-h-screen bg-[#000000] text-[#FAFAFA] flex flex-col items-center py-8 px-4 sm:px-6 relative overflow-x-hidden">
      <div className="pointer-events-none fixed -top-24 left-1/2 -translate-x-1/2 w-[480px] h-72 rounded-full bg-white/[0.06] blur-3xl" />

      <div className="w-full max-w-lg space-y-5 relative z-10">
        {/* Header da Marca */}
        <header className="flex items-center justify-between gap-3 border-b border-[#27272A] pb-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon-192.png"
              alt="ArenaFitPro"
              className="w-9 h-9 rounded-xl border border-white/10 object-cover"
            />
            <div>
              <span className="text-xs font-black tracking-wider text-[#FAFAFA] block leading-none">
                ARENAFITPRO
              </span>
              <span className="text-[10px] font-mono text-[#D4D4D8] uppercase tracking-widest">
                RANKING AUDITADO
              </span>
            </div>
          </div>

          <Link
            href={deepLinkHref}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_20px_rgba(52,120,246,0.3)]"
          >
            <span>Abrir no App</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Título do Desafio */}
        <section className="rounded-3xl border border-[#27272A] bg-[#0E0E10] p-5 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono font-bold text-[#D4D4D8] uppercase tracking-widest">
              <Trophy className="w-3 h-3" />
              DESAFIO OFICIAL
            </span>
            <span className="text-[10px] font-mono text-[#A1A1AA]">
              {snapshot.totalParticipants}{' '}
              {snapshot.totalParticipants === 1 ? 'participante' : 'participantes'}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug break-words">
              {snapshot.challengeTitle}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
              Snapshot oficial verificado por câmera antifraude e IA.
            </p>
          </div>

          {/* Destaque de quem compartilhou */}
          {sharer && (
            <div className="rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-black font-mono font-black flex flex-col items-center justify-center shrink-0">
                  <span className="text-[8px] uppercase leading-none opacity-75">POS</span>
                  <span className="text-base leading-tight">#{sharer.rank}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-black text-white truncate">{sharer.name}</span>
                    {sharer.percentile !== null && (
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono font-bold text-[#D4D4D8]">
                        Top {sharer.percentile}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-amber-200 font-bold mt-0.5">
                    {formatRankOfTotal(sharer.rank, snapshot.totalParticipants)}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xl font-black text-white block leading-none">
                  {sharer.points}
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase mt-1 block">
                  XP
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Pódio Top 3 */}
        <section className="rounded-3xl border border-[#27272A] bg-[#0E0E10] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              PÓDIO TOP 3
            </span>
            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase">
              CLASSIFICAÇÃO CONGELADA
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 items-end pt-3">
            {/* 2º Lugar */}
            <div className="flex flex-col items-center">
              {top2 ? (
                <>
                  <div className="h-12 w-12 rounded-2xl bg-slate-800/80 border-2 border-slate-300/60 flex items-center justify-center font-mono font-black text-sm text-slate-100">
                    {top2.initials}
                  </div>
                  <p className="text-xs font-bold text-[#FAFAFA] truncate max-w-[95px] mt-1.5">
                    {top2.name}
                  </p>
                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {top2.points} XP
                  </span>
                  <div className="w-full h-16 rounded-t-2xl bg-gradient-to-t from-[#0E0E10] to-slate-400/20 border-t border-x border-slate-400/40 mt-2 flex flex-col items-center justify-center">
                    <span className="font-mono font-black text-slate-200 text-base">2º</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-16 rounded-t-2xl border border-dashed border-[#27272A] flex items-center justify-center text-[#A1A1AA] font-mono text-xs">
                  —
                </div>
              )}
            </div>

            {/* 1º Lugar */}
            <div className="flex flex-col items-center">
              {top1 ? (
                <>
                  <Crown className="w-5 h-5 text-amber-400 mb-1" />
                  <div className="h-16 w-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center font-mono font-black text-lg text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.3)]">
                    {top1.initials}
                  </div>
                  <p className="text-xs font-black text-[#FAFAFA] truncate max-w-[105px] mt-1.5">
                    {top1.name}
                  </p>
                  <span className="text-xs font-mono font-black text-amber-300">
                    {top1.points} XP
                  </span>
                  <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-[#0E0E10] to-amber-400/30 border-t border-x border-amber-400/60 mt-2 flex flex-col items-center justify-center">
                    <span className="font-mono font-black text-amber-300 text-xl">1º</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-24 rounded-t-2xl border border-dashed border-[#27272A] flex items-center justify-center text-[#A1A1AA] font-mono text-xs">
                  —
                </div>
              )}
            </div>

            {/* 3º Lugar */}
            <div className="flex flex-col items-center">
              {top3 ? (
                <>
                  <div className="h-12 w-12 rounded-2xl bg-amber-950/70 border-2 border-amber-600/60 flex items-center justify-center font-mono font-black text-sm text-amber-300">
                    {top3.initials}
                  </div>
                  <p className="text-xs font-bold text-[#FAFAFA] truncate max-w-[95px] mt-1.5">
                    {top3.name}
                  </p>
                  <span className="text-[11px] font-mono font-bold text-amber-400">
                    {top3.points} XP
                  </span>
                  <div className="w-full h-14 rounded-t-2xl bg-gradient-to-t from-[#0E0E10] to-amber-700/25 border-t border-x border-amber-700/50 mt-2 flex flex-col items-center justify-center">
                    <span className="font-mono font-black text-amber-400 text-sm">3º</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-14 rounded-t-2xl border border-dashed border-[#27272A] flex items-center justify-center text-[#A1A1AA] font-mono text-xs">
                  —
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Lista Top 10 */}
        <section className="rounded-3xl border border-[#27272A] bg-[#0E0E10] p-5 space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A1A1AA]">
              TOP {topList.length} CLASSIFICAÇÃO
            </span>
            <span className="text-[10px] font-mono text-[#A1A1AA]">PONTOS XP</span>
          </div>

          {topList.map((entry) => {
            const isSharer = sharer?.rank === entry.rank && sharer?.name === entry.name;
            const widthPct = Math.max(8, Math.min(100, Math.round((entry.points / leaderPts) * 100)));
            const rankBadgeClass =
              entry.rank === 1
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                : entry.rank === 2
                ? 'bg-slate-300/20 border-slate-300/50 text-slate-200'
                : entry.rank === 3
                ? 'bg-amber-700/35 border-amber-500/60 text-amber-400'
                : 'bg-[#000000] border-[#27272A] text-[#A1A1AA]';

            return (
              <div
                key={entry.rank}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                  isSharer
                    ? 'bg-white/[0.06] border-white/10'
                    : 'bg-[#141416] border-[#27272A]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`w-8 h-8 rounded-xl border font-mono text-xs font-black flex items-center justify-center shrink-0 ${rankBadgeClass}`}>
                    #{entry.rank}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#18181B] border border-[#27272A] font-mono text-xs font-bold text-[#D4D4D8] flex items-center justify-center shrink-0">
                    {entry.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#FAFAFA] truncate">{entry.name}</p>
                    <div className="w-full h-1.5 rounded-full bg-[#27272A] mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2055BD] to-[#3478F6]"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs font-black text-[#FAFAFA] shrink-0">
                  {entry.points} XP
                </span>
              </div>
            );
          })}
        </section>

        {/* CTA Principal Deep Link */}
        <div className="pt-1 space-y-3 text-center">
          <Link
            href={deepLinkHref}
            className="w-full min-h-[52px] py-3.5 px-5 rounded-2xl bg-[#3478F6] hover:bg-[#75A7FF] text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(52,120,246,0.3)] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Abrir Desafio no ArenaFitPro</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <p className="text-[11px] font-mono text-zinc-500">
            Link válido até {new Date(expiresAt).toLocaleDateString('pt-BR')} •{' '}
            <span className="text-zinc-400">arenafitpro.com.br</span>
          </p>
        </div>
      </div>
    </main>
  );
}
