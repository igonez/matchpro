'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Search, 
  Filter, 
  Copy, 
  Phone, 
  ChevronRight, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Challenge {
  id: string;
  title: string;
  price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Participant {
  id: string;
  challenge_id: string;
  student_id: string;
  joined_at: string;
  payment_status?: 'paid' | 'pending' | 'complimentary';
  student: {
    id: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
  };
}

export default function DashboardFinanceAndStudentsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('all');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'pending'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal de Exclusão de Matrícula
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deletingParticipant, setDeletingParticipant] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Carregar Desafios e Participantes com Isolamento Multi-Tenant
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Buscar desafios EXCLUSIVOS do treinador logado
        const { data: challengesData } = await supabase
          .from('challenges')
          .select('id, title, price, start_date, end_date, is_active')
          .eq('professional_id', user.id)
          .order('start_date', { ascending: false });

        const safeChallenges = challengesData || [];
        setChallenges(safeChallenges);

        if (safeChallenges.length === 0) {
          setParticipants([]);
          setLoading(false);
          return;
        }

        const coachChallengeIds = safeChallenges.map((c: any) => c.id);

        // Buscar participantes apenas das turmas pertencentes ao treinador
        const { data: participantsData, error: partError } = await supabase
          .from('challenge_participants')
          .select(`
            id,
            challenge_id,
            student_id,
            joined_at,
            payment_status,
            students (
              id,
              full_name,
              phone,
              avatar_url
            )
          `)
          .in('challenge_id', coachChallengeIds)
          .order('joined_at', { ascending: false });

        if (partError) throw partError;

        const formatted: Participant[] = (participantsData || []).map((p: any) => ({
          id: p.id,
          challenge_id: p.challenge_id,
          student_id: p.student_id,
          joined_at: p.joined_at,
          payment_status: (p.payment_status as any) || 'paid',
          student: {
            id: p.students?.id || p.student_id,
            full_name: p.students?.full_name || 'Atleta Anônimo',
            phone: p.students?.phone || '',
            avatar_url: p.students?.avatar_url || '',
          },
        }));

        setParticipants(formatted);
      } catch (err: any) {
        console.error('Erro ao carregar dados financeiros e alunos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  // Filtragem Dinâmica
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchChallenge = selectedChallengeId === 'all' || p.challenge_id === selectedChallengeId;
      const matchSearch =
        searchQuery.trim() === '' ||
        p.student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.student.phone && p.student.phone.includes(searchQuery));
      const matchPayment = filterPayment === 'all' || p.payment_status === filterPayment;

      return matchChallenge && matchSearch && matchPayment;
    });
  }, [participants, selectedChallengeId, searchQuery, filterPayment]);

  // Métricas Consolidadas
  const totalEnrolled = participants.length;
  const currentChallengePrice =
    selectedChallengeId === 'all'
      ? challenges.reduce((acc, c) => acc + (Number(c.price) || 0), 0) / (challenges.length || 1)
      : Number(challenges.find((c) => c.id === selectedChallengeId)?.price || 0);

  const consolidatedRevenue = useMemo(() => {
    if (selectedChallengeId === 'all') {
      return participants.reduce((acc, p) => {
        const c = challenges.find((item) => item.id === p.challenge_id);
        return acc + (Number(c?.price) || 0);
      }, 0);
    }
    const c = challenges.find((item) => item.id === selectedChallengeId);
    const count = participants.filter((p) => p.challenge_id === selectedChallengeId).length;
    return (Number(c?.price) || 0) * count;
  }, [participants, challenges, selectedChallengeId]);

  // Remover / Desmatricular Aluno da Turma
  const handleConfirmDeleteParticipant = async () => {
    if (!deleteTarget) return;
    setDeletingParticipant(true);
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      setParticipants((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast(`Matrícula de "${deleteTarget.name}" cancelada com sucesso.`);
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('Erro ao remover matrícula: ' + err.message);
    } finally {
      setDeletingParticipant(false);
    }
  };

  // Copiar Link de Convite
  const handleCopyInviteLink = () => {
    const targetChallenge = selectedChallengeId !== 'all' 
      ? challenges.find((c) => c.id === selectedChallengeId)
      : challenges[0];

    if (!targetChallenge) {
      showToast('Crie um desafio para obter o link de convite.');
      return;
    }

    const inviteUrl = `${window.location.origin}/join/${targetChallenge.id}`;
    navigator.clipboard.writeText(inviteUrl);
    showToast(`Link de convite copiado: ${targetChallenge.title}`);
  };

  return (
    <div className="space-y-6 relative pb-16">
      <Monochrome3DBackground />

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className="mono-glass-card px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-mono text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header de Alunos & Turmas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Alunos & Turmas
            </span>
            <span className="text-xs text-zinc-400 font-medium">Matrículas oficiais via Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestão de Alunos & Turmas
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Todas as matrículas são processadas automaticamente após a confirmação do pagamento via app. Compartilhe o link de convite para novos alunos entrarem.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link href="/dashboard/finance">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl h-10 px-3.5 text-xs font-semibold text-zinc-300 border-white/10 hover:border-white/20 hover:text-white bg-white/5"
            >
              <CreditCard className="h-4 w-4 mr-1.5" /> Aba Financeiro →
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleCopyInviteLink}
            className="rounded-xl h-10 px-4 text-xs font-semibold bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5"
            title="Copiar link de convite para matrícula via app"
          >
            <Copy className="h-4 w-4 mr-1.5" /> Copiar Link de Convite
          </Button>
        </div>
      </div>

      {/* Grid de Métricas Operacionais de Alunos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <SpotlightCard3D className="p-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold tracking-wide text-zinc-400">
              Total de Matriculados
            </span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {filteredParticipants.length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {selectedChallengeId === 'all' ? 'Soma de todas as turmas' : 'Alunos nesta turma'}
          </p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold tracking-wide text-zinc-400">
              Inscrições Confirmadas
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {filteredParticipants.filter((p) => p.payment_status === 'paid').length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Pagamento confirmado via plataforma</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold tracking-wide text-zinc-400">
              Aguardando Confirmação Pix
            </span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {filteredParticipants.filter((p) => p.payment_status === 'pending').length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Checkout iniciado no aplicativo</p>
        </SpotlightCard3D>
      </div>

      {/* Barra de Filtros e Busca de Alunos */}
      <div className="mono-glass-card p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative z-10 border border-white/10">
        <div className="flex flex-1 items-center gap-2">
          {/* Seletor de Desafio */}
          <select
            value={selectedChallengeId}
            onChange={(e) => setSelectedChallengeId(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-zinc-900 px-3 text-xs font-mono font-bold text-white focus:outline-none focus:border-white/30"
          >
            <option value="all">Todas as Turmas ({challenges.length})</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} • R$ {Number(c.price).toFixed(2)}
              </option>
            ))}
          </select>

          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar atleta por nome ou WhatsApp..."
              className="pl-9 h-10 text-xs font-mono bg-zinc-900/60 border-white/10 text-white rounded-xl"
            />
          </div>
        </div>

        {/* Filtro de Status de Pagamento */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterPayment('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterPayment === 'all'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            Todos ({participants.length})
          </button>
          <button
            onClick={() => setFilterPayment('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterPayment === 'paid'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            Confirmados
          </button>
          <button
            onClick={() => setFilterPayment('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterPayment === 'pending'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            Pendentes
          </button>
        </div>
      </div>

      {/* Tabela Estruturada de Alunos Inscritos */}
      <div className="mono-glass-card rounded-3xl overflow-hidden border border-white/10 relative z-10">
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Alunos Inscritos
            </h3>
            <p className="text-xs text-zinc-400">
              {filteredParticipants.length} atleta(s) localizado(s)
            </p>
          </div>

          <span className="text-xs text-zinc-400 font-medium">
            Ordenado por data
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs">
            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Carregando lista de alunos...
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            Nenhum atleta encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-zinc-400 text-xs font-semibold">
                <tr>
                  <th className="py-3 px-4">Atleta</th>
                  <th className="py-3 px-4">Turma</th>
                  <th className="py-3 px-4">Entrada</th>
                  <th className="py-3 px-4">Status Pgto (App)</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {filteredParticipants.map((p) => {
                  const challengeObj = challenges.find((c) => c.id === p.challenge_id);
                  const cleanPhone = p.student.phone?.replace(/\D/g, '') || '';
                  const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;
                  const isPaid = p.payment_status === 'paid';
                  const isPending = p.payment_status === 'pending';

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white font-bold shrink-0">
                            {p.student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {p.student.full_name}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Matrícula: {p.student_id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-zinc-300 font-semibold">
                        {challengeObj?.title || 'Turma Ativa'}
                      </td>

                      <td className="py-3 px-4 text-zinc-400 text-xs">
                        {new Date(p.joined_at).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="py-3 px-4">
                        {isPaid && (challengeObj?.price || 0) > 0 && (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 text-xs font-semibold font-mono"
                          >
                            ● Pago via App
                          </Badge>
                        )}
                        {isPaid && (challengeObj?.price || 0) === 0 && (
                          <Badge
                            variant="outline"
                            className="border-white/20 text-white bg-white/10 text-xs font-semibold font-mono"
                          >
                            ● Gratuito (App)
                          </Badge>
                        )}
                        {isPending && (
                          <Badge
                            variant="outline"
                            className="border-amber-500/30 text-amber-300 bg-amber-500/10 text-xs font-semibold font-mono"
                          >
                            ○ Aguardando Pix
                          </Badge>
                        )}
                        {!isPaid && !isPending && (
                          <Badge
                            variant="outline"
                            className="border-white/20 text-zinc-300 bg-white/5 text-[10px] font-mono uppercase tracking-wider"
                          >
                            ATIVO
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 text-[11px]"
                              title="Chamar no WhatsApp"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: p.id, name: p.student.full_name })}
                            className="p-1 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                            title="Remover matrícula da turma"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Customizado: Confirmar Exclusão de Matrícula */}
      <CustomDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Cancelar Matrícula do Aluno"
        description={`Tem certeza que deseja desmatricular "${deleteTarget?.name}" desta turma? O histórico de submissões e pontos deixará de constar na turma.`}
        confirmLabel={deletingParticipant ? 'Removendo...' : 'Sim, Cancelar Matrícula'}
        cancelLabel="Voltar"
        onConfirm={handleConfirmDeleteParticipant}
        isLoading={deletingParticipant}
      />
    </div>
  );
}
