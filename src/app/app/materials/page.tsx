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
  Sparkles 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function StudentMaterialsPage() {
  const supabase = createClient();

  const [materials, setMaterials] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pdf' | 'video' | 'cardapio'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaterials() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('challenge_materials')
          .select('*')
          .order('created_at', { ascending: false });

        setMaterials(data || []);
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
        return <Video className="h-5 w-5 text-rose-400" />;
      case 'cardapio':
        return <Utensils className="h-5 w-5 text-amber-400" />;
      default:
        return <FileText className="h-5 w-5 text-emerald-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'video':
        return <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30">Vídeo / Aula</Badge>;
      case 'cardapio':
        return <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">Cardápio & Dieta</Badge>;
      default:
        return <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">PDF & Guia</Badge>;
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4 bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            Materiais de Apoio <BookOpen className="h-5 w-5 text-emerald-400" />
          </h1>
          <p className="text-[11px] text-zinc-400">PDFs, treinos, vídeos e cardápios disponibilizados pelo treinador</p>
        </div>
      </div>

      {/* Filtros em Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Todos ({materials.length})
        </button>
        <button
          onClick={() => setFilter('pdf')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'pdf'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          📄 PDFs & E-books
        </button>
        <button
          onClick={() => setFilter('video')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'video'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          🎥 Vídeos & Aulas
        </button>
        <button
          onClick={() => setFilter('cardapio')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'cardapio'
              ? 'bg-emerald-500 text-black shadow-md'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          🥗 Cardápios
        </button>
      </div>

      {/* Lista de Materiais */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Carregando materiais de apoio...
        </div>
      ) : filteredMaterials.length === 0 ? (
        <Card className="border-dashed border-zinc-850 p-10 text-center bg-zinc-900/30">
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
              className="border-zinc-850 bg-zinc-900/70 p-4 rounded-2xl hover:border-zinc-750 transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
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
              <div className="pt-2 border-t border-zinc-850/80 flex justify-end">
                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="sm" className="w-full h-9 px-4 text-xs font-bold rounded-xl shadow-md">
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
