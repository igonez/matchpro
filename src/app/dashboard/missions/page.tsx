'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  Edit3,
  Dumbbell,
  Activity,
  Utensils,
  Droplets,
  Sparkles,
  Lock,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Copy,
  AlertCircle,
  ListPlus,
  Camera,
  Timer,
  MousePointerClick,
  FileText,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { createClient } from '@/lib/supabase/client';

const DEFAULT_PRESET_LISTS = [
  {
    id: 'preset-treino',
    key: 'treino',
    name: 'Bloco de Treinos',
    categoryLabel: 'Treino',
    color: 'amber',
    validation_type: 'timer',
    daily_limit: 1,
    description: 'Treinos de força e resistência com cronômetro e câmera (1/dia)',
  },
  {
    id: 'preset-cardio',
    key: 'cardio',
    name: 'Bloco de Cardios',
    categoryLabel: 'Cardio',
    color: 'cyan',
    validation_type: 'timer',
    daily_limit: 1,
    description: 'Sessões aeróbicas e condicionamento com trava diária (1/dia)',
  },
  {
    id: 'preset-refeicao',
    key: 'refeicao',
    name: 'Bloco de Refeições & Nutrição',
    categoryLabel: 'Nutrição',
    color: 'emerald',
    validation_type: 'photo',
    daily_limit: 4,
    description: 'Pratos auditados ao vivo na câmera com leitura nutricional por IA',
  },
  {
    id: 'preset-habito',
    key: 'habito',
    name: 'Bloco de Hábitos & Metas',
    categoryLabel: 'Hábito',
    color: 'purple',
    validation_type: 'simple_click',
    daily_limit: 0,
    description: 'Hidratação, sono, suplementação e desafios bônus da semana',
  },
];

const LIST_CATEGORY_OPTIONS = [
  { key: 'treino', label: 'Treino' },
  { key: 'cardio', label: 'Cardio' },
  { key: 'refeicao', label: 'Nutrição' },
  { key: 'habito', label: 'Hábito' },
  { key: 'recuperacao', label: 'Recuperação' },
  { key: 'suplemento', label: 'Suplemento' },
  { key: 'pesagem', label: 'Pesagem' },
  { key: 'meta', label: 'Meta Extra' },
];

