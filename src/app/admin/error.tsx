'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Shield } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Error Boundary]:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#0E0E10] border border-[#27272A] text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 text-[#D4D4D8] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#3478F6] font-bold block">
            Console Master
          </span>
          <h2 className="text-xl font-black tracking-tight text-[#FAFAFA]">
            Erro ao carregar módulo administrativo
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            Tente recarregar a seção ou retornar à visão geral do console master.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Tentar Novamente
          </button>
          <Link
            href="/admin"
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <Shield className="w-4 h-4" />
            Início Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
