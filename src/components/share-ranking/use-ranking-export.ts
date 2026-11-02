'use client';

import { useEffect, useRef, useState } from 'react';
import { toBlob, toPng } from 'html-to-image';
import type { RankingBgMode, RankingCardVariant, ShareParticipantItem } from './ranking-share-card';

export async function preloadImageToDataUrl(
  url?: string | null,
  timeoutMs = 3000
): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      resolve(null);
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const maxDim = 256;
        const w = img.naturalWidth || img.width || 128;
        const h = img.naturalHeight || img.height || 128;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };

    img.src = url;
  });
}

export async function readPhotoFileToDataUrl(file: File, maxDim = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.onload = () => {
      const resultStr = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width || 1080;
          const h = img.naturalHeight || img.height || 1920;
          const scale = Math.min(1, maxDim / Math.max(w, h));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(w * scale));
          canvas.height = Math.max(1, Math.round(h * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(resultStr);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        } catch {
          resolve(resultStr);
        }
      };
      img.onerror = () => reject(new Error('Formato de imagem inválido.'));
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  });
}

interface UseRankingExportParams {
  open: boolean;
  standings: ShareParticipantItem[];
  challengeLogoUrl?: string | null;
  backgroundMode: RankingBgMode;
  backgroundPhotoUrl: string | null;
  listNodeRef: React.RefObject<HTMLDivElement | null>;
  heroNodeRef: React.RefObject<HTMLDivElement | null>;
}

export interface ExportedCardBundle {
  blob: Blob;
  file: File;
  objectUrl: string;
}

export function useRankingExport({
  open,
  standings,
  challengeLogoUrl,
  backgroundMode,
  backgroundPhotoUrl,
  listNodeRef,
  heroNodeRef,
}: UseRankingExportParams) {
  const [preloadedImages, setPreloadedImages] = useState<Record<string, string>>({});
  const [assetsReady, setAssetsReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportedCards, setExportedCards] = useState<
    Partial<Record<RankingCardVariant, ExportedCardBundle>>
  >({});
  const warmedUpRef = useRef(false);

  // 1. Pré-carregar apenas o logo (sem avatares na lista)
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function runPreload() {
      setAssetsReady(false);
      const urls = new Set<string>(['/icon-192.png']);
      if (challengeLogoUrl) urls.add(challengeLogoUrl);

      const entries = await Promise.all(
        Array.from(urls).map(async (u) => {
          const dataUrl = await preloadImageToDataUrl(u);
          return [u, dataUrl] as const;
        })
      );

      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const [u, dataUrl] of entries) {
        if (dataUrl) map[u] = dataUrl;
      }
      setPreloadedImages(map);
      setAssetsReady(true);
    }

    runPreload();

    return () => {
      cancelled = true;
    };
  }, [open, challengeLogoUrl]);

  // 2. Renderizar os 2 cards 1080x1920 fora da tela ('list' e 'hero')
  useEffect(() => {
    if (!open || !assetsReady || standings.length === 0) return;
    let cancelled = false;

    async function renderBothCards() {
      setExporting(true);
      try {
        if (typeof document !== 'undefined' && 'fonts' in document) {
          await document.fonts.ready.catch(() => {});
        }
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) return;

        const isTransparent =
          backgroundMode === 'transparent' || !backgroundPhotoUrl;

        const renderVariant = async (
          node: HTMLDivElement | null,
          variant: RankingCardVariant
        ): Promise<ExportedCardBundle | null> => {
          if (!node) return null;

          const options = {
            width: 1080,
            height: 1920,
            canvasWidth: 1080,
            canvasHeight: 1920,
            pixelRatio: 1,
            cacheBust: false,
            backgroundColor: isTransparent ? undefined : '#09090b',
          };

          if (!warmedUpRef.current) {
            await toPng(node, options).catch(() => {});
            warmedUpRef.current = true;
          }

          const blob = await toBlob(node, options);
          if (!blob) return null;

          const file = new File(
            [blob],
            `arenafitpro-ranking-${variant}-${Date.now()}.png`,
            { type: 'image/png' }
          );
          const objectUrl = URL.createObjectURL(blob);
          return { blob, file, objectUrl };
        };

        const [listBundle, heroBundle] = await Promise.all([
          renderVariant(listNodeRef.current, 'list'),
          renderVariant(heroNodeRef.current, 'hero'),
        ]);

        if (cancelled) {
          if (listBundle) URL.revokeObjectURL(listBundle.objectUrl);
          if (heroBundle) URL.revokeObjectURL(heroBundle.objectUrl);
          return;
        }

        setExportedCards((prev) => {
          if (prev.list?.objectUrl) URL.revokeObjectURL(prev.list.objectUrl);
          if (prev.hero?.objectUrl) URL.revokeObjectURL(prev.hero.objectUrl);
          return {
            list: listBundle || undefined,
            hero: heroBundle || undefined,
          };
        });
      } catch (err) {
        console.error('[useRankingExport] Erro ao exportar cards:', err);
      } finally {
        if (!cancelled) {
          setExporting(false);
        }
      }
    }

    renderBothCards();

    return () => {
      cancelled = true;
    };
  }, [open, assetsReady, standings, preloadedImages, backgroundMode, backgroundPhotoUrl, listNodeRef, heroNodeRef]);

  return {
    preloadedImages,
    isPreparing: !assetsReady || exporting,
    exportedCards,
  };
}
