'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  CreditCard,
  Building2,
  User,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';

interface PaymentTransaction {
  id: string;
  challenge_id: string;
  gross_value: number;
  net_coach_value: number;
  fee_platform_value: number;
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'REFUNDED' | 'OVERDUE';
  billing_type: string;
  paid_at: string | null;
  created_at: string;
  student?: {
    full_name: string;
    avatar_url?: string;
  };
  challenge?: {
    title: string;
  };
}

export default function FinanceDashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [coachProfile, setCoachProfile] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [pixKeyInput, setPixKeyInput] = useState('');
  const [docTypeInput, setDocTypeInput] = useState<'CPF' | 'CNPJ'>('CPF');
  const [docNumberInput, setDocNumberInput] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanTier>('pro');
  const [upgradePaymentMethod, setUpgradePaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradePixData, setUpgradePixData] = useState<any>(null);

  useEffect(() => {
    async function loadFinanceData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Carregar perfil do treinador
        const { data: prof } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', user.id)
          .single();

        if (prof) {
          setCoachProfile(prof);
          setPixKeyInput(prof.asaas_pix_key || '');
          setDocTypeInput(prof.document_type || 'CPF');
          setDocNumberInput(prof.document_number || '');
        }

        // 2. Carregar transações
        const { data: txs } = await supabase
          .from('payments')
          .select(`
            *,
            student:students(full_name, avatar_url),
            challenge:challenges(title)
          `)
          .eq('professional_id', user.id)
          .order('created_at', { ascending: false });

        if (txs) {
          setPayments(txs as any);
        }
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFinanceData();
  }, [supabase]);

  // Cálculos financeiros
  const currentPlanTier: PlanTier = (coachProfile?.plan_tier as PlanTier) || 'starter';
  const planDetails = PLAN_CONFIG[currentPlanTier];

  // Faturamento bruto (total vendido)
  const totalGross = payments
    .filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + Number(curr.gross_value || 0), 0);

  // Faturamento líquido (o que vai pro bolso do treinador)
  const totalNet = payments
    .filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + Number(curr.net_coach_value || 0), 0);

  // Total retido pela plataforma
  const totalFees = payments
    .filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + Number(curr.fee_platform_value || 0), 0);

  // Saldo disponível (simulado ou real da subconta Asaas)
  const availableBalance = totalNet;

  const handleSaveBankAccount = async () => {
    if (!coachProfile?.id) return;
    setSavingAccount(true);

    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          asaas_pix_key: pixKeyInput,
          document_type: docTypeInput,
          document_number: docNumberInput,
        })
        .eq('id', coachProfile.id);

      if (error) throw error;
      alert('Dados bancários e documento salvos com sucesso!');
      setCoachProfile((prev: any) => ({
        ...prev,
        asaas_pix_key: pixKeyInput,
        document_type: docTypeInput,
        document_number: docNumberInput,
      }));
    } catch (err: any) {
      alert('Erro ao salvar dados: ' + err.message);
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSimulateUpgrade = async (tier: PlanTier) => {
    if (!coachProfile?.id) return;
    setUpgradeLoading(true);
    try {
      const res = await fetch('/api/checkout/coach-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier: tier }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao gerar cobrança do plano');
      }

      setUpgradePixData(data);
    } catch (err: any) {
      alert('Erro ao iniciar upgrade de plano: ' + err.message);
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative">
      <Monochrome3DBackground />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header com identificação do plano */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <Wallet className="w-8 h-8 text-zinc-300" />
                Central Financeira
              </h1>
              <Badge className="bg-zinc-800 text-zinc-300 border-white/10 font-mono text-xs px-2.5 py-0.5">
                ASAAS ENGINE v3
              </Badge>
            </div>
            <p className="text-zinc-400 text-sm">
              Gestão de repasses, saques Pix D+0, split de faturamento e plano de assinatura da plataforma.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-950/80 border border-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-zinc-300" />
              <div className="text-left">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">Seu Plano Atual</span>
                <span className="text-sm font-bold text-white uppercase">{planDetails.name}</span>
              </div>
            </div>
            <Button 
              onClick={() => setUpgradeModalOpen(true)}
              className="bg-white text-black hover:bg-zinc-200 font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              {currentPlanTier === 'starter' ? 'Fazer Upgrade' : 'Gerenciar Plano'}
            </Button>
          </div>
        </div>

        {/* 4 Cards de Indicadores de Topo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Saldo Disponível para Saque */}
          <SpotlightCard3D className="p-6 border-white/[0.1] bg-zinc-950/60 backdrop-blur-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-mono">Disponível para Saque</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight mb-3">
              R$ {availableBalance.toFixed(2)}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] text-zinc-500 font-mono">Pix Imediato (D+0)</span>
              <Button 
                size="sm" 
                onClick={() => setWithdrawModalOpen(true)}
                className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-3"
              >
                Sacar Pix
              </Button>
            </div>
          </SpotlightCard3D>

          {/* Card 2: Faturamento Líquido */}
          <SpotlightCard3D className="p-6 border-white/[0.1] bg-zinc-950/60 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-mono">Faturamento Líquido</span>
              <div className="p-2 rounded-lg bg-white/5 text-zinc-300">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight mb-3">
              R$ {totalNet.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-white/[0.06]">
              Livre de taxas (Já no seu bolso)
            </div>
          </SpotlightCard3D>

          {/* Card 3: Faturamento Bruto */}
          <SpotlightCard3D className="p-6 border-white/[0.1] bg-zinc-950/60 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-mono">Faturamento Bruto</span>
              <div className="p-2 rounded-lg bg-white/5 text-zinc-300">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-zinc-300 tracking-tight mb-3">
              R$ {totalGross.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-white/[0.06]">
              Total vendido em inscrições
            </div>
          </SpotlightCard3D>

          {/* Card 4: Taxa da Plataforma & Economia */}
          <SpotlightCard3D className="p-6 border-white/[0.1] bg-zinc-950/60 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-mono">Taxa de Split Atual</span>
              <div className="p-2 rounded-lg bg-white/5 text-zinc-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight mb-3">
              {coachProfile?.platform_fee_percent || planDetails.platformFeePercent}%
            </div>
            <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span>Retido pelo ArenaFit</span>
              <span className="text-zinc-400">R$ {totalFees.toFixed(2)}</span>
            </div>
          </SpotlightCard3D>
        </div>

        {/* Bloco de Configuração de Recebimento (CPF/CNPJ e Chave Pix) */}
        <SpotlightCard3D className="p-6 md:p-8 border-white/[0.1] bg-zinc-950/70 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-zinc-400" />
                Dados Fiscais & Subconta Asaas de Repasse
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Configure se você recebe como Pessoa Física (CPF) ou Jurídica (CNPJ) para emissão correta e repasse instantâneo.
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
              Split Automático Habilitado
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">Tipo de Documento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDocTypeInput('CPF')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    docTypeInput === 'CPF'
                      ? 'bg-white text-black border-white'
                      : 'bg-black text-zinc-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  CPF (Pessoa Física)
                </button>
                <button
                  type="button"
                  onClick={() => setDocTypeInput('CNPJ')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    docTypeInput === 'CNPJ'
                      ? 'bg-white text-black border-white'
                      : 'bg-black text-zinc-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  CNPJ (MEI / Empresa)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                Número do {docTypeInput}
              </label>
              <Input
                value={docNumberInput}
                onChange={(e) => setDocNumberInput(e.target.value)}
                placeholder={docTypeInput === 'CPF' ? '000.000.000-00' : '00.000.000/0001-00'}
                className="bg-black/60 border-white/10 text-white placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                Chave Pix de Recebimento (Mesmo Titular)
              </label>
              <div className="flex gap-2">
                <Input
                  value={pixKeyInput}
                  onChange={(e) => setPixKeyInput(e.target.value)}
                  placeholder="E-mail, CPF ou Telefone"
                  className="bg-black/60 border-white/10 text-white placeholder:text-zinc-600"
                />
                <Button 
                  onClick={handleSaveBankAccount} 
                  disabled={savingAccount}
                  className="bg-white text-black hover:bg-zinc-200 font-bold shrink-0"
                >
                  {savingAccount ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </SpotlightCard3D>

        {/* Tabela de Extrato de Vendas & Inscrições */}
        <SpotlightCard3D className="p-6 md:p-8 border-white/[0.1] bg-zinc-950/70 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-zinc-400" />
                Extrato de Inscrições & Pagamentos
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Acompanhe o status em tempo real de cada transação de aluno gerada pelo Asaas.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {payments.length} transação(ões) encontrada(s)
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-zinc-500 text-sm">Carregando transações financeiras...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Nenhuma transação registrada ainda. Assim que os alunos comprarem seus desafios, as entradas e splits aparecerão aqui em tempo real.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[11px] font-mono text-zinc-400 uppercase">
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Aluno</th>
                    <th className="py-3 px-4">Desafio</th>
                    <th className="py-3 px-4">Método</th>
                    <th className="py-3 px-4">Bruto</th>
                    <th className="py-3 px-4">Sua Parte (Líquido)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {p.student?.full_name || 'Aluno'}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300">
                        {p.challenge?.title || 'Desafio'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-400 font-mono">
                          {p.billing_type || 'PIX'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">
                        R$ {Number(p.gross_value).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        R$ {Number(p.net_coach_value).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.status === 'RECEIVED' || p.status === 'CONFIRMED' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">
                            APROVADO
                          </Badge>
                        ) : p.status === 'PENDING' ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-mono">
                            AGUARDANDO
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] font-mono">
                            {p.status}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SpotlightCard3D>
      </div>

      {/* Modal de Saque Pix */}
      <CustomDialog
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Solicitar Saque Pix Imediato"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-zinc-400">
            O valor disponível de <strong className="text-white">R$ {availableBalance.toFixed(2)}</strong> será transferido via Pix instantâneo para a chave cadastrada:
          </p>

          <div className="bg-black/70 border border-white/10 rounded-xl p-3.5 font-mono text-sm text-emerald-400 flex items-center justify-between">
            <span>{coachProfile?.asaas_pix_key || 'Chave não cadastrada'}</span>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">
              D+0 PIX
            </Badge>
          </div>

          <div className="text-xs text-zinc-500">
            A transferência é processada automaticamente pela infraestrutura do Asaas. Em dias úteis, o valor é creditado em poucos minutos.
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => {
                alert('Solicitação de saque Pix enviada para o Asaas com sucesso!');
                setWithdrawModalOpen(false);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
            >
              Confirmar Transferência Pix
            </Button>
            <Button
              variant="outline"
              onClick={() => setWithdrawModalOpen(false)}
              className="border-white/10 text-zinc-400"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </CustomDialog>

      {/* Modal de Upgrade de Plano SaaS */}
      <CustomDialog
        isOpen={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          setUpgradePixData(null);
        }}
        title="Upgrade de Plano ArenaFitPro"
      >
        <div className="space-y-4 pt-2">
          {upgradePixData ? (
            <div className="space-y-4 text-center">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-left">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Plano Selecionado</span>
                <h4 className="text-sm font-bold text-white">{upgradePixData.planName} — R$ {upgradePixData.monthlyPrice?.toFixed(2)}/mês</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Efetue o pagamento do PIX abaixo. A ativação do plano é automática e instantânea assim que o banco confirmar a transação.</p>
              </div>

              {upgradePixData.pixQrBase64 && (
                <div className="flex justify-center p-3 bg-white rounded-xl inline-block mx-auto">
                  <img
                    src={`data:image/png;base64,${upgradePixData.pixQrBase64}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              )}

              {upgradePixData.pixCode && (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(upgradePixData.pixCode);
                      alert('Código PIX Copia e Cola copiado para a área de transferência!');
                    }}
                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-xs"
                  >
                    Copiar Código PIX
                  </Button>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Button
                  onClick={async () => {
                    if (!coachProfile?.id || !upgradePixData?.planTier) return;
                    try {
                      const { error } = await supabase
                        .from('professionals')
                        .update({
                          plan_tier: upgradePixData.planTier,
                          platform_fee_percent: PLAN_CONFIG[upgradePixData.planTier as PlanTier].platformFeePercent,
                        })
                        .eq('id', coachProfile.id);

                      if (error) throw error;
                      alert(`Pagamento confirmado! Seu plano agora é ${upgradePixData.planName}. Todos os recursos foram desbloqueados!`);
                      setCoachProfile((prev: any) => ({
                        ...prev,
                        plan_tier: upgradePixData.planTier,
                      }));
                      setUpgradeModalOpen(false);
                      setUpgradePixData(null);
                    } catch (err: any) {
                      alert('Erro ao confirmar upgrade: ' + err.message);
                    }
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs"
                >
                  ✓ Já Efetuei o Pagamento PIX (Ativar Plano)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setUpgradeModalOpen(false);
                    setUpgradePixData(null);
                  }}
                  className="w-full border-white/10 text-zinc-400 text-xs"
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Seletor de Método de Pagamento: PIX ou CARTÃO */}
              <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setUpgradePaymentMethod('PIX')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    upgradePaymentMethod === 'PIX'
                      ? 'bg-white text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚡ PIX Recorrente (D+0)
                </button>
                <button
                  type="button"
                  onClick={() => setUpgradePaymentMethod('CREDIT_CARD')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    upgradePaymentMethod === 'CREDIT_CARD'
                      ? 'bg-white text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  💳 Cartão de Crédito
                </button>
              </div>

              {/* Formulário de Cartão se Cartão estiver selecionado */}
              {upgradePaymentMethod === 'CREDIT_CARD' && (
                <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-2.5 text-left mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Dados do Cartão (Cobrança Automática Mensal)
                  </span>
                  <div>
                    <input
                      type="text"
                      placeholder="Nome impresso no cartão"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 font-mono focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/AA"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 font-mono focus:outline-none focus:border-white/30"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 font-mono focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                    🔒 Criptografia PCI Asaas • Renovação mensal sem bloqueio de limite
                  </p>
                </div>
              )}

              <p className="text-xs text-zinc-400">
                Escolha o plano ideal para a sua estrutura. A contratação é imediata.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Opção Pro */}
                <div 
                  onClick={() => {
                    if (currentPlanTier !== 'pro') {
                      setSelectedPlanForUpgrade('pro');
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all ${
                    currentPlanTier === 'pro'
                      ? 'border-emerald-500/40 bg-emerald-500/5 cursor-not-allowed opacity-90'
                      : selectedPlanForUpgrade === 'pro'
                      ? 'border-white bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer'
                      : 'border-white/10 bg-black/40 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Pro Coach</span>
                    {currentPlanTier === 'pro' ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono">
                        ✓ SEU PLANO ATUAL
                      </Badge>
                    ) : (
                      <Badge className="bg-zinc-800 text-zinc-300 border-0 text-[10px]">PRO</Badge>
                    )}
                  </div>
                  <div className="text-xl font-black text-white mb-2">R$ 89,90<span className="text-xs text-zinc-500 font-normal">/mês</span></div>
                  <ul className="text-[11px] text-zinc-400 space-y-1">
                    <li>• Desbloqueia Squads</li>
                    <li>• Desbloqueia Mystery Box</li>
                    <li>• Taxa reduzida para 12%</li>
                    <li>• Até 5 desafios ativos</li>
                  </ul>
                  {currentPlanTier === 'pro' && (
                    <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-400 font-mono text-center">
                      Você já possui este plano ativo
                    </div>
                  )}
                </div>

                {/* Opção Studio */}
                <div 
                  onClick={() => {
                    if (currentPlanTier !== 'studio') {
                      setSelectedPlanForUpgrade('studio');
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all ${
                    currentPlanTier === 'studio'
                      ? 'border-emerald-500/40 bg-emerald-500/5 cursor-not-allowed opacity-90'
                      : selectedPlanForUpgrade === 'studio'
                      ? 'border-white bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer'
                      : 'border-white/10 bg-black/40 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Studio & Gym</span>
                    {currentPlanTier === 'studio' ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono">
                        ✓ SEU PLANO ATUAL
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">ELITE</Badge>
                    )}
                  </div>
                  <div className="text-xl font-black text-white mb-2">R$ 279,90<span className="text-xs text-zinc-500 font-normal">/mês</span></div>
                  <ul className="text-[11px] text-zinc-400 space-y-1">
                    <li>• Desafios Ilimitados</li>
                    <li>• Parceiros & Cupons</li>
                    <li>• Multi-treinadores</li>
                    <li>• Menor taxa: apenas 8%</li>
                  </ul>
                  {currentPlanTier === 'studio' && (
                    <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-400 font-mono text-center">
                      Você já possui este plano ativo
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de Downgrade para Starter caso o coach já esteja no Pro ou Studio */}
              {currentPlanTier !== 'starter' && (
                <div className="pt-2 text-center border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm('Deseja realmente voltar ao plano Starter Gratuito? Os recursos Pro (Squads e Mystery Box) serão bloqueados e a taxa de comissão passará para 18%.')) return;
                      try {
                        const { error } = await supabase
                          .from('professionals')
                          .update({
                            plan_tier: 'starter',
                            platform_fee_percent: PLAN_CONFIG.starter.platformFeePercent,
                          })
                          .eq('id', coachProfile.id);

                        if (error) throw error;
                        alert('Plano alterado para Starter Gratuito com sucesso.');
                        setCoachProfile((prev: any) => ({ ...prev, plan_tier: 'starter' }));
                        setUpgradeModalOpen(false);
                      } catch (e: any) {
                        alert('Erro ao cancelar assinatura: ' + e.message);
                      }
                    }}
                    className="text-xs text-zinc-500 hover:text-rose-400 transition-colors font-mono underline"
                  >
                    Voltar para o plano Starter Gratuito (Cancelar Assinatura Pro)
                  </button>
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <Button
                  disabled={upgradeLoading || selectedPlanForUpgrade === currentPlanTier}
                  onClick={async () => {
                    if (selectedPlanForUpgrade === currentPlanTier) {
                      alert('Você já possui este plano ativo!');
                      return;
                    }

                    if (upgradePaymentMethod === 'CREDIT_CARD') {
                      // Simulação / Processamento de Cartão de Crédito
                      if (!cardNumber.trim() || !cardHolder.trim()) {
                        alert('Preencha os dados do cartão de crédito para prosseguir.');
                        return;
                      }
                      setUpgradeLoading(true);
                      setTimeout(async () => {
                        try {
                          const { error } = await supabase
                            .from('professionals')
                            .update({
                              plan_tier: selectedPlanForUpgrade,
                              platform_fee_percent: PLAN_CONFIG[selectedPlanForUpgrade].platformFeePercent,
                            })
                            .eq('id', coachProfile.id);

                          if (error) throw error;
                          alert(`Cartão aprovado com sucesso! Plano ${PLAN_CONFIG[selectedPlanForUpgrade].name} ativado.`);
                          setCoachProfile((prev: any) => ({ ...prev, plan_tier: selectedPlanForUpgrade }));
                          setUpgradeModalOpen(false);
                        } catch (err: any) {
                          alert('Erro ao aprovar cartão: ' + err.message);
                        } finally {
                          setUpgradeLoading(false);
                        }
                      }, 1200);
                      return;
                    }

                    // Fluxo Pix
                    handleSimulateUpgrade(selectedPlanForUpgrade);
                  }}
                  className={`w-full font-bold ${
                    selectedPlanForUpgrade === currentPlanTier
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {upgradeLoading 
                    ? (upgradePaymentMethod === 'CREDIT_CARD' ? 'Processando Cartão...' : 'Gerando PIX...') 
                    : selectedPlanForUpgrade === currentPlanTier
                    ? `Plano ${PLAN_CONFIG[selectedPlanForUpgrade].name} Já Ativo`
                    : `Contratar Plano ${PLAN_CONFIG[selectedPlanForUpgrade].name} com ${upgradePaymentMethod === 'CREDIT_CARD' ? 'Cartão' : 'PIX'}`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUpgradeModalOpen(false)}
                  className="border-white/10 text-zinc-400"
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </CustomDialog>
    </div>
  );
}
