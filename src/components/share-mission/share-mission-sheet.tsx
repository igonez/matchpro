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
  Moon,
  Sparkles,
  X,
} from 'lucide-react';
import {
  MissionBgMode,
  MissionCardVariant,
  MissionShareCard,
  MissionSharePayload,
} from './mission-share-card';
import { readPhotoFileToDataUrl, useMissionExport } from './use-mission-export';

export type { MissionBgMode, MissionCardVariant, MissionSharePayload };

export interface ShareMissionSheetProps {
  open: boolean;
  onClose: () => void;
  mission: MissionSharePayload | null;
  celebrate?: boolean;
  defaultBgMode?: MissionBgMode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

const PREVIEW_WIDTH = 244;
const PREVIEW_HEIGHT = 434; // 244 * (16 / 9)
const PREVIEW_SCALE = PREVIEW_WIDTH / 1080; // 0.22592592592592592

export function ShareMissionSheet({
  open,
  onClose,
  mission,
  celebrate = false,
  defaultBgMode,
  primaryActionLabel,
  onPrimaryAction,
}: ShareMissionSheetProps) {
  const hasMissionPhoto = Boolean(
    mission?.photoUrl && mission.photoUrl !== 'simple_click'
  );

  const [activeVariant, setActiveVariant] = useState<MissionCardVariant>('card');
  const [bgMode, setBgMode] = useState<MissionBgMode>(
    defaultBgMode ?? (hasMissionPhoto ? 'photo' : 'dark')
  );
  const [customPhotos, setCustomPhotos] = useState<{
    gallery: string | null;
    camera: string | null;
  }>({
    gallery: null,
    camera: null,
  });
  const [photoVersion, setPhotoVersion] = useState(0);

  const previousBgStateRef = useRef<{
    mode: MissionBgMode;
    photos: { gallery: string | null; camera: string | null };
    version: number;
  }>({
    mode: hasMissionPhoto ? 'photo' : 'dark',
    photos: { gallery: null, camera: null },
    version: 0,
  });
  const pendingPickerRef = useRef<'gallery' | 'camera' | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const cardNodeRef = useRef<HTMLDivElement | null>(null);
  const stickerNodeRef = useRef<HTMLDivElement | null>(null);

  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    tone?: 'success' | 'error' | 'info';
  } | null>(null);
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

  // Sync default bgMode whenever sheet opens with a mission
  useEffect(() => {
    if (!open || !mission) return;
    const resolvedDefault: MissionBgMode =
      defaultBgMode ??
      (mission.photoUrl && mission.photoUrl !== 'simple_click' ? 'photo' : 'dark');
    setBgMode(resolvedDefault);
    setActiveVariant('card');
  }, [open, mission?.missionId, mission?.photoUrl, defaultBgMode]);

