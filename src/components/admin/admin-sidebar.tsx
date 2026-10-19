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
  Activity,
  Layers,
  Sparkles
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
      badgeColor: 'emerald',
    },
    {
      tabId: 'financial',
      name: 'Financeiro & Mídia Paga',
      href: '/admin?tab=financial',
      icon: DollarSign,
      active: pathname.startsWith('/admin') && currentTab === 'financial',
      badge: 'ROI / CAC',
      badgeColor: 'amber',
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
      badgeColor: 'cyan',
    },
  ];

  return (
    <aside className="hidden md:flex w-72 border-r border-white/[0.08] bg-black/95 backdrop-blur-3xl flex-col justify-between p-6 min-h-screen relative z-30 shrink-0 select-none">
      <div className="space-y-7">
        
        {/* Brand Oficial com Logo Real */}
        <Link href="/admin" className="flex items-center gap-3.5 group px-1">
          <div className="relative">
            <div className="h-11 w-11 rounded-2xl overflow-hidden border border-white/20 bg-zinc-950 p-1 shadow-[0_0_25px_rgba(255,255,255,0.12)] group-hover:scale-105 group-hover:border-amber-400/50 transition-all duration-300">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Crown Pill Overlay */}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-black border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-md">
              <Crown className="w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-white leading-tight">
                ArenaFitPro
              </span>
            </div>
            <span className="text-[11px] uppercase font-mono tracking-widest text-amber-400 font-bold block mt-0.5">
              Super Admin Mestre
            </span>
          </div>
        </Link>

        {/* Status Badge de Alta Fidelidade */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.08] border-t-white/20 text-xs text-zinc-300 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-mono text-[11px] uppercase font-bold tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Terminal de Operações
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold">
              ROOT
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pt-1">
            Acesso irrestrito a banco multi-tenant, splits Asaas, assinaturas e diretório global.
          </p>
        </div>

        {/* Menu Executivo de Navegação */}
        <nav className="space-y-2">
          <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider px-3 block">
            Módulos do Sistema
          </span>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.tabId}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    item.active
                      ? 'bg-white text-black font-bold shadow-[0_4px_20px_rgba(255,255,255,0.18)] scale-[1.01]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-black' : 'text-zinc-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.active
                        ? 'bg-black/10 text-black'
                        : item.badgeColor === 'emerald'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : item.badgeColor === 'amber'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Atalhos para Visualização de Usuários */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
          <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider px-3 block">
            Modos de Inspeção
          </span>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              target="_blank"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors group"
            >
              <span>Ver Painel do Treinador</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              href="/app"
              target="_blank"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors group"
            >
              <span>Ver App do Aluno</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

      </div>

      {/* Footer / Encerrar Sessão */}
      <div className="pt-4 border-t border-white/[0.08]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
            <span>Encerrar Sessão Mestre</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 group-hover:text-red-400">SAIR</span>
        </button>
      </div>
    </aside>
  );
}
