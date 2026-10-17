'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { 
  X, 
  MessageSquare, 
  Send, 
  Trash2, 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  Heart,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { createStudentNotification } from '@/lib/notifications';

export type ReactionType = 'fire' | 'muscle' | 'clap' | 'heart';

export interface ReactionDef {
  key: ReactionType;
  emoji: string;
  label: string;
  activeBg: string;
  activeBorder: string;
}

export const REACTIONS: ReactionDef[] = [
  {
    key: 'fire',
    emoji: '🔥',
    label: 'Fogo',
    activeBg: 'bg-amber-500/20 text-amber-300',
    activeBorder: 'border-amber-500/40',
  },
  {
    key: 'muscle',
    emoji: '💪',
    label: 'Força',
    activeBg: 'bg-emerald-500/20 text-emerald-300',
    activeBorder: 'border-emerald-500/40',
  },
  {
    key: 'clap',
    emoji: '👏',
    label: 'Palmas',
    activeBg: 'bg-sky-500/20 text-sky-300',
    activeBorder: 'border-sky-500/40',
  },
  {
    key: 'heart',
    emoji: '❤️',
    label: 'Coração',
    activeBg: 'bg-rose-500/20 text-rose-300',
    activeBorder: 'border-rose-500/40',
  },
];

export const QUICK_PRAISE_CHIPS = [
  'Boa monstro! 🔥',
  'Foco total! 💪',
  'Disciplina pura! 👏',
  'Treino pago! 👊',
  'Inspiração demais! ✨',
  'Bora pra cima! 🚀',
];

