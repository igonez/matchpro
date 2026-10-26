'use client';

import React, { useEffect, useState } from 'react';
import { BellRing, X } from 'lucide-react';

interface PushNotificationBannerProps {
  streakDays?: number;
  isStreakAtRisk?: boolean;
  hoursLeft?: number;
}

export async function sendArenaLocalNotification(
  title: string,
  body: string,
  url: string = '/app'
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/favicon.png',
          tag: `arenafit-${Date.now()}`,
          data: { url },
        });
        return true;
      }
    }
    new Notification(title, {
      body,
      icon: '/icon-192.png',
    });
    return true;
  } catch (err) {
    console.warn('Falha ao disparar notificação local:', err);
    return false;
  }
}

export function PushNotificationBanner({
  streakDays = 0,
  isStreakAtRisk = false,
  hoursLeft = 4,
}: PushNotificationBannerProps) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Registrar o Service Worker do PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service Worker registro opcional:', err);
      });
    }

    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }

    if (localStorage.getItem('arena_push_banner_dismissed') === 'true') {
      setDismissed(true);
    }
  }, []);

  // Disparar alerta automático de ofensiva em risco (1x por dia) caso o aluno já tenha concedido permissão
  useEffect(() => {
    if (permission !== 'granted' || !isStreakAtRisk) return;
    const todayKey = `arena_streak_notified_${new Date().toISOString().split('T')[0]}`;
    if (localStorage.getItem(todayKey)) return;

    localStorage.setItem(todayKey, 'true');
    sendArenaLocalNotification(
      `Ofensiva de ${streakDays} dias em risco!`,
      `Faltam ${hoursLeft}h para a meia-noite. Registre seu check-in na Arena para não zerar sua sequência!`,
      '/app/missions'
    );
  }, [permission, isStreakAtRisk, streakDays, hoursLeft]);

  const handleEnableNotifications = async () => {
    if (!supported) return;
    setActivating(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        localStorage.setItem('arena_push_enabled', 'true');
        await sendArenaLocalNotification(
          'Alertas da Arena Ativados!',
          'Você será avisado se sua ofensiva entrar em risco às 20h ou quando houver disputas no Pódio.',
          '/app'
        );
      }
    } catch (err) {
      console.warn('Erro ao solicitar permissão de notificação:', err);
    } finally {
      setActivating(false);
    }
  };

  if (!supported || permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <div className="relative z-10 p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-white/15 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white shrink-0">
          <BellRing className="w-4 h-4 text-amber-300" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white leading-tight">
            Ativar Alertas de Ofensiva & Pódio
          </p>
          <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
            Receba lembrete às 20h antes de perder seu streak diário.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleEnableNotifications}
          disabled={activating}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-mono font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          {activating ? '...' : 'Ativar'}
        </button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            localStorage.setItem('arena_push_banner_dismissed', 'true');
          }}
          aria-label="Dispensar"
          className="min-h-[38px] px-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
