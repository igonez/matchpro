'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Target, 
  Users, 
  Camera, 
  Trophy, 
  BookOpen, 
  User, 
  X, 
  Dumbbell, 
  Flame, 
  Utensils, 
  Droplet,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function StudentBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [showQuickSheet, setShowQuickSheet] = useState(false);
  const [pendingMissions, setPendingMissions] = useState<any[]>([]);

  // Carregar missões pendentes para o seletor rápido
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

  const tabsLeft = [
    { name: 'Início', href: '/app', icon: Home, active: pathname === '/app' },
    { name: 'Missões', href: '/app/missions', icon: Target, active: pathname === '/app/missions' },
    { name: 'Feed', href: '/app/feed', icon: Users, active: pathname === '/app/feed' },
  ];

  const tabsRight = [
    { name: 'Ranking', href: '/app/leaderboard', icon: Trophy, active: pathname === '/app/leaderboard' },
    { name: 'Materiais', href: '/app/materials', icon: BookOpen, active: pathname === '/app/materials' },
    { name: 'Perfil', href: '/app/profile', icon: User, active: pathname === '/app/profile' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800/80 z-50 max-w-md mx-auto shadow-2xl">
        <div className="flex items-center justify-between h-16 px-1">
          {/* Lado Esquerdo (3 abas) */}
          <div className="flex items-center justify-around flex-1">
            {tabsLeft.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                    tab.active ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${tab.active ? 'bg-emerald-500/15 text-emerald-400' : ''}`}>
                    <Icon className={`h-4.5 w-4.5 ${tab.active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className={`text-[9px] mt-0.5 tracking-tight ${tab.active ? 'font-bold' : 'font-medium'}`}>
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Botão Central de Registrar em Destaque (Abre Folha Rápida) */}
          <div className="px-1 -mt-5">
            <button
              onClick={() => setShowQuickSheet(true)}
              className="flex flex-col items-center justify-center group focus:outline-none"
            >
              <div className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 group-active:scale-95 transition-all">
                <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400 group-hover:bg-zinc-900 transition-colors">
                  <Camera className="h-6 w-6 stroke-[2.2]" />
                </div>
              </div>
              <span className="text-[10px] mt-1 font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
                Registrar
              </span>
            </button>
          </div>

          {/* Lado Direito (3 abas) */}
          <div className="flex items-center justify-around flex-1">
            {tabsRight.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                    tab.active ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${tab.active ? 'bg-emerald-500/15 text-emerald-400' : ''}`}>
                    <Icon className={`h-4.5 w-4.5 ${tab.active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className={`text-[9px] mt-0.5 tracking-tight ${tab.active ? 'font-bold' : 'font-medium'}`}>
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Folha Deslizante Rápida de Ação ao Tocar em Registrar (Bottom Sheet) */}
      {showQuickSheet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end max-w-md mx-auto">
          <div className="bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-5 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
              <div>
                <h3 className="font-black text-base text-white">O que você quer registrar? 📸</h3>
                <p className="text-[11px] text-zinc-400">Escolha a tarefa para abrir a câmera nativa</p>
              </div>
              <button
                onClick={() => setShowQuickSheet(false)}
                className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 py-1">
              {pendingMissions.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  Nenhuma missão configurada no momento.
                </div>
              ) : (
                pendingMissions.map((m) => {
                  let Icon = Dumbbell;
                  let colorClass = 'text-emerald-400 bg-emerald-500/10';
                  if (m.category === 'cardio') {
                    Icon = Flame;
                    colorClass = 'text-orange-400 bg-orange-500/10';
                  } else if (m.category === 'refeicao') {
                    Icon = Utensils;
                    colorClass = 'text-amber-400 bg-amber-500/10';
                  } else if (m.category === 'habito') {
                    Icon = Droplet;
                    colorClass = 'text-sky-400 bg-sky-500/10';
                  }

                  return (
                    <button
                      key={m.id}
                      onClick={() => handleQuickRegister(m.id)}
                      className="w-full p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">{m.title}</p>
                          <p className="text-[10px] text-zinc-400">Vale +{m.points_rewarded} pontos no ranking</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          Câmera
                        </span>
                        <ChevronRight className="h-4 w-4 text-zinc-600" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
