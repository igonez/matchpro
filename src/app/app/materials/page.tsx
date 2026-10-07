'use client';

import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Utensils, 
  ExternalLink, 
  Download, 
  Play, 
  Search, 
  Sparkles,
  Building2,
  Tag
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function StudentMaterialsPage() {
  const supabase = createClient();

  const [materials, setMaterials] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pdf' | 'video' | 'cardapio' | 'parceiros'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaterials() {
      setLoading(true);
      try {
        const { data: mats } = await supabase
          .from('challenge_materials')
          .select('*')
          .order('created_at', { ascending: false });

        setMaterials(mats || []);

        const { data: sps } = await supabase
          .from('challenge_sponsors')
          .select('*')
          .order('created_at', { ascending: false });

        setSponsors(sps || []);
      } catch (err) {
        console.error('Erro ao carregar materiais:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMaterials();
  }, [supabase]);

  const filteredMaterials = materials.filter((m) => {
    if (filter === 'all') return true;
    return m.type === filter;
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

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            Materiais de Apoio <BookOpen className="h-5 w-5 text-zinc-400" />
          </h1>
          <p className="text-[11px] text-zinc-400">PDFs, treinos, vídeos e cardápios disponibilizados pelo treinador</p>
        </div>
      </div>

      {/* Filtros em Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Todos ({materials.length})
        </button>
        <button
          onClick={() => setFilter('pdf')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'pdf'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          PDFs & E-books
        </button>
        <button
          onClick={() => setFilter('video')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'video'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Vídeos & Aulas
        </button>
        <button
          onClick={() => setFilter('cardapio')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'cardapio'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Cardápios
        </button>
        <button
          onClick={() => setFilter('parceiros')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'parceiros'
              ? 'bg-white text-black shadow-md'
              : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
          }`}
        >
          Parceiros & Cupons ({sponsors.length})
        </button>
      </div>

      {/* SEÇÃO DE PATROCINADORES / CUPONS */}
      {filter === 'parceiros' ? (
        <div className="space-y-3">
          {sponsors.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl">
              Nenhum parceiro ou cupom cadastrado para esta turma ainda.
            </div>
          ) : (
            sponsors.map((sp) => (
              <Card
                key={sp.id}
                className="border-white/15 bg-zinc-900/60 p-4 rounded-2xl space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-zinc-400 font-mono tracking-wider">
                      Parceiro Oficial
                    </span>
                    <h3 className="font-black text-base text-white mt-0.5">{sp.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {sp.discount_description}
                    </p>
                  </div>
                  {sp.discount_code && (
                    <div className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs font-bold">
                      {sp.discount_code}
                    </div>
                  )}
                </div>

                {sp.whatsapp_or_link && (
                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <a
                      href={sp.whatsapp_or_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button size="sm" className="w-full h-8 text-xs font-bold bg-white hover:bg-zinc-200 text-black rounded-xl">
                        Aproveitar Desconto →
                      </Button>
                    </a>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      ) : loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
          <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Carregando materiais de apoio...
        </div>
      ) : filteredMaterials.length === 0 ? (
        <Card className="border-dashed border-white/10 p-10 text-center bg-zinc-900/30">
          <BookOpen className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
          <p className="font-semibold text-xs text-zinc-300">Nenhum material cadastrado nesta seção</p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Seu treinador adicionará novos arquivos, guias e vídeos ao longo do desafio.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMaterials.map((mat) => (
            <Card
              key={mat.id}
              className="border-white/10 bg-zinc-900/50 p-4 rounded-2xl hover:border-white/25 transition-all flex flex-col justify-between gap-3"
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

              {/* Botão de Ação (Acessar / Assistir / Download) */}
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="sm" className="w-full h-9 px-4 text-xs font-bold bg-white hover:bg-zinc-200 text-black rounded-xl shadow-md">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
