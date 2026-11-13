'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  X, 
  Flame, 
  Trophy, 
  Heart, 
  MessageSquare, 
  Zap, 
  Clock, 
  CheckCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StudentNotification, NotificationType } from '@/lib/notifications';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  challengeId?: string;
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  studentId,
  challengeId,
}: NotificationsDrawerProps) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_notifications')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data) {
        setNotifications(data as StudentNotification[]);
      }
    } catch (err) {
      console.warn('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, studentId]);

  // Realtime subscription para novas notificações
  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`user_notifications_${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_notifications',
          filter: `student_id=eq.${studentId}`,
        },
        (payload: any) => {
          setNotifications((prev) => [payload.new as StudentNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleMarkAllAsRead = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await supabase
        .from('student_notifications')
        .update({ is_read: true })
        .eq('student_id', studentId)
        .eq('is_read', false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.warn('Erro ao marcar notificações como lidas:', e);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkSingleAsRead = async (id: string) => {
    try {
      await supabase
        .from('student_notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.warn('Erro ao marcar notificação:', e);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'streak_risk':
      case 'reminder_20h':
        return <Flame className="h-4 w-4 text-[#D4D4D8]" />;
      case 'rank_change':
        return <Trophy className="h-4 w-4 text-[#3478F6]" />;
      case 'feed_reaction':
        return <Heart className="h-4 w-4 text-rose-400" />;
      case 'feed_comment':
        return <MessageSquare className="h-4 w-4 text-[#D4D4D8]" />;
      case 'coach_announcement':
        return <Zap className="h-4 w-4 text-[#3478F6]" />;
      default:
        return <Bell className="h-4 w-4 text-[#A1A1AA]" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end items-center">
      <div className="bg-[#000000] w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto rounded-t-[32px] max-h-[85vh] flex flex-col p-5 safe-bottom-drawer border-t border-[#27272A] shadow-2xl">
        {/* Header do Drawer */}
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#0E0E10] flex items-center justify-center text-[#3478F6] border border-[#27272A]">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-[#FAFAFA]">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-white/[0.06] text-[#D4D4D8] border border-white/10 px-1.5 py-0.2 rounded-full">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-[#A1A1AA]">Alertas de streak, ranking e comunidade</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={isMarkingAll}
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-mono text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-xl hover:bg-[#0E0E10] transition-colors cursor-pointer"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-3.5 w-3.5 text-[#3478F6]" />
                <span>{isMarkingAll ? 'Lendo...' : 'Ler todas'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Fechar notificações"
              className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-[#0E0E10] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-[220px] max-h-[55vh]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#A1A1AA] text-xs font-mono">
              <div className="h-4 w-4 border-2 border-[#3478F6] border-t-transparent rounded-full animate-spin" />
              Carregando avisos...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-[#A1A1AA]">
              <Bell className="h-8 w-8 mx-auto opacity-30 text-[#A1A1AA]" />
              <p className="text-xs font-mono">Nenhuma notificação no momento.</p>
              <p className="text-[11px] text-[#A1A1AA]/70">
                Você será avisado aqui sobre seu streak, ultrapassagens e interações.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkSingleAsRead(item.id)}
                className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-3 ${
                  item.is_read
                    ? 'bg-[#0E0E10]/60 border-[#27272A] opacity-75'
                    : 'bg-[#0E0E10] border-white/10 shadow-sm'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-xs font-bold text-[#FAFAFA] truncate">
                      {item.title}
                    </h4>
                    <span className="text-[9px] font-mono text-[#A1A1AA] shrink-0">
                      {formatTimeAgo(item.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] font-sans leading-relaxed">
                    {item.message}
                  </p>

                  {item.link && (
                    <Link
                      href={item.link}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-[#D4D4D8] hover:text-[#3478F6] mt-1.5 font-bold"
                    >
                      <span>Abrir</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {!item.is_read && (
                  <span className="h-2 w-2 rounded-full bg-[#3478F6] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
