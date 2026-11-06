'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Flame, 
  CheckCircle, 
  Trophy, 
  Activity, 
  BookOpen, 
  User, 
  LogOut, 
  Sparkles, 
  ChevronRight,
  Target,
  Award,
  Dumbbell,
  Utensils,
  Droplets,
  Smartphone,
  Download,
  Play,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useWorkoutSession } from '@/lib/workout-session-context';
import { triggerStudentTour } from '@/components/student/student-onboarding-tour';

export function openStudentMenu() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('arena_open_student_menu'));
  }
}

export function StudentMenuTrigger({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openStudentMenu}
      aria-label="Abrir Menu"
      title="Menu Geral"
      className={`h-11 w-11 min-h-[44px] min-w-[44px] rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 shrink-0 ${className}`}
    >
      <Menu className="h-5 w-5 stroke-[2]" />
    </button>
  );
}

export function StudentBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { activeSession, startSession, finishSession } = useWorkoutSession();

  const [showQuickSheet, setShowQuickSheet] = useState(false);
  const [showVerticalMenu, setShowVerticalMenu] = useState(false);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);
  const [missionLists, setMissionLists] = useState<any[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isProfessional, setIsProfessional] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadQuickMissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sData } = await supabase
      .from('students')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    setStudentInfo(sData || { full_name: user.email?.split('@')[0] });

    const isMetaProf = user.user_metadata?.role === 'professional';
    const hasProfCookie = typeof document !== 'undefined' && document.cookie.includes('arena_role=professional');

    const { data: prof } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (prof || isMetaProf || hasProfCookie) {
      setIsProfessional(true);
    }

    // Buscar desafio ativo do aluno (isolamento multi-tenant)
    const { data: part } = await supabase
      .from('challenge_participants')
      .select('challenge_id, challenges(start_date, challenge_weeks(id, week_number))')
      .eq('student_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!part?.challenge_id) {
      setPendingMissions([]);
      return;
    }

    // Buscar listas customizadas da turma
    const { data: listsData } = await supabase
      .from('challenge_mission_lists')
      .select('*')
      .eq('challenge_id', part.challenge_id)
      .order('order_index', { ascending: true });

    setMissionLists(listsData || []);

    const { data: rawMData } = await supabase
      .from('missions')
      .select('id, challenge_id, week_id, title, category, list_id, validation_type, daily_limit, points_rewarded, order_index, is_daily_reset')
      .eq('challenge_id', part.challenge_id)
      .order('order_index', { ascending: true });

    let mData = rawMData || [];
    const chObj: any = Array.isArray(part.challenges) ? part.challenges[0] : part.challenges;
    if (chObj && mData.length > 0) {
      const startRaw = chObj.start_date
        ? new Date(chObj.start_date + 'T00:00:00')
        : new Date(new Date().setHours(0, 0, 0, 0));
      const nowDay = new Date();
      nowDay.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((nowDay.getTime() - startRaw.getTime()) / 86400000);
      const weeksArr = Array.isArray(chObj.challenge_weeks) ? chObj.challenge_weeks : [];
      const maxW = Math.max(4, ...weeksArr.map((w: any) => Number(w.week_number) || 0));
      const activeWeekNum = Math.min(maxW, Math.max(1, Math.floor(Math.max(0, diffDays) / 7) + 1));
      const activeWeekObj = weeksArr.find((w: any) => Number(w.week_number) === activeWeekNum);

      if (activeWeekObj?.id) {
        const weekFiltered = mData.filter(
          (m: any) => m.week_id === activeWeekObj.id || (activeWeekNum === 1 && !m.week_id)
        );
        if (weekFiltered.length > 0 || activeWeekNum > 1) {
          mData = weekFiltered;
        }
      }
    }

    const { data: userSubs } = await supabase
      .from('student_submissions')
      .select('mission_id, status, submitted_at, client_captured_at, missions(category)')
      .eq('student_id', user.id);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const dailyDoneTodayIds = new Set<string>();
    let treinoLockedToday = false;
    let cardioLockedToday = false;

    (userSubs || []).forEach((s: any) => {
      const dt = new Date(s.submitted_at || s.client_captured_at);
      if (dt >= startOfToday) {
        if (s.status === 'approved' || s.status === 'pending') {
          dailyDoneTodayIds.add(s.mission_id);
        }
        if (s.missions?.category === 'treino') treinoLockedToday = true;
        if (s.missions?.category === 'cardio') cardioLockedToday = true;
      }
    });

    const generalDoneIds = new Set(
      (userSubs || []).filter((s: any) => s.status === 'approved' || s.status === 'pending').map((s: any) => s.mission_id)
    );

    // Filtrar missões disponíveis para hoje:
    // - Para missões com reset diário (refeição, hábitos diários, etc.): libera se NÃO submetida HOJE
    // - Para treino/cardio/outros: 1 de cada grupo, respeitando os bloqueios do dia
    const seenGroups = new Set<string>();
    const available = (mData || []).filter((m: any) => {
      const isDaily = m.is_daily_reset || m.category === 'refeicao';
      if (isDaily) {
        if (dailyDoneTodayIds.has(m.id)) return false;
        return true;
      }

      if (generalDoneIds.has(m.id)) return false;
      const groupKey = m.list_id || m.category;
      if (m.category === 'treino') {
        if (treinoLockedToday || seenGroups.has(groupKey)) return false;
        seenGroups.add(groupKey);
      } else if (m.category === 'cardio') {
        if (cardioLockedToday || seenGroups.has(groupKey)) return false;
        seenGroups.add(groupKey);
      } else {
        if (seenGroups.has(groupKey)) return false;
        seenGroups.add(groupKey);
      }
      return true;
    });

    setPendingMissions(available);
  };

  useEffect(() => {
    loadQuickMissions();
  }, [supabase, showQuickSheet]);

  useEffect(() => {
    const handleOpenMenu = () => setShowVerticalMenu(true);
    window.addEventListener('arena_open_student_menu', handleOpenMenu);
    return () => window.removeEventListener('arena_open_student_menu', handleOpenMenu);
  }, []);

  const handleSimpleCheckin = async (mission: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/submissions/simple-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: mission.id,
          challengeId: mission.challenge_id || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        showToast(json?.error || 'Erro ao registrar check-in.');
        return;
      }

      // Remoção otimista da lista rápida
      setPendingMissions((prev) => prev.filter((m) => m.id !== mission.id));
      showToast(`"${mission.title}" concluída! +${mission.points_rewarded} XP`);

      // Notificar páginas (como a Home) para recarregar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('arena_mission_completed', { detail: { missionId: mission.id } }));
      }
    } catch (err: any) {
      console.error('Erro no check-in rápido:', err);
      showToast('Erro ao registrar check-in.');
    }
  };

  const handleQuickRegister = (mission: any) => {
    const valType = mission.validation_type || (
      mission.category === 'treino' || mission.category === 'cardio' ? 'timer' : 'photo'
    );

    if (valType === 'simple_click') {
      handleSimpleCheckin(mission);
      return;
    }

    setShowQuickSheet(false);
    if (valType === 'timer' || mission.category === 'treino' || mission.category === 'cardio') {
      startSession(mission.id, mission.title, mission.category);
    } else {
      router.push(`/app/camera/${mission.id}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Abas na pílula inferior (Hoje, Missões | Check-in | Ranking, Feed + Menu)
  const leftTabs = [
    { name: 'Hoje', href: '/app', active: pathname === '/app' },
    { name: 'Missões', href: '/app/missions', active: pathname === '/app/missions' },
  ];

  const rightTabs = [
    { name: 'Ranking', href: '/app/leaderboard', active: pathname === '/app/leaderboard' },
    { name: 'Feed', href: '/app/feed', active: pathname === '/app/feed' },
  ];

  // Seções categorizadas do Drawer Vertical
  const verticalMenuSections = [
    {
      category: 'MINHA JORNADA',
      items: [
        {
          title: 'Hoje (Painel Diário)',
          subtitle: 'Metas diárias, água e streak',
          href: '/app',
          icon: Target,
          active: pathname === '/app',
        },
        {
          title: 'Missões da Semana',
          subtitle: 'Treinos, cardios e refeições',
          href: '/app/missions',
          icon: CheckCircle,
          active: pathname === '/app/missions',
        },
        {
          title: 'Placar & Leaderboard',
          subtitle: 'Ranking individual e Squads',
          href: '/app/leaderboard',
          icon: Trophy,
          active: pathname === '/app/leaderboard',
        },
        {
          title: 'Feed da Turma',
          subtitle: 'Fotos e check-ins aprovados',
          href: '/app/feed',
          icon: Activity,
          active: pathname === '/app/feed',
        },
      ],
    },
    {
      category: 'CONTEÚDO & APOIO',
      items: [
        {
          title: 'Materiais de Apoio',
          subtitle: 'PDFs, dietas e treinos do coach',
          href: '/app/materials',
          icon: BookOpen,
          active: pathname === '/app/materials',
        },
      ],
    },
    {
      category: 'CONTA',
      items: [
        {
          title: 'Guia do App',
          subtitle: 'Rever como funcionam câmera, IA e pontos',
          href: '#tour',
          icon: Sparkles,
          active: false,
          isAction: true,
          onClick: () => {
            setShowVerticalMenu(false);
            triggerStudentTour();
          },
        },
        {
          title: 'Meu Perfil & Inscrição',
          subtitle: 'Histórico, streak e comprovantes',
          href: '/app/profile',
          icon: User,
          active: pathname === '/app/profile',
        },
        {
          title: 'Instalar Aplicativo no Celular',
          subtitle: 'Acesso rápido com 1 toque sem barra',
          href: '#install-pwa',
          icon: Smartphone,
          active: false,
          isAction: true,
          onClick: () => {
            setShowVerticalMenu(false);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('arena_open_pwa_prompt'));
            }
          },
        },
        {
          title: 'Conquistas & Medalhas',
          subtitle: 'Badges de mérito e ofensiva',
          href: '/app/profile',
          icon: Award,
          active: false,
        },
      ],
    },
  ];

  return (
    <>
      {/* 1. Menu Inferior Horizontal 100% Simétrico (Hoje, Missões | Check-in | Ranking, Feed) */}
      <nav className="fixed safe-bottom-nav inset-x-0 mx-auto max-w-[440px] sm:max-w-md w-[92%] sm:w-[88%] z-40 transition-all">
        <div className="bg-[#121722]/90 backdrop-blur-xl rounded-full px-3 sm:px-4 py-1.5 flex items-center justify-between shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-[#252D3B]">
          
          {/* Lado Esquerdo (Hoje, Missões) */}
          <div className="flex items-center justify-around flex-1 gap-1">
            {leftTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`min-h-[42px] flex items-center justify-center px-3 sm:px-4 text-xs font-medium transition-all rounded-full whitespace-nowrap ${
                  tab.active
                    ? 'text-white font-semibold bg-[#3478F6] shadow-[0_0_15px_rgba(52,120,246,0.35)]'
                    : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-white/[0.06]'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>

          {/* Botão Central de Check-in em Cromo Puro */}
          <div className="px-2 shrink-0 -my-2.5">
            <button
              onClick={() => setShowQuickSheet(true)}
              className="flex flex-col items-center justify-center group focus:outline-none cursor-pointer"
              title={activeSession ? 'Sessão Ativa em Andamento' : 'Registrar Check-in'}
            >
              <div
                className={`h-12 w-12 rounded-full p-px transition-all ${
                  activeSession
                    ? 'bg-gradient-to-b from-[#75A7FF] via-[#3478F6] to-[#121722] shadow-[0_0_25px_rgba(52,120,246,0.6)] scale-105'
                    : 'bg-gradient-to-b from-[#3478F6] via-[#1B2330] to-[#080A0F] shadow-[0_0_25px_rgba(52,120,246,0.35)] group-hover:scale-105 active:scale-95'
                }`}
              >
                <div className="h-full w-full bg-[#080A0F] rounded-full flex items-center justify-center text-white relative">
                  {activeSession ? (
                    <Play className="w-4 h-4 text-[#75A7FF] fill-[#75A7FF] animate-pulse" />
                  ) : (
                    <svg className="w-5 h-5 text-[#3478F6] group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="3" strokeWidth="2.2" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Lado Direito (Ranking, Feed) */}
          <div className="flex items-center justify-around flex-1 gap-1">
            {rightTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`min-h-[42px] flex items-center justify-center px-3 sm:px-4 text-xs font-medium transition-all rounded-full whitespace-nowrap ${
                  tab.active
                    ? 'text-white font-semibold bg-[#3478F6] shadow-[0_0_15px_rgba(52,120,246,0.35)]'
                    : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-white/[0.06]'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>

        </div>
      </nav>

      {/* 2. Menu Vertical Completo na Esquerda (Side Drawer Deslizante Padrão Universal) */}
      {showVerticalMenu && (
        <div
          onClick={() => setShowVerticalMenu(false)}
          className="fixed inset-0 z-50 flex justify-start bg-black/80 backdrop-blur-md transition-all"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs h-full bg-[#080A0F] border-r border-[#252D3B] p-6 safe-top-drawer safe-bottom-drawer flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200"
          >
            
            {/* Topo do Menu Vertical */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#252D3B]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-b from-[#3478F6] via-zinc-400 to-[#121722] p-px">
                    <div className="h-full w-full bg-[#080A0F] rounded-full flex items-center justify-center font-mono font-bold text-xs text-white overflow-hidden">
                      {studentInfo?.avatar_url ? (
                        <img src={studentInfo.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        studentInfo?.full_name?.charAt(0) || 'A'
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#F4F6FA] leading-tight">
                      {studentInfo?.full_name || 'Atleta'}
                    </h3>
                    <span className="text-[10px] font-mono text-[#A7B0C0] uppercase">
                      Turma Oficial
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowVerticalMenu(false)}
                  aria-label="Fechar menu"
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-[#121722] border border-[#252D3B] text-[#A7B0C0] hover:text-[#F4F6FA] flex items-center justify-center cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Lista Vertical de Módulos Categorizados */}
              <div className="space-y-4">
                {verticalMenuSections.map((section) => (
                  <div key={section.category} className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7B0C0] font-bold block px-1">
                      {section.category}
                    </span>
                    <div className="space-y-1">
                      {section.items.map((item: any) => {
                        const Icon = item.icon;
                        if (item.isAction) {
                          return (
                            <button
                              key={item.title}
                              type="button"
                              onClick={item.onClick}
                              className="w-full flex items-center justify-between p-2.5 min-h-[44px] rounded-xl border border-[#252D3B] bg-[#121722] text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330] transition-all text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1.5 rounded-lg bg-white/5 text-[#A7B0C0]">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-[#F4F6FA] leading-tight truncate">
                                    {item.title}
                                  </div>
                                  <p className="text-[10px] text-[#A7B0C0] leading-tight truncate mt-0.5">
                                    {item.subtitle}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#A7B0C0] shrink-0" />
                            </button>
                          );
                        }

                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setShowVerticalMenu(false)}
                            className={`flex items-center justify-between p-2.5 min-h-[44px] rounded-xl border transition-all ${
                              item.active
                                ? 'bg-[#3478F6]/15 border-[#3478F6]/40 text-[#F4F6FA] shadow-md'
                                : 'bg-[#121722]/80 border-[#252D3B] text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#1B2330]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-lg ${item.active ? 'bg-[#3478F6] text-white' : 'bg-white/5 text-[#A7B0C0]'}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-[#F4F6FA] leading-tight truncate">
                                  {item.title}
                                </div>
                                <p className="text-[10px] text-[#A7B0C0] leading-tight truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[#A7B0C0] shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé do Menu Vertical */}
            <div className="pt-6 border-t border-[#252D3B] space-y-3">
              {isProfessional && (
                <Link
                  href="/dashboard"
                  onClick={() => setShowVerticalMenu(false)}
                  className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#3478F6] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#75A7FF] transition-all shadow-md active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                  <span>Voltar ao Painel do Coach</span>
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#121722] border border-[#252D3B] text-xs font-medium text-[#A7B0C0] hover:text-white transition-colors text-center cursor-pointer"
              >
                Sair da Conta
              </button>
              <p className="text-[11px] text-[#A7B0C0] text-center">
                ArenaFitPro
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 3. Bottom Sheet Rápido de Check-in ao tocar na Câmera */}
      {showQuickSheet && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-end items-center">
          <div className="bg-[#121722] w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto rounded-t-[32px] p-6 safe-bottom-drawer space-y-4 max-h-[85vh] flex flex-col border-t border-[#252D3B]">
            {/* Header do Sheet */}
            <div className="flex items-center justify-between pb-3 border-b border-[#252D3B]">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#F4F6FA] flex items-center gap-2">
                  <span>Check-in Rápido</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#3478F6]/15 border border-[#3478F6]/30 text-[#75A7FF]">
                    {pendingMissions.length} pendente{pendingMissions.length !== 1 ? 's' : ''}
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-[#A7B0C0] mt-0.5">Escolha a atividade para comprovar sua meta de hoje</p>
              </div>
              <button
                onClick={() => setShowQuickSheet(false)}
                aria-label="Fechar check-in rápido"
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-[#1B2330] border border-[#252D3B] text-[#A7B0C0] hover:text-[#F4F6FA] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Destaque de Sessão Ativa (se houver treino ou cardio rodando) */}
            {activeSession && (
              <div className="p-3.5 rounded-2xl bg-[#1B2330] border border-[#3478F6]/40 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(52,120,246,0.15)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-[#3478F6]/20 border border-[#3478F6]/40 flex items-center justify-center text-[#75A7FF] font-bold text-xs shrink-0 animate-pulse">
                    <Play className="w-3.5 h-3.5 fill-[#75A7FF]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-[#75A7FF] uppercase tracking-wider block font-bold">
                      Sessão em Andamento
                    </span>
                    <p className="font-bold text-xs sm:text-sm text-[#F4F6FA] truncate">
                      {activeSession.missionTitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowQuickSheet(false);
                    const sessionData = finishSession();
                    if (sessionData) {
                      router.push(
                        `/app/camera/${activeSession.missionId}?duration=${sessionData.durationSeconds}&startedAt=${encodeURIComponent(
                          sessionData.startedAt
                        )}`
                      );
                    }
                  }}
                  className="shrink-0 min-h-[44px] px-4 py-2 rounded-xl bg-[#3478F6] text-white font-mono font-bold text-xs hover:bg-[#75A7FF] transition-all shadow-md flex items-center gap-1 active:scale-95 uppercase tracking-wider cursor-pointer"
                >
                  <span>Finalizar</span>
                </button>
              </div>
            )}

            {/* Lista de Metas Disponíveis para Check-in */}
            <div className="space-y-2.5 overflow-y-auto flex-1 py-1">
              {pendingMissions.length === 0 && !activeSession ? (
                <div className="text-center py-8 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-[#3478F6]/10 border border-[#3478F6]/30 flex items-center justify-center text-[#3478F6] mx-auto">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-[#F4F6FA] uppercase tracking-wider">Todas as metas de hoje cumpridas</p>
                    <p className="text-xs text-[#A7B0C0] mt-1">Excelente disciplina. Seu streak e XP estão garantidos.</p>
                  </div>
                  <Link
                    href="/app/missions"
                    onClick={() => setShowQuickSheet(false)}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1B2330] border border-[#252D3B] text-xs font-mono text-[#F4F6FA] hover:border-[#3478F6]/50 transition-colors"
                  >
                    <span>Ver cronograma da semana</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              ) : (
                pendingMissions.map((m) => {
                  const customList = m.list_id ? missionLists.find((l) => l.id === m.list_id) : null;
                  const valType = m.validation_type || (
                    m.category === 'treino' || m.category === 'cardio' ? 'timer' : 'photo'
                  );
                  const isSimpleClick = valType === 'simple_click';
                  const isTimer = valType === 'timer' || (!m.validation_type && (m.category === 'treino' || m.category === 'cardio'));

                  const catMeta: Record<string, { Icon: any; label: string; color: string }> = {
                    treino: { Icon: Dumbbell, label: 'Treino', color: 'border-[#3478F6]/30 text-[#75A7FF] bg-[#3478F6]/10' },
                    cardio: { Icon: Activity, label: 'Cardio', color: 'border-cyan-400/30 text-cyan-300 bg-cyan-400/10' },
                    refeicao: { Icon: Utensils, label: 'Nutrição', color: 'border-[#3478F6]/30 text-[#3478F6] bg-[#3478F6]/10' },
                    habito: { Icon: Droplets, label: 'Hábito', color: 'border-purple-400/30 text-purple-300 bg-purple-400/10' },
                  };

                  const currentMeta = catMeta[m.category] || { Icon: Target, label: m.category, color: 'border-[#252D3B] text-[#F4F6FA] bg-[#121722]' };
                  const CategoryIcon = currentMeta.Icon;
                  const listLabel = customList?.name || currentMeta.label;

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleQuickRegister(m)}
                      className="w-full p-3.5 rounded-2xl bg-[#1B2330] border border-[#252D3B] hover:border-[#3478F6]/40 hover:bg-[#1B2330]/90 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${currentMeta.color}`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs sm:text-sm text-[#F4F6FA] truncate">{m.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A7B0C0] bg-[#121722] px-2 py-0.5 rounded border border-[#252D3B]">
                              {listLabel}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#75A7FF]">
                              +{m.points_rewarded} XP
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSimpleClick ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimpleCheckin(m);
                            }}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#3478F6] text-white font-mono font-bold text-xs hover:bg-[#75A7FF] transition-colors shadow-sm active:scale-95 uppercase tracking-wider cursor-pointer"
                          >
                            Check-in
                          </button>
                        ) : isTimer ? (
                          <span className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#3478F6] text-white font-mono font-bold text-xs flex items-center gap-1 shadow-sm uppercase tracking-wider">
                            Iniciar Sessão
                          </span>
                        ) : (
                          <span className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#121722] text-[#F4F6FA] font-mono font-medium text-xs border border-[#252D3B] flex items-center gap-1 group-hover:border-[#3478F6]/40 transition-colors uppercase tracking-wider">
                            Foto
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Flutuante da Barra */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-[#121722] border border-[#3478F6]/40 text-[#F4F6FA] px-4 py-2.5 rounded-full font-mono font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3478F6]"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
