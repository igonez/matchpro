'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * Minimiza a tab bar quando o conteúdo rola para baixo e restaura ao rolar para cima.
 * Usa um limiar acumulado (estilo Instagram) para não oscilar em micro-scrolls.
 */
export function useScrollMinimize(threshold = 14) {
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let acc = 0;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      ticking = false;

      if (y <= 24) {
        acc = 0;
        setMinimized(false);
        return;
      }
      // Reinicia o acumulador quando a direção muda
      acc = Math.sign(delta) === Math.sign(acc) ? acc + delta : delta;
      if (acc > threshold) setMinimized(true);
      else if (acc < -threshold) setMinimized(false);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return minimized;
}

/**
 * Indicador (pílula) que desliza entre as abas com física de mola.
 * Retorna o ref do container, uma função para registrar cada aba e o estilo do indicador.
 */
export function useSlidingIndicator(activeKey: string | null) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [rect, setRect] = useState<{ x: number; w: number } | null>(null);
  const [ready, setReady] = useState(false);

  const register = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      itemRefs.current[key] = el;
    },
    []
  );

  const measure = useCallback(() => {
    const container = containerRef.current;
    const el = activeKey ? itemRefs.current[activeKey] : null;
    if (!container || !el) {
      setRect(null);
      return;
    }
    const c = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setRect({ x: r.left - c.left, w: r.width });
  }, [activeKey]);

  useLayoutEffect(() => {
    measure();
    // Habilita a transição só depois da 1ª medição (evita a pílula "voar" no carregamento)
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [measure]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(container);
    return () => ro.disconnect();
  }, [measure]);

  const indicatorStyle: CSSProperties = rect
    ? {
        width: rect.w,
        transform: `translate3d(${rect.x}px, -50%, 0)`,
        opacity: 1,
        transition: ready
          ? 'transform 520ms cubic-bezier(0.34, 1.32, 0.64, 1), width 520ms cubic-bezier(0.34, 1.32, 0.64, 1), opacity 200ms ease'
          : 'none',
      }
    : { opacity: 0, transform: 'translate3d(0, -50%, 0)' };

  return { containerRef, register, indicatorStyle };
}

/** Estilos compartilhados da tab bar (vidro com opacidade constante). */
export const TAB_BAR_GLASS_STYLE: CSSProperties = {
  backgroundColor: 'rgba(18, 23, 34, 0.72)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
};

export const TAB_BAR_MINIMIZE_TRANSITION =
  'transform 480ms cubic-bezier(0.32, 0.72, 0, 1), opacity 260ms ease';
