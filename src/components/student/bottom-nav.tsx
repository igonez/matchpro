'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Target, 
  Users, 
  Trophy, 
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
      name: 'Missões',
      href: '/app/missions',
      icon: Target,
      active: pathname === '/app/missions' || pathname.startsWith('/app/camera'),
    },
    {
      name: 'Feed',
      href: '/app/feed',
      icon: Users,
      active: pathname === '/app/feed',
    },
    {
      name: 'Ranking',
      href: '/app/leaderboard',
      icon: Trophy,
      active: pathname === '/app/leaderboard',
    },
    {
      name: 'Perfil',
      href: '/app/profile',
      icon: User,
      active: pathname === '/app/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-900 z-50 max-w-md mx-auto shadow-2xl">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                tab.active ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`p-1.5 rounded-2xl transition-all ${tab.active ? 'bg-emerald-500/15 text-emerald-400' : ''}`}>
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
