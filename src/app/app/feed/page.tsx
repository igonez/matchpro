'use client';

import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  Sparkles, 
  Send, 
  Flame, 
  User,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

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

  // Carregar Feed
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Buscar fotos aprovadas no desafio com likes e dados do aluno
      const { data: submissionsData } = await supabase
        .from('student_submissions')
        .select(`
          id,
          photo_url,
          caption,
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

  // Curtir / Descurtir
  const handleToggleLike = async (postId: string, userLiked: boolean) => {
    if (!currentUser) return;

    // Atualização otimista na tela
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

  // Abrir modal de comentários
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

  // Enviar novo comentário
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
    <div className="flex flex-col flex-1 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            Feed da Turma <Flame className="h-5 w-5 text-orange-400" />
          </h1>
          <p className="text-[11px] text-zinc-400">Fotos de refeições e treinos aprovadas pelo treinador</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Carregando publicações da turma...
        </div>
      ) : posts.length === 0 ? (
        <Card className="border-dashed border-zinc-850 p-10 text-center bg-zinc-900/30">
          <Flame className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
          <p className="font-semibold text-xs text-zinc-300">Nenhuma foto postada no feed ainda</p>
          <p className="text-[11px] text-zinc-500 mt-1">
            As primeiras fotos aprovadas na auditoria aparecerão aqui para a turma interagir!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const likes = post.submission_likes || [];
            const userLiked = likes.some((l: any) => l.student_id === currentUser?.id);

            return (
              <Card
                key={post.id}
                className="border-zinc-850 bg-zinc-900/70 overflow-hidden rounded-3xl shadow-xl"
              >
                {/* Header do Post */}
                <div className="p-3.5 flex items-center justify-between border-b border-zinc-850/60">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
                      <div className="h-full w-full bg-zinc-950 rounded-full flex items-center justify-center font-bold text-xs text-white">
                        {post.students?.full_name?.charAt(0) || 'A'}
                      </div>
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-white">
                        {post.students?.full_name || 'Atleta'}
                      </p>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(post.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <Badge variant="success" className="text-[10px] font-black px-2.5 py-0.5">
                    +{post.missions?.points_rewarded || 10} pts
                  </Badge>
                </div>

                {/* Imagem do Post */}
                <div className="relative aspect-square w-full bg-black overflow-hidden">
                  <img
                    src={post.photo_url}
                    alt="Foto da missão"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-zinc-200 border border-white/10">
                    🎯 {post.missions?.title || 'Missão do Dia'}
                  </div>
                </div>

                {/* Ações Sociais (Like e Comentários) */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(post.id, userLiked)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-125 ${
                        userLiked ? 'text-rose-500' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${userLiked ? 'fill-rose-500' : ''}`} />
                      <span>{likes.length}</span>
                    </button>

                    <button
                      onClick={() => handleOpenComments(post)}
                      className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-all"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Comentar</span>
                    </button>
                  </div>

                  {/* Legenda opcional */}
                  {post.caption && (
                    <p className="text-xs text-zinc-300">
                      <span className="font-extrabold text-white mr-1.5">
                        {post.students?.full_name?.split(' ')[0]}:
                      </span>
                      {post.caption}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal / Bottom Sheet de Comentários */}
      {activeCommentPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end max-w-md mx-auto">
          <div className="bg-zinc-950 border-t border-zinc-800 rounded-t-3xl max-h-[75vh] flex flex-col p-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
              <h3 className="font-extrabold text-sm text-white">Comentários da Foto</h3>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lista de Comentários */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-[150px]">
              {commentsList.length === 0 ? (
                <p className="text-center text-xs text-zinc-500 py-6">
                  Seja o primeiro a incentivar seu colega de turma! 👏
                </p>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 text-xs">
                    <div className="h-7 w-7 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {c.students?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-200">
                        {c.students?.full_name || 'Colega'}:
                      </p>
                      <p className="text-zinc-300 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input de Envio */}
            <form onSubmit={handleSendComment} className="pt-2 flex items-center gap-2 border-t border-zinc-850">
              <Input
                type="text"
                placeholder="Escreva um elogio ou incentivo..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl" disabled={submittingComment}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
