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
  Users
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
      name: 'Auditoria (Swipe)',
      href: '/dashboard/audit',
      icon: CheckSquare,
      active: pathname === '/dashboard/audit',
    },
    {
      name: 'Missões & Semanas',
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
      name: 'Criar Desafio',
      href: '/dashboard/challenges/new',
      icon: Trophy,
      active: pathname === '/dashboard/challenges/new',
    },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950 flex flex-col justify-between p-4 min-h-screen">
      <div className="space-y-6">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white">
              Match<span className="text-emerald-400">Pro</span>
            </span>
            <span className="block text-[10px] font-semibold text-emerald-400/80 tracking-wider uppercase">
              Área do Profissional
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  item.active
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${item.active ? 'text-emerald-400' : 'text-zinc-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-zinc-900">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Desconectar
        </Button>
      </div>
    </aside>
  );
}
