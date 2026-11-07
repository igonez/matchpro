'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit3, 
  Pin, 
  Sparkles, 
  X,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CustomDialog } from '@/components/ui/custom-dialog';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AnnouncementsManagerPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Form states (Criação e Edição)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modais Customizados & Feedback
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Buscar apenas turmas do treinador logado (Isolamento Multi-Tenant)
      const { data: challengesData, error: chErr } = await supabase
        .from('challenges')
        .select('id, title, start_date, end_date, is_active')
        .eq('professional_id', user.id)
        .order('is_active', { ascending: false })
        .order('start_date', { ascending: false });

      if (chErr) {
        console.error('Erro ao buscar desafios para o mural:', chErr);
      }

      const safeCh = challengesData || [];
      setChallenges(safeCh);

      const activeCh = safeCh.find((c: any) => c.is_active !== false) || safeCh[0];
      const targetId = selectedChallengeId || (activeCh ? activeCh.id : '');
      if (!selectedChallengeId && targetId) {
        setSelectedChallengeId(targetId);
      }

      if (targetId) {
        const { data: notices } = await supabase
          .from('challenge_announcements')
          .select('*')
          .eq('challenge_id', targetId)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        setAnnouncements(notices || []);
      }
    } catch (err) {
      console.error('Erro ao carregar avisos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedChallengeId]);

  const handleEditClick = (ann: any) => {
    setIsEditing(true);
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setIsPinned(ann.is_pinned ?? false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId) {
      showToast('Selecione uma turma antes de publicar um comunicado.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      showToast('Preencha o título e a mensagem do comunicado.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        challenge_id: selectedChallengeId,
        title: title.trim(),
        content: content.trim(),
        is_pinned: isPinned,
      };

      if (isEditing && editingId) {
        const { error } = await supabase
          .from('challenge_announcements')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        setAnnouncements(announcements.map((a) => (a.id === editingId ? { ...a, ...payload } : a)));
        handleCancelEdit();
        showToast('Comunicado atualizado com sucesso!');
      } else {
        const { data, error } = await supabase
          .from('challenge_announcements')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setAnnouncements([data, ...announcements]);
        handleCancelEdit();
        showToast('Comunicado publicado no mural com sucesso!');
      }
    } catch (err: any) {
      showToast('Erro ao salvar comunicado: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteAnnouncement = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('challenge_announcements')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;
      setAnnouncements(announcements.filter((a) => a.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) {
        handleCancelEdit();
      }
      showToast(`Aviso "${deleteTarget.title}" excluído.`);
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('Erro ao excluir aviso: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#F4F6FA] tracking-tight flex items-center gap-2">
            Mural de Avisos & Comunicados
          </h1>
          <p className="text-xs text-[#A7B0C0] mt-1">
            Publique mensagens oficiais diretamente na tela inicial do app dos alunos com suporte a fixação, edição e exclusão.
          </p>
        </div>

        {challenges.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#A7B0C0] font-mono">Desafio Ativo:</span>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl border border-[#252D3B] bg-[#1B2330] px-3 text-xs font-bold text-[#F4F6FA] focus:outline-none focus:border-[#3478F6] font-mono"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.is_active !== false ? '• (Ativo)' : '• (Encerrado)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedChallengeId && challenges.length > 0 && (() => {
        const currentCh = challenges.find((c) => c.id === selectedChallengeId);
        if (!currentCh) return null;
        return (
          <div className="p-4 rounded-2xl bg-[#121722] border border-[#252D3B] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${currentCh.is_active !== false ? 'bg-[#3478F6] animate-pulse shadow-[0_0_8px_#3478F6]' : 'bg-[#A7B0C0]'}`} />
              <div>
                <p className="text-xs font-bold text-[#F4F6FA] flex items-center gap-2">
                  <span>Turma Conectada: {currentCh.title}</span>
                  <Badge className={currentCh.is_active !== false ? 'text-[10px] font-mono' : 'bg-[#1B2330] text-[#A7B0C0] border-[#252D3B] text-[10px] font-mono'}>
                    {currentCh.is_active !== false ? 'DESAFIO ATIVO' : 'ENCERRADO'}
                  </Badge>
                </p>
                {currentCh.start_date && (
                  <p className="text-[11px] text-[#A7B0C0] font-mono mt-0.5">
                    Período: {new Date(currentCh.start_date + 'T00:00:00').toLocaleDateString('pt-BR')} até {currentCh.end_date ? new Date(currentCh.end_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Contínuo'}
                  </p>
                )}
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#A7B0C0]">
              {announcements.length} {announcements.length === 1 ? 'comunicado publicado' : 'comunicados publicados'}
            </span>
          </div>
        );
      })()}

      {challenges.length === 0 && !loading && (
        <div className="p-6 rounded-2xl bg-[#121722] border border-[#252D3B] text-center space-y-2.5">
          <p className="text-sm font-bold text-[#F4F6FA] font-mono">NENHUMA TURMA ATIVA ENCONTRADA</p>
          <p className="text-xs text-[#A7B0C0] max-w-md mx-auto">
            Você precisa criar uma turma antes de poder publicar comunicados no mural de alunos.
          </p>
          <Link href="/dashboard/challenges/new">
            <Button size="sm" className="rounded-xl px-4 py-2 text-xs font-mono font-bold mt-2">
              + Criar Primeiro Desafio
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Criação / Edição */}
        <Card className="border-[#252D3B] bg-[#121722] h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-[#F4F6FA] font-bold tracking-tight">
                {isEditing ? <Edit3 className="h-4 w-4 text-[#3478F6]" /> : <Plus className="h-4 w-4 text-[#3478F6]" />}
                {isEditing ? 'Editar Comunicado' : 'Novo Comunicado'}
              </CardTitle>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 text-xs">
                  <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                </Button>
              )}
            </div>
            <CardDescription className="text-xs text-[#A7B0C0]">
              {isEditing ? 'Atualize o texto do aviso selecionado.' : 'Envie um lembrete de pesagem, live ou motivação da semana.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#A7B0C0] font-semibold block mb-1">Título do Aviso</label>
                <Input
                  type="text"
                  placeholder="Ex: Live de Dúvidas hoje às 20h"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[#A7B0C0] font-semibold block mb-1">Mensagem do Comunicado</label>
                <textarea
                  rows={4}
                  placeholder="Escreva a mensagem para os alunos..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl bg-[#1B2330] border border-[#252D3B] text-[#F4F6FA] placeholder:text-[#A7B0C0]/60 p-3 text-xs focus:outline-none focus:border-[#3478F6]"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#F4F6FA] py-1 font-mono">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded bg-[#1B2330] border-[#252D3B] text-[#3478F6] focus:ring-[#3478F6]"
                />
                <span className="flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5 text-[#3478F6]" /> Fixar no topo do app do aluno
                </span>
              </label>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-10 font-bold mt-2 font-mono"
              >
                {submitting ? 'Salvando...' : isEditing ? 'Atualizar Comunicado' : 'Publicar no Mural'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Comunicados Cadastrados */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-[#252D3B] bg-[#121722]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-[#F4F6FA] tracking-tight">Avisos Ativos no App ({announcements.length})</CardTitle>
                <CardDescription className="text-xs text-[#A7B0C0]">
                  Estes comunicados são exibidos em tempo real para os alunos da turma.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {announcements.length === 0 && !loading ? (
                <div className="text-center py-12 text-[#A7B0C0] text-xs">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-[#75A7FF] opacity-60" />
                  Nenhum comunicado publicado ainda. Use o formulário ao lado para falar com sua turma.
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        a.is_pinned
                          ? 'bg-[#1B2330] border-[#3478F6]/40 shadow-md'
                          : 'bg-[#1B2330]/55 border-[#252D3B]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {a.is_pinned && (
                            <Badge className="text-[9px] flex items-center gap-1 font-mono uppercase">
                              <Pin className="h-2.5 w-2.5" /> Fixado
                            </Badge>
                          )}
                          <h4 className="font-extrabold text-sm text-[#F4F6FA]">{a.title}</h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(a)}
                            className="h-7 w-7"
                            title="Editar aviso"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget({ id: a.id, title: a.title })}
                            className="h-7 w-7 text-[#A7B0C0] hover:text-rose-400 hover:bg-rose-500/10 rounded"
                            title="Excluir aviso"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-[#F4F6FA] leading-relaxed whitespace-pre-wrap">{a.content}</p>

                      <div className="mt-3 pt-2 border-t border-[#252D3B] text-[10px] text-[#A7B0C0] font-mono">
                        Publicado em {new Date(a.created_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(a.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-[#252D3B] bg-[#121722] shadow-2xl flex items-center gap-2.5 text-xs font-mono text-[#F4F6FA]">
            <span className="h-2 w-2 rounded-full bg-[#3478F6] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modal Customizado de Exclusão de Aviso */}
      <CustomDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remover Comunicado do Mural"
        description={`Tem certeza de que deseja excluir o aviso "${deleteTarget?.title}"? Ele deixará de ser exibido imediatamente no feed de todos os alunos.`}
        confirmLabel={deleting ? 'Removendo...' : 'Sim, Excluir Aviso'}
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDeleteAnnouncement}
        isLoading={deleting}
      />
    </div>
  );
}
