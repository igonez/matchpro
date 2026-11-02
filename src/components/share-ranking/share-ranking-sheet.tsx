'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Copy,
  Download,
  Grid,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Upload,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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
  coachId?: string | null;
  coachBrandName?: string | null;
  coachLogoUrl?: string | null;
  standings: ShareParticipantItem[];
  currentUserId?: string | null;
  isCoachView?: boolean;
}

interface ShareLinkState {
  code: string;
  url: string;
  expiresAt: string;
}

const PREVIEW_WIDTH = 244;
const PREVIEW_HEIGHT = 434; // 244 * (16 / 9)
const PREVIEW_SCALE = PREVIEW_WIDTH / 1080;

export function ShareRankingSheet({
  open,
  onClose,
  challengeId,
  challengeTitle,
  challengeLogoUrl,
  coachId,
  coachBrandName,
  coachLogoUrl,
  standings,
  currentUserId,
  isCoachView = false,
}: ShareRankingSheetProps) {
  const supabase = createClient();

  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const [bgMode, setBgMode] = useState<RankingBgMode>('transparent');
  const [bgPhotos, setBgPhotos] = useState<{ gallery: string | null; camera: string | null }>({
    gallery: null,
    camera: null,
  });
  const [photoVersion, setPhotoVersion] = useState(0);

  // Estado do Logo do Personal + Nome de escolha (topo do card)
  const [customBrandName, setCustomBrandName] = useState<string>(coachBrandName || '');
  const [debouncedBrandName, setDebouncedBrandName] = useState<string>(coachBrandName || '');
  const [customCoachLogo, setCustomCoachLogo] = useState<string | null>(
    coachLogoUrl || challengeLogoUrl || null
  );
  const coachLogoInputRef = useRef<HTMLInputElement | null>(null);

  const storageKeyPrefix = `arenafit_coach_brand_${coachId || challengeId || 'default'}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedName = window.localStorage.getItem(`${storageKeyPrefix}_name`);
    const savedLogo = window.localStorage.getItem(`${storageKeyPrefix}_logo`);

    const initialName =
      coachBrandName !== undefined && coachBrandName !== null && coachBrandName !== ''
        ? coachBrandName
        : savedName ?? '';
    const initialLogo = coachLogoUrl || challengeLogoUrl || savedLogo || null;

    setCustomBrandName(initialName);
    setDebouncedBrandName(initialName);
    setCustomCoachLogo(initialLogo);
  }, [coachBrandName, coachLogoUrl, challengeLogoUrl, storageKeyPrefix]);

  // Debounce no nome de escolha para regenerar o PNG suavemente após digitar
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedBrandName(customBrandName);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(`${storageKeyPrefix}_name`, customBrandName);
        } catch {
          // ignore storage quota
        }
      }
    }, 320);
    return () => clearTimeout(t);
  }, [customBrandName, storageKeyPrefix]);

  const persistBrandToCoachProfile = useCallback(
    async (nextName?: string, nextLogoUrl?: string | null) => {
      if (!isCoachView || !coachId) return;
      try {
        const payload: Record<string, any> = {};
        if (nextName !== undefined) payload.brand_name = nextName.trim() || null;
        if (nextLogoUrl !== undefined) payload.brand_logo_url = nextLogoUrl;
        if (Object.keys(payload).length === 0) return;
        await supabase.from('professionals').update(payload).eq('id', coachId);
      } catch {
        // Silencioso caso não tenha permissão
      }
    },
    [isCoachView, coachId, supabase]
  );

  const handleCoachLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readPhotoFileToDataUrl(file, 512, 0.92);
      setCustomCoachLogo(dataUrl);
      setPhotoVersion((v) => v + 1);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(`${storageKeyPrefix}_logo`, dataUrl);
        } catch {
          // ignore quota
        }
      }

      if (isCoachView && coachId) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const filePath = `avatars/coach_brand_${coachId}_${Date.now()}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from('submissions')
          .upload(filePath, file, { upsert: true });
        if (!uploadErr) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('submissions').getPublicUrl(filePath);
          await persistBrandToCoachProfile(undefined, publicUrl);
        }
      }
      showToast('Logo do personal atualizado!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Não foi possível carregar o logo.', 'error');
    }
  };

  const previousBgStateRef = useRef<{
    mode: RankingBgMode;
    photos: { gallery: string | null; camera: string | null };
    version: number;
  }>({
    mode: 'transparent',
    photos: { gallery: null, camera: null },
    version: 0,
  });
  const pendingPickerRef = useRef<'gallery' | 'camera' | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const offscreenListRef = useRef<HTMLDivElement | null>(null);
  const offscreenHeroRef = useRef<HTMLDivElement | null>(null);

  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [shareLink, setShareLink] = useState<ShareLinkState | null>(null);
  const [linkRevoked, setLinkRevoked] = useState(false);
  const [revokingLink, setRevokingLink] = useState(false);

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

  const { preloadedImages, isPreparing, exportError, exportedCards } = useRankingExport({
    open,
    standings,
    challengeLogoUrl,
    coachLogoUrl: customCoachLogo,
    coachBrandName: debouncedBrandName,
    backgroundMode: bgMode,
    backgroundPhotoUrl: activePhotoUrl,
    photoVersion,
    listNodeRef: offscreenListRef,
    heroNodeRef: offscreenHeroRef,
    onExportError: (msg) => showToast(msg, 'error'),
  });

  const activeVariant: RankingCardVariant = activeSlide === 0 ? 'list' : 'hero';
  const activeBundle = exportedCards[activeVariant];

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

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (cameraModalOpen) {
          stopCameraStream();
          setCameraModalOpen(false);
          setBgMode(previousBgStateRef.current.mode);
          setBgPhotos(previousBgStateRef.current.photos);
          setPhotoVersion(previousBgStateRef.current.version);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, cameraModalOpen, onClose, stopCameraStream]);

  const createOrRefreshShareLink = useCallback(
    async (forceNew = false) => {
      if (!challengeId || standings.length === 0) return null;
      try {
        const res = await fetch(`/api/rankings/${encodeURIComponent(challengeId)}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forceNew }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.url) {
          if (forceNew) {
            showToast(json?.error || 'Não foi possível gerar o link.', 'error');
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
          showToast('Link reativado', 'success');
        }
        return nextLink;
      } catch {
        return null;
      }
    },
    [challengeId, standings.length, showToast]
  );

  useEffect(() => {
    if (!open) return;
    createOrRefreshShareLink(false);
  }, [open, createOrRefreshShareLink]);

  const handleRevokeLink = async () => {
    if (!shareLink?.code || revokingLink) return;
    setRevokingLink(true);
    try {
      const res = await fetch(`/api/rankings/share/${encodeURIComponent(shareLink.code)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        showToast('Não foi possível desativar o link.', 'error');
        return;
      }
      setShareLink(null);
      setLinkRevoked(true);
      showToast('Link desativado', 'info');
    } catch {
      showToast('Erro ao desativar o link.', 'error');
    } finally {
      setRevokingLink(false);
    }
  };

  useEffect(() => {
    const galleryInput = galleryInputRef.current;
    const cameraInput = cameraInputRef.current;

    const handleCancel = () => {
      if (pendingPickerRef.current) {
        pendingPickerRef.current = null;
        setBgMode(previousBgStateRef.current.mode);
        setBgPhotos(previousBgStateRef.current.photos);
        setPhotoVersion(previousBgStateRef.current.version);
      }
    };

    galleryInput?.addEventListener('cancel', handleCancel);
    cameraInput?.addEventListener('cancel', handleCancel);

    return () => {
      galleryInput?.removeEventListener('cancel', handleCancel);
      cameraInput?.removeEventListener('cancel', handleCancel);
    };
  }, [open]);

  const handleSelectTransparent = () => {
    pendingPickerRef.current = null;
    setBgMode('transparent');
  };

  const handleSelectGallery = () => {
    previousBgStateRef.current = {
      mode: bgMode,
      photos: { ...bgPhotos },
      version: photoVersion,
    };
    pendingPickerRef.current = 'gallery';
    setBgMode('gallery');
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
  };

  const handleSelectCamera = async () => {
    previousBgStateRef.current = {
      mode: bgMode,
      photos: { ...bgPhotos },
      version: photoVersion,
    };
    setBgMode('camera');

    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1080 },
            height: { ideal: 1920 },
          },
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
          setPhotoVersion(previousBgStateRef.current.version);
          showToast('Permissão da câmera negada.', 'error');
          return;
        }
      }
    }

    pendingPickerRef.current = 'camera';
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    } else {
      setBgMode(previousBgStateRef.current.mode);
      showToast('Câmera indisponível neste dispositivo.', 'error');
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    source: 'gallery' | 'camera'
  ) => {
    pendingPickerRef.current = null;
    const file = e.target.files?.[0];
    if (!file) {
      setBgMode(previousBgStateRef.current.mode);
      setBgPhotos(previousBgStateRef.current.photos);
      setPhotoVersion(previousBgStateRef.current.version);
      return;
    }

    try {
      // Converte para data URL (JPEG, máx 2160px, qualidade 0.9) e aguarda img.decode()
      const dataUrl = await readPhotoFileToDataUrl(file, 2160, 0.9);
      setBgPhotos((prev) => ({ ...prev, [source]: dataUrl }));
      setPhotoVersion((v) => v + 1);
      setBgMode(source);
    } catch (err: any) {
      setBgMode(previousBgStateRef.current.mode);
      setBgPhotos(previousBgStateRef.current.photos);
      setPhotoVersion(previousBgStateRef.current.version);
      showToast(err?.message || 'Não foi possível carregar a foto.', 'error');
    }
  };

  const handleCaptureFromLiveCamera = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const rawW = video.videoWidth || 1080;
      const rawH = video.videoHeight || 1920;
      const maxDim = 2160;
      const scale = Math.min(1, maxDim / Math.max(rawW, rawH));
      const w = Math.max(1, Math.round(rawW * scale));
      const h = Math.max(1, Math.round(rawH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Falha ao capturar o quadro da câmera.');
      }
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      const probe = new Image();
      probe.src = dataUrl;
      if (typeof probe.decode === 'function') {
        await probe.decode();
      }

      stopCameraStream();
      setCameraModalOpen(false);
      setBgPhotos((prev) => ({ ...prev, camera: dataUrl }));
      setPhotoVersion((v) => v + 1);
      setBgMode('camera');
    } catch (err: any) {
      stopCameraStream();
      setCameraModalOpen(false);
      setBgMode(previousBgStateRef.current.mode);
      setBgPhotos(previousBgStateRef.current.photos);
      setPhotoVersion(previousBgStateRef.current.version);
      showToast(err?.message || 'Erro ao processar foto da câmera.', 'error');
    }
  };

  const handleCancelLiveCamera = () => {
    stopCameraStream();
    setCameraModalOpen(false);
    setBgMode(previousBgStateRef.current.mode);
    setBgPhotos(previousBgStateRef.current.photos);
    setPhotoVersion(previousBgStateRef.current.version);
  };

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

  const validateReadyToExport = (): boolean => {
    if (exportError) {
      showToast(exportError, 'error');
      return false;
    }
    if ((bgMode === 'gallery' || bgMode === 'camera') && !activePhotoUrl) {
      showToast('Selecione uma foto de fundo primeiro.', 'error');
      return false;
    }
    if (isPreparing || !activeBundle) {
      showToast('Preparando imagem…', 'info');
      return false;
    }
    return true;
  };

  // Ações de compartilhamento (preservando gesto do usuário no Safari iOS)
  const handleCopyAction = async () => {
    if (!validateReadyToExport() || !activeBundle) return;

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
        showToast('Imagem copiada!', 'success');
        return;
      }
    } catch {
      // Fallback abaixo
    }

    const fallbackUrl =
      shareLink?.url ||
      (typeof window !== 'undefined' ? window.location.origin : 'https://arenafitpro.com.br');
    try {
      await navigator.clipboard.writeText(`${challengeTitle} — ${fallbackUrl}`);
      showToast('Link copiado!', 'success');
    } catch {
      showToast('Permissão negada.', 'error');
    }
  };

  const handleSaveAction = async () => {
    if (!validateReadyToExport() || !activeBundle) return;

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
          title: challengeTitle,
        });
        showToast('Imagem salva!', 'success');
        return;
      }

      const a = document.createElement('a');
      a.href = activeBundle.objectUrl;
      a.download = `arenafitpro-ranking-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Imagem salva!', 'success');
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      showToast('Não foi possível salvar a imagem.', 'error');
    }
  };

  const handleMoreAction = async () => {
    if ((bgMode === 'gallery' || bgMode === 'camera') && !validateReadyToExport()) {
      return;
    }

    const publicUrl =
      shareLink?.url ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/app/leaderboard${challengeId ? `?challenge=${challengeId}` : ''}`
        : 'https://arenafitpro.com.br');

    const shareTitle = `Ranking • ${challengeTitle}`;
    const shareText = `Confira o ranking do desafio ${challengeTitle} no ArenaFitPro`;

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        if (
          activeBundle &&
          typeof navigator.canShare === 'function' &&
          navigator.canShare({
            files: [activeBundle.file],
            url: publicUrl,
            title: shareTitle,
            text: shareText,
          })
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

    try {
      await navigator.clipboard.writeText(`${shareText}\n${publicUrl}`);
      showToast('Link copiado!', 'success');
    } catch {
      showToast('Compartilhamento indisponível.', 'error');
    }
  };

  const handleStoryAction = async () => {
    if (!validateReadyToExport() || !activeBundle) return;

    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [activeBundle.file] })
      ) {
        await navigator.share({
          files: [activeBundle.file],
          title: challengeTitle,
        });
        return;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }

    await handleMoreAction();
  };

  if (!open) return null;

  const isEmptyRanking = standings.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-ranking-title"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between overflow-y-auto font-sans"
    >
      {/* Container offscreen 1080x1920 para renderização PNG */}
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
          ref={offscreenListRef}
          variant="list"
          challengeTitle={challengeTitle}
          challengeLogoUrl={challengeLogoUrl}
          coachLogoUrl={customCoachLogo}
          coachBrandName={debouncedBrandName}
          standings={standings}
          currentUserId={currentUserId}
          isCoachView={isCoachView}
          backgroundMode={bgMode}
          backgroundPhotoUrl={activePhotoUrl}
          preloadedImages={preloadedImages}
        />
        <RankingShareCard
          ref={offscreenHeroRef}
          variant="hero"
          challengeTitle={challengeTitle}
          challengeLogoUrl={challengeLogoUrl}
          coachLogoUrl={customCoachLogo}
          coachBrandName={debouncedBrandName}
          standings={standings}
          currentUserId={currentUserId}
          isCoachView={isCoachView}
          backgroundMode={bgMode}
          backgroundPhotoUrl={activePhotoUrl}
          preloadedImages={preloadedImages}
        />
      </div>

      {/* Inputs ocultos de Galeria, Câmera e Logo do Personal */}
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
      <input
        ref={coachLogoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoachLogoFileChange}
      />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full border text-xs font-medium shadow-2xl flex items-center gap-2 transition-all ${
            toast.tone === 'error'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200'
              : toast.tone === 'info'
              ? 'bg-zinc-900/95 border-white/15 text-zinc-200'
              : 'bg-zinc-900/95 border-amber-400/40 text-white'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Câmera ao vivo */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-[65] bg-black flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancelLiveCamera}
              className="min-h-[40px] px-4 rounded-full bg-white/10 text-xs font-medium text-white cursor-pointer"
            >
              Cancelar
            </button>
            <span className="text-xs font-semibold text-white">Câmera</span>
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
              className="h-16 w-16 rounded-full bg-white border-4 border-amber-400 cursor-pointer active:scale-95 transition-transform"
              aria-label="Capturar foto"
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-md mx-auto flex flex-col flex-1 justify-between px-5 py-4 sm:py-5 gap-3.5">
        {/* 1. Header */}
        <header className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-3 rounded-full bg-white/[0.06] hover:bg-white/10 text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Fechar</span>
          </button>

          <h1
            id="share-ranking-title"
            className="text-sm sm:text-base font-semibold text-white tracking-tight"
          >
            Compartilhar ranking
          </h1>

          <div className="w-[68px] flex justify-end">
            {isPreparing && (
              <Loader2
                className="w-4 h-4 text-amber-400 animate-spin"
                aria-label="Carregando"
              />
            )}
          </div>
        </header>

        {isEmptyRanking ? (
          <div className="my-auto p-8 rounded-3xl border border-white/10 bg-zinc-950 text-center space-y-2">
            <p className="text-sm font-semibold text-white">Ainda não há participantes pontuados</p>
            <p className="text-xs text-zinc-400">
              Assim que os primeiros pontos forem registrados, você poderá compartilhar o ranking.
            </p>
          </div>
        ) : (
          <>
            {/* 2. Carrossel de 2 cards 9:16 com dots */}
            <section className="flex flex-col items-center gap-2.5">
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: 'none' }}
              >
                {(['list', 'hero'] as const).map((variant, idx) => {
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
                        className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
                        style={{
                          width: `${PREVIEW_WIDTH}px`,
                          height: `${PREVIEW_HEIGHT}px`,
                          backgroundImage: showCheckerboard
                            ? 'linear-gradient(45deg, #1c1c21 25%, transparent 25%), linear-gradient(-45deg, #1c1c21 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c21 75%), linear-gradient(-45deg, transparent 75%, #1c1c21 75%)'
                            : undefined,
                          backgroundSize: showCheckerboard ? '20px 20px' : undefined,
                          backgroundPosition: showCheckerboard
                            ? '0 0, 0 10px, 10px -10px, -10px 0'
                            : undefined,
                          backgroundColor: showCheckerboard ? '#111114' : '#09090b',
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
                            coachLogoUrl={customCoachLogo}
                            coachBrandName={customBrandName}
                            standings={standings}
                            currentUserId={currentUserId}
                            isCoachView={isCoachView}
                            backgroundMode={bgMode}
                            backgroundPhotoUrl={activePhotoUrl}
                            preloadedImages={preloadedImages}
                          />
                        </div>

                        {isPreparing && idx === activeSlide && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollToSlide(0)}
                  aria-label="Card 1"
                  aria-current={activeSlide === 0}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === 0 ? 'w-6 bg-amber-400' : 'w-2 bg-white/25 hover:bg-white/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => scrollToSlide(1)}
                  aria-label="Card 2"
                  aria-current={activeSlide === 1}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === 1 ? 'w-6 bg-amber-400' : 'w-2 bg-white/25 hover:bg-white/40'
                  }`}
                />
              </div>
            </section>

            {/* 2.5. Identidade Superior: Logo do Personal + Nome de escolha */}
            <section className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-zinc-400">
                  Marca superior (Personal)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Rodapé: ArenaFitPro
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-zinc-900/90 border border-white/10">
                <button
                  type="button"
                  onClick={() => coachLogoInputRef.current?.click()}
                  title="Alterar logo do personal"
                  className="relative h-10 w-10 rounded-xl bg-zinc-950 border border-amber-400/40 flex items-center justify-center overflow-hidden shrink-0 group cursor-pointer"
                >
                  {customCoachLogo ? (
                    <img
                      src={customCoachLogo}
                      alt="Logo do Personal"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-4 h-4 text-amber-400" />
                  )}
                  <span className=" inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-3.5 h-3.5 text-white" />
                  </span>
                </button>

                <input
                  type="text"
                  value={customBrandName}
                  maxLength={32}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  onBlur={() => persistBrandToCoachProfile(customBrandName, undefined)}
                  placeholder="Nome de escolha (ex: Personal / Consultoria)"
                  aria-label="Nome de escolha do personal"
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none px-1"
                />

                {customCoachLogo && (
                  <button
                    type="button"
                    onClick={() => coachLogoInputRef.current?.click()}
                    className="text-[11px] font-medium text-amber-400 hover:text-amber-300 px-2 py-1 rounded-lg bg-amber-400/10 cursor-pointer shrink-0"
                  >
                    Logo
                  </button>
                )}
              </div>
            </section>

            {/* 3. Seção "Plano de fundo": Transparente, Galeria, Câmera */}
            <section className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 px-1 block">
                Plano de fundo
              </span>

              <div
                role="radiogroup"
                aria-label="Plano de fundo"
                className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-zinc-900/90 border border-white/10"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={bgMode === 'transparent'}
                  onClick={handleSelectTransparent}
                  className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bgMode === 'transparent'
                      ? 'bg-white text-black font-semibold shadow-xs'
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
                  className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bgMode === 'gallery'
                      ? 'bg-white text-black font-semibold shadow-xs'
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
                  className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bgMode === 'camera'
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>Câmera</span>
                </button>
              </div>

              {bgMode === 'transparent' && (
                <p className="text-[11px] text-zinc-500 text-center pt-0.5">
                  Para usar como sticker no Instagram, salve a imagem e adicione da galeria no Story.
                </p>
              )}
            </section>

            {/* 4. Seção "Compartilhar com": Copiar, Salvar, Story, Mais */}
            <section className="space-y-1.5">
              <span className="text-xs font-medium text-zinc-400 px-1 block">
                Compartilhar com
              </span>

              <div className="grid grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyAction}
                  disabled={isPreparing || Boolean(exportError)}
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Copy className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-zinc-200">Copiar</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAction}
                  disabled={isPreparing || Boolean(exportError)}
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-zinc-200">Salvar</span>
                </button>

                <button
                  type="button"
                  onClick={handleStoryAction}
                  disabled={isPreparing || Boolean(exportError)}
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 disabled:opacity-50 transition-colors cursor-pointer"
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
                  <span className="text-xs font-medium text-zinc-200">Story</span>
                </button>

                <button
                  type="button"
                  onClick={handleMoreAction}
                  disabled={isPreparing || Boolean(exportError)}
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-zinc-200">Mais</span>
                </button>
              </div>
            </section>

            {/* 5. Ação discreta para desativar/reativar link público */}
            <div className="flex justify-center pt-0.5">
              {shareLink ? (
                <button
                  type="button"
                  onClick={handleRevokeLink}
                  disabled={revokingLink}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {revokingLink ? 'Desativando link…' : 'Desativar link público'}
                </button>
              ) : linkRevoked ? (
                <button
                  type="button"
                  onClick={() => createOrRefreshShareLink(true)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Reativar link público
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
