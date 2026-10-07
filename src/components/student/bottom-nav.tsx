'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function StudentBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [showQuickSheet, setShowQuickSheet] = useState(false);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);

  useEffect(() => {
    async function loadQuickOptions() {
      const { data } = await supabase
        .from('missions')
        .select('id, title, category, points_rewarded')
        .limit(10);

      setPendingMissions(data || []);
    }
    loadQuickOptions();
  }, [supabase]);

  const handleQuickRegister = (missionId: string) => {
    setShowQuickSheet(false);
    router.push(`/app/camera/${missionId}`);
  };

  const navTabs = [
    { name: 'Início', href: '/app', active: pathname === '/app' },
    { name: 'Missões', href: '/app/missions', active: pathname === '/app/missions' },
    { name: 'Feed', href: '/app/feed', active: pathname === '/app/feed' },
    { name: 'Placar', href: '/app/leaderboard', active: pathname === '/app/leaderboard' },
    { name: 'Perfil', href: '/app/profile', active: pathname === '/app/profile' },
  ];

  return (
    <>
      {/* Floating Monochromatic Island Bar */}
      <nav className="fixed bottom-4 inset-x-0 mx-auto max-w-[390px] w-[92%] z-50 transition-all">
        <div className="mono-glass-pill px-3 py-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          
          {/* Abas Esquerda */}
          <div className="flex items-center justify-around flex-1">
            {navTabs.slice(0, 2).map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-1.5 px-3 text-xs font-mono tracking-wider transition-all rounded-xl ${
                  tab.active
                    ? 'text-white font-black bg-white/10 shadow-inner'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>

          {/* Botão Central de Check-in em Cromo Puro */}
          <div className="px-1 -my-3">
            <button
              onClick={() => setShowQuickSheet(true)}
              className="flex flex-col items-center justify-center group focus:outline-none"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-b from-white via-zinc-300 to-zinc-800 p-px shadow-[0_0_20px_rgba(255,255,255,0.25)] group-hover:scale-105 active:scale-95 transition-all">
                <div className="h-full w-full bg-black rounded-[15px] flex items-center justify-center text-white">
                  {/* SVG Minimalista de Lente / Foco */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 group-hover:text-white mt-0.5">
                CHECK-IN
              </span>
            </button>
          </div>

          {/* Abas Direita */}
          <div className="flex items-center justify-around flex-1">
            {navTabs.slice(2, 5).map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`py-1.5 px-2.5 text-xs font-mono tracking-wider transition-all rounded-xl ${
                  tab.active
                    ? 'text-white font-black bg-white/10 shadow-inner'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>

        </div>
      </nav>

      {/* Sheet Rápido de Check-in em Vidro Monocromático Escuro */}
      {showQuickSheet && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-end max-w-md mx-auto">
          <div className="mono-glass-card rounded-t-[32px] p-6 space-y-4 max-h-[80vh] flex flex-col border-t border-white/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="font-black text-sm text-white font-mono uppercase tracking-wider">
                  SELECIONE A TAREFA
                </h3>
                <p className="text-[11px] text-zinc-400">Captura ao vivo com geolocalização e carimbo de hora</p>
              </div>
              <button
                onClick={() => setShowQuickSheet(false)}
                className="h-7 w-7 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
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
                    onClick={() => handleQuickRegister(m.id)}
                    className="w-full p-4 rounded-2xl bg-black/60 border border-white/[0.08] hover:border-white/30 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.98]"
                  >
                    <div>
                      <p className="font-bold text-xs text-white">{m.title}</p>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">
                        +{m.points_rewarded} PTS • {m.category}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                      FOTOGRAFAR →
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
