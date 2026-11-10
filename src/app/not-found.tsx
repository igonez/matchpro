import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#FAFAFA] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#0E0E10] border border-[#27272A] text-center space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 text-[#D4D4D8] flex items-center justify-center mx-auto">
          <Compass className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4D4D8] font-bold block">
            Erro 404 • Rota Não Localizada
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#FAFAFA]">
            Página não encontrada
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            O endereço acessado não existe ou foi movido. Retorne à página inicial do ArenaFitPro.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full min-h-[44px] px-5 py-3 rounded-xl bg-[#3478F6] hover:bg-[#2563EB] text-white font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(52,120,246,0.35)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
