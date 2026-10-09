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
  Gift, 
  Users, 
  ShoppingBag, 
  PlusCircle, 
  LogOut,
  ExternalLink,
  User
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
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'MONITORAMENTO',
      items: [
        { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard, active: pathname === '/dashboard' },
        { name: 'Auditoria Swipe', href: '/dashboard/audit', icon: CheckSquare, active: pathname === '/dashboard/audit' },
      ],
    },
    {
      title: 'GESTÃO DA TURMA',
      items: [
        { name: 'Alunos & Finanças', href: '/dashboard/students', icon: Users, active: pathname === '/dashboard/students' },
        { name: 'Missões & Regras', href: '/dashboard/missions', icon: Trophy, active: pathname === '/dashboard/missions' },
        { name: 'Materiais de Apoio', href: '/dashboard/materials', icon: BookOpen, active: pathname === '/dashboard/materials' },
        { name: 'Mural de Avisos', href: '/dashboard/announcements', icon: Bell, active: pathname === '/dashboard/announcements' },
      ],
    },
    {
      title: 'RECURSOS PRO',
      items: [
        { name: 'Squads (Equipes)', href: '/dashboard/squads', icon: Users, active: pathname === '/dashboard/squads', badge: 'PRO' },
        { name: 'Mystery Box (Prêmios)', href: '/dashboard/mystery-box', icon: Gift, active: pathname === '/dashboard/mystery-box', badge: 'PRO' },
        { name: 'Parceiros & Cupons', href: '/dashboard/sponsors', icon: ShoppingBag, active: pathname === '/dashboard/sponsors', badge: 'PRO' },
      ],
    },
    {
      title: 'CONFIGURAÇÕES',
      items: [
        { name: 'Criar Desafio', href: '/dashboard/challenges/new', icon: PlusCircle, active: pathname === '/dashboard/challenges/new' },
        { name: 'Meu Perfil', href: '/dashboard/profile', icon: User, active: pathname === '/dashboard/profile' },
      ],
    },
  ];

  return (
    <>
      <header className="h-16 border-b border-white/[0.06] px-4 md:px-8 flex items-center justify-between bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Botão Hambúrguer Mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors shrink-0"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo / Brand Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              Arena Fit Pro
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold font-mono">Painel de Controle</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/app?preview=true"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
          >
            <span>Ver como Aluno</span>
            <ExternalLink className="h-3 w-3 text-zinc-400" />
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-[11px] font-mono text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="hidden sm:inline">Servidor</span> Conectado
          </div>
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
                  <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="font-bold font-mono text-white text-xs">AFP</span>
                  </div>
                  <div>
                    <span className="font-black text-sm tracking-tight text-white block">Arena Fit Pro</span>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">COACH_TERMINAL</span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Links de Navegação Mobile Agrupados */}
              <nav className="space-y-4 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
                {navGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <div className="px-3 pb-0.5 text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-semibold select-none">
                      {group.title}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono tracking-wide transition-all ${
                              item.active
                                ? 'bg-white text-black font-bold shadow-md'
                                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-black' : 'text-zinc-400'}`} />
                              <span className="truncate">{item.name}</span>
                              {item.badge && (
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                  item.active
                                    ? 'bg-black/10 text-black border border-black/20'
                                    : 'bg-white/10 text-zinc-400 border border-white/15 opacity-75'
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
                  </div>
                ))}
              </nav>
            </div>

            {/* Logout Mobile */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <Link
                href="/app?preview=true"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono text-zinc-300 hover:text-white bg-white/[0.04] border border-white/10 active:scale-[0.98] transition-all"
              >
                <span>Visão do Aluno</span>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>DESCONECTAR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
