'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Smartphone } from 'lucide-react';
import { trackMarketingEvent } from '@/lib/analytics/tracking';

export function StickyMobileCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Exibe a barra apenas após rolar mais de 400px (passando da primeira dobra da Hero)
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      // Oculta se estiver a menos de 450px do fim da página (onde o CTA gigante final já está presente)
      const isNearBottom = scrollY + winHeight > docHeight - 450;

      if (scrollY > 420 && !isNearBottom) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-[#080A0F]/95 backdrop-blur-2xl border-t border-[#252D3B] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-4 duration-300"
      role="region"
      aria-label="Barra de Ação Rápida Mobile"
    >
      <div className="max-w-md mx-auto flex items-center gap-2.5">
        <Link
          href="/login?role=student"
          onClick={() => trackMarketingEvent('ViewContent', { content_name: 'Sticky Mobile Sou Aluno' })}
          className="shrink-0"
        >
          <button 
            type="button"
            aria-label="Entrar como Aluno"
            className="h-12 w-12 rounded-xl bg-[#121722] border border-[#252D3B] flex items-center justify-center text-[#A7B0C0] hover:text-[#F4F6FA] hover:border-[#3478F6] active:scale-95 transition-all cursor-pointer"
          >
            <Smartphone className="w-5 h-5 text-[#3478F6]" />
          </button>
        </Link>

        <Link
          href="/login?role=professional&mode=signup"
          onClick={() => trackMarketingEvent('Lead', { content_name: 'Sticky Mobile Criar Conta' })}
          className="flex-1"
        >
          <button 
            type="button"
            className="w-full h-12 px-4 rounded-xl bg-[#3478F6] hover:bg-[#75A7FF] text-white font-bold text-xs sm:text-sm flex items-center justify-between gap-2 shadow-[0_0_25px_rgba(52,120,246,0.4)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 text-left">
              <Sparkles className="w-4 h-4 text-white shrink-0" />
              <div className="leading-tight">
                <span className="block font-black tracking-tight text-white">Criar Desafio Grátis</span>
                <span className="block text-[10px] text-white/80 font-mono">Sem cartão • Taxa 0% no Pro</span>
              </div>
            </div>
            <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}
