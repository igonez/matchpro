'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  CheckSquare, 
  Trophy, 
  BookOpen, 
  Bell, 
  Users, 
  PlusCircle, 
  LogOut,
  ExternalLink,
  User,
  Wallet,
  Activity,
  Target,
  ChevronDown
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coachProfile, setCoachProfile] = useState<{ fullName: string; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    async function loadCoach() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from('professionals')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        setCoachProfile({
          fullName: prof?.full_name || user.user_metadata?.full_name || 'Coach',
          avatarUrl: prof?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        });
      }
    }
    loadCoach();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  interface NavItem {
    name: string;
    href: string;
    icon: any;
    active: boolean;
    badge?: string;
    isCta?: boolean;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'VISÃO GERAL',
      items: [
        { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard, active: pathname === '/dashboard' },
      ],
    },
    {
      title: 'DESAFIOS & TURMAS',
      items: [
        { name: '+ Novo Desafio', href: '/dashboard/challenges/new', icon: PlusCircle, active: pathname === '/dashboard/challenges/new', isCta: true },
        { name: 'Meus Desafios', href: '/dashboard/challenges', icon: Target, active: pathname === '/dashboard/challenges' },
        { name: 'Alunos & Turmas', href: '/dashboard/students', icon: Users, active: pathname === '/dashboard/students' },
        { name: 'Missões & Regras', href: '/dashboard/missions', icon: Trophy, active: pathname === '/dashboard/missions' },
      ],
    },
    {
      title: 'ENGAJAMENTO & MODERAÇÃO',
      items: [
        { name: 'Auditoria Swipe', href: '/dashboard/audit', icon: CheckSquare, active: pathname === '/dashboard/audit' },
        { name: 'Feed Social da Turma', href: '/dashboard/feed', icon: Activity, active: pathname === '/dashboard/feed' },
        { name: 'Ranking da Turma', href: '/dashboard/leaderboard', icon: Trophy, active: pathname === '/dashboard/leaderboard', badge: 'AO VIVO' },
        { name: 'Mural de Avisos', href: '/dashboard/announcements', icon: Bell, active: pathname === '/dashboard/announcements' },
        { name: 'Materiais de Apoio', href: '/dashboard/materials', icon: BookOpen, active: pathname === '/dashboard/materials' },
      ],
    },
    {
      title: 'RECURSOS PRO',
      items: [
        { name: 'Squads (Equipes)', href: '/dashboard/squads', icon: Users, active: pathname === '/dashboard/squads', badge: 'PRO' },
      ],
    },
    {
      title: 'FINANÇAS & CONTA',
      items: [
        { name: 'Central Financeira', href: '/dashboard/finance', icon: Wallet, active: pathname === '/dashboard/finance', badge: 'PIX D+0' },
        { name: 'Meu Perfil & Fiscais', href: '/dashboard/profile', icon: User, active: pathname === '/dashboard/profile' },
      ],
    },
  ];

  const [openMobileGroups, setOpenMobileGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.title] = true;
    });
    return initial;
  });

  const toggleMobileGroup = (title: string) => {
    setOpenMobileGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <>
      <header className="h-20 border-b border-white/[0.08] px-4 sm:px-6 md:px-8 flex items-center justify-between bg-black/85 backdrop-blur-2xl sticky top-0 z-40">
        <div className="flex items-center gap-3.5">
          {/* Logo do App + Brand ArenaFitPro (sem botão hambúrguer) */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-transform shrink-0 bg-black">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-none">
                ArenaFitPro
              </span>
              <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-400 mt-1 block">
                Painel do Treinador
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Painel de Controle</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/app?preview=true"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
          >
            <span>Ver como Aluno</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="hidden sm:inline">Servidor</span> Conectado
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu do painel"
            className="md:hidden h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Drawer / Menu Vertical Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Glass */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-zinc-950/95 border-r border-white/10 p-5 flex flex-col justify-between h-full shadow-2xl z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl overflow-hidden border border-white/20 bg-black flex items-center justify-center shrink-0">
                    <img src="/app-logo.png" alt="ArenaFitPro" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm tracking-tight text-white block">ArenaFitPro</span>
                    <span className="text-[11px] text-zinc-400 font-medium">Painel do Treinador</span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fechar menu do painel"
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Links de Navegação Mobile Agrupados e Expansíveis */}
              <nav className="space-y-3 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
                {navGroups.map((group) => {
                  const isOpen = openMobileGroups[group.title] ?? true;
                  const hasActiveChild = group.items.some((it) => it.active);

                  return (
                    <div key={group.title} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleMobileGroup(group.title)}
                        className="w-full flex items-center justify-between px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 font-bold select-none cursor-pointer rounded-lg hover:bg-white/[0.04] transition-colors"
                      >
                        <span className={hasActiveChild ? 'text-zinc-300' : ''}>
                          {group.title}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                            isOpen ? 'transform rotate-0' : '-rotate-90'
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="space-y-1 pt-0.5">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            if (item.isCta) {
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-black tracking-wide transition-all ${
                                    item.active
                                      ? 'bg-white text-black shadow-lg'
                                      : 'bg-white/10 hover:bg-white text-white hover:text-black border border-white/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">CRIAR</span>
                                </Link>
                              );
                            }

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-medium tracking-wide transition-all ${
                                  item.active
                                    ? 'bg-white text-black font-semibold shadow-md'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-black' : 'text-zinc-400'}`} />
                                  <span className="truncate">{item.name}</span>
                                  {item.badge && (
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                                      item.active
                                        ? 'bg-black/10 text-black border border-black/20'
                                        : 'bg-white/10 text-zinc-300 border border-white/15 opacity-80'
                                    }`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                {item.active && <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0 ml-1.5" />}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Logout Mobile */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <Link
                href="/app?preview=true"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.04] border border-white/10 active:scale-[0.98] transition-all"
              >
                <span>Visão do Aluno</span>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dock Inferior Mobile para o Coach (Visível apenas em telas menores que md) */}
      <nav className="md:hidden fixed bottom-3 inset-x-0 mx-auto max-w-[430px] w-[94%] z-30 pb-safe">
        <div className="bg-black/95 backdrop-blur-2xl rounded-full px-2 py-1.5 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.95)] border border-white/15">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider transition-all ${
              pathname === '/dashboard'
                ? 'text-white font-black bg-white/15'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 mb-0.5" />
            <span>Início</span>
          </Link>

          <Link
            href="/dashboard/audit"
            className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider transition-all ${
              pathname === '/dashboard/audit'
                ? 'text-white font-black bg-white/15'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckSquare className="h-4 w-4 mb-0.5" />
            <span>Swipe</span>
          </Link>

          <Link
            href="/dashboard/students"
            className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider transition-all ${
              pathname === '/dashboard/students'
                ? 'text-white font-black bg-white/15'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 mb-0.5" />
            <span>Alunos</span>
          </Link>

          <Link
            href="/dashboard/finance"
            className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider transition-all ${
              pathname === '/dashboard/finance'
                ? 'text-white font-black bg-white/15'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wallet className="h-4 w-4 mb-0.5" />
            <span>PIX</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider text-zinc-400 hover:text-white transition-all"
          >
            <Menu className="h-4 w-4 mb-0.5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}
