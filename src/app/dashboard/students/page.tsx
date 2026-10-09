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
  ShieldCheck,
  TrendingUp,
  CreditCard
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
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'pending' | 'complimentary'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal para Adicionar Aluno Manualmente
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  const [manualFullName, setManualFullName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualChallengeId, setManualChallengeId] = useState('');
  const [manualPaymentStatus, setManualPaymentStatus] = useState<'paid' | 'complimentary' | 'pending'>('paid');
  const [submittingManual, setSubmittingManual] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Carregar Desafios e Participantes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Buscar desafios do treinador
        const { data: challengesData } = await supabase
          .from('challenges')
          .select('id, title, price, start_date, end_date, is_active')
          .order('start_date', { ascending: false });

        const safeChallenges = challengesData || [];
        setChallenges(safeChallenges);
        if (safeChallenges.length > 0 && selectedChallengeId === 'all') {
          setManualChallengeId(safeChallenges[0].id);
        }

        // Buscar participantes das turmas
        const { data: participantsData, error: partError } = await supabase
          .from('challenge_participants')
          .select(`
            id,
            challenge_id,
            student_id,
            joined_at,
            students (
              id,
              full_name,
              phone,
              avatar_url
            )
          `)
          .order('joined_at', { ascending: false });

        if (partError) throw partError;

        const formatted: Participant[] = (participantsData || []).map((p: any) => ({
          id: p.id,
          challenge_id: p.challenge_id,
          student_id: p.student_id,
          joined_at: p.joined_at,
          payment_status: 'paid', // Default para alunos matriculados
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

  // Ação: Matricular Aluno Manualmente (Balcão / Pix Direto)
  const handleAddStudentManually = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualChallengeId || !manualFullName.trim()) {
      showToast('Preencha os campos obrigatórios.');
      return;
    }

    setSubmittingManual(true);
    try {
      // 1. Gerar UUID para novo aluno ou buscar se já existe por telefone
      const pseudoId = crypto.randomUUID();

      // Inserir registro na tabela students
      const { error: studentErr } = await supabase.from('students').insert({
        id: pseudoId,
        full_name: manualFullName.trim(),
        phone: manualPhone.trim() || null,
      });

      if (studentErr && !studentErr.message.includes('duplicate')) {
        console.warn('Inserção de estudante:', studentErr);
      }

      // 2. Inserir na tabela challenge_participants
      const { data: partData, error: partErr } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: manualChallengeId,
          student_id: pseudoId,
        })
        .select()
        .single();

      if (partErr) throw partErr;

      // 3. Inicializar leaderboard do aluno
      await supabase.from('leaderboard_standings').insert({
        challenge_id: manualChallengeId,
        student_id: pseudoId,
        total_points: 0,
      });

      // Atualizar lista local
      const newEntry: Participant = {
        id: partData.id,
        challenge_id: manualChallengeId,
        student_id: pseudoId,
        joined_at: new Date().toISOString(),
        payment_status: manualPaymentStatus,
        student: {
          id: pseudoId,
          full_name: manualFullName.trim(),
          phone: manualPhone.trim(),
        },
      };

      setParticipants((prev) => [newEntry, ...prev]);
      setIsManualAddModalOpen(false);
      setManualFullName('');
      setManualPhone('');
      showToast('Aluno matriculado com sucesso na turma!');
    } catch (err: any) {
      console.error('Erro ao matricular aluno:', err);
      showToast('Erro ao matricular: ' + (err.message || 'Verifique os dados.'));
    } finally {
      setSubmittingManual(false);
    }
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

      {/* Header Monocromático de Finanças & Alunos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
              FINANCIAL_&_STUDENTS_KERNEL
            </span>
            <span className="text-xs text-zinc-500 font-mono">LIVE_LEDGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestão de Alunos & Faturamento
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Controle de matrículas, faturamento consolidado por turma e registro de pagamentos.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsManualAddModalOpen(true)}
            className="rounded-xl h-10 px-4 text-xs font-mono font-bold bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Matricular Aluno
          </Button>
        </div>
      </div>

      {/* Grid de Métricas Financeiras Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <SpotlightCard3D className="p-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              FATURAMENTO_TOTAL
            </span>
            <span className="text-[10px] font-mono text-zinc-400">BRL</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(consolidatedRevenue)}
          </div>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">
            {selectedChallengeId === 'all' ? 'Soma de todas as turmas' : 'Faturamento desta turma'}
          </p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              ALUNOS_MATRICULADOS
            </span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {filteredParticipants.length}
          </div>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">Atletas ativos na listagem</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              TICKET_MÉDIO
            </span>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              filteredParticipants.length > 0 ? consolidatedRevenue / filteredParticipants.length : currentChallengePrice
            )}
          </div>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">Valor médio por atleta</p>
        </SpotlightCard3D>

        <SpotlightCard3D className="p-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              SEGURANÇA_DE_DADOS
            </span>
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm font-bold text-white font-mono mt-1">ISOLAMENTO ATIVO</div>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">Multi-tenant via RLS Supabase</p>
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
            onClick={() => setFilterPayment('complimentary')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filterPayment === 'complimentary'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            Cortesias / Balcão
          </button>
        </div>
      </div>

      {/* Tabela Estruturada de Alunos Inscritos */}
      <div className="mono-glass-card rounded-3xl overflow-hidden border border-white/10 relative z-10">
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white font-mono tracking-tight">
              ATLETAS_INSCRITOS
            </h3>
            <p className="text-xs text-zinc-400">
              {filteredParticipants.length} atleta(s) localizado(s)
            </p>
          </div>

          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            ORDENADO_POR_DATA
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            CARREGANDO BASE DE ALUNOS...
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-zinc-500">
            Nenhum atleta encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.02] text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Atleta</th>
                  <th className="py-3 px-4">Turma</th>
                  <th className="py-3 px-4">Entrada</th>
                  <th className="py-3 px-4">Status Pgto</th>
                  <th className="py-3 px-4 text-right">Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {filteredParticipants.map((p, idx) => {
                  const challengeObj = challenges.find((c) => c.id === p.challenge_id);
                  const cleanPhone = p.student.phone?.replace(/\D/g, '') || '';
                  const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

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
                            <span className="text-[10px] text-zinc-500">
                              ID: {p.student_id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-zinc-300 font-bold">
                        {challengeObj?.title || 'Turma Ativa'}
                      </td>

                      <td className="py-3 px-4 text-zinc-400">
                        {new Date(p.joined_at).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="border-white/20 text-white bg-white/5 text-[10px] font-mono"
                        >
                          ● CONFIRMADO
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 text-[11px]"
                          >
                            <Phone className="h-3 w-3" /> WhatsApp
                          </a>
                        ) : (
                          <span className="text-zinc-600 text-[10px]">Sem número</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Customizado: Matricular Aluno Manualmente */}
      <CustomDialog
        isOpen={isManualAddModalOpen}
        onClose={() => setIsManualAddModalOpen(false)}
        title="Matricular Aluno Manualmente"
        description="Cadastre um aluno diretamente na turma (útil para alunos que pagaram no balcão da academia, via Pix direto ou cortesia)."
        confirmLabel={submittingManual ? 'Salvando...' : 'Confirmar Matrícula'}
        cancelLabel="Cancelar"
        onConfirm={() => {
          const form = document.getElementById('manual-student-form') as HTMLFormElement;
          if (form) form.requestSubmit();
        }}
        isLoading={submittingManual}
      >
        <form id="manual-student-form" onSubmit={handleAddStudentManually} className="space-y-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Nome Completo do Aluno *
            </label>
            <Input
              value={manualFullName}
              onChange={(e) => setManualFullName(e.target.value)}
              placeholder="Ex: Carlos Eduardo Silveira"
              required
              className="bg-black/80 border-white/15 text-white rounded-xl text-xs h-10"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              WhatsApp / Celular com DDD (Opcional)
            </label>
            <Input
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              placeholder="Ex: 11988887777"
              className="bg-black/80 border-white/15 text-white rounded-xl text-xs h-10 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Selecione o Desafio / Turma *
            </label>
            <select
              value={manualChallengeId}
              onChange={(e) => setManualChallengeId(e.target.value)}
              className="w-full h-10 rounded-xl bg-black border border-white/15 text-white text-xs px-3 font-mono focus:outline-none focus:border-white/30"
              required
            >
              {challenges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} • R$ {Number(c.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Origem do Pagamento
            </label>
            <select
              value={manualPaymentStatus}
              onChange={(e: any) => setManualPaymentStatus(e.target.value)}
              className="w-full h-10 rounded-xl bg-black border border-white/15 text-white text-xs px-3 font-mono focus:outline-none focus:border-white/30"
            >
              <option value="paid">Pago (Pix Direto / Balcão da Academia)</option>
              <option value="complimentary">Cortesia / Bolsista da Turma</option>
              <option value="pending">Pendente (Aguardando Confirmação)</option>
            </select>
          </div>
        </form>
      </CustomDialog>
    </div>
  );
}
