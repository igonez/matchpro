'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Video,
  Utensils,
  ExternalLink,
  Download,
  Play,
  Search,
  Megaphone,
  Pin,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { StudentMenuTrigger } from '@/components/student/bottom-nav';

function StudentMaterialsContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [mainTab, setMainTab] = useState<'materiais' | 'avisos'>('materiais');
  const [activeChallenge, setActiveChallenge] = useState<any | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pdf' | 'video' | 'cardapio'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);

  useEffect(() => {
    if (tabParam === 'avisos') {
      setMainTab('avisos');
    } else if (tabParam === 'materiais') {
      setMainTab('materiais');
    }
  }, [tabParam]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let challengeId: string | null = null;
        let challengeObj: any = null;

        if (user) {
          let { data: part } = await supabase
            .from('challenge_participants')
            .select('challenge_id, challenges(id, title, start_date, end_date, is_active)')
            .eq('student_id', user.id)
            .in('payment_status', ['paid', 'complimentary'])
            .order('joined_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!part) {
            const { data: fallbackPart } = await supabase
              .from('challenge_participants')
              .select('challenge_id, challenges(id, title, start_date, end_date, is_active)')
              .eq('student_id', user.id)
              .order('joined_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            part = fallbackPart;
          }

          challengeObj = Array.isArray(part?.challenges) ? part?.challenges[0] : part?.challenges;
          challengeId = part?.challenge_id || challengeObj?.id || null;

          // Fallback para desafio ativo do treinador / ambiente
          if (!challengeId) {
            const { data: activeCh } = await supabase
              .from('challenges')
              .select('id, title, start_date, end_date, is_active')
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (activeCh) {
              challengeId = activeCh.id;
              challengeObj = activeCh;
            } else {
              const { data: latestCh } = await supabase
                .from('challenges')
                .select('id, title, start_date, end_date')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              if (latestCh) {
                challengeId = latestCh.id;
                challengeObj = latestCh;
              }
            }
          }
        }

        setActiveChallenge(challengeObj || null);

        if (!challengeId) {
          setMaterials([]);
          setAnnouncements([]);
          setLoading(false);
          return;
        }

        const [{ data: mats }, { data: anns }] = await Promise.all([
          supabase
            .from('challenge_materials')
            .select('*')
            .eq('challenge_id', challengeId)
            .order('created_at', { ascending: false }),
          supabase
            .from('challenge_announcements')
            .select('*')
            .eq('challenge_id', challengeId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false }),
        ]);

        setMaterials(mats || []);
        setAnnouncements(anns || []);
      } catch (err) {
        console.error('Erro ao carregar materiais e avisos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const filteredMaterials = materials.filter((m) => {
    const matchesType = filter === 'all' || m.type === filter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (m.title || '').toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const filteredAnnouncements = announcements.filter((a) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (a.title || '').toLowerCase().includes(q) ||
      (a.content || '').toLowerCase().includes(q)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-white" />;
      case 'cardapio':
        return <Utensils className="h-5 w-5 text-white" />;
      default:
        return <FileText className="h-5 w-5 text-white" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'video':
        return <Badge className="bg-white/10 text-white border-white/20 font-mono text-[10px] uppercase">Vídeo / Aula</Badge>;
      case 'cardapio':
        return <Badge className="bg-white/10 text-white border-white/20 font-mono text-[10px] uppercase">Cardápio & Dieta</Badge>;
      default:
        return <Badge className="bg-white/10 text-white border-white/20 font-mono text-[10px] uppercase">PDF & Guia</Badge>;
    }
  };

  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URL(url).searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
    } catch {
      return null;
    }
    return null;
  };

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 md:p-8 space-y-4 w-full pb-28 relative text-white">
      <Monochrome3DBackground />

      {/* Header */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div className="flex items-center gap-2.5">
          <StudentMenuTrigger />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
              {activeChallenge?.title ? `TURMA ATIVA • ${activeChallenge.title}` : 'CENTRAL DO ALUNO'}
            </span>
            <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
              Materiais & Avisos
            </h1>
          </div>
        </div>
        <Link
          href="/app"
          className="h-11 min-h-[44px] px-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          VOLTAR
        </Link>
      </div>

      {/* Seletor Principal: Arquivos vs Mural de Avisos */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-black border border-white/[0.08] relative z-10 font-mono">
        <button
          onClick={() => setMainTab('materiais')}
          className={`py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mainTab === 'materiais'
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Arquivos ({materials.length})
        </button>
        <button
          onClick={() => setMainTab('avisos')}
          className={`py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mainTab === 'avisos'
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Megaphone className="h-3.5 w-3.5" />
          Avisos ({announcements.length})
        </button>
      </div>

      {/* Barra de Busca Instantânea */}
      <div className="relative z-10">
        <Search className="h-4 w-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            mainTab === 'materiais'
              ? 'Buscar cardápio, treino, vídeo ou PDF...'
              : 'Buscar comunicados do treinador...'
          }
          className="w-full h-11 min-h-[44px] pl-10 pr-4 rounded-2xl bg-black/70 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 font-mono"
        />
      </div>

      {mainTab === 'materiais' ? (
        <>
          {/* Filtros em Abas de Materiais */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono relative z-10">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({materials.length})
            </button>
            <button
              onClick={() => setFilter('pdf')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'pdf'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              PDFs & Guias
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'video'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              Vídeos & Aulas
            </button>
            <button
              onClick={() => setFilter('cardapio')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'cardapio'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              Cardápios
            </button>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono relative z-10">
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              CARREGANDO MATERIAIS...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="mono-glass-card border-dashed border-white/10 p-10 rounded-3xl text-center relative z-10">
              <BookOpen className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-xs text-zinc-300">Nenhum material encontrado nesta seção</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Seu treinador adicionará novos arquivos, guias e vídeos ao longo do desafio.
              </p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="mono-glass-card p-4 rounded-2xl border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0">
                        {getTypeIcon(mat.type)}
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white">{mat.title}</h3>
                        {mat.description && (
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{mat.description}</p>
                        )}
                      </div>
                    </div>

                    <div>{getTypeBadge(mat.type)}</div>
                  </div>

                  {/* Botões de Ação (Visualizar no App / Abrir Externo) */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewMaterial(mat)}
                      className="h-11 min-h-[44px] px-3.5 text-xs font-mono font-bold border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                    >
                      Detalhes
                    </Button>
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial"
                    >
                      <Button size="sm" className="w-full h-11 min-h-[44px] px-4 text-xs font-bold bg-white hover:bg-zinc-200 text-black rounded-xl shadow-md">
                        {mat.type === 'video' ? (
                          <>
                            <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Assistir Aula
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5 mr-1.5" /> Abrir Arquivo
                          </>
                        )}
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ABA DE MURAL DE AVISOS DO TREINADOR */
        <div className="space-y-3 relative z-10">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              SINCRONIZANDO MURAL DE AVISOS...
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="mono-glass-card border-dashed border-white/10 p-10 rounded-3xl text-center">
              <Megaphone className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-xs text-zinc-300">Nenhum comunicado publicado ainda</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Avisos importantes e orientações semanais do seu treinador aparecerão aqui.
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={`mono-glass-card p-4 rounded-2xl border transition-all space-y-2 ${
                  ann.is_pinned
                    ? 'border-amber-400/35 bg-amber-500/[0.04]'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {ann.is_pinned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-400/30">
                        <Pin className="h-2.5 w-2.5" /> Fixado pelo Treinador
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-white/10 text-zinc-300">
                        <Megaphone className="h-2.5 w-2.5" /> Comunicado Oficial
                      </span>
                    )}
                  </div>
                  {ann.created_at && (
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ann.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-black text-white">{ann.title}</h3>
                <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Visualização de Material */}
      <CustomDialog
        isOpen={Boolean(previewMaterial)}
        onClose={() => setPreviewMaterial(null)}
        title={previewMaterial?.title || 'Detalhes do Material'}
      >
        {previewMaterial && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {getTypeBadge(previewMaterial.type)}
              {previewMaterial.created_at && (
                <span className="text-[10px] font-mono text-zinc-500">
                  Publicado em {new Date(previewMaterial.created_at).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            {previewMaterial.description && (
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                {previewMaterial.description}
              </p>
            )}

            {previewMaterial.type === 'video' && getEmbedVideoUrl(previewMaterial.file_url) && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                <iframe
                  src={getEmbedVideoUrl(previewMaterial.file_url) || ''}
                  title={previewMaterial.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <a
                href={previewMaterial.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold rounded-xl h-10">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Abrir em Nova Aba / Baixar
                </Button>
              </a>
            </div>
          </div>
        )}
      </CustomDialog>
    </div>
  );
}

export default function StudentMaterialsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
          <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          CARREGANDO CENTRAL DE MATERIAIS...
        </div>
      }
    >
      <StudentMaterialsContent />
    </Suspense>
  );
}
