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
import { CustomDialog } from '@/components/ui/custom-dialog';
import Link from 'next/link';
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

  // Modais Customizados & Feedback
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Carregar desafios exclusivos do treinador logado (Isolamento Multi-Tenant)
  useEffect(() => {
    async function loadChallenges() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('challenges')
        .select('id, title')
        .eq('professional_id', user.id)
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
    if (!selectedChallengeId) {
      showToast('Selecione uma turma antes de salvar materiais.');
      return;
    }
    if (!title.trim() || !fileUrl.trim()) {
      showToast('Preencha o título e o link do material.');
      return;
    }

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
        showToast('Material atualizado com sucesso!');
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
        showToast('Material publicado com sucesso!');
      }
    } catch (err: any) {
      showToast('Erro ao salvar material: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteMaterial = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('challenge_materials')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      setMaterials((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      if (editingMaterialId === deleteTarget.id) {
        handleCancelEdit();
      }
      showToast(`Material "${deleteTarget.title}" excluído.`);
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('Erro ao excluir material: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Materiais de Apoio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Compartilhe PDFs de treinos, cardápios e links de vídeos com controle total de edição e remoção.
          </p>
        </div>

        {challenges.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-zinc-400 font-mono">Turma:</span>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 flex-1 sm:flex-initial rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-bold text-white focus:outline-none focus:border-white/30 font-mono"
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

      {challenges.length === 0 && !loading && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 text-center space-y-2.5">
          <p className="text-sm font-bold text-white font-mono">NENHUMA TURMA ATIVA ENCONTRADA</p>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Você precisa criar uma turma antes de poder anexar PDFs, cardápios e vídeos de apoio.
          </p>
          <Link href="/dashboard/challenges/new">
            <Button size="sm" className="rounded-xl px-4 py-2 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200 mt-2">
              + Criar Primeiro Desafio
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário: Adicionar ou Editar */}
        <Card className="border-white/10 bg-zinc-900/50 h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-white font-bold tracking-tight">
                {isEditing ? <Edit3 className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
                {isEditing ? 'Editar Material' : 'Novo Material'}
              </CardTitle>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 text-xs text-zinc-400 hover:text-white">
                  <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                </Button>
              )}
            </div>
            <CardDescription className="text-xs text-zinc-400">
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
                  className="w-full h-9 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-white/30"
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
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 text-white text-xs p-3 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1 font-mono">
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

              <Button type="submit" className="w-full text-xs font-bold bg-white hover:bg-zinc-200 text-black shadow-md font-mono" disabled={submitting}>
                {submitting ? 'Salvando...' : isEditing ? 'Atualizar Material' : 'Publicar Material'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Materiais Cadastrados com Edição e Exclusão */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-white/10 bg-zinc-900/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white tracking-tight">Materiais Disponíveis na Turma</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  {materials.length} conteúdos liberados para os alunos deste desafio.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {materials.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhum material cadastrado ainda. Use o formulário ao lado para liberar conteúdos.
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {materials.map((m) => (
                    <div
                      key={m.id}
                      className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">
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
                          className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 font-semibold px-2 py-1 font-mono"
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
                          onClick={() => setDeleteTarget({ id: m.id, title: m.title })}
                          className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10 rounded"
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

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modal Customizado de Exclusão de Material */}
      <CustomDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir Material de Apoio"
        description={`Tem certeza de que deseja remover o material "${deleteTarget?.title}"? Os alunos não terão mais acesso a este arquivo ou vídeo.`}
        confirmLabel={deleting ? 'Removendo...' : 'Sim, Excluir Material'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteMaterial}
        isLoading={deleting}
      />
    </div>
  );
}
