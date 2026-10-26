'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Share2, Download, X, CheckCircle2, Sparkles, Trophy, MessageCircle, Copy, Check } from 'lucide-react';

export interface StoryLeaderboardParticipant {
  studentId: string;
  name: string;
  avatarUrl?: string | null;
  points: number;
  streakDays?: number;
  approvedMissions?: number;
}

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
  // Dados completos do Ranking (Estilo MasterTraining / ArenaFitPro Pódio + Tabela)
  standings?: StoryLeaderboardParticipant[];
  currentUserId?: string | null;
  isCoachView?: boolean;
  classAveragePoints?: number;
  topStreakDays?: number;
  topStreakName?: string;
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
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function loadSafeImage(url?: string | null): Promise<HTMLImageElement | null> {
      if (!url) return null;
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const timer = setTimeout(() => resolve(null), 2500);
        img.onload = () => {
          clearTimeout(timer);
          resolve(img);
        };
        img.onerror = () => {
          clearTimeout(timer);
          resolve(null);
        };
        img.src = url;
      });
    }

    async function drawCard() {
      setRendering(true);
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Fundo Base OLED Dark Titanium
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, '#000000');
      bgGrad.addColorStop(0.2, '#09090b');
      bgGrad.addColorStop(0.6, '#040405');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Feixe de luz dourado superior
      const topGoldGlow = ctx.createRadialGradient(540, 180, 30, 540, 180, 580);
      topGoldGlow.addColorStop(0, 'rgba(251, 191, 36, 0.14)');
      topGoldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topGoldGlow;
      ctx.fillRect(0, 0, 1080, 900);

      if (data.mode === 'checkin' && data.photoDataUrl) {
        // ====================================================================
        // MODO CHECK-IN COM FOTO DA CÂMERA ANTIFRAUDE
        // ====================================================================
        ctx.textAlign = 'center';
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '700 24px monospace';
        ctx.fillText('ARENAFITPRO • GAMIFICATION OS', 540, 140);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 54px sans-serif';
        ctx.fillText(truncateText(data.challengeTitle || 'Desafio Oficial', 28), 540, 215);

        const img = await loadSafeImage(data.photoDataUrl);
        if (img) {
          const frameX = 76;
          const frameY = 300;
          const frameW = 928;
          const frameH = 1020;

          ctx.save();
          drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 48);
          ctx.clip();

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

          const photoOverlay = ctx.createLinearGradient(0, frameY, 0, frameY + frameH);
          photoOverlay.addColorStop(0, 'rgba(0,0,0,0.45)');
          photoOverlay.addColorStop(0.4, 'rgba(0,0,0,0.05)');
          photoOverlay.addColorStop(1, 'rgba(0,0,0,0.82)');
          ctx.fillStyle = photoOverlay;
          ctx.fillRect(frameX, frameY, frameW, frameH);
          ctx.restore();

          ctx.strokeStyle = 'rgba(255,255,255,0.28)';
          ctx.lineWidth = 3;
          drawRoundedRect(ctx, frameX, frameY, frameW, frameH, 48);
          ctx.stroke();

          // Selo Antifraude
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
        }

        // Faixa de Métricas Inferior do Check-in
        const pillY = 1380;
        ctx.fillStyle = 'rgba(20, 20, 25, 0.95)';
        drawRoundedRect(ctx, 76, pillY, 928, 220, 40);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '700 22px monospace';
        ctx.fillText('RECOMPENSA DA MISSÃO', 130, pillY + 75);

        ctx.fillStyle = '#34d399';
        ctx.font = '900 58px monospace';
        ctx.fillText(data.pointsText, 130, pillY + 155);

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

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 32px sans-serif';
        ctx.fillText('arenafitpro.com.br', 540, 1740);
        ctx.fillStyle = '#71717a';
        ctx.font = '600 22px monospace';
        ctx.fillText('CÂMERA ANTIFRAUDE • IA NUTRICIONAL • PÓDIO AO VIVO', 540, 1790);
      } else {
        // ====================================================================
        // MODO RANKING COMPLETO (PÓDIO 3D + TELEMETRIA + TABELA GERAL)
        // ====================================================================
        const list: StoryLeaderboardParticipant[] =
          data.standings && data.standings.length > 0
            ? data.standings
            : [
                {
                  studentId: 'me',
                  name: data.studentName || 'Atleta ArenaFit',
                  points: parseInt((data.pointsText || '0').replace(/\D/g, ''), 10) || 1000,
                  streakDays: data.streakDays || 1,
                },
              ];

        const leaderPoints = Math.max(1, list[0]?.points || 1);
        const avgPoints =
          data.classAveragePoints ??
          (list.length > 0
            ? Math.round(list.reduce((acc, item) => acc + (item.points || 0), 0) / list.length)
            : 0);

        let topStreakVal = data.topStreakDays ?? 0;
        let topStreakAthlete = data.topStreakName || 'Atleta';
        if (!data.topStreakDays) {
          list.forEach((p) => {
            if ((p.streakDays || 0) > topStreakVal) {
              topStreakVal = p.streakDays || 0;
              topStreakAthlete = (p.name || 'Atleta').split(' ')[0];
            }
          });
        }

        const myIdx = data.currentUserId
          ? list.findIndex((p) => p.studentId === data.currentUserId)
          : -1;
        const myRankNum = myIdx >= 0 ? myIdx + 1 : null;
        const myParticipant = myIdx >= 0 ? list[myIdx] : null;
        const nextUp = myIdx > 0 ? list[myIdx - 1] : null;
        const diffToNext =
          myParticipant && nextUp ? Math.max(0, nextUp.points - myParticipant.points) : 0;

        // 1. HEADER EDITORIAL DO RANKING (Y = 70..195)
        // Pill Ranking Oficial
        ctx.fillStyle = 'rgba(251, 191, 36, 0.14)';
        drawRoundedRect(ctx, 50, 72, 270, 38, 19);
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.font = '800 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 RANKING OFICIAL', 185, 97);

        // Pill Ao Vivo
        ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
        drawRoundedRect(ctx, 334, 72, 150, 38, 19);
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.stroke();
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(360, 91, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '800 15px monospace';
        ctx.fillText('AO VIVO', 418, 96);

        // Título do Desafio
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 44px sans-serif';
        ctx.fillText(truncateText(data.challengeTitle || 'Desafio Oficial', 28).toUpperCase(), 50, 162);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '600 18px monospace';
        ctx.fillText('CLASSIFICAÇÃO AUDITADA POR CÂMERA & IA • ARENAFITPRO OS', 50, 196);

        // 2. BLOCO 1: CARD DE DESTAQUE DO ALUNO OU RESUMO DO TREINADOR (Y = 225, H = 195)
        const perfY = 225;
        const perfH = 195;
        const perfGrad = ctx.createLinearGradient(50, perfY, 1030, perfY + perfH);
        perfGrad.addColorStop(0, 'rgba(251, 191, 36, 0.14)');
        perfGrad.addColorStop(0.5, 'rgba(15, 15, 20, 0.96)');
        perfGrad.addColorStop(1, 'rgba(9, 9, 11, 0.98)');
        ctx.fillStyle = perfGrad;
        drawRoundedRect(ctx, 50, perfY, 980, perfH, 28);
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.38)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!data.isCoachView && myParticipant && myRankNum) {
          // Box Dourada Rank do Aluno
          const rankBoxGrad = ctx.createLinearGradient(78, perfY + 24, 158, perfY + 104);
          rankBoxGrad.addColorStop(0, '#fde047');
          rankBoxGrad.addColorStop(1, '#d97706');
          ctx.fillStyle = rankBoxGrad;
          drawRoundedRect(ctx, 78, perfY + 24, 84, 84, 22);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.font = '900 13px monospace';
          ctx.fillText('RANK', 120, perfY + 52);
          ctx.font = '900 32px monospace';
          ctx.fillText(`#${String(myRankNum).padStart(2, '0')}`, 120, perfY + 90);

          // Nome e Status do Aluno
          ctx.textAlign = 'left';
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 24px sans-serif';
          ctx.fillText(truncateText(myParticipant.name, 22).toUpperCase(), 182, perfY + 55);

          ctx.fillStyle = '#d4d4d8';
          ctx.font = '600 17px monospace';
          if (myRankNum === 1) {
            const margin = list.length > 1 ? Math.max(0, list[0].points - list[1].points) : 0;
            ctx.fillStyle = '#fde047';
            ctx.fillText(`Liderando a turma com +${margin} XP de vantagem!`, 182, perfY + 92);
          } else if (nextUp) {
            ctx.fillText(
              `Faltam ${diffToNext} XP para alcançar #${String(myRankNum - 1).padStart(2, '0')} ${
                nextUp.name.split(' ')[0]
              }`,
              182,
              perfY + 92
            );
          }

          // Pontuação XP à Direita
          ctx.textAlign = 'right';
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 40px monospace';
          ctx.fillText(`${myParticipant.points}`, 1000, perfY + 66);
          ctx.fillStyle = '#fbbf24';
          ctx.font = '800 14px monospace';
          ctx.fillText('XP TOTAL', 1000, perfY + 92);

          // Barra de Progresso até o próximo
          const progPct =
            myRankNum === 1
              ? 100
              : nextUp && nextUp.points > 0
              ? Math.min(100, Math.round((myParticipant.points / nextUp.points) * 100))
              : 100;

          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(78, perfY + 124, 922, 1.5);

          ctx.textAlign = 'left';
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '700 14px monospace';
          ctx.fillText(
            myRankNum === 1 ? 'DOMÍNIO DA LIDERANÇA DA TURMA' : `META DE ULTRAPASSAGEM ATÉ #${String(myRankNum - 1).padStart(2, '0')}`,
            78,
            perfY + 150
          );
          ctx.textAlign = 'right';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${progPct}%`, 1000, perfY + 150);

          ctx.fillStyle = '#000000';
          drawRoundedRect(ctx, 78, perfY + 162, 922, 14, 7);
          ctx.fill();

          const barGrad = ctx.createLinearGradient(78, 0, 78 + (922 * progPct) / 100, 0);
          barGrad.addColorStop(0, '#f59e0b');
          barGrad.addColorStop(0.5, '#fbbf24');
          barGrad.addColorStop(1, '#34d399');
          ctx.fillStyle = barGrad;
          drawRoundedRect(ctx, 78, perfY + 162, Math.max(24, (922 * progPct) / 100), 14, 7);
          ctx.fill();
        } else {
          // VISÃO DO TREINADOR / BOLETIM OFICIAL DA TURMA
          const rankBoxGrad = ctx.createLinearGradient(78, perfY + 28, 158, perfY + 108);
          rankBoxGrad.addColorStop(0, '#fde047');
          rankBoxGrad.addColorStop(1, '#d97706');
          ctx.fillStyle = rankBoxGrad;
          drawRoundedRect(ctx, 78, perfY + 28, 84, 84, 22);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.font = '900 13px monospace';
          ctx.fillText('TOP #1', 120, perfY + 56);
          ctx.font = '900 28px monospace';
          ctx.fillText(
            list[0]?.name ? getInitials(list[0].name) : '#1',
            120,
            perfY + 92
          );

          ctx.textAlign = 'left';
          ctx.fillStyle = '#fde047';
          ctx.font = '800 15px monospace';
          ctx.fillText('BOLETIM OFICIAL DO TREINADOR', 182, perfY + 52);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 28px sans-serif';
          ctx.fillText(
            list[0] ? `Líder Atual: ${truncateText(list[0].name, 20)}` : 'Disputa em Andamento',
            182,
            perfY + 88
          );

          ctx.textAlign = 'right';
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 40px monospace';
          ctx.fillText(`${list[0]?.points || 0}`, 1000, perfY + 72);
          ctx.fillStyle = '#fbbf24';
          ctx.font = '800 14px monospace';
          ctx.fillText('XP LÍDER', 1000, perfY + 96);

          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(78, perfY + 130, 922, 1.5);

          ctx.textAlign = 'left';
          ctx.fillStyle = '#d4d4d8';
          ctx.font = '700 16px monospace';
          ctx.fillText(
            `🔥 ${list.length} ATLETAS ATIVOS • MÉDIA DA TURMA: ${avgPoints} XP`,
            78,
            perfY + 166
          );
        }

        // 3. BLOCO 2: 3 PILARES DE TELEMETRIA DA TURMA (Y = 440, H = 105)
        const metricY = 440;
        const metricCards = [
          {
            label: 'ATLETAS NA ARENA',
            val: `${list.length}`,
            sub: 'Disputando o pódio',
            color: '#22d3ee',
          },
          {
            label: 'MÉDIA DA TURMA',
            val: `${avgPoints} XP`,
            sub: 'Ritmo coletivo',
            color: '#34d399',
          },
          {
            label: 'TOP STREAK',
            val: `${topStreakVal} dias`,
            sub: `Ofensiva: ${truncateText(topStreakAthlete, 12)}`,
            color: '#fbbf24',
          },
        ];

        metricCards.forEach((mc, idx) => {
          const mx = 50 + idx * 333;
          ctx.fillStyle = '#09090b';
          drawRoundedRect(ctx, mx, metricY, 314, 108, 22);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.09)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '700 13px monospace';
          ctx.fillText(mc.label, mx + 22, metricY + 30);

          ctx.fillStyle = mc.color;
          ctx.beginPath();
          ctx.arc(mx + 286, metricY + 25, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 30px monospace';
          ctx.fillText(mc.val, mx + 22, metricY + 68);

          ctx.fillStyle = '#71717a';
          ctx.font = '600 13px monospace';
          ctx.fillText(mc.sub, mx + 22, metricY + 92);
        });

        // 4. BLOCO 3: PÓDIO 3D OLÍMPICO DOS TOP 3 (Y = 570, H = 480)
        const podY = 570;
        const podH = 480;
        ctx.fillStyle = '#09090b';
        drawRoundedRect(ctx, 50, podY, 980, podH, 30);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glow interno do pódio
        const podGlow = ctx.createRadialGradient(540, podY + 120, 20, 540, podY + 120, 340);
        podGlow.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
        podGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = podGlow;
        ctx.fillRect(50, podY, 980, podH);

        // Header do Pódio
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fbbf24';
        ctx.font = '800 15px monospace';
        ctx.fillText('PÓDIO DE ELITE • TOP 3 ATLETAS', 82, podY + 42);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '600 14px monospace';
        ctx.fillText('LIDERANÇA AUDITADA', 998, podY + 42);

        const top1 = list[0] || null;
        const top2 = list[1] || null;
        const top3 = list[2] || null;

        const [imgTop1, imgTop2, imgTop3] = await Promise.all([
          loadSafeImage(top1?.avatarUrl),
          loadSafeImage(top2?.avatarUrl),
          loadSafeImage(top3?.avatarUrl),
        ]);

        // Função auxiliar para desenhar cada atleta no pódio
        const drawPodiumSpot = (
          spot: StoryLeaderboardParticipant | null,
          spotImg: HTMLImageElement | null,
          rank: 1 | 2 | 3,
          centerX: number,
          pedestalHeight: number,
          avatarSize: number,
          accentColor: string,
          pedestalTopColor: string,
          labelText: string
        ) => {
          const baseBottomY = podY + podH - 2;
          const pedestalW = rank === 1 ? 260 : 220;
          const pedestalX = centerX - pedestalW / 2;
          const pedestalY = baseBottomY - pedestalHeight;

          // Pedestal 3D
          const pedGrad = ctx.createLinearGradient(0, pedestalY, 0, baseBottomY);
          pedGrad.addColorStop(0, pedestalTopColor);
          pedGrad.addColorStop(1, 'rgba(9, 9, 11, 0.95)');
          ctx.fillStyle = pedGrad;
          drawRoundedRect(ctx, pedestalX, pedestalY, pedestalW, pedestalHeight, 22);
          ctx.fill();

          ctx.strokeStyle = accentColor;
          ctx.lineWidth = rank === 1 ? 2.5 : 1.5;
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.fillStyle = accentColor;
          ctx.font = rank === 1 ? '900 48px monospace' : '900 36px monospace';
          ctx.fillText(`${rank}º`, centerX, pedestalY + (rank === 1 ? 72 : 58));

          ctx.fillStyle = '#e4e4e7';
          ctx.font = '800 13px monospace';
          ctx.fillText(labelText, centerX, pedestalY + (rank === 1 ? 102 : 86));

          if (!spot) {
            ctx.fillStyle = '#52525b';
            ctx.font = '700 16px monospace';
            ctx.fillText('VAGA ABERTA', centerX, pedestalY - 40);
            return;
          }

          // Nome e XP acima do pedestal
          const xpY = pedestalY - 18;
          const nameY = pedestalY - 46;
          ctx.fillStyle = accentColor;
          ctx.font = rank === 1 ? '900 20px monospace' : '800 17px monospace';
          ctx.fillText(`${spot.points} XP`, centerX, xpY);

          ctx.fillStyle = '#ffffff';
          ctx.font = rank === 1 ? '900 22px sans-serif' : '800 19px sans-serif';
          ctx.fillText(truncateText(spot.name.split(' ')[0], 14), centerX, nameY);

          // Avatar Squircle
          const avY = nameY - 26 - avatarSize;
          const avX = centerX - avatarSize / 2;

          if (rank === 1) {
            // Coroa Dourada no topo do 1º Lugar
            ctx.fillStyle = '#fbbf24';
            ctx.font = '900 28px sans-serif';
            ctx.fillText('👑', centerX, avY - 12);
          }

          ctx.save();
          drawRoundedRect(ctx, avX, avY, avatarSize, avatarSize, rank === 1 ? 30 : 24);
          ctx.fillStyle = '#18181b';
          ctx.fill();
          ctx.clip();

          if (spotImg) {
            ctx.drawImage(spotImg, avX, avY, avatarSize, avatarSize);
          } else {
            ctx.fillStyle = accentColor;
            ctx.font = rank === 1 ? '900 36px sans-serif' : '900 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
              getInitials(spot.name),
              centerX,
              avY + avatarSize / 2 + (rank === 1 ? 13 : 10)
            );
          }
          ctx.restore();

          ctx.strokeStyle = accentColor;
          ctx.lineWidth = rank === 1 ? 4 : 3;
          drawRoundedRect(ctx, avX, avY, avatarSize, avatarSize, rank === 1 ? 30 : 24);
          ctx.stroke();

          // Medalha no canto inferior direito do avatar
          const medalR = rank === 1 ? 18 : 15;
          const medalX = avX + avatarSize - 6;
          const medalY = avY + avatarSize - 6;
          ctx.beginPath();
          ctx.arc(medalX, medalY, medalR, 0, Math.PI * 2);
          ctx.fillStyle = accentColor;
          ctx.fill();
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = '#000000';
          ctx.font = '900 14px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${rank}`, medalX, medalY + 5);
        };

        // 2º Lugar (Esquerda)
        drawPodiumSpot(
          top2,
          imgTop2,
          2,
          210,
          155,
          86,
          '#cbd5e1',
          'rgba(148, 163, 184, 0.35)',
          'PRATA'
        );

        // 1º Lugar (Centro)
        drawPodiumSpot(
          top1,
          imgTop1,
          1,
          540,
          215,
          108,
          '#fde047',
          'rgba(251, 191, 36, 0.42)',
          'LÍDER OURO'
        );

        // 3º Lugar (Direita)
        drawPodiumSpot(
          top3,
          imgTop3,
          3,
          870,
          130,
          86,
          '#fb923c',
          'rgba(234, 88, 12, 0.35)',
          'BRONZE'
        );

        // 5. BLOCO 4: TABELA GERAL DE CLASSIFICAÇÃO (Y = 1075..1690)
        ctx.textAlign = 'left';
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '800 15px monospace';
        ctx.fillText('TABELA GERAL DE CLASSIFICAÇÃO', 54, 1102);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#71717a';
        ctx.font = '700 14px monospace';
        ctx.fillText(`${list.length} COMPETIDORES ATIVOS`, 1026, 1102);

        // Selecionar até 4 linhas para a tabela inferior:
        // Se houver mais de 3 alunos, mostramos #4, #5, #6, #7 (ou incluímos o aluno logado se ele estiver abaixo de #7).
        // Se houver <= 3 alunos, mostramos os próprios Top 1..3 na tabela detalhada com barras de progresso!
        let tableEntries: Array<{ item: StoryLeaderboardParticipant; rank: number }> = [];
        if (list.length > 3) {
          const slice4to7 = list.slice(3, 7).map((item, idx) => ({
            item,
            rank: idx + 4,
          }));
          if (myRankNum && myRankNum > 7 && myParticipant) {
            tableEntries = [
              ...slice4to7.slice(0, 3),
              { item: myParticipant, rank: myRankNum },
            ];
          } else {
            tableEntries = slice4to7;
          }
        } else {
          tableEntries = list.slice(0, 4).map((item, idx) => ({
            item,
            rank: idx + 1,
          }));
        }

        const rowAvatars = await Promise.all(
          tableEntries.map((entry) => loadSafeImage(entry.item.avatarUrl))
        );

        tableEntries.forEach((entry, idx) => {
          const rowY = 1120 + idx * 124;
          const rowH = 108;
          const isMe =
            !data.isCoachView &&
            ((data.currentUserId && entry.item.studentId === data.currentUserId) ||
              entry.rank === myRankNum);
          const relPct = Math.max(
            8,
            Math.min(100, Math.round((entry.item.points / leaderPoints) * 100))
          );

          ctx.fillStyle = isMe ? '#18181b' : '#09090b';
          drawRoundedRect(ctx, 50, rowY, 980, rowH, 24);
          ctx.fill();

          ctx.strokeStyle = isMe ? 'rgba(251, 191, 36, 0.65)' : 'rgba(255, 255, 255, 0.09)';
          ctx.lineWidth = isMe ? 2 : 1.5;
          ctx.stroke();

          // Rank Box
          ctx.fillStyle = isMe ? '#ffffff' : '#141418';
          drawRoundedRect(ctx, 70, rowY + 23, 62, 62, 16);
          ctx.fill();
          if (!isMe) {
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.textAlign = 'center';
          ctx.fillStyle = isMe ? '#000000' : '#a1a1aa';
          ctx.font = '900 20px monospace';
          ctx.fillText(`#${String(entry.rank).padStart(2, '0')}`, 101, rowY + 61);

          // Avatar da Linha
          const rAvX = 148;
          const rAvY = rowY + 23;
          ctx.save();
          drawRoundedRect(ctx, rAvX, rAvY, 62, 62, 18);
          ctx.fillStyle = '#27272a';
          ctx.fill();
          ctx.clip();
          const rowImg = rowAvatars[idx];
          if (rowImg) {
            ctx.drawImage(rowImg, rAvX, rAvY, 62, 62);
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(getInitials(entry.item.name), rAvX + 31, rAvY + 38);
          }
          ctx.restore();

          // Nome + Badges
          ctx.textAlign = 'left';
          ctx.fillStyle = '#ffffff';
          ctx.font = '800 21px sans-serif';
          const dispName = truncateText(entry.item.name, 20);
          ctx.fillText(dispName, 228, rowY + 48);

          let badgeOffsetX = 228 + ctx.measureText(dispName).width + 14;
          if (isMe) {
            ctx.fillStyle = '#fbbf24';
            drawRoundedRect(ctx, badgeOffsetX, rowY + 28, 64, 24, 6);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.font = '900 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('VOCÊ', badgeOffsetX + 32, rowY + 45);
            badgeOffsetX += 76;
          }

          if ((entry.item.streakDays || 0) >= 2) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
            drawRoundedRect(ctx, badgeOffsetX, rowY + 28, 72, 24, 6);
            ctx.fill();
            ctx.fillStyle = '#fde047';
            ctx.font = '800 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`🔥 ${entry.item.streakDays}d`, badgeOffsetX + 36, rowY + 45);
          }

          // Barra de progresso relativo ao líder
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          drawRoundedRect(ctx, 228, rowY + 68, 480, 9, 4.5);
          ctx.fill();

          ctx.fillStyle = isMe ? '#fbbf24' : '#71717a';
          drawRoundedRect(ctx, 228, rowY + 68, Math.max(20, (480 * relPct) / 100), 9, 4.5);
          ctx.fill();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#71717a';
          ctx.font = '700 13px monospace';
          ctx.fillText(`${relPct}%`, 722, rowY + 77);

          // Pontos XP à direita
          ctx.textAlign = 'right';
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 28px monospace';
          ctx.fillText(`${entry.item.points}`, 1000, rowY + 54);

          ctx.fillStyle = isMe ? '#fbbf24' : '#71717a';
          ctx.font = '800 12px monospace';
          ctx.fillText('XP TOTAL', 1000, rowY + 76);
        });

        // 6. RODAPÉ OFICIAL ARENAFITPRO (Y = 1715..1850)
        ctx.fillStyle = '#09090b';
        drawRoundedRect(ctx, 50, 1690, 980, 140, 32);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 30px sans-serif';
        ctx.fillText('arenafitpro.com.br', 540, 1752);

        ctx.fillStyle = '#fbbf24';
        ctx.font = '700 16px monospace';
        ctx.fillText('CÂMERA ANTIFRAUDE • IA NUTRICIONAL • GAMIFICAÇÃO AO VIVO', 540, 1792);
      }

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

  const buildWhatsAppRankingText = () => {
    if (data.mode === 'checkin') {
      return `✅ Check-in concluído no desafio *${data.challengeTitle}* (${data.pointsText})! #ArenaFitPro\nhttps://arenafitpro.com.br`;
    }
    const list = data.standings || [];
    const lines: string[] = [
      `🏆 *RANKING OFICIAL • ${(data.challengeTitle || 'ARENAFITPRO').toUpperCase()}*`,
      `⚡ _Classificação Auditada Ao Vivo_`,
      '',
    ];
    if (list.length > 0) {
      list.slice(0, 10).forEach((item, index) => {
        const medal =
          index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${String(index + 1).padStart(2, '0')}`;
        const streakTag = (item.streakDays || 0) >= 2 ? ` (🔥 ${item.streakDays}d)` : '';
        lines.push(`${medal} *${item.name}* — ${item.points} XP${streakTag}`);
      });
    } else {
      lines.push(`🏅 *${data.studentName}* — ${data.rankPosition || '#1'} (${data.pointsText})`);
    }
    lines.push('', '📲 Confira o pódio ao vivo em: https://arenafitpro.com.br');
    return lines.join('\n');
  };

  const handleShareNative = async () => {
    if (!canvasRef.current) return;
    setSharing(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob((b) => resolve(b), 'image/png', 0.95)
      );
      if (!blob) throw new Error('Falha ao gerar imagem.');

      const file = new File([blob], `arenafitpro-ranking-${Date.now()}.png`, {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title:
            data.mode === 'checkin'
              ? 'Meu Check-in no ArenaFitPro'
              : `Ranking Oficial • ${data.challengeTitle}`,
          text: buildWhatsAppRankingText(),
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
    link.download = `arenafitpro-ranking-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareWhatsAppText = () => {
    const text = buildWhatsAppRankingText();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyRankingText = () => {
    navigator.clipboard.writeText(buildWhatsAppRankingText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="mono-glass-card w-full max-w-md rounded-3xl p-5 sm:p-6 border border-white/20 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Topo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              {data.mode === 'checkin' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Trophy className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">
                {data.mode === 'checkin'
                  ? 'Check-in Confirmado!'
                  : data.isCoachView
                  ? 'Compartilhar Ranking da Turma'
                  : 'Compartilhar Pódio & Ranking'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Pódio Top 3 + Tabela Oficial em alta definição (9:16)
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
        <div className="relative w-full max-w-[260px] aspect-[9/16] mx-auto rounded-2xl overflow-hidden border border-white/20 bg-zinc-950 shadow-2xl flex items-center justify-center">
          {rendering || !renderedImageUrl ? (
            <div className="text-center space-y-2 p-4">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin mx-auto" />
              <p className="text-xs font-mono text-zinc-400">MONTANDO PÓDIO E RANKING 9:16...</p>
            </div>
          ) : (
            <img
              src={renderedImageUrl}
              alt="Preview Ranking ArenaFitPro"
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
              <span>Postar Story (9:16)</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={rendering}
              className="mono-button-secondary min-h-[44px] py-2.5 px-3 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Baixar Imagem</span>
            </button>
          </div>

          {data.mode === 'leaderboard' && (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleShareWhatsAppText}
                className="min-h-[42px] py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Enviar no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyRankingText}
                className="min-h-[42px] py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">Placar Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>Copiar Placar Texto</span>
                  </>
                )}
              </button>
            </div>
          )}

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

function getInitials(name: string): string {
  if (!name) return 'AF';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
