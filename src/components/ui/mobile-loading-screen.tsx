'use client';

import React from 'react';

interface MobileLoadingScreenProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export function MobileLoadingScreen({
  title = 'ArenaFitPro',
  subtitle = 'Sincronizando dados em tempo real...',
  fullScreen = true,
}: MobileLoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 z-50' : 'w-full min-h-[70vh]'
      } bg-black flex flex-col items-center justify-center p-6 select-none overflow-hidden`}
    >
      {/* 1. Efeito de Luz Ambiente Especular 3D */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-white/[0.04] rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center max-w-xs w-full space-y-6">
        {/* 2. Emblema Oficial com Pulso de Energia */}
        <div className="relative group">
          {/* Anel de luz externa */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-white/30 via-zinc-500/20 to-transparent blur-md animate-pulse" />

          {/* Container do Logo */}
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-b from-white via-zinc-400 to-zinc-900 p-px shadow-[0_0_35px_rgba(255,255,255,0.25)] flex items-center justify-center">
            <div className="h-full w-full bg-black rounded-full flex items-center justify-center p-2.5 overflow-hidden">
              <img
                src="/arenafitpro-round-transparent.svg"
                alt="ArenaFitPro Logo"
                className="w-full h-full object-contain animate-[pulse_3s_ease-in-out_infinite]"
              />
            </div>
          </div>
        </div>

        {/* 3. Tipografia Monocromática de Alta Precisão */}
        <div className="space-y-1.5 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500 block">
            COACH_TERMINAL • OS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-xs font-mono text-zinc-400 max-w-[240px] mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 4. Barra de Progresso em Feixe Metálico Deslizante */}
        <div className="w-48 sm:w-56 space-y-2">
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/10 relative">
            <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-white to-transparent rounded-full animate-[shimmer_1.6s_infinite]" />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
            <span>KERNEL_V3</span>
            <span className="animate-pulse">ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
