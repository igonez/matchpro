'use client';

export interface StoryExportHtmlOptions {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  pixelRatio: number;
  cacheBust: boolean;
  backgroundColor?: string;
}

export interface ExportStoryNodeOptions {
  width?: number;
  height?: number;
  isTransparent?: boolean;
  backgroundColor?: string;
  expectBackgroundPhoto?: boolean;
  bgProbe?: HTMLImageElement | null;
}

export function buildStoryHtmlToImageOptions(opts?: {
  width?: number;
  height?: number;
  isTransparent?: boolean;
  backgroundColor?: string;
}): StoryExportHtmlOptions {
  const width = opts?.width ?? 1080;
  const height = opts?.height ?? 1920;
  const isTransparent = opts?.isTransparent ?? false;
  return {
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio: 1,
    cacheBust: false,
    backgroundColor: isTransparent ? undefined : (opts?.backgroundColor ?? '#000000'),
  };
}

/**
 * Converte uma URL de imagem (local ou remota com CORS) em dataURL PNG,
 * redimensionando proporcionalmente até `maxDim` (padrão 256px para logos; usar 2160 para fotos).
 */
export async function preloadImageToDataUrl(
  url?: string | null,
  timeoutMs = 4000,
  maxDim = 256
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
export async function ensureNodeImagesDecoded(
  node: HTMLElement,
  expectBackgroundPhoto = false,
  expectedBgSrc: string | null = null
): Promise<HTMLImageElement | null> {
  let decodedBgProbe: HTMLImageElement | null = null;

  if (expectBackgroundPhoto) {
    if (!expectedBgSrc || !expectedBgSrc.startsWith('data:image/')) {
      throw new Error('Foto de fundo ausente ou em formato inválido para captura.');
    }

    const probe = new Image();
    probe.src = expectedBgSrc;
    if (typeof probe.decode === 'function') {
      await probe.decode();
    }
    if (!probe.naturalWidth || !probe.naturalHeight) {
      throw new Error('Não foi possível decodificar a foto de fundo.');
    }
    decodedBgProbe = probe;

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
export function drawObjectFitCover(
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
 * se o <foreignObject> do navegador tiver descartado a <img> (deixando #000000 ou #09090b sólido),
 * compõe a foto decodificada + overlay 30% + foreground transparente para garantir que
 * NUNCA saia um PNG preto sem a foto.
 */
export async function verifyOrCompositeBackgroundPhoto(
  capturedBlob: Blob,
  node: HTMLElement,
  bgProbe: HTMLImageElement,
  options: StoryExportHtmlOptions
): Promise<Blob> {
  const { width, height } = options;
  const bitmapUrl = URL.createObjectURL(capturedBlob);
  try {
    const renderedImg = new Image();
    renderedImg.src = bitmapUrl;
    if (typeof renderedImg.decode === 'function') {
      await renderedImg.decode();
    }

    const checkCanvas = document.createElement('canvas');
    checkCanvas.width = width;
    checkCanvas.height = height;
    const ctx = checkCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Falha ao validar imagem exportada.');
    }

    ctx.drawImage(renderedImg, 0, 0, width, height);

    const p1 = ctx.getImageData(200, 200, 1, 1).data;
    const p2 = ctx.getImageData(540, 300, 1, 1).data;
    const p3 = ctx.getImageData(880, 200, 1, 1).data;
    const isSolidFallbackBlack = (p: Uint8ClampedArray) =>
      p[0] <= 12 && p[1] <= 12 && p[2] <= 14;

    if (
      !isSolidFallbackBlack(p1) ||
      !isSolidFallbackBlack(p2) ||
      !isSolidFallbackBlack(p3)
    ) {
      return capturedBlob;
    }

    const bgDomImg = node.querySelector<HTMLElement>('img[data-role="card-bg-photo"]');
    const overlayDom = node.querySelector<HTMLElement>('[data-testid="card-photo-overlay-30"]');
    const prevImgVis = bgDomImg?.style.visibility;
    const prevOvVis = overlayDom?.style.visibility;

    let fgBlob: Blob | null = null;
    try {
      if (bgDomImg) bgDomImg.style.visibility = 'hidden';
      if (overlayDom) overlayDom.style.visibility = 'hidden';
      const { toBlob } = await import('html-to-image');
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

      ctx.clearRect(0, 0, width, height);
      drawObjectFitCover(ctx, bgProbe, width, height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(fgImg, 0, 0, width, height);

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

/**
 * Executa captura de aquecimento (WebKit/iOS font & SVG pre-bake) nos nós offscreen.
 */
export async function warmupStoryNodes(
  nodes: HTMLElement[],
  opts?: {
    width?: number;
    height?: number;
    isTransparent?: boolean;
    backgroundColor?: string;
  }
): Promise<void> {
  const { toPng } = await import('html-to-image');
  const htmlOptions = buildStoryHtmlToImageOptions(opts);
  await Promise.all(nodes.map((node) => toPng(node, htmlOptions)));
}

/**
 * Exporta um nó DOM 1080x1920 para Blob PNG com fallback compositor WebKit-safe.
 */
export async function exportStoryNodeToBlob(
  node: HTMLElement,
  opts?: ExportStoryNodeOptions
): Promise<Blob> {
  const { toBlob } = await import('html-to-image');
  const htmlOptions = buildStoryHtmlToImageOptions(opts);
  const rawBlob = await toBlob(node, htmlOptions);
  if (!rawBlob || rawBlob.size < 1024) {
    throw new Error('Falha ao gerar o arquivo PNG de alta resolução.');
  }

  if (opts?.expectBackgroundPhoto && opts.bgProbe) {
    return verifyOrCompositeBackgroundPhoto(rawBlob, node, opts.bgProbe, htmlOptions);
  }

  return rawBlob;
}
