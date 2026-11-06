'use client';

import { useEffect, useRef, useState } from 'react';
import { toBlob, toPng } from 'html-to-image';
import type { RankingBgMode, RankingCardVariant, ShareParticipantItem } from './ranking-share-card';

export async function preloadImageToDataUrl(
  url?: string | null,
  timeoutMs = 3500
): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      resolve(null);
    }, timeoutMs);

    img.onload = async () => {
      clearTimeout(timer);
      try {
        if (typeof img.decode === 'function') {
          await img.decode().catch(() => {});
        }
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

/**
 * Converte a foto escolhida (Galeria ou Câmera) para data URL JPEG
 * (máx 2160px, qualidade 0.9), aguardando img.decode() antes de retornar.
 */
export async function readPhotoFileToDataUrl(
  file: File,
  maxDim = 2160,
  quality = 0.9
): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a foto selecionada.'));
    reader.onload = () => {
      const res = String(reader.result || '');
      if (!res.startsWith('data:image/')) {
        reject(new Error('Arquivo selecionado não é uma imagem válida.'));
        return;
      }
      resolve(res);
    };
    reader.readAsDataURL(file);
  });

  const img = new Image();
  img.src = rawDataUrl;

  if (typeof img.decode === 'function') {
    await img.decode();
  } else {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Falha ao decodificar a foto selecionada.'));
    });
  }

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) {
    throw new Error('Dimensões da imagem inválidas.');
  }

  const scale = Math.min(1, maxDim / Math.max(w, h));
  const targetW = Math.max(1, Math.round(w * scale));
  const targetH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Contexto gráfico indisponível para processar a foto.');
  }

  ctx.drawImage(img, 0, 0, targetW, targetH);
  const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);

  const verifyImg = new Image();
  verifyImg.src = jpegDataUrl;
  if (typeof verifyImg.decode === 'function') {
    await verifyImg.decode();
  }

  return jpegDataUrl;
}

/**
 * Aguarda que todas as tags <img> dentro do nó offscreen (especialmente a foto de fundo)
 * estejam carregadas e decodificadas via img.decode().
 */
async function ensureNodeImagesDecoded(
  node: HTMLElement,
  expectBackgroundPhoto: boolean,
  expectedBgSrc: string | null
): Promise<HTMLImageElement | null> {
  let decodedBgProbe: HTMLImageElement | null = null;

  if (expectBackgroundPhoto) {
    if (!expectedBgSrc || !expectedBgSrc.startsWith('data:image/')) {
      throw new Error('Foto de fundo ausente ou em formato inválido para captura.');
    }

    // 1. Verifica e decodifica a dataURL diretamente em memória
    const probe = new Image();
    probe.src = expectedBgSrc;
    if (typeof probe.decode === 'function') {
      await probe.decode();
    }
    if (!probe.naturalWidth || !probe.naturalHeight) {
      throw new Error('Não foi possível decodificar a foto de fundo.');
    }
    decodedBgProbe = probe;

    // 2. Confirma que o elemento <img data-role="card-bg-photo"> já está montado no DOM do card
    const bgDomImg = node.querySelector<HTMLImageElement>('img[data-role="card-bg-photo"]');
    if (!bgDomImg || !bgDomImg.getAttribute('src')?.startsWith('data:image/')) {
      throw new Error('Elemento da foto de fundo ainda não sincronizado no card de exportação.');
    }
    if (typeof bgDomImg.decode === 'function') {
      await bgDomImg.decode();
    }
    if (!bgDomImg.complete || bgDomImg.naturalWidth === 0) {
      throw new Error('A foto de fundo falhou ao renderizar no card.');
    }
  }

  // 3. Decodifica todas as demais imagens (ex.: logo) presentes no nó
  const allImgs = Array.from(node.querySelectorAll<HTMLImageElement>('img'));
  await Promise.all(
    allImgs.map(async (imgEl) => {
      if (!imgEl.getAttribute('src')) return;
      if (typeof imgEl.decode === 'function') {
        await imgEl.decode().catch(() => {
          if (imgEl.dataset.role === 'card-bg-photo') {
            throw new Error('Falha ao decodificar a foto de fundo na captura.');
          }
        });
      }
    })
  );

  return decodedBgProbe;
}

/**
 * Desenha uma imagem simulando object-fit: cover em (0, 0, targetW, targetH)
 */
function drawObjectFitCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetW: number,
  targetH: number
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(targetW / iw, targetH / ih);
  const sw = targetW / scale;
  const sh = targetH / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
}

/**
 * Verifica se o PNG exportado realmente contém a foto de fundo renderizada no topo;
 * se o <foreignObject> do navegador tiver descartado a <img> (deixando #09090b sólido),
 * compõe a foto decodificada + overlay 30% + foreground transparente para garantir que
 * NUNCA saia um PNG preto sem a foto.
 */
