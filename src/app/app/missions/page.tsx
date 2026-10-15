'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { useWorkoutSession } from '@/lib/workout-session-context';

export default function StudentMissionsWeeklyPage() {
  const supabase = createClient();
  const { activeSession, startSession } = useWorkoutSession();

  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [todaySubmissions, setTodaySubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Relógio em tempo real até 23:59:59 (meia-noite)
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>('');

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diffMs = midnight.getTime() - now.getTime();

      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeUntilMidnight(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } else {
        setTimeUntilMidnight('00:00:00');
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Carregar semanas e submissões
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let challengeId: string | null = null;
        const { data: part } = await supabase
          .from('challenge_participants')
          .select('challenge_id')
          .eq('student_id', user.id)
          .limit(1)
          .maybeSingle();

        challengeId = part?.challenge_id || null;
        setCurrentChallengeId(challengeId);

        if (!challengeId) {
          setWeeks([]);
          setLoading(false);
          return;
        }

        const { data: weeksData } = await supabase
          .from('challenge_weeks')
          .select('*')
          .eq('challenge_id', challengeId)
          .order('week_number', { ascending: true });

        if (weeksData && weeksData.length > 0) {
          setWeeks(weeksData);
          setSelectedWeekId(weeksData[0].id);
        }

        const { data: allSubmissionsData } = await supabase
          .from('student_submissions')
          .select('*, missions(category, requires_cooldown, cooldown_hours)')
          .eq('student_id', user.id);

        if (allSubmissionsData) {
          const map: Record<string, any> = {};
          const todayList: any[] = [];
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          allSubmissionsData.forEach((s: any) => {
            map[s.mission_id] = s;
            const subTime = new Date(s.submitted_at || s.client_captured_at);
            if (subTime >= startOfToday) {
              todayList.push(s);
            }
          });

          setSubmissions(map);
          setTodaySubmissions(todayList);
        }
      } catch (err) {
        console.error('Erro ao carregar semanas do aluno:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  // 2. Carregar missões da semana ativa
  useEffect(() => {
    if (!selectedWeekId) {
      async function loadAllMissions() {
        const { data } = await supabase
          .from('missions')
          .select('*')
          .order('order_index', { ascending: true })
          .order('points_rewarded', { ascending: false });
        setMissions(data || []);
      }
      loadAllMissions();
      return;
    }

    async function loadWeeklyMissions() {
      const { data } = await supabase
        .from('missions')
        .select('*')
        .eq('week_id', selectedWeekId)
        .order('order_index', { ascending: true })
        .order('points_rewarded', { ascending: false });

      let result = data || [];

      // Fallback: Se não houver missões associadas a esta week_id, buscar pelo challenge_id
      if (result.length === 0 && currentChallengeId) {
        const { data: directData } = await supabase
          .from('missions')
          .select('*')
          .eq('challenge_id', currentChallengeId)
          .order('order_index', { ascending: true })
          .order('points_rewarded', { ascending: false });

        if (directData && directData.length > 0) {
          result = directData;
        }
      }

      setMissions(result);
    }

    loadWeeklyMissions();
  }, [selectedWeekId, supabase]);

  // Limite biológico: 1 Treino e 1 Cardio por dia
  const todayWorkoutCount = useMemo(() => {
    return todaySubmissions.filter((s: any) => s.missions?.category === 'treino').length;
  }, [todaySubmissions]);

  const todayCardioCount = useMemo(() => {
    return todaySubmissions.filter((s: any) => s.missions?.category === 'cardio').length;
  }, [todaySubmissions]);

  const isWorkoutDailyLocked = todayWorkoutCount >= 1;
  const isCardioDailyLocked = todayCardioCount >= 1;

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);
  const completedMissionsCount = missions.filter((m) => submissions[m.id]?.status === 'approved').length;
  const isWeekComplete = missions.length > 0 && completedMissionsCount === missions.length;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'treino':
        return (
          <span className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium flex items-center gap-1">
            <span>⚡</span> Treino (1/dia)
          </span>
        );
      case 'cardio':
        return (
          <span className="text-xs text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 font-medium flex items-center gap-1">
            <span>🏃</span> Cardio (1/dia)
          </span>
        );
      case 'refeicao':
        return (
          <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-medium flex items-center gap-1">
            <span>🥗</span> Refeição
          </span>
        );
      case 'habito':
        return (
          <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 font-medium flex items-center gap-1">
            <span>💧</span> Hábito
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-28 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div>
          <span className="text-[11px] text-zinc-400 font-medium block">
            Missões
          </span>
          <h1 className="text-xl font-black text-white">Missões por Semana</h1>
          <p className="text-xs text-zinc-400">Limite de 1 treino e 1 cardio por dia para disciplina real</p>
        </div>
      </div>

      {/* Banner de Regra Diária (Current Day) */}
      {(isWorkoutDailyLocked || isCardioDailyLocked) && (
        <div className="mono-glass-card p-4 rounded-2xl flex items-center justify-between text-xs relative z-10 border border-white/15">
          <div className="space-y-1">
            <p className="font-bold text-white text-xs">
              {isWorkoutDailyLocked && isCardioDailyLocked
                ? 'Limite do dia atingido (Treino & Cardio)'
                : isWorkoutDailyLocked
                ? 'Treino do dia concluído'
                : 'Cardio do dia concluído'}
            </p>
            <p className="text-xs text-zinc-400">
              Missão de hoje entregue. A próxima será liberada na <span className="text-white font-semibold">virada do dia</span>.
            </p>
          </div>
          <span className="text-xs text-zinc-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-lg shrink-0 font-medium">
            1 por dia
          </span>
        </div>
      )}

      {/* Seletor de Semanas em Pílulas */}
      {weeks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative z-10">
          {weeks.map((week) => {
            const isSelected = week.id === selectedWeekId;
            return (
              <button
                key={week.id}
                onClick={() => setSelectedWeekId(week.id)}
                className={`px-4 py-2 rounded-2xl border text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'border-white/40 bg-white/15 text-white shadow-lg'
                    : 'border-white/[0.08] bg-black/60 text-zinc-400 hover:text-white'
                }`}
              >
                Semana {week.week_number}
              </button>
            );
          })}
        </div>
      )}

      {/* Card da Meta de Bônus da Semana */}
      {selectedWeek && (
        <SpotlightCard3D className="p-4 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">
              Bônus Semanal (+{selectedWeek.bonus_points || 20} pts)
            </span>
            <span className="text-xs text-white font-bold font-mono">
              {completedMissionsCount}/{missions.length} Feitas
            </span>
          </div>

          <p className="text-xs text-zinc-300">
            {isWeekComplete
              ? `Semana 100% batida! Bônus de +${selectedWeek.bonus_points || 20} pontos computado.`
              : `Complete todas as missões para destravar +${selectedWeek.bonus_points || 20} pontos extras.`}
          </p>

          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/10 mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isWeekComplete
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                  : 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
              }`}
              style={{
                width: `${missions.length > 0 ? (completedMissionsCount / missions.length) * 100 : 0}%`,
              }}
            />
          </div>
        </SpotlightCard3D>
      )}

      {/* Lista das Missões */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono relative z-10">
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          CARREGANDO MISSÕES...
        </div>
      ) : missions.length === 0 ? (
        <div className="mono-glass-card p-8 rounded-3xl text-center text-xs font-mono text-zinc-500 relative z-10">
          Nenhuma missão cadastrada nesta semana.
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {missions.map((mission, index) => {
            const sub = submissions[mission.id];
            const isApproved = sub?.status === 'approved';
            const isPending = sub?.status === 'pending';

            const isDailyLocked = 
              !isApproved && !isPending && (
                (mission.category === 'treino' && isWorkoutDailyLocked) ||
                (mission.category === 'cardio' && isCardioDailyLocked)
              );

            const isPreviousUnfinished = 
              !isApproved && !isPending && (mission.category === 'treino' || mission.category === 'cardio') &&
              index > 0 &&
              missions[index - 1]?.category === mission.category &&
              !submissions[missions[index - 1]?.id];

            const isLocked = isDailyLocked || isPreviousUnfinished;

            return (
              <div
                key={mission.id}
                className={`mono-glass-card p-4 rounded-2xl transition-all ${
                  isApproved ? 'border-white/30 bg-white/[0.04]' : isLocked ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{mission.title}</span>
                      {mission.is_bonus && (
                        <span className="text-[9px] font-mono text-white border border-white/20 px-1.5 py-0.2 rounded">
                          BÔNUS
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {getCategoryBadge(mission.category)}
                      <span className="text-[10px] font-mono text-zinc-400">
                        +{mission.points_rewarded} PTS
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isApproved && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold block flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Concluído
                      </span>
                    )}

                    {isPending && (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium block">
                        Em análise...
                      </span>
                    )}

                    {!sub && isLocked && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2.5 py-1 rounded-xl bg-black border border-white/10 text-zinc-500 text-xs font-medium">
                          Bloqueado
                        </span>
                        {isDailyLocked ? (
                          <span className="text-[11px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            Libera amanhã
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500">
                            Faça o anterior
                          </span>
                        )}
                      </div>
                    )}

                    {!sub && !isLocked && (
                      mission.category === 'treino' || mission.category === 'cardio' ? (
                        activeSession?.missionId === mission.id ? (
                          <span className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs animate-pulse block">
                            Treinando...
                          </span>
                        ) : (
                          <button
                            onClick={() => startSession(mission.id, mission.title, mission.category)}
                            className="mono-button-primary px-3.5 py-1.5 text-xs font-semibold"
                          >
                            {mission.category === 'treino' ? 'Iniciar Treino' : 'Iniciar Cardio'}
                          </button>
                        )
                      ) : (
                        <Link href={`/app/camera/${mission.id}`}>
                          <button className="mono-button-primary px-3.5 py-1.5 text-xs font-semibold">
                            Registrar Foto
                          </button>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
