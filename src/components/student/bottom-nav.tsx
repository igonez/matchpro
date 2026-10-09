'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useWorkoutSession } from '@/lib/workout-session-context';

export function StudentBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { startSession } = useWorkoutSession();

  const [showQuickSheet, setShowQuickSheet] = useState(false);
  const [showVerticalMenu, setShowVerticalMenu] = useState(false);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isProfessional, setIsProfessional] = useState(false);

  useEffect(() => {
    async function loadData() {
      // 1. Carregar missões para o seletor rápido
      const { data: mData } = await supabase
        .from('missions')
        .select('id, title, category, points_rewarded')
        .limit(10);
      setPendingMissions(mData || []);

      // 2. Carregar dados do aluno e checar se é profissional
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sData } = await supabase
          .from('students')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        setStudentInfo(sData || { full_name: user.email?.split('@')[0] });

        const { data: prof } = await supabase
          .from('professionals')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        if (prof) {
          setIsProfessional(true);
        }
      }
    }
    loadData();
  }, [supabase]);

  const handleQuickRegister = (mission: any) => {
    setShowQuickSheet(false);
    if (mission.category === 'treino' || mission.category === 'cardio') {
      startSession(mission.id, mission.title, mission.category);
    } else {
      router.push(`/app/camera/${mission.id}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 4 abas simétricas na pílula inferior (2 na esquerda, 2 na direita)
  const leftTabs = [
    { name: 'Início', href: '/app', active: pathname === '/app' },
    { name: 'Missões', href: '/app/missions', active: pathname === '/app/missions' },
  ];

  const rightTabs = [
    { name: 'Feed', href: '/app/feed', active: pathname === '/app/feed' },
  ];

  // Itens do Menu Vertical (Áreas completas do App)
  const verticalMenuItems = [
    {
      title: 'Início',
      subtitle: 'Painel diário e consistência',
      href: '/app',
      active: pathname === '/app',
    },
    {
      title: 'Missões da Semana',
      subtitle: 'Treinos, cardios e refeições',
      href: '/app/missions',
      active: pathname === '/app/missions',
    },
    {
      title: 'Feed da Turma',
      subtitle: 'Fotos e pratos aprovados',
      href: '/app/feed',
      active: pathname === '/app/feed',
    },
    {
      title: 'Placar & Leaderboard',
      subtitle: 'Ranking individual e Squads',
      href: '/app/leaderboard',
      active: pathname === '/app/leaderboard',
    },
    {
      title: 'Materiais de Apoio',
      subtitle: 'Arquivos, PDFs e orientações',
      href: '/app/materials',
      active: pathname === '/app/materials',
    },
    {
      title: 'Meu Perfil',
      subtitle: 'Histórico, streak e badges',
      href: '/app/profile',
      active: pathname === '/app/profile',
    },
  ];

  return (
    <>
      {/* 1. Menu Inferior Horizontal (Pílula com Cantos 100% Arredondados e Palavras Encaixadas) */}
      <nav className="fixed bottom-4 inset-x-0 mx-auto max-w-[410px] w-[94%] z-40 transition-all">
        <div className="mono-glass-pill rounded-full px-3 py-1.5 flex items-center justify-between shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-white/15">
          
          {/* Lado Esquerdo (Início, Missões) */}
          <div className="flex items-center justify-around flex-1">
            {leftTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-1.5 px-3 text-[11px] font-mono tracking-wider transition-all rounded-full ${
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
          <div className="px-2 -my-2.5">
            <button
              onClick={() => setShowQuickSheet(true)}
              className="flex flex-col items-center justify-center group focus:outline-none"
              title="Registrar Check-in"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-b from-white via-zinc-300 to-zinc-800 p-px shadow-[0_0_22px_rgba(255,255,255,0.3)] group-hover:scale-105 active:scale-95 transition-all">
                <div className="h-full w-full bg-black rounded-full flex items-center justify-center text-white">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Lado Direito (Feed, Menu Vertical) */}
          <div className="flex items-center justify-around flex-1">
            {rightTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-1.5 px-3 text-[11px] font-mono tracking-wider transition-all rounded-full ${
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
              className={`py-1.5 px-3 text-[11px] font-mono tracking-wider transition-all rounded-full flex items-center gap-1.5 ${
                showVerticalMenu
                  ? 'text-white font-black bg-white/15'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Menu</span>
              <Menu className="h-3 w-3 stroke-[2.2]" />
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

              {/* Lista Vertical de Módulos */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                  NAVEGAÇÃO_DO_APP
                </span>

                {verticalMenuItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setShowVerticalMenu(false)}
                    className={`block p-3 rounded-2xl border transition-all ${
                      item.active
                        ? 'bg-white/10 border-white/30 text-white shadow-md'
                        : 'bg-black/60 border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">
                        {item.title}
                      </span>
                      {item.active && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                      {item.subtitle}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Rodapé do Menu Vertical */}
            <div className="pt-6 border-t border-white/[0.08] space-y-3">
              {isProfessional && (
                <Link
                  href="/dashboard"
                  onClick={() => setShowVerticalMenu(false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white text-black font-mono font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-md active:scale-95"
                >
                  <span>← VOLTAR AO PAINEL DO COACH</span>
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-colors text-center"
              >
                [ DESCONECTAR DA CONTA ]
              </button>
              <p className="text-[9px] font-mono text-zinc-600 text-center">
                Arena Fit Pro OS • v3.0 Monochromatic
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 3. Bottom Sheet Rápido de Check-in ao tocar na Câmera */}
      {showQuickSheet && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-end max-w-md mx-auto">
          <div className="mono-glass-card rounded-t-[32px] p-6 space-y-4 max-h-[80vh] flex flex-col border-t border-white/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="font-black text-sm text-white font-mono uppercase tracking-wider">
                  REGISTRAR CHECK-IN
                </h3>
                <p className="text-[11px] text-zinc-400">Escolha a tarefa para abrir o sensor óptico com GPS</p>
              </div>
              <button
                onClick={() => setShowQuickSheet(false)}
                className="h-7 w-7 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 py-1">
              {pendingMissions.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs font-mono">
                  Nenhuma missão configurada no momento.
                </div>
              ) : (
                pendingMissions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleQuickRegister(m)}
                    className="w-full p-4 rounded-2xl bg-black/60 border border-white/[0.08] hover:border-white/30 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.98]"
                  >
                    <div>
                      <p className="font-bold text-xs text-white">{m.title}</p>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">
                        +{m.points_rewarded} PTS • {m.category}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                      {m.category === 'treino' || m.category === 'cardio' ? 'INICIAR ▶' : 'FOTOGRAFAR →'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
