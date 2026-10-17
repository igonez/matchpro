'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { useWorkoutSession } from '@/lib/workout-session-context';
import { Clock, CheckCircle2, Lock, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

export default function StudentMissionsWeeklyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500 text-xs font-mono">CARREGANDO MISSÕES...</div>}>
      <StudentMissionsContent />
    </Suspense>
  );
}

function StudentMissionsContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';
  const { activeSession, startSession } = useWorkoutSession();

  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [missionLists, setMissionLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>(searchParams.get('list') || 'all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [todaySubmissions, setTodaySubmissions] = useState<any[]>([]);
  const [showCompletedSection, setShowCompletedSection] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const catParam = searchParams.get('cat');
    const listParam = searchParams.get('list');
    if (listParam) {
      setSelectedListId(listParam);
      setSelectedCategory('all');
    } else if (catParam) {
      setSelectedCategory(catParam);
      setSelectedListId('all');
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
          .in('payment_status', ['paid', 'complimentary'])
          .order('joined_at', { ascending: false })
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

        const { data: cLists } = await supabase
          .from('challenge_mission_lists')
          .select('*')
          .eq('challenge_id', challengeId)
          .order('order_index', { ascending: true });

        if (cLists && cLists.length > 0) {
          setMissionLists(cLists);
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
    if (selectedListId !== 'all') {
      return processedMissions.filter((m) => m.list_id === selectedListId);
    }
    if (selectedCategory !== 'all') {
      return processedMissions.filter((m) => m.category === selectedCategory);
    }
    return processedMissions;
  }, [processedMissions, selectedCategory, selectedListId]);

  const availableMissions = filteredMissions.filter((m) => !m.isApproved && !m.isPending && !m.isLocked);
  const lockedOrPendingMissions = filteredMissions.filter((m) => m.isPending || (!m.isApproved && m.isLocked));
  const completedMissions = filteredMissions.filter((m) => m.isApproved);

  const getCategoryBadge = (mission: any) => {
    if (mission.list_id && missionLists.length > 0) {
      const list = missionLists.find((l) => l.id === mission.list_id);
      if (list) {
        return (
          <span className="text-[11px] text-zinc-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 font-medium flex items-center gap-1">
            <span>{list.icon || '🎯'}</span> {list.name}
          </span>
        );
      }
    }

    switch (mission.category) {
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

  const handleSimpleCheckin = async (mission: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newSub = {
        id: `temp-${Date.now()}`,
        mission_id: mission.id,
        student_id: user.id,
        status: 'approved',
        submitted_at: new Date().toISOString(),
        client_captured_at: new Date().toISOString(),
        missions: { category: mission.category },
      };

      setSubmissions((prev) => ({ ...prev, [mission.id]: newSub }));
      setTodaySubmissions((prev) => [...prev, newSub]);
      showToast(`✓ "${mission.title}" concluída! +${mission.points_rewarded} XP`);

      const { data, error } = await supabase.from('student_submissions').insert({
        mission_id: mission.id,
        student_id: user.id,
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        client_captured_at: new Date().toISOString(),
      }).select().single();

      if (error) {
        console.warn('Submissão gravada localmente com fallback:', error.message);
      } else if (data) {
        setSubmissions((prev) => ({ ...prev, [mission.id]: data }));
      }
    } catch (err: any) {
      console.error('Erro no check-in 1-toque:', err);
      showToast('✓ Check-in concluído!');
    }
  };

  const handleMissionClick = (mission: any) => {
    if (mission.isApproved || mission.isPending || mission.isLocked) return;

    const valType = mission.validation_type || (
      mission.category === 'treino' || mission.category === 'cardio' ? 'timer' : 'photo'
    );

    if (valType === 'simple_click') {
      handleSimpleCheckin(mission);
      return;
    }

    if (valType === 'timer' || mission.category === 'treino' || mission.category === 'cardio') {
      if (activeSession?.missionId === mission.id) return;
      startSession(mission.id, mission.title, mission.category);
      return;
    }

    // Default: foto
    router.push(`/app/camera/${mission.id}`);
  };

  const renderMissionCard = (mission: any) => {
    const isActionable = !mission.sub && !mission.isLocked;
    const isCurrentlyActive = activeSession?.missionId === mission.id;
    const isSimpleClick = mission.validation_type === 'simple_click';
    const isTimer = mission.validation_type === 'timer' || (!mission.validation_type && (mission.category === 'treino' || mission.category === 'cardio'));
    const customList = mission.list_id ? missionLists.find((l) => l.id === mission.list_id) : null;

    return (
      <div
        key={mission.id}
        onClick={() => isActionable && handleMissionClick(mission)}
        className={`group p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
          mission.isApproved
            ? 'border-emerald-500/20 bg-emerald-950/15 opacity-85'
            : mission.isPending
            ? 'border-amber-500/20 bg-amber-950/15'
            : mission.isLocked
            ? 'border-white/5 bg-zinc-950/50 opacity-60'
            : 'border-white/15 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-white/30 active:scale-[0.99] cursor-pointer shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Status Indicator Left */}
          <div className="shrink-0">
            {mission.isApproved ? (
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            ) : mission.isPending ? (
              <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <Clock className="h-4 w-4" />
              </div>
            ) : mission.isLocked ? (
              <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                <Lock className="h-3.5 w-3.5" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20 group-hover:border-white/50 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <span className="text-xs">
                  {customList?.icon || (mission.category === 'treino' ? '⚡' : mission.category === 'cardio' ? '🏃' : mission.category === 'refeicao' ? '🥗' : '💧')}
                </span>
              </div>
            )}
          </div>

          {/* Details Middle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-bold truncate ${mission.isApproved ? 'line-through text-zinc-400' : 'text-white'}`}>
                {mission.title}
              </span>
              {mission.is_bonus && (
                <span className="text-[9px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1 rounded">
                  ★ BÔNUS
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              {getCategoryBadge(mission)}
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                +{mission.points_rewarded} XP
              </span>
            </div>
          </div>
        </div>

        {/* Action / State Right */}
        <div className="shrink-0 flex items-center gap-2">
          {mission.isApproved && (
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              +Feito
            </span>
          )}

          {mission.isPending && (
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              Análise
            </span>
          )}

          {mission.isLocked && (
            <div className="text-right">
              {mission.isDailyLocked ? (
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block">
                  ⏱ {timeUntilMidnight || 'Amanhã'}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-500 block">
                  Bloqueada
                </span>
              )}
            </div>
          )}

          {isActionable && (
            isCurrentlyActive ? (
              <span className="px-2.5 py-1.5 rounded-xl bg-white text-black font-mono font-bold text-[11px] animate-pulse">
                Em andamento
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs group-hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-1">
                {isSimpleClick ? 'Check-in ⚡' : isTimer ? 'Iniciar' : 'Foto'}
                <ChevronRight className="h-3 w-3" />
              </span>
            )
          )}
        </div>
      </div>
    );
  };

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
          <p className="text-xs text-zinc-400">Tarefas e hábitos com pontuação e metas</p>
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

      {/* Abas de Filtro por Lista Customizada ou Categoria */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none relative z-10">
        {missionLists.length > 0 ? (
          <>
            <button
              onClick={() => { setSelectedListId('all'); setSelectedCategory('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                selectedListId === 'all' && selectedCategory === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              Todas ({processedMissions.length})
            </button>
            {missionLists.map((list) => {
              const count = processedMissions.filter((m) => m.list_id === list.id).length;
              const isSelected = selectedListId === list.id;
              return (
                <button
                  key={list.id}
                  onClick={() => { setSelectedListId(list.id); setSelectedCategory('all'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-black shadow-md'
                      : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{list.icon || '🎯'}</span>
                  <span>{list.name}</span>
                  {count > 0 && <span className="opacity-60 text-[10px]">({count})</span>}
                </button>
              );
            })}
          </>
        ) : (
          [
            { id: 'all', label: `Todas (${processedMissions.length})` },
            { id: 'treino', label: '⚡ Treinos' },
            { id: 'cardio', label: '🏃 Cardios' },
            { id: 'refeicao', label: '🥗 Refeições' },
            { id: 'habito', label: '💧 Hábitos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setSelectedCategory(tab.id); setSelectedListId('all'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                selectedCategory === tab.id
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))
        )}
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

      {/* Floating Instant Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2.5 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
