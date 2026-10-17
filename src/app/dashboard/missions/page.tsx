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
  AlertCircle,
  ListPlus,
  Camera,
  Timer,
  MousePointerClick,
  FileText,
  Settings2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { createClient } from '@/lib/supabase/client';

const DEFAULT_PRESET_LISTS = [
  { id: 'preset-treino', key: 'treino', name: 'Treinos', icon: '⚡', color: 'amber', validation_type: 'timer', daily_limit: 1 },
  { id: 'preset-cardio', key: 'cardio', name: 'Cardios', icon: '🏃', color: 'cyan', validation_type: 'timer', daily_limit: 1 },
  { id: 'preset-refeicao', key: 'refeicao', name: 'Refeições', icon: '🥗', color: 'emerald', validation_type: 'photo', daily_limit: 4 },
  { id: 'preset-habito', key: 'habito', name: 'Hábitos & Água', icon: '💧', color: 'purple', validation_type: 'simple_click', daily_limit: 0 },
];

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
  const [generatingTemplate, setGeneratingTemplate] = useState(false);

  // Listas de Missões Personalizadas (Trilhas do Coach)
  const [missionLists, setMissionLists] = useState<any[]>(DEFAULT_PRESET_LISTS);
  const [activeListId, setActiveListId] = useState<string>('preset-treino');

  // Modal para Criar / Editar Lista
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<any | null>(null);
  const [listName, setListName] = useState('');
  const [listIcon, setListIcon] = useState('⚡');
  const [listValidationType, setListValidationType] = useState<'photo' | 'timer' | 'simple_click' | 'text'>('photo');
  const [listDailyLimit, setListDailyLimit] = useState('1');
  const [submittingList, setSubmittingList] = useState(false);
  const [deleteListTarget, setDeleteListTarget] = useState<{ id: string; name: string } | null>(null);
  const [deletingList, setDeletingList] = useState(false);

  // Modal para Criar / Editar Missão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<any | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formListId, setFormListId] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('treino');
  const [formValidationType, setFormValidationType] = useState<'photo' | 'timer' | 'simple_click' | 'text'>('photo');
  const [formDailyLimit, setFormDailyLimit] = useState('1');
  const [formPoints, setFormPoints] = useState('10');
  const [formRequiresCooldown, setFormRequiresCooldown] = useState(false);
  const [formCooldownHours, setFormCooldownHours] = useState('4');
  const [formIsBonus, setFormIsBonus] = useState(false);
  const [submittingMission, setSubmittingMission] = useState(false);

  // Modais de Confirmação & Toasts (Substituem alert e confirm nativos)
  const [deleteMissionTarget, setDeleteMissionTarget] = useState<{ id: string; title: string } | null>(null);
  const [deletingMission, setDeletingMission] = useState(false);
  const [deleteWeekTarget, setDeleteWeekTarget] = useState<{ id: string; title: string } | null>(null);
  const [deletingWeek, setDeletingWeek] = useState(false);
  const [editingWeekTitle, setEditingWeekTitle] = useState(false);
  const [newWeekTitle, setNewWeekTitle] = useState('');
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

  // Carregar listas/trilhas de missões personalizadas do desafio
  const fetchMissionLists = async (challengeId: string) => {
    if (!challengeId) return;
    try {
      const { data, error } = await supabase
        .from('challenge_mission_lists')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMissionLists(data);
        if (!activeListId || !data.some((l: any) => l.id === activeListId)) {
          setActiveListId(data[0].id);
        }
      } else {
        // Inicializar os presets padrão no Supabase se ainda não houver
        const { data: seeded } = await supabase
          .from('challenge_mission_lists')
          .insert(
            DEFAULT_PRESET_LISTS.map((p, idx) => ({
              challenge_id: challengeId,
              name: p.name,
              key: p.key,
              icon: p.icon,
              color: p.color,
              validation_type: p.validation_type,
              daily_limit: p.daily_limit,
              order_index: idx + 1,
            }))
          )
          .select();

        if (seeded && seeded.length > 0) {
          setMissionLists(seeded);
          setActiveListId(seeded[0].id);
        } else {
          setMissionLists(DEFAULT_PRESET_LISTS);
          setActiveListId(DEFAULT_PRESET_LISTS[0].id);
        }
      }
    } catch (err) {
      console.warn('Fallback para presets padrão de listas:', err);
      setMissionLists(DEFAULT_PRESET_LISTS);
      setActiveListId(DEFAULT_PRESET_LISTS[0].id);
    }
  };

  useEffect(() => {
    if (selectedChallengeId) {
      fetchWeeks(selectedChallengeId);
      fetchMissionLists(selectedChallengeId);
    }
  }, [selectedChallengeId]);

  // 3. Carregar missões da semana selecionada (com fallback de resiliência)
  const fetchMissions = async (weekId: string) => {
    if (!weekId) return;
    const { data } = await supabase
      .from('missions')
      .select('*')
      .eq('week_id', weekId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    let result = data || [];

    // Fallback: Se não encontrar missões por week_id, verificar se existem missões do desafio sem week_id
    if (result.length === 0 && selectedChallengeId) {
      const { data: directMissions } = await supabase
        .from('missions')
        .select('*')
        .eq('challenge_id', selectedChallengeId)
        .order('order_index', { ascending: true });

      if (directMissions && directMissions.length > 0) {
        result = directMissions;
      }
    }

    setMissions(result);
  };

  useEffect(() => {
    if (selectedWeekId) {
      fetchMissions(selectedWeekId);
    }
  }, [selectedWeekId]);

  // Handlers para Criar / Editar / Excluir Listas de Missões
  const handleOpenCreateListModal = () => {
    setEditingList(null);
    setListName('');
    setListIcon('⚡');
    setListValidationType('photo');
    setListDailyLimit('1');
    setIsListModalOpen(true);
  };

  const handleOpenEditListModal = (list: any) => {
    setEditingList(list);
    setListName(list.name);
    setListIcon(list.icon || '⚡');
    setListValidationType(list.validation_type || 'photo');
    setListDailyLimit(list.daily_limit?.toString() || '1');
    setIsListModalOpen(true);
  };

  const handleSaveList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !listName.trim()) return;

    setSubmittingList(true);
    try {
      const slugKey = listName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
      const payload: any = {
        challenge_id: selectedChallengeId,
        name: listName.trim(),
        key: slugKey || 'custom',
        icon: listIcon || '⚡',
        validation_type: listValidationType,
        daily_limit: parseInt(listDailyLimit, 10) || 1,
        order_index: missionLists.length + 1,
      };

      if (editingList?.id && !editingList.id.startsWith('preset-')) {
        const { data, error } = await supabase
          .from('challenge_mission_lists')
          .update(payload)
          .eq('id', editingList.id)
          .select()
          .single();
        if (error) throw error;
        setMissionLists((prev) => prev.map((l) => (l.id === editingList.id ? data : l)));
        showToast(`Lista "${data.name}" atualizada!`);
      } else {
        const { data, error } = await supabase
          .from('challenge_mission_lists')
          .insert(payload)
          .select()
          .single();
        if (error) {
          // Fallback se a tabela ainda estiver em criação
          const localNewList = { ...payload, id: `custom-${Date.now()}` };
          setMissionLists((prev) => [...prev, localNewList]);
          setActiveListId(localNewList.id);
        } else if (data) {
          setMissionLists((prev) => [...prev, data]);
          setActiveListId(data.id);
        }
        showToast(`Nova lista criada com sucesso!`);
      }
      setIsListModalOpen(false);
      setEditingList(null);
    } catch (err: any) {
      showToast('Erro ao salvar lista: ' + err.message);
    } finally {
      setSubmittingList(false);
    }
  };

  const handleConfirmDeleteList = async () => {
    if (!deleteListTarget) return;
    setDeletingList(true);
    try {
      if (!deleteListTarget.id.startsWith('preset-')) {
        await supabase
          .from('challenge_mission_lists')
          .delete()
          .eq('id', deleteListTarget.id);
      }
      const remaining = missionLists.filter((l) => l.id !== deleteListTarget.id);
      setMissionLists(remaining);
      if (remaining.length > 0) {
        setActiveListId(remaining[0].id);
      }
      showToast(`Lista "${deleteListTarget.name}" removida.`);
      setDeleteListTarget(null);
    } catch (err: any) {
      showToast('Erro ao excluir lista: ' + err.message);
    } finally {
      setDeletingList(false);
    }
  };

  // Gerar Template Completo de 4 Semanas de Missões com 1 Clique
  const handleGenerateSmartTemplate = async () => {
    if (!selectedChallengeId) {
      showToast('Selecione uma turma primeiro.');
      return;
    }

    setGeneratingTemplate(true);
    try {
      // 1. Garantir que as 4 semanas existam
      let currentWeeks = [...weeks];
      if (currentWeeks.length === 0) {
        const defaultWeeks = [
          { challenge_id: selectedChallengeId, week_number: 1, title: 'Semana 1 • Sprint 1 (Ativação)', bonus_points: 20 },
          { challenge_id: selectedChallengeId, week_number: 2, title: 'Semana 2 • Sprint 2 (Intensidade)', bonus_points: 20 },
          { challenge_id: selectedChallengeId, week_number: 3, title: 'Semana 3 • Sprint 3 (Consistência)', bonus_points: 20 },
          { challenge_id: selectedChallengeId, week_number: 4, title: 'Semana 4 • Sprint 4 (Sprint Final)', bonus_points: 20 },
        ];
        const { data: createdWeeks, error: wErr } = await supabase
          .from('challenge_weeks')
          .insert(defaultWeeks)
          .select();
        if (wErr) throw wErr;
        currentWeeks = createdWeeks || [];
        setWeeks(currentWeeks);
        if (currentWeeks.length > 0) {
          setSelectedWeekId(currentWeeks[0].id);
        }
      }

      // 2. Para cada semana, verificar se já tem missões ou criar as missões padrão
      const allMissionsToInsert: any[] = [];
      for (const week of currentWeeks) {
        const { count } = await supabase
          .from('missions')
          .select('*', { count: 'exact', head: true })
          .eq('week_id', week.id);

        if ((count || 0) > 0) continue; // Pula se já houver missões nessa semana

        // 6 Treinos da semana
        for (let t = 1; t <= 6; t++) {
          allMissionsToInsert.push({
            challenge_id: selectedChallengeId,
            week_id: week.id,
            title: `Treino #${t} da Semana`,
            category: 'treino',
            validation_type: 'timer',
            daily_limit: 1,
            points_rewarded: 15,
            requires_cooldown: true,
            cooldown_hours: 4,
            order_index: t,
            is_bonus: false,
          });
        }

        // 7 Cardios da semana
        for (let c = 1; c <= 7; c++) {
          allMissionsToInsert.push({
            challenge_id: selectedChallengeId,
            week_id: week.id,
            title: `Cardio #${c} (Mín. 30min)`,
            category: 'cardio',
            validation_type: 'timer',
            daily_limit: 1,
            points_rewarded: 10,
            requires_cooldown: true,
            cooldown_hours: 4,
            order_index: c,
            is_bonus: false,
          });
        }

        // 4 Refeições diárias
        const meals = ['Café da Manhã Limpo', 'Almoço Balanceado', 'Lanche da Tarde', 'Jantar & Ceia'];
        meals.forEach((meal, idx) => {
          allMissionsToInsert.push({
            challenge_id: selectedChallengeId,
            week_id: week.id,
            title: meal,
            category: 'refeicao',
            validation_type: 'photo',
            daily_limit: 4,
            points_rewarded: 10,
            requires_cooldown: false,
            order_index: idx + 1,
            is_bonus: false,
          });
        });

        // 1 Missão Bônus por semana
        allMissionsToInsert.push({
          challenge_id: selectedChallengeId,
          week_id: week.id,
          title: 'Desafio Bônus: 3L Água + Alongamento',
          category: 'habito',
          validation_type: 'simple_click',
          daily_limit: 0,
          points_rewarded: 25,
          requires_cooldown: false,
          order_index: 99,
          is_bonus: true,
        });
      }

      if (allMissionsToInsert.length > 0) {
        let { error: mErr } = await supabase.from('missions').insert(allMissionsToInsert);
        if (mErr && (mErr.message.includes('column') || mErr.message.includes('schema cache'))) {
          const basicMissions = allMissionsToInsert.map((m) => ({
            challenge_id: m.challenge_id,
            week_id: m.week_id,
            title: m.title,
            category: m.category,
            points_rewarded: m.points_rewarded,
          }));
          await supabase.from('missions').insert(basicMissions);
        }
      }

      showToast('Template de 4 semanas e missões gerado com sucesso!');
      if (selectedWeekId) {
        await fetchMissions(selectedWeekId);
      } else if (currentWeeks.length > 0) {
        setSelectedWeekId(currentWeeks[0].id);
      }
    } catch (err: any) {
      showToast('Erro ao gerar template: ' + err.message);
    } finally {
      setGeneratingTemplate(false);
    }
  };

  // Abrir Modal para Criar Missão
  const handleOpenCreateModal = (targetList?: any) => {
    const list = targetList || missionLists.find((l) => l.id === activeListId) || missionLists[0];
    setEditingMission(null);
    setFormTitle('');
    setFormListId(list?.id && !list.id.startsWith('preset-') ? list.id : '');
    setFormCategory(list?.key || 'treino');
    setFormValidationType(list?.validation_type || 'photo');
    setFormDailyLimit(list?.daily_limit !== undefined ? list.daily_limit.toString() : '1');
    setFormPoints('10');
    setFormRequiresCooldown(list?.daily_limit === 1);
    setFormCooldownHours('4');
    setFormIsBonus(false);
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar Missão
  const handleOpenEditModal = (mission: any) => {
    setEditingMission(mission);
    setFormTitle(mission.title);
    setFormListId(mission.list_id || '');
    setFormCategory(mission.category || 'treino');
    setFormValidationType(
      mission.validation_type ||
      (mission.category === 'treino' || mission.category === 'cardio'
        ? 'timer'
        : mission.category === 'habito'
        ? 'simple_click'
        : 'photo')
    );
    setFormDailyLimit(mission.daily_limit?.toString() || (mission.requires_cooldown ? '1' : '0'));
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
      const selectedListObj = missionLists.find((l) => l.id === formListId);
      const resolvedCategory = selectedListObj ? selectedListObj.key : formCategory;

      const payload: any = {
        challenge_id: selectedChallengeId,
        week_id: selectedWeekId,
        title: formTitle.trim(),
        category: resolvedCategory,
        list_id: formListId && !formListId.startsWith('preset-') ? formListId : null,
        validation_type: formValidationType,
        daily_limit: parseInt(formDailyLimit, 10) || 1,
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

        if (error) {
          // Fallback sem colunas extras se o schema cache falhar
          const basicPayload = {
            title: payload.title,
            category: payload.category,
            points_rewarded: payload.points_rewarded,
            requires_cooldown: payload.requires_cooldown,
            is_bonus: payload.is_bonus,
          };
          await supabase.from('missions').update(basicPayload).eq('id', editingMission.id);
        }
        setMissions((prev) => prev.map((m) => (m.id === editingMission.id ? { ...m, ...payload } : m)));
      } else {
        // Inserir
        payload.order_index = missions.length + 1;
        const { data, error } = await supabase
          .from('missions')
          .insert(payload)
          .select()
          .single();

        if (error) {
          // Fallback sem colunas extras
          const basicPayload = {
            challenge_id: payload.challenge_id,
            week_id: payload.week_id,
            title: payload.title,
            category: payload.category,
            points_rewarded: payload.points_rewarded,
            requires_cooldown: payload.requires_cooldown,
            is_bonus: payload.is_bonus,
            order_index: payload.order_index,
          };
          const { data: bData } = await supabase.from('missions').insert(basicPayload).select().single();
          if (bData) setMissions((prev) => [...prev, bData]);
        } else if (data) {
          setMissions((prev) => [...prev, data]);
        }
      }

      setIsModalOpen(false);
      showToast('Missão salva com sucesso!');
    } catch (err: any) {
      showToast('Erro ao salvar missão: ' + err.message);
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

  // Excluir Semana com Confirmação
  const handleConfirmDeleteWeek = async () => {
    if (!deleteWeekTarget) return;
    setDeletingWeek(true);
    try {
      // 1. Deletar missões da semana
      await supabase.from('missions').delete().eq('week_id', deleteWeekTarget.id);
      
      // 2. Deletar semana
      const { error } = await supabase.from('challenge_weeks').delete().eq('id', deleteWeekTarget.id);
      if (error) throw error;

      const remainingWeeks = weeks.filter((w) => w.id !== deleteWeekTarget.id);
      setWeeks(remainingWeeks);
      if (remainingWeeks.length > 0) {
        setSelectedWeekId(remainingWeeks[0].id);
      } else {
        setSelectedWeekId('');
        setMissions([]);
      }
      showToast(`Semana "${deleteWeekTarget.title}" removida com sucesso.`);
      setDeleteWeekTarget(null);
    } catch (err: any) {
      showToast('Erro ao excluir semana: ' + err.message);
    } finally {
      setDeletingWeek(false);
    }
  };

  // Renomear Semana
  const handleSaveWeekTitle = async () => {
    if (!selectedWeekId || !newWeekTitle.trim()) {
      setEditingWeekTitle(false);
      return;
    }
    try {
      const { error } = await supabase
        .from('challenge_weeks')
        .update({ title: newWeekTitle.trim() })
        .eq('id', selectedWeekId);
      if (error) throw error;
      setWeeks((prev) => prev.map((w) => w.id === selectedWeekId ? { ...w, title: newWeekTitle.trim() } : w));
      showToast('Nome da semana atualizado!');
    } catch (err: any) {
      showToast('Erro ao atualizar nome da semana: ' + err.message);
    } finally {
      setEditingWeekTitle(false);
    }
  };

  // Adicionar Nova Semana
  const handleCreateNewWeek = async () => {
    if (!selectedChallengeId) {
      showToast('Selecione uma turma primeiro.');
      return;
    }
    try {
      const nextNum = weeks.length + 1;
      const { data, error } = await supabase
        .from('challenge_weeks')
        .insert({
          challenge_id: selectedChallengeId,
          week_number: nextNum,
          title: `Semana ${nextNum}`,
          bonus_points: 20,
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        const updated = [...weeks, data];
        setWeeks(updated);
        setSelectedWeekId(data.id);
        showToast(`Semana ${nextNum} criada com sucesso!`);
      }
    } catch (err: any) {
      showToast('Erro ao criar nova semana: ' + err.message);
    }
  };

  // Lista ativa e filtragem dinâmica de missões
  const currentActiveList = missionLists.find((l) => l.id === activeListId) || missionLists[0];

  const currentListMissions = missions.filter((m) => {
    if (!currentActiveList) return true;
    if (m.list_id && currentActiveList.id && !currentActiveList.id.startsWith('preset-')) {
      return m.list_id === currentActiveList.id;
    }
    if (currentActiveList.key) {
      return m.category === currentActiveList.key;
    }
    return false;
  });

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
            onClick={handleGenerateSmartTemplate}
            disabled={!selectedChallengeId || generatingTemplate}
            className="w-full sm:w-auto rounded-xl h-10 px-4 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5"
          >
            {generatingTemplate ? (
              <span className="flex items-center gap-1.5 animate-pulse">⚡ Gerando...</span>
            ) : (
              <span className="flex items-center gap-1.5">⚡ Gerar Template (4 Semanas)</span>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleCreateNewWeek}
            disabled={!selectedChallengeId}
            variant="outline"
            className="w-full sm:w-auto rounded-xl h-10 px-4 text-xs font-mono font-bold border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nova Semana
          </Button>
        </div>
      </div>

      {/* Banner se não houver semanas cadastradas */}
      {weeks.length === 0 && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 text-center space-y-2.5">
          <p className="text-sm font-bold text-white font-mono">ESTA TURMA AINDA NÃO POSSUI SEMANAS DE MISSÕES</p>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Crie semanas de missões personalizadas de acordo com o planejamento da sua turma (Treinos, Cardios, Refeições e Hábitos).
          </p>
          <Button
            size="sm"
            onClick={handleCreateNewWeek}
            className="rounded-xl px-4 py-2 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Criar Semana 1 Agora
          </Button>
        </div>
      )}

      {/* Carrossel de Semanas e Ações da Semana Selecionada */}
      {weeks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
            {weeks.map((week) => {
              const isSelected = week.id === selectedWeekId;
              return (
                <button
                  key={week.id}
                  onClick={() => {
                    setSelectedWeekId(week.id);
                    setEditingWeekTitle(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'border-white bg-white/10 text-white shadow-md shadow-black'
                      : 'border-white/10 bg-zinc-900/40 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <span>{week.title}</span>
                  <span className="bg-white/10 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold font-mono">
                    +{week.bonus_points || 20} XP
                  </span>
                </button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewWeek}
              className="rounded-2xl h-10 px-3 text-xs text-zinc-400 border-dashed border-white/15 hover:text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Nova Semana
            </Button>
          </div>

          {/* Barra de Ações Rápidas da Semana Selecionada */}
          {selectedWeekId && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-zinc-950/60 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-mono">Semana ativa:</span>
                {editingWeekTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newWeekTitle}
                      onChange={(e) => setNewWeekTitle(e.target.value)}
                      placeholder="Ex: Semana 1 • Adaptação"
                      className="h-8 w-56 text-xs bg-zinc-900 border-white/20 text-white rounded-lg"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveWeekTitle}
                      className="h-8 px-2.5 text-xs bg-white text-black font-bold hover:bg-zinc-200"
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingWeekTitle(false)}
                      className="h-8 px-2 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">
                      {weeks.find((w) => w.id === selectedWeekId)?.title || 'Semana'}
                    </span>
                    <button
                      onClick={() => {
                        const current = weeks.find((w) => w.id === selectedWeekId);
                        setNewWeekTitle(current?.title || '');
                        setEditingWeekTitle(true);
                      }}
                      className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
                      title="Renomear semana"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = weeks.find((w) => w.id === selectedWeekId);
                    if (current) {
                      setDeleteWeekTarget({ id: current.id, title: current.title });
                    }
                  }}
                  className="h-8 px-3 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Excluir Esta Semana
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Listas / Trilhas de Missões Customizáveis pelo Coach */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-white" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Listas de Missões da Turma ({missionLists.length})
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenCreateListModal}
            className="rounded-xl h-8 px-3 text-xs font-mono font-bold border-white/20 text-white hover:bg-white/10 flex items-center gap-1.5"
          >
            <ListPlus className="h-3.5 w-3.5" />
            <span>+ Nova Lista</span>
          </Button>
        </div>

        {/* Abas das Listas em Grid Dinâmico */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {missionLists.map((list) => {
            const isSelected = list.id === activeListId;
            const count = missions.filter((m) =>
              m.list_id && !list.id.startsWith('preset-')
                ? m.list_id === list.id
                : m.category === list.key
            ).length;
            const isPreset = list.id.startsWith('preset-');

            return (
              <div
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 group ${
                  isSelected
                    ? 'border-white bg-white/10 text-white shadow-md'
                    : 'border-white/10 bg-zinc-900/40 text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{list.icon || '⚡'}</span>
                    <span className="text-xs font-bold truncate">{list.name}</span>
                  </div>
                  <Badge className="bg-zinc-800 text-zinc-300 text-[10px] font-mono shrink-0">
                    {count}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-white/5">
                  <span className="truncate">
                    {list.validation_type === 'timer'
                      ? '⏱️ Cronômetro'
                      : list.validation_type === 'simple_click'
                      ? '⚡ 1-Toque'
                      : list.validation_type === 'text'
                      ? '✍️ Texto'
                      : '📸 Foto'}
                  </span>
                  {!isPreset && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditListModal(list);
                        }}
                        className="p-1 hover:text-white"
                        title="Editar Lista"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteListTarget({ id: list.id, name: list.name });
                        }}
                        className="p-1 hover:text-red-400"
                        title="Excluir Lista"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Lista Selecionada */}
      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base text-white flex items-center gap-2 tracking-tight">
              <span>{currentActiveList?.icon || '⚡'}</span>
              <span>{currentActiveList?.name || 'Missões'} da Semana</span>
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-2 flex-wrap mt-0.5">
              <span>
                Comprovação:{' '}
                <strong className="text-zinc-200">
                  {currentActiveList?.validation_type === 'timer'
                    ? 'Sessão com Cronômetro'
                    : currentActiveList?.validation_type === 'simple_click'
                    ? 'Check-in Direto 1-Toque (Sem foto)'
                    : currentActiveList?.validation_type === 'text'
                    ? 'Resposta em Texto'
                    : 'Foto Obrigatória na Câmera'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Limite:{' '}
                <strong className="text-zinc-200">
                  {currentActiveList?.daily_limit === 0 || !currentActiveList?.daily_limit
                    ? 'Ilimitado'
                    : `${currentActiveList?.daily_limit}x por dia`}
                </strong>
              </span>
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={() => handleOpenCreateModal(currentActiveList)}
            className="rounded-xl text-xs font-bold bg-white hover:bg-zinc-200 text-black shadow-md shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Missão
          </Button>
        </CardHeader>

        <CardContent>
          {currentListMissions.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs space-y-3">
              <AlertCircle className="h-8 w-8 mx-auto opacity-40 text-zinc-400" />
              <p className="font-semibold text-zinc-300">
                Nenhuma missão cadastrada em "{currentActiveList?.name}" na {selectedWeek?.title || 'Semana'}.
              </p>
              <p className="text-zinc-500 max-w-sm mx-auto text-[11px]">
                Você pode criar missões personalizadas para esta lista ou gerar o template completo com 1 clique.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleOpenCreateModal(currentActiveList)}
                  variant="outline"
                  className="text-xs border-white/20 text-white hover:bg-white/10 rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Criar Missão Manual
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerateSmartTemplate}
                  disabled={generatingTemplate}
                  className="text-xs font-bold bg-white text-black hover:bg-zinc-200 rounded-xl shadow-md"
                >
                  {generatingTemplate ? 'Gerando...' : '⚡ Gerar Template Oficial (4 Semanas)'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {currentListMissions.map((m, index) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-white">{m.title}</p>
                        {m.is_bonus && (
                          <Badge className="bg-white/10 text-white border-white/20 text-[9px] font-mono">
                            ★ Bônus
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-white/15 text-zinc-300 text-[9px] font-mono">
                          {m.validation_type === 'timer'
                            ? '⏱️ Cronômetro'
                            : m.validation_type === 'simple_click'
                            ? '⚡ 1-Toque'
                            : m.validation_type === 'text'
                            ? '✍️ Texto'
                            : '📸 Foto'}
                        </Badge>
                        {m.requires_cooldown && (
                          <Badge variant="outline" className="border-amber-500/25 text-amber-300 text-[9px] flex items-center gap-1 font-mono">
                            <Clock className="h-2.5 w-2.5" /> 1/dia
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Vale <strong className="text-white font-mono">+{m.points_rewarded} XP</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
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
          )}
        </CardContent>
      </Card>

      {/* Modal: Criar / Editar Lista de Missões */}
      <CustomDialog
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        title={editingList ? 'Editar Lista de Missões' : 'Nova Lista de Missões'}
        description="Crie listas temáticas personalizadas para a metodologia da sua turma."
        hideFooter
      >
        <form onSubmit={handleSaveList} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Nome da Lista</label>
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Suplementação & Vitaminas, Alongamento, Mindset..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Ícone / Emoji</label>
            <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl bg-zinc-950 border border-white/10">
              {['⚡', '🏃', '🥗', '💧', '💊', '🧘', '📖', '⚖️', '🎯', '🔥', '🏋️', '🍎', '🌙', '🥑', '🚴', '⭐'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setListIcon(emoji)}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    listIcon === emoji
                      ? 'bg-white/20 border border-white/40 scale-110 shadow-sm'
                      : 'hover:bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Comprovação Padrão</label>
              <select
                value={listValidationType}
                onChange={(e: any) => setListValidationType(e.target.value)}
                className="w-full h-9 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-white/30"
              >
                <option value="photo">📸 Foto Obrigatória</option>
                <option value="timer">⏱️ Cronômetro de Sessão</option>
                <option value="simple_click">⚡ Check-in 1-Toque (Sem foto)</option>
                <option value="text">✍️ Relato em Texto</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Limite Diário</label>
              <select
                value={listDailyLimit}
                onChange={(e) => setListDailyLimit(e.target.value)}
                className="w-full h-9 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-white/30"
              >
                <option value="1">1 vez ao dia (trava até 00:00)</option>
                <option value="0">Ilimitado (livre)</option>
                <option value="2">2 vezes ao dia</option>
                <option value="3">3 vezes ao dia</option>
                <option value="4">4 vezes ao dia</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsListModalOpen(false)}
              className="flex-1 text-xs border-white/10 text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submittingList}
              className="flex-1 text-xs font-bold bg-white hover:bg-zinc-200 text-black"
            >
              {submittingList ? 'Salvando...' : 'Salvar Lista'}
            </Button>
          </div>
        </form>
      </CustomDialog>

      {/* Modal: Criar / Editar Missão */}
      <CustomDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMission ? 'Editar Missão' : 'Nova Missão'}
        description="Defina os parâmetros, lista de destino e regras de comprovação."
        hideFooter
      >
        <form onSubmit={handleSaveMission} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Título da Missão</label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ex: Treino de Pernas & Glúteos, 500ml Água..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Lista / Trilha</label>
              <select
                value={formListId}
                onChange={(e) => {
                  setFormListId(e.target.value);
                  const selectedList = missionLists.find((l) => l.id === e.target.value);
                  if (selectedList) {
                    setFormCategory(selectedList.key);
                    setFormValidationType(selectedList.validation_type);
                  }
                }}
                className="w-full h-9 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-white/30"
              >
                {missionLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.icon} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Comprovação</label>
              <select
                value={formValidationType}
                onChange={(e: any) => setFormValidationType(e.target.value)}
                className="w-full h-9 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-white/30"
              >
                <option value="photo">📸 Foto Obrigatória</option>
                <option value="timer">⏱️ Cronômetro de Sessão</option>
                <option value="simple_click">⚡ Check-in 1-Toque</option>
                <option value="text">✍️ Relato em Texto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Limite Diário</label>
              <select
                value={formDailyLimit}
                onChange={(e) => {
                  setFormDailyLimit(e.target.value);
                  setFormRequiresCooldown(e.target.value === '1');
                }}
                className="w-full h-9 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-white/30"
              >
                <option value="1">1 vez ao dia (trava 00:00)</option>
                <option value="0">Ilimitado (livre)</option>
                <option value="2">2 vezes ao dia</option>
                <option value="3">3 vezes ao dia</option>
                <option value="4">4 vezes ao dia</option>
              </select>
            </div>
          </div>

          {/* Opções de Trava & Bônus */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-200">
              <input
                type="checkbox"
                checked={formRequiresCooldown}
                onChange={(e) => setFormRequiresCooldown(e.target.checked)}
                className="rounded bg-zinc-950 border-white/20 text-white focus:ring-white"
              />
              <span>Bloquear após o check-in até a virada de meia-noite</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-200 pt-1">
              <input
                type="checkbox"
                checked={formIsBonus}
                onChange={(e) => setFormIsBonus(e.target.checked)}
                className="rounded bg-zinc-950 border-white/20 text-white focus:ring-white"
              />
              <span>Marcar como Missão Extra / Bônus (★)</span>
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
      </CustomDialog>

      {/* Modal: Confirmar Exclusão de Lista */}
      <CustomDialog
        isOpen={!!deleteListTarget}
        onClose={() => setDeleteListTarget(null)}
        title="Excluir Lista de Missões"
        description={`Deseja excluir a lista "${deleteListTarget?.name}"? As missões vinculadas a ela não serão apagadas, mas perderão a categorização desta lista.`}
        confirmLabel={deletingList ? 'Excluindo...' : 'Sim, Excluir Lista'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteList}
        isLoading={deletingList}
      />

      {/* Modal: Confirmar Exclusão de Missão */}
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

      {/* Modal: Confirmar Exclusão de Semana */}
      <CustomDialog
        isOpen={!!deleteWeekTarget}
        onClose={() => setDeleteWeekTarget(null)}
        title="Excluir Semana de Missões"
        description={`Tem certeza que deseja excluir "${deleteWeekTarget?.title}" e todas as missões cadastradas nesta semana? Esta ação não pode ser desfeita.`}
        confirmLabel={deletingWeek ? 'Excluindo...' : 'Sim, Excluir Semana'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteWeek}
        isLoading={deletingWeek}
      />

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
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
