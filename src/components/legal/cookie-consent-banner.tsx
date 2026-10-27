'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cookie, Settings2, X, Check, ArrowRight } from 'lucide-react';
import { CORPORATE_CONFIG } from '@/lib/corporate-config';

type ConsentLevel = 'all' | 'essential' | 'rejected' | null;

interface CookiePreferences {
  essential: boolean; // Sempre true
  analytics: boolean; // Métricas e atribuição de campanhas
  marketing: boolean; // Pixel & Conversões
  functional: boolean; // Preferências de UI
  timestamp: string;
}

const STORAGE_KEY = 'arenafitpro_cookie_consent_v1';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [functionalAllowed, setFunctionalAllowed] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Exibe o banner apenas após uma pequena pausa para não bloquear o LCP
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignora falhas em ambientes restritos
    }
  }, []);

  const saveConsent = (level: ConsentLevel, customPrefs?: Partial<CookiePreferences>) => {
    try {
      const allowAnalyticsAndMarketing =
        level === 'all' ? true : customPrefs?.analytics ?? false;
      const prefs: CookiePreferences = {
        essential: true,
        analytics: allowAnalyticsAndMarketing,
        marketing: allowAnalyticsAndMarketing,
        functional: level === 'all' ? true : customPrefs?.functional ?? true,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('arenafitpro:consent-updated'));
      }
    } catch {
      // Ignora erro em iframes/privado
    }
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Consentimento de Cookies e Privacidade"
      className="fixed bottom-0 inset-x-0 z-[100] p-3 sm:p-5 pointer-events-none"
    >
      <div className="max-w-4xl mx-auto bg-zinc-950/95 border border-white/15 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-5 sm:p-6 text-white pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-white/10 text-white shrink-0">
                  <Cookie className="w-4 h-4" />
                </span>
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  Controle de Cookies & Privacidade
                </h2>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  LGPD
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Utilizamos cookies essenciais para autenticação segura e cookies analíticos/de atribuição para medir o desempenho das nossas campanhas, sem jamais vender seus dados. Saiba mais em nossa{' '}
                <Link
                  href="/privacidade"
                  className="text-white underline underline-offset-2 hover:text-zinc-200 font-medium focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  Política de Privacidade
                </Link>{' '}
                ou exerça seus direitos no{' '}
                <Link
                  href="/lgpd"
                  className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300 font-medium focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
                >
                  Canal LGPD
                </Link>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-white cursor-pointer w-full sm:w-auto"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Preferências</span>
              </button>

              <button
                type="button"
                onClick={() => saveConsent('essential')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/20 text-white hover:bg-zinc-800 text-xs font-mono uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-white cursor-pointer flex-1 sm:flex-initial"
              >
                Apenas Essenciais
              </button>

              <button
                type="button"
                onClick={() => saveConsent('all')}
                className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-white cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)] flex-1 sm:flex-initial"
              >
                Aceitar Todos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-white" />
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Gerenciar Preferências de Cookies
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Fechar painel de preferências"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Essenciais */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase font-mono text-[11px]">
                    1. Estritamente Essenciais
                  </span>
                  <span className="text-[10px] font-mono bg-white/10 text-zinc-300 px-2 py-0.5 rounded">
                    Sempre Ativos
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Sessão Supabase, autenticação segura e tokens CSRF. Indispensáveis para login e pagamentos.
                </p>
              </div>

              {/* Funcionais */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase font-mono text-[11px]">
                    2. Funcionais
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={functionalAllowed}
                      onChange={(e) => setFunctionalAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                  </label>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Memorização de tema, preferências de áudio e visualização de turmas.
                </p>
              </div>

              {/* Desempenho / Métricas */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase font-mono text-[11px]">
                    3. Métricas Internas
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsAllowed}
                      onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                  </label>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  Métricas agregadas anônimas para identificar lentidão ou erros técnicos.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-zinc-400 hover:text-white"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() =>
                  saveConsent('essential', {
                    functional: functionalAllowed,
                    analytics: analyticsAllowed,
                  })
                }
                className="px-5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase transition-colors"
              >
                Salvar Preferências
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
