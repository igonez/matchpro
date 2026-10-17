'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { useWorkoutSession } from '@/lib/workout-session-context';
import {
  Clock,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Dumbbell,
  Activity,
  Utensils,
  Droplets,
  Target,
  Calendar,
  Sparkles,
  AlertCircle,
  Camera,
  Play,
  Check,
  Layers,
} from 'lucide-react';

export default function StudentMissionsWeeklyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-zinc-500 text-xs font-mono">
          CARREGANDO CRONOGRAMA DE MISSÕES...
        </div>
      }
    >
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

  const [challenge, setChallenge] = useState<any>(null);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
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
  const [previewFutureMissions, setPreviewFutureMissions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleRemoteCompletion = () => {
      setRefreshKey((k) => k + 1);
    };
    window.addEventListener('arena_mission_completed', handleRemoteCompletion);
    return () => window.removeEventListener('arena_mission_completed', handleRemoteCompletion);
  }, []);

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

  // Cálculo cronológico de semanas baseado em challenge.start_date
  const weekScheduleInfo = useMemo(() => {
    const startRaw = challenge?.start_date
      ? new Date(challenge.start_date + 'T00:00:00')
      : new Date(new Date().setHours(0, 0, 0, 0));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxWeek = Math.max(
      4,
      ...weeks.map((w: any) => Number(w.week_number) || 0)
    );

    const diffDaysFromStart = Math.floor((today.getTime() - startRaw.getTime()) / 86400000);
    const activeWeekNum = Math.min(maxWeek, Math.max(1, Math.floor(Math.max(0, diffDaysFromStart) / 7) + 1));

    const byWeek: Record<
      number,
      {
        weekNumber: number;
        startDate: Date;
        endDate: Date;
        daysUntilStart: number;
        daysRemainingInWeek: number;
        isFuture: boolean;
        isCurrent: boolean;
        isPast: boolean;
        formattedRange: string;
      }
    > = {};

    for (let w = 1; w <= maxWeek; w++) {
      const wStart = new Date(startRaw.getTime() + (w - 1) * 7 * 86400000);
      const wEnd = new Date(wStart.getTime() + 6 * 86400000);
      const daysUntilStart = Math.ceil((wStart.getTime() - today.getTime()) / 86400000);
      const daysRemainingInWeek = Math.max(0, Math.ceil((wEnd.getTime() - today.getTime()) / 86400000) + 1);

      const isFuture = daysUntilStart > 0;
      const isPast = today.getTime() > wEnd.getTime();
      const isCurrent = !isFuture && !isPast;

      const fmt = (d: Date) =>
        d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      byWeek[w] = {
        weekNumber: w,
        startDate: wStart,
        endDate: wEnd,
        daysUntilStart: Math.max(0, daysUntilStart),
        daysRemainingInWeek,
        isFuture,
        isCurrent,
        isPast,
        formattedRange: `${fmt(wStart)} a ${fmt(wEnd)}`,
      };
    }

    return { activeWeekNum, byWeek };
  }, [challenge, weeks]);

  // 1. Carregar desafio, semanas e submissões
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        let { data: part } = await supabase
          .from('challenge_participants')
          .select('challenge_id, challenges(id, title, start_date, end_date, is_active)')
          .eq('student_id', user.id)
          .in('payment_status', ['paid', 'complimentary'])
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!part) {
          const { data: fallbackPart } = await supabase
            .from('challenge_participants')
            .select('challenge_id, challenges(id, title, start_date, end_date, is_active)')
            .eq('student_id', user.id)
            .order('joined_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          part = fallbackPart;
        }

        let challengeObj: any = Array.isArray(part?.challenges) ? part?.challenges[0] : part?.challenges;
        let challengeId = part?.challenge_id || challengeObj?.id || null;

        if (!challengeId) {
          const { data: activeCh } = await supabase
            .from('challenges')
            .select('id, title, start_date, end_date, is_active')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (activeCh) {
            challengeObj = activeCh;
            challengeId = activeCh.id;
          }
        }

        setCurrentChallengeId(challengeId);
        setChallenge(challengeObj || null);

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

        // Garantir pelo menos as 4 semanas no seletor + semanas extras criadas pelo coach
        const totalWeeksCount = Math.max(
          4,
          ...(weeksData || []).map((w: any) => Number(w.week_number) || 0)
        );
        const weekNums = Array.from({ length: totalWeeksCount }, (_, idx) => idx + 1);
        const normalizedWeeks = weekNums.map((num) => {
          const existing = (weeksData || []).find((w: any) => Number(w.week_number) === num);
          return (
            existing || {
              id: `virtual-week-${num}`,
              challenge_id: challengeId,
              week_number: num,
              bonus_points: 20,
              isVirtual: true,
            }
          );
        });

        setWeeks(normalizedWeeks);

        // Selecionar semana atual por padrão na primeira carga
        if (challengeObj?.start_date) {
          const start = new Date(challengeObj.start_date + 'T00:00:00');
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
          const initialWeek = Math.min(totalWeeksCount, Math.max(1, Math.floor(Math.max(0, diffDays) / 7) + 1));
          setSelectedWeekNumber(initialWeek);
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
  }, [supabase, refreshKey]);

  const selectedWeek = useMemo(
    () => weeks.find((w) => Number(w.week_number) === selectedWeekNumber) || weeks[0],
    [weeks, selectedWeekNumber]
  );

  const selectedWeekMeta = weekScheduleInfo.byWeek[selectedWeekNumber] || weekScheduleInfo.byWeek[1];

  // 2. Carregar missões estritamente da semana selecionada (sem vazar Semana 1 para Semana 2, 3, 4)
  useEffect(() => {
    if (!currentChallengeId || !selectedWeek) return;

    async function loadWeeklyMissions() {
      setLoadingMissions(true);
      try {
        let result: any[] = [];

        if (!selectedWeek.isVirtual && selectedWeek.id) {
          const { data } = await supabase
            .from('missions')
            .select('*')
            .eq('week_id', selectedWeek.id)
            .order('order_index', { ascending: true })
            .order('points_rewarded', { ascending: false });
          result = data || [];
        }

        // Apenas na Semana 1 buscamos missões legadas que foram salvas sem week_id
        if (result.length === 0 && selectedWeekNumber === 1) {
          const { data: directData } = await supabase
            .from('missions')
            .select('*')
            .eq('challenge_id', currentChallengeId)
            .is('week_id', null)
            .order('order_index', { ascending: true })
            .order('points_rewarded', { ascending: false });

          if (directData && directData.length > 0) {
            result = directData;
          }
        }

        setMissions(result);
      } finally {
        setLoadingMissions(false);
      }
    }

    loadWeeklyMissions();
  }, [selectedWeek, selectedWeekNumber, currentChallengeId, supabase]);

  // Limite biológico: 1 Treino e 1 Cardio por dia
  const todayWorkoutCount = useMemo(() => {
    return todaySubmissions.filter((s: any) => s.missions?.category === 'treino').length;
  }, [todaySubmissions]);

  const todayCardioCount = useMemo(() => {
    return todaySubmissions.filter((s: any) => s.missions?.category === 'cardio').length;
  }, [todaySubmissions]);

  const isWorkoutDailyLocked = todayWorkoutCount >= 1;
  const isCardioDailyLocked = todayCardioCount >= 1;

  const completedMissionsCount = missions.filter((m) => submissions[m.id]?.status === 'approved').length;
  const isWeekComplete = missions.length > 0 && completedMissionsCount === missions.length;

  // Enriquecer missões com status de bloqueio (incluindo bloqueio quando a semana é futura)
  const processedMissions = useMemo(() => {
    const lastSubStatusByCategory: Record<string, boolean> = {};
    const isFutureWeek = Boolean(selectedWeekMeta?.isFuture);

    return missions.map((mission) => {
      const sub = submissions[mission.id];
      const isApproved = sub?.status === 'approved';
      const isPending = sub?.status === 'pending';

      const isDailyLocked =
        !isApproved &&
        !isPending &&
        !isFutureWeek &&
        ((mission.category === 'treino' && isWorkoutDailyLocked) ||
          (mission.category === 'cardio' && isCardioDailyLocked));

      const hadPreviousUnfinished =
        !isApproved &&
        !isPending &&
        !isFutureWeek &&
        (mission.category === 'treino' || mission.category === 'cardio') &&
        lastSubStatusByCategory[mission.category] === false;

      if (mission.category === 'treino' || mission.category === 'cardio') {
        if (lastSubStatusByCategory[mission.category] === undefined) {
          lastSubStatusByCategory[mission.category] = Boolean(sub);
        } else if (!sub) {
          lastSubStatusByCategory[mission.category] = false;
        }
      }

      const isLocked = isFutureWeek || isDailyLocked || hadPreviousUnfinished;

      return {
        ...mission,
        sub,
        isApproved,
        isPending,
        isFutureWeek,
        isDailyLocked,
        isPreviousUnfinished: hadPreviousUnfinished,
        isLocked,
      };
    });
  }, [missions, submissions, isWorkoutDailyLocked, isCardioDailyLocked, selectedWeekMeta]);

  const filteredMissions = useMemo(() => {
    if (selectedListId !== 'all') {
      return processedMissions.filter((m) => m.list_id === selectedListId);
    }
    if (selectedCategory !== 'all') {
      return processedMissions.filter((m) => m.category === selectedCategory);
    }
    return processedMissions;
  }, [processedMissions, selectedCategory, selectedListId]);

  const completedMissions = filteredMissions.filter((m) => m.isApproved);

  // Estatísticas dos 4 pilares na semana selecionada
  const pillarStats = useMemo(() => {
    const calc = (cat: string) => {
      const all = processedMissions.filter((m) => m.category === cat);
      const done = all.filter((m) => m.isApproved).length;
      const totalXp = all.reduce((acc, m) => acc + Number(m.points_rewarded || 0), 0);
      return { total: all.length, done, totalXp };
    };
    return {
      treino: calc('treino'),
      cardio: calc('cardio'),
      refeicao: calc('refeicao'),
      habito: calc('habito'),
    };
  }, [processedMissions]);

  const getCategoryIcon = (category: string, className = 'w-4 h-4') => {
    switch (category) {
      case 'treino':
        return <Dumbbell className={className} />;
      case 'cardio':
        return <Activity className={className} />;
      case 'refeicao':
        return <Utensils className={className} />;
      case 'habito':
        return <Droplets className={className} />;
      default:
        return <Target className={className} />;
    }
  };

  const getCategoryBadge = (mission: any) => {
    if (mission.list_id && missionLists.length > 0) {
      const list = missionLists.find((l) => l.id === mission.list_id);
      if (list) {
        return (
          <span className="text-[10px] font-mono text-zinc-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 font-bold flex items-center gap-1 uppercase">
            <Layers className="w-3 h-3 text-zinc-400" /> {list.name}
          </span>
        );
      }
    }

    switch (mission.category) {
      case 'treino':
        return (
          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-bold flex items-center gap-1 uppercase">
            <Dumbbell className="w-3 h-3" /> Treino (1/dia)
          </span>
        );
      case 'cardio':
        return (
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 font-bold flex items-center gap-1 uppercase">
            <Activity className="w-3 h-3" /> Cardio (1/dia)
          </span>
        );
      case 'refeicao':
        return (
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold flex items-center gap-1 uppercase">
            <Utensils className="w-3 h-3" /> Nutrição IA
          </span>
        );
      case 'habito':
        return (
          <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 font-bold flex items-center gap-1 uppercase">
            <Droplets className="w-3 h-3" /> Hábito
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
      showToast(`"${mission.title}" concluída! +${mission.points_rewarded} XP`);

      const nowIso = new Date().toISOString();
      let { data, error } = await supabase
        .from('student_submissions')
        .insert({
          challenge_id: currentChallengeId,
          mission_id: mission.id,
          student_id: user.id,
          status: 'approved',
          photo_url: 'simple_click',
          submitted_at: nowIso,
          client_captured_at: nowIso,
        })
        .select()
        .single();

      if (error && (error.message.includes('column') || error.message.includes('schema cache'))) {
        const fallbackRes = await supabase
          .from('student_submissions')
          .insert({
            mission_id: mission.id,
            student_id: user.id,
            status: 'approved',
            photo_url: 'simple_click',
            client_captured_at: nowIso,
          })
          .select()
          .single();
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (error) {
        console.warn('Submissão gravada localmente com fallback:', error.message);
      } else if (data) {
        setSubmissions((prev) => ({ ...prev, [mission.id]: data }));
      }
    } catch (err: any) {
      console.error('Erro no check-in 1-toque:', err);
      showToast('Check-in concluído!');
    }
  };

  const handleMissionClick = (mission: any) => {
    if (mission.isFutureWeek) {
      showToast(
        `Esta missão pertence à Semana ${selectedWeekNumber} e será liberada em ${selectedWeekMeta.daysUntilStart} ${
          selectedWeekMeta.daysUntilStart === 1 ? 'dia' : 'dias'
        }.`
      );
      return;
    }
    if (mission.isApproved || mission.isPending || mission.isLocked) return;

    const valType =
      mission.validation_type ||
      (mission.category === 'treino' || mission.category === 'cardio' ? 'timer' : 'photo');

    if (valType === 'simple_click') {
      handleSimpleCheckin(mission);
      return;
    }

    if (valType === 'timer' || mission.category === 'treino' || mission.category === 'cardio') {
      if (activeSession?.missionId === mission.id) return;
      startSession(mission.id, mission.title, mission.category);
      return;
    }

    router.push(`/app/camera/${mission.id}`);
  };

  const renderMissionCard = (mission: any) => {
    const isActionable = !mission.sub && !mission.isLocked;
    const isCurrentlyActive = activeSession?.missionId === mission.id;
    const isSimpleClick = mission.validation_type === 'simple_click';
    const isTimer =
      mission.validation_type === 'timer' ||
      (!mission.validation_type && (mission.category === 'treino' || mission.category === 'cardio'));

    return (
      <div
        key={mission.id}
        onClick={() => (isActionable || mission.isFutureWeek) && handleMissionClick(mission)}
        className={`group p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
          mission.isApproved
            ? 'border-emerald-500/25 bg-emerald-950/15 opacity-85'
            : mission.isPending
            ? 'border-amber-500/25 bg-amber-950/15'
            : mission.isLocked
            ? 'border-white/[0.06] bg-zinc-950/70 opacity-65'
            : 'border-white/15 bg-zinc-900/70 hover:bg-zinc-800/80 hover:border-white/30 active:scale-[0.99] cursor-pointer shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Status Indicator Left */}
          <div className="shrink-0">
            {mission.isApproved ? (
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            ) : mission.isPending ? (
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <Clock className="h-4 w-4" />
              </div>
            ) : mission.isLocked ? (
              <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                <Lock className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 group-hover:border-white/50 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                {getCategoryIcon(mission.category, 'w-4 h-4')}
              </div>
            )}
          </div>

          {/* Details Middle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-xs font-bold truncate ${
                  mission.isApproved ? 'line-through text-zinc-400' : 'text-white'
                }`}
              >
                {mission.title}
              </span>
              {mission.is_bonus && (
                <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase">
                  BÔNUS
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {getCategoryBadge(mission)}
              <span className="text-[10px] font-mono font-bold text-amber-300">
                +{mission.points_rewarded} XP
              </span>
            </div>
          </div>
        </div>

        {/* Action / State Right */}
        <div className="shrink-0 flex items-center gap-2">
          {mission.isApproved && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              Concluída
            </span>
          )}

          {mission.isPending && (
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              Auditoria
            </span>
          )}

          {mission.isLocked && (
            <div className="text-right">
              {mission.isFutureWeek ? (
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 block">
                  Em {selectedWeekMeta.daysUntilStart}d
                </span>
              ) : mission.isDailyLocked ? (
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeUntilMidnight || 'Amanhã'}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-500 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] block">
                  Na fila
                </span>
              )}
            </div>
          )}

          {isActionable &&
            (isCurrentlyActive ? (
              <span className="px-2.5 py-1.5 rounded-xl bg-white text-black font-mono font-bold text-[11px] animate-pulse">
                Em andamento
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-white text-black font-mono font-bold text-xs group-hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-1">
                {isSimpleClick ? (
                  <>
                    <Check className="w-3 h-3" /> Check-in
                  </>
                ) : isTimer ? (
                  <>
                    <Play className="w-3 h-3" /> Iniciar
                  </>
                ) : (
                  <>
                    <Camera className="w-3 h-3" /> Foto
                  </>
                )}
                <ChevronRight className="h-3 w-3" />
              </span>
            ))}
        </div>
      </div>
    );
  };

  // Blocos visuais estruturados por pilar
  const categoryBlocks = [
    {
      key: 'treino',
      title: 'Bloco de Treinos de Força',
      subtitle: 'Limite fisiológico de 1 treino validado por dia',
      Icon: Dumbbell,
      accentBorder: 'border-amber-500/25',
      accentBg: 'from-amber-500/[0.08] via-zinc-950 to-zinc-950',
      badgeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
      ruleLabel: isWorkoutDailyLocked ? 'Cota de hoje cumprida' : 'Liberado para hoje',
    },
    {
      key: 'cardio',
      title: 'Bloco de Sessões de Cardio',
      subtitle: 'Condicionamento aeróbico • Limite de 1 sessão por dia',
      Icon: Activity,
      accentBorder: 'border-cyan-500/25',
      accentBg: 'from-cyan-500/[0.08] via-zinc-950 to-zinc-950',
      badgeColor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30',
      ruleLabel: isCardioDailyLocked ? 'Cota de hoje cumprida' : 'Liberado para hoje',
    },
    {
      key: 'refeicao',
      title: 'Bloco de Nutrição & Dieta',
      subtitle: 'Auditoria visual de pratos e macronutrientes por IA',
      Icon: Utensils,
      accentBorder: 'border-emerald-500/25',
      accentBg: 'from-emerald-500/[0.08] via-zinc-950 to-zinc-950',
      badgeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
      ruleLabel: 'Validação por Câmera',
    },
    {
      key: 'habito',
      title: 'Bloco de Hábitos & Metas',
      subtitle: 'Hidratação, sono e disciplina diária da turma',
      Icon: Droplets,
      accentBorder: 'border-purple-500/25',
      accentBg: 'from-purple-500/[0.08] via-zinc-950 to-zinc-950',
      badgeColor: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
      ruleLabel: 'Check-in Diário',
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 md:p-8 space-y-5 w-full pb-28 relative">
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex items-center justify-between pt-1 relative z-10 border-b border-white/[0.08] pb-3.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-0.5">
            CENTRAL DE EXECUÇÃO • {challenge?.title || 'TURMA ATIVA'}
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">Cronograma de Missões</h1>
          <p className="text-xs text-zinc-400">
            Missões organizadas em blocos por pilar e semana oficial do desafio.
          </p>
        </div>
      </div>

      {/* BLOCO 1: Seletor de Semanas (1 a 4) + Aviso Cronológico da Semana */}
      <div className="space-y-3 relative z-10">
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((weekNum) => {
            const isSelected = selectedWeekNumber === weekNum;
            const meta = weekScheduleInfo.byWeek[weekNum];

            return (
              <button
                key={weekNum}
                type="button"
                onClick={() => {
                  setSelectedWeekNumber(weekNum);
                  setPreviewFutureMissions(false);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    : meta?.isCurrent
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-white hover:border-emerald-400'
                    : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white hover:border-white/25'
                }`}
              >
                <span className="text-xs font-mono font-black tracking-tight">
                  Semana {weekNum}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                    isSelected
                      ? 'bg-black/15 text-black font-bold'
                      : meta?.isCurrent
                      ? 'text-emerald-400 font-bold'
                      : meta?.isFuture
                      ? 'text-amber-400/90'
                      : 'text-zinc-500'
                  }`}
                >
                  {meta?.isCurrent
                    ? 'Atual'
                    : meta?.isFuture
                    ? `Em ${meta.daysUntilStart}d`
                    : 'Concluída'}
                </span>
              </button>
            );
          })}
        </div>

        {/* AVISO DE STATUS DA SEMANA SELECIONADA */}
        {selectedWeekMeta && (
          <div
            className={`p-4 rounded-3xl border relative overflow-hidden ${
              selectedWeekMeta.isFuture
                ? 'border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-zinc-950 to-zinc-950'
                : selectedWeekMeta.isCurrent
                ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-zinc-950 to-zinc-950'
                : 'border-white/15 bg-zinc-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`h-10 w-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                    selectedWeekMeta.isFuture
                      ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                      : selectedWeekMeta.isCurrent
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/10 border-white/20 text-zinc-300'
                  }`}
                >
                  {selectedWeekMeta.isFuture ? (
                    <Lock className="w-5 h-5" />
                  ) : selectedWeekMeta.isCurrent ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <Calendar className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        selectedWeekMeta.isFuture
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                          : selectedWeekMeta.isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/10 text-zinc-300 border-white/20'
                      }`}
                    >
                      {selectedWeekMeta.isFuture
                        ? `SEMANA ${selectedWeekNumber} BLOQUEADA`
                        : selectedWeekMeta.isCurrent
                        ? `SEMANA ${selectedWeekNumber} EM ANDAMENTO`
                        : `SEMANA ${selectedWeekNumber} ENCERRADA`}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {selectedWeekMeta.formattedRange}
                    </span>
                  </div>

                  {selectedWeekMeta.isFuture ? (
                    <>
                      <h2 className="text-base font-black text-white tracking-tight">
                        Semana {selectedWeekNumber} começa em {selectedWeekMeta.daysUntilStart}{' '}
                        {selectedWeekMeta.daysUntilStart === 1 ? 'dia' : 'dias'}
                      </h2>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        As missões da Semana {selectedWeekNumber} serão desbloqueadas automaticamente no dia{' '}
                        <strong className="text-amber-300">
                          {selectedWeekMeta.startDate.toLocaleDateString('pt-BR')}
                        </strong>
                        . Concentre seus check-ins na{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWeekNumber(weekScheduleInfo.activeWeekNum);
                            setPreviewFutureMissions(false);
                          }}
                          className="underline text-white font-bold cursor-pointer"
                        >
                          Semana {weekScheduleInfo.activeWeekNum} (Atual)
                        </button>
                        .
                      </p>
                    </>
                  ) : selectedWeekMeta.isCurrent ? (
                    <>
                      <h2 className="text-base font-black text-white tracking-tight">
                        Cronograma Liberado • {completedMissionsCount}/{missions.length} missões cumpridas
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Complete todas as tarefas da semana para conquistar{' '}
                        <strong className="text-emerald-400">+{selectedWeek?.bonus_points || 20} XP Bônus</strong>.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-base font-black text-white tracking-tight">
                        Ciclo da Semana {selectedWeekNumber} Concluído
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Você completou {completedMissionsCount} de {missions.length} missões registradas nesta semana.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de Progresso da Semana */}
            {!selectedWeekMeta.isFuture && missions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-400 uppercase">META DE BÔNUS DA SEMANA {selectedWeekNumber}</span>
                  <span className="text-white font-bold">
                    {Math.round((completedMissionsCount / missions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWeekComplete
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300'
                        : 'bg-gradient-to-r from-amber-500 to-amber-300'
                    }`}
                    style={{
                      width: `${missions.length > 0 ? (completedMissionsCount / missions.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banner de Regra Diária com Cronômetro Regressivo até 00:00 */}
      {!selectedWeekMeta?.isFuture && (isWorkoutDailyLocked || isCardioDailyLocked) && (
        <div className="p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs relative z-10 border border-amber-500/25 bg-amber-950/15">
          <div className="space-y-0.5">
            <p className="font-bold text-white text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {isWorkoutDailyLocked && isCardioDailyLocked
                ? 'Treino & Cardio de hoje concluídos!'
                : isWorkoutDailyLocked
                ? 'Treino de hoje concluído!'
                : 'Cardio de hoje concluído!'}
            </p>
            <p className="text-[11px] text-zinc-400">
              Próxima liberação automática na virada do dia.
            </p>
          </div>
          <div className="text-right shrink-0 bg-black/70 border border-white/10 px-2.5 py-1.5 rounded-xl">
            <span className="text-[9px] font-mono text-zinc-400 uppercase block">Libera em</span>
            <span className="text-xs font-mono font-black text-amber-300 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {timeUntilMidnight || '00:00:00'}
            </span>
          </div>
        </div>
      )}

      {/* BLOCO 2: Painel de Resumo por Pilar (Exibido quando a semana está liberada ou em prévia) */}
      {(!selectedWeekMeta?.isFuture || previewFutureMissions) && (
        <div className="grid grid-cols-2 gap-2.5 relative z-10">
          {[
            {
              id: 'treino',
              label: 'TREINOS',
              Icon: Dumbbell,
              stats: pillarStats.treino,
              color: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
            },
            {
              id: 'cardio',
              label: 'CARDIOS',
              Icon: Activity,
              stats: pillarStats.cardio,
              color: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
            },
            {
              id: 'refeicao',
              label: 'NUTRIÇÃO',
              Icon: Utensils,
              stats: pillarStats.refeicao,
              color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
            },
            {
              id: 'habito',
              label: 'HÁBITOS',
              Icon: Droplets,
              stats: pillarStats.habito,
              color: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
            },
          ].map((p) => {
            const isSelected = selectedCategory === p.id;
            const IconComp = p.Icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedCategory((prev) => (prev === p.id ? 'all' : p.id));
                  setSelectedListId('all');
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'border-white bg-zinc-900 shadow-lg'
                    : 'border-white/10 bg-zinc-950/90 hover:border-white/25'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${p.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-black text-white block tracking-wider">
                      {p.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      {p.stats.done}/{p.stats.total} feitas
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 shrink-0">
                  {p.stats.totalXp} XP
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filtro rápido de visualização */}
      {selectedCategory !== 'all' && (!selectedWeekMeta?.isFuture || previewFutureMissions) && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs relative z-10">
          <span className="font-mono text-zinc-300">
            Exibindo apenas o bloco: <strong className="text-white uppercase">{selectedCategory}</strong>
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className="text-[10px] font-mono font-bold text-amber-300 hover:underline cursor-pointer uppercase"
          >
            Mostrar Todos os Blocos
          </button>
        </div>
      )}

      {/* BLOCO 3: Container de Missões Organizado em Blocos por Categoria */}
      {loading || loadingMissions ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono relative z-10">
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          SINCRONIZANDO BLOCOS DA SEMANA {selectedWeekNumber}...
        </div>
      ) : selectedWeekMeta?.isFuture && !previewFutureMissions ? (
        /* Card Dedicado para Semana Futura (não mantém as missões da Semana 1 na tela) */
        <SpotlightCard3D className="p-7 rounded-3xl border border-amber-400/30 bg-zinc-950 text-center space-y-4 relative z-10 shadow-[0_12px_35px_rgba(245,158,11,0.08)]">
          <div className="h-14 w-14 rounded-2xl bg-amber-400/15 border border-amber-400/35 text-amber-300 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
              CRONOGRAMA FUTURO • {selectedWeekMeta.formattedRange}
            </span>
            <h3 className="text-lg font-black text-white">
              A Semana {selectedWeekNumber} começa daqui a {selectedWeekMeta.daysUntilStart}{' '}
              {selectedWeekMeta.daysUntilStart === 1 ? 'dia' : 'dias'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              As missões da Semana {selectedWeekNumber} ficarão disponíveis para check-in assim que o ciclo iniciar em{' '}
              <strong className="text-white">{selectedWeekMeta.startDate.toLocaleDateString('pt-BR')}</strong>.
            </p>
            {missions.length > 0 && (
              <p className="text-[11px] font-mono text-amber-300/90 pt-1">
                {missions.length} missões já estão programadas pelo treinador para esta semana.
              </p>
            )}
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedWeekNumber(weekScheduleInfo.activeWeekNum);
                setPreviewFutureMissions(false);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-black font-mono font-bold text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Voltar para Semana {weekScheduleInfo.activeWeekNum} (Em Andamento)
            </button>
            {missions.length > 0 && (
              <button
                type="button"
                onClick={() => setPreviewFutureMissions(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 font-mono font-bold text-xs hover:bg-amber-400/20 transition-colors cursor-pointer"
              >
                Ver Prévia das Missões ({missions.length})
              </button>
            )}
          </div>
        </SpotlightCard3D>
      ) : filteredMissions.length === 0 ? (
        <div className="p-8 rounded-3xl border border-white/10 bg-zinc-950 text-center space-y-2 relative z-10">
          <AlertCircle className="w-7 h-7 text-zinc-500 mx-auto" />
          <p className="text-xs font-mono text-zinc-300 font-bold">
            Nenhuma missão cadastrada para a Semana {selectedWeekNumber}.
          </p>
          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
            O seu treinador ainda não publicou missões neste bloco para a Semana {selectedWeekNumber}.
          </p>
        </div>
      ) : (
        <div className="space-y-5 relative z-10">
          {categoryBlocks.map((block) => {
            if (selectedCategory !== 'all' && selectedCategory !== block.key) return null;

            const blockMissions = filteredMissions.filter(
              (m) => m.category === block.key && !m.isApproved
            );
            const allBlockMissions = filteredMissions.filter((m) => m.category === block.key);
            const doneCount = allBlockMissions.filter((m) => m.isApproved).length;

            if (allBlockMissions.length === 0) return null;

            const BlockIcon = block.Icon;

            return (
              <div
                key={block.key}
                className={`p-4 rounded-3xl border ${block.accentBorder} bg-gradient-to-br ${block.accentBg} space-y-3 shadow-lg`}
              >
                {/* Header do Bloco */}
                <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${block.badgeColor}`}>
                      <BlockIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-white tracking-tight">{block.title}</h3>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/10 uppercase">
                          {doneCount}/{allBlockMissions.length} feitas
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{block.subtitle}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-2 py-1 rounded-lg border shrink-0 uppercase ${block.badgeColor}`}>
                    {selectedWeekMeta?.isFuture ? `Libera em ${selectedWeekMeta.daysUntilStart}d` : block.ruleLabel}
                  </span>
                </div>

                {/* Lista de Missões do Bloco */}
                {blockMissions.length === 0 ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Todas as missões deste bloco foram concluídas na Semana {selectedWeekNumber}!
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {blockMissions.map(renderMissionCard)}
                  </div>
                )}
              </div>
            );
          })}

          {/* BLOCO 4: Histórico de Concluídas na Semana (Colapsável) */}
          {completedMissions.length > 0 && (
            <div className="p-4 rounded-3xl border border-emerald-500/25 bg-zinc-950/90 space-y-3">
              <button
                type="button"
                onClick={() => setShowCompletedSection((prev) => !prev)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase font-mono tracking-wider">
                      Bloco de Missões Concluídas ({completedMissions.length})
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Pontos já auditados e somados ao seu ranking na Semana {selectedWeekNumber}
                    </p>
                  </div>
                </div>
                {showCompletedSection ? (
                  <ChevronUp className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                )}
              </button>

              {showCompletedSection && (
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  {completedMissions.map(renderMissionCard)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Instant Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2.5 rounded-full font-mono font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
