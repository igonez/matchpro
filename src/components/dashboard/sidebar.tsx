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
  Crown,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isMasterAdmin } from '@/lib/master-auth';
import { useWalkthrough } from '@/components/ui/walkthrough-spotlight';
import { COACH_WALKTHROUGH_STEPS } from '@/lib/walkthrough/coach-tour-steps';
import { COACH_TOUR_STORAGE_KEY } from '@/components/dashboard/coach-tour-trigger';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { startTour } = useWalkthrough();
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
    <aside className="hidden md:flex w-64 border-r border-[#252D3B] bg-[#080A0F] backdrop-blur-2xl flex-col h-screen sticky top-0 z-30 shrink-0">
      {/* Top Header & Brand */}
      <div className="p-5 pb-3 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 px-1 py-1 group">
          <div className="h-9 w-9 rounded-xl overflow-hidden border border-[#252D3B] shadow-[0_0_15px_rgba(52,120,246,0.15)] group-hover:scale-105 transition-transform bg-[#121722] shrink-0">
            <img
              src="/app-logo.png"
              alt="ArenaFitPro"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-[#F4F6FA] block leading-none">
              ArenaFitPro
            </span>
            <span className="text-[11px] text-[#A7B0C0] font-medium block mt-1">
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
                  className="w-full flex items-center justify-between px-3 py-1 text-[10px] uppercase tracking-wider text-[#A7B0C0] hover:text-white font-bold select-none cursor-pointer rounded-lg hover:bg-white/[0.03] transition-colors"
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
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs tracking-wide transition-all ${
                              item.active
                                ? 'bg-[#3478F6] text-white font-black shadow-[0_0_20px_rgba(52,120,246,0.35)]'
                                : 'bg-[#3478F6]/15 hover:bg-[#3478F6] text-[#75A7FF] hover:text-white font-bold border border-[#3478F6]/30'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </div>
                            <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          </Link>
                        );
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs tracking-wide transition-all ${
                            item.active
                              ? 'bg-[#3478F6]/15 text-[#75A7FF] font-semibold border border-[#3478F6]/30 shadow-sm'
                              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#121722] font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-[#75A7FF]' : 'text-[#A7B0C0]'}`} />
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#3478F6]/10 text-[#75A7FF] border border-[#3478F6]/25 opacity-90 shrink-0">
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

      {/* Footer / Guia do App, Visão do Aluno & Logout (FIXO NO RODAPÉ) */}
      <div className="p-5 pt-3 border-t border-[#252D3B] bg-[#080A0F] space-y-1.5 shrink-0">
        <button
          type="button"
          onClick={() => startTour(COACH_WALKTHROUGH_STEPS, COACH_TOUR_STORAGE_KEY)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#121722] rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#A7B0C0]" />
            <span>Guia do App</span>
          </div>
        </button>

        <Link
          href="/app?preview=true"
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#121722] rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-[#A7B0C0]" />
            <span>Visão do Aluno</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-[#A7B0C0] shrink-0" />
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#121722] rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#A7B0C0]" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}
