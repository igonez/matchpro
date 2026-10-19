import React, { Suspense } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Crown } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-white selection:text-black antialiased">
      <Suspense fallback={<div className="hidden md:flex w-72 border-r border-white/[0.08] bg-black min-h-screen" />}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar Executiva Mobile com Logo Oficial */}
        <header className="h-16 border-b border-white/[0.08] bg-black/90 backdrop-blur-2xl px-4 sm:px-6 flex md:hidden items-center justify-between sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl overflow-hidden border border-white/20 bg-zinc-950 p-0.5 shadow-md shrink-0">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-white leading-tight">ArenaFitPro</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Cockpit Mestre</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Crown className="w-3 h-3 text-amber-400" /> Super Admin
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
