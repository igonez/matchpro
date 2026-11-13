'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function StudentAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Student App Error Boundary]:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[70vh]">
      <div className="max-w-sm w-full p-6 rounded-3xl bg-[#0E0E10] border border-[#27272A] text-center space-y-5 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 text-[#D4D4D8] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#3478F6] font-bold block">
            ArenaFitPro • Atleta
          </span>
          <h2 className="text-lg font-black tracking-tight text-[#FAFAFA]">
            Ops! Algo interrompeu esta tela
          </h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Seus pontos, check-ins e ofensiva estão seguros. Tente recarregar esta etapa.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Tentar Novamente
          </button>
          <Link
            href="/app"
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            Voltar para Hoje
          </Link>
        </div>
      </div>
    </div>
  );
}
