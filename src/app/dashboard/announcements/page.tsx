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

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('id, title')
        .order('created_at', { ascending: false });

      const safeCh = challengesData || [];
      setChallenges(safeCh);

      const targetId = selectedChallengeId || (safeCh.length > 0 ? safeCh[0].id : '');
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
    if (!selectedChallengeId || !title.trim() || !content.trim()) return;

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
      } else {
        const { data, error } = await supabase
          .from('challenge_announcements')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setAnnouncements([data, ...announcements]);
        handleCancelEdit();
      }
    } catch (err: any) {
      alert('Erro ao salvar comunicado: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string, annTitle: string) => {
    if (!confirm(`Deseja remover o comunicado "${annTitle}"?`)) return;

    try {
      const { error } = await supabase
        .from('challenge_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAnnouncements(announcements.filter((a) => a.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err: any) {
      alert('Erro ao excluir aviso: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Mural de Avisos & Comunicados
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Publique mensagens oficiais diretamente na tela inicial do app dos alunos com suporte a fixação, edição e exclusão.
          </p>
        </div>

        {challenges.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 font-mono">Turma:</span>
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-bold text-white focus:outline-none focus:border-white/30 font-mono"
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
        {/* Formulário de Criação / Edição */}
        <Card className="border-white/10 bg-zinc-900/50 h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-white font-bold tracking-tight">
                {isEditing ? <Edit3 className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
                {isEditing ? 'Editar Comunicado' : 'Novo Comunicado'}
              </CardTitle>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 text-xs text-zinc-400 hover:text-white">
                  <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                </Button>
              )}
            </div>
            <CardDescription className="text-xs text-zinc-400">
              {isEditing ? 'Atualize o texto do aviso selecionado.' : 'Envie um lembrete de pesagem, live ou motivação da semana.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Título do Aviso</label>
                <Input
                  type="text"
                  placeholder="Ex: Live de Dúvidas hoje às 20h"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Mensagem do Comunicado</label>
                <textarea
                  rows={4}
                  placeholder="Escreva a mensagem para os alunos..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-white/10 text-white p-3 text-xs focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-300 py-1 font-mono">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded bg-zinc-950 border-white/20 text-white focus:ring-white"
                />
                <span className="flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5 text-white" /> Fixar no topo do app do aluno
                </span>
              </label>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-10 font-bold bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5 mt-2 font-mono"
              >
                {submitting ? 'Salvando...' : isEditing ? 'Atualizar Comunicado' : 'Publicar no Mural'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Comunicados Cadastrados */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-white/10 bg-zinc-900/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white tracking-tight">Avisos Ativos no App ({announcements.length})</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Estes comunicados são exibidos em tempo real para os alunos da turma.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {announcements.length === 0 && !loading ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhum comunicado publicado ainda. Use o formulário ao lado para falar com sua turma.
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        a.is_pinned
                          ? 'bg-zinc-900/90 border-white/20 shadow-md'
                          : 'bg-zinc-950/60 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {a.is_pinned && (
                            <Badge className="bg-white/10 text-white border-white/20 text-[9px] flex items-center gap-1 font-mono uppercase">
                              <Pin className="h-2.5 w-2.5" /> Fixado
                            </Badge>
                          )}
                          <h4 className="font-extrabold text-sm text-white">{a.title}</h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(a)}
                            className="h-7 w-7 text-zinc-400 hover:text-white"
                            title="Editar aviso"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAnnouncement(a.id, a.title)}
                            className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-white/10 rounded"
                            title="Excluir aviso"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{a.content}</p>

                      <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-zinc-500 font-mono">
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
    </div>
  );
}
