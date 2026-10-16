'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { useWorkoutSession } from '@/lib/workout-session-context';
import { Clock, CheckCircle2, Lock, ChevronDown, ChevronUp } from 'lucide-react';

export default function StudentMissionsWeeklyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500 text-xs font-mono">CARREGANDO MISSÕES...</div>}>
      <StudentMissionsContent />
    </Suspense>
  );
}

function StudentMissionsContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const { activeSession, startSession } = useWorkoutSession();

  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [todaySubmissions, setTodaySubmissions] = useState<any[]>([]);
  const [showCompletedSection, setShowCompletedSection] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const catParam = searchParams.get('cat');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

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

  // 2. Carregar missões da semana ativa (sempre filtradas pelo challenge_id do aluno)
  useEffect(() => {
    if (!currentChallengeId) return;

    async function loadWeeklyMissions() {
      let result: any[] = [];
      if (selectedWeekId) {
        const { data } = await supabase
          .from('missions')
          .select('*')
          .eq('week_id', selectedWeekId)
          .order('order_index', { ascending: true })
          .order('points_rewarded', { ascending: false });
        result = data || [];
      }

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
  }, [selectedWeekId, currentChallengeId, supabase]);

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

  // Enriquecer missões com status de bloqueio para agrupamento inteligente
  const processedMissions = useMemo(() => {
    // Rastrear índice por categoria para saber se a anterior da mesma categoria foi feita
    const lastSubStatusByCategory: Record<string, boolean> = {};

    return missions.map((mission) => {
      const sub = submissions[mission.id];
      const isApproved = sub?.status === 'approved';
      const isPending = sub?.status === 'pending';

      const isDailyLocked =
        !isApproved &&
        !isPending &&
        ((mission.category === 'treino' && isWorkoutDailyLocked) ||
          (mission.category === 'cardio' && isCardioDailyLocked));

      const hadPreviousUnfinished =
        !isApproved &&
        !isPending &&
        (mission.category === 'treino' || mission.category === 'cardio') &&
        lastSubStatusByCategory[mission.category] === false;

      if (mission.category === 'treino' || mission.category === 'cardio') {
        if (lastSubStatusByCategory[mission.category] === undefined) {
          lastSubStatusByCategory[mission.category] = Boolean(sub);
        } else if (!sub) {
          lastSubStatusByCategory[mission.category] = false;
        }
      }

      const isLocked = isDailyLocked || hadPreviousUnfinished;

      return {
        ...mission,
        sub,
        isApproved,
        isPending,
        isDailyLocked,
        isPreviousUnfinished: hadPreviousUnfinished,
        isLocked,
      };
    });
  }, [missions, submissions, isWorkoutDailyLocked, isCardioDailyLocked]);

  const filteredMissions = useMemo(() => {
    if (selectedCategory === 'all') return processedMissions;
    return processedMissions.filter((m) => m.category === selectedCategory);
  }, [processedMissions, selectedCategory]);

  const availableMissions = filteredMissions.filter((m) => !m.isApproved && !m.isPending && !m.isLocked);
  const lockedOrPendingMissions = filteredMissions.filter((m) => m.isPending || (!m.isApproved && m.isLocked));
  const completedMissions = filteredMissions.filter((m) => m.isApproved);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'treino':
        return (
          <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium flex items-center gap-1">
            <span>⚡</span> Treino (1/dia)
          </span>
        );
      case 'cardio':
        return (
          <span className="text-[11px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 font-medium flex items-center gap-1">
            <span>🏃</span> Cardio (1/dia)
          </span>
        );
      case 'refeicao':
        return (
          <span className="text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-medium flex items-center gap-1">
            <span>🥗</span> Refeição
          </span>
        );
      case 'habito':
        return (
          <span className="text-[11px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 font-medium flex items-center gap-1">
            <span>💧</span> Hábito
          </span>
        );
      default:
        return null;
    }
  };

  const renderMissionCard = (mission: any) => (
    <div
      key={mission.id}
      className={`mono-glass-card p-4 rounded-2xl transition-all ${
        mission.isApproved
          ? 'border-emerald-500/25 bg-emerald-950/10'
          : mission.isLocked
          ? 'opacity-65 border-white/5'
          : 'border-white/15 hover:border-white/35'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs text-white">{mission.title}</span>
            {mission.is_bonus && (
              <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded">
                ★ BÔNUS
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {getCategoryBadge(mission.category)}
            <span className="text-[10px] font-mono font-bold text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              +{mission.points_rewarded} PTS
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {mission.isApproved && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Concluído
            </span>
          )}

          {mission.isPending && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium block">
              Em análise...
            </span>
          )}

          {!mission.sub && mission.isLocked && (
            <div className="flex flex-col items-end gap-1">
              <span className="px-2.5 py-1 rounded-xl bg-black border border-white/10 text-zinc-400 text-[11px] font-mono flex items-center gap-1">
                <Lock className="h-3 w-3" /> Bloqueado
              </span>
              {mission.isDailyLocked ? (
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  ⏱ {timeUntilMidnight || 'Amanhã'}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-500">
                  Conclua a anterior
                </span>
              )}
            </div>
          )}

          {!mission.sub && !mission.isLocked && (
            mission.category === 'treino' || mission.category === 'cardio' ? (
              activeSession?.missionId === mission.id ? (
                <span className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs animate-pulse block">
                  Treinando...
                </span>
              ) : (
                <button
                  onClick={() => startSession(mission.id, mission.title, mission.category)}
                  className="mono-button-primary px-3.5 py-2 text-xs font-bold"
                >
                  {mission.category === 'treino' ? 'Iniciar Treino' : 'Iniciar Cardio'}
                </button>
              )
            ) : (
              <Link href={`/app/camera/${mission.id}`}>
                <button className="mono-button-primary px-3.5 py-2 text-xs font-bold">
                  Registrar Foto
                </button>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-28 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div>
          <span className="text-[11px] text-zinc-400 font-medium block">
            Cronograma de Tarefas
          </span>
          <h1 className="text-xl font-black text-white">Missões da Turma</h1>
          <p className="text-xs text-zinc-400">Limite biológico de 1 treino e 1 cardio por dia</p>
        </div>
      </div>

      {/* Banner de Regra Diária com Cronômetro Regressivo até 00:00 */}
      {(isWorkoutDailyLocked || isCardioDailyLocked) && (
        <div className="mono-glass-card p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs relative z-10 border border-amber-500/25 bg-amber-950/10">
          <div className="space-y-0.5">
            <p className="font-bold text-white text-xs">
              {isWorkoutDailyLocked && isCardioDailyLocked
                ? '✓ Treino & Cardio de hoje concluídos!'
                : isWorkoutDailyLocked
                ? '✓ Treino de hoje concluído!'
                : '✓ Cardio de hoje concluído!'}
            </p>
            <p className="text-[11px] text-zinc-400">
              Próxima liberação automática na virada do dia.
            </p>
          </div>
          <div className="text-right shrink-0 bg-black/60 border border-white/10 px-2.5 py-1.5 rounded-xl">
            <span className="text-[9px] font-mono text-zinc-400 uppercase block">Libera em</span>
            <span className="text-xs font-mono font-black text-amber-300 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {timeUntilMidnight || '00:00:00'}
            </span>
          </div>
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

      {/* Abas de Filtro por Categoria */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none relative z-10">
        {[
          { id: 'all', label: `Todas (${processedMissions.length})` },
          { id: 'treino', label: '⚡ Treinos' },
          { id: 'cardio', label: '🏃 Cardios' },
          { id: 'refeicao', label: '🥗 Refeições' },
          { id: 'habito', label: '💧 Hábitos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
              selectedCategory === tab.id
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Card da Meta de Bônus da Semana */}
      {selectedWeek && (
        <SpotlightCard3D className="p-4 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">
              Progresso da Semana (+{selectedWeek.bonus_points || 20} pts bônus)
            </span>
            <span className="text-xs text-white font-bold font-mono">
              {completedMissionsCount}/{missions.length} Concluídas
            </span>
          </div>

          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/10">
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

      {/* Lista Organizada por Status */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono relative z-10">
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          CARREGANDO MISSÕES...
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="mono-glass-card p-8 rounded-3xl text-center text-xs font-mono text-zinc-500 relative z-10">
          Nenhuma missão encontrada nesta categoria.
        </div>
      ) : (
        <div className="space-y-5 relative z-10">
          {/* SEÇÃO 1: DISPONÍVEIS AGORA */}
          {availableMissions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  ● Disponíveis para Hoje ({availableMissions.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {availableMissions.map(renderMissionCard)}
              </div>
            </div>
          )}

          {/* SEÇÃO 2: PRÓXIMAS DA SEMANA / BLOQUEADAS */}
          {lockedOrPendingMissions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Próximas da Semana / Aguardando Virada ({lockedOrPendingMissions.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {lockedOrPendingMissions.map(renderMissionCard)}
              </div>
            </div>
          )}

          {/* SEÇÃO 3: CONCLUÍDAS (COLAPSÁVEL) */}
          {completedMissions.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowCompletedSection((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white"
              >
                <span>✓ Concluídas na Semana ({completedMissions.length})</span>
                {showCompletedSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showCompletedSection && (
                <div className="space-y-2.5">
                  {completedMissions.map(renderMissionCard)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
