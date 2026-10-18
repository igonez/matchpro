import React from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Bar Executiva Mobile */}
        <header className="h-16 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl px-4 sm:px-6 flex md:hidden items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
              👑
            </div>
            <span className="font-extrabold text-sm text-white">Cockpit Mestre</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded border border-amber-400/20">
            Super Admin
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
