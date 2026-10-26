'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Share2, Download, X, CheckCircle2, Sparkles, Trophy, Flame, Camera } from 'lucide-react';

export interface StoryShareData {
  mode: 'checkin' | 'leaderboard';
  studentName: string;
  challengeTitle: string;
  pointsText: string;
  rankPosition?: string;
  streakDays?: number;
  missionTitle?: string;
  missionCategory?: string;
  photoDataUrl?: string | null;
  durationSeconds?: number | null;
  caloriesText?: string | null;
  proteinText?: string | null;
  timestampText?: string | null;
  locationText?: string | null;
}

interface StoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StoryShareData;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export function StoryShareModal({
  isOpen,
  onClose,
  data,
  primaryActionLabel,
  onPrimaryAction,
}: StoryShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function drawCard() {
      setRendering(true);
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Fundo Dark Monocromático Titanium
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, '#050507');
      bgGrad.addColorStop(0.5, '#000000');
      bgGrad.addColorStop(1, '#09090d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Glow metálico superior
      const radialGlow = ctx.createRadialGradient(540, 220, 40, 540, 220, 620);
      radialGlow.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, 1080, 900);

      // 2. Se houver foto capturada (modo checkin), desenhar com moldura HUD
      if (data.photoDataUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = data.photoDataUrl!;
          });

          const frameX = 76;
          const frameY = 300;
          const frameW = 928;
          const frameH = 1020;

          ctx.save();
          drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 48);
          ctx.clip();

          // Cover crop da foto
          const imgRatio = img.width / img.height;
          const boxRatio = frameW / frameH;
          let drawW = frameW;
          let drawH = frameH;
          let offsetX = frameX;
          let offsetY = frameY;

          if (imgRatio > boxRatio) {
            drawW = frameH * imgRatio;
            offsetX = frameX - (drawW - frameW) / 2;
          } else {
            drawH = frameW / imgRatio;
            offsetY = frameY - (drawH - frameH) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

          // Vinheta escura na base e topo da foto para leitura do HUD
          const photoOverlay = ctx.createLinearGradient(0, frameY, 0, frameY + frameH);
          photoOverlay.addColorStop(0, 'rgba(0,0,0,0.45)');
          photoOverlay.addColorStop(0.4, 'rgba(0,0,0,0.05)');
          photoOverlay.addColorStop(1, 'rgba(0,0,0,0.82)');
          ctx.fillStyle = photoOverlay;
          ctx.fillRect(frameX, frameY, frameW, frameH);
          ctx.restore();

          // Borda metálica da foto
          ctx.strokeStyle = 'rgba(255,255,255,0.28)';
          ctx.lineWidth = 3;
          drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 48);
          ctx.stroke();

          // Cantoneiras de mira óptica HUD
          ctx.strokeStyle = 'rgba(255,255,255,0.75)';
          ctx.lineWidth = 5;
          const cLen = 36;
          const pad = 32;
          // Top-Left
          ctx.beginPath();
          ctx.moveTo(frameX + pad, frameY + pad + cLen);
          ctx.lineTo(frameX + pad, frameY + pad);
          ctx.lineTo(frameX + pad + cLen, frameY + pad);
          ctx.stroke();
          // Top-Right
          ctx.beginPath();
          ctx.moveTo(frameX + frameW - pad - cLen, frameY + pad);
          ctx.lineTo(frameX + frameW - pad, frameY + pad);
          ctx.lineTo(frameX + frameW - pad, frameY + pad + cLen);
          ctx.stroke();

          // Selo Antifraude no topo da foto
          ctx.fillStyle = 'rgba(0,0,0,0.72)';
          drawRoundedRect(ctx, frameX + 44, frameY + 44, 430, 64, 32);
          ctx.fill();
          ctx.strokeStyle = 'rgba(52,211,153,0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(frameX + 80, frameY + 76, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 22px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('SENSOR ANTIFRAUDE VERIFICADO', frameX + 104, frameY + 84);

          // Dados na base interna da foto
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '600 22px monospace';
          ctx.fillText(
            `${data.timestampText || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • ${
              data.locationText || 'CHECK-IN OFICIAL'
            }`,
            frameX + 44,
            frameY + frameH - 115
          );

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 44px sans-serif';
          ctx.fillText(
            truncateText(data.missionTitle || 'Missão Concluída', 30),
            frameX + 44,
            frameY + frameH - 52
          );
        } catch {
          // Se falhar o carregamento da imagem, renderiza card tipográfico
        }
      } else {
        // MODO RANKING / PÓDIO (Sem foto de câmera — Card Metálico 3D Central)
        const cardX = 80;
        const cardY = 340;
        const cardW = 920;
        const cardH = 960;

        const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
        cardGrad.addColorStop(0, 'rgba(28, 28, 34, 0.92)');
        cardGrad.addColorStop(1, 'rgba(10, 10, 14, 0.96)');
        ctx.fillStyle = cardGrad;
        drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 56);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Badge superior
        ctx.fillStyle = '#fbbf24';
        ctx.font = '700 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CLASSIFICAÇÃO OFICIAL DA ARENA', 540, cardY + 110);

        // Posição Gigante no Pódio
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 210px sans-serif';
        ctx.fillText(data.rankPosition || '#1', 540, cardY + 370);

        ctx.fillStyle = '#d4d4d8';
        ctx.font = '800 46px sans-serif';
        ctx.fillText(truncateText(data.studentName, 24).toUpperCase(), 540, cardY + 470);

        // Linha divisória
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cardX + 100, cardY + 540);
        ctx.lineTo(cardX + cardW - 100, cardY + 540);
        ctx.stroke();

        // Métricas inferiores dentro do card
        ctx.textAlign = 'center';
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '600 24px monospace';
        ctx.fillText('PONTUAÇÃO ACUMULADA', 320, cardY + 640);
        ctx.fillText('OFENSIVA ATIVA', 760, cardY + 640);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 68px monospace';
        ctx.fillText(data.pointsText, 320, cardY + 735);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${data.streakDays ?? 1} DIAS`, 760, cardY + 735);

        ctx.fillStyle = '#71717a';
        ctx.font = '600 24px monospace';
        ctx.fillText(truncateText(data.challengeTitle, 36).toUpperCase(), 540, cardY + 875);
      }

      // 3. Header Topo da Marca ArenaFitPro
      ctx.textAlign = 'center';
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '700 24px monospace';
      ctx.fillText('ARENAFITPRO • GAMIFICATION OS', 540, 140);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 54px sans-serif';
      ctx.fillText(truncateText(data.challengeTitle || 'Desafio Oficial', 28), 540, 215);

      // 4. Faixa de Métricas Inferior (XP, Calorias/Tempo, Atleta)
      const pillY = 1380;
      ctx.fillStyle = 'rgba(20, 20, 25, 0.95)';
      drawRoundedRect(ctx, 76, pillY, 928, 220, 40);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Coluna 1: XP Ganho / Total
      ctx.textAlign = 'left';
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '700 22px monospace';
      ctx.fillText(data.mode === 'checkin' ? 'RECOMPENSA DA MISSÃO' : 'STATUS DO ATLETA', 130, pillY + 75);

      ctx.fillStyle = '#34d399';
      ctx.font = '900 58px monospace';
      ctx.fillText(data.pointsText, 130, pillY + 155);

      // Coluna 2: Calorias IA ou Tempo de Sessão ou Nome do Atleta
      ctx.textAlign = 'right';
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '700 22px monospace';
      if (data.caloriesText) {
        ctx.fillText('IA NUTRICIONAL', 950, pillY + 75);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 44px monospace';
        ctx.fillText(
          `${data.caloriesText}${data.proteinText ? ` • ${data.proteinText} P` : ''}`,
          950,
          pillY + 150
        );
      } else if (data.durationSeconds && data.durationSeconds > 0) {
        ctx.fillText('TEMPO DE SESSÃO', 950, pillY + 75);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px monospace';
        ctx.fillText(
          `${Math.floor(data.durationSeconds / 60)}m ${data.durationSeconds % 60}s`,
          950,
          pillY + 150
        );
      } else {
        ctx.fillText('ATLETA VERIFICADO', 950, pillY + 75);
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 40px sans-serif';
        ctx.fillText(truncateText(data.studentName, 18), 950, pillY + 150);
      }

      // 5. Rodapé Oficial de Assinatura Viral
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px sans-serif';
      ctx.fillText('arenafitpro.com.br', 540, 1740);

      ctx.fillStyle = '#71717a';
      ctx.font = '600 22px monospace';
      ctx.fillText('CÂMERA ANTIFRAUDE • IA NUTRICIONAL • PÓDIO AO VIVO', 540, 1790);

      if (!isCancelled) {
        setRenderedImageUrl(canvas.toDataURL('image/png', 0.95));
        setRendering(false);
      }
    }

    drawCard();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleShareNative = async () => {
    if (!canvasRef.current) return;
    setSharing(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob((b) => resolve(b), 'image/png', 0.95)
      );
      if (!blob) throw new Error('Falha ao gerar imagem.');

      const file = new File([blob], `arenafitpro-story-${Date.now()}.png`, {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Meu Check-in no ArenaFitPro',
          text: `Mais uma meta cumprida no ${data.challengeTitle}! #ArenaFitPro`,
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.warn('Compartilhamento cancelado ou indisponível:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = () => {
    if (!renderedImageUrl) return;
    const link = document.createElement('a');
    link.href = renderedImageUrl;
    link.download = `arenafitpro-story-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="mono-glass-card w-full max-w-md rounded-3xl p-5 sm:p-6 border border-white/20 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Topo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              {data.mode === 'checkin' ? <CheckCircle2 className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">
                {data.mode === 'checkin' ? 'Check-in Confirmado!' : 'Card Oficial do Pódio'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Pronto em formato 9:16 para Instagram Stories
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="h-10 w-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview do Card 9:16 */}
        <div className="relative w-full max-w-[250px] aspect-[9/16] mx-auto rounded-2xl overflow-hidden border border-white/20 bg-zinc-950 shadow-2xl flex items-center justify-center">
          {rendering || !renderedImageUrl ? (
            <div className="text-center space-y-2 p-4">
              <Sparkles className="w-6 h-6 text-white animate-spin mx-auto" />
              <p className="text-xs font-mono text-zinc-400">RENDERIZANDO CARD 9:16...</p>
            </div>
          ) : (
            <img
              src={renderedImageUrl}
              alt="Preview Story ArenaFitPro"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleShareNative}
              disabled={rendering || sharing}
              className="mono-button-primary min-h-[44px] py-2.5 px-3 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>Postar Story</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={rendering}
              className="mono-button-secondary min-h-[44px] py-2.5 px-3 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Baixar PNG</span>
            </button>
          </div>

          {onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              {primaryActionLabel || 'Voltar para a Arena'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
}
