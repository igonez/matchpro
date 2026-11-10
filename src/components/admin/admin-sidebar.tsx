'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  GraduationCap, 
  Trophy, 
  LogOut, 
  ExternalLink 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'overview';
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (typeof document !== 'undefined') {
      document.cookie = 'arena_role=; path=/; max-age=0';
    }
    router.push('/mestre');
  };

  const navItems = [
    {
      tabId: 'overview',
      name: 'Cockpit Geral',
      href: '/admin?tab=overview',
      icon: TrendingUp,
      active: pathname === '/admin' && (currentTab === 'overview' || !currentTab),
    },
    {
      tabId: 'coaches',
      name: 'Treinadores & VIPs',
      href: '/admin?tab=coaches',
      icon: Users,
      active: pathname.startsWith('/admin') && currentTab === 'coaches',
    },
    {
      tabId: 'students',
      name: 'Alunos por Personal',
      href: '/admin?tab=students',
      icon: GraduationCap,
      active: pathname.startsWith('/admin') && currentTab === 'students',
    },
    {
      tabId: 'challenges',
      name: 'Desafios & Turmas',
      href: '/admin?tab=challenges',
      icon: Trophy,
      active: pathname.startsWith('/admin') && currentTab === 'challenges',
    },
    {
      tabId: 'financial',
      name: 'Financeiro & Mídia',
      href: '/admin?tab=financial',
      icon: DollarSign,
      active: pathname.startsWith('/admin') && currentTab === 'financial',
    },
    {
      tabId: 'leads',
      name: 'Pipeline de Leads',
      href: '/admin?tab=leads',
      icon: Target,
      active: pathname.startsWith('/admin') && currentTab === 'leads',
    },
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-[#27272A] bg-[#000000] backdrop-blur-2xl flex-col justify-between p-5 min-h-screen relative z-30 shrink-0 select-none">
      <div className="space-y-6">
        
        {/* Brand Idêntico ao Painel Treinador */}
        <Link href="/admin" className="flex items-center gap-3 px-1 py-1 group">
          <div className="h-9 w-9 rounded-xl overflow-hidden border border-[#27272A] shadow-[0_0_15px_rgba(52,120,246,0.15)] group-hover:scale-105 transition-transform bg-[#0E0E10] shrink-0">
            <img
              src="/app-logo.png"
              alt="ArenaFitPro"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-[#FAFAFA] block leading-none">
              ArenaFitPro
            </span>
            <span className="text-[11px] text-[#A1A1AA] font-medium block mt-1">
              Administração Mestre
            </span>
          </div>
        </Link>

        {/* Menu de Navegação Limpo */}
        <nav className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#A1A1AA] tracking-wider px-3 block mb-2">
            Módulos de Controle
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.tabId}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs tracking-wide transition-all ${
                  item.active
                    ? 'bg-white/[0.06] text-[#D4D4D8] font-semibold border border-white/10 shadow-sm'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#0E0E10] font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-[#D4D4D8]' : 'text-[#A1A1AA]'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3478F6] shrink-0 ml-1.5" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Atalhos de Inspeção */}
        <div className="pt-3 border-t border-[#27272A] space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#A1A1AA] tracking-wider px-3 block mb-1">
            Modos de Inspeção
          </span>
          <Link
            href="/dashboard"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#0E0E10] transition-colors"
          >
            <span>Painel do Treinador</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#A1A1AA]" />
          </Link>
          <Link
            href="/app"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#0E0E10] transition-colors"
          >
            <span>App do Aluno</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#A1A1AA]" />
          </Link>
        </div>

      </div>

      {/* Footer / Encerrar Sessão */}
      <div className="pt-4 border-t border-[#27272A]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-[#0E0E10] rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#A1A1AA]" />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
