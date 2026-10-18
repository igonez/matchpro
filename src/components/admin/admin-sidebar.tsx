'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Crown, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  Activity
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
      name: 'Cockpit & Métricas',
      href: '/admin?tab=overview',
      icon: TrendingUp,
      active: pathname === '/admin' && (currentTab === 'overview' || !currentTab),
      badge: 'AO VIVO',
    },
    {
      tabId: 'financial',
      name: 'Financeiro & Mídia Paga',
      href: '/admin?tab=financial',
      icon: DollarSign,
      active: pathname.startsWith('/admin') && currentTab === 'financial',
      badge: 'ROI / CAC',
    },
    {
      tabId: 'coaches',
      name: 'Gestão de Treinadores',
      href: '/admin?tab=coaches',
      icon: Users,
      active: pathname.startsWith('/admin') && currentTab === 'coaches',
    },
    {
      tabId: 'leads',
      name: 'Pipeline Leads & Beta',
      href: '/admin?tab=leads',
      icon: Target,
      active: pathname.startsWith('/admin') && currentTab === 'leads',
      badge: 'WHATSAPP',
    },
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-white/[0.08] bg-black/95 backdrop-blur-2xl flex-col justify-between p-5 min-h-screen relative z-30 shrink-0">
      <div className="space-y-6">
        
        {/* Brand Mestre */}
        <div className="px-1 py-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.2)] bg-zinc-950 shrink-0 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                ArenaFitPro
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold block mt-1">
                Super Admin Mestre
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 text-xs text-zinc-300 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[10px] uppercase font-bold tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Terminal de Operações
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Acesso irrestrito a banco multi-tenant, splits Asaas, métricas e usuários.
          </p>
        </div>

        {/* Menu Executivo */}
        <nav className="space-y-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold px-3 block">
            Módulos de Controle
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.tabId}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wide transition-all ${
                  item.active
                    ? 'bg-white text-black font-black shadow-lg shadow-white/10'
                    : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-black' : 'text-zinc-400'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.active
                      ? 'bg-black/10 text-black'
                      : 'bg-white/[0.08] text-zinc-300 border border-white/10'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Atalhos para Visão de Usuários */}
        <div className="pt-3 border-t border-white/[0.08] space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold px-3 block">
            Modos de Inspeção
          </span>
          <Link
            href="/dashboard"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors font-mono"
          >
            <span>Ver Painel Treinador</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
          <Link
            href="/app"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors font-mono"
          >
            <span>Ver App do Aluno</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>

      </div>

      {/* Footer / Logout Mestre */}
      <div className="pt-4 border-t border-white/[0.08]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-zinc-400" />
          <span>Encerrar Sessão Mestre</span>
        </button>
      </div>
    </aside>
  );
}