function MissionsManagerContent() {
  const searchParams = useSearchParams();
  const challengeIdParam = searchParams.get('challengeId');
  const supabase = createClient();

  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challengeIdParam || '');
  const [weeks, setWeeks] = useState<any[]>([]);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWeekMissions, setLoadingWeekMissions] = useState(false);
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [copyingFromWeek1, setCopyingFromWeek1] = useState(false);

  // Listas / Blocos de Missões Personalizadas
  const [missionLists, setMissionLists] = useState<any[]>(DEFAULT_PRESET_LISTS);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('all');

  // Modal para Criar / Editar Lista (Bloco)
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<any | null>(null);
  const [listName, setListName] = useState('');
  const [listCategoryKey, setListCategoryKey] = useState('treino');
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

  // Modais de Confirmação & Toasts
  const [deleteMissionTarget, setDeleteMissionTarget] = useState<{ id: string; title: string } | null>(null);
  const [deletingMission, setDeletingMission] = useState(false);
  const [deleteWeekTarget, setDeleteWeekTarget] = useState<{ id: string; title: string } | null>(null);
  const [deletingWeek, setDeletingWeek] = useState(false);
  const [editingWeekTitle, setEditingWeekTitle] = useState(false);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Carregar lista de desafios exclusivos do profissional
  useEffect(() => {
    async function fetchChallenges() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('challenges')
        .select('id, title, start_date, end_date, is_active')
        .eq('professional_id', user.id)
        .order('is_active', { ascending: false })
        .order('start_date', { ascending: false });

      if (data && data.length > 0) {
        setChallenges(data);
        if (!selectedChallengeId) {
          const matched = data.find((c: any) => c.id === challengeIdParam);
          setSelectedChallengeId(matched ? matched.id : data[0].id);
        }
      }
      setLoading(false);
    }
    fetchChallenges();
  }, [challengeIdParam, supabase]);

  const currentChallenge = useMemo(
    () => challenges.find((c) => c.id === selectedChallengeId) || null,
    [challenges, selectedChallengeId]
  );

  // Cálculo cronológico das 4 semanas baseado em currentChallenge.start_date
  const weekScheduleInfo = useMemo(() => {
    const startRaw = currentChallenge?.start_date
      ? new Date(currentChallenge.start_date + 'T00:00:00')
      : new Date(new Date().setHours(0, 0, 0, 0));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDaysFromStart = Math.floor((today.getTime() - startRaw.getTime()) / 86400000);
    const activeWeekNum = Math.min(4, Math.max(1, Math.floor(Math.max(0, diffDaysFromStart) / 7) + 1));

    const byWeek: Record<
      number,
      {
        weekNumber: number;
        startDate: Date;
        endDate: Date;
        daysUntilStart: number;
        isFuture: boolean;
        isCurrent: boolean;
        isPast: boolean;
        formattedRange: string;
      }
    > = {};

    const maxWeek = Math.max(4, weeks.length);
    for (let w = 1; w <= maxWeek; w++) {
      const wStart = new Date(startRaw.getTime() + (w - 1) * 7 * 86400000);
      const wEnd = new Date(wStart.getTime() + 6 * 86400000);
      const daysUntilStart = Math.ceil((wStart.getTime() - today.getTime()) / 86400000);
      const isFuture = daysUntilStart > 0;
      const isPast = today.getTime() > wEnd.getTime();
      const isCurrent = !isFuture && !isPast;

      const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      byWeek[w] = {
        weekNumber: w,
        startDate: wStart,
        endDate: wEnd,
        daysUntilStart: Math.max(0, daysUntilStart),
        isFuture,
        isCurrent,
        isPast,
        formattedRange: `${fmt(wStart)} a ${fmt(wEnd)}`,
      };
    }

    return { activeWeekNum, byWeek };
  }, [currentChallenge, weeks.length]);

  // 2. Carregar semanas do desafio selecionado (garantindo as 4 semanas no seletor)
  const fetchWeeks = async (challengeId: string) => {
    const { data } = await supabase
      .from('challenge_weeks')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('week_number', { ascending: true });

    const dbWeeks = data || [];
    const maxWeekNum = Math.max(4, ...dbWeeks.map((w: any) => Number(w.week_number || 0)));
    const normalizedWeeks: any[] = [];

    for (let num = 1; num <= maxWeekNum; num++) {
      const found = dbWeeks.find((w: any) => Number(w.week_number) === num);
      if (found) {
        normalizedWeeks.push(found);
      } else {
        normalizedWeeks.push({
          id: `virtual-week-${num}`,
          challenge_id: challengeId,
          week_number: num,
          title: `Semana ${num}`,
          bonus_points: 20,
          isVirtual: true,
        });
      }
    }

    setWeeks(normalizedWeeks);
    setSelectedWeekNumber(1);
  };

  // Carregar listas/trilhas de missões personalizadas do desafio
  const fetchMissionLists = async (challengeId: string) => {
    if (!challengeId) return;
    try {
      const { data } = await supabase
        .from('challenge_mission_lists')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMissionLists(data);
      } else {
        setMissionLists(DEFAULT_PRESET_LISTS);
      }
    } catch {
      setMissionLists(DEFAULT_PRESET_LISTS);
    }
  };

  useEffect(() => {
    if (selectedChallengeId) {
      fetchWeeks(selectedChallengeId);
      fetchMissionLists(selectedChallengeId);
    }
  }, [selectedChallengeId]);

  const selectedWeek = useMemo(
    () => weeks.find((w) => Number(w.week_number) === selectedWeekNumber) || weeks[0],
    [weeks, selectedWeekNumber]
  );

  const selectedWeekMeta = weekScheduleInfo.byWeek[selectedWeekNumber] || weekScheduleInfo.byWeek[1];

  // Garantir que uma semana virtual exista no banco antes de inserir missões nela
  const ensureRealWeek = async (weekObj: any): Promise<any> => {
    if (!weekObj.isVirtual) return weekObj;
    const { data, error } = await supabase
      .from('challenge_weeks')
      .insert({
        challenge_id: selectedChallengeId,
        week_number: weekObj.week_number,
        title: weekObj.title || `Semana ${weekObj.week_number}`,
        bonus_points: weekObj.bonus_points || 20,
      })
      .select()
      .single();

    if (error) throw error;
    setWeeks((prev) =>
      prev.map((w) => (Number(w.week_number) === Number(weekObj.week_number) ? data : w))
    );
    return data;
  };

  // 3. Carregar missões estritamente da semana selecionada (sem repetir Semana 1 nas Semanas 2, 3 e 4)
  const fetchMissionsForWeek = async (weekObj: any, weekNum: number) => {
    if (!selectedChallengeId || !weekObj) return;
    setLoadingWeekMissions(true);
    try {
      let result: any[] = [];

      if (!weekObj.isVirtual && weekObj.id) {
        const { data } = await supabase
          .from('missions')
          .select('*')
          .eq('week_id', weekObj.id)
          .order('order_index', { ascending: true });

        result = data || [];
      }

      // Somente na Semana 1 buscamos missões legadas sem week_id
      if (result.length === 0 && weekNum === 1) {
        const { data: legacyMissions } = await supabase
          .from('missions')
          .select('*')
          .eq('challenge_id', selectedChallengeId)
          .is('week_id', null)
          .order('order_index', { ascending: true });

        if (legacyMissions && legacyMissions.length > 0) {
          result = legacyMissions;
        }
      }

      setMissions(result);
    } finally {
      setLoadingWeekMissions(false);
    }
  };

  useEffect(() => {
    if (selectedWeek && selectedChallengeId) {
      fetchMissionsForWeek(selectedWeek, selectedWeekNumber);
    }
  }, [selectedWeek, selectedWeekNumber, selectedChallengeId]);

  // Copiar missões da Semana 1 para a semana selecionada (ex: Semana 2, 3 ou 4)
  const handleCopyFromWeek1 = async () => {
    if (!selectedChallengeId || selectedWeekNumber === 1) return;
    setCopyingFromWeek1(true);
    try {
      const week1Obj = weeks.find((w) => Number(w.week_number) === 1);
      let sourceMissions: any[] = [];

      if (week1Obj && !week1Obj.isVirtual) {
        const { data } = await supabase
          .from('missions')
          .select('*')
          .eq('week_id', week1Obj.id)
          .order('order_index', { ascending: true });
        sourceMissions = data || [];
      }

      if (sourceMissions.length === 0) {
        const { data: legacy } = await supabase
          .from('missions')
          .select('*')
          .eq('challenge_id', selectedChallengeId)
          .is('week_id', null)
          .order('order_index', { ascending: true });
        sourceMissions = legacy || [];
      }

      if (sourceMissions.length === 0) {
        showToast('A Semana 1 ainda não possui missões para copiar. Use "Gerar Template (4 Semanas)".');
        return;
      }

      const targetRealWeek = await ensureRealWeek(selectedWeek);

      const clonedPayload = sourceMissions.map((m: any, idx: number) => {
        const rawTitle = String(m.title || '');
        const updatedTitle = rawTitle.includes('Semana 1')
          ? rawTitle.replace(/Semana 1/g, `Semana ${selectedWeekNumber}`)
          : `${rawTitle} • Semana ${selectedWeekNumber}`;
        return {
          challenge_id: selectedChallengeId,
          week_id: targetRealWeek.id,
          title: updatedTitle,
          category: m.category,
          list_id: m.list_id || null,
          validation_type: m.validation_type || 'photo',
          daily_limit: m.daily_limit ?? 1,
          points_rewarded: m.points_rewarded || 10,
          requires_cooldown: m.requires_cooldown ?? false,
          cooldown_hours: m.cooldown_hours || 4,
          order_index: idx + 1,
          is_bonus: m.is_bonus ?? false,
        };
      });

      let { data: inserted, error } = await supabase.from('missions').insert(clonedPayload).select();
      if (error) {
        const basicCloned = clonedPayload.map((m) => ({
          challenge_id: m.challenge_id,
          week_id: m.week_id,
          title: m.title,
          category: m.category,
          points_rewarded: m.points_rewarded,
          requires_cooldown: m.requires_cooldown,
          is_bonus: m.is_bonus,
          order_index: m.order_index,
        }));
        const res = await supabase.from('missions').insert(basicCloned).select();
        inserted = res.data;
      }

      if (inserted) {
        setMissions(inserted);
        showToast(`${inserted.length} missões copiadas para a Semana ${selectedWeekNumber}!`);
      }
    } catch (err: any) {
      showToast('Erro ao copiar missões: ' + err.message);
    } finally {
      setCopyingFromWeek1(false);
    }
  };

  // Handlers para Criar / Editar / Excluir Blocos/Listas de Missões
  const handleOpenCreateListModal = () => {
    setEditingList(null);
    setListName('');
    setListCategoryKey('treino');
    setListValidationType('photo');
    setListDailyLimit('1');
    setIsListModalOpen(true);
  };

  const handleOpenEditListModal = (list: any) => {
    setEditingList(list);
    setListName(list.name);
    setListCategoryKey(list.key || 'treino');
    setListValidationType(list.validation_type || 'photo');
    setListDailyLimit(list.daily_limit?.toString() || '1');
    setIsListModalOpen(true);
  };

  const handleSaveList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeId || !listName.trim()) return;

    setSubmittingList(true);
    try {
      const catOption = LIST_CATEGORY_OPTIONS.find((o) => o.key === listCategoryKey);
      const payload: any = {
        challenge_id: selectedChallengeId,
        name: listName.trim(),
        key: listCategoryKey || 'habito',
        icon: catOption?.label || 'Meta',
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
        showToast(`Bloco "${data.name}" atualizado!`);
      } else {
        const { data, error } = await supabase
          .from('challenge_mission_lists')
          .insert(payload)
          .select()
          .single();
        if (error) {
          const localNewList = { ...payload, id: `custom-${Date.now()}` };
          setMissionLists((prev) => [...prev, localNewList]);
        } else if (data) {
          setMissionLists((prev) => [...prev, data]);
        }
        showToast(`Novo bloco de missões criado com sucesso!`);
      }
      setIsListModalOpen(false);
      setEditingList(null);
    } catch (err: any) {
      showToast('Erro ao salvar bloco: ' + err.message);
    } finally {
      setSubmittingList(false);
    }
  };

  const handleConfirmDeleteList = async () => {
    if (!deleteListTarget) return;
    setDeletingList(true);
    try {
      if (!deleteListTarget.id.startsWith('preset-')) {
        await supabase.from('challenge_mission_lists').delete().eq('id', deleteListTarget.id);
      }
      const remaining = missionLists.filter((l) => l.id !== deleteListTarget.id);
      setMissionLists(remaining);
      setSelectedBlockFilter('all');
      showToast(`Bloco "${deleteListTarget.name}" removido.`);
      setDeleteListTarget(null);
    } catch (err: any) {
      showToast('Erro ao excluir bloco: ' + err.message);
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
      const realWeeks: any[] = [];
      for (let wNum = 1; wNum <= 4; wNum++) {
        const existing = weeks.find((w) => Number(w.week_number) === wNum);
        if (existing && !existing.isVirtual) {
          realWeeks.push(existing);
        } else {
          const { data: created, error: wErr } = await supabase
            .from('challenge_weeks')
            .insert({
              challenge_id: selectedChallengeId,
              week_number: wNum,
              title: `Semana ${wNum}`,
              bonus_points: 20,
            })
            .select()
            .single();
          if (wErr) throw wErr;
          if (created) realWeeks.push(created);
        }
      }

      setWeeks(realWeeks);

      const allMissionsToInsert: any[] = [];
      for (const week of realWeeks) {
        const { count } = await supabase
          .from('missions')
          .select('*', { count: 'exact', head: true })
          .eq('week_id', week.id);

        if ((count || 0) > 0) continue;

        for (let t = 1; t <= 6; t++) {
          allMissionsToInsert.push({
            challenge_id: selectedChallengeId,
            week_id: week.id,
            title: `Treino #${t} da Semana ${week.week_number}`,
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

        for (let c = 1; c <= 7; c++) {
          allMissionsToInsert.push({
            challenge_id: selectedChallengeId,
            week_id: week.id,
            title: `Cardio #${c} (Mín. 30min) • Semana ${week.week_number}`,
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

        const meals = ['Café da Manhã Equilibrado', 'Almoço Nutritivo', 'Lanche Proteico', 'Jantar Leve'];
        meals.forEach((meal, idx) => {
          allMissionsToInsert.push({
            challenge_id: selectedChallengeId,
            week_id: week.id,
            title: `${meal} • Semana ${week.week_number}`,
            category: 'refeicao',
            validation_type: 'photo',
            daily_limit: 1,
            target_frequency: 7,
            points_rewarded: 10,
            requires_cooldown: false,
            order_index: idx + 1,
            is_bonus: false,
          });
        });

        allMissionsToInsert.push({
          challenge_id: selectedChallengeId,
          week_id: week.id,
          title: `Meta Bônus: 3L Água + Mobilidade • Semana ${week.week_number}`,
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
        const { error: mErr } = await supabase.from('missions').insert(allMissionsToInsert);
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

      const activeW = realWeeks.find((w) => Number(w.week_number) === selectedWeekNumber) || realWeeks[0];
      if (activeW) {
        await fetchMissionsForWeek(activeW, selectedWeekNumber);
      }
      showToast('Cronograma completo de 4 semanas gerado com sucesso!');
    } catch (err: any) {
      showToast('Erro ao gerar template: ' + err.message);
    } finally {
      setGeneratingTemplate(false);
    }
  };

  // Abrir Modal para Criar Missão em um Bloco específico
  const handleOpenCreateModal = (targetBlock?: any) => {
    const list = targetBlock || missionLists[0] || DEFAULT_PRESET_LISTS[0];
    setEditingMission(null);
    setFormTitle('');
    setFormListId(list?.id && !list.id.startsWith('preset-') ? list.id : list?.id || 'preset-treino');
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
    const matchingPreset = missionLists.find(
      (l) => (mission.list_id && l.id === mission.list_id) || l.key === mission.category
    );
    setFormListId(mission.list_id || matchingPreset?.id || 'preset-treino');
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
    if (!selectedChallengeId || !selectedWeek || !formTitle.trim()) return;

    setSubmittingMission(true);
    try {
      const realWeek = await ensureRealWeek(selectedWeek);
      const selectedListObj = missionLists.find((l) => l.id === formListId);
      const resolvedCategory = selectedListObj?.key || formCategory || 'treino';

      const payload: any = {
        challenge_id: selectedChallengeId,
        week_id: realWeek.id,
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
        const { error } = await supabase.from('missions').update(payload).eq('id', editingMission.id);
        if (error) {
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
        payload.order_index = missions.length + 1;
        const { data, error } = await supabase.from('missions').insert(payload).select().single();

        if (error) {
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
      showToast(`Missão salva na Semana ${selectedWeekNumber}!`);
    } catch (err: any) {
      showToast('Erro ao salvar missão: ' + err.message);
    } finally {
      setSubmittingMission(false);
    }
  };

  // Excluir Missão
  const handleConfirmDeleteMission = async () => {
    if (!deleteMissionTarget) return;
    setDeletingMission(true);
    try {
      const { error } = await supabase.from('missions').delete().eq('id', deleteMissionTarget.id);
      if (error) throw error;
      setMissions((prev) => prev.filter((m) => m.id !== deleteMissionTarget.id));
      showToast(`Missão "${deleteMissionTarget.title}" excluída.`);
      setDeleteMissionTarget(null);
    } catch (err: any) {
      showToast('Erro ao excluir missão: ' + err.message);
    } finally {
      setDeletingMission(false);
    }
  };

  // Excluir Semana
  const handleConfirmDeleteWeek = async () => {
    if (!deleteWeekTarget) return;
    setDeletingWeek(true);
    try {
      if (!deleteWeekTarget.id.startsWith('virtual-')) {
        await supabase.from('missions').delete().eq('week_id', deleteWeekTarget.id);
        await supabase.from('challenge_weeks').delete().eq('id', deleteWeekTarget.id);
      }
      setMissions([]);
      await fetchWeeks(selectedChallengeId);
      showToast(`Missões da "${deleteWeekTarget.title}" limpas com sucesso.`);
      setDeleteWeekTarget(null);
    } catch (err: any) {
      showToast('Erro ao limpar semana: ' + err.message);
    } finally {
      setDeletingWeek(false);
    }
  };

  // Renomear Semana
  const handleSaveWeekTitle = async () => {
    if (!selectedWeek || !newWeekTitle.trim()) {
      setEditingWeekTitle(false);
      return;
    }
    try {
      const realWeek = await ensureRealWeek(selectedWeek);
      const { error } = await supabase
        .from('challenge_weeks')
        .update({ title: newWeekTitle.trim() })
        .eq('id', realWeek.id);
      if (error) throw error;
      setWeeks((prev) =>
        prev.map((w) => (Number(w.week_number) === selectedWeekNumber ? { ...w, title: newWeekTitle.trim() } : w))
      );
      showToast('Título da semana atualizado!');
    } catch (err: any) {
      showToast('Erro ao atualizar título: ' + err.message);
    } finally {
      setEditingWeekTitle(false);
    }
  };

  // Adicionar Nova Semana Extra
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
        setWeeks((prev) => [...prev, data]);
        setSelectedWeekNumber(nextNum);
        showToast(`Semana ${nextNum} adicionada!`);
      }
    } catch (err: any) {
      showToast('Erro ao criar semana: ' + err.message);
    }
  };

  const getBlockIcon = (key?: string, className = 'w-4 h-4') => {
    switch (key) {
      case 'treino':
        return <Dumbbell className={className} />;
      case 'cardio':
        return <Activity className={className} />;
      case 'refeicao':
        return <Utensils className={className} />;
      case 'habito':
        return <Droplets className={className} />;
      default:
        return <Target className={className} />;
    }
  };

  const getBlockAccent = (key?: string) => {
    switch (key) {
      case 'treino':
        return {
          border: 'border-amber-500/25',
          headerBg: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
          label: 'Treino',
        };
      case 'cardio':
        return {
          border: 'border-cyan-500/25',
          headerBg: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300',
          label: 'Cardio',
        };
      case 'refeicao':
        return {
          border: 'border-emerald-500/25',
          headerBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
          label: 'Nutrição',
        };
      case 'habito':
        return {
          border: 'border-purple-500/25',
          headerBg: 'bg-purple-500/10 border-purple-500/25 text-purple-300',
          label: 'Hábito',
        };
      default:
        return {
          border: 'border-white/15',
          headerBg: 'bg-white/10 border-white/20 text-zinc-200',
          label: 'Personalizado',
        };
    }
  };

  // Blocos visuais a renderizar (garantindo sempre os 4 blocos principais + blocos extras do coach)
  const visualBlocks = useMemo(() => {
    const blocks = [...DEFAULT_PRESET_LISTS];
    missionLists.forEach((custom) => {
      const alreadyByKey = blocks.find((b) => b.key === custom.key && custom.id.startsWith('preset-'));
      if (!alreadyByKey && !blocks.some((b) => b.id === custom.id)) {
        if (blocks.some((b) => b.key === custom.key)) {
          // Atualiza o bloco preset correspondente com o ID real do banco
          const idx = blocks.findIndex((b) => b.key === custom.key);
          if (idx >= 0) {
            blocks[idx] = {
              ...blocks[idx],
              ...custom,
              description: blocks[idx].description,
            };
          }
        } else {
          blocks.push({
            ...custom,
            categoryLabel: custom.name,
            description: 'Bloco personalizado criado pelo treinador',
          });
        }
      }
    });
    return blocks;
  }, [missionLists]);

  const totalWeekXp = useMemo(
    () => missions.reduce((acc, m) => acc + Number(m.points_rewarded || 0), 0),
    [missions]
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header com Seletor de Desafio e Ações Globais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
            PLANEJADOR DE CRONOGRAMA • 4 SEMANAS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestão de Missões em Blocos
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Organize as tarefas da turma em blocos visuais de Treino, Cardio, Nutrição e Hábitos para cada semana.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          {challenges.length > 0 && (
            <select
              value={selectedChallengeId}
              onChange={(e) => setSelectedChallengeId(e.target.value)}
              className="h-10 flex-1 sm:flex-initial rounded-xl border border-white/15 bg-zinc-950 px-3.5 text-xs font-bold text-white focus:outline-none focus:border-white/30 font-mono"
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.is_active ? '(Ativo)' : ''}
                </option>
              ))}
            </select>
          )}

          <Button
            size="sm"
            onClick={handleGenerateSmartTemplate}
            disabled={!selectedChallengeId || generatingTemplate}
            className="w-full sm:w-auto rounded-xl h-10 px-4 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200 shadow-lg uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {generatingTemplate ? 'Gerando 4 Semanas...' : 'Gerar Template (4 Semanas)'}
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreateListModal}
            disabled={!selectedChallengeId}
            variant="outline"
            className="w-full sm:w-auto rounded-xl h-10 px-3.5 text-xs font-mono font-bold border-white/15 text-zinc-200 hover:text-white hover:bg-white/10"
          >
            <ListPlus className="h-4 w-4 mr-1.5" />
            Novo Bloco
          </Button>
        </div>
      </div>

      {/* BLOCO 1: Seletor de Semanas (Semana 1, 2, 3, 4) + Aviso Cronológico */}
      {weeks.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {weeks.map((week) => {
              const wNum = Number(week.week_number);
              const isSelected = wNum === selectedWeekNumber;
              const meta = weekScheduleInfo.byWeek[wNum];

              return (
                <button
                  key={week.id || wNum}
                  type="button"
                  onClick={() => {
                    setSelectedWeekNumber(wNum);
                    setEditingWeekTitle(false);
                    if (meta?.isFuture) {
                      showToast(
                        `Aviso: A Semana ${wNum} começa daqui a ${meta.daysUntilStart} ${
                          meta.daysUntilStart === 1 ? 'dia' : 'dias'
                        } (${meta.startDate.toLocaleDateString('pt-BR')}).`
                      );
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'border-white bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.15)]'
                      : meta?.isCurrent
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-white hover:border-emerald-400'
                      : 'border-white/10 bg-zinc-950/80 text-zinc-400 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-mono font-black uppercase tracking-tight">
                      Semana {wNum}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-black/15 text-black'
                          : meta?.isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : meta?.isFuture
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-white/5 text-zinc-400'
                      }`}
                    >
                      {meta?.isCurrent
                        ? 'Em andamento'
                        : meta?.isFuture
                        ? `Em ${meta.daysUntilStart}d`
                        : 'Concluída'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[10px] font-mono opacity-80">
                    <span>{meta?.formattedRange || `Ciclo ${wNum}`}</span>
                    <span>+{week.bonus_points || 20} XP</span>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleCreateNewWeek}
              className="p-3.5 rounded-2xl border border-dashed border-white/15 bg-zinc-950/40 text-zinc-400 hover:text-white hover:border-white/30 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-xs font-mono"
            >
              <Plus className="h-4 w-4" />
              <span>+ Nova Semana</span>
            </button>
          </div>

          {/* BANNER DE AVISO CRONOLÓGICO DA SEMANA SELECIONADA */}
          {selectedWeekMeta && (
            <div
              className={`p-5 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                selectedWeekMeta.isFuture
                  ? 'border-amber-400/35 bg-gradient-to-r from-amber-500/15 via-zinc-950 to-zinc-950'
                  : selectedWeekMeta.isCurrent
                  ? 'border-emerald-500/35 bg-gradient-to-r from-emerald-500/15 via-zinc-950 to-zinc-950'
                  : 'border-white/15 bg-zinc-950'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                    selectedWeekMeta.isFuture
                      ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                      : selectedWeekMeta.isCurrent
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/10 border-white/20 text-zinc-300'
                  }`}
                >
                  {selectedWeekMeta.isFuture ? (
                    <Lock className="w-5 h-5" />
                  ) : selectedWeekMeta.isCurrent ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <Calendar className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        selectedWeekMeta.isFuture
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                          : selectedWeekMeta.isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/10 text-zinc-300 border-white/20'
                      }`}
                    >
                      {selectedWeekMeta.isFuture
                        ? `PROGRAMAÇÃO FUTURA • SEMANA ${selectedWeekNumber}`
                        : selectedWeekMeta.isCurrent
                        ? `SEMANA ${selectedWeekNumber} ATIVA AGORA`
                        : `SEMANA ${selectedWeekNumber} ENCERRADA`}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Período: {selectedWeekMeta.formattedRange}
                    </span>
                  </div>

                  {selectedWeekMeta.isFuture ? (
                    <>
                      <h2 className="text-lg font-black text-white tracking-tight">
                        Semana {selectedWeekNumber} começa em {selectedWeekMeta.daysUntilStart}{' '}
                        {selectedWeekMeta.daysUntilStart === 1 ? 'dia' : 'dias'} (
                        {selectedWeekMeta.startDate.toLocaleDateString('pt-BR')})
                      </h2>
                      <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                        No aplicativo do aluno, esta semana aparece bloqueada com a contagem regressiva até{' '}
                        <strong className="text-amber-300">
                          {selectedWeekMeta.startDate.toLocaleDateString('pt-BR')}
                        </strong>
                        . Você já pode deixar os blocos de missões da Semana {selectedWeekNumber} prontos abaixo.
                      </p>
                    </>
                  ) : selectedWeekMeta.isCurrent ? (
                    <>
                      <h2 className="text-lg font-black text-white tracking-tight">
                        Semana {selectedWeekNumber} em Andamento • {missions.length} missões configuradas ({totalWeekXp} XP)
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Os alunos estão realizando check-ins nos blocos desta semana agora.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-black text-white tracking-tight">
                        Histórico da Semana {selectedWeekNumber} • {missions.length} missões ({totalWeekXp} XP)
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Período concluído em {selectedWeekMeta.endDate.toLocaleDateString('pt-BR')}.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Ações Rápidas da Semana Selecionada */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {selectedWeekNumber > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyFromWeek1}
                    disabled={copyingFromWeek1}
                    className="h-9 px-3 rounded-xl text-xs font-mono font-bold border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {copyingFromWeek1 ? 'Copiando...' : `Copiar da Semana 1`}
                  </Button>
                )}

                {editingWeekTitle ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={newWeekTitle}
                      onChange={(e) => setNewWeekTitle(e.target.value)}
                      placeholder="Título da semana..."
                      className="h-9 w-44 text-xs bg-zinc-900 border-white/20 text-white rounded-xl"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveWeekTitle}
                      className="h-9 px-3 text-xs bg-white text-black font-bold rounded-xl"
                    >
                      Salvar
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewWeekTitle(selectedWeek?.title || `Semana ${selectedWeekNumber}`);
                      setEditingWeekTitle(true);
                    }}
                    className="h-9 px-3 rounded-xl text-xs border-white/10 text-zinc-300 hover:text-white"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Renomear
                  </Button>
                )}

                {missions.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDeleteWeekTarget({
                        id: selectedWeek?.id || `virtual-week-${selectedWeekNumber}`,
                        title: `Semana ${selectedWeekNumber}`,
                      })
                    }
                    className="h-9 px-3 rounded-xl text-xs border-red-500/25 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Limpar Semana
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BLOCO 2: Barra de Filtro de Blocos da Semana */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedBlockFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedBlockFilter === 'all'
                ? 'bg-white text-black shadow-md'
                : 'bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Todos os Blocos ({missions.length} missões)
          </button>

          {visualBlocks.map((block) => {
            const count = missions.filter((m) =>
              m.list_id && !block.id.startsWith('preset-')
                ? m.list_id === block.id
                : m.category === block.key
            ).length;
            const isSelected = selectedBlockFilter === block.key;

            return (
              <button
                key={block.id}
                type="button"
                onClick={() => setSelectedBlockFilter((prev) => (prev === block.key ? 'all' : block.key))}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-black shadow-md'
                    : 'bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {getBlockIcon(block.key, 'w-3.5 h-3.5')}
                <span>{block.name}</span>
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <Button
          size="sm"
          onClick={() => handleOpenCreateModal()}
          className="rounded-xl h-9 px-4 text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nova Missão na Semana {selectedWeekNumber}
        </Button>
      </div>

      {/* BLOCO 3: Grid de Blocos Visuais de Missões da Semana Selecionada */}
      {loading || loadingWeekMissions ? (
        <div className="py-16 text-center text-xs font-mono text-zinc-500">
          CARREGANDO BLOCOS DA SEMANA {selectedWeekNumber}...
        </div>
      ) : missions.length === 0 ? (
        <Card className="border-white/10 bg-zinc-950/90 rounded-3xl p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              SEMANA {selectedWeekNumber} SEM MISSÕES CADASTRADAS
            </span>
            <h3 className="text-lg font-black text-white">
              {selectedWeekMeta?.isFuture
                ? `A Semana ${selectedWeekNumber} começa em ${selectedWeekMeta.daysUntilStart} ${
                    selectedWeekMeta.daysUntilStart === 1 ? 'dia' : 'dias'
                  }`
                : `Configure os blocos da Semana ${selectedWeekNumber}`}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Você pode copiar as missões da Semana 1 para esta semana com 1 clique, gerar o template completo das 4 semanas ou criar missões manualmente em cada bloco.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {selectedWeekNumber > 1 && (
              <Button
                size="sm"
                onClick={handleCopyFromWeek1}
                disabled={copyingFromWeek1}
                className="rounded-xl text-xs font-mono font-bold bg-amber-400 text-black hover:bg-amber-300"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                {copyingFromWeek1 ? 'Copiando...' : `Copiar Missões da Semana 1 para Semana ${selectedWeekNumber}`}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleGenerateSmartTemplate}
              disabled={generatingTemplate}
              className="rounded-xl text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {generatingTemplate ? 'Gerando...' : 'Preencher Todas as 4 Semanas'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenCreateModal()}
              className="rounded-xl text-xs font-mono border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Criar Missão Manual
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {visualBlocks
            .filter((b) => selectedBlockFilter === 'all' || b.key === selectedBlockFilter)
            .map((block) => {
              const blockMissions = missions.filter((m) =>
                m.list_id && !block.id.startsWith('preset-')
                  ? m.list_id === block.id
                  : m.category === block.key
              );
              const blockTotalXp = blockMissions.reduce(
                (acc, m) => acc + Number(m.points_rewarded || 0),
                0
              );
              const accent = getBlockAccent(block.key);
              const isCustomBlock = !block.id.startsWith('preset-');

              return (
                <Card
                  key={block.id}
                  className={`border ${accent.border} bg-zinc-950/90 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl`}
                >
                  <div>
                    <CardHeader className="pb-3.5 border-b border-white/[0.06] flex flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`h-10 w-10 rounded-2xl border flex items-center justify-center shrink-0 ${accent.headerBg}`}
                        >
                          {getBlockIcon(block.key, 'w-5 h-5')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base font-black text-white tracking-tight">
                              {block.name}
                            </CardTitle>
                            <Badge className="bg-white/15 text-white border-white/25 text-[10px] font-mono">
                              Semana {selectedWeekNumber}
                            </Badge>
                            <Badge className="bg-white/10 text-zinc-200 border-white/15 text-[10px] font-mono">
                              {blockMissions.length} {blockMissions.length === 1 ? 'missão' : 'missões'}
                            </Badge>
                            <Badge className="bg-amber-400/15 text-amber-300 border-amber-400/30 text-[10px] font-mono">
                              {blockTotalXp} XP
                            </Badge>
                          </div>
                          <CardDescription className="text-xs text-zinc-400 mt-1">
                            {block.description}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCustomBlock && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditListModal(block)}
                              className="h-8 w-8 text-zinc-400 hover:text-white"
                              title="Editar Bloco"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteListTarget({ id: block.id, name: block.name })}
                              className="h-8 w-8 text-zinc-500 hover:text-red-400"
                              title="Excluir Bloco"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleOpenCreateModal(block)}
                          className="h-8 px-3 rounded-xl text-xs font-mono font-bold bg-white text-black hover:bg-zinc-200"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      {blockMissions.length === 0 ? (
                        <div className="py-8 text-center space-y-2 border border-dashed border-white/10 rounded-2xl">
                          <p className="text-xs font-mono text-zinc-400">
                            Nenhuma missão neste bloco para a Semana {selectedWeekNumber}.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenCreateModal(block)}
                            className="h-8 text-xs rounded-xl border-white/15 text-zinc-300 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Criar Missão de {accent.label}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {blockMissions.map((m, idx) => (
                            <div
                              key={m.id}
                              className="p-3 rounded-2xl bg-zinc-900/60 border border-white/[0.07] hover:border-white/20 flex items-center justify-between gap-3 transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                                  #{idx + 1}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="font-bold text-xs sm:text-sm text-white truncate">
                                      {m.title}
                                    </p>
                                    {m.is_bonus && (
                                      <Badge className="bg-amber-400/15 text-amber-300 border-amber-400/30 text-[9px] font-mono uppercase">
                                        BÔNUS
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
                                    <span className="text-amber-300 font-bold">+{m.points_rewarded} XP</span>
                                    <span>•</span>
                                    <span>
                                      {m.validation_type === 'timer'
                                        ? 'Cronômetro'
                                        : m.validation_type === 'simple_click'
                                        ? 'Check-in 1-Toque'
                                        : m.validation_type === 'text'
                                        ? 'Texto'
                                        : 'Foto na Câmera'}
                                    </span>
                                    {m.requires_cooldown && (
                                      <>
                                        <span>•</span>
                                        <span className="text-zinc-300">Limite 1/dia</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditModal(m)}
                                  className="h-8 px-2 text-xs text-zinc-400 hover:text-white"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteMissionTarget({ id: m.id, title: m.title })}
                                  className="h-8 w-8 text-zinc-500 hover:text-red-400"
                                  title="Excluir Missão"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
        </div>
      )}

      {/* Modal: Criar / Editar Bloco de Missões */}
      <CustomDialog
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        title={editingList ? 'Editar Bloco de Missões' : 'Novo Bloco de Missões'}
        description="Crie blocos temáticos personalizados para organizar as tarefas da sua turma."
        hideFooter
      >
        <form onSubmit={handleSaveList} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Nome do Bloco</label>
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Bloco de Suplementação, Mobilidade, Mindset..."
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Pilar / Categoria do Bloco
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-xl bg-zinc-950 border border-white/10">
              {LIST_CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setListCategoryKey(opt.key)}
                  className={`h-9 px-2 rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-all cursor-pointer ${
                    listCategoryKey === opt.key
                      ? 'bg-white text-black shadow-sm'
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {opt.label}
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
                <option value="photo">Foto Obrigatória</option>
                <option value="timer">Cronômetro de Sessão</option>
                <option value="simple_click">Check-in 1-Toque (Sem foto)</option>
                <option value="text">Relato em Texto</option>
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
              {submittingList ? 'Salvando...' : 'Salvar Bloco'}
            </Button>
          </div>
        </form>
      </CustomDialog>

      {/* Modal: Criar / Editar Missão */}
      <CustomDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMission ? 'Editar Missão' : `Nova Missão • Semana ${selectedWeekNumber}`}
        description="Defina os parâmetros, bloco de destino e regras de comprovação."
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
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Bloco de Destino</label>
              <select
                value={formListId}
                onChange={(e) => {
                  setFormListId(e.target.value);
                  const selectedList = visualBlocks.find((l) => l.id === e.target.value);
                  if (selectedList) {
                    setFormCategory(selectedList.key);
                    setFormValidationType(
                      (selectedList.validation_type as 'photo' | 'timer' | 'simple_click' | 'text') || 'photo'
                    );
                  }
                }}
                className="w-full h-9 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs px-3 focus:outline-none focus:border-white/30"
              >
                {visualBlocks.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
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
                <option value="photo">Foto Obrigatória</option>
                <option value="timer">Cronômetro de Sessão</option>
                <option value="simple_click">Check-in 1-Toque</option>
                <option value="text">Relato em Texto</option>
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
      </CustomDialog>

      {/* Modal: Confirmar Exclusão de Bloco */}
      <CustomDialog
        isOpen={!!deleteListTarget}
        onClose={() => setDeleteListTarget(null)}
        title="Excluir Bloco de Missões"
        description={`Deseja excluir o bloco "${deleteListTarget?.name}"? As missões vinculadas a ele não serão apagadas.`}
        confirmLabel={deletingList ? 'Excluindo...' : 'Sim, Excluir Bloco'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteList}
        isLoading={deletingList}
      />

      {/* Modal: Confirmar Exclusão de Missão */}
      <CustomDialog
        isOpen={!!deleteMissionTarget}
        onClose={() => setDeleteMissionTarget(null)}
        title="Excluir Missão"
        description={`Tem certeza que deseja excluir a missão "${deleteMissionTarget?.title}"?`}
        confirmLabel={deletingMission ? 'Excluindo...' : 'Sim, Excluir Missão'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteMission}
        isLoading={deletingMission}
      />

      {/* Modal: Confirmar Limpeza de Semana */}
      <CustomDialog
        isOpen={!!deleteWeekTarget}
        onClose={() => setDeleteWeekTarget(null)}
        title="Limpar Missões da Semana"
        description={`Tem certeza que deseja remover todas as missões cadastradas na "${deleteWeekTarget?.title}"?`}
        confirmLabel={deletingWeek ? 'Limpando...' : 'Sim, Limpar Semana'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDeleteWeek}
        isLoading={deletingWeek}
      />

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
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
