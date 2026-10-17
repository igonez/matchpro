'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  TrendingUp, 
  Flame, 
  Zap, 
  Search, 
  Sparkles, 
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';

export default function LeaderboardPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'individual' | 'squads'>('individual');
  const [standings, setStandings] = useState<any[]>([]);
  const [squadStandings, setSquadStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Gamificação Avançada
  const [rankHistory, setRankHistory] = useState<Record<string, number>>({});
  const [streaksMap, setStreaksMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaderboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let currentChallenge = null;

      if (user) {
        setCurrentUserId(user.id);
        const { data: participation } = await supabase
          .from('challenge_participants')
          .select('challenge_id, challenges(*)')
          .eq('student_id', user.id)
          .in('payment_status', ['paid', 'complimentary'])
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (participation?.challenges) {
          currentChallenge = participation.challenges as any;
        }
      }

      if (currentChallenge) {
        setActiveChallenge(currentChallenge);

        // A. Standings individuais
        const { data: standingsData } = await supabase
          .from('leaderboard_standings')
          .select(`
            id,
            total_points,
            challenge_id,
            student_id,
            students (
              full_name,
              avatar_url
            )
          `)
          .eq('challenge_id', currentChallenge.id)
          .order('total_points', { ascending: false });

        const safeStandings = standingsData || [];
        setStandings(safeStandings);

        // B. Standings de Squads
        const { data: squadsData } = await supabase
          .from('squad_standings')
          .select('*')
          .eq('challenge_id', currentChallenge.id)
          .order('squad_average_points', { ascending: false });

        setSquadStandings(squadsData || []);

        // C. Streaks dos alunos da turma para Badges de Destaque
        const { data: gamifData } = await supabase
          .from('student_gamification_state')
          .select('student_id, current_streak')
          .eq('challenge_id', currentChallenge.id);

        if (gamifData) {
          const map: Record<string, number> = {};
          gamifData.forEach((g: any) => {
            map[g.student_id] = g.current_streak || 0;
          });
          setStreaksMap(map);
        }

        // D. Histórico de Posições (Variação ⬆ / ⬇)
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const { data: historyData } = await supabase
          .from('leaderboard_history')
          .select('student_id, rank_position')
          .eq('challenge_id', currentChallenge.id)
          .eq('recorded_date', yesterday);

        if (historyData && historyData.length > 0) {
          const hMap: Record<string, number> = {};
          historyData.forEach((h: any) => {
            hMap[h.student_id] = h.rank_position;
          });
          setRankHistory(hMap);
        }

        // Salvar snapshot diário da data de hoje
        const todayStr = new Date().toISOString().split('T')[0];
        safeStandings.slice(0, 50).forEach(async (s: any, idx: number) => {
          try {
            await supabase.from('leaderboard_history').upsert({
              challenge_id: currentChallenge.id,
              student_id: s.student_id,
              rank_position: idx + 1,
              total_points: s.total_points,
              recorded_date: todayStr,
            }, { onConflict: 'challenge_id,student_id,recorded_date' });
          } catch (e) {
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
    return max > 2 ? { studentId: topId, streak: max } : null;
  }, [streaksMap]);

  // Cálculo da posição do aluno logado
  const myIndex = currentUserId ? standings.findIndex((s) => s.student_id === currentUserId) : -1;
  const myRank = myIndex >= 0 ? myIndex + 1 : null;
  const myStanding = myIndex >= 0 ? standings[myIndex] : null;
  const nextRankUp = myIndex > 0 ? standings[myIndex - 1] : null;
  const pointsToOvertake =
    myStanding && nextRankUp
      ? Math.max(0, Number(nextRankUp.total_points || 0) - Number(myStanding.total_points || 0))
      : 0;

  // Vantagem sobre o 2º colocado se o aluno for o líder (#1)
  const leadMargin =
    myRank === 1 && standings.length > 1
      ? Math.max(0, Number(standings[0].total_points || 0) - Number(standings[1].total_points || 0))
      : 0;

  // Filtragem por busca
  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return standings;
    const q = searchQuery.toLowerCase();
    return standings.filter((s) => s.students?.full_name?.toLowerCase().includes(q));
  }, [standings, searchQuery]);

  // Helper de Variação de Rank
  const getRankDelta = (studentId: string, currentRankPos: number) => {
    const prevRank = rankHistory[studentId];
    if (prevRank === undefined) return null;
    const diff = prevRank - currentRankPos; // Se era 5 e virou 3 => +2 (subiu)
    if (diff > 0) return { direction: 'up', value: diff };
    if (diff < 0) return { direction: 'down', value: Math.abs(diff) };
    return { direction: 'same', value: 0 };
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-28 relative">
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div className="flex items-center gap-2.5">
          <Link
            href="/app"
            className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Voltar ao Início"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                RANKING OFICIAL
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold">
                AO VIVO
              </span>
            </div>
            <h1 className="text-xl font-black text-white">Classificação da Turma</h1>
            <p className="text-[11px] text-zinc-400">Pontuação computada por integridade de check-ins</p>
          </div>
        </div>
      </div>

      {/* BARRA DE ALVO IMEDIATO / ULTRAPASSAGEM */}
      {!loading && activeTab === 'individual' && myStanding && myRank && (
        <div className="mono-glass-card p-3.5 rounded-2xl border border-white/20 bg-white/[0.04] relative z-10 shadow-[0_0_25px_rgba(255,255,255,0.06)] space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-white text-black flex flex-col items-center justify-center shrink-0 font-mono shadow-md">
                <span className="text-[8px] font-bold uppercase leading-none opacity-70">POS</span>
                <span className="text-xs font-black leading-tight">#{String(myRank).padStart(2, '0')}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white truncate">Sua Posição</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white text-black">
                    VOCÊ
                  </span>
                  {(() => {
                    const delta = getRankDelta(myStanding.student_id, myRank);
                    if (!delta) return null;
                    if (delta.direction === 'up') {
                      return (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1 rounded flex items-center gap-0.5">
                          <ArrowUp className="h-2.5 w-2.5" /> +{delta.value}
                        </span>
                      );
                    }
                    if (delta.direction === 'down') {
                      return (
                        <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1 rounded flex items-center gap-0.5">
                          <ArrowDown className="h-2.5 w-2.5" /> -{delta.value}
                        </span>
                      );
                    }
                    return (
                      <span className="text-[9px] font-mono text-zinc-500 flex items-center">
                        <Minus className="h-2.5 w-2.5" />
                      </span>
                    );
                  })()}
                </div>
                <p className="text-[10px] font-mono text-zinc-300 mt-0.5 truncate flex items-center gap-1">
                  {myRank === 1 ? (
                    <>
                      <Trophy className="h-3 w-3 text-amber-400 shrink-0" />
                      Liderando com vantagem de {leadMargin} pts sobre o 2º!
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3 text-emerald-400 shrink-0" />
                      {pointsToOvertake === 0
                        ? `Empatado com #${myRank - 1} (${nextRankUp?.students?.full_name?.split(' ')[0] || 'Atleta'})`
                        : `Faltam ${pointsToOvertake} pts para ultrapassar #${myRank - 1} (${nextRankUp?.students?.full_name?.split(' ')[0] || 'Atleta'})`}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-mono font-black text-white block leading-none">
                {myStanding.total_points}
              </span>
              <span className="text-[9px] font-mono text-zinc-400 uppercase">PTS</span>
            </div>
          </div>

          {/* Dica de Ação Imediata se não for líder */}
          {myRank > 1 && nextRankUp && (
            <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 text-[10px] font-mono">
                Alvo: <strong className="text-white">{nextRankUp.students?.full_name?.split(' ')[0]}</strong> ({nextRankUp.total_points} pts)
              </span>
              <Link
                href="/app/missions"
                className="text-[10px] font-mono font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
              >
                <span>Fazer Missão</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Destaque da Turma: Líder de Ofensiva */}
      {topStreakStudent && (
        <div className="relative z-10 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-zinc-300 text-[11px]">
              Maior Ofensiva da Turma:
            </span>
          </div>
          <span className="font-bold text-amber-300 text-[11px]">
            🔥 {topStreakStudent.streak} dias consecutivos
          </span>
        </div>
      )}

      {/* Seletor: Individual vs Squads */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-black border border-white/[0.08] relative z-10">
        <button
          onClick={() => setActiveTab('individual')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'individual'
              ? 'bg-zinc-800 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Individual ({standings.length})
        </button>
        <button
          onClick={() => setActiveTab('squads')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'squads'
              ? 'bg-zinc-800 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Squads ({squadStandings.length})
        </button>
      </div>

      {/* Campo de Busca Rápida de Atleta */}
      {activeTab === 'individual' && standings.length > 5 && (
        <div className="relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar atleta pelo nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 font-sans"
            />
          </div>
        </div>
      )}

      {/* PÓDIO 3D DOS TOP 3 COM CORES DE CONQUISTA */}
      {activeTab === 'individual' && !searchQuery && standings.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-2 items-end relative z-10">
          {/* 2º Lugar - Prata Cromada */}
          <div className="mono-glass-card p-3 rounded-2xl text-center space-y-1.5 border-slate-400/20 bg-slate-950/40">
            <span className="text-xs text-slate-300 block font-bold flex items-center justify-center gap-1">
              🥈 2º Prata
            </span>
            <div className="h-11 w-11 mx-auto rounded-full bg-zinc-800 border-2 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.2)] flex items-center justify-center font-bold text-xs text-white overflow-hidden">
              {standings[1]?.students?.avatar_url ? (
                <img src={standings[1].students.avatar_url} alt="2º" className="w-full h-full object-cover" />
              ) : (
                standings[1]?.students?.full_name?.charAt(0) || '2'
              )}
            </div>
            <p className="text-xs font-bold text-white truncate">
              {standings[1]?.students?.full_name?.split(' ')[0]}
              {standings[1]?.student_id === currentUserId ? ' (Você)' : ''}
            </p>
            <p className="text-xs font-mono text-slate-300 font-bold">{standings[1]?.total_points} pts</p>
          </div>

          {/* 1º Lugar - Ouro Radiante */}
          <SpotlightCard3D className="p-4 rounded-3xl text-center space-y-2 -translate-y-2 border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-black to-black shadow-[0_0_35px_rgba(245,158,11,0.25)]">
            <span className="text-xs text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40 inline-flex items-center gap-1 font-bold">
              👑 1º Líder
            </span>
            <div className="h-14 w-14 mx-auto rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <div className="h-full w-full bg-black rounded-full flex items-center justify-center font-bold text-white text-sm overflow-hidden">
                {standings[0]?.students?.avatar_url ? (
                  <img src={standings[0].students.avatar_url} alt="1º" className="w-full h-full object-cover" />
                ) : (
                  standings[0]?.students?.full_name?.charAt(0) || '1'
                )}
              </div>
            </div>
            <p className="text-xs font-black text-white truncate">
              {standings[0]?.students?.full_name?.split(' ')[0]}
              {standings[0]?.student_id === currentUserId ? ' (Você)' : ''}
            </p>
            <p className="text-sm font-mono font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
              {standings[0]?.total_points} pts
            </p>
          </SpotlightCard3D>

          {/* 3º Lugar - Bronze Cobre */}
          <div className="mono-glass-card p-3 rounded-2xl text-center space-y-1.5 border-amber-700/20 bg-stone-950/40">
            <span className="text-xs text-amber-600 block font-bold flex items-center justify-center gap-1">
              🥉 3º Bronze
            </span>
            <div className="h-11 w-11 mx-auto rounded-full bg-zinc-900 border-2 border-amber-700/60 shadow-[0_0_15px_rgba(180,83,9,0.2)] flex items-center justify-center font-bold text-xs text-white overflow-hidden">
              {standings[2]?.students?.avatar_url ? (
                <img src={standings[2].students.avatar_url} alt="3º" className="w-full h-full object-cover" />
              ) : (
                standings[2]?.students?.full_name?.charAt(0) || '3'
              )}
            </div>
            <p className="text-xs font-bold text-white truncate">
              {standings[2]?.students?.full_name?.split(' ')[0]}
              {standings[2]?.student_id === currentUserId ? ' (Você)' : ''}
            </p>
            <p className="text-xs font-mono text-amber-600 font-bold">{standings[2]?.total_points} pts</p>
          </div>
        </div>
      )}

      {/* Lista Restante de Classificação */}
      <div className="space-y-2 relative z-10 pt-1">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            SINCRONIZANDO PLACAR...
          </div>
        ) : activeTab === 'individual' ? (
          filteredStandings.length === 0 ? (
            <div className="mono-glass-card p-8 rounded-3xl text-center text-xs font-mono text-zinc-500">
              {searchQuery ? 'Nenhum atleta encontrado com esse nome.' : 'Nenhuma pontuação computada ainda.'}
            </div>
          ) : (
            (searchQuery ? filteredStandings : filteredStandings.slice(standings.length >= 3 ? 3 : 0)).map((item, idx) => {
              const actualRank = searchQuery
                ? standings.findIndex((s) => s.id === item.id) + 1
                : (standings.length >= 3 ? 3 : 0) + idx + 1;
              const isMe = item.student_id === currentUserId;
              const delta = getRankDelta(item.student_id, actualRank);
              const athleteStreak = streaksMap[item.student_id] || 0;

              return (
                <div
                  key={item.id}
                  className={`mono-glass-card p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                    isMe ? 'border-white/35 bg-white/[0.06] shadow-[0_0_20px_rgba(255,255,255,0.08)]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1 shrink-0 w-8">
                      <span className={`font-mono text-xs text-center font-bold ${isMe ? 'text-white' : 'text-zinc-500'}`}>
                        #{String(actualRank).padStart(2, '0')}
                      </span>
                    </div>

                    <div className={`h-8 w-8 rounded-full bg-zinc-900 border flex items-center justify-center font-mono font-bold text-xs text-white overflow-hidden shrink-0 ${isMe ? 'border-white/40' : 'border-white/10'}`}>
                      {item.students?.avatar_url ? (
                        <img src={item.students.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        item.students?.full_name?.charAt(0) || 'A'
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-white truncate max-w-[120px]">
                          {item.students?.full_name || 'Atleta'}
                        </p>
                        {isMe && (
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white text-black shrink-0">
                            VOCÊ
                          </span>
                        )}
                        {athleteStreak >= 3 && (
                          <span className="text-[9px] font-mono text-amber-300 flex items-center shrink-0">
                            🔥{athleteStreak}d
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Indicador de Variação de Rank ⬆ / ⬇ */}
                    {delta && delta.direction === 'up' && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center">
                        <ArrowUp className="h-3 w-3" />+{delta.value}
                      </span>
                    )}
                    {delta && delta.direction === 'down' && (
                      <span className="text-[10px] font-mono font-bold text-rose-400 flex items-center">
                        <ArrowDown className="h-3 w-3" />-{delta.value}
                      </span>
                    )}

                    <span className="font-mono text-xs font-bold text-white">
                      {item.total_points} PTS
                    </span>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* TAB DE SQUADS */
          squadStandings.length === 0 ? (
            <div className="mono-glass-card p-8 rounded-3xl text-center text-xs font-mono text-zinc-500">
              Nenhum esquadrão configurado no desafio ativo.
            </div>
          ) : (
            squadStandings.map((squad, index) => (
              <div
                key={squad.squad_id}
                className="mono-glass-card p-4 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-zinc-500 w-5 text-center font-bold">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{squad.squad_name}</h4>
                    <p className="text-[10px] font-mono text-zinc-500">
                      {squad.total_members ?? squad.member_count ?? 0} membros • Média: {Math.round(squad.squad_average_points)} pts
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-white">
                    {squad.squad_total_points} PTS
                  </span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
