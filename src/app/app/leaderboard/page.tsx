'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
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
      if (!user) return;
      setCurrentUserId(user.id);

      // 1. Identificar turma do atleta
      const { data: participation } = await supabase
        .from('challenge_participants')
        .select('challenge_id, challenges(*)')
        .eq('student_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (participation?.challenges) {
        setCurrentChallenge(participation.challenges);

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
          .eq('challenge_id', currentChallenge.id)
          .order('total_points', { ascending: false });

        const safeStandings: LeaderboardItem[] = standingsData || [];
        setStandings(safeStandings);

        // B. Ranking de Squads
        const { data: squadsData } = await supabase
          .from('squads')
          .select('id, name, color')
          .eq('challenge_id', currentChallenge.id);

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
              color: sq.color || '#3b82f6',
              total_points: totalPoints,
              member_count: memberCount,
              average_points: averagePoints,
            };
          });

          computedSquads.sort((a, b) => b.total_points - a.total_points);
          setSquadStandings(computedSquads);
        }

        // C. Streaks dos Alunos
        const { data: gamifData } = await supabase
          .from('student_gamification_state')
          .select('student_id, current_streak')
          .eq('challenge_id', currentChallenge.id);

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
          .eq('challenge_id', currentChallenge.id)
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

  const getRankDelta = (studentId: string, currentRankPos: number) => {
    const prevRank = rankHistory[studentId];
    if (prevRank === undefined) return null;
    const diff = prevRank - currentRankPos;
    if (diff > 0) return { direction: 'up', value: diff };
    if (diff < 0) return { direction: 'down', value: Math.abs(diff) };
    return { direction: 'same', value: 0 };
  };

  return (
    <div className="flex flex-col flex-1 p-5 space-y-6 max-w-md mx-auto w-full pb-32 relative">
      <Monochrome3DBackground />

      {/* Header Editorial */}
      <div className="flex items-center justify-between pt-2 relative z-10 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              RANKING OFICIAL
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              AO VIVO
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Classificação da Turma</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Pontuação auditada por integridade de check-ins.</p>
        </div>
        <Link
          href="/app"
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          VOLTAR
        </Link>
      </div>

      {/* Barra de Alvo Imediato */}
      {!loading && activeTab === 'individual' && myStanding && myRank && (
        <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950 relative z-10 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-white text-black flex flex-col items-center justify-center shrink-0 font-mono">
                <span className="text-[8px] font-bold uppercase leading-none opacity-60">POS</span>
                <span className="text-sm font-black leading-tight">#{String(myRank).padStart(2, '0')}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Sua Classificação</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                    VOCÊ
                  </span>
                  {(() => {
                    const delta = getRankDelta(myStanding.student_id, myRank);
                    if (!delta) return null;
                    if (delta.direction === 'up') {
                      return (
                        <span className="text-[9px] font-mono font-bold text-emerald-400">
                          +{delta.value}
                        </span>
                      );
                    }
                    if (delta.direction === 'down') {
                      return (
                        <span className="text-[9px] font-mono font-bold text-rose-400">
                          -{delta.value}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mt-1">
                  {myRank === 1 ? (
                    `Liderando com vantagem de ${leadMargin} pts sobre o 2º colocado.`
                  ) : (
                    pointsToOvertake === 0
                      ? `Empatado com #${myRank - 1} (${nextRankUp?.students?.full_name?.split(' ')[0] || 'Atleta'})`
                      : `Faltam ${pointsToOvertake} pts para alcançar #${myRank - 1} (${nextRankUp?.students?.full_name?.split(' ')[0] || 'Atleta'})`
                  )}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-base font-mono font-black text-white block leading-none">
                {myStanding.total_points}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5 block">
                PONTOS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Destaque de Ofensiva */}
      {topStreakStudent && (
        <div className="relative z-10 px-4 py-3 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
            MAIOR OFENSIVA DA TURMA
          </span>
          <span className="font-bold text-white text-[11px]">
            {topStreakStudent.streak} DIAS CONSECUTIVOS
          </span>
        </div>
      )}

      {/* Seletor Segmented: Individual vs Squads */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-950 border border-white/10 relative z-10">
        <button
          onClick={() => setActiveTab('individual')}
          className={`py-2 text-xs font-mono tracking-wider transition-all cursor-pointer ${
            activeTab === 'individual'
              ? 'bg-white text-black font-black rounded-lg'
              : 'text-zinc-400 hover:text-white font-medium'
          }`}
        >
          INDIVIDUAL ({standings.length})
        </button>
        <button
          onClick={() => setActiveTab('squads')}
          className={`py-2 text-xs font-mono tracking-wider transition-all cursor-pointer ${
            activeTab === 'squads'
              ? 'bg-white text-black font-black rounded-lg'
              : 'text-zinc-400 hover:text-white font-medium'
          }`}
        >
          SQUADS ({squadStandings.length})
        </button>
      </div>

      {/* Busca Rápida */}
      {activeTab === 'individual' && standings.length > 5 && (
        <div className="relative z-10">
          <input
            type="text"
            placeholder="Buscar atleta pelo nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 font-mono transition-colors"
          />
        </div>
      )}

      {/* Pódio Editorial dos Top 3 */}
      {activeTab === 'individual' && !searchQuery && standings.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 pt-2 items-end relative z-10">
          {/* 2º Lugar */}
          <div className="p-3.5 rounded-2xl text-center space-y-2 border border-white/10 bg-zinc-950">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block font-bold">
              02 • PRATA
            </span>
            <div className="h-12 w-12 mx-auto rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center font-bold text-xs text-white overflow-hidden">
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
            <p className="text-xs font-mono text-zinc-400 font-bold">{standings[1]?.total_points} PTS</p>
          </div>

          {/* 1º Lugar */}
          <div className="p-4 rounded-3xl text-center space-y-2.5 -translate-y-2 border border-white/30 bg-zinc-900 shadow-2xl">
            <span className="text-[10px] font-mono tracking-widest text-black bg-white px-2 py-0.5 rounded-md inline-block font-black uppercase">
              01 • LÍDER
            </span>
            <div className="h-14 w-14 mx-auto rounded-full bg-zinc-800 border-2 border-white p-0.5">
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
            <p className="text-sm font-mono font-black text-white">
              {standings[0]?.total_points} PTS
            </p>
          </div>

          {/* 3º Lugar */}
          <div className="p-3.5 rounded-2xl text-center space-y-2 border border-white/10 bg-zinc-950">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block font-bold">
              03 • BRONZE
            </span>
            <div className="h-12 w-12 mx-auto rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center font-bold text-xs text-white overflow-hidden">
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
            <p className="text-xs font-mono text-zinc-400 font-bold">{standings[2]?.total_points} PTS</p>
          </div>
        </div>
      )}

      {/* Lista Restante */}
      <div className="space-y-2.5 relative z-10 pt-1">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-zinc-500 uppercase tracking-widest">
            SINCRONIZANDO CLASSIFICAÇÃO...
          </div>
        ) : activeTab === 'individual' ? (
          filteredStandings.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/5 bg-zinc-950 text-center text-xs font-mono text-zinc-500">
              {searchQuery ? 'NENHUM ATLETA ENCONTRADO.' : 'NENHUMA PONTUAÇÃO COMPUTADA.'}
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
                  className={`p-3.5 rounded-2xl border bg-zinc-950 flex items-center justify-between transition-all ${
                    isMe ? 'border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`font-mono text-xs font-bold w-7 shrink-0 ${isMe ? 'text-white' : 'text-zinc-500'}`}>
                      #{String(actualRank).padStart(2, '0')}
                    </span>

                    <div className="h-8 w-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white overflow-hidden shrink-0">
                      {item.students?.avatar_url ? (
                        <img src={item.students.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        item.students?.full_name?.charAt(0) || 'A'
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-white truncate max-w-[130px]">
                          {item.students?.full_name || 'Atleta'}
                        </p>
                        {isMe && (
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white text-black shrink-0">
                            VOCÊ
                          </span>
                        )}
                        {athleteStreak >= 3 && (
                          <span className="text-[9px] font-mono text-zinc-400 shrink-0">
                            {athleteStreak}D
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {delta && delta.direction === 'up' && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        +{delta.value}
                      </span>
                    )}
                    {delta && delta.direction === 'down' && (
                      <span className="text-[10px] font-mono font-bold text-rose-400">
                        -{delta.value}
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
          /* Ranking de Squads */
          squadStandings.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/5 bg-zinc-950 text-center text-xs font-mono text-zinc-500">
              NENHUM SQUAD ATIVO NESTA TURMA.
            </div>
          ) : (
            squadStandings.map((sq, idx) => (
              <div
                key={sq.id}
                className="p-4 rounded-2xl border border-white/10 bg-zinc-950 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-zinc-500 w-7">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white">{sq.name}</h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">
                      {sq.member_count} INTEGRANTES • MÉDIA {sq.average_points} PTS
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-black text-white">
                  {sq.total_points} PTS
                </span>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
