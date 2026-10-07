'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';

export default function StudentSocialFeedPage() {
  const supabase = createClient();

  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal de Comentários
  const [activeCommentPost, setActiveCommentPost] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: submissionsData } = await supabase
        .from('student_submissions')
        .select(`
          id,
          photo_url,
          caption,
          location_name,
          client_captured_at,
          submitted_at,
          student_id,
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
            student_id
          )
        `)
        .eq('status', 'approved')
        .order('submitted_at', { ascending: false });

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

  const handleToggleLike = async (postId: string, userLiked: boolean) => {
    if (!currentUser) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const currentLikes = p.submission_likes || [];
          if (userLiked) {
            return {
              ...p,
              submission_likes: currentLikes.filter((l: any) => l.student_id !== currentUser.id),
            };
          } else {
            return {
              ...p,
              submission_likes: [...currentLikes, { id: 'temp', student_id: currentUser.id }],
            };
          }
        }
        return p;
      })
    );

    try {
      if (userLiked) {
        await supabase
          .from('submission_likes')
          .delete()
          .eq('submission_id', postId)
          .eq('student_id', currentUser.id);
      } else {
        await supabase
          .from('submission_likes')
          .insert({
            submission_id: postId,
            student_id: currentUser.id,
          });
      }
    } catch (err) {
      console.error('Erro ao alternar like:', err);
    }
  };

  const handleOpenComments = async (post: any) => {
    setActiveCommentPost(post);
    setCommentText('');
    try {
      const { data: comments } = await supabase
        .from('submission_comments')
        .select(`
          id,
          content,
          created_at,
          students (
            full_name,
            avatar_url
          )
        `)
        .eq('submission_id', post.id)
        .order('created_at', { ascending: true });

      setCommentsList(comments || []);
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentPost || !currentUser) return;

    setSubmittingComment(true);
    try {
      const { data: newComment, error } = await supabase
        .from('submission_comments')
        .insert({
          submission_id: activeCommentPost.id,
          student_id: currentUser.id,
          content: commentText.trim(),
        })
        .select(`
          id,
          content,
          created_at,
          students (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (!error && newComment) {
        setCommentsList((prev) => [...prev, newComment]);
        setCommentText('');
      }
    } catch (err) {
      console.error('Erro ao postar comentário:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-28 relative">
      {/* Background 3D Animado */}
      <Monochrome3DBackground />

      {/* Header Monocromático */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
            LIVE_FEED_STREAM
          </span>
          <h1 className="text-xl font-black text-white">Comunidade & Feed</h1>
          <p className="text-[11px] text-zinc-400">Check-ins autenticados em tempo real com GPS e horário</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono relative z-10">
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          CARREGANDO STREAM...
        </div>
      ) : posts.length === 0 ? (
        <div className="mono-glass-card p-10 text-center text-xs font-mono text-zinc-500 relative z-10">
          Nenhuma publicação aprovada no momento. Os primeiros check-ins validados aparecerão aqui.
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {posts.map((post) => {
            const likes = post.submission_likes || [];
            const userLiked = likes.some((l: any) => l.student_id === currentUser?.id);

            return (
              <div
                key={post.id}
                className="mono-glass-card rounded-3xl overflow-hidden"
              >
                {/* Header do Post */}
                <div className="p-3.5 flex items-center justify-between border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-b from-white via-zinc-400 to-zinc-900 p-px shrink-0">
                      <div className="h-full w-full bg-black rounded-full flex items-center justify-center font-mono font-bold text-xs text-white overflow-hidden">
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
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
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

                  <span className="text-[10px] font-mono font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-md">
                    +{post.missions?.points_rewarded || 10} PTS
                  </span>
                </div>

                {/* Imagem do Post com Tag Flutuante */}
                <div className="relative aspect-square w-full bg-black overflow-hidden">
                  <img
                    src={post.photo_url}
                    alt="Foto da missão"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-white border border-white/15">
                    {post.missions?.title || 'Check-in Realizado'}
                  </div>
                </div>

                {/* Ações Sociais */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(post.id, userLiked)}
                      className={`flex items-center gap-1.5 text-xs font-mono font-bold transition-all ${
                        userLiked ? 'text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 ${userLiked ? 'fill-white text-white' : 'text-zinc-400'}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{likes.length}</span>
                    </button>

                    <button
                      onClick={() => handleOpenComments(post)}
                      className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-all"
                    >
                      <span>Comentários</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (!currentUser) return;
                        const confirmReport = confirm('Deseja sinalizar esta foto para auditoria por suspeita de fraude?');
                        if (!confirmReport) return;

                        const { error } = await supabase.from('submission_reports').insert({
                          submission_id: post.id,
                          reporter_student_id: currentUser.id,
                          reason: 'Denúncia de foto suspeita',
                        });

                        if (error && error.message.includes('unique')) {
                          alert('Você já sinalizou esta foto anteriormente.');
                        } else if (error) {
                          alert('Erro ao enviar sinalização: ' + error.message);
                        } else {
                          alert('Foto enviada para averiguação da comissão técnica.');
                        }
                      }}
                      className="ml-auto text-[10px] font-mono text-zinc-600 hover:text-white"
                      title="Sinalizar foto suspeita"
                    >
                      [ DENUNCIAR ]
                    </button>
                  </div>

                  {post.caption && (
                    <p className="text-xs text-zinc-300 font-sans">
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

      {/* Sheet de Comentários Monocromático */}
      {activeCommentPost && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-end max-w-md mx-auto">
          <div className="mono-glass-card rounded-t-[32px] max-h-[75vh] flex flex-col p-5 border-t border-white/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="font-bold text-xs text-white font-mono uppercase tracking-wider">
                COMENTÁRIOS DA FOTO
              </span>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="h-7 w-7 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-[160px]">
              {commentsList.length === 0 ? (
                <p className="text-center text-xs font-mono text-zinc-500 py-8">
                  Nenhum comentário ainda. Deixe seu apoio ao colega.
                </p>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 text-xs">
                    <div className="h-6 w-6 rounded-full bg-zinc-800 text-white font-mono font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5 overflow-hidden">
                      {c.students?.avatar_url ? (
                        <img
                          src={c.students.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        c.students?.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {c.students?.full_name || 'Colega'}:
                      </p>
                      <p className="text-zinc-300 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendComment} className="pt-3 flex items-center gap-2 border-t border-white/[0.08]">
              <Input
                type="text"
                placeholder="Escreva um comentário..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="h-10 text-xs rounded-xl bg-black border-white/15 text-white placeholder:text-zinc-600 focus:border-white/40"
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="mono-button-primary px-4 h-10 text-xs font-mono"
              >
                ENVIAR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
