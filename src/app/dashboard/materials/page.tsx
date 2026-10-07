'use client';

import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3,
  FileText, 
  Video, 
  Utensils, 
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function DashboardMaterialsPage() {
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (Criação ou Edição)
  const [isEditing, setIsEditing] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'pdf' | 'video' | 'cardapio' | 'link'>('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Carregar desafios
  useEffect(() => {
    async function loadChallenges() {
      const { data } = await supabase
        .from('challenges')
        .select('id, title')
        .order('start_date', { ascending: false });

      if (data && data.length > 0) {
        setChallenges(data);
        setSelectedChallengeId(data[0].id);
      }
      setLoading(false);
    }
    loadChallenges();
  }, [supabase]);

  // 2. Carregar materiais do desafio selecionado
  const fetchMaterials = async (challengeId: string) => {
    const { data } = await supabase
      .from('challenge_materials')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false });

    setMaterials(data || []);
  };

  useEffect(() => {
    if (selectedChallengeId) {
      fetchMaterials(selectedChallengeId);
    }
  }, [selectedChallengeId]);

  // Abrir modo de edição
  const handleEditClick = (mat: any) => {
    setIsEditing(true);
    setEditingMaterialId(mat.id);
    setTitle(mat.title);
    setDescription(mat.description || '');
    setType(mat.type);
    setFileUrl(mat.file_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingMaterialId(null);
    setTitle('');
    setDescription('');
    setFileUrl('');
  };

  // Cadastrar ou Atualizar material
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId) return;

    setSubmitting(true);
    try {
      const payload = {
        challenge_id: selectedChallengeId,
        title: title.trim(),
        description: description.trim() || null,
        type,
        file_url: fileUrl.trim(),
      };

      if (isEditing && editingMaterialId) {
        // Update
        const { error } = await supabase
          .from('challenge_materials')
          .update(payload)
          .eq('id', editingMaterialId);

        if (error) throw error;
        setMaterials((prev) =>
          prev.map((m) => (m.id === editingMaterialId ? { ...m, ...payload } : m))
        );
        handleCancelEdit();
      } else {
        // Insert
        const { data, error } = await supabase
          .from('challenge_materials')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setMaterials((prev) => [data, ...prev]);
        setTitle('');
        setDescription('');
        setFileUrl('');
      }
    } catch (err: any) {
      alert('Erro ao salvar material: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Excluir material com confirmação
  const handleDeleteMaterial = async (id: string, matTitle: string) => {
    if (!confirm(`Tem certeza de que deseja excluir o material "${matTitle}"?`)) return;

    try {
      const { error } = await supabase
        .from('challenge_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMaterials((prev) => prev.filter((m) => m.id !== id));
      if (editingMaterialId === id) {
        handleCancelEdit();
      }
    } catch (err: any) {
      alert('Erro ao excluir material: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Materiais de Apoio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Compartilhe PDFs de treinos, cardápios e links de vídeos com controle total de edição e remoção.
          </p>
        </div>

        {challenges.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Turma:</span>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário: Adicionar ou Editar */}
        <Card className="border-zinc-800 bg-zinc-900/40 h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-white font-bold">
                {isEditing ? <Edit3 className="h-4 w-4 text-amber-400" /> : <Plus className="h-4 w-4 text-emerald-400" />}
                {isEditing ? 'Editar Material' : 'Novo Material'}
              </CardTitle>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 text-xs text-zinc-400">
                  <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                </Button>
              )}
            </div>
            <CardDescription className="text-xs">
              {isEditing ? 'Atualize as informações do arquivo ou link.' : 'Adicione apostilas, cardápios ou orientações em vídeo.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Título do Material
                </label>
                <Input
                  placeholder="Ex: Guia Alimentar Fase 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Tipo de Conteúdo
                </label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs px-3 focus:outline-none focus:border-emerald-500"
                >
                  <option value="pdf">Documento PDF</option>
                  <option value="cardapio">Cardápio Nutricional</option>
                  <option value="video">Vídeo Explicativo</option>
                  <option value="link">Link Externo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Descrição Rápida (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções para o aluno..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs p-3 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Link do Arquivo ou Vídeo (URL)
                </label>
                <Input
                  type="url"
                  placeholder="https://... (Google Drive, YouTube, etc.)"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full text-xs font-bold" disabled={submitting}>
                {submitting ? 'Salvando...' : isEditing ? 'Atualizar Material' : 'Publicar Material'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Materiais Cadastrados com Edição e Exclusão */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white">Materiais Disponíveis na Turma</CardTitle>
                <CardDescription className="text-xs">
                  {materials.length} conteúdos liberados para os alunos deste desafio.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {materials.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhum material cadastrado ainda. Use o formulário ao lado para liberar conteúdos!
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/80">
                  {materials.map((m) => (
                    <div
                      key={m.id}
                      className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {m.type === 'video' ? <Video className="h-4 w-4" /> : m.type === 'cardapio' ? <Utensils className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-100">{m.title}</p>
                          {m.description && <p className="text-[11px] text-zinc-400">{m.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold px-2 py-1"
                        >
                          Acessar <ExternalLink className="h-3 w-3" />
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(m)}
                          className="h-8 px-2 text-xs text-zinc-400 hover:text-white"
                          title="Editar material"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMaterial(m.id, m.title)}
                          className="h-8 w-8 text-zinc-500 hover:text-rose-400"
                          title="Excluir material"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
