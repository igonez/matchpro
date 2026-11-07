'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  Flame, 
  Sparkles,
  X,
  Send,
  Loader2,
  Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Input } from '@/components/ui/input';

type ReactionType = 'fire' | 'muscle' | 'clap' | 'heart';

interface ReactionDef {
  key: ReactionType;
  emoji: string;
  label: string;
  activeBg: string;
  activeBorder: string;
}

const REACTIONS: ReactionDef[] = [
  {
    key: 'fire',
    emoji: '🔥',
    label: 'Respeito',
    activeBg: 'bg-[#3478F6]/20 text-[#75A7FF]',
    activeBorder: 'border-[#3478F6]/40',
  },
  {
    key: 'muscle',
    emoji: '💪',
    label: 'Força',
    activeBg: 'bg-[#3478F6]/20 text-[#75A7FF]',
    activeBorder: 'border-[#3478F6]/40',
  },
  {
    key: 'clap',
    emoji: '👏',
    label: 'Disciplina',
    activeBg: 'bg-[#3478F6]/20 text-[#75A7FF]',
    activeBorder: 'border-[#3478F6]/40',
  },
  {
    key: 'heart',
    emoji: '❤️',
    label: 'Apoio',
    activeBg: 'bg-[#3478F6]/20 text-[#75A7FF]',
    activeBorder: 'border-[#3478F6]/40',
  },
];

const COACH_PRAISE_CHIPS = [
  'Excelente treino! Foco total mantido.',
  'Orgulho da dedicação e constância.',
  'Mantenha a constância e disciplina.',
  'Execução impecável. Parabéns.',
  'Meta diária batida com sucesso.',
  'Padrão profissional de entrega.',
];

