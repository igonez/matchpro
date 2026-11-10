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
  Share2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { GoldMedalBadge, SilverMedalBadge, BronzeMedalBadge } from '@/components/ui/metallic-badges';
import { ShareRankingSheet } from '@/components/share-ranking/share-ranking-sheet';
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
  const [showStoryShare, setShowStoryShare] = useState(false);
  const [coachProfile, setCoachProfile] = useState<{
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    brandName: string | null;
    brandLogoUrl: string | null;
  } | null>(null);

  // 1. Carregar turmas e perfil do coach
  useEffect(() => {
    async function loadChallenges() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data }, { data: prof }] = await Promise.all([
        supabase
          .from('challenges')
          .select('id, title, start_date, end_date, is_active')
          .eq('professional_id', user.id)
          .order('is_active', { ascending: false })
          .order('start_date', { ascending: false }),
        supabase
          .from('professionals')
          .select('id, full_name, avatar_url, brand_name, brand_logo_url')
          .eq('id', user.id)
          .maybeSingle(),
      ]);

      const meta = user.user_metadata || {};
      const localBrandName =
        typeof window !== 'undefined' ? window.localStorage.getItem('arena_coach_brand_name') : null;
      const localLogoUrl =
        typeof window !== 'undefined' ? window.localStorage.getItem('arena_coach_logo_url') : null;

      setCoachProfile({
        id: user.id,
        fullName: prof?.full_name || meta.full_name || null,
        avatarUrl: prof?.avatar_url || meta.avatar_url || meta.picture || localLogoUrl || null,
        brandName: prof?.brand_name || meta.brand_name || localBrandName || prof?.full_name || meta.full_name || null,
        brandLogoUrl: prof?.brand_logo_url || prof?.avatar_url || meta.avatar_url || meta.picture || localLogoUrl || null,
      });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-[#27272A] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/dashboard"
              className="h-7 w-7 rounded-lg bg-[#0E0E10] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-[11px] font-bold text-[#A1A1AA] bg-[#0E0E10] px-2.5 py-0.5 rounded-full border border-[#27272A] font-mono flex items-center gap-1.5">
              <Trophy className="w-3 h-3 text-[#D4D4D8]" />
              LEADERBOARD OFICIAL
            </span>
            <span className="text-xs text-[#D4D4D8] font-mono font-bold flex items-center gap-1.5 bg-white/[0.06] border border-white/10 px-2.5 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3478F6] animate-pulse shadow-[0_0_6px_#3478F6]" /> Sincronizado Ao Vivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FAFAFA] tracking-tight">
            Ranking & Telemetria da Turma
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Acompanhe a disputa pelo pódio, consistência de check-ins e acione alunos via WhatsApp com 1 clique.
          </p>
        </div>

        {/* Seletor de Desafio */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {challenges.length > 0 && (
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl border border-[#27272A] bg-[#0E0E10] px-3.5 text-xs font-bold text-[#FAFAFA] focus:outline-none focus:border-[#3478F6] font-mono"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.is_active ? '(Turma Ativa)' : '(Encerrado)'}
                </option>
              ))}
            </select>
          )}

          {standings.length > 0 && (
            <button
              type="button"
              onClick={() => setShowStoryShare(true)}
              className="h-10 px-4 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D4D4D8] shrink-0" />
              <span>Compartilhar Ranking (Stories / WhatsApp)</span>
            </button>
          )}

          {currentChallenge && (
            <Link href={`/dashboard/challenges/${currentChallenge.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 px-3.5 text-xs border-[#27272A] bg-[#0E0E10] text-[#A1A1AA] hover:text-[#FAFAFA]"
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
          <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] font-mono">
            <span>COMPETIDORES</span>
            <Users className="h-4 w-4 text-[#D4D4D8]" />
          </div>
          <div className="text-2xl font-black text-[#FAFAFA] font-mono mt-2">
            {standings.length}
          </div>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5">Atletas pontuando na turma</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] font-mono">
            <span>LÍDER ATUAL (#1)</span>
            <Trophy className="h-4 w-4 text-[#D4D4D8]" />
          </div>
          <div className="text-2xl font-black text-[#FAFAFA] font-mono mt-2 truncate">
            {top1 ? top1.students?.full_name?.split(' ')[0] || 'Atleta' : 'Aguardando'}
          </div>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5">
            {top1 ? `${top1.total_points} XP acumulados` : 'Sem check-ins ainda'}
          </p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] font-mono">
            <span>MÉDIA DA TURMA</span>
            <Sparkles className="h-4 w-4 text-[#D4D4D8]" />
          </div>
          <div className="text-2xl font-black text-[#FAFAFA] font-mono mt-2">
            {standings.length > 0
              ? Math.round(standings.reduce((acc, curr) => acc + (curr.total_points || 0), 0) / standings.length)
              : 0}{' '}
            <span className="text-xs text-[#A1A1AA] font-normal">XP</span>
          </div>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5">{totalApprovedCheckins} check-ins validados</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-4">
          <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] font-mono">
            <span>RECORDE DE STREAK</span>
            <Flame className="h-4 w-4 text-[#D4D4D8]" />
          </div>
          <div className="text-2xl font-black text-[#FAFAFA] font-mono mt-2">
            {maxStreak} <span className="text-xs text-[#A1A1AA] font-normal">dias</span>
          </div>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5">Maior sequência invicta</p>
        </SpotlightCard3D>
      </div>

      {/* BLOCO 2: PÓDIO OLÍMPICO 3D TOP 3 */}
      {standings.length > 0 && (
        <div 
          data-tour="leaderboard-podium-card"
          className="relative z-10 p-6 sm:p-8 rounded-3xl border border-[#27272A] bg-[#0E0E10] overflow-hidden shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-[#27272A] relative z-10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] font-bold block">
                ARENA DE ELITE • PÓDIO OFICIAL
              </span>
              <h2 className="text-xl font-black text-[#FAFAFA] tracking-tight">
                Top 3 Atletas Mais Consistentes
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <span className="text-xs font-mono text-[#A1A1AA] bg-[#18181B] border border-[#27272A] px-3 py-1.5 rounded-full">
                Pontuação Auditada por Câmera & IA
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 items-end max-w-2xl mx-auto pt-8 relative z-10">
            {/* 2º Lugar - Prata */}
            <div className="flex flex-col items-center">
              {top2 ? (
                <>
                  <div className="relative mb-3">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#0E0E10] border-2 border-slate-300/70 p-0.5 shadow-[0_0_25px_rgba(203,213,225,0.2)]">
                      <div className="w-full h-full rounded-[14px] bg-[#000000] flex items-center justify-center font-bold text-[#FAFAFA] overflow-hidden">
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
                  <p className="text-xs sm:text-sm font-bold text-[#FAFAFA] text-center truncate max-w-[120px]">
                    {top2.students?.full_name?.split(' ')[0] || 'Atleta'}
                  </p>
                  <span className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                    {top2.total_points} XP
                  </span>
                  <span className="text-[10px] font-mono text-[#A1A1AA]">
                    {top2.approvedMissions || 0} missões
                  </span>
                  <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-[#000000] via-slate-400/15 to-slate-300/20 border-t border-x border-slate-300/40 mt-3 flex flex-col items-center justify-center">
                    <span className="text-xl font-black font-mono text-slate-200 leading-none">2º</span>
                    <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest mt-1">
                      PRATA
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-24 rounded-t-2xl border border-dashed border-[#27272A] bg-[#18181B]/35 flex items-center justify-center text-xs font-mono text-[#A1A1AA]">
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
                      <div className="w-full h-full bg-[#000000] rounded-[22px] flex items-center justify-center font-black text-[#FAFAFA] overflow-hidden">
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
                  <p className="text-sm sm:text-base font-black text-[#FAFAFA] text-center truncate max-w-[140px]">
                    {top1.students?.full_name?.split(' ')[0] || 'Atleta'}
                  </p>
                  <span className="text-sm font-mono font-black text-amber-300 mt-0.5">
                    {top1.total_points} XP
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/80">
                    {top1.approvedMissions || 0} missões aprovadas
                  </span>
                  <div className="w-full h-32 rounded-t-2xl bg-gradient-to-t from-[#000000] via-amber-500/15 to-amber-400/30 border-t border-x border-amber-400/50 mt-3 flex flex-col items-center justify-center shadow-[inset_0_1px_16px_rgba(251,191,36,0.2)]">
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
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#0E0E10] border-2 border-amber-600/70 p-0.5 shadow-[0_0_20px_rgba(180,83,9,0.2)]">
                      <div className="w-full h-full rounded-[14px] bg-[#000000] flex items-center justify-center font-bold text-[#FAFAFA] overflow-hidden">
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
                  <p className="text-xs sm:text-sm font-bold text-[#FAFAFA] text-center truncate max-w-[120px]">
                    {top3.students?.full_name?.split(' ')[0] || 'Atleta'}
                  </p>
                  <span className="text-xs font-mono font-bold text-amber-500 mt-0.5">
                    {top3.total_points} XP
                  </span>
                  <span className="text-[10px] font-mono text-[#A1A1AA]">
                    {top3.approvedMissions || 0} missões
                  </span>
                  <div className="w-full h-20 rounded-t-2xl bg-gradient-to-t from-[#000000] via-amber-800/15 to-amber-700/25 border-t border-x border-amber-600/45 mt-3 flex flex-col items-center justify-center">
                    <span className="text-lg font-black font-mono text-amber-500 leading-none">3º</span>
                    <span className="text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest mt-1">
                      BRONZE
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-20 rounded-t-2xl border border-dashed border-[#27272A] bg-[#18181B]/35 flex items-center justify-center text-xs font-mono text-[#A1A1AA]">
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
                ? 'bg-[#3478F6] text-white shadow-[0_8px_20px_rgba(52,120,246,0.28)]'
                : 'bg-[#0E0E10] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3478F6]/40'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Individual ({standings.length} alunos)
          </button>
          <button
            onClick={() => setActiveTab('squads')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'squads'
                ? 'bg-[#3478F6] text-white shadow-[0_8px_20px_rgba(52,120,246,0.28)]'
                : 'bg-[#0E0E10] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3478F6]/40'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Squads / Equipes ({squadStandings.length})
          </button>
        </div>

        {activeTab === 'individual' && standings.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar aluno por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-3 text-xs text-[#FAFAFA] placeholder:text-[#A1A1AA]/60 focus:outline-none focus:border-[#3478F6] font-mono"
            />
          </div>
        )}
      </div>

      {/* BLOCO 3: Tabela de Classificação Individual */}
      {activeTab === 'individual' && (
        <Card className="border-[#27272A] bg-[#0E0E10] relative z-10 overflow-hidden rounded-3xl">
          <CardHeader className="pb-4 border-b border-[#27272A]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-[#FAFAFA] font-black tracking-tight">
                  Tabela Geral de Classificação
                </CardTitle>
                <CardDescription className="text-xs text-[#A1A1AA]">
                  Comparativo de XP relativo ao líder, missões validadas e contato rápido via WhatsApp.
                </CardDescription>
              </div>
              <span className="text-[11px] font-mono text-[#A1A1AA]">
                {filteredStandings.length} listados
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredStandings.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Trophy className="h-8 w-8 text-[#D4D4D8] opacity-60 mx-auto" />
                <p className="text-xs font-mono text-[#A1A1AA]">
                  {searchQuery ? 'Nenhum atleta corresponde à busca.' : 'Nenhum aluno pontuou nesta turma ainda.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#27272A]">
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
                      className="p-4 flex items-center justify-between gap-4 hover:bg-[#18181B]/50 transition-colors"
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
                              : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A]'
                          }`}
                        >
                          #{String(rankPos).padStart(2, '0')}
                        </div>

                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center font-bold text-[#FAFAFA] text-xs overflow-hidden shrink-0">
                          {item.students?.avatar_url ? (
                            <img src={item.students.avatar_url} alt={studentName} className="w-full h-full object-cover" />
                          ) : (
                            studentName.charAt(0)
                          )}
                        </div>

                        {/* Nome, Badges & Barra */}
                        <div className="min-w-0 flex-1 max-w-md">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-[#FAFAFA] truncate">{studentName}</p>
                            {rankPos === 1 && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-[#D4D4D8] border border-white/10 uppercase tracking-wider">
                                LÍDER
                              </span>
                            )}
                            {streakDays >= 2 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
                                <Flame className="w-3 h-3 text-[#D4D4D8]" />
                                {streakDays}d streak
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-[#000000] border border-[#27272A] overflow-hidden max-w-[220px]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#2055BD] via-[#3478F6] to-[#75A7FF]"
                                style={{ width: `${pctOfLeader}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-[#A1A1AA] font-mono">
                              {item.approvedMissions || 0}{' '}
                              {item.approvedMissions === 1 ? 'check-in aprovado' : 'check-ins aprovados'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pontos & Ações */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-base font-black font-mono text-[#FAFAFA] block leading-none">
                            {item.total_points} <span className="text-[10px] text-[#A1A1AA] font-bold">XP</span>
                          </span>
                          <span className="text-[10px] text-[#D4D4D8] font-mono flex items-center justify-end gap-1 mt-1">
                            <CheckCircle2 className="h-2.5 w-2.5 text-[#3478F6]" /> Auditado
                          </span>
                        </div>

                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#D4D4D8] hover:bg-[#3478F6]/25 flex items-center gap-1.5 text-xs font-mono font-bold transition-colors"
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
        <Card className="border-[#27272A] bg-[#0E0E10] relative z-10 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-[#27272A]">
            <CardTitle className="text-base text-[#FAFAFA] font-black tracking-tight">
              Classificação dos Squads Cooperativos
            </CardTitle>
            <CardDescription className="text-xs text-[#A1A1AA]">
              Média de pontos de cada equipe para estimular a responsabilidade coletiva.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {squadStandings.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Users className="h-8 w-8 text-[#D4D4D8] opacity-60 mx-auto" />
                <p className="text-xs font-mono text-[#A1A1AA]">Nenhum Squad configurado nesta turma.</p>
                <Link href="/dashboard/squads">
                  <Button size="sm" variant="outline" className="mt-2 text-xs">
                    Configurar Squads
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#27272A]">
                {squadStandings.map((squad, idx) => (
                  <div key={squad.squad_id || idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="h-9 w-9 rounded-xl bg-[#18181B] border border-[#27272A] font-mono text-xs font-black text-[#FAFAFA] flex items-center justify-center">
                        #{String(idx + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#FAFAFA]">{squad.squad_name}</p>
                        <p className="text-[11px] font-mono text-[#A1A1AA]">
                          {squad.total_members} atletas integrantes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-[#FAFAFA] block">
                        {Math.round(squad.squad_average_points || 0)}{' '}
                        <span className="text-[10px] text-[#D4D4D8]">XP Médio</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#A1A1AA]">
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

      {/* Tela Compartilhar Ranking da Turma (Carrossel 9:16 Pódio Top 3 + Lista Top 10) */}
      <ShareRankingSheet
        open={showStoryShare}
        onClose={() => setShowStoryShare(false)}
        challengeId={currentChallenge?.id || selectedChallengeId || null}
        challengeTitle={currentChallenge?.title || 'Desafio Oficial'}
        coachId={coachProfile?.id || null}
        coachBrandName={coachProfile?.brandName || coachProfile?.fullName || null}
        coachLogoUrl={coachProfile?.brandLogoUrl || coachProfile?.avatarUrl || null}
        standings={standings.map((s) => ({
          studentId: s.student_id,
          name: s.students?.full_name || 'Atleta',
          avatarUrl: s.students?.avatar_url || null,
          points: Number(s.total_points || 0),
          streakDays: streaksMap[s.student_id] || 0,
        }))}
        isCoachView={true}
      />
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
