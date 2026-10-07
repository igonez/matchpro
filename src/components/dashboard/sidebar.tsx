'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Visão Geral', href: '/dashboard', active: pathname === '/dashboard' },
    { name: 'Auditoria Swipe', href: '/dashboard/audit', active: pathname === '/dashboard/audit' },
    { name: 'Missões & Regras', href: '/dashboard/missions', active: pathname === '/dashboard/missions' },
    { name: 'Materiais de Apoio', href: '/dashboard/materials', active: pathname === '/dashboard/materials' },
    { name: 'Mural de Avisos', href: '/dashboard/announcements', active: pathname === '/dashboard/announcements' },
    { name: 'Mystery Box (Prêmios)', href: '/dashboard/mystery-box', active: pathname === '/dashboard/mystery-box' },
    { name: 'Squads (Equipes)', href: '/dashboard/squads', active: pathname === '/dashboard/squads' },
    { name: 'Parceiros & Cupons', href: '/dashboard/sponsors', active: pathname === '/dashboard/sponsors' },
    { name: 'Criar Desafio', href: '/dashboard/challenges/new', active: pathname === '/dashboard/challenges/new' },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.06] bg-black/90 backdrop-blur-2xl flex flex-col justify-between p-5 min-h-screen relative z-30">
      <div className="space-y-6">
        {/* Brand Monocromático */}
        <Link href="/dashboard" className="flex items-center gap-3 px-1 py-1 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-white via-zinc-400 to-zinc-900 p-px shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-black rounded-[11px] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-white block leading-none">
              ArenaPro
            </span>
            <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block mt-1">
              COACH_TERMINAL
            </span>
          </div>
        </Link>

        {/* Navigation Monocromática com Destaque de Vidro */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono tracking-wide transition-all ${
                item.active
                  ? 'bg-white/10 text-white font-bold border border-white/20 shadow-sm'
                  : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{item.name}</span>
              {item.active && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-white/[0.06]">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-500 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
        >
          [ DESCONECTAR ]
        </button>
      </div>
    </aside>
  );
}
