'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { FreezeShieldModal } from '@/components/student/freeze-shield-modal';
import { MysteryBoxModal } from '@/components/student/mystery-box-modal';
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
  ShieldCheck, 
  Gift, 
  Flame, 
  Zap, 
  Activity, 
  Utensils, 
  Droplets 
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
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
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

  const [gamState, setGamState] = useState<any>({
    freeze_shields_available: 1,
    freeze_shields_used: 0,
    current_streak: 1,
  });
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isMysteryBoxOpen, setIsMysteryBoxOpen] = useState(false);
  const [alreadyClaimedBox, setAlreadyClaimedBox] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isInitialBoot, setIsInitialBoot] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('arena_booted');
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('arena_booted')) {
      sessionStorage.setItem('arena_booted', 'true');
    }
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
        }

        const { data: allMissions } = challengeData?.id
          ? await supabase
              .from('missions')
              .select('id, title, category, points_rewarded, target_frequency, week_id, order_index, is_bonus')
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

        allMissions?.forEach((m: any) => {
          const freq = m.target_frequency || 1;
          const isDone = approvedMissionIds.has(m.id);

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

        // Selecionar a próxima missão disponível de cada categoria para o Checklist de Hoje
        const nextByCat: Record<string, any> = {};
        (allMissions || []).forEach((m: any) => {
          if (!submittedMissionIds.has(m.id) && !nextByCat[m.category]) {
            nextByCat[m.category] = m;
          }
        });
        setTodayTasks(Object.values(nextByCat));

        if (challengeData) {
          const { data: gs } = await supabase
            .from('student_gamification_state')
            .select('*')
            .eq('student_id', user.id)
            .eq('challenge_id', challengeData.id)
            .maybeSingle();

          if (gs) {
            setGamState(gs);
          } else {
            const { data: newGs } = await supabase
              .from('student_gamification_state')
              .insert({
                student_id: user.id,
                challenge_id: challengeData.id,
                freeze_shields_available: 1,
              })
              .select('*')
              .maybeSingle();
            if (newGs) setGamState(newGs);
          }

          const { data: claim } = await supabase
            .from('student_mystery_box_claims')
            .select('id')
            .eq('student_id', user.id)
            .eq('challenge_id', challengeData.id)
            .eq('week_number', 1)
            .maybeSingle();

          setAlreadyClaimedBox(!!claim);
        }
      } catch (err) {
        console.error('Erro na tela de início:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHome();
  }, [supabase, router]);

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
          <span className="text-xs font-bold text-amber-300 tracking-wide flex items-center gap-1">
            🔥 {gamState.current_streak || 1}d seguidos
          </span>
        </div>
      </div>

      {loading ? (
        <div className="relative z-10 space-y-4 pt-2 animate-pulse">
          <div className="h-36 rounded-3xl bg-white/[0.04] border border-white/10" />
          <div className="h-44 rounded-3xl bg-white/[0.04] border border-white/10" />
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
          {/* 1.5 Banner de Aviso em Destaque do Treinador (Topo da Home) */}
          {topAnnouncement && (
            <div className="relative z-10">
              <div className="mono-glass-card p-3.5 rounded-2xl border border-white/20 bg-white/[0.03] space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {topAnnouncement.is_pinned ? (
                      <Pin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Megaphone className="h-3.5 w-3.5 text-white shrink-0" />
                    )}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                      {topAnnouncement.is_pinned ? 'Comunicado Fixado' : 'Aviso do Treinador'}
                    </span>
                  </div>
                  <Link
                    href="/app/materials?tab=avisos"
                    className="text-[10px] font-mono text-zinc-400 hover:text-white underline"
                  >
                    Ver todos ({announcements.length}) →
                  </Link>
                </div>
                <p className="text-xs font-bold text-white">{topAnnouncement.title}</p>
                <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2">
                  {topAnnouncement.content}
                </p>
              </div>
            </div>
          )}

          {/* 2. Hero Card: Radar de Consistência com 3D Spotlight */}
          <div className="relative z-10">
            <SpotlightCard3D className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 block">
                    Progresso Geral das Missões
                  </span>
                  <span className="text-xs font-medium text-white">
                    Semana {challengeTimeline.currentWeek} • Dia {challengeTimeline.currentDay} de {challengeTimeline.totalDays}
                  </span>
                </div>
                <span className="text-2xl font-black text-emerald-400 font-mono drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                  {weeklyPercentage}%
                </span>
              </div>

              {/* Barra de Progresso com Gradiente Esmeralda Energético */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 rounded-full bg-zinc-900 border border-white/10 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-700"
                    style={{ width: `${Math.max(4, weeklyPercentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span className="text-emerald-400 font-semibold">{totalWeeklyDone} concluídas</span>
                  <span>Meta Total: {totalWeeklyGoals}</span>
                </div>
              </div>

              {/* Grid de 3 Métricas Tabulares */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
                <Link
                  href="/app/leaderboard"
                  className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center hover:border-amber-400/40 transition-colors block"
                  title="Ver Ranking da Turma"
                >
                  <span className="text-[10px] text-zinc-400 block font-medium">Pontos XP</span>
                  <span className="text-base font-black text-amber-400 font-mono block mt-0.5">
                    {standing?.total_points || 0}
                  </span>
                </Link>

                <Link
                  href="/app/leaderboard"
                  className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center hover:border-white/30 transition-colors block"
                  title="Ver Classificação Geral"
                >
                  <span className="text-[10px] text-zinc-400 block font-medium">Posição</span>
                  <span className="text-base font-black text-white font-mono block mt-0.5">
                    {rank}
                  </span>
                </Link>

                <Link
                  href="/app/materials"
                  className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-center hover:border-cyan-400/40 transition-colors block"
                  title="Ver Arquivos e Guias"
                >
                  <span className="text-[10px] text-zinc-400 block font-medium">Jornada</span>
                  <span className="text-base font-black text-cyan-400 font-mono block mt-0.5">
                    D{challengeTimeline.currentDay}/{challengeTimeline.totalDays}
                  </span>
                </Link>
              </div>
            </SpotlightCard3D>
          </div>

          {/* 3. CHECKLIST DE HOJE (Ação Rápida em 1 Toque) */}
          <div className="space-y-2.5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Checklist de Hoje
                </span>
              </div>
              <Link href="/app/missions" className="text-xs text-zinc-400 hover:text-white transition-colors font-mono">
                Cronograma completo →
              </Link>
            </div>

            {todayTasks.length === 0 ? (
              <div className="mono-glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Todas as metas disponíveis foram concluídas!</p>
                  <p className="text-[11px] text-zinc-400">Excelente disciplina. Acompanhe sua posição no ranking.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => {
                  const isDailyLocked =
                    (task.category === 'treino' && todayLockedCategories.treino) ||
                    (task.category === 'cardio' && todayLockedCategories.cardio);
                  const isRunningThis = activeSession?.missionId === task.id;

                  const catMeta: Record<string, { icon: string; label: string; color: string }> = {
                    treino: { icon: '⚡', label: 'Treino do Dia', color: 'text-amber-300 border-amber-500/20 bg-amber-500/10' },
                    cardio: { icon: '🏃', label: 'Cardio do Dia', color: 'text-cyan-300 border-cyan-500/20 bg-cyan-500/10' },
                    refeicao: { icon: '🥗', label: 'Nutrição', color: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10' },
                    habito: { icon: '💧', label: 'Hábito Diário', color: 'text-purple-300 border-purple-500/20 bg-purple-500/10' },
                  };
                  const meta = catMeta[task.category] || catMeta.habito;

                  return (
                    <div
                      key={task.id}
                      className={`mono-glass-card p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                        isDailyLocked ? 'opacity-60' : 'hover:border-white/30'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-zinc-400">
                            +{task.points_rewarded} PTS
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">{task.title}</p>
                      </div>

                      <div className="shrink-0">
                        {isDailyLocked ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl block">
                            ✓ Feito hoje
                          </span>
                        ) : task.category === 'treino' || task.category === 'cardio' ? (
                          isRunningThis ? (
                            <span className="px-3 py-1.5 rounded-xl bg-white text-black font-bold text-xs animate-pulse block">
                              Em andamento...
                            </span>
                          ) : (
                            <button
                              onClick={() => startSession(task.id, task.title, task.category)}
                              className="mono-button-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              <span>Iniciar</span>
                            </button>
                          )
                        ) : (
                          <Link href={`/app/camera/${task.id}`}>
                            <button className="mono-button-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
                              <Camera className="h-3 w-3" />
                              <span>Check-in</span>
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Grid 2x2 de Progresso por Categoria (Incluindo Hábitos & Água) */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Progresso por Pilar
              </span>
              <Link href="/app/missions" className="text-xs text-zinc-400 hover:text-white transition-colors font-mono">
                Filtrar →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  key: 'treino',
                  title: '⚡ Treinos',
                  done: categoryCounts.treinos.done,
                  total: categoryCounts.treinos.total,
                  barClass: 'bg-amber-400',
                },
                {
                  key: 'cardio',
                  title: '🏃 Cardios',
                  done: categoryCounts.cardios.done,
                  total: categoryCounts.cardios.total,
                  barClass: 'bg-cyan-400',
                },
                {
                  key: 'refeicao',
                  title: '🥗 Refeições',
                  done: categoryCounts.refeicoes.done,
                  total: categoryCounts.refeicoes.total,
                  barClass: 'bg-emerald-400',
                },
                {
                  key: 'habito',
                  title: '💧 Hábitos & Água',
                  done: categoryCounts.habitos.done,
                  total: categoryCounts.habitos.total,
                  barClass: 'bg-purple-400',
                },
              ].map((cat) => {
                const pct = cat.total > 0 ? Math.min(100, Math.round((cat.done / cat.total) * 100)) : 0;
                return (
                  <Link key={cat.key} href={`/app/missions?cat=${cat.key}`}>
                    <div className="mono-glass-card p-3.5 rounded-2xl hover:border-white/30 active:scale-98 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{cat.title}</span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {cat.done}/{cat.total}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cat.barClass} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 5. Banner de Acesso Rápido ao Ranking & Arquivos */}
          <div className="grid grid-cols-1 gap-2.5 relative z-10">
            <Link href="/app/leaderboard" className="block group">
              <div className="mono-glass-card p-3.5 rounded-2xl border border-amber-500/25 bg-amber-950/15 hover:border-amber-500/50 active:scale-98 transition-all flex items-center justify-between shadow-[0_4px_20px_rgba(245,158,11,0.08)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-300 font-bold text-lg shrink-0">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-amber-200 transition-colors">
                        Ranking Oficial da Turma
                      </span>
                      <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        AO VIVO
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-0.5 truncate">
                      Você está em <strong className="text-amber-300 font-mono font-bold">{rank}</strong> • {standing?.total_points || 0} XP
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-300 group-hover:text-white transition-colors shrink-0 ml-2">
                  Placar →
                </span>
              </div>
            </Link>
          </div>

          {/* 6. Mecanismos de Retenção: Freeze Shield & Mystery Box */}
          <div className="grid grid-cols-2 gap-2.5 relative z-10">
            <button
              onClick={() => setIsFreezeModalOpen(true)}
              className="mono-glass-card p-4 rounded-3xl text-left border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-950/20 active:scale-98 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Escudo
                </span>
                <span className="text-xs font-bold text-cyan-300 border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 rounded-md font-mono">
                  {gamState.freeze_shields_available}x
                </span>
              </div>
              <p className="text-xs font-bold text-white mt-2 group-hover:underline">
                Freeze Shield
              </p>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                Blinde seu streak hoje
              </p>
            </button>

            <button
              onClick={() => setIsMysteryBoxOpen(true)}
              className="mono-glass-card p-4 rounded-3xl text-left border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-950/20 active:scale-98 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-400" /> Recompensa
                </span>
                <span className="text-xs font-bold text-amber-300 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-md font-mono">
                  {alreadyClaimedBox ? 'OK' : `Sem ${challengeTimeline.currentWeek}`}
                </span>
              </div>
              <p className="text-xs font-bold text-white mt-2 group-hover:underline">
                Mystery Box
              </p>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {alreadyClaimedBox ? 'Resgatada' : weeklyPercentage >= 100 ? 'Pronta para abrir!' : 'Bata 100% da meta'}
              </p>
            </button>
          </div>

          {/* MODAL 1: FREEZE SHIELD */}
          {student && challenge && (
            <FreezeShieldModal
              isOpen={isFreezeModalOpen}
              onClose={() => setIsFreezeModalOpen(false)}
              studentId={student.id}
              challengeId={challenge.id}
              shieldsAvailable={gamState.freeze_shields_available || 0}
              onShieldActivated={() => {
                setGamState((prev: any) => ({
                  ...prev,
                  freeze_shields_available: Math.max(0, (prev.freeze_shields_available || 1) - 1),
                }));
              }}
            />
          )}

          {/* MODAL 2: MYSTERY BOX */}
          {student && challenge && (
            <MysteryBoxModal
              isOpen={isMysteryBoxOpen}
              onClose={() => setIsMysteryBoxOpen(false)}
              studentId={student.id}
              challengeId={challenge.id}
              weekNumber={challengeTimeline.currentWeek}
              isEligible={weeklyPercentage >= 100}
              alreadyClaimed={alreadyClaimedBox}
              onRewardClaimed={(reward) => {
                setAlreadyClaimedBox(true);
                if (reward.reward_type === 'freeze_shield') {
                  setGamState((prev: any) => ({
                    ...prev,
                    freeze_shields_available: (prev.freeze_shields_available || 0) + 1,
                  }));
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
