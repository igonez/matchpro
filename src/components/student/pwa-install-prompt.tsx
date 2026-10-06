'use client';

import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Escuta evento do navegador para instalação de PWA
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Checa se o usuário não fechou recentemente
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
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
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="mx-4 mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/40 shadow-xl flex items-center justify-between gap-3 text-left">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <p className="font-extrabold text-xs text-white">Instalar o MatchPro no Celular</p>
          <p className="text-[10px] text-zinc-300">Acesse com 1 toque direto na tela de início</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button size="sm" onClick={handleInstallClick} className="h-8 px-2.5 text-xs font-bold">
          Instalar
        </Button>
        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-zinc-300 p-1"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
