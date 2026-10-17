import { createClient } from '@/lib/supabase/client';

export type NotificationType = 
  | 'streak_risk'
  | 'rank_change'
  | 'feed_reaction'
  | 'feed_comment'
  | 'coach_announcement'
  | 'reminder_20h';

export interface StudentNotification {
  id: string;
  challenge_id: string;
  student_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Envia notificação nativa do navegador/celular se permissão estiver concedida
 */
export async function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
      } as any);
      return true;
    } catch (e) {
      // Em alguns dispositivos móveis Android/iOS, Notification direta requer serviceWorker registration
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(title, {
            icon: '/icons/icon-192x192.png',
            ...options,
          });
          return true;
        } catch (swErr) {
          console.warn('Falha ao disparar notificação via ServiceWorker:', swErr);
        }
      }
    }
  }
  return false;
}

/**
 * Cria uma notificação no banco de dados e tenta disparar browser push
 */
export async function createStudentNotification({
  challengeId,
  studentId,
  type,
  title,
  message,
  link,
}: {
  challengeId: string;
  studentId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('student_notifications').insert({
      challenge_id: challengeId,
      student_id: studentId,
      type,
      title,
      message,
      link: link || null,
      is_read: false,
    });

    if (error) {
      console.warn('Erro ao salvar notificação no banco:', error);
    }

    // Se o destinatário for o próprio usuário logado no momento, dispara local notification
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === studentId) {
      sendBrowserNotification(title, { body: message });
    }
  } catch (err) {
    console.error('Falha geral ao criar notificação:', err);
  }
}

/**
 * Verifica se o aluno está em risco de perder o streak hoje (ex: após 19h sem check-in)
 */
export function checkStreakRisk({
  todayCompletedCount,
  currentHour = new Date().getHours(),
}: {
  todayCompletedCount: number;
  currentHour?: number;
}): { isAtRisk: boolean; hoursLeft: number; alertMessage: string } {
  const isNight = currentHour >= 19;
  const isPending = todayCompletedCount === 0;
  const hoursLeft = Math.max(0, 24 - currentHour);

  if (isNight && isPending) {
    return {
      isAtRisk: true,
      hoursLeft,
      alertMessage: `⚠️ Restam apenas ${hoursLeft}h para a virada do dia! Complete sua missão de hoje para não zerar sua ofensiva.`,
    };
  }

  return {
    isAtRisk: false,
    hoursLeft,
    alertMessage: '',
  };
}
