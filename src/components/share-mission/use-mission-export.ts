'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ensureNodeImagesDecoded,
  exportStoryNodeToBlob,
  preloadImageToDataUrl,
  readPhotoFileToDataUrl,
  warmupStoryNodes,
} from '@/lib/share/story-export-engine';
import type {
  MissionBgMode,
  MissionCardVariant,
  MissionSharePayload,
} from './mission-share-card';

export { preloadImageToDataUrl, readPhotoFileToDataUrl };

export interface ExportedMissionCardBundle {
  blob: Blob;
  file: File;
  objectUrl: string;
  cacheKey: string;
}

export interface UseMissionExportParams {
  open: boolean;
  mission: MissionSharePayload | null;
  backgroundMode: MissionBgMode;
  backgroundPhotoUrl: string | null;
  photoVersion?: number;
  cardNodeRef: React.RefObject<HTMLDivElement | null>;
  stickerNodeRef: React.RefObject<HTMLDivElement | null>;
  onExportError?: (message: string) => void;
}

function buildSafeMissionSlug(title?: string | null): string {
  const raw = (title || 'checkin')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ranking|podio/gi, 'missao')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);
  return raw || 'checkin';
}

export function useMissionExport({
  open,
  mission,
  backgroundMode,
  backgroundPhotoUrl,
  photoVersion = 0,
  cardNodeRef,
  stickerNodeRef,
  onExportError,
}: UseMissionExportParams) {
  const [preloadedImages, setPreloadedImages] = useState<Record<string, string>>({});
  const [resolvedPhotoDataUrl, setResolvedPhotoDataUrl] = useState<string | null>(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [cacheState, setCacheState] = useState<{
    key: string;
    cards: Partial<Record<MissionCardVariant, ExportedMissionCardBundle>>;
  }>({
    key: '',
    cards: {},
  });

  const warmedUpKeyRef = useRef<string>('');
  const onExportErrorRef = useRef(onExportError);

  useEffect(() => {
    onExportErrorRef.current = onExportError;
  }, [onExportError]);

  const isPhotoBgMode =
    backgroundMode === 'photo' ||
    backgroundMode === 'gallery' ||
    backgroundMode === 'camera';

  const effectiveExportPhotoUrl = isPhotoBgMode
    ? backgroundPhotoUrl?.startsWith('data:image/')
      ? backgroundPhotoUrl
      : resolvedPhotoDataUrl
    : null;

  const expectsCardPhoto = isPhotoBgMode && Boolean(backgroundPhotoUrl);

  const missionSig = mission
    ? `${mission.missionId || ''}:${mission.missionTitle}:${mission.pointsRewarded}:${mission.streakDays ?? 1}:${mission.coachBrandName || ''}:${mission.caloriesText || ''}:${mission.proteinText || ''}`
    : 'none';

  const currentCacheKey = `${backgroundMode}:v${photoVersion}:${
    effectiveExportPhotoUrl ? effectiveExportPhotoUrl.length : 0
  }:${missionSig}`;

  // 1. Preload /icon-192.png, coachLogoUrl, and mission.photoUrl / backgroundPhotoUrl into data:image/ URLs
  useEffect(() => {
    if (!open || !mission) {
      setAssetsReady(false);
      setResolvedPhotoDataUrl(null);
      return;
    }

    let cancelled = false;

    async function runPreload() {
      setAssetsReady(false);

      const nextMap: Record<string, string> = {};

      const iconPromise = preloadImageToDataUrl('/icon-192.png', 4000, 256);
      const coachLogoPromise = mission?.coachLogoUrl
        ? preloadImageToDataUrl(mission.coachLogoUrl, 4000, 256)
        : Promise.resolve(null);

      const rawPhotoTarget = backgroundPhotoUrl || mission?.photoUrl || null;
      const photoPromise = rawPhotoTarget
        ? rawPhotoTarget.startsWith('data:image/')
          ? Promise.resolve(rawPhotoTarget)
          : preloadImageToDataUrl(rawPhotoTarget, 6000, 1440)
        : Promise.resolve(null);

      const [iconDataUrl, coachDataUrl, photoDataUrl] = await Promise.all([
        iconPromise,
        coachLogoPromise,
        photoPromise,
      ]);

      if (cancelled) return;

      if (iconDataUrl) {
        nextMap['/icon-192.png'] = iconDataUrl;
      }
      if (coachDataUrl && mission?.coachLogoUrl) {
        nextMap[mission.coachLogoUrl] = coachDataUrl;
        nextMap.coachLogo = coachDataUrl;
      }
      if (photoDataUrl && rawPhotoTarget) {
        nextMap[rawPhotoTarget] = photoDataUrl;
        if (mission?.photoUrl) {
          nextMap[mission.photoUrl] = photoDataUrl;
        }
      }

      setPreloadedImages(nextMap);
      setResolvedPhotoDataUrl(photoDataUrl);
      setAssetsReady(true);
    }

    runPreload();

    return () => {
      cancelled = true;
    };
  }, [open, mission, mission?.coachLogoUrl, mission?.photoUrl, backgroundPhotoUrl]);

  const buildVariantBundle = useCallback(
    async (variant: MissionCardVariant): Promise<ExportedMissionCardBundle> => {
      const node = variant === 'card' ? cardNodeRef.current : stickerNodeRef.current;
      if (!node) {
        throw new Error('Elemento de exportação da missão não encontrado.');
      }

      const variantExpectsPhoto =
        variant === 'card' &&
        isPhotoBgMode &&
        Boolean(effectiveExportPhotoUrl && effectiveExportPhotoUrl.startsWith('data:image/'));

      const variantIsTransparent =
        variant === 'sticker' || backgroundMode === 'transparent';

      const bgProbe = await ensureNodeImagesDecoded(
        node,
        variantExpectsPhoto,
        variantExpectsPhoto ? effectiveExportPhotoUrl : null
      );

      const blob = await exportStoryNodeToBlob(node, {
        isTransparent: variantIsTransparent,
        backgroundColor: variantIsTransparent ? undefined : '#000000',
        expectBackgroundPhoto: variantExpectsPhoto,
        bgProbe,
      });

      const slug = buildSafeMissionSlug(mission?.missionTitle);
      const filename = `arenafitpro-missao-${slug}-${variant}-${Date.now()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });
      const objectUrl = URL.createObjectURL(blob);

      return {
        blob,
        file,
        objectUrl,
        cacheKey: currentCacheKey,
      };
    },
    [
      cardNodeRef,
      stickerNodeRef,
      isPhotoBgMode,
      effectiveExportPhotoUrl,
      backgroundMode,
      mission?.missionTitle,
      currentCacheKey,
    ]
  );

  // 2. Render both card and sticker 1080x1920 PNG blobs whenever cacheKey changes
  useEffect(() => {
    if (!open || !assetsReady || !mission) return;

    if (
      (backgroundMode === 'gallery' || backgroundMode === 'camera') &&
      !backgroundPhotoUrl
    ) {
      return;
    }

    let cancelled = false;

    async function renderBothVariants() {
      setExporting(true);
      setExportError(null);

      setCacheState((prev) => {
        if (prev.key === currentCacheKey) return prev;
        if (prev.cards.card?.objectUrl) URL.revokeObjectURL(prev.cards.card.objectUrl);
        if (prev.cards.sticker?.objectUrl) URL.revokeObjectURL(prev.cards.sticker.objectUrl);
        return { key: currentCacheKey, cards: {} };
      });

      try {
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) return;

        if (typeof document !== 'undefined' && 'fonts' in document) {
          await document.fonts.ready;
        }
        if (cancelled) return;

        const cardNode = cardNodeRef.current;
        const stickerNode = stickerNodeRef.current;
        if (!cardNode || !stickerNode) {
          throw new Error('Cards de exportação não encontrados.');
        }

        if (warmedUpKeyRef.current !== currentCacheKey) {
          await warmupStoryNodes([cardNode, stickerNode], {
            isTransparent: backgroundMode === 'transparent',
          }).catch(() => {});
          warmedUpKeyRef.current = currentCacheKey;
        }
        if (cancelled) return;

        const [cardBundle, stickerBundle] = await Promise.all([
          buildVariantBundle('card'),
          buildVariantBundle('sticker'),
        ]);

        if (cancelled) {
          URL.revokeObjectURL(cardBundle.objectUrl);
          URL.revokeObjectURL(stickerBundle.objectUrl);
          return;
        }

        setCacheState((prev) => {
          if (prev.cards.card?.objectUrl) URL.revokeObjectURL(prev.cards.card.objectUrl);
          if (prev.cards.sticker?.objectUrl) URL.revokeObjectURL(prev.cards.sticker.objectUrl);
          return {
            key: currentCacheKey,
            cards: {
              card: cardBundle,
              sticker: stickerBundle,
            },
          };
        });
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : 'Não foi possível preparar a imagem da missão para exportação.';
        console.error('[useMissionExport] Erro na captura:', err);
        setExportError(msg);
        onExportErrorRef.current?.(msg);
      } finally {
        if (!cancelled) {
          setExporting(false);
        }
      }
    }

    renderBothVariants();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    assetsReady,
    mission,
    backgroundMode,
    backgroundPhotoUrl,
    effectiveExportPhotoUrl,
    currentCacheKey,
    cardNodeRef,
    stickerNodeRef,
    buildVariantBundle,
  ]);

  const exportVariantOnDemand = useCallback(
    async (variant: MissionCardVariant): Promise<ExportedMissionCardBundle | null> => {
      if (cacheState.key === currentCacheKey && cacheState.cards[variant]) {
        return cacheState.cards[variant]!;
      }
      try {
        setExporting(true);
        setExportError(null);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const bundle = await buildVariantBundle(variant);
        setCacheState((prev) => ({
          key: currentCacheKey,
          cards: {
            ...(prev.key === currentCacheKey ? prev.cards : {}),
            [variant]: bundle,
          },
        }));
        return bundle;
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Não foi possível gerar o PNG da missão.';
        setExportError(msg);
        onExportErrorRef.current?.(msg);
        return null;
      } finally {
        setExporting(false);
      }
    },
    [cacheState, currentCacheKey, buildVariantBundle]
  );

  const isCacheValid = cacheState.key === currentCacheKey;
  const validCards = isCacheValid ? cacheState.cards : {};
  const isWaitingForGalleryOrCamera =
    (backgroundMode === 'gallery' || backgroundMode === 'camera') &&
    !backgroundPhotoUrl;

  return {
    preloadedImages,
    resolvedPhotoDataUrl,
    effectiveExportPhotoUrl,
    expectsCardPhoto,
    isPreparing:
      !assetsReady ||
      exporting ||
      isWaitingForGalleryOrCamera ||
      (!exportError && !isCacheValid),
    exportError,
    exportedCards: validCards,
    exportVariantOnDemand,
  };
}