  // One-shot confetti when open && celebrate
  useEffect(() => {
    if (!open || !mission || !celebrate) return;
    if (typeof window === 'undefined') return;
    try {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      import('canvas-confetti')
        .then((mod) => {
          const confetti = mod.default || mod;
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 55,
              spread: 68,
              origin: { y: 0.62 },
            });
          }
        })
        .catch(() => {});
    } catch {
      // ignore confetti errors
    }
  }, [open, mission, celebrate]);

  const rawSelectedPhotoUrl =
    bgMode === 'photo'
      ? hasMissionPhoto
        ? mission?.photoUrl || null
        : null
      : bgMode === 'gallery'
      ? customPhotos.gallery
      : bgMode === 'camera'
      ? customPhotos.camera
      : null;

  const {
    preloadedImages,
    resolvedPhotoDataUrl,
    effectiveExportPhotoUrl,
    isPreparing,
    exportError,
    exportedCards,
    exportVariantOnDemand,
  } = useMissionExport({
    open,
    mission,
    backgroundMode: bgMode,
    backgroundPhotoUrl: rawSelectedPhotoUrl,
    photoVersion,
    cardNodeRef,
    stickerNodeRef,
    onExportError: (msg) => showToast(msg, 'error'),
  });

  const visiblePreviewPhotoUrl =
    resolvedPhotoDataUrl ||
    rawSelectedPhotoUrl ||
    (bgMode === 'photo' && hasMissionPhoto ? mission?.photoUrl || null : null);

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
          setCustomPhotos(previousBgStateRef.current.photos);
          setPhotoVersion(previousBgStateRef.current.version);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, cameraModalOpen, onClose, stopCameraStream]);

  useEffect(() => {
    const galleryInput = galleryInputRef.current;
    const cameraInput = cameraInputRef.current;

    const handleCancel = () => {
      if (pendingPickerRef.current) {
        pendingPickerRef.current = null;
        setBgMode(previousBgStateRef.current.mode);
        setCustomPhotos(previousBgStateRef.current.photos);
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

  const handleSelectBgMode = (nextMode: 'photo' | 'dark' | 'transparent') => {
    pendingPickerRef.current = null;
    setBgMode(nextMode);
    if (nextMode === 'transparent') {
      setActiveVariant('sticker');
    } else if (activeVariant === 'sticker') {
      setActiveVariant('card');
    }
  };

  const handleSelectGallery = () => {
    previousBgStateRef.current = {
      mode: bgMode,
      photos: { ...customPhotos },
      version: photoVersion,
    };
    pendingPickerRef.current = 'gallery';
    setBgMode('gallery');
    setActiveVariant('card');
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
  };

  const handleSelectCamera = async () => {
    previousBgStateRef.current = {
      mode: bgMode,
      photos: { ...customPhotos },
      version: photoVersion,
    };
    setBgMode('camera');
    setActiveVariant('card');

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
          setCustomPhotos(previousBgStateRef.current.photos);
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
      setCustomPhotos(previousBgStateRef.current.photos);
      setPhotoVersion(previousBgStateRef.current.version);
      return;
    }

    try {
      const dataUrl = await readPhotoFileToDataUrl(file, 2160, 0.9);
      setCustomPhotos((prev) => ({ ...prev, [source]: dataUrl }));
      setPhotoVersion((v) => v + 1);
      setBgMode(source);
      setActiveVariant('card');
    } catch (err: any) {
      setBgMode(previousBgStateRef.current.mode);
      setCustomPhotos(previousBgStateRef.current.photos);
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
      setCustomPhotos((prev) => ({ ...prev, camera: dataUrl }));
      setPhotoVersion((v) => v + 1);
      setBgMode('camera');
      setActiveVariant('card');
    } catch (err: any) {
      stopCameraStream();
      setCameraModalOpen(false);
      setBgMode(previousBgStateRef.current.mode);
      setCustomPhotos(previousBgStateRef.current.photos);
      setPhotoVersion(previousBgStateRef.current.version);
      showToast(err?.message || 'Erro ao processar foto da câmera.', 'error');
    }
  };

  const handleCancelLiveCamera = () => {
    stopCameraStream();
    setCameraModalOpen(false);
    setBgMode(previousBgStateRef.current.mode);
    setCustomPhotos(previousBgStateRef.current.photos);
    setPhotoVersion(previousBgStateRef.current.version);
  };

  const ensureActiveBundle = async () => {
    if (activeBundle) return activeBundle;
    return exportVariantOnDemand(activeVariant);
  };

  const handleCopyAction = async () => {
    const bundle = await ensureActiveBundle();
    if (!bundle) return;

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.write === 'function' &&
        typeof ClipboardItem !== 'undefined'
      ) {
        const item = new ClipboardItem({
          'image/png': Promise.resolve(bundle.blob),
        });
        await navigator.clipboard.write([item]);
        showToast('Imagem copiada!', 'success');
        return;
      }
    } catch {
      // Fallback below
    }

    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://arenafitpro.com.br';
    try {
      await navigator.clipboard.writeText(
        `${mission?.missionTitle || 'Missão concluída'} (+${mission?.pointsRewarded ?? 10} XP) — ${origin}`
      );
      showToast('Texto copiado!', 'success');
    } catch {
      showToast('Permissão negada.', 'error');
    }
  };

  const handleSaveAction = async () => {
    const bundle = await ensureActiveBundle();
    if (!bundle) return;

    try {
      const isIOS =
        typeof navigator !== 'undefined' &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (
        isIOS &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [bundle.file] })
      ) {
        await navigator.share({
          files: [bundle.file],
          title: mission?.missionTitle || 'Missão ArenaFitPro',
        });
        showToast('Imagem salva!', 'success');
        return;
      }

      const a = document.createElement('a');
      a.href = bundle.objectUrl;
      a.download = bundle.file.name;
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
    const bundle = await ensureActiveBundle();
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://arenafitpro.com.br';
    const shareTitle = `Missão Concluída • ${mission?.missionTitle || 'ArenaFitPro'}`;
    const shareText = `Concluí a missão "${mission?.missionTitle || 'Check-in'}" (+${
      mission?.pointsRewarded ?? 10
    } XP) no ArenaFitPro!`;

    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function'
      ) {
        if (
          bundle &&
          typeof navigator.canShare === 'function' &&
          navigator.canShare({
            files: [bundle.file],
            title: shareTitle,
            text: shareText,
          })
        ) {
          await navigator.share({
            files: [bundle.file],
            title: shareTitle,
            text: shareText,
          });
          return;
        }

        await navigator.share({
          title: shareTitle,
          text: `${shareText}\n${origin}`,
          url: origin,
        });
        return;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }

    if (bundle) {
      await handleSaveAction();
      return;
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${origin}`);
      showToast('Copiado para a área de transferência!', 'success');
    } catch {
      showToast('Compartilhamento indisponível.', 'error');
    }
  };

  const handleStoryAction = async () => {
    const bundle = await ensureActiveBundle();
    if (!bundle) return;

    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [bundle.file] })
      ) {
        await navigator.share({
          files: [bundle.file],
          title: mission?.missionTitle || 'Missão ArenaFitPro',
        });
        return;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }

    await handleSaveAction();
  };

  if (!open || !mission) return null;

  const showCheckerboard =
    activeVariant === 'sticker' || bgMode === 'transparent';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-mission-title"
      className="fixed inset-0 z-50 bg-[#000000]/95 backdrop-blur-xl flex flex-col items-center justify-between overflow-y-auto font-sans"
    >
      {/* Offscreen 1080x1920 export nodes */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-100000px',
          top: 0,
          width: 1080,
          height: 1920,
          pointerEvents: 'none',
          opacity: 0,
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <MissionShareCard
          ref={cardNodeRef}
          variant="card"
          mission={mission}
          backgroundMode={bgMode}
          backgroundPhotoUrl={effectiveExportPhotoUrl || rawSelectedPhotoUrl}
          preloadedImages={preloadedImages}
        />
        <MissionShareCard
          ref={stickerNodeRef}
          variant="sticker"
          mission={mission}
          backgroundMode="transparent"
          backgroundPhotoUrl={null}
          preloadedImages={preloadedImages}
        />
      </div>

      {/* Hidden inputs for Gallery & Camera */}
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

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full border text-xs font-medium shadow-2xl flex items-center gap-2 transition-all ${
            toast.tone === 'error'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200'
              : toast.tone === 'info'
              ? 'bg-[#0E0E10] border-[#27272A] text-[#A1A1AA]'
              : 'bg-[#0E0E10] border-white/10 text-[#FAFAFA]'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-[#D4D4D8] shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Live Camera Modal */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-[65] bg-[#000000] flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancelLiveCamera}
              className="min-h-[44px] px-4 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-medium text-[#FAFAFA] cursor-pointer"
            >
              Cancelar
            </button>
            <span className="text-xs font-semibold text-[#FAFAFA]">Câmera</span>
            <div className="w-20" />
          </div>

          <div className="flex-1 flex items-center justify-center my-4 overflow-hidden rounded-3xl border border-[#27272A] bg-[#0E0E10]">
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
              className="h-16 w-16 rounded-full bg-white border-4 border-[#3478F6] cursor-pointer active:scale-95 transition-transform"
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
            className="min-h-[44px] px-3.5 rounded-full bg-[#0E0E10] hover:bg-[#18181B] border border-[#27272A] text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Fechar</span>
          </button>

          <h1
            id="share-mission-title"
            className="text-sm sm:text-base font-semibold text-[#FAFAFA] tracking-tight"
          >
            Compartilhar conquista
          </h1>

          <div className="w-[68px] flex justify-end">
            {isPreparing && (
              <Loader2
                className="w-4 h-4 text-[#D4D4D8] animate-spin"
                aria-label="Carregando"
              />
            )}
          </div>
        </header>

        {/* 2. Variant Switcher: Card vs Sticker Transparente */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#0E0E10] border border-[#27272A]">
          <button
            type="button"
            onClick={() => {
              setActiveVariant('card');
              if (bgMode === 'transparent') {
                setBgMode(hasMissionPhoto ? 'photo' : 'dark');
              }
            }}
            className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeVariant === 'card'
                ? 'bg-[#3478F6] text-white shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            <span>Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveVariant('sticker')}
            className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeVariant === 'sticker'
                ? 'bg-[#3478F6] text-white shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            <span>Sticker Transparente</span>
          </button>
        </div>

        {/* 3. Visible Scaled Preview (244x434, NOT inside aria-hidden="true") */}
        <section className="flex flex-col items-center justify-center">
          <div
            data-testid={`preview-mission-${activeVariant}`}
            data-checkerboard={showCheckerboard ? 'true' : 'false'}
            className="relative rounded-2xl overflow-hidden border border-[#27272A] shadow-2xl"
            style={{
              width: `${PREVIEW_WIDTH}px`,
              height: `${PREVIEW_HEIGHT}px`,
              backgroundImage: showCheckerboard
                ? 'linear-gradient(45deg, #18181B 25%, transparent 25%), linear-gradient(-45deg, #18181B 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181B 75%), linear-gradient(-45deg, transparent 75%, #18181B 75%)'
                : undefined,
              backgroundSize: showCheckerboard ? '20px 20px' : undefined,
              backgroundPosition: showCheckerboard
                ? '0 0, 0 10px, 10px -10px, -10px 0'
                : undefined,
              backgroundColor: showCheckerboard ? '#0E0E10' : '#000000',
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
              <MissionShareCard
                variant={activeVariant}
                mission={mission}
                backgroundMode={
                  activeVariant === 'sticker' ? 'transparent' : bgMode
                }
                backgroundPhotoUrl={
                  activeVariant === 'sticker' ? null : visiblePreviewPhotoUrl
                }
                preloadedImages={preloadedImages}
              />
            </div>

            {isPreparing && (
              <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-[#000000]/75 border border-white/10 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 text-[#D4D4D8] animate-spin" />
              </div>
            )}
          </div>
        </section>

        {/* 4. Background Mode Controls */}
        <section className="space-y-1.5">
          <span className="text-xs font-medium text-[#A1A1AA] px-1 block">
            Plano de fundo
          </span>

          <div
            role="radiogroup"
            aria-label="Plano de fundo"
            className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[#0E0E10] border border-[#27272A]"
          >
            {hasMissionPhoto && (
              <button
                type="button"
                role="radio"
                aria-checked={bgMode === 'photo' && activeVariant === 'card'}
                onClick={() => handleSelectBgMode('photo')}
                className={`min-h-[44px] flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  bgMode === 'photo' && activeVariant === 'card'
                    ? 'bg-[#3478F6] text-white font-semibold shadow-xs'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Foto do Check-in</span>
              </button>
            )}

            <button
              type="button"
              role="radio"
              aria-checked={bgMode === 'dark' && activeVariant === 'card'}
              onClick={() => handleSelectBgMode('dark')}
              className={`min-h-[44px] flex-1 min-w-[84px] py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                bgMode === 'dark' && activeVariant === 'card'
                  ? 'bg-[#3478F6] text-white font-semibold shadow-xs'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              <Moon className="w-3.5 h-3.5 shrink-0" />
              <span>Escuro</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={
                bgMode === 'transparent' || activeVariant === 'sticker'
              }
              onClick={() => handleSelectBgMode('transparent')}
              className={`min-h-[44px] flex-1 min-w-[106px] py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                bgMode === 'transparent' || activeVariant === 'sticker'
                  ? 'bg-[#3478F6] text-white font-semibold shadow-xs'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              <Grid className="w-3.5 h-3.5 shrink-0" />
              <span>Transparente</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={bgMode === 'gallery' && activeVariant === 'card'}
              onClick={handleSelectGallery}
              className={`min-h-[44px] flex-1 min-w-[88px] py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                bgMode === 'gallery' && activeVariant === 'card'
                  ? 'bg-[#3478F6] text-white font-semibold shadow-xs'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Galeria</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={bgMode === 'camera' && activeVariant === 'card'}
              onClick={handleSelectCamera}
              className={`min-h-[44px] flex-1 min-w-[88px] py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                bgMode === 'camera' && activeVariant === 'card'
                  ? 'bg-[#3478F6] text-white font-semibold shadow-xs'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>Câmera</span>
            </button>
          </div>
        </section>

        {/* 5. Share Action Buttons: Copiar, Salvar, Story, Mais */}
        <section className="space-y-2">
          <span className="text-xs font-medium text-[#A1A1AA] px-1 block">
            Compartilhar com
          </span>

          <div className="grid grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={handleCopyAction}
              disabled={Boolean(exportError)}
              className="min-h-[48px] flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-[#0E0E10] hover:bg-[#18181B] border border-[#27272A] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <div className="h-10 w-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#FAFAFA]">
                <Copy className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#FAFAFA]">Copiar</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAction}
              disabled={Boolean(exportError)}
              className="min-h-[48px] flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-[#0E0E10] hover:bg-[#18181B] border border-[#27272A] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <div className="h-10 w-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#FAFAFA]">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#FAFAFA]">Salvar</span>
            </button>

            <button
              type="button"
              onClick={handleStoryAction}
              disabled={Boolean(exportError)}
              className="min-h-[48px] flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-[#0E0E10] hover:bg-[#18181B] border border-[#27272A] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <div className="h-10 w-10 rounded-full bg-[#3478F6] flex items-center justify-center text-white shadow-[0_0_15px_rgba(52,120,246,0.35)]">
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
              <span className="text-xs font-medium text-[#FAFAFA]">Story</span>
            </button>

            <button
              type="button"
              onClick={handleMoreAction}
              disabled={Boolean(exportError)}
              className="min-h-[48px] flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl bg-[#0E0E10] hover:bg-[#18181B] border border-[#27272A] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <div className="h-10 w-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#FAFAFA]">
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-[#FAFAFA]">Mais</span>
            </button>
          </div>

          {primaryActionLabel && onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="w-full min-h-[48px] mt-2 py-3 px-4 rounded-2xl bg-[#3478F6] hover:bg-[#75A7FF] text-white font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_20px_rgba(52,120,246,0.35)]"
            >
              <span>{primaryActionLabel}</span>
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

export default ShareMissionSheet;
