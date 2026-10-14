'use client';

import React from 'react';

interface MobileLoadingScreenProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export function MobileLoadingScreen({
  title = 'ArenaFitPro',
  subtitle = 'Carregando...',
  fullScreen = true,
}: MobileLoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 z-50' : 'w-full min-h-[70vh]'
      } bg-black flex flex-col items-center justify-center p-6 select-none overflow-hidden animate-in fade-in duration-300`}
    >
      {/* Luz ambiente suave e discreta */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xs w-full space-y-4">
        {/* Logo Oficial Squircle em Alta Resolução (sem corte redondo) */}
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-2xl bg-white/[0.06] blur-lg animate-pulse" />
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)] bg-zinc-950 flex items-center justify-center">
            <img
              src="/app-logo.png"
              alt="ArenaFitPro"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Tipografia Elegante e Sutil */}
        <div className="space-y-1 text-center">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-400 max-w-[220px] mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Indicador de Carregamento Fino e Minimalista */}
        <div className="w-28 h-[2px] bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full animate-[shimmer_1.4s_infinite]" />
        </div>
      </div>
    </div>
  );
}
