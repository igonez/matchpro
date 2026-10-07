'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, X, Share, PlusSquare } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Checar se o app já está rodando em modo standalone (já instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Detectar iOS / Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const dismissed = localStorage.getItem('pwa_prompt_dismissed');

    if (isIosDevice) {
      if (!dismissed) {
        setShowPrompt(true);
      }
    } else {
      // Android / Chrome: Escuta o evento beforeinstallprompt
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (!dismissed) {
          setShowPrompt(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <>
      <div className="mx-4 mb-3 p-3.5 rounded-2xl bg-zinc-950/95 border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center shrink-0">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-white font-mono">Adicionar ArenaPro na Tela Inicial</p>
            <p className="text-[10px] text-zinc-400 font-mono">Acesso rápido com 1 toque sem barra de navegador</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            onClick={handleInstallClick} 
            className="mono-button-primary px-3 py-1.5 text-xs font-mono"
          >
            Adicionar
          </button>
          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-white p-1 rounded-lg"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modal Guia Especial para iPhone / iOS */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="mono-glass-card p-6 rounded-3xl max-w-sm w-full space-y-4 border-white/20 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold font-mono text-white">INSTALAÇÃO NO IPHONE / IPAD</span>
              <button onClick={() => setShowIosGuide(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Para transformar o ArenaPro em um aplicativo na sua tela de início:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white">
                  <Share className="h-4 w-4" />
                </div>
                <span>1. Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari.</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white">
                  <PlusSquare className="h-4 w-4" />
                </div>
                <span>2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="mono-button-primary w-full py-2.5 text-xs font-mono"
            >
              ENTENDI
            </button>
          </div>
        </div>
      )}
    </>
  );
}
