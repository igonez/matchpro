import React, { Suspense } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#000000] text-[#FAFAFA] selection:bg-[#3478F6] selection:text-white antialiased font-sans">
      <Suspense fallback={<div className="hidden md:flex w-64 border-r border-[#27272A] bg-[#000000] min-h-screen" />}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar Mobile Limpa */}
        <header className="h-16 border-b border-[#27272A] bg-[#000000]/90 backdrop-blur-2xl px-4 sm:px-6 flex md:hidden items-center justify-between sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl overflow-hidden border border-[#27272A] bg-[#0E0E10] shrink-0">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-[#FAFAFA] leading-tight">ArenaFitPro</span>
              <span className="text-[10px] text-[#A1A1AA] font-medium">Administração</span>
            </div>
          </Link>
          
          <span className="text-[11px] font-semibold text-[#D4D4D8] bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/10">
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