export default function DashboardFeedPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('all');
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal / Gaveta de Comentários do Coach
  const [activeCommentPost, setActiveCommentPost] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUser(user);

        // 1. Desafios exclusivos do profissional
        const { data: coachChallenges } = await supabase
          .from('challenges')
          .select('id, title')
          .eq('professional_id', user.id)
          .order('start_date', { ascending: false });

        const safeChallenges = coachChallenges || [];
        setChallenges(safeChallenges);

        if (safeChallenges.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        const targetIds = selectedChallengeId === 'all'
          ? safeChallenges.map((c: any) => c.id)
          : [selectedChallengeId];

        // 2. Buscar postagens aprovadas dos alunos do treinador
        const { data: submissionsData, error: subsError } = await supabase
          .from('student_submissions')
          .select(`
            id,
            photo_url,
            caption,
            status,
            client_captured_at,
            submitted_at,
            location_name,
            duration_seconds,
            student_id,
            challenge_id,
            students (
              full_name,
              avatar_url
            ),
            missions (
              id,
              title,
              category,
              points_rewarded,
              challenge_id
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
          .in('challenge_id', targetIds)
          .eq('status', 'approved')
          .order('submitted_at', { ascending: false })
          .limit(50);

        if (subsError) {
          console.warn('Erro ao carregar feed social do coach:', subsError);
        }
        setPosts(submissionsData || []);
      } catch (err) {
        console.error('Erro ao carregar feed social do coach:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [selectedChallengeId, supabase]);

  // Realtime para comentários da postagem aberta
  useEffect(() => {
    if (!activeCommentPost?.id) return;

    const channel = supabase
      .channel(`coach_comments_${activeCommentPost.id}`)
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

  const handleToggleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!currentUser) return;

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const currentLikes: any[] = targetPost.submission_likes || [];
    const existing = currentLikes.find((l: any) => l.student_id === currentUser.id);
    const isSameType = existing && (existing.reaction_type || 'fire') === reactionType;

    // Otimista
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          let updatedLikes = [...(p.submission_likes || [])];
          if (isSameType) {
            updatedLikes = updatedLikes.filter((l: any) => l.student_id !== currentUser.id);
          } else if (existing) {
            updatedLikes = updatedLikes.map((l: any) =>
              l.student_id === currentUser.id ? { ...l, reaction_type: reactionType } : l
            );
          } else {
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
      }
    } catch (e) {
      console.warn('Erro ao atualizar reação:', e);
    }
  };

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

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentPost || !currentUser || submittingComment) return;

    setSubmittingComment(true);
    try {
      const authorName = currentUser.user_metadata?.full_name || 'Coach';
      const authorAvatar = currentUser.user_metadata?.avatar_url || null;

      const payload = {
        submission_id: activeCommentPost.id,
        student_id: currentUser.id,
        user_id: currentUser.id,
        user_name: authorName,
        user_avatar: authorAvatar,
        user_role: 'coach',
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
      }
    } catch (err: any) {
      console.error('Erro ao postar comentário do coach:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await supabase.from('submission_comments').delete().eq('id', commentId);
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
    } catch (err) {
      console.error('Erro ao excluir comentário:', err);
    }
  };

  return (
    <div className="space-y-6 relative pb-16">
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-[#75A7FF] bg-[#3478F6]/15 px-2.5 py-0.5 rounded-full border border-[#3478F6]/30">
              Comunidade
            </span>
            <span className="text-xs text-[#A7B0C0] font-medium">Feed em Tempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F4F6FA] tracking-tight">
            Feed das Turmas
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B0C0] mt-0.5">
            Acompanhe as fotos de treino, refeições e conquistas dos seus atletas com interação ao vivo.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {challenges.length > 0 && (
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl border border-[#252D3B] bg-[#1B2330] px-3 text-xs font-mono font-bold text-[#F4F6FA] focus:outline-none focus:border-[#3478F6]"
            >
              <option value="all">Todas as Turmas ({challenges.length})</option>
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          <Link href="/dashboard/audit">
            <button className="mono-button-secondary h-10 px-4 text-xs font-mono flex items-center gap-1.5 cursor-pointer">
              <ShieldCheck className="h-3.5 w-3.5 text-[#3478F6]" />
              <span>Auditoria Swipe →</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#A7B0C0] text-xs font-mono relative z-10">
          <div className="h-5 w-5 border-2 border-[#3478F6] border-t-transparent rounded-full animate-spin" />
          CARREGANDO FEED DA COMUNIDADE...
        </div>
      ) : posts.length === 0 ? (
        <div className="mono-glass-card p-12 text-center text-xs font-mono text-[#A7B0C0] relative z-10">
          Nenhuma postagem realizada ainda nesta turma.
        </div>
      ) : (
        <div className="max-w-xl mx-auto space-y-4 relative z-10">
          {posts.map((post) => {
            const likes: any[] = post.submission_likes || [];
            const commentsCount = (post.submission_comments || []).length;

            const counts: Record<ReactionType, number> = { fire: 0, muscle: 0, clap: 0, heart: 0 };
            let coachReaction: ReactionType | null = null;

            likes.forEach((l: any) => {
              const type: ReactionType = (l.reaction_type as ReactionType) || 'fire';
              if (counts[type] !== undefined) counts[type]++;
              if (l.student_id === currentUser?.id) coachReaction = type;
            });

            return (
              <SpotlightCard3D key={post.id} className="p-4 sm:p-5 space-y-3.5">
                {/* Header do Post */}
                <div className="flex items-center justify-between pb-3 border-b border-[#252D3B]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-[#1B2330] border border-[#252D3B] flex items-center justify-center font-bold text-xs text-[#F4F6FA] overflow-hidden">
                      {post.students?.avatar_url ? (
                        <img src={post.students.avatar_url} alt="aluno" className="w-full h-full object-cover" />
                      ) : (
                        post.students?.full_name?.charAt(0) || 'A'
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F4F6FA] leading-tight">
                        {post.students?.full_name || 'Atleta Arena'}
                      </h4>
                      <p className="text-[10px] text-[#A7B0C0] font-mono">
                        {new Date(post.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(post.submitted_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-[#75A7FF] bg-[#3478F6]/15 px-2.5 py-1 rounded-full border border-[#3478F6]/30">
                    +{post.missions?.points_rewarded || 10} PTS
                  </span>
                </div>

                {/* Imagem do Check-in */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#080A0F] border border-[#252D3B]">
                  <img src={post.photo_url} alt="Check-in" className="w-full h-full object-cover" />

                  {/* Tag de Missão */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#121722]/90 backdrop-blur-md border border-[#252D3B] text-[10px] font-bold text-[#F4F6FA]">
                    {post.missions?.title}
                  </div>
                </div>

                {/* Informações de Treino e Legenda */}
                <div className="space-y-1.5 text-xs text-[#F4F6FA]">
                  {post.duration_seconds && (
                    <p className="text-[#F4F6FA] font-mono text-[11px] bg-[#1B2330] border border-[#252D3B] px-2 py-0.5 rounded-md w-fit">
                      Duração: {Math.floor(post.duration_seconds / 60)}min {post.duration_seconds % 60}s
                    </p>
                  )}

                  {post.caption && (
                    <p className="text-[#F4F6FA] italic font-sans pt-0.5">
                      "{post.caption}"
                    </p>
                  )}

                  {post.location_name && (
                    <p className="text-[10px] text-[#A7B0C0] font-mono flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#75A7FF]" />
                      <span>{post.location_name}</span>
                    </p>
                  )}
                </div>

                {/* Ações do Treinador: Dock de Reações & Comentários */}
                <div className="flex items-center justify-between pt-2 border-t border-[#252D3B]">
                  {/* Dock 4 Emojis para o Treinador */}
                  <div className="flex items-center gap-1 bg-[#1B2330] p-1 rounded-2xl border border-[#252D3B]">
                    {REACTIONS.map((r) => {
                      const isSelected = coachReaction === r.key;
                      const count = counts[r.key];
                      return (
                        <button
                          key={r.key}
                          onClick={() => handleToggleReaction(post.id, r.key)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer active:scale-90 ${
                            isSelected
                              ? `${r.activeBg} border ${r.activeBorder} shadow-sm scale-105`
                              : 'text-[#A7B0C0] hover:text-[#F4F6FA] hover:bg-[#121722]'
                          }`}
                          title={`Reagir como Coach com ${r.label}`}
                        >
                          <span>{r.emoji}</span>
                          {count > 0 && <span className="text-[11px]">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenComments(post)}
                      className="flex items-center gap-1.5 text-xs font-mono text-[#F4F6FA] hover:border-[#3478F6]/40 transition-all cursor-pointer bg-[#1B2330] hover:bg-[#252D3B] px-3.5 py-2 min-h-[44px] rounded-xl border border-[#252D3B]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#75A7FF]" />
                      <span>{commentsCount}</span>
                    </button>

                    <Link href={`/dashboard/audit`}>
                      <button className="text-[11px] font-mono text-[#A7B0C0] hover:text-[#F4F6FA] transition-colors px-2.5 py-2 min-h-[44px] flex items-center">
                        [ Auditoria ]
                      </button>
                    </Link>
                  </div>
                </div>
              </SpotlightCard3D>
            );
          })}
        </div>
      )}

      {/* Modal / Gaveta de Comentários do Coach */}
      {activeCommentPost && (
        <div className="fixed inset-0 bg-[#080A0F]/85 backdrop-blur-md z-50 flex flex-col justify-end items-center">
          <div className="mono-glass-card w-full max-w-lg sm:max-w-xl mx-auto rounded-t-[32px] max-h-[85vh] flex flex-col p-5 border-t border-[#252D3B] bg-[#121722]">
            {/* Header do Sheet */}
            <div className="flex items-center justify-between pb-3 border-b border-[#252D3B]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#3478F6]/20 text-[#75A7FF] border border-[#3478F6]/30 text-[10px] font-mono font-bold tracking-widest uppercase">
                  COACH
                </span>
                <span className="font-bold text-xs text-[#F4F6FA] font-mono uppercase tracking-wider">
                  Feedback para {activeCommentPost.students?.full_name?.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                aria-label="Fechar comentários"
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-[#1B2330] border border-[#252D3B] text-[#A7B0C0] hover:text-[#F4F6FA] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lista de Comentários */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-[200px] max-h-[50vh]">
              {loadingComments ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#A7B0C0] text-xs font-mono">
                  <div className="h-4 w-4 border-2 border-[#3478F6] border-t-transparent rounded-full animate-spin" />
                  Carregando comentários...
                </div>
              ) : commentsList.length === 0 ? (
                <p className="text-center text-xs font-mono text-[#A7B0C0] py-10">
                  Nenhum comentário nesta foto ainda. Deixe um feedback ou elogio para o atleta!
                </p>
              ) : (
                commentsList.map((c) => {
                  const isMine = c.user_id === currentUser?.id;
                  const isCoach = c.user_role === 'coach';

                  return (
                    <div key={c.id} className="flex items-start gap-2.5 text-xs group">
                      <div className="h-7 w-7 rounded-full bg-[#1B2330] text-[#F4F6FA] font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 overflow-hidden border border-[#252D3B]">
                        {c.user_avatar ? (
                          <img src={c.user_avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          c.user_name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div className="flex-1 bg-[#1B2330] p-2.5 rounded-2xl border border-[#252D3B]">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#F4F6FA]">{c.user_name}</span>
                            {isCoach && (
                              <span className="px-1.5 py-0.2 rounded-full bg-[#3478F6]/20 text-[#75A7FF] border border-[#3478F6]/30 text-[9px] font-bold">
                                COACH
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-[#A7B0C0]">
                              {formatTimeAgo(c.created_at)}
                            </span>
                            {isMine && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#A7B0C0] hover:text-rose-400 p-0.5 cursor-pointer"
                                title="Excluir comentário"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[#F4F6FA] leading-relaxed font-sans">{c.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Chips de Elogio Rápido do Coach */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                {COACH_PRAISE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setCommentText(chip)}
                    className="text-[11px] font-sans font-medium px-3 py-1.5 min-h-[36px] rounded-full bg-[#1B2330] border border-[#252D3B] text-[#F4F6FA] hover:text-white hover:border-[#3478F6]/40 hover:bg-[#3478F6]/15 shrink-0 transition-all cursor-pointer active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input para envio de comentário */}
            <form onSubmit={handleSendComment} className="pt-2 flex items-center gap-2 border-t border-[#252D3B]">
              <Input
                type="text"
                placeholder="Escreva um feedback ou elogio do Coach..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="h-11 text-xs rounded-xl bg-[#1B2330] border-[#252D3B] text-[#F4F6FA] placeholder:text-[#A7B0C0]/60 focus:border-[#3478F6]"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="mono-button-primary px-4 h-11 min-h-[44px] text-xs font-mono flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
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
    </div>
  );
}
