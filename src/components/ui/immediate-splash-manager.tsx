'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    dismissArenaSplash?: () => void;
  }
}

/**
 * ImmediateSplashManager
 * Garante que o splash screen estático inserido no HTML inicial pelo layout raiz
 * seja dispensado de forma ultra suave assim que a aplicação React hidrata e
 * pinta o primeiro frame no navegador, eliminando 100% de qualquer tempo de tela preta.
 */
export function ImmediateSplashManager() {
  useEffect(() => {
    // Dá um micro-tick (requestAnimationFrame) para assegurar que o DOM do React já foi commitado
    const frameId = requestAnimationFrame(() => {
      if (typeof window !== 'undefined' && typeof window.dismissArenaSplash === 'function') {
        window.dismissArenaSplash();
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  return null;
}