async function verifyOrCompositeBackgroundPhoto(
  capturedBlob: Blob,
  node: HTMLElement,
  bgProbe: HTMLImageElement,
  options: Record<string, unknown>
): Promise<Blob> {
  const bitmapUrl = URL.createObjectURL(capturedBlob);
  try {
    const renderedImg = new Image();
    renderedImg.src = bitmapUrl;
    if (typeof renderedImg.decode === 'function') {
      await renderedImg.decode();
    }

    const checkCanvas = document.createElement('canvas');
    checkCanvas.width = 1080;
    checkCanvas.height = 1920;
    const ctx = checkCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Falha ao validar imagem exportada.');
    }

    ctx.drawImage(renderedImg, 0, 0, 1080, 1920);

    // Amostra 3 pontos na metade superior (onde só há a foto + overlay 30%)
    const p1 = ctx.getImageData(200, 200, 1, 1).data;
    const p2 = ctx.getImageData(540, 300, 1, 1).data;
    const p3 = ctx.getImageData(880, 200, 1, 1).data;
    const isSolidFallbackBlack = (p: Uint8ClampedArray) =>
      Math.abs(p[0] - 9) <= 2 && Math.abs(p[1] - 9) <= 2 && Math.abs(p[2] - 11) <= 2;

    if (
      !isSolidFallbackBlack(p1) ||
      !isSolidFallbackBlack(p2) ||
      !isSolidFallbackBlack(p3)
    ) {
      // A foto de fundo já foi renderizada normalmente pelo html-to-image!
      return capturedBlob;
    }

    // Caso o WebKit/iOS tenha omitido a <img> no foreignObject, capturamos apenas o foreground transparente
    // e compomos sobre a foto real + overlay 30%
    const bgDomImg = node.querySelector<HTMLElement>('img[data-role="card-bg-photo"]');
    const overlayDom = node.querySelector<HTMLElement>('[data-testid="card-photo-overlay-30"]');
    const prevImgVis = bgDomImg?.style.visibility;
    const prevOvVis = overlayDom?.style.visibility;

    let fgBlob: Blob | null = null;
    try {
      if (bgDomImg) bgDomImg.style.visibility = 'hidden';
      if (overlayDom) overlayDom.style.visibility = 'hidden';
      fgBlob = await toBlob(node, { ...options, backgroundColor: undefined });
    } finally {
      if (bgDomImg) bgDomImg.style.visibility = prevImgVis || '';
      if (overlayDom) overlayDom.style.visibility = prevOvVis || '';
    }

    if (!fgBlob) {
      throw new Error('Não foi possível renderizar a foto de fundo no card.');
    }

    const fgUrl = URL.createObjectURL(fgBlob);
    try {
      const fgImg = new Image();
      fgImg.src = fgUrl;
      if (typeof fgImg.decode === 'function') {
        await fgImg.decode();
      }

      ctx.clearRect(0, 0, 1080, 1920);
      drawObjectFitCover(ctx, bgProbe, 1080, 1920);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.drawImage(fgImg, 0, 0, 1080, 1920);

      const composited = await new Promise<Blob | null>((resolve) =>
        checkCanvas.toBlob((b) => resolve(b), 'image/png', 1)
      );
      if (!composited) {
        throw new Error('Falha ao exportar PNG com foto de fundo.');
      }
      return composited;
    } finally {
      URL.revokeObjectURL(fgUrl);
    }
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

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
  onExportErrorRef.current = onExportError;

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
        const options = {
          width: 1080,
          height: 1920,
          canvasWidth: 1080,
          canvasHeight: 1920,
          pixelRatio: 1,
          cacheBust: false,
          backgroundColor: isTransparent ? undefined : '#080A0F',
        };

        // Captura de aquecimento no iOS, rodando DEPOIS da foto carregar
        if (warmedUpKeyRef.current !== currentCacheKey) {
          await Promise.all([
            toPng(listNode, options),
            toPng(heroNode, options),
          ]);
          warmedUpKeyRef.current = currentCacheKey;
        }
        if (cancelled) return;

        const renderVariant = async (
          node: HTMLDivElement,
          variant: RankingCardVariant
        ): Promise<ExportedCardBundle> => {
          const rawBlob = await toBlob(node, options);
          if (!rawBlob || rawBlob.size < 1024) {
            throw new Error('Falha ao gerar o arquivo PNG de alta resolução.');
          }

          const finalBlob =
            expectsPhoto && bgProbe
              ? await verifyOrCompositeBackgroundPhoto(rawBlob, node, bgProbe, options)
              : rawBlob;

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
      } catch (err: any) {
        if (cancelled) return;
        const msg =
          err?.message || 'Não foi possível preparar a foto de fundo para exportação.';
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
