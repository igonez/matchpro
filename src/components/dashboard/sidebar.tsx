'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Trophy, 
  CheckSquare, 
  Flame, 
  LogOut, 
  Dumbbell, 
  Layers, 
  BookOpen, 
  Gift, 
  Users, 
  Building2, 
  Bell,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Visão Geral',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      name: 'Auditoria Swipe',
      href: '/dashboard/audit',
      icon: CheckSquare,
      active: pathname === '/dashboard/audit',
    },
    {
      name: 'Missões & Regras',
      href: '/dashboard/missions',
      icon: Layers,
      active: pathname === '/dashboard/missions',
    },
    {
      name: 'Materiais de Apoio',
      href: '/dashboard/materials',
      icon: BookOpen,
      active: pathname === '/dashboard/materials',
    },
    {
      name: 'Mural de Avisos',
      href: '/dashboard/announcements',
      icon: Bell,
      active: pathname === '/dashboard/announcements',
    },
    {
      name: 'Mystery Box (Prêmios)',
      href: '/dashboard/mystery-box',
      icon: Gift,
      active: pathname === '/dashboard/mystery-box',
    },
    {
      name: 'Squads (Equipes)',
      href: '/dashboard/squads',
      icon: Users,
      active: pathname === '/dashboard/squads',
    },
    {
      name: 'Parceiros & Cupons',
      href: '/dashboard/sponsors',
      icon: Building2,
      active: pathname === '/dashboard/sponsors',
    },
    {
      name: 'Criar Novo Desafio',
      href: '/dashboard/challenges/new',
      icon: Trophy,
      active: pathname === '/dashboard/challenges/new',
    },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.06] bg-zinc-950/80 backdrop-blur-2xl flex flex-col justify-between p-4 min-h-screen relative z-30">
      <div className="space-y-6">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-white block leading-none">
              Arena<span className="text-emerald-400">Pro</span>
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400/90 block mt-1">
              Cockpit do Coach
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all group ${
                  item.active
                    ? 'liquid-glass-emerald border-emerald-500/30 text-emerald-300 font-bold shadow-lg shadow-emerald-950/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className={`p-1 rounded-lg transition-colors ${
                  item.active ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-white/[0.06]">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Desconectar da Plataforma
        </Button>
      </div>
    </aside>
  );
}
