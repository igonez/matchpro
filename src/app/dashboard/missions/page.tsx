'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Edit3,
  Dumbbell, 
  Flame, 
  Utensils, 
  Sparkles, 
  Lock, 
  Clock, 
  CheckCircle2, 
  X, 
  Calendar, 
  Layers, 
  HelpCircle,
  Copy,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { createClient } from '@/lib/supabase/client';

function MissionsManagerContent() {
  const searchParams = useSearchParams();
  const challengeIdParam = searchParams.get('challengeId');
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challengeIdParam || '');
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Category Tab: treinos | cardios | refeicoes | bonus
  const [activeTab, setActiveTab] = useState<'treinos' | 'cardios' | 'refeicoes' | 'bonus'>('treinos');

  // Modal para Criar / Editar Missão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<any | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'treino' | 'cardio' | 'refeicao' | 'habito' | 'outro'>('treino');
  const [formPoints, setFormPoints] = useState('10');
  const [formRequiresCooldown, setFormRequiresCooldown] = useState(false);
  const [formCooldownHours, setFormCooldownHours] = useState('4');
  const [formIsBonus, setFormIsBonus] = useState(false);
  const [submittingMission, setSubmittingMission] = useState(false);

  // Modais de Confirmação & Toasts (Substituem alert e confirm nativos)
  const [deleteMissionTarget, setDeleteMissionTarget] = useState<{ id: string; title: string } | null>(null);
  const [deletingMission, setDeletingMission] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Carregar lista de desafios exclusivos do profissional (Isolamento Multi-Tenant)
  useEffect(() => {
    async function fetchChallenges() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('challenges')
        .select('id, title, start_date, end_date')
        .eq('professional_id', user.id)
        .order('start_date', { ascending: false });

      if (data && data.length > 0) {
        setChallenges(data);
        if (!selectedChallengeId) {
          setSelectedChallengeId(data[0].id);
        }
      }
      setLoading(false);
    }
    fetchChallenges();
  }, [supabase]);

  // 2. Carregar semanas do desafio selecionado
  const fetchWeeks = async (challengeId: string) => {
    const { data } = await supabase
      .from('challenge_weeks')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('week_number', { ascending: true });

    setWeeks(data || []);
    if (data && data.length > 0) {
      setSelectedWeekId(data[0].id);
    } else {
      setSelectedWeekId('');
      setMissions([]);
    }
  };

  useEffect(() => {
    if (selectedChallengeId) {
      fetchWeeks(selectedChallengeId);
    }
  }, [selectedChallengeId]);

  // 3. Carregar missões da semana selecionada
  const fetchMissions = async (weekId: string) => {
    if (!weekId) return;
    const { data } = await supabase
      .from('missions')
      .select('*')
      .eq('week_id', weekId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    setMissions(data || []);
  };

  useEffect(() => {
    if (selectedWeekId) {
      fetchMissions(selectedWeekId);
    }
  }, [selectedWeekId]);

  // Abrir Modal para Criar Missão
  const handleOpenCreateModal = (catDefault: 'treino' | 'cardio' | 'refeicao' | 'habito') => {
    setEditingMission(null);
    setFormTitle('');
    setFormCategory(catDefault);
    setFormPoints('10');
    setFormRequiresCooldown(catDefault === 'treino' || catDefault === 'cardio');
    setFormCooldownHours('4');
    setFormIsBonus(activeTab === 'bonus');
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar Missão
  const handleOpenEditModal = (mission: any) => {
    setEditingMission(mission);
    setFormTitle(mission.title);
    setFormCategory(mission.category || 'treino');
    setFormPoints(mission.points_rewarded?.toString() || '10');
    setFormRequiresCooldown(mission.requires_cooldown ?? false);
    setFormCooldownHours(mission.cooldown_hours?.toString() || '4');
    setFormIsBonus(mission.is_bonus ?? false);
    setIsModalOpen(true);
  };

  // Salvar (Insert ou Update)
  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !selectedWeekId || !formTitle.trim()) return;

    setSubmittingMission(true);
    try {
      const payload: any = {
        challenge_id: selectedChallengeId,
        week_id: selectedWeekId,
        title: formTitle.trim(),
        category: formCategory,
        points_rewarded: parseInt(formPoints, 10) || 10,
        requires_cooldown: formRequiresCooldown,
        cooldown_hours: parseInt(formCooldownHours, 10) || 4,
        is_bonus: formIsBonus,
      };

      if (editingMission) {
        // Atualizar
        const { error } = await supabase
          .from('missions')
          .update(payload)
          .eq('id', editingMission.id);

        if (error) throw error;
        setMissions((prev) => prev.map((m) => (m.id === editingMission.id ? { ...m, ...payload } : m)));
      } else {
        // Inserir
        payload.order_index = missions.length + 1;
        const { data, error } = await supabase
          .from('missions')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setMissions((prev) => [...prev, data]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert('Erro ao salvar missão: ' + err.message);
    } finally {
      setSubmittingMission(false);
    }
  };

  // Excluir Missão com Confirmação via CustomDialog
  const handleConfirmDeleteMission = async () => {
    if (!deleteMissionTarget) return;
    setDeletingMission(true);
    try {
      const { error } = await supabase.from('missions').delete().eq('id', deleteMissionTarget.id);
      if (error) throw error;
      setMissions((prev) => prev.filter((m) => m.id !== deleteMissionTarget.id));
      showToast(`Missão "${deleteMissionTarget.title}" excluída com sucesso.`);
      setDeleteMissionTarget(null);
    } catch (err: any) {
      showToast('Erro ao excluir missão: ' + err.message);
    } finally {
      setDeletingMission(false);
    }
  };

  // Gerador Inteligente de 4 Semanas (6 Treinos, 7 Cardios, 4 Refeições Diárias)
  const handleExecuteGenerateTemplate = async () => {
    if (!selectedChallengeId) return;

    setGeneratingTemplate(true);
    try {
      // 1. Criar as 4 semanas (ou buscar se já existirem)
      for (let i = 1; i <= 4; i++) {
        let weekId: string | null = null;

        // Tentar buscar se a semana já existe
        const { data: existingWeek } = await supabase
          .from('challenge_weeks')
          .select('id')
          .eq('challenge_id', selectedChallengeId)
          .eq('week_number', i)
          .maybeSingle();

        if (existingWeek) {
          weekId = existingWeek.id;
        } else {
          const { data: weekData, error: weekErr } = await supabase
            .from('challenge_weeks')
            .insert({
              challenge_id: selectedChallengeId,
              week_number: i,
              title: `Semana ${i} • Sprint ${i}`,
              bonus_points: 20, // +20 XP de Bônus de 100%
            })
            .select()
            .single();

          if (weekErr) throw weekErr;
          weekId = weekData.id;
        }

        if (!weekId) continue;

        // 2. Gerar as missões segmentadas para cada semana
        const templateMissions: any[] = [];

        // 6 Treinos da semana
        for (let t = 1; t <= 6; t++) {
          templateMissions.push({
            challenge_id: selectedChallengeId,
            week_id: weekId,
            title: `Treino #${t} da Semana`,
            category: 'treino',
            points_rewarded: 15,
            requires_cooldown: true,
            cooldown_hours: 4,
            order_index: t,
            is_bonus: false,
          });
        }

        // 7 Cardios da semana
        for (let c = 1; c <= 7; c++) {
          templateMissions.push({
            challenge_id: selectedChallengeId,
            week_id: weekId,
            title: `Cardio #${c} (Mín. 30min)`,
            category: 'cardio',
            points_rewarded: 10,
            requires_cooldown: true,
            cooldown_hours: 4,
            order_index: c,
            is_bonus: false,
          });
        }

        // 4 Refeições diárias
        const mealNames = ['Café da Manhã Limpo', 'Almoço Balanceado', 'Lanche da Tarde', 'Jantar & Ceia'];
        mealNames.forEach((meal, idx) => {
          templateMissions.push({
            challenge_id: selectedChallengeId,
            week_id: weekId,
            title: meal,
            category: 'refeicao',
            points_rewarded: 10,
            requires_cooldown: false,
            order_index: idx + 1,
            is_bonus: false,
          });
        });

        // 1 Missão Bônus por semana
        templateMissions.push({
          challenge_id: selectedChallengeId,
          week_id: weekId,
          title: `Desafio Bônus: 3L Água + Alongamento`,
          category: 'habito',
          points_rewarded: 25,
          requires_cooldown: false,
          order_index: 99,
          is_bonus: true,
        });

        let { error: missErr } = await supabase.from('missions').insert(templateMissions);

        // Fallback de resiliência caso colunas novas de missions não estejam no cache do Supabase
        if (missErr && (missErr.message.includes('column') || missErr.message.includes('schema cache'))) {
          console.warn('Tentando insert básico de missões...', missErr);
          const basicMissions = templateMissions.map((m) => ({
            challenge_id: m.challenge_id,
            week_id: m.week_id,
            title: m.title,
            category: m.category,
            points_rewarded: m.points_rewarded,
          }));
          const retry = await supabase.from('missions').insert(basicMissions);
          missErr = retry.error;
        }

        if (missErr) throw missErr;
      }

      // 3. Recarregar as semanas do desafio e carregar imediatamente as missões da Semana 1
      const { data: updatedWeeks } = await supabase
        .from('challenge_weeks')
        .select('*')
        .eq('challenge_id', selectedChallengeId)
        .order('week_number', { ascending: true });

      if (updatedWeeks && updatedWeeks.length > 0) {
        setWeeks(updatedWeeks);
        const targetWeekId = updatedWeeks[0].id;
        setSelectedWeekId(targetWeekId);

        // Forçar busca e hidratação imediata das missões da Semana 1 nas 4 listas
        const { data: weekMissions } = await supabase
          .from('missions')
          .select('*')
          .eq('week_id', targetWeekId)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true });

        setMissions(weekMissions || []);
      }

      showToast('Estrutura de 4 semanas gerada com sucesso! As 4 listas foram preenchidas.');
      setIsGenerateModalOpen(false);
    } catch (err: any) {
      console.error('Erro detalhado ao gerar template inteligente:', err);
      showToast('Erro ao gerar template inteligente: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setGeneratingTemplate(false);
    }
  };

  // Filtrar missões pela aba ativa
  const treinosList = missions.filter((m) => m.category === 'treino' && !m.is_bonus);
  const cardiosList = missions.filter((m) => m.category === 'cardio' && !m.is_bonus);
  const refeicoestList = missions.filter((m) => m.category === 'refeicao' && !m.is_bonus);
  const bonusList = missions.filter((m) => m.is_bonus || m.category === 'habito' || m.category === 'outro');

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);

  return (
    <div className="space-y-6">
      {/* Header com Seletor de Desafio e Botão de Gerar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Gestão Estruturada de Missões
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Segmentação por listas individuais: Treinos, Cardios, Refeições e Bônus com travas configuráveis.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          {challenges.length > 0 && (
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
          )}

          <Button
            size="sm"
            onClick={() => setIsGenerateModalOpen(true)}
            disabled={generatingTemplate || !selectedChallengeId}
            className="w-full sm:w-auto rounded-xl h-10 px-4 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            {generatingTemplate ? 'Gerando...' : 'Gerar 4 Semanas Completas'}
          </Button>
        </div>
      </div>

      {/* Banner se não houver semanas cadastradas */}
      {weeks.length === 0 && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 text-center space-y-2.5">
          <p className="text-sm font-bold text-white font-mono">ESTA TURMA AINDA NÃO POSSUI SEMANAS DE MISSÕES</p>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Clique no botão abaixo para provisionar a estrutura recomendada de 4 semanas com missões completas (Treinos, Cardios, Refeições e Bônus).
          </p>
          <Button
            size="sm"
            onClick={() => setIsGenerateModalOpen(true)}
            className="rounded-xl px-4 py-2 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200"
          >
            <Sparkles className="h-4 w-4 mr-1.5" /> Provisionar 4 Semanas Agora
          </Button>
        </div>
      )}

      {/* Carrossel de Semanas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {weeks.map((week) => {
          const isSelected = week.id === selectedWeekId;
          return (
            <button
              key={week.id}
              onClick={() => setSelectedWeekId(week.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'border-white bg-white/10 text-white shadow-md shadow-black'
                  : 'border-white/10 bg-zinc-900/40 text-zinc-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <Calendar className="h-4 w-4 text-zinc-400" />
              <span>{week.title}</span>
              <span className="bg-white/10 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold font-mono">
                +20 XP 100%
              </span>
            </button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (!selectedChallengeId) return;
            const nextNum = weeks.length + 1;
            const { data } = await supabase
              .from('challenge_weeks')
              .insert({
                challenge_id: selectedChallengeId,
                week_number: nextNum,
                title: `Semana ${nextNum}`,
                bonus_points: 20,
              })
              .select()
              .single();
            if (data) setWeeks([...weeks, data]);
          }}
          className="rounded-2xl h-10 px-3 text-xs text-zinc-400 border-dashed border-white/15 hover:text-white"
        >
          <Plus className="h-4 w-4 mr-1" /> Nova Semana
        </Button>
      </div>

      {/* Segmentação em 4 Listas Claras (Abas) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('treinos')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
            activeTab === 'treinos'
              ? 'border-white bg-white/10 text-white font-bold'
              : 'border-white/10 bg-zinc-900/40 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs">
            <div className="h-7 w-7 rounded-lg bg-white/5 text-white flex items-center justify-center border border-white/10">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span>Lista 1: Treinos</span>
          </div>
          <Badge className="bg-zinc-800 text-zinc-300 text-[10px] font-mono">{treinosList.length}</Badge>
        </button>

        <button
          onClick={() => setActiveTab('cardios')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
            activeTab === 'cardios'
              ? 'border-white bg-white/10 text-white font-bold'
              : 'border-white/10 bg-zinc-900/40 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs">
            <div className="h-7 w-7 rounded-lg bg-white/5 text-white flex items-center justify-center border border-white/10">
              <Flame className="h-4 w-4" />
            </div>
            <span>Lista 2: Cardios</span>
          </div>
          <Badge className="bg-zinc-800 text-zinc-300 text-[10px] font-mono">{cardiosList.length}</Badge>
        </button>

        <button
          onClick={() => setActiveTab('refeicoes')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
            activeTab === 'refeicoes'
              ? 'border-white bg-white/10 text-white font-bold'
              : 'border-white/10 bg-zinc-900/40 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs">
            <div className="h-7 w-7 rounded-lg bg-white/5 text-white flex items-center justify-center border border-white/10">
              <Utensils className="h-4 w-4" />
            </div>
            <span>Lista 3: Refeições</span>
          </div>
          <Badge className="bg-zinc-800 text-zinc-300 text-[10px] font-mono">{refeicoestList.length}</Badge>
        </button>

        <button
          onClick={() => setActiveTab('bonus')}
          className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
            activeTab === 'bonus'
              ? 'border-white bg-white/10 text-white font-bold'
              : 'border-white/10 bg-zinc-900/40 text-zinc-400 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs">
            <div className="h-7 w-7 rounded-lg bg-white/5 text-white flex items-center justify-center border border-white/10">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Lista 4: Extras / Bônus</span>
          </div>
          <Badge className="bg-zinc-800 text-zinc-300 text-[10px] font-mono">{bonusList.length}</Badge>
        </button>
      </div>

      {/* Conteúdo da Lista Selecionada */}
      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base text-white flex items-center gap-2 tracking-tight">
              {activeTab === 'treinos' && 'Treinos da Semana'}
              {activeTab === 'cardios' && 'Cardios da Semana'}
              {activeTab === 'refeicoes' && 'Refeições Diárias'}
              {activeTab === 'bonus' && 'Missões Extras & Hábitos Bônus'}
            </CardTitle>
            <CardDescription className="text-xs">
              {activeTab === 'treinos' && 'Configuração de treinos com trava sequencial e contagem regressiva.'}
              {activeTab === 'cardios' && 'Sessões aeróbicas com bloqueio temporal e fotos de comprovação.'}
              {activeTab === 'refeicoes' && 'Validação por fotos no prato (Café, Almoço, Lanche, Jantar).'}
              {activeTab === 'bonus' && 'Pontuação complementar para quem quer se destacar no leaderboard.'}
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={() => handleOpenCreateModal(
              activeTab === 'treinos' ? 'treino' : activeTab === 'cardios' ? 'cardio' : activeTab === 'refeicoes' ? 'refeicao' : 'habito'
            )}
            className="rounded-xl text-xs font-bold bg-white hover:bg-zinc-200 text-black shadow-md"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar {activeTab === 'treinos' ? 'Treino' : activeTab === 'cardios' ? 'Cardio' : activeTab === 'refeicoes' ? 'Refeição' : 'Bônus'}
          </Button>
        </CardHeader>

        <CardContent>
          {(() => {
            const currentList = 
              activeTab === 'treinos' ? treinosList : 
              activeTab === 'cardios' ? cardiosList : 
              activeTab === 'refeicoes' ? refeicoestList : bonusList;

            if (currentList.length === 0) {
              return (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  Nenhuma missão cadastrada nesta lista ainda. Clique no botão acima ou gere o template de 4 semanas.
                </div>
              );
            }

            return (
              <div className="divide-y divide-zinc-800/80">
                {currentList.map((m, index) => (
                  <div key={m.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs flex items-center justify-center shrink-0">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-white">{m.title}</p>
                          {m.is_bonus && (
                            <Badge className="bg-white/10 text-white border-white/20 text-[9px] font-mono">
                              Bônus Extra
                            </Badge>
                          )}
                          {m.requires_cooldown && (
                            <Badge variant="outline" className="border-white/20 text-zinc-300 text-[9px] flex items-center gap-1 font-mono">
                              <Calendar className="h-2.5 w-2.5" /> 1 por dia (Virada 00:00)
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Vale <strong className="text-white font-mono">+{m.points_rewarded} XP</strong> • Câmera obrigatória
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(m)}
                        className="h-8 px-2.5 text-xs text-zinc-400 hover:text-white"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteMissionTarget({ id: m.id, title: m.title })}
                        className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10"
                        title="Excluir Missão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Modal Customizável de Edição / Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-white/15 bg-zinc-950 p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-black text-white tracking-tight">
                {editingMission ? 'Editar Missão' : 'Nova Missão Customizada'}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Ajuste os parâmetros de pontuação, categoria e bloqueio da missão.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSaveMission} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Título da Missão</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Treino de Pernas & Glúteos"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-white/30"
                  >
                    <option value="treino">Treino</option>
                    <option value="cardio">Cardio</option>
                    <option value="refeicao">Refeição</option>
                    <option value="habito">Hábito / Água</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1 font-mono">Pontos (XP)</label>
                  <Input
                    type="number"
                    min={1}
                    value={formPoints}
                    onChange={(e) => setFormPoints(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Opção de Trava Diária (Current Day) */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-200">
                  <input
                    type="checkbox"
                    checked={formRequiresCooldown}
                    onChange={(e) => setFormRequiresCooldown(e.target.checked)}
                    className="rounded bg-zinc-950 border-white/20 text-white focus:ring-white"
                  />
                  <span>Trava Diária: Liberar apenas 1 por dia (libera na virada das 00:00)</span>
                </label>
                <p className="text-[11px] text-zinc-400 pl-6">
                  Garante a disciplina biológica do aluno evitando múltiplos envios no mesmo dia.
                </p>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-200 pt-1">
                  <input
                    type="checkbox"
                    checked={formIsBonus}
                    onChange={(e) => setFormIsBonus(e.target.checked)}
                    className="rounded bg-zinc-950 border-white/20 text-white focus:ring-white"
                  />
                  <span>Marcar como Missão Extra / Bônus</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 text-xs border-white/10 text-zinc-400 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submittingMission}
                  className="flex-1 text-xs font-bold bg-white hover:bg-zinc-200 text-black"
                >
                  {submittingMission ? 'Salvando...' : 'Salvar Missão'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modal Customizado: Confirmar Exclusão de Missão */}
      <CustomDialog
        isOpen={!!deleteMissionTarget}
        onClose={() => setDeleteMissionTarget(null)}
        title="Excluir Missão"
        description={`Tem certeza que deseja excluir a missão "${deleteMissionTarget?.title}"? Esta ação removerá a pontuação relacionada do leaderboard dos alunos.`}
        confirmLabel={deletingMission ? 'Excluindo...' : 'Sim, Excluir Missão'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteMission}
        isLoading={deletingMission}
      />

      {/* Modal Customizado: Confirmar Geração de 4 Semanas */}
      <CustomDialog
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Provisionar Estrutura de 4 Semanas"
        description="Deseja gerar a estrutura completa com 4 Semanas de sprints e 17 missões recomendadas (Treinos, Cardios, Refeições diárias e Bônus)? Missões já existentes não serão apagadas."
        confirmLabel={generatingTemplate ? 'Gerando...' : 'Sim, Provisionar Agora'}
        cancelLabel="Voltar"
        onConfirm={handleExecuteGenerateTemplate}
        isLoading={generatingTemplate}
      />
    </div>
  );
}

export default function MissionsManagerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500 text-xs">Carregando planejador de missões...</div>}>
      <MissionsManagerContent />
    </Suspense>
  );
}
