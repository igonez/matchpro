import React from 'react';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Luz ambiente 3D */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl border-2 border-white/20 border-t-white animate-spin" />
          <div className="absolute inset-0 rounded-2xl bg-white/5 animate-pulse" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-xs font-mono font-bold tracking-widest text-white uppercase">
            ARENAFIT PRO
          </p>
          <p className="text-[10px] font-mono text-zinc-500 animate-pulse">
            SINCRONIZANDO DADOS...
          </p>
        </div>
      </div>
    </div>
  );
}
