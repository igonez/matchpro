'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Trophy, 
  BookOpen, 
  Bell, 
  Users, 
  PlusCircle, 
  User, 
  Wallet, 
  Activity, 
  Target,
  LogOut,
  Sparkles,
  ChevronDown,
  Crown
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isMasterAdmin } from '@/lib/master-auth';
import { triggerCoachTour } from '@/components/dashboard/coach-onboarding-tour';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMaster, setIsMaster] = React.useState(false);

  React.useEffect(() => {
    async function checkMaster() {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMasterAdmin(user)) {
        setIsMaster(true);
        return;
      }
      if (user?.id) {
        const { data: prof } = await supabase
          .from('professionals')
          .select('is_master_admin')
          .eq('id', user.id)
          .maybeSingle();
        if (prof?.is_master_admin) {
          setIsMaster(true);
        }
      }
    }
    checkMaster();
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
    ...(isMaster ? [
      {
        title: 'ADMINISTRAÇÃO MESTRE',
        items: [
          { name: 'Cockpit do Fundador', href: '/dashboard/master', icon: Crown, active: pathname === '/dashboard/master', badge: 'MESTRE' },
        ],
      }
    ] : []),
  ];

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    // Inicializar aberto para o grupo que contém o item ativo, e os demais abertos por padrão
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.title] = true;
    });
    return initial;
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside className="hidden md:flex w-64 border-r border-white/[0.06] bg-black/90 backdrop-blur-2xl flex-col h-screen sticky top-0 z-30 shrink-0">
      {/* Top Header & Brand */}
      <div className="p-5 pb-3 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 px-1 py-1 group">
          <div className="h-9 w-9 rounded-xl overflow-hidden border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-transform bg-black shrink-0">
            <img
              src="/app-logo.png"
              alt="ArenaFitPro"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
              ArenaFitPro
            </span>
            <span className="text-[11px] text-zinc-400 font-medium block mt-1">
              Painel do Treinador
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation com Subgrupos Expandíveis (Scrollável de forma independente) */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3 custom-scrollbar">
        <nav className="space-y-3 pr-1">
          {navGroups.map((group) => {
            const isOpen = openGroups[group.title] ?? true;
            const hasActiveChild = group.items.some((it) => it.active);

            return (
              <div key={group.title} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-1 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 font-bold select-none cursor-pointer rounded-lg hover:bg-white/[0.03] transition-colors"
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
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs tracking-wide transition-all ${
                              item.active
                                ? 'bg-white text-black font-black shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                                : 'bg-white/10 hover:bg-white text-white hover:text-black font-bold border border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </div>
                            <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          </Link>
                        );
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs tracking-wide transition-all ${
                            item.active
                              ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm'
                              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : 'text-zinc-400'}`} />
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/15 opacity-80 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.active && <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0 ml-1.5" />}
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

      {/* Footer / Tour, Visão do Aluno & Logout (FIXO NO RODAPÉ) */}
      <div className="p-5 pt-3 border-t border-white/[0.06] bg-black/40 backdrop-blur-md space-y-1.5 shrink-0">
        <button
          type="button"
          onClick={triggerCoachTour}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guia / Tour do App</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">
            TOUR
          </span>
        </button>

        <Link
          href="/app?preview=true"
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
        >
          <span>Visão do Aluno</span>
          <span className="text-[10px] text-zinc-500">↗</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-zinc-400" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}
