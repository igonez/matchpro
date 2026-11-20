'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ensureNodeImagesDecoded,
  exportStoryNodeToBlob,
  preloadImageToDataUrl,
  readPhotoFileToDataUrl,
  warmupStoryNodes,
} from '@/lib/share/story-export-engine';
import type { RankingBgMode, RankingCardVariant, ShareParticipantItem } from './ranking-share-card';

export { preloadImageToDataUrl, readPhotoFileToDataUrl };

interface UseRankingExportParams {
  open: boolean;
  standings: ShareParticipantItem[];
  challengeLogoUrl?: string | null;
  coachLogoUrl?: string | null;
  coachBrandName?: string | null;
  backgroundMode: RankingBgMode;
  backgroundPhotoUrl: string | null;
  photoVersion: number;
  listNodeRef: React.RefObject<HTMLDivElement | null>;
  heroNodeRef: React.RefObject<HTMLDivElement | null>;
  onExportError?: (message: string) => void;
}

export interface ExportedCardBundle {
  blob: Blob;
  file: File;
  objectUrl: string;
  cacheKey: string;
}

export function useRankingExport({
  open,
  standings,
  challengeLogoUrl,
  coachLogoUrl,
  coachBrandName,
  backgroundMode,
  backgroundPhotoUrl,
  photoVersion,
  listNodeRef,
  heroNodeRef,
  onExportError,
}: UseRankingExportParams) {
  const [preloadedImages, setPreloadedImages] = useState<Record<string, string>>({});
  const [assetsReady, setAssetsReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [cacheState, setCacheState] = useState<{
    key: string;
    cards: Partial<Record<RankingCardVariant, ExportedCardBundle>>;
  }>({
    key: '',
    cards: {},
  });

  const warmedUpKeyRef = useRef<string>('');
  const onExportErrorRef = useRef(onExportError);

  useEffect(() => {
    onExportErrorRef.current = onExportError;
  }, [onExportError]);

  const expectsPhoto = backgroundMode === 'gallery' || backgroundMode === 'camera';
  const brandSignature = `${(coachBrandName || '').trim()}:${coachLogoUrl ? coachLogoUrl.length : 0}`;
  const currentCacheKey = expectsPhoto
    ? `${backgroundMode}:v${photoVersion}:${backgroundPhotoUrl ? backgroundPhotoUrl.length : 0}:${brandSignature}`
    : `transparent:v0:${brandSignature}`;

  // 0. Registrar qualquer violação de CSP (connect-src / img-src)
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const handleCspViolation = (e: SecurityPolicyViolationEvent) => {
      if (
        e.violatedDirective.includes('connect-src') ||
        e.violatedDirective.includes('img-src')
      ) {
        console.error('[ShareRanking CSP Violation]', {
          violatedDirective: e.violatedDirective,
          effectiveDirective: e.effectiveDirective,
          blockedURI: e.blockedURI,
          sourceFile: e.sourceFile,
          lineNumber: e.lineNumber,
        });
      }
    };
    window.addEventListener('securitypolicyviolation', handleCspViolation);
    return () => window.removeEventListener('securitypolicyviolation', handleCspViolation);
  }, [open]);

  // 1. Pré-carregar o logo da ArenaFitPro (marca d'água inferior) + logo do Personal (superior) para dataURL
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function runPreload() {
      setAssetsReady(false);
      const urls = new Set<string>(['/icon-192.png']);
      if (challengeLogoUrl) urls.add(challengeLogoUrl);
      if (coachLogoUrl) urls.add(coachLogoUrl);

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
  }, [open, challengeLogoUrl, coachLogoUrl]);

  // 2. Gerar/refazer os PNGs 1080x1920 sempre que currentCacheKey mudar
  useEffect(() => {
    if (!open || !assetsReady || standings.length === 0) return;

    if (expectsPhoto && !backgroundPhotoUrl) {
      return;
    }

    let cancelled = false;

    async function renderBothCards() {
      setExporting(true);
      setExportError(null);

      // Invalida o cache anterior imediatamente quando a foto ou modo mudar
      setCacheState((prev) => {
        if (prev.key === currentCacheKey) return prev;
        if (prev.cards.list?.objectUrl) URL.revokeObjectURL(prev.cards.list.objectUrl);
        if (prev.cards.hero?.objectUrl) URL.revokeObjectURL(prev.cards.hero.objectUrl);
        return { key: currentCacheKey, cards: {} };
      });

      try {
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) return;

        if (typeof document !== 'undefined' && 'fonts' in document) {
          await document.fonts.ready;
        }
        if (cancelled) return;

        const listNode = listNodeRef.current;
        const heroNode = heroNodeRef.current;
        if (!listNode || !heroNode) {
          throw new Error('Cards de exportação não encontrados.');
        }

        // Antes de capturar: await img.decode() na foto de fundo e nos elementos do card
        const [bgProbe] = await Promise.all([
          ensureNodeImagesDecoded(listNode, expectsPhoto, backgroundPhotoUrl),
          ensureNodeImagesDecoded(heroNode, expectsPhoto, backgroundPhotoUrl),
        ]);
        if (cancelled) return;

        const isTransparent = !expectsPhoto;

        // Captura de aquecimento no iOS, rodando DEPOIS da foto carregar
        if (warmedUpKeyRef.current !== currentCacheKey) {
          await warmupStoryNodes([listNode, heroNode], { isTransparent });
          warmedUpKeyRef.current = currentCacheKey;
        }
        if (cancelled) return;

        const renderVariant = async (
          node: HTMLDivElement,
          variant: RankingCardVariant
        ): Promise<ExportedCardBundle> => {
          const finalBlob = await exportStoryNodeToBlob(node, {
            isTransparent,
            expectBackgroundPhoto: expectsPhoto,
            bgProbe,
          });

          const file = new File(
            [finalBlob],
            `arenafitpro-ranking-${variant}-v${photoVersion || 0}-${Date.now()}.png`,
            { type: 'image/png' }
          );
          const objectUrl = URL.createObjectURL(finalBlob);
          return {
            blob: finalBlob,
            file,
            objectUrl,
            cacheKey: currentCacheKey,
          };
        };

        const [listBundle, heroBundle] = await Promise.all([
          renderVariant(listNode, 'list'),
          renderVariant(heroNode, 'hero'),
        ]);

        if (cancelled) {
          URL.revokeObjectURL(listBundle.objectUrl);
          URL.revokeObjectURL(heroBundle.objectUrl);
          return;
        }

        setCacheState((prev) => {
          if (prev.cards.list?.objectUrl) URL.revokeObjectURL(prev.cards.list.objectUrl);
          if (prev.cards.hero?.objectUrl) URL.revokeObjectURL(prev.cards.hero.objectUrl);
          return {
            key: currentCacheKey,
            cards: {
              list: listBundle,
              hero: heroBundle,
            },
          };
        });
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : 'Não foi possível preparar a foto de fundo para exportação.';
        console.error('[useRankingExport] Erro na captura:', err);
        setExportError(msg);
        setCacheState((prev) => {
          if (prev.cards.list?.objectUrl) URL.revokeObjectURL(prev.cards.list.objectUrl);
          if (prev.cards.hero?.objectUrl) URL.revokeObjectURL(prev.cards.hero.objectUrl);
          return { key: currentCacheKey, cards: {} };
        });
        onExportErrorRef.current?.(msg);
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
  }, [
    open,
    assetsReady,
    standings,
    preloadedImages,
    backgroundMode,
    backgroundPhotoUrl,
    photoVersion,
    expectsPhoto,
    currentCacheKey,
    listNodeRef,
    heroNodeRef,
  ]);

  const isCacheValidForCurrentPhoto = cacheState.key === currentCacheKey;
  const validCards = isCacheValidForCurrentPhoto ? cacheState.cards : {};
  const isWaitingForPhotoSelection = expectsPhoto && !backgroundPhotoUrl;

  return {
    preloadedImages,
    isPreparing:
      !assetsReady ||
      exporting ||
      isWaitingForPhotoSelection ||
      (!exportError && !isCacheValidForCurrentPhoto),
    exportError,
    exportedCards: validCards,
  };
}
