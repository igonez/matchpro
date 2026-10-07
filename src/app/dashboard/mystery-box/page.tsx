'use client';

import React, { useEffect, useState } from 'react';
import { 
  Gift, 
  Plus, 
  Trash2, 
  Edit3,
  Sparkles, 
  Trophy, 
  Shield, 
  Percent,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function MysteryBoxConfigPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');

  // Form states (Criação e Edição)
  const [isEditing, setIsEditing] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('points');
  const [newValue, setNewValue] = useState('50');
  const [newRarity, setNewRarity] = useState('rare');
  const [newWeight, setNewWeight] = useState(25);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: challengesData } = await supabase
          .from('challenges')
          .select('id, title')
          .order('created_at', { ascending: false });

        const safeCh = challengesData || [];
        setChallenges(safeCh);
        if (safeCh.length > 0) {
          setSelectedChallengeId(safeCh[0].id);
        }

        const { data: rewardsData } = await supabase
          .from('mystery_box_rewards')
          .select('*')
          .order('created_at', { ascending: false });

        setRewards(rewardsData || []);
      } catch (err) {
        console.error('Erro ao carregar dados da Mystery Box:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const handleEditClick = (reward: any) => {
    setIsEditing(true);
    setEditingRewardId(reward.id);
    setNewTitle(reward.title);
    setNewDescription(reward.description || '');
    setNewType(reward.reward_type);
    setNewValue(reward.reward_value || '');
    setNewRarity(reward.rarity);
    setNewWeight(reward.probability_weight || 25);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingRewardId(null);
    setNewTitle('');
    setNewDescription('');
    setNewValue('50');
    setNewWeight(25);
  };

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        challenge_id: selectedChallengeId || null,
        title: newTitle.trim(),
        description: newDescription.trim() || 'Prêmio conquistado na Mystery Box semanal!',
        reward_type: newType,
        reward_value: newValue.trim(),
        rarity: newRarity,
        probability_weight: Number(newWeight) || 10,
      };

      if (isEditing && editingRewardId) {
        const { error } = await supabase
          .from('mystery_box_rewards')
          .update(payload)
          .eq('id', editingRewardId);

        if (error) throw error;
        setRewards(rewards.map((r) => (r.id === editingRewardId ? { ...r, ...payload } : r)));
        handleCancelEdit();
      } else {
        const { data, error } = await supabase
          .from('mystery_box_rewards')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setRewards([data, ...rewards]);
          handleCancelEdit();
        }
      }
    } catch (err) {
      console.error('Erro ao salvar recompensa:', err);
      alert('Não foi possível salvar a recompensa.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReward = async (id: string, title: string) => {
    if (!confirm(`Deseja realmente remover a recompensa "${title}" da roleta?`)) return;
    try {
      const { error } = await supabase.from('mystery_box_rewards').delete().eq('id', id);
      if (error) throw error;
      setRewards(rewards.filter((r) => r.id !== id));
      if (editingRewardId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error('Erro ao excluir recompensa:', err);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">Lendário ★★★</Badge>;
      case 'epic':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40">Épico ★★</Badge>;
      case 'rare':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">Raro ★</Badge>;
      default:
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">Comum</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-black tracking-wider uppercase text-[10px]">
            Efeito Dopamina & Recompensas
          </Badge>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Gift className="h-8 w-8 text-amber-400" />
          Mystery Box Semanal
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          Configure, edite ou exclua as recompensas que seus alunos podem sortear aos domingos ao completarem 100% das missões.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Criação / Edição */}
        <div className="lg:col-span-1">
          <Card className="border-zinc-800 bg-zinc-900/40 sticky top-24">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  {isEditing ? <Edit3 className="h-4 w-4 text-amber-400" /> : <Plus className="h-4 w-4 text-amber-400" />}
                  {isEditing ? 'Editar Recompensa' : 'Nova Recompensa'}
                </CardTitle>
                {isEditing && (
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 text-xs text-zinc-400">
                    <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                )}
              </div>
              <CardDescription className="text-xs text-zinc-400">
                {isEditing ? 'Atualize os parâmetros deste prêmio.' : 'Adicione um item sorteável na caixa misteriosa.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveReward} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Desafio Vinculado</label>
                  <select
                    value={selectedChallengeId}
                    onChange={(e) => setSelectedChallengeId(e.target.value)}
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">Global (Todos os Desafios)</option>
                    {challenges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Título do Prêmio *</label>
                  <input
                    type="text"
                    placeholder="Ex: +50 Pontos no Ranking"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Sessão de 30min online para calibrar seu treino e dieta"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white p-3 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">Tipo de Prêmio</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-amber-400"
                    >
                      <option value="points">Pontos no Ranking</option>
                      <option value="freeze_shield">Freeze Shield (+1)</option>
                      <option value="consultation">Consultoria / Reunião</option>
                      <option value="coupon">Cupom de Desconto</option>
                      <option value="badge">Badge Exclusiva</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">Valor / Código</label>
                    <input
                      type="text"
                      placeholder="Ex: 50 ou CUPOM10"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">Raridade</label>
                    <select
                      value={newRarity}
                      onChange={(e) => setNewRarity(e.target.value)}
                      className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-amber-400"
                    >
                      <option value="common">Comum</option>
                      <option value="rare">Raro</option>
                      <option value="epic">Épico</option>
                      <option value="legendary">Lendário</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 font-bold block mb-1">Peso da Chance (1-100)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newWeight}
                      onChange={(e) => setNewWeight(Number(e.target.value))}
                      className="w-full h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 mt-2"
                >
                  {submitting ? 'Salvando...' : isEditing ? 'Atualizar Recompensa' : 'Cadastrar na Roleta'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Recompensas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Recompensas Ativas ({rewards.length})
            </h2>
            <span className="text-xs text-zinc-500">Sorteio automatizado pelo algoritmo</span>
          </div>

          {rewards.length === 0 && !loading ? (
            <Card className="border-dashed border-zinc-800 p-8 text-center bg-zinc-900/20">
              <Gift className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-zinc-300">Nenhuma recompensa configurada</p>
              <p className="text-xs text-zinc-500 mt-1">
                Cadastre a primeira recompensa ao lado para alimentar a Mystery Box dos alunos.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {rewards.map((r) => (
                <Card
                  key={r.id}
                  className="border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      {getRarityBadge(r.rarity)}
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Chance: {r.probability_weight}%
                      </span>
                    </div>
                    <CardTitle className="text-base font-black text-white flex items-center justify-between">
                      <span>{r.title}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(r)}
                          className="text-zinc-500 hover:text-white transition-colors p-1"
                          title="Editar recompensa"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReward(r.id, r.title)}
                          className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                          title="Excluir recompensa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {r.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 border-t border-zinc-850 py-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Tipo: <strong className="text-zinc-200 capitalize">{r.reward_type}</strong></span>
                      {r.reward_value && (
                        <span className="text-amber-400 font-mono font-bold">
                          {r.reward_value}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
