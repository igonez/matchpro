'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Copy,
  Download,
  Grid,
  Image as ImageIcon,
  Link2Off,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  RankingBgMode,
  RankingCardVariant,
  RankingShareCard,
  ShareParticipantItem,
} from './ranking-share-card';
import { readPhotoFileToDataUrl, useRankingExport } from './use-ranking-export';

export interface ShareRankingSheetProps {
  open: boolean;
  onClose: () => void;
  challengeId?: string | null;
  challengeTitle: string;
  challengeLogoUrl?: string | null;
  standings: ShareParticipantItem[];
  currentUserId?: string | null;
  isCoachView?: boolean;
}

interface ShareLinkState {
  code: string;
  url: string;
  expiresAt: string;
}

const PREVIEW_WIDTH = 248;
const PREVIEW_HEIGHT = 441; // 248 * (16 / 9)
const PREVIEW_SCALE = PREVIEW_WIDTH / 1080;

export function ShareRankingSheet({
  open,
  onClose,
  challengeId,
  challengeTitle,
  challengeLogoUrl,
  standings,
  currentUserId,
  isCoachView = false,
}: ShareRankingSheetProps) {
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const [bgMode, setBgMode] = useState<RankingBgMode>('transparent');
  const [bgPhotos, setBgPhotos] = useState<{ gallery: string | null; camera: string | null }>({
    gallery: null,
    camera: null,
  });

  // Guarda o modo anterior antes de abrir seletor de Galeria ou Câmera (para restaurar se cancelar/negar)
  const previousBgStateRef = useRef<{
    mode: RankingBgMode;
    photos: { gallery: string | null; camera: string | null };
  }>({
    mode: 'transparent',
    photos: { gallery: null, camera: null },
  });
  const pendingPickerRef = useRef<'gallery' | 'camera' | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Refs dos 2 cards 1080x1920 fora da tela para captura PNG
  const offscreenPodiumRef = useRef<HTMLDivElement | null>(null);
  const offscreenListRef = useRef<HTMLDivElement | null>(null);

  // Estado de câmera ao vivo (WebRTC getUserMedia quando disponível)
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Link público curto pré-gerado no POST /api/rankings/:id/share
  const [shareLink, setShareLink] = useState<ShareLinkState | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkRevoked, setLinkRevoked] = useState(false);
  const [revokingLink, setRevokingLink] = useState(false);

  // Toast interno
  const [toast, setToast] = useState<{ message: string; tone?: 'success' | 'error' | 'info' } | null>(
    null
  );
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, tone: 'success' | 'error' | 'info' = 'success') => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({ message, tone });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 3200);
    },
    []
  );

  const activePhotoUrl =
    bgMode === 'gallery'
      ? bgPhotos.gallery
      : bgMode === 'camera'
      ? bgPhotos.camera
      : null;

  const { preloadedImages, isPreparing, exportedCards } = useRankingExport({
    open,
    standings,
    challengeLogoUrl,
    backgroundMode: bgMode,
    backgroundPhotoUrl: activePhotoUrl,
    podiumNodeRef: offscreenPodiumRef,
    listNodeRef: offscreenListRef,
  });

  const activeVariant: RankingCardVariant = activeSlide === 0 ? 'podium' : 'list';
  const activeBundle = exportedCards[activeVariant];

  // Fechar stream de câmera se houver
  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      stopCameraStream();
      setCameraModalOpen(false);
    }
  }, [open, stopCameraStream]);

  // Tecla ESC fecha a tela
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (cameraModalOpen) {
          stopCameraStream();
          setCameraModalOpen(false);
          setBgMode(previousBgStateRef.current.mode);
          setBgPhotos(previousBgStateRef.current.photos);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, cameraModalOpen, onClose, stopCameraStream]);

  // Pré-gerar o link público curto assim que o modal abre (preserva user gesture no clique de Mais/Story)
  const createOrRefreshShareLink = useCallback(
    async (forceNew = false) => {
      if (!challengeId || standings.length === 0) return null;
      setLinkLoading(true);
      try {
        const res = await fetch(`/api/rankings/${encodeURIComponent(challengeId)}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forceNew }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.url) {
          if (forceNew) {
            showToast(json?.error || 'Não foi possível gerar o link público.', 'error');
          }
          return null;
        }
        const nextLink: ShareLinkState = {
          code: json.code,
          url: json.url,
          expiresAt: json.expiresAt,
        };
        setShareLink(nextLink);
        setLinkRevoked(false);
        if (forceNew) {
          showToast('Novo link público ativado!', 'success');
        }
        return nextLink;
      } catch {
        if (forceNew) {
          showToast('Erro de conexão ao gerar link.', 'error');
        }
        return null;
      } finally {
        setLinkLoading(false);
      }
    },
    [challengeId, standings.length, showToast]
  );

  useEffect(() => {
    if (!open) return;
    createOrRefreshShareLink(false);
  }, [open, createOrRefreshShareLink]);

  // Revogar link ativo (DELETE /api/rankings/share/:code)
  const handleRevokeLink = async () => {
    if (!shareLink?.code || revokingLink) return;
    setRevokingLink(true);
    try {
      const res = await fetch(`/api/rankings/share/${encodeURIComponent(shareLink.code)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        showToast(errJson?.error || 'Não foi possível desativar o link.', 'error');
        return;
      }
      setShareLink(null);
      setLinkRevoked(true);
      showToast('Link público desativado com sucesso.', 'info');
    } catch {
      showToast('Erro ao desativar o link.', 'error');
    } finally {
      setRevokingLink(false);
    }
  };

  // Detectar cancelamento de input file nativo (evento 'cancel' + fallback window focus)
  useEffect(() => {
    const galleryInput = galleryInputRef.current;
    const cameraInput = cameraInputRef.current;

    const handleCancel = () => {
      if (pendingPickerRef.current) {
        pendingPickerRef.current = null;
        setBgMode(previousBgStateRef.current.mode);
        setBgPhotos(previousBgStateRef.current.photos);
      }
    };

    galleryInput?.addEventListener('cancel', handleCancel);
    cameraInput?.addEventListener('cancel', handleCancel);

    return () => {
      galleryInput?.removeEventListener('cancel', handleCancel);
      cameraInput?.removeEventListener('cancel', handleCancel);
    };
  }, [open]);

  // Seleção de Plano de Fundo
  const handleSelectTransparent = () => {
    pendingPickerRef.current = null;
    setBgMode('transparent');
  };

  const handleSelectGallery = () => {
    previousBgStateRef.current = { mode: bgMode, photos: { ...bgPhotos } };
    pendingPickerRef.current = 'gallery';
    setBgMode('gallery');
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
  };

  const handleSelectCamera = async () => {
    previousBgStateRef.current = { mode: bgMode, photos: { ...bgPhotos } };
    setBgMode('camera');

    // Em dispositivos móveis com câmera nativa via input capture, ou se getUserMedia existir:
    // Usamos getUserMedia para verificar permissão real e capturar foto ao vivo; se indisponível, fallback para input capture.
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1080 }, height: { ideal: 1920 } },
          audio: false,
        });
        mediaStreamRef.current = stream;
        setCameraModalOpen(true);
        requestAnimationFrame(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        });
        return;
      } catch (err: any) {
        const errName = err?.name || '';
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          setBgMode(previousBgStateRef.current.mode);
          setBgPhotos(previousBgStateRef.current.photos);
          showToast('Permissão da câmera negada. Habilite o acesso nas configurações do navegador.', 'error');
          return;
        }
        // Se falhar por falta de webcam no desktop ou outro motivo, tenta input file com capture
      }
    }

    pendingPickerRef.current = 'camera';
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    } else {
      setBgMode(previousBgStateRef.current.mode);
      showToast('Câmera não disponível neste dispositivo.', 'error');
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    source: 'gallery' | 'camera'
  ) => {
    pendingPickerRef.current = null;
    const file = e.target.files?.[0];
    if (!file) {
      // Cancelou sem escolher arquivo -> volta ao modo anterior
      setBgMode(previousBgStateRef.current.mode);
      setBgPhotos(previousBgStateRef.current.photos);
      return;
    }

    try {
      const dataUrl = await readPhotoFileToDataUrl(file);
      setBgPhotos((prev) => ({ ...prev, [source]: dataUrl }));
      setBgMode(source);
    } catch (err: any) {
      setBgMode(previousBgStateRef.current.mode);
      setBgPhotos(previousBgStateRef.current.photos);
      showToast(err?.message || 'Não foi possível carregar a foto selecionada.', 'error');
    }
  };

  const handleCaptureFromLiveCamera = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 1080;
    const h = video.videoHeight || 1920;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCameraStream();
    setCameraModalOpen(false);
    setBgPhotos((prev) => ({ ...prev, camera: dataUrl }));
    setBgMode('camera');
  };

  const handleCancelLiveCamera = () => {
    stopCameraStream();
    setCameraModalOpen(false);
    setBgMode(previousBgStateRef.current.mode);
    setBgPhotos(previousBgStateRef.current.photos);
  };

  // Sincronizar dots ao fazer scroll no carrossel
  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    const clamped = idx >= 1 ? 1 : 0;
    if (clamped !== activeSlide) {
      setActiveSlide(clamped);
    }
  };

  const scrollToSlide = (index: 0 | 1) => {
    setActiveSlide(index);
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: 'smooth',
    });
  };

  // =========================================================================
  // AÇÕES DE COMPARTILHAMENTO (Preservando User Activation no Safari iOS)
  // =========================================================================

  // 1. COPIAR (Imagem para área de transferência ou fallback link curto, com toast)
  const handleCopyAction = async () => {
    if (!activeBundle) {
      showToast('Aguarde o preparo da imagem…', 'info');
      return;
    }

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.write === 'function' &&
        typeof ClipboardItem !== 'undefined'
      ) {
        const item = new ClipboardItem({
          'image/png': Promise.resolve(activeBundle.blob),
        });
        await navigator.clipboard.write([item]);
        showToast('Card copiado para a área de transferência!', 'success');
        return;
      }
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        // Fallback para copiar link texto se permissão de imagem for restrita
      }
    }

    // Fallback: copiar link público ou resumo do ranking
    const fallbackUrl =
      shareLink?.url || (typeof window !== 'undefined' ? window.location.origin : 'https://arenafitpro.com.br');
    try {
      await navigator.clipboard.writeText(
        `🏆 Ranking Oficial • ${challengeTitle}\nConfira no ArenaFitPro: ${fallbackUrl}`
      );
      showToast('Link do ranking copiado para a área de transferência!', 'success');
    } catch {
      showToast('Permissão da área de transferência negada pelo navegador.', 'error');
    }
  };

  // 2. SALVAR (Sem diálogo intermediário; download direto ou share sheet iOS + confirmação toast)
  const handleSaveAction = async () => {
    if (!activeBundle) {
      showToast('Aguarde o preparo da imagem…', 'info');
      return;
    }

    try {
      const isIOS =
        typeof navigator !== 'undefined' &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (
        isIOS &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [activeBundle.file] })
      ) {
        await navigator.share({
          files: [activeBundle.file],
          title: `Ranking • ${challengeTitle}`,
        });
        showToast('Imagem pronta! Toque em "Salvar Imagem" concluído.', 'success');
        return;
      }

      const a = document.createElement('a');
      a.href = activeBundle.objectUrl;
      a.download = `arenafitpro-${activeVariant}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Imagem PNG 1080×1920 salva com sucesso!', 'success');
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      if (err?.name === 'NotAllowedError') {
        showToast('Permissão para salvar negada pelo sistema.', 'error');
        return;
      }
      showToast('Não foi possível salvar a imagem.', 'error');
    }
  };

  // 4. MAIS (Share sheet com link público + arquivo quando suportado)
  const handleMoreAction = async () => {
    const publicUrl =
      shareLink?.url ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/app/leaderboard${challengeId ? `?challenge=${challengeId}` : ''}`
        : 'https://arenafitpro.com.br');

    const shareTitle = `Ranking Oficial • ${challengeTitle}`;
    const shareText = `🏆 Confira a classificação oficial do desafio ${challengeTitle} no ArenaFitPro!`;

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        if (
          activeBundle &&
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [activeBundle.file], url: publicUrl, title: shareTitle, text: shareText })
        ) {
          await navigator.share({
            files: [activeBundle.file],
            title: shareTitle,
            text: shareText,
            url: publicUrl,
          });
          return;
        }

        await navigator.share({
          title: shareTitle,
          text: `${shareText}\n${publicUrl}`,
          url: publicUrl,
        });
        return;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }

    // Fallback para navegadores desktop sem Web Share API: copia o link e avisa
    try {
      await navigator.clipboard.writeText(`${shareText}\n${publicUrl}`);
      showToast('Link público copiado para compartilhar!', 'success');
    } catch {
      showToast('Compartilhamento indisponível neste navegador.', 'error');
    }
  };

  // 3. STORY (Instagram via share sheet com arquivo 9:16; fallback para Mais)
  const handleStoryAction = async () => {
    if (!activeBundle) {
      showToast('Aguarde o preparo da imagem…', 'info');
      return;
    }

    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [activeBundle.file] })
      ) {
        await navigator.share({
          files: [activeBundle.file],
          title: `Story • ${challengeTitle}`,
        });
        return;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }

    // Fallback para "Mais" quando o navegador não suporta envio direto de arquivo para o Story
    await handleMoreAction();
  };

  if (!open) return null;

  const isEmptyRanking = standings.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-ranking-title"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between overflow-y-auto"
    >
      {/* Container offscreen 1080x1920 para renderização determinística do PNG */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-100000px',
          top: 0,
          width: '1080px',
          height: '1920px',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <RankingShareCard
          ref={offscreenPodiumRef}
          variant="podium"
          challengeTitle={challengeTitle}
          challengeLogoUrl={challengeLogoUrl}
          standings={standings}
          currentUserId={currentUserId}
          isCoachView={isCoachView}
          backgroundMode={bgMode}
          backgroundPhotoUrl={activePhotoUrl}
          preloadedImages={preloadedImages}
        />
        <RankingShareCard
          ref={offscreenListRef}
          variant="list"
          challengeTitle={challengeTitle}
          challengeLogoUrl={challengeLogoUrl}
          standings={standings}
          currentUserId={currentUserId}
          isCoachView={isCoachView}
          backgroundMode={bgMode}
          backgroundPhotoUrl={activePhotoUrl}
          preloadedImages={preloadedImages}
        />
      </div>

      {/* Inputs ocultos de Galeria e Câmera */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'gallery')}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'camera')}
      />

      {/* Toast flutuante */}
      {toast && (
        <div
          role="status"
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold shadow-2xl flex items-center gap-2 transition-all ${
            toast.tone === 'error'
              ? 'bg-rose-950/95 border-rose-500/50 text-rose-200'
              : toast.tone === 'info'
              ? 'bg-zinc-900/95 border-white/20 text-zinc-200'
              : 'bg-emerald-950/95 border-emerald-400/50 text-emerald-200'
          }`}
        >
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modal de Captura da Câmera ao Vivo (quando getUserMedia é usado) */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-[65] bg-black flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancelLiveCamera}
              className="min-h-[42px] px-4 rounded-xl bg-white/10 text-xs font-mono font-bold text-white cursor-pointer"
            >
              Cancelar
            </button>
            <span className="text-xs font-mono font-bold text-amber-300 uppercase">
              Foto de Fundo (9:16)
            </span>
            <div className="w-20" />
          </div>

          <div className="flex-1 flex items-center justify-center my-4 overflow-hidden rounded-3xl border border-white/15 bg-zinc-950">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full max-w-sm aspect-[9/16] object-cover"
            />
          </div>

          <div className="flex items-center justify-center pb-4">
            <button
              type="button"
              onClick={handleCaptureFromLiveCamera}
              className="h-16 w-16 rounded-full bg-white border-4 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)] cursor-pointer active:scale-95 transition-transform"
              aria-label="Capturar foto"
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-md mx-auto flex flex-col flex-1 justify-between px-4 py-3 sm:py-5 gap-3">
        {/* 1. HEADER: "Fechar" e título "Compartilhar ranking" */}
        <header className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Fechar</span>
          </button>

          <h1
            id="share-ranking-title"
            className="text-sm sm:text-base font-black text-white tracking-tight"
          >
            Compartilhar ranking
          </h1>

          <div className="w-[74px] flex justify-end">
            {isPreparing && (
              <Loader2
                className="w-4 h-4 text-amber-400 animate-spin"
                aria-label="Renderizando card"
              />
            )}
          </div>
        </header>

        {isEmptyRanking ? (
          <div className="my-auto p-8 rounded-3xl border border-white/10 bg-zinc-950 text-center space-y-2">
            <p className="text-sm font-bold text-white">Ainda não há participantes pontuados</p>
            <p className="text-xs text-zinc-400">
              Assim que os primeiros check-ins forem registrados, você poderá compartilhar o ranking.
            </p>
          </div>
        ) : (
          <>
            {/* 2. CARROSSEL DE 2 CARDS 9:16 (Pódio Top 3 e Lista Top 10) COM DOTS */}
            <section className="flex flex-col items-center gap-2.5">
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: 'none' }}
              >
                {(['podium', 'list'] as const).map((variant, idx) => {
                  const showCheckerboard =
                    bgMode === 'transparent' || !activePhotoUrl;
                  return (
                    <div
                      key={variant}
                      className="w-full shrink-0 snap-center flex flex-col items-center justify-center px-2"
                    >
                      <div
                        data-testid={`preview-card-${variant}`}
                        data-checkerboard={showCheckerboard ? 'true' : 'false'}
                        className="relative rounded-2xl overflow-hidden border border-white/20 shadow-[0_16px_45px_rgba(0,0,0,0.75)]"
                        style={{
                          width: `${PREVIEW_WIDTH}px`,
                          height: `${PREVIEW_HEIGHT}px`,
                          // Xadrez SÓ no preview do modo transparente
                          backgroundImage: showCheckerboard
                            ? 'linear-gradient(45deg, #1f1f24 25%, transparent 25%), linear-gradient(-45deg, #1f1f24 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f1f24 75%), linear-gradient(-45deg, transparent 75%, #1f1f24 75%)'
                            : undefined,
                          backgroundSize: showCheckerboard ? '20px 20px' : undefined,
                          backgroundPosition: showCheckerboard
                            ? '0 0, 0 10px, 10px -10px, -10px 0'
                            : undefined,
                          backgroundColor: showCheckerboard ? '#121216' : '#09090b',
                        }}
                      >
                        <div
                          style={{
                            width: '1080px',
                            height: '1920px',
                            transform: `scale(${PREVIEW_SCALE})`,
                            transformOrigin: 'top left',
                            pointerEvents: 'none',
                          }}
                        >
                          <RankingShareCard
                            variant={variant}
                            challengeTitle={challengeTitle}
                            challengeLogoUrl={challengeLogoUrl}
                            standings={standings}
                            currentUserId={currentUserId}
                            isCoachView={isCoachView}
                            backgroundMode={bgMode}
                            backgroundPhotoUrl={activePhotoUrl}
                            preloadedImages={preloadedImages}
                          />
                        </div>

                        {/* Overlay de Loading durante pré-carregamento / exportação */}
                        {isPreparing && idx === activeSlide && (
                          <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <Loader2 className="w-6 h-6 text-amber-300 animate-spin" />
                            <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                              Preparando 1080×1920…
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dots + Labels do Carrossel */}
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => scrollToSlide(0)}
                  aria-label="Slide 1: Pódio Top 3"
                  aria-current={activeSlide === 0}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeSlide === 0 ? 'w-7 bg-amber-400' : 'w-2.5 bg-white/25 hover:bg-white/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => scrollToSlide(1)}
                  aria-label="Slide 2: Lista Top 10"
                  aria-current={activeSlide === 1}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeSlide === 1 ? 'w-7 bg-amber-400' : 'w-2.5 bg-white/25 hover:bg-white/40'
                  }`}
                />
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {activeSlide === 0 ? 'Card 1/2 • Pódio Top 3–5' : 'Card 2/2 • Lista Top 10'}
              </span>
            </section>

            {/* 3. SEÇÃO "PLANO DE FUNDO": Transparente | Galeria | Câmera */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                  Plano de fundo
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {bgMode === 'transparent'
                    ? 'PNG com transparência'
                    : bgMode === 'gallery'
                    ? 'Foto da galeria (overlay 30%)'
                    : 'Foto da câmera (overlay 30%)'}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="Plano de fundo"
                className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-950 border border-white/10"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={bgMode === 'transparent'}
                  onClick={handleSelectTransparent}
                  className={`min-h-[42px] py-2 px-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bgMode === 'transparent'
                      ? 'bg-white text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 shrink-0" />
                  <span>Transparente</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={bgMode === 'gallery'}
                  onClick={handleSelectGallery}
                  className={`min-h-[42px] py-2 px-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bgMode === 'gallery'
                      ? 'bg-white text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>Galeria</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={bgMode === 'camera'}
                  onClick={handleSelectCamera}
                  className={`min-h-[42px] py-2 px-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bgMode === 'camera'
                      ? 'bg-white text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>Câmera</span>
                </button>
              </div>

              {/* Dica para usar Sticker Transparente no Instagram Story */}
              {bgMode === 'transparent' && (
                <div className="px-3 py-2 rounded-xl bg-amber-400/[0.08] border border-amber-400/25 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-100/90 leading-snug">
                    <strong>Dica para sticker transparente:</strong> toque em <strong>Salvar</strong>{' '}
                    e adicione o PNG salvo da sua galeria como <strong>Sticker</strong> dentro do
                    Story do Instagram.
                  </p>
                </div>
              )}
            </section>

            {/* 4. SEÇÃO "COMPARTILHAR COM": Copiar, Salvar, Story, Mais */}
            <section className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 px-1 block">
                Compartilhar com
              </span>

              <div className="grid grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyAction}
                  disabled={isPreparing}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-white/10 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Copy className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-200">Copiar</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAction}
                  disabled={isPreparing}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-white/10 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-200">Salvar</span>
                </button>

                <button
                  type="button"
                  onClick={handleStoryAction}
                  disabled={isPreparing}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-pink-500/30 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-200">Story</span>
                </button>

                <button
                  type="button"
                  onClick={handleMoreAction}
                  disabled={isPreparing}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-amber-400/30 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-zinc-200">Mais</span>
                </button>
              </div>
            </section>

            {/* 5. CONTROLE DO LINK PÚBLICO CURTO (/r/:code + Desativar link) */}
            {challengeId && (
              <footer className="pt-1 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] font-mono">
                {linkLoading ? (
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Gerando link curto…
                  </span>
                ) : shareLink ? (
                  <>
                    <span className="text-zinc-400 truncate">
                      Link ativo:{' '}
                      <strong className="text-zinc-200">/r/{shareLink.code}</strong> (30d)
                    </span>
                    <button
                      type="button"
                      onClick={handleRevokeLink}
                      disabled={revokingLink}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <Link2Off className="w-3 h-3" />
                      <span>{revokingLink ? 'Desativando…' : 'Desativar link'}</span>
                    </button>
                  </>
                ) : linkRevoked ? (
                  <>
                    <span className="text-zinc-500">Link público desativado</span>
                    <button
                      type="button"
                      onClick={() => createOrRefreshShareLink(true)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-200 font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Gerar novo link</span>
                    </button>
                  </>
                ) : (
                  <span className="text-zinc-500">Link público pronto ao compartilhar</span>
                )}
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
}
