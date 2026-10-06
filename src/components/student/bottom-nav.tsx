'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Trophy, User, Camera } from 'lucide-react';

export function StudentBottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Missões',
      href: '/app',
      icon: Flame,
      active: pathname === '/app',
    },
    {
      name: 'Leaderboard',
      href: '/app/leaderboard',
      icon: Trophy,
      active: pathname === '/app/leaderboard',
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-850 z-50 max-w-md mx-auto">
      <div className="flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                tab.active ? 'text-emerald-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${tab.active ? 'bg-emerald-500/10' : ''}`}>
                <Icon className={`h-5 w-5 ${tab.active ? 'stroke-[2.5]' : ''}`} />
              </div>
              <span className="text-[11px] mt-0.5">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
