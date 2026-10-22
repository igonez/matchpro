'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Flame,
  Users,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Search,
  Award,
  TrendingUp,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { GoldMedalBadge, SilverMedalBadge, BronzeMedalBadge } from '@/components/ui/metallic-badges';
import { createClient } from '@/lib/supabase/client';

function CoachLeaderboardContent() {
  const searchParams = useSearchParams();
  const challengeIdParam = searchParams.get('challengeId');
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challengeIdParam || '');
  const [activeTab, setActiveTab] = useState<'individual' | 'squads'>('individual');
  const [standings, setStandings] = useState<any[]>([]);
  const [squadStandings, setSquadStandings] = useState<any[]>([]);
  const [streaksMap, setStreaksMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Carregar turmas do coach
  useEffect(() => {
    async function loadChallenges() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('challenges')
        .select('id, title, start_date, end_date, is_active')
        .eq('professional_id', user.id)
        .order('is_active', { ascending: false })
        .order('start_date', { ascending: false });

      if (data && data.length > 0) {
        setChallenges(data);
        if (!selectedChallengeId) {
          const matched = data.find((c: any) => c.id === challengeIdParam);
          setSelectedChallengeId(matched ? matched.id : data[0].id);
        }
      }
      setLoading(false);
    }
    loadChallenges();
  }, [challengeIdParam, supabase]);

  // 2. Carregar placar do desafio selecionado
  const loadStandings = async (challengeId: string) => {
    if (!challengeId) return;
    setLoading(true);
    try {
      const { data: standingsData } = await supabase
        .from('leaderboard_standings')
        .select(`
          id,
          total_points,
          challenge_id,
          student_id,
          students (
            id,
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq('challenge_id', challengeId)
        .order('total_points', { ascending: false });

      let { data: submissionsData, error: subErr } = await supabase
        .from('student_submissions')
        .select('student_id, status, missions!inner(challenge_id)')
        .eq('missions.challenge_id', challengeId)
        .eq('status', 'approved');

      if (subErr) {
        const fallbackSub = await supabase
          .from('student_submissions')
          .select('student_id, status')
          .eq('challenge_id', challengeId)
          .eq('status', 'approved');
        submissionsData = fallbackSub.data as any;
      }

      const approvedCounts = new Map<string, number>();
      submissionsData?.forEach((s: any) => {
        approvedCounts.set(s.student_id, (approvedCounts.get(s.student_id) || 0) + 1);
      });

      const { data: gamifData } = await supabase
        .from('student_gamification_state')
        .select('student_id, current_streak')
        .eq('challenge_id', challengeId);

      const stMap: Record<string, number> = {};
      gamifData?.forEach((g: any) => {
        stMap[g.student_id] = g.current_streak || 0;
      });
      setStreaksMap(stMap);

      const enriched = (standingsData || []).map((s: any) => ({
        ...s,
        students: Array.isArray(s.students) ? s.students[0] : s.students,
        approvedMissions: approvedCounts.get(s.student_id) || 0,
      }));

      setStandings(enriched);

      // Squad Standings (view + fallback direto em challenge_squads)
      const { data: squadsViewData } = await supabase
        .from('squad_standings')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('squad_average_points', { ascending: false });

      if (squadsViewData && squadsViewData.length > 0) {
        setSquadStandings(squadsViewData);
      } else {
        const { data: rawSquads } = await supabase
          .from('challenge_squads')
          .select('id, name, color_theme')
          .eq('challenge_id', challengeId);

        if (rawSquads && rawSquads.length > 0) {
          const { data: members } = await supabase
            .from('squad_members')
            .select('squad_id, student_id')
            .in('squad_id', rawSquads.map((sq: any) => sq.id));

          const ptsByStudent: Record<string, number> = {};
          enriched.forEach((st: any) => {
            ptsByStudent[st.student_id] = Number(st.total_points || 0);
          });

          const computed = rawSquads.map((sq: any) => {
            const sqMembers = (members || []).filter((m: any) => m.squad_id === sq.id);
            const totalPts = sqMembers.reduce((acc: number, m: any) => acc + (ptsByStudent[m.student_id] || 0), 0);
            const avgPts = sqMembers.length > 0 ? Math.round(totalPts / sqMembers.length) : 0;
            return {
              squad_id: sq.id,
              squad_name: sq.name,
              color_theme: sq.color_theme,
              total_members: sqMembers.length,
              squad_total_points: totalPts,
              squad_average_points: avgPts,
            };
          });
          computed.sort((a: any, b: any) => b.squad_average_points - a.squad_average_points);
          setSquadStandings(computed);
        } else {
          setSquadStandings([]);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar ranking da turma:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChallengeId) {
      loadStandings(selectedChallengeId);
    }
  }, [selectedChallengeId]);

  // 3. Realtime Updates
  useEffect(() => {
    if (!selectedChallengeId) return;

    const channel = supabase
      .channel('coach_realtime_leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_standings',
          filter: `challenge_id=eq.${selectedChallengeId}`,
        },
        () => {
          loadStandings(selectedChallengeId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChallengeId, supabase]);

  const currentChallenge = challenges.find((c) => c.id === selectedChallengeId);

  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];
  const maxPoints = standings.length > 0 ? Math.max(1, Number(standings[0]?.total_points || 0)) : 1;
  const totalApprovedCheckins = useMemo(
    () => standings.reduce((acc, curr) => acc + (curr.approvedMissions || 0), 0),
    [standings]
  );
  const maxStreak = useMemo(() => {
    const vals = Object.values(streaksMap);
    return vals.length > 0 ? Math.max(0, ...vals) : 0;
  }, [streaksMap]);

  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return standings;
    const q = searchQuery.toLowerCase();
    return standings.filter((s) => s.students?.full_name?.toLowerCase().includes(q));
  }, [standings, searchQuery]);

  return (
    <div className="space-y-6 relative pb-16">
      <Monochrome3DBackground />

      {/* Header com Seletor de Turma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/dashboard"
              className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-mono flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-amber-400" />
              LEADERBOARD OFICIAL
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Sincronizado Ao Vivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ranking & Telemetria da Turma
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Acompanhe a disputa pelo pódio, consistência de check-ins e acione alunos via WhatsApp com 1 clique.
          </p>
        </div>

        {/* Seletor de Desafio */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {challenges.length > 0 && (
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl border border-white/15 bg-zinc-950 px-3.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400/50 font-mono"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.is_active ? '(Turma Ativa)' : '(Encerrado)'}
                </option>
              ))}
            </select>
          )}

          {currentChallenge && (
            <Link href={`/dashboard/challenges/${currentChallenge.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 px-3.5 text-xs border-white/10 bg-zinc-950 text-zinc-300 hover:text-white"
              >
                Configurar Desafio
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* BLOCO 1: 4 Cards de Telemetria da Turma */}
      <div 
        data-tour="leaderboard-podium-card"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10"
      >
        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>COMPETIDORES</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {standings.length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Atletas pontuando na turma</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>LÍDER ATUAL (#1)</span>
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-2 truncate">
            {top1 ? top1.students?.full_name?.split(' ')[0] || 'Atleta' : 'Aguardando'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {top1 ? `${top1.total_points} XP acumulados` : 'Sem check-ins ainda'}
          </p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>MÉDIA DA TURMA</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {standings.length > 0
              ? Math.round(standings.reduce((acc, curr) => acc + (curr.total_points || 0), 0) / standings.length)
              : 0}{' '}
            <span className="text-xs text-zinc-400 font-normal">XP</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">{totalApprovedCheckins} check-ins validados</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>RECORDE DE STREAK</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {maxStreak} <span className="text-xs text-amber-400 font-normal">dias</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Maior sequência invicta</p>
        </SpotlightCard3D>
      </div>

      {/* BLOCO 2: PÓDIO OLÍMPICO 3D TOP 3 */}
      {standings.length > 0 && (
        <div 
          data-tour="leaderboard-podium-card"
          className="relative z-10 p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 overflow-hidden shadow-2xl"
        >
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-white/[0.08] relative z-10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                ARENA DE ELITE • PÓDIO OFICIAL
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Top 3 Atletas Mais Consistentes
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full self-start sm:self-auto">
              Pontuação Auditada por Câmera & IA
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 items-end max-w-2xl mx-auto pt-8 relative z-10">
            {/* 2º Lugar - Prata */}
            <div className="flex flex-col items-center">
              {top2 ? (
                <>
                  <div className="relative mb-3">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-zinc-900 border-2 border-slate-300/70 p-0.5 shadow-[0_0_25px_rgba(203,213,225,0.2)]">
                      <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center font-bold text-white overflow-hidden">
                        {top2.students?.avatar_url ? (
                          <img src={top2.students.avatar_url} alt="Top 2" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base font-mono text-slate-200">
                            {top2.students?.full_name?.charAt(0) || '2'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <SilverMedalBadge size={28} />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white text-center truncate max-w-[120px]">
                    {top2.students?.full_name?.split(' ')[0] || 'Atleta'}
                  </p>
                  <span className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                    {top2.total_points} XP
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {top2.approvedMissions || 0} missões
                  </span>
                  <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-zinc-950 via-slate-800/30 to-slate-400/20 border-t border-x border-slate-400/40 mt-3 flex flex-col items-center justify-center">
                    <span className="text-xl font-black font-mono text-slate-200 leading-none">2º</span>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">
                      PRATA
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-24 rounded-t-2xl border border-dashed border-white/10 flex items-center justify-center text-xs font-mono text-zinc-600">
                  2º VAGO
                </div>
              )}
            </div>

            {/* 1º Lugar - Ouro */}
            <div className="flex flex-col items-center">
              {top1 && (
                <>
                  <div className="relative mb-3">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <Crown className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-bounce" />
                    </div>
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_35px_rgba(251,191,36,0.4)]">
                      <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center font-black text-white overflow-hidden">
                        {top1.students?.avatar_url ? (
                          <img src={top1.students.avatar_url} alt="Top 1" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-mono text-amber-400">
                            {top1.students?.full_name?.charAt(0) || '1'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <GoldMedalBadge size={34} />
                    </div>
                  </div>
                  <p className="text-sm sm:text-base font-black text-white text-center truncate max-w-[140px]">
                    {top1.students?.full_name?.split(' ')[0] || 'Atleta'}
                  </p>
                  <span className="text-sm font-mono font-black text-amber-300 mt-0.5">
                    {top1.total_points} XP
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80">
                    {top1.approvedMissions || 0} missões aprovadas
                  </span>
                  <div className="w-full h-32 rounded-t-2xl bg-gradient-to-t from-zinc-950 via-amber-500/20 to-amber-400/35 border-t border-x border-amber-400/60 mt-3 flex flex-col items-center justify-center shadow-[inset_0_1px_16px_rgba(251,191,36,0.25)]">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 leading-none">1º</span>
                    <span className="text-[10px] font-mono font-bold text-amber-200 uppercase tracking-widest mt-1">
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
                  <div className="relative mb-3">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-zinc-900 border-2 border-amber-700/70 p-0.5 shadow-[0_0_20px_rgba(180,83,9,0.2)]">
                      <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center font-bold text-white overflow-hidden">
                        {top3.students?.avatar_url ? (
                          <img src={top3.students.avatar_url} alt="Top 3" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base font-mono text-amber-500">
                            {top3.students?.full_name?.charAt(0) || '3'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <BronzeMedalBadge size={28} />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white text-center truncate max-w-[120px]">
                    {top3.students?.full_name?.split(' ')[0] || 'Atleta'}
                  </p>
                  <span className="text-xs font-mono font-bold text-amber-500 mt-0.5">
                    {top3.total_points} XP
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {top3.approvedMissions || 0} missões
                  </span>
                  <div className="w-full h-20 rounded-t-2xl bg-gradient-to-t from-zinc-950 via-amber-900/25 to-amber-700/25 border-t border-x border-amber-700/50 mt-3 flex flex-col items-center justify-center">
                    <span className="text-lg font-black font-mono text-amber-500 leading-none">3º</span>
                    <span className="text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest mt-1">
                      BRONZE
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-20 rounded-t-2xl border border-dashed border-white/10 flex items-center justify-center text-xs font-mono text-zinc-600">
                  3º VAGO
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs + Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'individual'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Individual ({standings.length} alunos)
          </button>
          <button
            onClick={() => setActiveTab('squads')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'squads'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Squads / Equipes ({squadStandings.length})
          </button>
        </div>

        {activeTab === 'individual' && standings.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar aluno por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 font-mono"
            />
          </div>
        )}
      </div>

      {/* BLOCO 3: Tabela de Classificação Individual */}
      {activeTab === 'individual' && (
        <Card className="border-white/10 bg-zinc-950/90 relative z-10 overflow-hidden rounded-3xl">
          <CardHeader className="pb-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-white font-black tracking-tight">
                  Tabela Geral de Classificação
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Comparativo de XP relativo ao líder, missões validadas e contato rápido via WhatsApp.
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {filteredStandings.length} listados
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredStandings.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Trophy className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-mono text-zinc-400">
                  {searchQuery ? 'Nenhum atleta corresponde à busca.' : 'Nenhum aluno pontuou nesta turma ainda.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {filteredStandings.map((item) => {
                  const actualIndex = standings.findIndex((s) => s.id === item.id);
                  const rankPos = actualIndex + 1;
                  const studentName = item.students?.full_name || 'Atleta';
                  const cleanPhone = item.students?.phone?.replace(/\D/g, '') || '';
                  const streakDays = streaksMap[item.student_id] || 0;
                  const pctOfLeader = Math.max(5, Math.min(100, Math.round(((item.total_points || 0) / maxPoints) * 100)));
                  const waLink = cleanPhone
                    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                        `Parabéns pelo seu progresso no desafio! Você está em ${rankPos}º lugar com ${item.total_points} XP!`
                      )}`
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Posição */}
                        <div
                          className={`h-9 w-9 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 border ${
                            rankPos === 1
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                              : rankPos === 2
                              ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                              : rankPos === 3
                              ? 'bg-amber-800/20 text-amber-500 border-amber-700/40'
                              : 'bg-white/5 text-zinc-400 border-white/10'
                          }`}
                        >
                          #{String(rankPos).padStart(2, '0')}
                        </div>

                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                          {item.students?.avatar_url ? (
                            <img src={item.students.avatar_url} alt={studentName} className="w-full h-full object-cover" />
                          ) : (
                            studentName.charAt(0)
                          )}
                        </div>

                        {/* Nome, Badges & Barra */}
                        <div className="min-w-0 flex-1 max-w-md">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-white truncate">{studentName}</p>
                            {rankPos === 1 && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                                LÍDER
                              </span>
                            )}
                            {streakDays >= 2 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                <Flame className="w-3 h-3 text-amber-400" />
                                {streakDays}d streak
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden max-w-[220px]">
                              <div
                                className={`h-full rounded-full ${
                                  rankPos === 1
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                                    : rankPos === 2
                                    ? 'bg-gradient-to-r from-slate-400 to-slate-200'
                                    : rankPos === 3
                                    ? 'bg-gradient-to-r from-amber-700 to-amber-500'
                                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                                }`}
                                style={{ width: `${pctOfLeader}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {item.approvedMissions || 0}{' '}
                              {item.approvedMissions === 1 ? 'check-in aprovado' : 'check-ins aprovados'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pontos & Ações */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-base font-black font-mono text-white block leading-none">
                            {item.total_points} <span className="text-[10px] text-amber-400 font-bold">XP</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-end gap-1 mt-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Auditado
                          </span>
                        </div>

                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 text-xs font-mono font-bold transition-colors"
                            title="Parabenizar via WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Incentivar</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* BLOCO 4: Tabela de Squads */}
      {activeTab === 'squads' && (
        <Card className="border-white/10 bg-zinc-950/90 relative z-10 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-white/[0.06]">
            <CardTitle className="text-base text-white font-black tracking-tight">
              Classificação dos Squads Cooperativos
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Média de pontos de cada equipe para estimular a responsabilidade coletiva.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {squadStandings.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Users className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-mono text-zinc-400">Nenhum Squad configurado nesta turma.</p>
                <Link href="/dashboard/squads">
                  <Button size="sm" variant="outline" className="mt-2 text-xs border-white/10 text-zinc-300">
                    Configurar Squads
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {squadStandings.map((squad, idx) => (
                  <div key={squad.squad_id || idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 font-mono text-xs font-black text-white flex items-center justify-center">
                        #{String(idx + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{squad.squad_name}</p>
                        <p className="text-[11px] font-mono text-zinc-400">
                          {squad.total_members} atletas integrantes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-white block">
                        {Math.round(squad.squad_average_points || 0)}{' '}
                        <span className="text-[10px] text-cyan-400">XP Médio</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Total: {squad.squad_total_points || 0} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CoachLeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
          <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Carregando ranking oficial...
        </div>
      }
    >
      <CoachLeaderboardContent />
    </Suspense>
  );
}
