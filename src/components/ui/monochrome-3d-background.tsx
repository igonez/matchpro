'use client';

import React, { useEffect, useRef } from 'react';

export function Monochrome3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Partículas em profundidade 3D
    const particleCount = 65;
    const particles: {
      x: number;
      y: number;
      z: number;
      size: number;
      speed: number;
      opacity: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 1000 + 100,
        size: Math.random() * 1.8 + 0.8,
        speed: Math.random() * 0.4 + 0.2,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008;
      // Suavização do mouse
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.fillStyle = '#030303';
      ctx.fillRect(0, 0, width, height);

      // 1. Grid 3D de Horizonte em Perspectiva (Tron Floor Monocromático)
      const horizonY = height * 0.65;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      // Linhas de perspectiva convergindo para o centro
      const vanishingX = width / 2 + (mouseX - width / 2) * 0.12;
      const vanishingY = horizonY - 120;

      const numPerspectiveLines = 26;
      for (let i = 0; i <= numPerspectiveLines; i++) {
        const bottomX = (width / numPerspectiveLines) * i * 1.6 - width * 0.3;
        ctx.beginPath();
        ctx.moveTo(vanishingX, vanishingY);
        ctx.lineTo(bottomX, height + 100);
        ctx.stroke();
      }

      // Linhas horizontais com espaçamento geométrico exponencial (efeito profundidade)
      const numHorizLines = 16;
      for (let i = 1; i <= numHorizLines; i++) {
        const factor = Math.pow(i / numHorizLines, 2.4);
        const y = vanishingY + factor * (height - vanishingY + 100);
        const alpha = factor * 0.07;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Orbe de Iluminação Difusa Central que acompanha o mouse
      const glowGrad = ctx.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        width * 0.45
      );
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.035)');
      glowGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Partículas flutuantes com projeção 3D
      const fov = 400;
      const centerX = width / 2;
      const centerY = height / 2;

      for (let p of particles) {
        p.z -= p.speed;
        if (p.z <= 10) {
          p.z = 1000;
          p.x = (Math.random() - 0.5) * width * 1.5;
          p.y = (Math.random() - 0.5) * height * 1.5;
        }

        const scale = fov / (fov + p.z);
        const projX = centerX + (p.x + (mouseX - centerX) * 0.1) * scale;
        const projY = centerY + (p.y + (mouseY - centerY) * 0.1) * scale;
        const radius = p.size * scale * 1.6;

        if (projX > 0 && projX < width && projY > 0 && projY < height) {
          ctx.beginPath();
          ctx.arc(projX, projY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * scale * 1.2})`;
          ctx.fill();
        }
      }

      // 4. Vinheta cinematográfica nas bordas
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.4,
        width / 2,
        height / 2,
        width * 0.8
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-20 w-full h-full"
    />
  );
}
