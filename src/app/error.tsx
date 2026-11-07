'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ArenaFitPro Error Boundary]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080A0F] text-[#F4F6FA] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#121722] border border-[#252D3B] text-center space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="w-14 h-14 rounded-2xl bg-[#3478F6]/15 border border-[#3478F6]/30 text-[#75A7FF] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#75A7FF] font-bold block">
            Recuperação Automática de Tela
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F4F6FA]">
            Ops! Algo saiu do esperado.
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B0C0] leading-relaxed">
            Detectamos uma oscilação temporária ao carregar esta tela. Seus dados e pontuações estão seguros.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#3478F6] hover:bg-[#2563EB] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(52,120,246,0.35)]"
          >
            <RotateCcw className="w-4 h-4" />
            Tentar Novamente
          </button>

          <Link
            href="/"
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#181F2E] hover:bg-[#1B2330] border border-[#252D3B] text-[#F4F6FA] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            Início
          </Link>
        </div>
      </div>
    </div>
  );
}
