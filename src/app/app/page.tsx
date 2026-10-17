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
  Circle
} from 'lucide-react';

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

  const [loading, setLoading] = useState(true);
  const [isInitialBoot, setIsInitialBoot] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('arena_booted');
  });

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

        const { data: allMissions } = challengeData?.id
          ? await supabase
              .from('missions')
              .select('id, title, category, list_id, validation_type, daily_limit, points_rewarded, target_frequency, week_id, order_index, is_bonus')
              .eq('challenge_id', challengeData.id)
              .order('order_index', { ascending: true })
          : { data: [] };

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
      showToast(`✓ Check-in de "${task.title}" concluído! (+${task.points_rewarded || 10} XP)`);
    } catch (err: any) {
      console.error('Erro no check-in 1-toque:', err);
      showToast('Erro ao registrar check-in: ' + err.message);
    }
  };

  if (loading && isInitialBoot) {
    return <MobileLoadingScreen fullScreen={true} />;
  }

  const topAnnouncement = announcements[0] || null;

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-4 bg-black text-white selection:bg-white selection:text-black max-w-md mx-auto w-full pb-28 relative">
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
            <span className="text-[11px] text-zinc-400 font-medium block">
              {challenge?.title || 'Olá, atleta'}
            </span>
            <h1 className="text-base font-black text-white leading-tight">
              {student?.full_name?.split(' ')[0] || 'Atleta'}
            </h1>
          </div>
        </div>

        {/* Badge Streak Vibrante */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-amber-300 tracking-wide flex items-center gap-1 font-mono">
            🔥 {currentStreak}d ofensiva
          </span>
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
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  Inscrição Aguardando Pagamento Pix
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Você iniciou a inscrição na turma <strong>{pendingChallenge.title}</strong> (R$ {Number(pendingChallenge.price || 0).toFixed(2)}).
              </p>
              <Link href={`/join/${pendingChallenge.id}`} className="block pt-1">
                <button className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs font-mono transition-colors">
                  Concluir Pagamento no Pix →
                </button>
              </Link>
            </div>
          )}

          <SpotlightCard3D className="p-7 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/20 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.08)]">
              <QrCode className="h-8 w-8 text-white" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                ACESSO À ARENA
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Conecte-se à sua Turma
              </h2>
              <p className="text-xs text-zinc-300 mt-2 max-w-xs mx-auto leading-relaxed">
                Digite o <strong>Código de Convite</strong> fornecido pelo seu treinador para liberar seu cronograma de missões com auditoria por IA e disputar o pódio da sua turma.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <input
                type="text"
                placeholder="Ex: VERAO-2026 ou link do convite..."
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                className="w-full bg-black/70 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/50 font-mono transition-colors"
              />
              <button
                type="button"
                onClick={handleEnterChallengeByCode}
                className="mono-button-primary w-full py-3.5 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                <span>Validar e Entrar na Turma</span>
                <ArrowRight className="h-3.5 w-3.5 text-black" />
              </button>
            </div>
          </SpotlightCard3D>
        </div>
      ) : (
        <>
          {/* 1.5 Banner de Aviso em Destaque do Treinador */}
          {topAnnouncement && (
            <div className="relative z-10">
              <div className="mono-glass-card p-3 rounded-2xl border border-white/15 bg-white/[0.03] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {topAnnouncement.is_pinned ? (
                      <Pin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Megaphone className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                      {topAnnouncement.is_pinned ? 'Aviso Fixado' : 'Aviso do Treinador'}
                    </span>
                  </div>
                  <Link
                    href="/app/materials?tab=avisos"
                    className="text-[10px] font-mono text-zinc-400 hover:text-white"
                  >
                    Ver avisos ({announcements.length}) →
                  </Link>
                </div>
                <p className="text-xs font-bold text-white leading-tight">{topAnnouncement.title}</p>
                <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2">
                  {topAnnouncement.content}
                </p>
              </div>
            </div>
          )}

          {/* 2. CARD DE AÇÃO FOCAL: O Próximo Passo de Hoje */}
          {focalTask ? (
            <div className="relative z-10">
              <SpotlightCard3D className="p-5 relative overflow-hidden border-white/20 bg-gradient-to-b from-zinc-900/90 to-black/90 shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-white/10 text-white border-white/20 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Próxima Ação
                    </span>
                    {activeSession?.missionId === focalTask.id && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                        ● Em Andamento
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                    +{focalTask.points_rewarded} XP
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                    {focalTask.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {focalTask.category === 'treino'
                      ? 'Inicie o cronômetro oficial e comprove a execução com a câmera antifraude ao terminar.'
                      : focalTask.category === 'cardio'
                      ? 'Ative a sessão de cardio para registrar tempo e intensidade na turma.'
                      : focalTask.category === 'refeicao'
                      ? 'Fotografe seu prato ao vivo para estimativa de macronutrientes e calorias por IA.'
                      : 'Mantenha o foco nos seus hábitos diários para proteger seu streak e subir no ranking.'}
                  </p>
                </div>

                {/* Botão de Ação Focal Largo e Ergonômico */}
                <div>
                  {focalTask.category === 'treino' || focalTask.category === 'cardio' ? (
                    activeSession?.missionId === focalTask.id ? (
                      <button
                        onClick={() => router.push(`/app/camera/${focalTask.id}`)}
                        className="mono-button-primary w-full py-3.5 text-xs font-mono font-black flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.2)] bg-emerald-400 text-black hover:bg-emerald-300"
                      >
                        <Camera className="h-4 w-4" />
                        <span>FINALIZAR SESSÃO & REGISTRAR FOTO →</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => startSession(focalTask.id, focalTask.title, focalTask.category)}
                        className="mono-button-primary w-full py-3.5 text-xs font-mono font-black flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>INICIAR {focalTask.category === 'treino' ? 'TREINO' : 'CARDIO'} AGORA →</span>
                      </button>
                    )
                  ) : (
                    <Link href={`/app/camera/${focalTask.id}`} className="block w-full">
                      <button className="mono-button-primary w-full py-3.5 text-xs font-mono font-black flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.25)]">
                        <Camera className="h-4 w-4" />
                        <span>REGISTRAR FOTO AO VIVO →</span>
                      </button>
                    </Link>
                  )}
                </div>
              </SpotlightCard3D>
            </div>
          ) : (
            <div className="relative z-10">
              <SpotlightCard3D className="p-5 text-center border-emerald-500/30 bg-emerald-950/15 space-y-2">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white font-mono">
                  TODAS AS METAS DE HOJE CONCLUÍDAS!
                </h3>
                <p className="text-xs text-zinc-300 max-w-xs mx-auto">
                  Disciplina exemplar. Seu streak está seguro e seus pontos foram somados ao ranking da turma.
                </p>
              </SpotlightCard3D>
            </div>
          )}

          {/* 3. RADAR DE PROGRESSO SEMANAL & PLACAR */}
          <div className="relative z-10">
            <SpotlightCard3D className="p-4 space-y-3 bg-zinc-950/80 border-white/10">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] font-mono text-zinc-400 block">Jornada Semanal</span>
                  <span className="font-bold text-white">
                    Semana {challengeTimeline.currentWeek} • Dia {challengeTimeline.currentDay}/{challengeTimeline.totalDays}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {weeklyPercentage}%
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    {totalWeeklyDone}/{totalWeeklyGoals} metas
                  </span>
                </div>
              </div>

              {/* Barra Esmeralda Fina */}
              <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                  style={{ width: `${Math.max(4, weeklyPercentage)}%` }}
                />
              </div>

              {/* 3 Métricas Rápidas Tabulares */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
                <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span className="text-[9px] text-zinc-400 block uppercase font-mono">Pontos XP</span>
                  <span className="text-sm font-black text-amber-400 font-mono block mt-0.5">
                    {standing?.total_points || 0}
                  </span>
                </div>

                <Link
                  href="/app/leaderboard"
                  className="p-2 rounded-xl bg-black/40 border border-white/5 text-center hover:border-amber-400/40 transition-colors block group"
                  title="Ver Classificação Geral"
                >
                  <span className="text-[9px] text-zinc-400 block uppercase font-mono group-hover:text-amber-300">Posição</span>
                  <span className="text-sm font-black text-white font-mono block mt-0.5 group-hover:text-amber-400">
                    {rank} 🏆
                  </span>
                </Link>

                <Link
                  href="/app/materials"
                  className="p-2 rounded-xl bg-black/40 border border-white/5 text-center hover:border-cyan-400/40 transition-colors block group"
                  title="Ver Arquivos do Treinador"
                >
                  <span className="text-[9px] text-zinc-400 block uppercase font-mono group-hover:text-cyan-300">Guia/PDF</span>
                  <span className="text-sm font-black text-cyan-400 font-mono block mt-0.5">
                    Acessar →
                  </span>
                </Link>
              </div>
            </SpotlightCard3D>
          </div>

          {/* 4. CHECKLIST DIÁRIO COM TOQUE NA LINHA INTEIRA */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Checklist de Hoje
                </span>
              </div>
              <Link href="/app/missions" className="text-[11px] text-zinc-400 hover:text-white transition-colors font-mono">
                Cronograma completo →
              </Link>
            </div>

            <div className="space-y-2">
              {todayTasks.map((task) => {
                const isDailyLocked =
                  (task.category === 'treino' && todayLockedCategories.treino) ||
                  (task.category === 'cardio' && todayLockedCategories.cardio);
                const isRunningThis = activeSession?.missionId === task.id;

                const customList = task.list_id ? missionLists.find((l) => l.id === task.list_id) : null;
                const catMeta: Record<string, { icon: string; label: string; color: string }> = {
                  treino: { icon: '⚡', label: 'Treino', color: 'text-amber-300 border-amber-500/20 bg-amber-500/10' },
                  cardio: { icon: '🏃', label: 'Cardio', color: 'text-cyan-300 border-cyan-500/20 bg-cyan-500/10' },
                  refeicao: { icon: '🥗', label: 'Nutrição', color: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10' },
                  habito: { icon: '💧', label: 'Hábito', color: 'text-purple-300 border-purple-500/20 bg-purple-500/10' },
                };
                const defaultMeta = catMeta[task.category] || catMeta.habito;
                const meta = customList
                  ? {
                      icon: customList.icon || '🎯',
                      label: customList.name,
                      color: 'text-zinc-200 border-white/10 bg-white/5',
                    }
                  : defaultMeta;

                return (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={`mono-glass-card p-3 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                      isDailyLocked
                        ? 'opacity-60 bg-black/40 border-white/5 cursor-default'
                        : isRunningThis
                        ? 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                        : 'hover:border-white/30 hover:bg-white/[0.04] active:scale-[0.99]'
                    }`}
                  >
                    {/* Status Indicator Icon */}
                    <div className="shrink-0">
                      {isDailyLocked ? (
                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      ) : isRunningThis ? (
                        <div className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px] animate-pulse">
                          ▶
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border border-white/20 group-hover:border-white/50 transition-colors flex items-center justify-center text-transparent group-hover:text-white/40">
                          ●
                        </div>
                      )}
                    </div>

                    {/* Mission Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${meta.color}`}>
                          {meta.icon} {meta.label}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          +{task.points_rewarded} XP
                        </span>
                      </div>
                      <p className={`text-xs font-bold truncate ${isDailyLocked ? 'line-through text-zinc-400' : 'text-white'}`}>
                        {task.title}
                      </p>
                    </div>

                    {/* Right Action Pill / Chevron */}
                    <div className="shrink-0">
                      {isDailyLocked ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                          ✓ Feito
                        </span>
                      ) : isRunningThis ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30 animate-pulse">
                          Em andamento
                        </span>
                      ) : (
                        <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-all flex items-center justify-center text-zinc-400">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. PROGRESSO POR PILAR / LISTAS DE MISSÕES */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {missionLists.length > 0 ? 'Progresso por Lista' : 'Progresso por Pilar'}
              </span>
              <Link href="/app/missions" className="text-[11px] text-zinc-400 hover:text-white transition-colors font-mono">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {missionLists.length > 0 ? (
                missionLists.map((list) => {
                  const c = listCounts[list.id] || { done: 0, total: 0 };
                  const pct = c.total > 0 ? Math.min(100, Math.round((c.done / c.total) * 100)) : 0;
                  return (
                    <Link key={list.id} href={`/app/missions?list=${list.id}`}>
                      <div className="mono-glass-card p-2.5 rounded-xl border border-white/5 hover:border-white/20 transition-all space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white text-[11px] truncate flex items-center gap-1.5">
                            <span>{list.icon || '🎯'}</span>
                            <span className="truncate">{list.name}</span>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 font-bold shrink-0">
                            {c.done}/{c.total}
                          </span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-zinc-900 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: list.color || '#3b82f6' }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                [
                  { key: 'treino', title: '⚡ Treinos', done: categoryCounts.treinos.done, total: categoryCounts.treinos.total, barClass: 'bg-amber-400' },
                  { key: 'cardio', title: '🏃 Cardios', done: categoryCounts.cardios.done, total: categoryCounts.cardios.total, barClass: 'bg-cyan-400' },
                  { key: 'refeicao', title: '🥗 Nutrição', done: categoryCounts.refeicoes.done, total: categoryCounts.refeicoes.total, barClass: 'bg-emerald-400' },
                  { key: 'habito', title: '💧 Hábitos', done: categoryCounts.habitos.done, total: categoryCounts.habitos.total, barClass: 'bg-purple-400' },
                ].map((cat) => {
                  const pct = cat.total > 0 ? Math.min(100, Math.round((cat.done / cat.total) * 100)) : 0;
                  return (
                    <Link key={cat.key} href={`/app/missions?cat=${cat.key}`}>
                      <div className="mono-glass-card p-2.5 rounded-xl border border-white/5 hover:border-white/20 transition-all space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white text-[11px]">{cat.title}</span>
                          <span className="text-[10px] font-mono text-zinc-400 font-bold">
                            {cat.done}/{cat.total}
                          </span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-zinc-900 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.barClass} transition-all duration-500`}
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
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-4 py-2.5 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
