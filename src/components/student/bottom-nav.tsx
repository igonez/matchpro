'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Trophy, 
  Camera, 
  Target, 
  User 
} from 'lucide-react';

export function StudentBottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Início',
      href: '/app',
      icon: Home,
      active: pathname === '/app',
    },
    {
      name: 'Feed',
      href: '/app/feed',
      icon: Users,
      active: pathname === '/app/feed',
    },
    {
      name: 'Registrar',
      href: '/app/missions',
      icon: Camera,
      isAction: true,
      active: pathname.startsWith('/app/camera'),
    },
    {
      name: 'Ranking',
      href: '/app/leaderboard',
      icon: Trophy,
      active: pathname === '/app/leaderboard',
    },
    {
      name: 'Missões',
      href: '/app/missions',
      icon: Target,
      active: pathname === '/app/missions',
    },
    {
      name: 'Perfil',
      href: '/app/profile',
      icon: User,
      active: pathname === '/app/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-zinc-950/90 backdrop-blur-2xl border-t border-zinc-800/80 z-50 max-w-md mx-auto shadow-2xl">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;

          // Botão central de Registrar (Câmera) em destaque ergonômico
          if (tab.isAction) {
            return (
              <Link
                key={idx}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 group-active:scale-95 transition-all">
                  <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400 group-hover:bg-zinc-900 transition-colors">
                    <Icon className="h-6 w-6 stroke-[2.2]" />
                  </div>
                </div>
                <span className="text-[10px] mt-1 font-bold text-zinc-400 group-hover:text-emerald-400 transition-colors">
                  {tab.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                tab.active ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${tab.active ? 'bg-emerald-500/15 text-emerald-400' : ''}`}>
                <Icon className={`h-5 w-5 ${tab.active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${tab.active ? 'font-bold' : 'font-medium'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