export default function StudentSocialFeedPage() {
  const supabase = createClient();

  // Abas: Feed de Fotos vs Mural da Turma
  const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('feed');

  // Estado Geral
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);
  const [challengeTitle, setChallengeTitle] = useState<string>('Turma');
  const [loading, setLoading] = useState(true);

  // Efeito Delícia de Reação Rápida / Double Tap
  const [burstReaction, setBurstReaction] = useState<{ postId: string; emoji: string } | null>(null);
  const lastTapRef = useRef<{ time: number; postId: string }>({ time: 0, postId: '' });

  // Modal / Gaveta de Comentários das Fotos
  const [activeCommentPost, setActiveCommentPost] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Chat / Mural da Turma
  const [messages, setMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sendingChatMessage, setSendingChatMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Modal de Denúncia e Toast
  const [reportTargetPost, setReportTargetPost] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

  // 1. CARREGAR FEED E PERFIL DO ALUNO
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      let challengeId: string | null = null;
      if (user) {
        // Buscar perfil do aluno para autoria de comentários
        const { data: profile } = await supabase
          .from('students')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setUserProfile(profile);
        } else {
          setUserProfile({
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Aluno',
            avatar_url: user.user_metadata?.avatar_url || null,
          });
        }

        // Buscar desafio ativo do aluno
        const { data: part } = await supabase
          .from('challenge_participants')
          .select('challenge_id')
          .eq('student_id', user.id)
          .in('payment_status', ['paid', 'complimentary'])
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        challengeId = part?.challenge_id || null;
      }

      if (challengeId) {
        setCurrentChallengeId(challengeId);
        const { data: ch } = await supabase
          .from('challenges')
          .select('title')
          .eq('id', challengeId)
          .maybeSingle();
        if (ch?.title) setChallengeTitle(ch.title);
      }

      let query = supabase
        .from('student_submissions')
        .select(`
          id,
          photo_url,
          caption,
          location_name,
          client_captured_at,
          submitted_at,
          student_id,
          challenge_id,
          students (
            full_name,
            avatar_url
          ),
          missions (
            title,
            points_rewarded
          ),
          submission_likes (
            id,
            student_id,
            reaction_type
          ),
          submission_comments (
            id
          )
        `)
        .eq('status', 'approved');

      if (challengeId) {
        query = query.eq('challenge_id', challengeId);
      }

      const { data: submissionsData } = await query
        .order('submitted_at', { ascending: false })
        .limit(50);

      setPosts(submissionsData || []);
    } catch (err) {
      console.error('Erro ao carregar feed social:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // 2. SUPABASE REALTIME: MURAL DA TURMA (CHAT)
  useEffect(() => {
    if (!currentChallengeId) return;

    // Buscar mensagens existentes
    const loadMessages = async () => {
      const { data } = await supabase
        .from('challenge_messages')
        .select('*')
        .eq('challenge_id', currentChallengeId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) {
        setMessages(data);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);
      }
    };

    loadMessages();

    // Escutar novas mensagens no canal Realtime da turma
    const channel = supabase
      .channel(`chat-turma-${currentChallengeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'challenge_messages',
          filter: `challenge_id=eq.${currentChallengeId}`,
        },
        (payload: any) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'challenge_messages',
          filter: `challenge_id=eq.${currentChallengeId}`,
        },
        (payload: any) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChallengeId]);

  // 3. MULTI-REAÇÕES (EMOJIS) & DOUBLE TAP DELIGHT
  const handlePhotoDoubleTap = (postId: string) => {
    const now = Date.now();
    if (lastTapRef.current.postId === postId && now - lastTapRef.current.time < 350) {
      handleToggleReaction(postId, 'fire');
      setBurstReaction({ postId, emoji: '🔥' });
      setTimeout(() => setBurstReaction(null), 900);
      lastTapRef.current = { time: 0, postId: '' };
    } else {
      lastTapRef.current = { time: now, postId };
    }
  };

  const handleToggleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!currentUser) return;

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const currentLikes: any[] = targetPost.submission_likes || [];
    const existing = currentLikes.find((l: any) => l.student_id === currentUser.id);
    const isSameType = existing && (existing.reaction_type || 'fire') === reactionType;

    // Atualização otimista imediata na interface
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          let updatedLikes = [...(p.submission_likes || [])];
          if (isSameType) {
            // Remove reação
            updatedLikes = updatedLikes.filter((l: any) => l.student_id !== currentUser.id);
          } else if (existing) {
            // Alterna tipo
            updatedLikes = updatedLikes.map((l: any) =>
              l.student_id === currentUser.id ? { ...l, reaction_type: reactionType } : l
            );
          } else {
            // Adiciona nova
            updatedLikes.push({
              id: 'temp-' + Date.now(),
              submission_id: postId,
              student_id: currentUser.id,
              reaction_type: reactionType,
            });
          }
          return { ...p, submission_likes: updatedLikes };
        }
        return p;
      })
    );

    try {
      if (isSameType) {
        await supabase
          .from('submission_likes')
          .delete()
          .eq('submission_id', postId)
          .eq('student_id', currentUser.id);
      } else if (existing) {
        await supabase
          .from('submission_likes')
          .update({ reaction_type: reactionType })
          .eq('submission_id', postId)
          .eq('student_id', currentUser.id);
      } else {
        await supabase
          .from('submission_likes')
          .insert({
            submission_id: postId,
            student_id: currentUser.id,
            reaction_type: reactionType,
          });

        // Notificar autor da foto se for outro atleta
        if (targetPost.student_id && targetPost.student_id !== currentUser.id && currentChallengeId) {
          const emojiIcon = REACTIONS.find((r) => r.key === reactionType)?.emoji || '🔥';
          createStudentNotification({
            challengeId: currentChallengeId,
            studentId: targetPost.student_id,
            type: 'feed_reaction',
            title: `Nova Reação ${emojiIcon}`,
            message: `${userProfile?.full_name?.split(' ')[0] || 'Um atleta'} reagiu com ${emojiIcon} no seu check-in!`,
            link: '/app/feed',
          });
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar reação:', err);
    }
  };

  // 4. COMENTÁRIOS DA FOTO (MODAL / GAVETA)
  const handleOpenComments = async (post: any) => {
    setActiveCommentPost(post);
    setCommentText('');
    setLoadingComments(true);
    try {
      const { data: comments, error } = await supabase
        .from('submission_comments')
        .select('*')
        .eq('submission_id', post.id)
        .order('created_at', { ascending: true });

      if (!error) {
        setCommentsList(comments || []);
      }
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Realtime para comentários da foto aberta
  useEffect(() => {
    if (!activeCommentPost?.id) return;

    const channel = supabase
      .channel(`comments_${activeCommentPost.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submission_comments',
          filter: `submission_id=eq.${activeCommentPost.id}`,
        },
        (payload: any) => {
          setCommentsList((prev) => {
            if (prev.some((c) => c.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'submission_comments',
          filter: `submission_id=eq.${activeCommentPost.id}`,
        },
        (payload: any) => {
          setCommentsList((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCommentPost?.id]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentPost || !currentUser || submittingComment) return;

    setSubmittingComment(true);
    try {
      const isCoach = currentUser.user_metadata?.role === 'professional';
      const authorName = userProfile?.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Aluno';
      const authorAvatar = userProfile?.avatar_url || currentUser.user_metadata?.avatar_url || null;

      const payload = {
        submission_id: activeCommentPost.id,
        student_id: currentUser.id,
        user_id: currentUser.id,
        user_name: authorName,
        user_avatar: authorAvatar,
        user_role: isCoach ? 'coach' : 'student',
        content: commentText.trim(),
      };

      const { data: newComment, error } = await supabase
        .from('submission_comments')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (newComment) {
        setCommentsList((prev) => [...prev, newComment]);
        setCommentText('');

        // Incrementar contador de comentários na lista de posts
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === activeCommentPost.id) {
              const currentComments = p.submission_comments || [];
              return {
                ...p,
                submission_comments: [...currentComments, { id: newComment.id }],
              };
            }
            return p;
          })
        );

        // Notificar autor da foto se for outro atleta
        if (activeCommentPost.student_id && activeCommentPost.student_id !== currentUser.id && currentChallengeId) {
          createStudentNotification({
            challengeId: currentChallengeId,
            studentId: activeCommentPost.student_id,
            type: 'feed_comment',
            title: isCoach ? '⚡ Feedback do Coach!' : 'Novo Comentário no seu Check-in',
            message: `${authorName}: "${commentText.trim().slice(0, 60)}"`,
            link: '/app/feed',
          });
        }
      }
    } catch (err: any) {
      console.error('Erro ao postar comentário:', err);
      showToast(err.message || 'Erro ao enviar comentário.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('submission_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setCommentsList((prev) => prev.filter((c) => c.id !== commentId));
      if (activeCommentPost) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === activeCommentPost.id) {
              return {
                ...p,
                submission_comments: (p.submission_comments || []).filter((c: any) => c.id !== commentId),
              };
            }
            return p;
          })
        );
      }
      showToast('Comentário removido.');
    } catch (err) {
      showToast('Erro ao remover comentário.');
    }
  };

  // 5. ENVIAR MENSAGEM NO CHAT / MURAL DA TURMA
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !currentChallengeId || !currentUser || sendingChatMessage) return;

    setSendingChatMessage(true);
    try {
      const isCoach = currentUser.user_metadata?.role === 'professional';
      const authorName = userProfile?.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Aluno';
      const authorAvatar = userProfile?.avatar_url || currentUser.user_metadata?.avatar_url || null;

      const payload = {
        challenge_id: currentChallengeId,
        user_id: currentUser.id,
        user_name: authorName,
        user_avatar: authorAvatar,
        user_role: isCoach ? 'coach' : 'student',
        content: newChatMessage.trim(),
      };

      const { data: inserted, error } = await supabase
        .from('challenge_messages')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (inserted) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === inserted.id)) return prev;
          return [...prev, inserted];
        });
        setNewChatMessage('');
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      showToast(err.message || 'Erro ao enviar mensagem no chat.');
    } finally {
      setSendingChatMessage(false);
    }
  };

  const handleDeleteChatMessage = async (msgId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_messages')
        .delete()
        .eq('id', msgId);

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      showToast('Mensagem excluída.');
    } catch (err) {
      showToast('Erro ao excluir mensagem.');
    }
  };

  // 6. DENÚNCIA DE FOTO
  const handleConfirmReport = async () => {
    if (!currentUser || !reportTargetPost) return;
    const post = reportTargetPost;
    setReportTargetPost(null);

    const { error } = await supabase.from('submission_reports').insert({
      submission_id: post.id,
      reporter_student_id: currentUser.id,
      reason: 'Denúncia de foto suspeita',
    });

    if (error && error.message.includes('unique')) {
      showToast('Você já sinalizou esta foto anteriormente.');
    } else if (error) {
      showToast('Erro ao enviar sinalização: ' + error.message);
    } else {
      showToast('Foto enviada para averiguação da comissão técnica.');
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-28 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div>
          <span className="text-[11px] text-zinc-400 font-medium block">
            Comunidade • {challengeTitle}
          </span>
          <h1 className="text-xl font-black text-white">Feed da Turma</h1>
          <p className="text-xs text-zinc-400">Interaja com seus colegas de desafio em tempo real</p>
        </div>
      </div>

      {/* Abas Superiores: Feed de Fotos vs Mural da Turma */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-900/90 border border-white/10 relative z-10">
        <button
          onClick={() => setActiveTab('feed')}
          className={`py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'feed'
              ? 'bg-white text-black shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Fotos ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-white text-black shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Mural / Chat</span>
          {messages.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
              activeTab === 'chat' ? 'bg-black text-white' : 'bg-white/20 text-white'
            }`}>
              {messages.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: FEED DE FOTOS & CHECK-INS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'feed' && (
        <>
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs relative z-10">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Carregando publicações...
            </div>
          ) : posts.length === 0 ? (
            <div className="mono-glass-card p-10 text-center text-xs text-zinc-400 relative z-10">
              Nenhuma publicação aprovada no momento. Os primeiros check-ins validados aparecerão aqui.
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              {posts.map((post) => {
                const likes: any[] = post.submission_likes || [];
                const commentsCount = post.submission_comments?.length || 0;

                // Agrupamento de reações
                const counts: Record<ReactionType, number> = { fire: 0, muscle: 0, clap: 0, heart: 0 };
                let myReaction: ReactionType | null = null;

                likes.forEach((l: any) => {
                  const type: ReactionType = (l.reaction_type as ReactionType) || 'fire';
                  if (counts[type] !== undefined) counts[type]++;
                  if (l.student_id === currentUser?.id) myReaction = type;
                });

                return (
                  <div
                    key={post.id}
                    className="mono-glass-card rounded-3xl overflow-hidden border border-white/10"
                  >
                    {/* Header do Post */}
                    <div className="p-3.5 flex items-center justify-between border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-b from-white via-zinc-400 to-zinc-900 p-px shrink-0">
                          <div className="h-full w-full bg-black rounded-full flex items-center justify-center font-bold text-xs text-white overflow-hidden">
                            {post.students?.avatar_url ? (
                              <img
                                src={post.students.avatar_url}
                                alt={post.students.full_name || 'Aluno'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              post.students?.full_name?.charAt(0) || 'A'
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">
                            {post.students?.full_name || 'Atleta'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span>
                              {new Date(post.client_captured_at || post.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {post.location_name && (
                              <span className="text-zinc-500 truncate max-w-[130px]">
                                • {post.location_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-white bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full font-mono">
                        +{post.missions?.points_rewarded || 10} pts
                      </span>
                    </div>

                    {/* Imagem do Post com Duplo Toque para 🔥 */}
                    <div
                      onClick={() => handlePhotoDoubleTap(post.id)}
                      className="relative aspect-square w-full bg-black overflow-hidden cursor-pointer select-none group"
                    >
                      <img
                        src={post.photo_url}
                        alt="Foto da missão"
                        className="w-full h-full object-cover transition-transform duration-300 group-active:scale-[0.99]"
                      />

                      {/* Burst Animation no Duplo Toque */}
                      {burstReaction && burstReaction.postId === post.id && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in fade-in zoom-in duration-200">
                          <span className="text-7xl animate-pulse select-none drop-shadow-[0_0_30px_rgba(251,146,60,0.9)]">
                            {burstReaction.emoji}
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-white border border-white/15">
                        {post.missions?.title || 'Check-in Realizado'}
                      </div>
                    </div>

                    {/* Ações Sociais (Multi-Reações & Comentários) */}
                    <div className="p-3.5 space-y-3">
                      {/* Pílulas de Reações com Contagem Ativa */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Dock de Reação Rápida 4 Emojis */}
                        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
                          {REACTIONS.map((r) => {
                            const isSelected = myReaction === r.key;
                            const count = counts[r.key];
                            return (
                              <button
                                key={r.key}
                                onClick={() => handleToggleReaction(post.id, r.key)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer active:scale-90 ${
                                  isSelected
                                    ? `${r.activeBg} border ${r.activeBorder} shadow-sm scale-105`
                                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                                }`}
                                title={`Reagir com ${r.label}`}
                              >
                                <span>{r.emoji}</span>
                                {count > 0 && <span className="text-[11px]">{count}</span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* Botões Secundários: Comentários e Denúncia */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenComments(post)}
                            className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-xl border border-white/[0.08]"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{commentsCount}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (!currentUser) return;
                              setReportTargetPost(post);
                            }}
                            className="text-[10px] font-mono text-zinc-600 hover:text-rose-400 cursor-pointer p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                            title="Sinalizar foto suspeita"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {post.caption && (
                        <p className="text-xs text-zinc-300 font-sans leading-relaxed pt-0.5">
                          <span className="font-bold text-white mr-1.5">
                            {post.students?.full_name?.split(' ')[0]}:
                          </span>
                          {post.caption}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: MURAL / CHAT DA TURMA (REALTIME)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="relative z-10 flex flex-col h-[70vh] rounded-3xl mono-glass-card border border-white/10 overflow-hidden">
          {/* Header do Chat */}
          <div className="p-3.5 bg-black/40 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Mural Ao Vivo • {challengeTitle}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {messages.length} msg(s)
            </span>
          </div>

          {/* Lista de Mensagens com Auto-scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 text-xs font-mono">
                <MessageSquare className="h-8 w-8 mb-2 text-zinc-600" />
                <p>Nenhuma mensagem ainda no mural da turma.</p>
                <p className="text-[11px] text-zinc-600 mt-1">Dê um "bom dia" ou motive seus colegas abaixo!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.user_id === currentUser?.id;
                const isCoach = msg.user_role === 'coach';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}
                  >
                    {/* Cabeçalho da Mensagem */}
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-zinc-400">
                      <span className="font-bold text-zinc-300">
                        {isMine ? 'Você' : msg.user_name}
                      </span>
                      {isCoach && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                          ⚡ COACH
                        </span>
                      )}
                      <span className="text-zinc-600">•</span>
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* Excluir própria mensagem */}
                      {isMine && (
                        <button
                          onClick={() => handleDeleteChatMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-zinc-600 hover:text-rose-400 cursor-pointer"
                          title="Excluir mensagem"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Balão da Mensagem */}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words ${
                        isMine
                          ? 'bg-white text-black font-medium rounded-tr-sm shadow-md'
                          : isCoach
                          ? 'bg-amber-950/30 border border-amber-500/40 text-amber-100 rounded-tl-sm'
                          : 'bg-zinc-900 border border-white/10 text-zinc-200 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Campo de Entrada de Mensagem do Chat */}
          <form
            onSubmit={handleSendChatMessage}
            className="p-3 bg-black/60 border-t border-white/[0.08] flex items-center gap-2"
          >
            <Input
              type="text"
              placeholder="Digite sua mensagem para a turma..."
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              className="h-10 text-xs rounded-xl bg-zinc-900/90 border-white/15 text-white placeholder:text-zinc-500 focus:border-white/40"
            />
            <button
              type="submit"
              disabled={sendingChatMessage || !newChatMessage.trim()}
              className="mono-button-primary h-10 px-4 text-xs font-mono shrink-0 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {sendingChatMessage ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHEET / MODAL DE COMENTÁRIOS DA FOTO                                      */}
      {/* ========================================================================= */}
      {activeCommentPost && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-end max-w-md mx-auto">
          <div className="mono-glass-card rounded-t-[32px] max-h-[80vh] flex flex-col p-5 border-t border-white/20">
            {/* Header do Sheet */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span className="font-bold text-xs text-white font-mono uppercase tracking-wider">
                  Comentários na Foto • {activeCommentPost.students?.full_name?.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="h-7 w-7 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Lista de Comentários */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-[180px] max-h-[50vh]">
              {loadingComments ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Carregando comentários...
                </div>
              ) : commentsList.length === 0 ? (
                <p className="text-center text-xs font-mono text-zinc-500 py-10">
                  Nenhum comentário ainda. Seja o primeiro a motivar seu colega!
                </p>
              ) : (
                commentsList.map((c) => {
                  const isMine = c.user_id === currentUser?.id;
                  const isCoach = c.user_role === 'coach';

                  return (
                    <div key={c.id} className="flex items-start gap-2.5 text-xs group">
                      <div className="h-7 w-7 rounded-full bg-zinc-800 text-white font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 overflow-hidden border border-white/10">
                        {c.user_avatar ? (
                          <img
                            src={c.user_avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          c.user_name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div className="flex-1 bg-white/[0.04] p-2.5 rounded-2xl border border-white/[0.06]">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">
                              {c.user_name}
                            </span>
                            {isCoach && (
                              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                                COACH
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-zinc-500">
                              {formatTimeAgo(c.created_at)}
                            </span>
                            {isMine && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-rose-400 p-0.5 cursor-pointer"
                                title="Excluir comentário"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-zinc-300 leading-relaxed font-sans">{c.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Chips de Incentivo Rápido (1-Touch) */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {QUICK_PRAISE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCommentText(chip)}
                    className="text-[11px] font-sans font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:border-white/30 hover:bg-white/10 shrink-0 transition-all cursor-pointer active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input para envio de comentário */}
            <form onSubmit={handleSendComment} className="pt-2 flex items-center gap-2 border-t border-white/[0.08]">
              <Input
                type="text"
                placeholder="Escreva um comentário de incentivo..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="h-10 text-xs rounded-xl bg-black border-white/15 text-white placeholder:text-zinc-600 focus:border-white/40"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="mono-button-primary px-4 h-10 text-xs font-mono flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {submittingComment ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>ENVIAR</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Denúncia */}
      <CustomDialog
        isOpen={Boolean(reportTargetPost)}
        onClose={() => setReportTargetPost(null)}
        onConfirm={handleConfirmReport}
        title="Sinalizar Publicação para Auditoria"
        description="Deseja sinalizar esta foto para auditoria da comissão técnica por suspeita de fraude ou descumprimento das regras?"
        confirmLabel="Sinalizar Foto"
        cancelLabel="Cancelar"
      />

      {/* Toast Monocromático Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 mono-glass-card px-5 py-3 rounded-2xl border border-white/25 text-white text-xs font-bold shadow-[0_0_30px_rgba(255,255,255,0.12)] animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-xs text-center">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
