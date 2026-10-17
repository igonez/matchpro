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
  Award
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useWorkoutSession } from '@/lib/workout-session-context';

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
      .select('challenge_id')
      .eq('student_id', user.id)
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

    const { data: mData } = await supabase
      .from('missions')
      .select('id, title, category, list_id, validation_type, daily_limit, points_rewarded, order_index')
      .eq('challenge_id', part.challenge_id)
      .order('order_index', { ascending: true });

    const { data: userSubs } = await supabase
      .from('student_submissions')
      .select('mission_id, status, submitted_at, client_captured_at, missions(category)')
      .eq('student_id', user.id);

    const doneIds = new Set(
      (userSubs || []).filter((s: any) => s.status === 'approved' || s.status === 'pending').map((s: any) => s.mission_id)
    );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    let treinoLockedToday = false;
    let cardioLockedToday = false;

    (userSubs || []).forEach((s: any) => {
      const dt = new Date(s.submitted_at || s.client_captured_at);
      if (dt >= startOfToday) {
        if (s.missions?.category === 'treino') treinoLockedToday = true;
        if (s.missions?.category === 'cardio') cardioLockedToday = true;
      }
    });

    // Filtrar apenas missões disponíveis para hoje (1 de cada lista/categoria)
    const seenGroups = new Set<string>();
    const available = (mData || []).filter((m: any) => {
      if (doneIds.has(m.id)) return false;
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

  const handleSimpleCheckin = async (mission: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Remoção otimista da lista rápida
      setPendingMissions((prev) => prev.filter((m) => m.id !== mission.id));
      showToast(`"${mission.title}" concluída! +${mission.points_rewarded} XP`);

      await supabase.from('student_submissions').insert({
        mission_id: mission.id,
        student_id: user.id,
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        client_captured_at: new Date().toISOString(),
      });

      // Notificar páginas (como a Home) para recarregar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('arena_mission_completed', { detail: { missionId: mission.id } }));
      }
    } catch (err: any) {
      console.error('Erro no check-in rápido:', err);
      showToast('Check-in concluído!');
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
          title: 'Meu Perfil & Inscrição',
          subtitle: 'Histórico, streak e comprovantes',
          href: '/app/profile',
          icon: User,
          active: pathname === '/app/profile',
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
      {/* 1. Menu Inferior Horizontal (Pílula com Cantos 100% Arredondados e Palavras Encaixadas) */}
      <nav className="fixed bottom-4 inset-x-0 mx-auto max-w-[420px] w-[96%] z-40 transition-all">
        <div className="mono-glass-pill rounded-full px-2.5 py-1.5 flex items-center justify-between shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-white/15">
          
          {/* Lado Esquerdo (Início, Missões) */}
          <div className="flex items-center justify-around flex-1">
            {leftTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-1 px-2.5 text-[10px] sm:text-[11px] font-mono tracking-wider transition-all rounded-full ${
                  tab.active
                    ? 'text-white font-black bg-white/15 shadow-inner'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>

          {/* Botão Central de Check-in em Cromo Puro */}
          <div className="px-1 -my-2.5">
            <button
              onClick={() => setShowQuickSheet(true)}
              className="flex flex-col items-center justify-center group focus:outline-none"
              title={activeSession ? 'Sessão Ativa em Andamento' : 'Registrar Check-in'}
            >
              <div
                className={`h-11 w-11 rounded-full p-px transition-all ${
                  activeSession
                    ? 'bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-800 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-105'
                    : 'bg-gradient-to-b from-white via-zinc-300 to-zinc-800 shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:scale-105 active:scale-95'
                }`}
              >
                <div className="h-full w-full bg-black rounded-full flex items-center justify-center text-white relative">
                  {activeSession ? (
                    <span className="text-emerald-400 font-bold text-xs animate-pulse">▶</span>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="3" strokeWidth="2" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Lado Direito (Ranking, Feed, Menu) */}
          <div className="flex items-center justify-around flex-1">
            {rightTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-1 px-2.5 text-[10px] sm:text-[11px] font-mono tracking-wider transition-all rounded-full ${
                  tab.active
                    ? 'text-white font-black bg-white/15 shadow-inner'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.name}
              </Link>
            ))}

            {/* Botão para Acionar o Menu Vertical */}
            <button
              onClick={() => setShowVerticalMenu(true)}
              aria-label="Abrir Menu"
              className={`p-1.5 text-zinc-400 hover:text-white transition-all rounded-full hover:bg-white/10 ${
                showVerticalMenu
                  ? 'text-white font-black bg-white/15'
                  : ''
              }`}
              title="Menu Geral"
            >
              <Menu className="h-3.5 w-3.5 stroke-[2.2]" />
            </button>
          </div>

        </div>
      </nav>

      {/* 2. Menu Vertical Completo (Side Drawer Deslizante em Vidro Escuro) */}
      {showVerticalMenu && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-all">
          <div className="w-full max-w-xs h-full bg-black/95 border-l border-white/15 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            
            {/* Topo do Menu Vertical */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-b from-white via-zinc-400 to-zinc-800 p-px">
                    <div className="h-full w-full bg-black rounded-full flex items-center justify-center font-mono font-bold text-xs text-white overflow-hidden">
                      {studentInfo?.avatar_url ? (
                        <img src={studentInfo.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        studentInfo?.full_name?.charAt(0) || 'A'
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white leading-tight">
                      {studentInfo?.full_name || 'Atleta'}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Turma Oficial
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowVerticalMenu(false)}
                  className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Lista Vertical de Módulos Categorizados */}
              <div className="space-y-4">
                {verticalMenuSections.map((section) => (
                  <div key={section.category} className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block px-1">
                      {section.category}
                    </span>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setShowVerticalMenu(false)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                              item.active
                                ? 'bg-white/10 border-white/30 text-white shadow-md'
                                : 'bg-black/40 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-lg ${item.active ? 'bg-white text-black' : 'bg-white/5 text-zinc-400'}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white leading-tight truncate">
                                  {item.title}
                                </div>
                                <p className="text-[10px] text-zinc-500 leading-tight truncate mt-0.5">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé do Menu Vertical */}
            <div className="pt-6 border-t border-white/[0.08] space-y-3">
              {isProfessional && (
                <Link
                  href="/dashboard"
                  onClick={() => setShowVerticalMenu(false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-md active:scale-95"
                >
                  <span>← Voltar ao Painel do Coach</span>
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 hover:text-white transition-colors text-center"
              >
                Sair da Conta
              </button>
              <p className="text-[11px] text-zinc-500 text-center">
                ArenaFitPro
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 3. Bottom Sheet Rápido de Check-in ao tocar na Câmera */}
      {showQuickSheet && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-end max-w-md mx-auto">
          <div className="mono-glass-card rounded-t-[32px] p-6 space-y-4 max-h-[85vh] flex flex-col border-t border-white/20">
            {/* Header do Sheet */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Check-in Rápido</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    {pendingMissions.length} pendente{pendingMissions.length !== 1 ? 's' : ''}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">Escolha a atividade para comprovar sua meta de hoje</p>
              </div>
              <button
                onClick={() => setShowQuickSheet(false)}
                className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Destaque de Sessão Ativa (se houver treino ou cardio rodando) */}
            {activeSession && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 animate-pulse">
                    ▶
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                      Sessão em Andamento
                    </span>
                    <p className="font-bold text-xs text-white truncate">
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
                  className="shrink-0 px-3.5 py-1.5 rounded-xl bg-emerald-400 text-black font-mono font-bold text-xs hover:bg-emerald-300 transition-all shadow-md flex items-center gap-1 active:scale-95 uppercase tracking-wider"
                >
                  <span>Finalizar</span>
                </button>
              </div>
            )}

            {/* Lista de Metas Disponíveis para Check-in */}
            <div className="space-y-2 overflow-y-auto flex-1 py-1">
              {pendingMissions.length === 0 && !activeSession ? (
                <div className="text-center py-8 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white uppercase tracking-wider">Todas as metas de hoje cumpridas</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Excelente disciplina. Seu streak e XP estão garantidos.</p>
                  </div>
                  <Link
                    href="/app/missions"
                    onClick={() => setShowQuickSheet(false)}
                    className="inline-block px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                  >
                    Ver cronograma da semana →
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

                  const catMeta: Record<string, { tag: string; label: string; color: string }> = {
                    treino: { tag: 'TRN', label: 'Treino', color: 'border-amber-400/30 text-amber-300 bg-amber-400/10' },
                    cardio: { tag: 'CRD', label: 'Cardio', color: 'border-cyan-400/30 text-cyan-300 bg-cyan-400/10' },
                    refeicao: { tag: 'REF', label: 'Nutrição', color: 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10' },
                    habito: { tag: 'HAB', label: 'Hábito', color: 'border-purple-400/30 text-purple-300 bg-purple-400/10' },
                  };

                  const currentMeta = catMeta[m.category] || { tag: 'MET', label: m.category, color: 'border-white/10 text-white bg-white/5' };
                  const listLabel = customList?.name || currentMeta.label;

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleQuickRegister(m)}
                      className="w-full p-3 rounded-2xl bg-zinc-950/60 border border-white/[0.08] hover:border-white/25 hover:bg-zinc-900/60 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`h-8 w-8 rounded-xl border flex items-center justify-center font-mono font-bold text-[10px] shrink-0 transition-colors ${currentMeta.color}`}>
                          {currentMeta.tag}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate">{m.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                              {listLabel}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-300">
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
                            className="px-3 py-1.5 rounded-xl bg-white text-black font-mono font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm active:scale-95 uppercase tracking-wider"
                          >
                            Check-in
                          </button>
                        ) : isTimer ? (
                          <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1 shadow-sm uppercase tracking-wider">
                            Iniciar Sessão
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-mono font-medium text-xs border border-white/15 flex items-center gap-1 group-hover:bg-white/20 transition-colors uppercase tracking-wider">
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-white text-black px-4 py-2.5 rounded-full font-mono font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
