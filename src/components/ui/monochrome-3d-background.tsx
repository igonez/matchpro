'use client';

import React, { useEffect, useRef } from 'react';

export function Monochrome3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respeita prefers-reduced-motion e economiza bateria/CPU em telas < 768px
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.innerWidth < 768) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const createVignette = (w: number, h: number) => {
      const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, w * 0.8);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      return grad;
    };

    let cachedVignette = createVignette(width, height);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cachedVignette = createVignette(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

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

    const render = () => {
      if (document.hidden || window.innerWidth < 768) {
        animationFrameId = null;
        return;
      }

      // Suavização do mouse
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 1. Grid 3D de Horizonte em Perspectiva (Obsidian & Cobalt Floor)
      const horizonY = height * 0.65;
      ctx.save();
      ctx.strokeStyle = 'rgba(52, 120, 246, 0.035)';
      ctx.lineWidth = 1;

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

      const numHorizLines = 16;
      for (let i = 1; i <= numHorizLines; i++) {
        const factor = Math.pow(i / numHorizLines, 2.4);
        const y = vanishingY + factor * (height - vanishingY + 100);
        const alpha = factor * 0.055;
        ctx.strokeStyle = `rgba(117, 167, 255, ${alpha})`;
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
      glowGrad.addColorStop(0, 'rgba(52, 120, 246, 0.045)');
      glowGrad.addColorStop(0.5, 'rgba(52, 120, 246, 0.015)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Partículas flutuantes com projeção 3D
      const fov = 400;
      const centerX = width / 2;
      const centerY = height / 2;

      for (const p of particles) {
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

      // 4. Vinheta cinematográfica em cache nas bordas
      ctx.fillStyle = cachedVignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-20 md:hidden bg-black"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 25%, rgba(52, 120, 246, 0.08), transparent 60%), radial-gradient(circle at 50% 80%, rgba(117, 167, 255, 0.04), transparent 55%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="hidden md:block fixed inset-0 pointer-events-none -z-20 w-full h-full"
      />
    </>
  );
}
