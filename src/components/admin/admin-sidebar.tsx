'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Crown, 
  LogOut, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function AdminSidebar() {
  const pathname = usePathname();
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
      name: 'Cockpit & Métricas',
      href: '/admin',
      icon: TrendingUp,
      active: pathname === '/admin',
      badge: 'AO VIVO',
    },
    {
      name: 'Financeiro & Mídia Paga',
      href: '/admin/financial',
      icon: DollarSign,
      active: pathname === '/admin/financial',
      badge: 'ROI / CAC',
    },
    {
      name: 'Treinadores Cadastrados',
      href: '/admin/coaches',
      icon: Users,
      active: pathname === '/admin/coaches',
    },
    {
      name: 'Pipeline Leads & Beta',
      href: '/admin/leads',
      icon: Target,
      active: pathname === '/admin/leads',
      badge: 'WHATSAPP',
    },
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-white/[0.08] bg-black/95 backdrop-blur-2xl flex-col justify-between p-5 min-h-screen relative z-30 shrink-0">
      <div className="space-y-6">
        
        {/* Brand Mestre */}
        <div className="px-1 py-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.2)] bg-black shrink-0 flex items-center justify-center text-amber-400">
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
        <div className="p-3 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-xs text-zinc-300 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[10px] uppercase font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Terminal de Operações
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Acesso irrestrito a banco, transações, splits e diretório global.
          </p>
        </div>

        {/* Menu Executivo */}
        <nav className="space-y-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold px-3 block">
            Módulos de Controle
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono tracking-wide transition-all ${
                  item.active
                    ? 'bg-white text-black font-black shadow-lg shadow-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-black' : 'text-zinc-400'}`} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    item.active
                      ? 'bg-black/10 text-black font-bold'
                      : 'bg-white/10 text-zinc-300 border border-white/10'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Atalhos para Visão de Usuários */}
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold px-3 block">
            Modos de Inspeção
          </span>
          <Link
            href="/dashboard"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors font-mono"
          >
            <span>Ver Painel Treinador</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </Link>
          <Link
            href="/app"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors font-mono"
          >
            <span>Ver App do Aluno</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </Link>
        </div>

      </div>

      {/* Footer / Logout Mestre */}
      <div className="pt-4 border-t border-white/[0.08]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-mono text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4 text-zinc-400" />
          <span>Encerrar Sessão Mestre</span>
        </button>
      </div>
    </aside>
  );
}
