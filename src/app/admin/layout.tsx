import React, { Suspense } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-white selection:text-black antialiased font-sans">
      <Suspense fallback={<div className="hidden md:flex w-64 border-r border-white/[0.06] bg-black min-h-screen" />}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar Mobile Limpa */}
        <header className="h-16 border-b border-white/[0.06] bg-black/90 backdrop-blur-2xl px-4 sm:px-6 flex md:hidden items-center justify-between sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white leading-tight">ArenaFitPro</span>
              <span className="text-[10px] text-zinc-400 font-medium">Administração</span>
            </div>
          </Link>
          
          <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
            Mestre
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
