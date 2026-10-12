'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Flame, 
  Filter, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';

export default function DashboardFeedPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('all');
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
              student_id
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

  const handleToggleLike = async (postId: string) => {
    if (!currentUser) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const currentLikes = p.submission_likes || [];
          const coachLiked = currentLikes.some((l: any) => l.student_id === currentUser.id);
          if (coachLiked) {
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
      const { data: existing } = await supabase
        .from('submission_likes')
        .select('id')
        .eq('submission_id', postId)
        .eq('student_id', currentUser.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('submission_likes').delete().eq('id', existing.id);
      } else {
        await supabase.from('submission_likes').insert({
          submission_id: postId,
          student_id: currentUser.id,
        });
      }
    } catch (e) {
      console.warn('Erro ao curtir postagem:', e);
    }
  };

  return (
    <div className="space-y-6 relative pb-16">
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Comunidade
            </span>
            <span className="text-xs text-zinc-400 font-medium">Feed em Tempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Feed das Turmas
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Acompanhe as fotos de treino, refeições e conquistas dos seus atletas com interação ao vivo.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {challenges.length > 0 && (
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-white/30"
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
            <button className="mono-button-secondary h-10 px-4 text-xs font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Auditoria Swipe →</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono relative z-10">
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          CARREGANDO FEED DA COMUNIDADE...
        </div>
      ) : posts.length === 0 ? (
        <div className="mono-glass-card p-12 text-center text-xs font-mono text-zinc-500 relative z-10">
          Nenhuma postagem realizada ainda nesta turma.
        </div>
      ) : (
        <div className="max-w-xl mx-auto space-y-4 relative z-10">
          {posts.map((post) => {
            const isLikedByCoach = (post.submission_likes || []).some(
              (l: any) => l.student_id === currentUser?.id
            );
            const likesCount = (post.submission_likes || []).length;

            return (
              <SpotlightCard3D key={post.id} className="p-4 sm:p-5 space-y-3.5">
                {/* Header do Post */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white overflow-hidden">
                      {post.students?.avatar_url ? (
                        <img src={post.students.avatar_url} alt="aluno" className="w-full h-full object-cover" />
                      ) : (
                        post.students?.full_name?.charAt(0) || 'A'
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {post.students?.full_name || 'Atleta Arena'}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {new Date(post.submitted_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(post.submitted_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                    +{post.missions?.points_rewarded || 10} PTS
                  </span>
                </div>

                {/* Imagem do Check-in */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-white/10">
                  <img src={post.photo_url} alt="Check-in" className="w-full h-full object-cover" />

                  {/* Tag de Missão */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white">
                    {post.missions?.title}
                  </div>
                </div>

                {/* Informações de Treino e Legenda */}
                <div className="space-y-1.5 text-xs text-zinc-300">
                  {post.duration_seconds && (
                    <p className="text-white font-mono text-[11px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md w-fit">
                      ⏱ Duração: {Math.floor(post.duration_seconds / 60)}min {post.duration_seconds % 60}s
                    </p>
                  )}

                  {post.caption && (
                    <p className="text-zinc-200 italic font-sans pt-0.5">
                      "{post.caption}"
                    </p>
                  )}

                  {post.location_name && (
                    <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{post.location_name}</span>
                    </p>
                  )}
                </div>

                {/* Ações do Treinador */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                      isLikedByCoach
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-zinc-400 hover:text-white bg-white/5 border border-white/10'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isLikedByCoach ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span>{likesCount} {likesCount === 1 ? 'curtida' : 'curtidas'}</span>
                  </button>

                  <Link href={`/dashboard/audit`}>
                    <button className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
                      [ Ver na Auditoria ]
                    </button>
                  </Link>
                </div>
              </SpotlightCard3D>
            );
          })}
        </div>
      )}
    </div>
  );
}
