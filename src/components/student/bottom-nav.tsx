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
  ChevronRight,
  Sparkles
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
    { name: 'Apoio', href: '/app/materials', icon: BookOpen, active: pathname === '/app/materials' },
    { name: 'Perfil', href: '/app/profile', icon: User, active: pathname === '/app/profile' },
  ];

  return (
    <>
      {/* Floating Island Pill Navigation */}
      <nav className="fixed bottom-4 inset-x-0 mx-auto max-w-[420px] w-[94%] z-50 transition-all">
        <div className="liquid-glass-pill px-2.5 py-1.5 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          
          {/* Lado Esquerdo (3 abas) */}
          <div className="flex items-center justify-around flex-1">
            {tabsLeft.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${
                    tab.active ? 'text-emerald-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${
                    tab.active ? 'bg-emerald-500/20 text-emerald-400 shadow-inner' : 'group-hover:bg-white/5'
                  }`}>
                    <Icon className={`h-4.5 w-4.5 ${tab.active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className={`text-[9px] mt-0.5 tracking-tight ${tab.active ? 'font-bold' : 'font-medium'}`}>
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Botão Central de Câmera em Destaque */}
          <div className="px-1.5 -my-2">
            <button
              onClick={() => setShowQuickSheet(true)}
              className="flex flex-col items-center justify-center group focus:outline-none relative"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/35 group-active:scale-95 group-hover:scale-105 transition-all">
                <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400 group-hover:bg-zinc-900 transition-colors">
                  <Camera className="h-5.5 w-5.5 stroke-[2.2]" />
                </div>
              </div>
              <span className="text-[9px] mt-1 font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
                Check-in
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
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${
                    tab.active ? 'text-emerald-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${
                    tab.active ? 'bg-emerald-500/20 text-emerald-400 shadow-inner' : 'group-hover:bg-white/5'
                  }`}>
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
          <div className="liquid-glass rounded-t-[32px] p-5 space-y-4 max-h-[80vh] flex flex-col shadow-2xl border-t border-white/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-1.5">
                  Registrar Check-in 📸
                </h3>
                <p className="text-[11px] text-zinc-400">Tire uma foto ao vivo com geolocalização e horário</p>
              </div>
              <button
                onClick={() => setShowQuickSheet(false)}
                className="p-1.5 rounded-full bg-white/5 text-zinc-400 hover:text-white transition-colors"
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
                  let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  if (m.category === 'cardio') {
                    Icon = Flame;
                    colorClass = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
                  } else if (m.category === 'refeicao') {
                    Icon = Utensils;
                    colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                  } else if (m.category === 'habito') {
                    Icon = Droplet;
                    colorClass = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
                  }

                  return (
                    <button
                      key={m.id}
                      onClick={() => handleQuickRegister(m.id)}
                      className="w-full p-3.5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] hover:border-emerald-500/40 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.98] backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold border ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">{m.title}</p>
                          <p className="text-[10px] text-zinc-400">+{m.points_rewarded} pontos no ranking</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
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
