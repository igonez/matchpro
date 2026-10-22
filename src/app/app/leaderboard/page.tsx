'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { GoldMedalBadge, SilverMedalBadge, BronzeMedalBadge } from '@/components/ui/metallic-badges';
import {
  Trophy,
  Crown,
  Flame,
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  ShieldCheck,
  Target,
  Sparkles,
  Zap,
  Award,
} from 'lucide-react';
import Link from 'next/link';

interface LeaderboardItem {
  id: string;
  student_id: string;
  total_points: number;
  students?: {
    full_name: string;
    avatar_url: string;
  };
}

interface SquadLeaderboardItem {
  id: string;
  name: string;
  color: string;
  total_points: number;
  member_count: number;
  average_points: number;
}

export default function LeaderboardPage() {
  const supabase = createClient();
  const [standings, setStandings] = useState<LeaderboardItem[]>([]);
  const [squadStandings, setSquadStandings] = useState<SquadLeaderboardItem[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'individual' | 'squads'>('individual');
  const [searchQuery, setSearchQuery] = useState('');
  const [rankHistory, setRankHistory] = useState<Record<string, number>>({});
  const [streaksMap, setStreaksMap] = useState<Record<string, number>>({});

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      // 1. Identificar turma do atleta
      const { data: participation } = await supabase
        .from('challenge_participants')
        .select('challenge_id, challenges(id, title, start_date, end_date, is_active)')
        .eq('student_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const challengeObj = Array.isArray(participation?.challenges)
        ? participation?.challenges[0]
        : participation?.challenges;
      const challengeId = challengeObj?.id || participation?.challenge_id;

      if (challengeId) {
        setCurrentChallenge(challengeObj || { id: challengeId, title: 'Desafio Ativo' });

        // A. Ranking Individual
        const { data: standingsData } = await supabase
          .from('leaderboard_standings')
          .select(`
            id,
            student_id,
            total_points,
            students (
              full_name,
              avatar_url
            )
          `)
          .eq('challenge_id', challengeId)
          .order('total_points', { ascending: false });

        const safeStandings: LeaderboardItem[] = (standingsData || []).map((item: any) => ({
          ...item,
          students: Array.isArray(item.students) ? item.students[0] : item.students,
        }));
        setStandings(safeStandings);

        // B. Ranking de Squads (suporta challenge_squads e view squad_standings)
        const { data: squadsData } = await supabase
          .from('challenge_squads')
          .select('id, name, color_theme')
          .eq('challenge_id', challengeId);

        const resolveSquadHexColor = (theme?: string): string => {
          if (!theme) return '#f59e0b';
          if (theme.startsWith('#')) return theme;
          const map: Record<string, string> = {
            emerald: '#10b981',
            amber: '#f59e0b',
            cyan: '#06b6d4',
            purple: '#a855f7',
            orange: '#f97316',
            rose: '#f43f5e',
            red: '#ef4444',
            blue: '#3b82f6',
          };
          return map[theme.toLowerCase()] || '#f59e0b';
        };

        if (squadsData && squadsData.length > 0) {
          const { data: squadMembers } = await supabase
            .from('squad_members')
            .select('squad_id, student_id')
            .in('squad_id', squadsData.map((s: any) => s.id));

          const pointsMap: Record<string, number> = {};
          safeStandings.forEach((s: LeaderboardItem) => {
            pointsMap[s.student_id] = s.total_points;
          });

          const computedSquads: SquadLeaderboardItem[] = squadsData.map((sq: any) => {
            const members = (squadMembers || []).filter((m: any) => m.squad_id === sq.id);
            const memberCount = members.length;
            const totalPoints = members.reduce((acc: number, m: any) => acc + (pointsMap[m.student_id] || 0), 0);
            const averagePoints = memberCount > 0 ? Math.round(totalPoints / memberCount) : 0;

            return {
              id: sq.id,
              name: sq.name,
              color: resolveSquadHexColor(sq.color_theme),
              total_points: totalPoints,
              member_count: memberCount,
              average_points: averagePoints,
            };
          });

          computedSquads.sort((a, b) => b.total_points - a.total_points);
          setSquadStandings(computedSquads);
        } else {
          const { data: squadViewData } = await supabase
            .from('squad_standings')
            .select('*')
            .eq('challenge_id', challengeId)
            .order('squad_average_points', { ascending: false });

          if (squadViewData && squadViewData.length > 0) {
            setSquadStandings(
              squadViewData.map((sq: any) => ({
                id: sq.squad_id,
                name: sq.squad_name,
                color: resolveSquadHexColor(sq.color_theme),
                total_points: Number(sq.squad_total_points || 0),
                member_count: Number(sq.total_members || 0),
                average_points: Math.round(Number(sq.squad_average_points || 0)),
              }))
            );
          }
        }

        // C. Streaks dos Alunos
        const { data: gamifData } = await supabase
          .from('student_gamification_state')
          .select('student_id, current_streak')
          .eq('challenge_id', challengeId);

        if (gamifData && gamifData.length > 0) {
          const map: Record<string, number> = {};
          gamifData.forEach((g: any) => {
            map[g.student_id] = g.current_streak;
          });
          setStreaksMap(map);
        }

        // D. Histórico de Posições
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const { data: historyData } = await supabase
          .from('leaderboard_history')
          .select('student_id, rank_position')
          .eq('challenge_id', challengeId)
          .eq('recorded_date', yesterday);

        if (historyData && historyData.length > 0) {
          const hMap: Record<string, number> = {};
          historyData.forEach((h: any) => {
            hMap[h.student_id] = h.rank_position;
          });
          setRankHistory(hMap);
        }

        // Snapshot diário
        const todayStr = new Date().toISOString().split('T')[0];
        safeStandings.slice(0, 50).forEach(async (s: any, idx: number) => {
          try {
            await supabase.from('leaderboard_history').upsert(
              {
                challenge_id: challengeId,
                student_id: s.student_id,
                rank_position: idx + 1,
                total_points: s.total_points,
                recorded_date: todayStr,
              },
              { onConflict: 'challenge_id,student_id,recorded_date' }
            );
          } catch {
            // Silencioso se conflito
          }
        });
      }
    } catch (err) {
      console.error('Erro ao buscar leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel('realtime_leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_standings',
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Aluno mais consistente em Streak
  const topStreakStudent = useMemo(() => {
    let topId = '';
    let max = 0;
    Object.entries(streaksMap).forEach(([id, st]) => {
      if (st > max) {
        max = st;
        topId = id;
      }
    });
    const stObj = standings.find((s) => s.student_id === topId);
    return max > 0
      ? {
          studentId: topId,
          streak: max,
          name: stObj?.students?.full_name?.split(' ')[0] || 'Atleta',
        }
      : null;
  }, [streaksMap, standings]);

  // Cálculo da posição do aluno logado e métricas da turma
  const myIndex = currentUserId ? standings.findIndex((s) => s.student_id === currentUserId) : -1;
  const myRank = myIndex >= 0 ? myIndex + 1 : null;
  const myStanding = myIndex >= 0 ? standings[myIndex] : null;
  const nextRankUp = myIndex > 0 ? standings[myIndex - 1] : null;
  const pointsToOvertake =
    myStanding && nextRankUp
      ? Math.max(0, Number(nextRankUp.total_points || 0) - Number(myStanding.total_points || 0))
      : 0;

  const leaderPoints = standings.length > 0 ? Math.max(1, Number(standings[0].total_points || 0)) : 1;
  const classAveragePoints =
    standings.length > 0
      ? Math.round(standings.reduce((acc, s) => acc + Number(s.total_points || 0), 0) / standings.length)
      : 0;

  const leadMargin =
    myRank === 1 && standings.length > 1
      ? Math.max(0, Number(standings[0].total_points || 0) - Number(standings[1].total_points || 0))
      : 0;

  const overtakeProgressPct = useMemo(() => {
    if (!myStanding) return 0;
    if (myRank === 1) return 100;
    if (!nextRankUp || Number(nextRankUp.total_points || 0) <= 0) return 100;
    return Math.min(100, Math.round((Number(myStanding.total_points || 0) / Number(nextRankUp.total_points || 1)) * 100));
  }, [myStanding, myRank, nextRankUp]);

  // Filtragem por busca
  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return standings;
    const q = searchQuery.toLowerCase();
    return standings.filter((s) => s.students?.full_name?.toLowerCase().includes(q));
  }, [standings, searchQuery]);

  const getRankDelta = (studentId: string, currentRankPos: number) => {
    const prevRank = rankHistory[studentId];
    if (prevRank === undefined) return null;
    const diff = prevRank - currentRankPos;
    if (diff > 0) return { direction: 'up', value: diff };
    if (diff < 0) return { direction: 'down', value: Math.abs(diff) };
    return { direction: 'same', value: 0 };
  };

  const top1 = standings[0] || null;
  const top2 = standings[1] || null;
  const top3 = standings[2] || null;

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 md:p-8 space-y-6 w-full pb-32 relative">
      <Monochrome3DBackground />

      {/* Header Editorial com Status Ao Vivo */}
      <div 
        data-tour="student-ranking-card"
        className="flex items-start justify-between pt-2 relative z-10 border-b border-white/[0.08] pb-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase">
              <Trophy className="w-3 h-3 text-amber-400" />
              RANKING OFICIAL
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AO VIVO
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {currentChallenge?.title || 'Arena de Classificação'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            Pontuação auditada por integridade de check-ins.
          </p>
        </div>
        <Link
          href="/app"
          className="h-11 min-h-[44px] px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          VOLTAR
        </Link>
      </div>

      {/* BLOCO 1: Painel Pessoal de Performance & Alvo de Ultrapassagem */}
      {!loading && myStanding && myRank && (
        <SpotlightCard3D className="p-4 rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.08] via-zinc-950 to-zinc-950 relative z-10 shadow-[0_12px_36px_rgba(0,0,0,0.65)]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-black flex flex-col items-center justify-center shrink-0 font-mono shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                <span className="text-[8px] font-black uppercase leading-none opacity-75">RANK</span>
                <span className="text-base font-black leading-tight">#{String(myRank).padStart(2, '0')}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white uppercase tracking-wide">Seu Desempenho</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {myRank <= 3 ? 'ZONA DE PÓDIO' : 'COMPETIDOR ATIVO'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-300 mt-1">
                  {myRank === 1 ? (
                    <span className="text-amber-300 font-bold">
                      Você lidera a turma com +{leadMargin} XP de vantagem!
                    </span>
                  ) : pointsToOvertake === 0 ? (
                    `Empatado com #${myRank - 1} (${nextRankUp?.students?.full_name?.split(' ')[0] || 'Atleta'})`
                  ) : (
                    <>
                      Faltam <strong className="text-amber-300">{pointsToOvertake} XP</strong> para ultrapassar{' '}
                      <strong className="text-white">
                        #{myRank - 1} {nextRankUp?.students?.full_name?.split(' ')[0] || 'Atleta'}
                      </strong>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xl font-mono font-black text-white block leading-none">
                {myStanding.total_points}
              </span>
              <span className="text-[9px] font-mono text-amber-400 font-bold uppercase mt-1 block tracking-wider">
                XP TOTAL
              </span>
            </div>
          </div>

          {/* Barra de Progresso de Ultrapassagem */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400 uppercase flex items-center gap-1">
                <Target className="w-3 h-3 text-cyan-400" />
                {myRank === 1 ? 'Domínio da Liderança' : `Progresso até #${myRank - 1}`}
              </span>
              <span className="text-white font-bold">{overtakeProgressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/80 border border-white/[0.08] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${overtakeProgressPct}%` }}
              />
            </div>
          </div>
        </SpotlightCard3D>
      )}

      {/* BLOCO 2: Métricas Rápidas da Turma (3 Pilares) */}
      {!loading && (
        <div className="grid grid-cols-3 gap-2.5 relative z-10">
          <div className="p-3 rounded-2xl bg-zinc-950/90 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase">
              <span>ATLETAS</span>
              <Users className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-base font-black font-mono text-white mt-1.5">
              {standings.length}
            </div>
            <span className="text-[9px] font-mono text-zinc-500 truncate">Na disputa</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/90 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase">
              <span>MÉDIA TURMA</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-black font-mono text-white mt-1.5">
              {classAveragePoints} <span className="text-[9px] text-zinc-400 font-normal">XP</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400/90 truncate">Ritmo coletivo</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/90 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase">
              <span>TOP STREAK</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base font-black font-mono text-amber-300 mt-1.5">
              {topStreakStudent ? `${topStreakStudent.streak}d` : '0d'}
            </div>
            <span className="text-[9px] font-mono text-zinc-500 truncate">
              {topStreakStudent ? topStreakStudent.name : 'Sem ofensiva'}
            </span>
          </div>
        </div>
      )}

      {/* Seletor Segmented: Individual vs Squads */}
      <div 
        data-tour="student-squad-card"
        className="grid grid-cols-2 p-1.5 rounded-2xl bg-zinc-950 border border-white/10 relative z-10"
      >
        <button
          onClick={() => setActiveTab('individual')}
          className={`py-2.5 min-h-[44px] text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'individual'
              ? 'bg-white text-black font-black rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              : 'text-zinc-400 hover:text-white font-medium'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          INDIVIDUAL ({standings.length})
        </button>
        <button
          onClick={() => setActiveTab('squads')}
          className={`py-2.5 min-h-[44px] text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'squads'
              ? 'bg-white text-black font-black rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              : 'text-zinc-400 hover:text-white font-medium'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          SQUADS ({squadStandings.length})
        </button>
      </div>

      {/* BLOCO 3: Pódio 3D Olímpico (Ouro, Prata, Bronze) */}
      {!loading && activeTab === 'individual' && !searchQuery && standings.length > 0 && (
        <div className="relative z-10 p-5 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 overflow-hidden shadow-2xl">
          {/* Glow de fundo para o pódio */}
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-56 h-32 rounded-full bg-amber-400/15 blur-3xl" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300">
                PÓDIO DE ELITE • TOP 3
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-300/90 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
              Liderança Auditada
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 items-end pt-4 relative z-10">
            {/* 2º Lugar - Prata */}
            <div className="flex flex-col items-center">
              {top2 ? (
                <>
                  <div className="relative mb-2">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 border-2 border-slate-300/70 p-0.5 shadow-[0_0_20px_rgba(203,213,225,0.2)]">
                      <div className="w-full h-full rounded-[12px] bg-zinc-950 flex items-center justify-center font-bold text-sm text-slate-200 overflow-hidden">
                        {top2.students?.avatar_url ? (
                          <img src={top2.students.avatar_url} alt="2º" className="w-full h-full object-cover" />
                        ) : (
                          top2.students?.full_name?.charAt(0) || '2'
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <SilverMedalBadge size={24} />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white truncate max-w-[90px] mt-1">
                    {top2.students?.full_name?.split(' ')[0] || 'Atleta'}
                  </p>
                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {top2.total_points} XP
                  </span>
                  <div className="w-full h-20 rounded-t-2xl bg-gradient-to-t from-zinc-950 via-slate-800/30 to-slate-400/20 border-t border-x border-slate-400/40 mt-2.5 flex flex-col items-center justify-center p-2">
                    <span className="font-mono font-black text-slate-200 text-lg leading-none">2º</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 mt-1">PRATA</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-24 rounded-t-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600 font-mono text-[10px]">
                  <span>2º VAGO</span>
                </div>
              )}
            </div>

            {/* 1º Lugar - Ouro */}
            <div className="flex flex-col items-center">
              {top1 && (
                <>
                  <div className="relative mb-2">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-bounce" />
                    </div>
                    <div className="h-[72px] w-[72px] rounded-2xl bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                      <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center font-black text-lg text-amber-300 overflow-hidden">
                        {top1.students?.avatar_url ? (
                          <img src={top1.students.avatar_url} alt="1º" className="w-full h-full object-cover" />
                        ) : (
                          top1.students?.full_name?.charAt(0) || '1'
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <GoldMedalBadge size={28} />
                    </div>
                  </div>
                  <p className="text-xs font-black text-white truncate max-w-[100px] mt-1">
                    {top1.students?.full_name?.split(' ')[0] || 'Atleta'}
                  </p>
                  <span className="text-xs font-mono font-black text-amber-300">
                    {top1.total_points} XP
                  </span>
                  <div className="w-full h-28 rounded-t-2xl bg-gradient-to-t from-zinc-950 via-amber-500/20 to-amber-400/30 border-t border-x border-amber-400/60 mt-2.5 flex flex-col items-center justify-center p-2 shadow-[inset_0_1px_12px_rgba(251,191,36,0.25)]">
                    <span className="font-mono font-black text-amber-300 text-2xl leading-none">1º</span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-200 mt-1">
                      LÍDER OURO
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 3º Lugar - Bronze */}
            <div className="flex flex-col items-center">
              {top3 ? (
                <>
                  <div className="relative mb-2">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 border-2 border-amber-700/70 p-0.5 shadow-[0_0_20px_rgba(180,83,9,0.2)]">
                      <div className="w-full h-full rounded-[12px] bg-zinc-950 flex items-center justify-center font-bold text-sm text-amber-500 overflow-hidden">
                        {top3.students?.avatar_url ? (
                          <img src={top3.students.avatar_url} alt="3º" className="w-full h-full object-cover" />
                        ) : (
                          top3.students?.full_name?.charAt(0) || '3'
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <BronzeMedalBadge size={24} />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white truncate max-w-[90px] mt-1">
                    {top3.students?.full_name?.split(' ')[0] || 'Atleta'}
                  </p>
                  <span className="text-[11px] font-mono font-bold text-amber-500">
                    {top3.total_points} XP
                  </span>
                  <div className="w-full h-16 rounded-t-2xl bg-gradient-to-t from-zinc-950 via-amber-900/25 to-amber-700/25 border-t border-x border-amber-700/50 mt-2.5 flex flex-col items-center justify-center p-2">
                    <span className="font-mono font-black text-amber-500 text-base leading-none">3º</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-amber-600 mt-1">BRONZE</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-18 rounded-t-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600 font-mono text-[10px]">
                  <span>3º VAGO</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Busca Rápida de Atletas */}
      {activeTab === 'individual' && standings.length > 2 && (
        <div className="relative z-10">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar atleta pelo nome na classificação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 font-mono transition-colors"
          />
        </div>
      )}

      {/* BLOCO 4: Classificação Completa com Barras de Progresso Relativo */}
      <div className="space-y-2.5 relative z-10">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
            {activeTab === 'individual' ? 'TABELA GERAL DE ATLETAS' : 'CLASSIFICAÇÃO DE SQUADS'}
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {activeTab === 'individual' ? `${filteredStandings.length} competidores` : `${squadStandings.length} equipes`}
          </span>
        </div>

        {loading ? (
          <div className="py-16 rounded-3xl border border-white/10 bg-zinc-950/60 text-center space-y-2">
            <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              SINCRONIZANDO CLASSIFICAÇÃO...
            </p>
          </div>
        ) : activeTab === 'individual' ? (
          filteredStandings.length === 0 ? (
            <div className="p-8 rounded-3xl border border-white/10 bg-zinc-950 text-center space-y-2">
              <Trophy className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs font-mono text-zinc-400">
                {searchQuery ? 'NENHUM ATLETA ENCONTRADO.' : 'NENHUMA PONTUAÇÃO COMPUTADA NESTA TURMA.'}
              </p>
            </div>
          ) : (
            filteredStandings.map((item) => {
              const actualRank = standings.findIndex((s) => s.id === item.id) + 1;
              const isMe = item.student_id === currentUserId;
              const delta = getRankDelta(item.student_id, actualRank);
              const athleteStreak = streaksMap[item.student_id] || 0;
              const relativePct = Math.max(6, Math.min(100, Math.round((Number(item.total_points || 0) / leaderPoints) * 100)));

              const rankBadgeStyle =
                actualRank === 1
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : actualRank === 2
                  ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                  : actualRank === 3
                  ? 'bg-amber-700/20 text-amber-500 border-amber-700/40'
                  : isMe
                  ? 'bg-white text-black border-white'
                  : 'bg-white/[0.04] text-zinc-400 border-white/10';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isMe
                      ? 'bg-zinc-900/95 border-amber-400/40 shadow-[0_0_25px_rgba(251,191,36,0.1)]'
                      : actualRank <= 3
                      ? 'bg-zinc-950/95 border-white/15'
                      : 'bg-zinc-950/80 border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`h-9 w-9 rounded-xl border font-mono text-xs font-black flex items-center justify-center shrink-0 ${rankBadgeStyle}`}
                      >
                        #{String(actualRank).padStart(2, '0')}
                      </div>

                      <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white overflow-hidden shrink-0">
                        {item.students?.avatar_url ? (
                          <img src={item.students.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          item.students?.full_name?.charAt(0) || 'A'
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-white truncate max-w-[135px]">
                            {item.students?.full_name || 'Atleta'}
                          </p>
                          {isMe && (
                            <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-black shrink-0">
                              VOCÊ
                            </span>
                          )}
                          {athleteStreak >= 2 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                              <Flame className="w-2.5 h-2.5 text-amber-400" />
                              {athleteStreak}d
                            </span>
                          )}
                        </div>

                        {/* Barra de progresso relativa ao líder */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                actualRank === 1
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                                  : actualRank === 2
                                  ? 'bg-gradient-to-r from-slate-400 to-slate-200'
                                  : actualRank === 3
                                  ? 'bg-gradient-to-r from-amber-700 to-amber-500'
                                  : isMe
                                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                                  : 'bg-zinc-600'
                              }`}
                              style={{ width: `${relativePct}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500 shrink-0">{relativePct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-mono text-sm font-black text-white leading-none">
                        {item.total_points}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        {delta && delta.direction === 'up' && (
                          <span className="inline-flex items-center text-[9px] font-mono font-bold text-emerald-400">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />+{delta.value}
                          </span>
                        )}
                        {delta && delta.direction === 'down' && (
                          <span className="inline-flex items-center text-[9px] font-mono font-bold text-rose-400">
                            <TrendingDown className="w-2.5 h-2.5 mr-0.5" />-{delta.value}
                          </span>
                        )}
                        {(!delta || delta.direction === 'same') && (
                          <span className="text-[9px] font-mono text-amber-400/90 font-bold uppercase">
                            XP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Ranking de Squads */
          squadStandings.length === 0 ? (
            <div className="p-8 rounded-3xl border border-white/10 bg-zinc-950 text-center space-y-2">
              <Users className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs font-mono text-zinc-400">NENHUM SQUAD ATIVO NESTA TURMA.</p>
              <p className="text-[11px] text-zinc-500">
                Quando o treinador dividir a turma em equipes cooperativas, o placar de squads aparecerá aqui.
              </p>
            </div>
          ) : (
            squadStandings.map((sq, idx) => {
              const maxSquadPts = Math.max(1, squadStandings[0]?.total_points || 1);
              const sqPct = Math.max(8, Math.min(100, Math.round((sq.total_points / maxSquadPts) * 100)));

              return (
                <div
                  key={sq.id}
                  className="p-4 rounded-2xl border border-white/10 bg-zinc-950 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-10 w-10 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 border"
                        style={{
                          borderColor: `${sq.color}66`,
                          backgroundColor: `${sq.color}1A`,
                          color: sq.color,
                        }}
                      >
                        #{String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white truncate">{sq.name}</h3>
                          {idx === 0 && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                              SQUAD LÍDER
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5">
                          {sq.member_count} INTEGRANTES • MÉDIA {sq.average_points} XP/ATLETA
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-base font-black text-white block leading-none">
                        {sq.total_points}
                      </span>
                      <span className="text-[9px] font-mono text-amber-400 font-bold uppercase mt-1 block">
                        XP TOTAL
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${sqPct}%`, backgroundColor: sq.color }}
                    />
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
