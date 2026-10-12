import React from 'react';

export default function StudentAppLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative">
        <div className="w-10 h-10 rounded-2xl border-2 border-white/20 border-t-white animate-spin" />
        <div className="absolute inset-0 rounded-2xl bg-white/5 animate-pulse" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-xs font-mono font-bold tracking-wider text-white">
          CARREGANDO SUA ARENA
        </p>
        <p className="text-[10px] font-mono text-zinc-500 animate-pulse">
          Sincronizando XP, missões e leaderboard...
        </p>
      </div>
    </div>
  );
}
