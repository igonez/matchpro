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
  ChevronDown,
  ChevronRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useWalkthrough } from '@/components/ui/walkthrough-spotlight';
import { COACH_WALKTHROUGH_STEPS } from '@/lib/walkthrough/coach-tour-steps';
import { COACH_TOUR_STORAGE_KEY } from '@/components/dashboard/coach-tour-trigger';

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { startTour } = useWalkthrough();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coachProfile, setCoachProfile] = useState<{ fullName: string; avatarUrl: string | null } | null>(null);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 8 && currentScrollY > 40) {
        setIsScrolledDown(true);
      } else if (currentScrollY < lastScrollY - 8 || currentScrollY <= 20) {
        setIsScrolledDown(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadCoach() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from('professionals')
          .select('full_name, brand_name, avatar_url, brand_logo_url')
          .eq('id', user.id)
          .maybeSingle();

        setCoachProfile({
          fullName:
            prof?.brand_name ||
            prof?.full_name ||
            user.user_metadata?.brand_name ||
            user.user_metadata?.full_name ||
            'Coach',
          avatarUrl:
            prof?.avatar_url ||
            prof?.brand_logo_url ||
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
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
      <header className="min-h-[5rem] h-auto border-b border-[#252D3B] px-4 sm:px-6 md:px-8 flex items-center justify-between bg-[#080A0F]/90 backdrop-blur-2xl sticky top-0 z-40 safe-top-header pb-3.5">
        <div className="flex items-center gap-3.5">
          {/* Logo do App + Brand ArenaFitPro (sem botão hambúrguer) */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-[#252D3B] shadow-[0_0_15px_rgba(52,120,246,0.15)] group-hover:scale-105 transition-transform shrink-0 bg-[#121722]">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#F4F6FA] leading-none">
                ArenaFitPro
              </span>
              <span className="text-[10px] uppercase font-medium tracking-wider text-[#A7B0C0] mt-1 block">
                Painel do Treinador
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-[#252D3B]">
            <span className="text-xs uppercase tracking-widest text-[#A7B0C0] font-bold">Painel de Controle</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {coachProfile && (
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 min-h-[42px] rounded-full bg-[#121722] border border-[#252D3B] hover:border-[#3478F6]/40 transition-colors"
              title="Meu Perfil & Identidade"
            >
              <div className="h-7 w-7 rounded-full bg-[#1B2330] border border-[#252D3B] overflow-hidden flex items-center justify-center shrink-0">
                {coachProfile.avatarUrl ? (
                  <img
                    src={coachProfile.avatarUrl}
                    alt={coachProfile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-mono font-black text-[#75A7FF]">
                    {coachProfile.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-[#F4F6FA] max-w-[140px] truncate hidden xs:inline">
                {coachProfile.fullName}
              </span>
            </Link>
          )}

          <Link
            href="/app?preview=true"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-full bg-[#121722] border border-[#252D3B] text-xs font-mono text-[#A7B0C0] hover:text-[#F4F6FA] hover:border-[#3478F6]/40 transition-colors"
          >
            <span>Ver como Aluno</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#A7B0C0]" />
          </Link>
        </div>
      </header>

      {/* Drawer / Menu Vertical Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] md:hidden flex">
          {/* Backdrop Glass */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-[#080A0F] border-r border-[#252D3B] flex flex-col h-full shadow-2xl z-10">
            {/* Header / Brand Mobile */}
            <div className="p-5 pb-3.5 safe-top-drawer border-b border-[#252D3B] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl overflow-hidden border border-[#252D3B] bg-[#121722] flex items-center justify-center shrink-0">
                    <img src="/app-logo.png" alt="ArenaFitPro" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm tracking-tight text-[#F4F6FA] block">ArenaFitPro</span>
                    <span className="text-[11px] text-[#A7B0C0] font-medium">Painel do Treinador</span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fechar menu do painel"
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-[#121722] border border-[#252D3B] text-[#A7B0C0] hover:text-[#F4F6FA] flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Links de Navegação Mobile Agrupados e Expansíveis (Scroll Independente) */}
            <div className="flex-1 overflow-y-auto p-5 py-3 custom-scrollbar">
              <nav className="space-y-3 pr-1">
                {navGroups.map((group) => {
                  const isOpen = openMobileGroups[group.title] ?? true;
                  const hasActiveChild = group.items.some((it) => it.active);

                  return (
                    <div key={group.title} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleMobileGroup(group.title)}
                        className="w-full flex items-center justify-between px-3 py-1 text-[10px] uppercase tracking-wider text-[#A7B0C0] hover:text-white font-bold select-none cursor-pointer rounded-lg hover:bg-white/[0.04] transition-colors"
                      >
                        <span className={hasActiveChild ? 'text-[#75A7FF]' : ''}>
                          {group.title}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-[#A7B0C0] transition-transform duration-200 ${
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
                                      ? 'bg-[#3478F6] text-white shadow-lg'
                                      : 'bg-[#3478F6]/15 hover:bg-[#3478F6] text-[#75A7FF] hover:text-white border border-[#3478F6]/30'
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
                                    ? 'bg-[#3478F6]/15 text-[#75A7FF] font-semibold border border-[#3478F6]/30 shadow-md'
                                    : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#121722]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-[#75A7FF]' : 'text-[#A7B0C0]'}`} />
                                  <span className="truncate">{item.name}</span>
                                  {item.badge && (
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                                      item.active
                                        ? 'bg-[#3478F6]/20 text-[#75A7FF] border border-[#3478F6]/30'
                                        : 'bg-white/5 text-[#A7B0C0] border border-white/10'
                                    }`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                {item.active && <span className="h-1.5 w-1.5 rounded-full bg-[#3478F6] shrink-0 ml-1.5" />}
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

            {/* Ações Rápidas Mobile (FIXO NO RODAPÉ DO DRAWER) */}
            <div className="p-5 pt-3 safe-bottom-drawer border-t border-[#252D3B] bg-[#080A0F] space-y-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  startTour(COACH_WALKTHROUGH_STEPS, COACH_TOUR_STORAGE_KEY);
                }}
                className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A7B0C0] hover:text-[#F4F6FA] bg-[#121722] border border-[#252D3B] active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-[#A7B0C0]" />
                  <span>Guia do App</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#A7B0C0]" />
              </button>

              <Link
                href="/app?preview=true"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A7B0C0] hover:text-[#F4F6FA] bg-[#121722] border border-[#252D3B] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-4 w-4 text-[#A7B0C0]" />
                  <span>Visão do Aluno</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-[#A7B0C0]" />
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-[#A7B0C0] hover:text-white hover:bg-[#121722] rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dock Inferior Mobile para o Coach - Frosted Glass Instagram Style com Opacidade Constante */}
      {mounted && (
        <nav
          className={`md:hidden fixed safe-bottom-nav inset-x-0 mx-auto max-w-[430px] w-[94%] z-[60] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            mobileMenuOpen
              ? 'opacity-0 pointer-events-none translate-y-12 scale-95'
              : isScrolledDown
              ? 'scale-[0.91] translate-y-1 opacity-100 pointer-events-auto'
              : 'scale-100 translate-y-0 opacity-100 pointer-events-auto'
          }`}
        >
        <div className="relative bg-[#101520]/90 backdrop-blur-2xl backdrop-saturate-[180%] rounded-full px-2 py-1.5 flex items-center justify-around shadow-[0_16px_36px_rgba(0,0,0,0.75),inset_0_1px_1.5px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(0,0,0,0.5)] border border-white/[0.14]">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.88] ${
              pathname === '/dashboard'
                ? 'text-white font-bold bg-[#3478F6] shadow-[0_0_18px_rgba(52,120,246,0.5)] scale-100'
                : 'text-[#A7B0C0] hover:text-[#F4F6FA] scale-[0.97]'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 mb-0.5" />
            <span>Início</span>
          </Link>

          <Link
            href="/dashboard/audit"
            className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.88] ${
              pathname === '/dashboard/audit'
                ? 'text-white font-bold bg-[#3478F6] shadow-[0_0_18px_rgba(52,120,246,0.5)] scale-100'
                : 'text-[#A7B0C0] hover:text-[#F4F6FA] scale-[0.97]'
            }`}
          >
            <CheckSquare className="h-4 w-4 mb-0.5" />
            <span>Swipe</span>
          </Link>

          <Link
            href="/dashboard/students"
            className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.88] ${
              pathname === '/dashboard/students'
                ? 'text-white font-bold bg-[#3478F6] shadow-[0_0_18px_rgba(52,120,246,0.5)] scale-100'
                : 'text-[#A7B0C0] hover:text-[#F4F6FA] scale-[0.97]'
            }`}
          >
            <Users className="h-4 w-4 mb-0.5" />
            <span>Alunos</span>
          </Link>

          <Link
            href="/dashboard/finance"
            className={`flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.88] ${
              pathname === '/dashboard/finance'
                ? 'text-white font-bold bg-[#3478F6] shadow-[0_0_18px_rgba(52,120,246,0.5)] scale-100'
                : 'text-[#A7B0C0] hover:text-[#F4F6FA] scale-[0.97]'
            }`}
          >
            <Wallet className="h-4 w-4 mb-0.5" />
            <span>PIX</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center min-h-[44px] py-1.5 px-3 rounded-full text-xs font-mono tracking-wider text-[#A7B0C0] hover:text-[#F4F6FA] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.88] scale-[0.97]"
          >
            <Menu className="h-4 w-4 mb-0.5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
      )}
    </>
  );
}
