'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ArenaFitPro Global Error]:', error);
  }, [error]);

  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#000000] text-[#FAFAFA] flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#0E0E10] border border-[#27272A] text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 text-[#D4D4D8] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3478F6] font-bold block">
              ArenaFitPro • Recuperação Global
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#FAFAFA]">
              Ops! Algo inesperado aconteceu.
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              Detectamos uma falha crítica ao renderizar a aplicação. Recarregue para continuar com segurança.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Recarregar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
