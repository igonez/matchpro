import React from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-zinc-850 px-8 flex items-center justify-between bg-zinc-950/60 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Painel de Controle</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Servidor Supabase Conectado
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
