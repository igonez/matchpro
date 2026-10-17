'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { MobileLoadingScreen } from '@/components/ui/mobile-loading-screen';
import { useWorkoutSession } from '@/lib/workout-session-context';
import { 
  QrCode, 
  ArrowRight, 
  Pin, 
  Megaphone, 
  CheckCircle2, 
  Play, 
  Camera, 
  Sparkles, 
  Trophy, 
  Flame, 
  Zap, 
  Activity, 
  Utensils, 
  Droplets,
  ChevronRight,
  Circle,
  Bell
} from 'lucide-react';
import { NotificationsDrawer } from '@/components/student/notifications-drawer';
import { checkStreakRisk, sendBrowserNotification } from '@/lib/notifications';

export default function StudentHomePage() {
  const router = useRouter();
  const supabase = createClient();
  const { activeSession, startSession } = useWorkoutSession();

  const [student, setStudent] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [pendingChallenge, setPendingChallenge] = useState<any>(null);
  const [standing, setStanding] = useState<any>(null);
  const [rank, setRank] = useState('1º');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [currentStreak, setCurrentStreak] = useState<number>(1);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [missionLists, setMissionLists] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [todayLockedCategories, setTodayLockedCategories] = useState<{ treino: boolean; cardio: boolean }>({
    treino: false,
    cardio: false,
  });

  const [categoryCounts, setCategoryCounts] = useState({
    treinos: { done: 0, total: 0 },
    cardios: { done: 0, total: 0 },
    refeicoes: { done: 0, total: 0 },
    habitos: { done: 0, total: 0 },
  });
  const [listCounts, setListCounts] = useState<Record<string, { done: number; total: number }>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Central de Notificações
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isInitialBoot, setIsInitialBoot] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('arena_booted');
  });

  // Carregar contagem de notificações não lidas em tempo real
  useEffect(() => {
    if (!student?.id) return;

    async function loadUnreadCount() {
      try {
        const { count, error } = await supabase
          .from('student_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id)
          .eq('is_read', false);

        if (!error && count !== null) {
          setUnreadNotifsCount(count);
        }
      } catch (e) {
        // Silencioso
      }
    }

    loadUnreadCount();

    const channel = supabase
      .channel(`unread_count_${student.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_notifications',
          filter: `student_id=eq.${student.id}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student?.id, supabase]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('arena_booted')) {
      sessionStorage.setItem('arena_booted', 'true');
    }

    const handleRemoteCompletion = () => {
      setRefreshKey((k) => k + 1);
    };
    window.addEventListener('arena_mission_completed', handleRemoteCompletion);
    return () => window.removeEventListener('arena_mission_completed', handleRemoteCompletion);
  }, []);

  useEffect(() => {
    async function loadHome() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        setStudent(studentData || { full_name: user.email?.split('@')[0] || 'Atleta' });

        let challengeData: any = null;
        let pendingData: any = null;

        const { data: participation } = await supabase
          .from('challenge_participants')
          .select('challenge_id, payment_status, challenges(*, challenge_weeks(*))')
          .eq('student_id', user.id)
          .in('payment_status', ['paid', 'complimentary'])
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (participation?.challenges) {
          challengeData = participation.challenges as any;
        } else {
          // Checar se há inscrição pendente de pagamento Pix
          const { data: pendingPart } = await supabase
            .from('challenge_participants')
            .select('challenge_id, payment_status, challenges(id, title, price)')
            .eq('student_id', user.id)
            .eq('payment_status', 'pending')
            .order('joined_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (pendingPart?.challenges) {
            pendingData = pendingPart.challenges as any;
          }
        }

        setChallenge(challengeData);
        setPendingChallenge(pendingData);

        if (challengeData?.id) {
          const { data: standingData } = await supabase
            .from('leaderboard_standings')
            .select('total_points')
            .eq('student_id', user.id)
            .eq('challenge_id', challengeData.id)
            .limit(1)
            .maybeSingle();

          setStanding(standingData || { total_points: 0 });

          const { data: allStandings } = await supabase
            .from('leaderboard_standings')
            .select('student_id, total_points')
            .eq('challenge_id', challengeData.id)
            .order('total_points', { ascending: false });

          if (allStandings && allStandings.length > 0) {
            const idx = allStandings.findIndex((s: any) => s.student_id === user.id);
            setRank(idx !== -1 ? `${idx + 1}º` : `${allStandings.length + 1}º`);
          } else {
            setRank('1º');
          }

          const { data: notices } = await supabase
            .from('challenge_announcements')
            .select('*')
            .eq('challenge_id', challengeData.id)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(3);

          setAnnouncements(notices || []);

          const { data: gamifData } = await supabase
            .from('student_gamification_state')
            .select('current_streak')
            .eq('student_id', user.id)
            .eq('challenge_id', challengeData.id)
            .maybeSingle();

          if (gamifData?.current_streak) {
            setCurrentStreak(gamifData.current_streak);
          }
        }

        // Carregar listas de missões personalizadas da turma
        if (challengeData?.id) {
          const { data: cLists } = await supabase
            .from('challenge_mission_lists')
            .select('*')
            .eq('challenge_id', challengeData.id)
            .order('order_index', { ascending: true });
          if (cLists && cLists.length > 0) {
            setMissionLists(cLists);
          }
        }

        const { data: rawMissions } = challengeData?.id
          ? await supabase
              .from('missions')
              .select('id, title, category, list_id, validation_type, daily_limit, points_rewarded, target_frequency, week_id, order_index, is_bonus')
              .eq('challenge_id', challengeData.id)
              .order('order_index', { ascending: true })
          : { data: [] };

        // Filtrar missões apenas da semana ativa atual para não multiplicar as metas semanais por 4
        let allMissions = rawMissions || [];
        if (challengeData?.id && allMissions.length > 0) {
          const startRaw = challengeData.start_date
            ? new Date(challengeData.start_date + 'T00:00:00')
            : new Date(new Date().setHours(0, 0, 0, 0));
          const nowDay = new Date();
          nowDay.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((nowDay.getTime() - startRaw.getTime()) / 86400000);
          const weeksArr = Array.isArray(challengeData.challenge_weeks) ? challengeData.challenge_weeks : [];
          const maxW = Math.max(4, ...weeksArr.map((w: any) => Number(w.week_number) || 0));
          const activeWeekNum = Math.min(maxW, Math.max(1, Math.floor(Math.max(0, diffDays) / 7) + 1));
          const activeWeekObj = weeksArr.find((w: any) => Number(w.week_number) === activeWeekNum);

          if (activeWeekObj?.id) {
            const weekFiltered = allMissions.filter(
              (m: any) => m.week_id === activeWeekObj.id || (activeWeekNum === 1 && !m.week_id)
            );
            if (weekFiltered.length > 0 || activeWeekNum > 1) {
              allMissions = weekFiltered;
            }
          }
        }

        const { data: userSubmissions } = await supabase
          .from('student_submissions')
          .select('mission_id, status, submitted_at, client_captured_at, missions(category)')
          .eq('student_id', user.id);

        const approvedMissionIds = new Set(
          (userSubmissions || []).filter((s: any) => s.status === 'approved').map((s: any) => s.mission_id)
        );
        const submittedMissionIds = new Set(
          (userSubmissions || []).filter((s: any) => s.status === 'approved' || s.status === 'pending').map((s: any) => s.mission_id)
        );

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        let todayTreinoDone = false;
        let todayCardioDone = false;

        (userSubmissions || []).forEach((s: any) => {
          const dt = new Date(s.submitted_at || s.client_captured_at);
          if (dt >= startOfToday) {
            if (s.missions?.category === 'treino') todayTreinoDone = true;
            if (s.missions?.category === 'cardio') todayCardioDone = true;
          }
        });

        setTodayLockedCategories({ treino: todayTreinoDone, cardio: todayCardioDone });

        let tDone = 0, tTot = 0;
        let cDone = 0, cTot = 0;
        let rDone = 0, rTot = 0;
        let hDone = 0, hTot = 0;
        const lCounts: Record<string, { done: number; total: number }> = {};

        allMissions?.forEach((m: any) => {
          const freq = m.target_frequency || 1;
          const isDone = approvedMissionIds.has(m.id);
          const listKey = m.list_id || m.category;
          if (!lCounts[listKey]) {
            lCounts[listKey] = { done: 0, total: 0 };
          }
          lCounts[listKey].total += freq;
          if (isDone) lCounts[listKey].done += freq;

          if (m.category === 'treino') {
            tTot += freq;
            if (isDone) tDone += freq;
          } else if (m.category === 'cardio') {
            cTot += freq;
            if (isDone) cDone += freq;
          } else if (m.category === 'refeicao') {
            rTot += freq;
            if (isDone) rDone += freq;
          } else {
            hTot += freq;
            if (isDone) hDone += freq;
          }
        });

        setCategoryCounts({
          treinos: { done: tDone, total: tTot },
          cardios: { done: cDone, total: cTot },
          refeicoes: { done: rDone, total: rTot },
          habitos: { done: hDone, total: hTot },
        });
        setListCounts(lCounts);

        // Selecionar a próxima missão disponível de cada lista/categoria para o Checklist de Hoje
        const nextByCat: Record<string, any> = {};
        (allMissions || []).forEach((m: any) => {
          const groupKey = m.list_id || m.category;
          if (!submittedMissionIds.has(m.id) && !nextByCat[groupKey]) {
            nextByCat[groupKey] = m;
          }
        });
        setTodayTasks(Object.values(nextByCat));
      } catch (err) {
        console.error('Erro na tela de início:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, [supabase, router, refreshKey]);

  const handleEnterChallengeByCode = () => {
    let code = inviteCodeInput.trim();
    if (!code) return;
    if (code.includes('/join/')) {
      code = code.split('/join/')[1].split('?')[0].split('/')[0];
    }
    router.push(`/join/${code}`);
  };

  // Cálculo dinâmico do Dia e Semana reais da turma
  const challengeTimeline = useMemo(() => {
    if (!challenge?.start_date) {
      return { currentDay: 1, totalDays: 30, currentWeek: 1 };
    }
    const start = new Date(challenge.start_date + 'T00:00:00');
    const end = challenge.end_date
      ? new Date(challenge.end_date + 'T23:59:59')
      : new Date(start.getTime() + 30 * 86400000);
    const now = new Date();

    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
    const elapsedDays = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
    const currentDay = Math.min(totalDays, Math.max(1, elapsedDays));
    const currentWeek = Math.max(1, Math.ceil(currentDay / 7));

    return { currentDay, totalDays, currentWeek };
  }, [challenge]);

  const totalWeeklyGoals =
    categoryCounts.treinos.total +
    categoryCounts.cardios.total +
    categoryCounts.refeicoes.total +
    categoryCounts.habitos.total;

  const totalWeeklyDone =
    categoryCounts.treinos.done +
    categoryCounts.cardios.done +
    categoryCounts.refeicoes.done +
    categoryCounts.habitos.done;

  const weeklyPercentage = totalWeeklyGoals > 0
    ? Math.min(100, Math.round((totalWeeklyDone / totalWeeklyGoals) * 100))
    : 0;

  // Identifica a próxima meta prioritária para o Card de Ação Focal
  const focalTask = useMemo(() => {
    if (!todayTasks || todayTasks.length === 0) return null;

    if (activeSession) {
      const active = todayTasks.find((t) => t.id === activeSession.missionId);
      if (active) return { ...active, isSessionActive: true };
    }

    const pendingTreino = todayTasks.find(
      (t) => t.category === 'treino' && !todayLockedCategories.treino
    );
    if (pendingTreino) return pendingTreino;

    const pendingCardio = todayTasks.find(
      (t) => t.category === 'cardio' && !todayLockedCategories.cardio
    );
    if (pendingCardio) return pendingCardio;

    const pendingRefeicao = todayTasks.find((t) => t.category === 'refeicao');
    if (pendingRefeicao) return pendingRefeicao;

    return (
      todayTasks.find((t) => {
        const isLocked =
          (t.category === 'treino' && todayLockedCategories.treino) ||
          (t.category === 'cardio' && todayLockedCategories.cardio);
        return !isLocked;
      }) || null
    );
  }, [todayTasks, activeSession, todayLockedCategories]);

  const handleTaskClick = async (task: any) => {
    const isLocked =
      (task.category === 'treino' && todayLockedCategories.treino) ||
      (task.category === 'cardio' && todayLockedCategories.cardio);

    if (isLocked) return;

    const valType =
      task.validation_type ||
      (task.category === 'treino' || task.category === 'cardio'
        ? 'timer'
        : task.category === 'habito'
        ? 'simple_click'
        : 'photo');

    if (valType === 'timer') {
      if (activeSession?.missionId === task.id) {
        router.push(`/app/camera/${task.id}`);
        return;
      }
      startSession(task.id, task.title, task.category);
    } else if (valType === 'simple_click') {
      await handleSimpleCheckin(task);
    } else {
      router.push(`/app/camera/${task.id}`);
    }
  };

  const handleSimpleCheckin = async (task: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload: any = {
        mission_id: task.id,
        student_id: user.id,
        challenge_id: challenge?.id || null,
        status: 'approved',
        client_captured_at: new Date().toISOString(),
        caption: 'Check-in direto 1-toque confirmado',
      };

      const { error } = await supabase.from('student_submissions').insert(payload);
      if (error) {
        await supabase.from('student_submissions').insert({ ...payload, photo_url: 'simple_click' });
      }

      setTodayTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, isCompleted: true } : t))
      );
      setStanding((prev: any) => ({
        ...prev,
        total_points: (prev?.total_points || 0) + (task.points_rewarded || 10),
      }));
      showToast(`Check-in de "${task.title}" concluído! (+${task.points_rewarded || 10} XP)`);
    } catch (err: any) {
      console.error('Erro no check-in 1-toque:', err);
      showToast('Erro ao registrar check-in: ' + err.message);
    }
  };

  const streakRisk = useMemo(() => {
    const completedToday = todayTasks.filter((t) => t.isCompleted).length;
    return checkStreakRisk({ todayCompletedCount: completedToday });
  }, [todayTasks]);

  useEffect(() => {
    if (streakRisk.isAtRisk && typeof window !== 'undefined') {
      const alerted = sessionStorage.getItem('arena_streak_alert_sent');
      if (!alerted) {
        sessionStorage.setItem('arena_streak_alert_sent', 'true');
        sendBrowserNotification('ArenaFit: Ofensiva em Risco', {
          body: streakRisk.alertMessage,
        });
      }
    }
  }, [streakRisk.isAtRisk, streakRisk.alertMessage]);

  if (loading && isInitialBoot) {
    return <MobileLoadingScreen fullScreen={true} />;
  }

  const topAnnouncement = announcements[0] || null;

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 md:p-8 space-y-5 bg-black text-white selection:bg-white selection:text-black w-full pb-28 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* 1. Header do Atleta */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div className="flex items-center gap-3">
          <Link href="/app/profile">
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-b from-white via-zinc-400 to-zinc-900 p-px shadow-[0_0_15px_rgba(255,255,255,0.15)] active:scale-95 transition-all cursor-pointer">
              <div className="h-full w-full bg-black rounded-[15px] flex items-center justify-center font-bold text-white text-base overflow-hidden">
                {student?.avatar_url ? (
                  <img
                    src={student.avatar_url}
                    alt={student.full_name || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  student?.full_name?.charAt(0) || 'A'
                )}
              </div>
            </div>
          </Link>

          <div>
            <span className="text-xs text-zinc-400 font-medium block">
              {challenge?.title || 'Olá, atleta'}
            </span>
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">
              {student?.full_name?.split(' ')[0] || 'Atleta'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sino de Notificações com Badge */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative h-10 w-10 rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
            title="Notificações e Alertas"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-amber-400 text-black text-[11px] font-mono font-black flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Badge Streak Tipográfico */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              {currentStreak}D OFENSIVA
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="relative z-10 space-y-4 pt-2 animate-pulse">
          <div className="h-44 rounded-3xl bg-white/[0.04] border border-white/10" />
          <div className="h-32 rounded-3xl bg-white/[0.04] border border-white/10" />
          <div className="h-48 rounded-3xl bg-white/[0.04] border border-white/10" />
        </div>
      ) : !challenge ? (
        /* Tela de Primeiro Acesso - Exige Convite/QR Code ou Pagamento Pendente */
        <div className="relative z-10 space-y-4 pt-2">
          {pendingChallenge && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  Inscrição Aguardando Pagamento Pix
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200">
                Você iniciou a inscrição na turma <strong>{pendingChallenge.title}</strong> (R$ {Number(pendingChallenge.price || 0).toFixed(2)}).
              </p>
              <Link href={`/join/${pendingChallenge.id}`} className="block pt-1">
                <button className="w-full min-h-[44px] py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs sm:text-sm font-mono transition-colors cursor-pointer">
                  Concluir Pagamento no Pix →
                </button>
              </Link>
            </div>
          )}

          <SpotlightCard3D className="p-6 sm:p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/20 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.08)]">
              <QrCode className="h-8 w-8 text-white" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                ACESSO À ARENA
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Conecte-se à sua Turma
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-md mx-auto leading-relaxed">
                Digite o <strong>Código de Convite</strong> fornecido pelo seu treinador para liberar seu cronograma de missões com auditoria por IA e disputar o pódio da sua turma.
              </p>
            </div>

            <div className="pt-2 space-y-3 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Ex: VERAO-2026 ou link do convite..."
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                className="w-full bg-black/70 border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/50 font-mono transition-colors"
              />
              <button
                type="button"
                onClick={handleEnterChallengeByCode}
                className="mono-button-primary w-full min-h-[48px] py-3.5 text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
              >
                <span>Validar e Entrar na Turma</span>
                <ArrowRight className="h-4 w-4 text-black" />
              </button>
            </div>
          </SpotlightCard3D>
        </div>
      ) : (
        <>
          {/* Alerta de Urgência de Streak (Proteção das 20h) */}
          {streakRisk.isAtRisk && (
            <div className="relative z-10 p-4 rounded-2xl bg-zinc-950 border border-amber-500/40 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-mono font-bold text-amber-300 uppercase tracking-wider">
                  OFENSIVA EM RISCO ({currentStreak} DIAS ATIVOS)
                </p>
                <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
                  Faltam {streakRisk.hoursLeft}h para a meia-noite. Registre seu check-in de hoje.
                </p>
              </div>
              <Link href="/app/missions">
                <button className="min-h-[40px] px-4 py-2 rounded-xl bg-white text-black text-xs font-mono font-bold shrink-0 transition-colors cursor-pointer">
                  SALVAR
                </button>
              </Link>
            </div>
          )}

          {/* 1.5 Banner de Aviso em Destaque do Treinador */}
          {topAnnouncement && (
            <div className="relative z-10">
              <div className="p-4 rounded-2xl border border-white/10 bg-zinc-950 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                    {topAnnouncement.is_pinned ? 'AVISO FIXADO' : 'AVISO DO TREINADOR'}
                  </span>
                  <Link
                    href="/app/materials?tab=avisos"
                    className="text-xs font-mono text-zinc-400 hover:text-white"
                  >
                    VER TODOS ({announcements.length}) →
                  </Link>
                </div>
                <p className="text-sm font-bold text-white leading-tight">{topAnnouncement.title}</p>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2">
                  {topAnnouncement.content}
                </p>
              </div>
            </div>
          )}

          {/* 2. CARD DE AÇÃO FOCAL: O Próximo Passo de Hoje */}
          {focalTask ? (
            <div className="relative z-10">
              <div className="p-5 sm:p-6 rounded-3xl border border-white/15 bg-zinc-950 shadow-2xl space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-200">
                      PRÓXIMA AÇÃO
                    </span>
                    {activeSession?.missionId === focalTask.id && (
                      <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider">
                        EM ANDAMENTO
                      </span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                    +{focalTask.points_rewarded} XP
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                    {focalTask.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {focalTask.category === 'treino'
                      ? 'Inicie o cronômetro oficial e comprove a execução com a câmera antifraude ao terminar.'
                      : focalTask.category === 'cardio'
                      ? 'Ative a sessão de cardio para registrar tempo e intensidade na turma.'
                      : focalTask.category === 'refeicao'
                      ? 'Fotografe seu prato ao vivo para estimativa de macronutrientes e calorias por IA.'
                      : 'Mantenha a regularidade para proteger sua sequência e pontuar no ranking da turma.'}
                  </p>
                </div>

                {/* Botão de Ação Focal */}
                <div className="pt-2">
                  {focalTask.category === 'treino' || focalTask.category === 'cardio' ? (
                    activeSession?.missionId === focalTask.id ? (
                      <button
                        onClick={() => router.push(`/app/camera/${focalTask.id}`)}
                        className="w-full min-h-[48px] py-3.5 text-xs sm:text-sm font-mono font-black tracking-wider rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        FINALIZAR SESSÃO & REGISTRAR FOTO →
                      </button>
                    ) : (
                      <button
                        onClick={() => startSession(focalTask.id, focalTask.title, focalTask.category)}
                        className="w-full min-h-[48px] py-3.5 text-xs sm:text-sm font-mono font-black tracking-wider rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        INICIAR {focalTask.category === 'treino' ? 'TREINO' : 'CARDIO'} AGORA →
                      </button>
                    )
                  ) : (
                    <Link href={`/app/camera/${focalTask.id}`} className="block w-full">
                      <button className="w-full min-h-[48px] py-3.5 text-xs sm:text-sm font-mono font-black tracking-wider rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer">
                        REGISTRAR FOTO AO VIVO →
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-zinc-950 text-center space-y-1.5">
                <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold block">
                  TODAS AS METAS DE HOJE CONCLUÍDAS
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto">
                  Excelente consistência. Seu streak está seguro e seus pontos foram computados.
                </p>
              </div>
            </div>
          )}

          {/* 3. RADAR DE PROGRESSO SEMANAL & PLACAR */}
          <div className="relative z-10">
            <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-zinc-950 space-y-3.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase block">JORNADA SEMANAL</span>
                  <span className="font-bold text-white mt-0.5 block">
                    Semana {challengeTimeline.currentWeek} • Dia {challengeTimeline.currentDay}/{challengeTimeline.totalDays}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-black font-mono text-white">
                    {weeklyPercentage}%
                  </span>
                  <span className="text-xs text-zinc-400 block font-mono">
                    {totalWeeklyDone}/{totalWeeklyGoals} METAS
                  </span>
                </div>
              </div>

              {/* Barra de Progresso Minimalista */}
              <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${Math.max(4, weeklyPercentage)}%` }}
                />
              </div>

              {/* 3 Métricas Rápidas */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/[0.06]">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span className="text-[11px] text-zinc-400 block uppercase font-mono tracking-wider">PONTOS</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono block mt-0.5">
                    {standing?.total_points || 0}
                  </span>
                </div>

                <Link
                  href="/app/leaderboard"
                  className="p-3 rounded-xl bg-black/40 border border-white/5 text-center hover:border-white/20 transition-colors block group"
                  title="Ver Classificação Geral"
                >
                  <span className="text-[11px] text-zinc-400 block uppercase font-mono tracking-wider group-hover:text-white">POSIÇÃO</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono block mt-0.5">
                    {rank}
                  </span>
                </Link>

                <Link
                  href="/app/materials"
                  className="p-3 rounded-xl bg-black/40 border border-white/5 text-center hover:border-white/20 transition-colors block group"
                  title="Ver Arquivos do Treinador"
                >
                  <span className="text-[11px] text-zinc-400 block uppercase font-mono tracking-wider group-hover:text-white">GUIA/PDF</span>
                  <span className="text-xs sm:text-sm font-black text-zinc-200 font-mono block mt-1">
                    ACESSAR →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4. BLOCOS DE MISSÕES DE HOJE */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">
                BLOCOS DE EXECUÇÃO DE HOJE
              </span>
              <Link href="/app/missions" className="text-xs text-amber-300 hover:text-white transition-colors font-mono font-bold tracking-wider">
                VER SEMANAS 1 A 4 →
              </Link>
            </div>

            {[
              {
                id: 'fisico',
                title: 'Bloco de Treino & Condicionamento',
                subtitle: 'Sessões físicas com cronômetro e câmera (1/dia)',
                categories: ['treino', 'cardio'],
                borderClass: 'border-amber-500/20',
                badgeClass: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
              },
              {
                id: 'rotina',
                title: 'Bloco de Nutrição & Hábitos',
                subtitle: 'Pratos auditados por IA e metas de rotina',
                categories: ['refeicao', 'habito'],
                borderClass: 'border-emerald-500/20',
                badgeClass: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
              },
            ].map((group) => {
              const groupTasks = todayTasks.filter((t) => group.categories.includes(t.category));
              if (groupTasks.length === 0) return null;

              return (
                <div
                  key={group.id}
                  className={`p-4 sm:p-5 rounded-3xl bg-zinc-950/95 border ${group.borderClass} space-y-3`}
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white tracking-tight">{group.title}</h4>
                      <p className="text-xs text-zinc-400">{group.subtitle}</p>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase shrink-0 ${group.badgeClass}`}>
                      {groupTasks.length} {groupTasks.length === 1 ? 'missão' : 'missões'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {groupTasks.map((task) => {
                      const isDailyLocked =
                        (task.category === 'treino' && todayLockedCategories.treino) ||
                        (task.category === 'cardio' && todayLockedCategories.cardio);
                      const isRunningThis = activeSession?.missionId === task.id;

                      const customList = task.list_id ? missionLists.find((l) => l.id === task.list_id) : null;
                      const catMeta: Record<string, { label: string; color: string }> = {
                        treino: { label: 'TREINO', color: 'text-amber-300 border-amber-500/25 bg-amber-500/10' },
                        cardio: { label: 'CARDIO', color: 'text-cyan-300 border-cyan-500/25 bg-cyan-500/10' },
                        refeicao: { label: 'NUTRIÇÃO', color: 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10' },
                        habito: { label: 'HÁBITO', color: 'text-purple-300 border-purple-500/25 bg-purple-500/10' },
                      };
                      const defaultMeta = catMeta[task.category] || catMeta.habito;
                      const meta = customList
                        ? {
                            label: customList.name.toUpperCase(),
                            color: 'text-zinc-200 border-white/10 bg-white/5',
                          }
                        : defaultMeta;

                      return (
                        <div
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          className={`p-3.5 rounded-2xl bg-black/60 border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                            isDailyLocked
                              ? 'opacity-50 border-white/5'
                              : isRunningThis
                              ? 'border-white/40 shadow-lg'
                              : 'border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[11px] font-mono tracking-wider font-bold px-2 py-0.5 rounded border ${meta.color}`}>
                                {meta.label}
                              </span>
                              <span className="text-xs font-mono font-bold text-amber-300">
                                +{task.points_rewarded} XP
                              </span>
                            </div>
                            <p className={`text-xs sm:text-sm font-bold truncate ${isDailyLocked ? 'line-through text-zinc-500' : 'text-white'}`}>
                              {task.title}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {isDailyLocked ? (
                              <span className="text-[11px] font-mono text-emerald-400 tracking-wider uppercase font-bold">
                                CONCLUÍDO
                              </span>
                            ) : isRunningThis ? (
                              <span className="text-[11px] font-mono font-bold text-white tracking-wider uppercase">
                                EM ANDAMENTO
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-mono font-bold text-white">
                                Iniciar →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. PROGRESSO POR PILAR / LISTAS DE MISSÕES */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">
                {missionLists.length > 0 ? 'PROGRESSO POR LISTA' : 'PROGRESSO POR PILAR'}
              </span>
              <Link href="/app/missions" className="text-xs text-zinc-400 hover:text-white transition-colors font-mono tracking-wider">
                VER TODOS →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {missionLists.length > 0 ? (
                missionLists.map((list) => {
                  const c = listCounts[list.id] || { done: 0, total: 0 };
                  const pct = c.total > 0 ? Math.min(100, Math.round((c.done / c.total) * 100)) : 0;
                  return (
                    <Link key={list.id} href={`/app/missions?list=${list.id}`}>
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/25 transition-all space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white text-xs truncate uppercase tracking-wider">
                            {list.name}
                          </span>
                          <span className="text-xs font-mono text-zinc-400 font-bold shrink-0">
                            {c.done}/{c.total}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-white transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                [
                  { key: 'treino', title: 'TREINOS', done: categoryCounts.treinos.done, total: categoryCounts.treinos.total },
                  { key: 'cardio', title: 'CARDIOS', done: categoryCounts.cardios.done, total: categoryCounts.cardios.total },
                  { key: 'refeicao', title: 'NUTRIÇÃO', done: categoryCounts.refeicoes.done, total: categoryCounts.refeicoes.total },
                  { key: 'habito', title: 'HÁBITOS', done: categoryCounts.habitos.done, total: categoryCounts.habitos.total },
                ].map((cat) => {
                  const pct = cat.total > 0 ? Math.min(100, Math.round((cat.done / cat.total) * 100)) : 0;
                  return (
                    <Link key={cat.key} href={`/app/missions?cat=${cat.key}`}>
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 hover:border-white/25 transition-all space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white text-xs font-mono tracking-wider">{cat.title}</span>
                          <span className="text-xs font-mono text-zinc-400 font-bold">
                            {cat.done}/{cat.total}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-white transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Floating Instant Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2.5 rounded-full font-mono font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Central de Notificações Drawer */}
      {student && (
        <NotificationsDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          studentId={student.id}
          challengeId={challenge?.id}
        />
      )}
    </div>
  );
}
