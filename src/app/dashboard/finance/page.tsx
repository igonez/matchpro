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
  AlertCircle,
  Check,
  Info,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';
import { 
  formatCPF, 
  formatCNPJ, 
  validateCPF, 
  validateCNPJ, 
  validatePixKey, 
  detectPixKeyType,
  cleanDigits 
} from '@/lib/validation/brazilian-banking';

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
  const [birthDateInput, setBirthDateInput] = useState('');
  const [cepInput, setCepInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [verifiedBankData, setVerifiedBankData] = useState<any>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanTier>('pro');
  const [upgradePaymentMethod, setUpgradePaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradePixData, setUpgradePixData] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dialogNotice, setDialogNotice] = useState<{
    title: string;
    description: string;
    details?: string[];
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
          setBirthDateInput(prof.birth_date || '');
          setCepInput(prof.postal_code || '');
          setAddressInput(prof.address || '');
          setNumberInput(prof.address_number || '');
          setProvinceInput(prof.province || '');
          setCityInput(prof.city || '');
          setStateInput(prof.state || '');
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

        // 3. Carregar saques já solicitados
        try {
          const { data: pastWithdrawals } = await supabase
            .from('withdrawals')
            .select('amount')
            .eq('professional_id', user.id)
            .in('status', ['COMPLETED', 'PENDING']);

          if (pastWithdrawals) {
            const withdrawnSum = pastWithdrawals.reduce((acc: number, w: any) => acc + Number(w.amount || 0), 0);
            setTotalWithdrawn(withdrawnSum);
          }
        } catch (wErr) {
          console.warn('Tabela withdrawals ainda não criada ou vazia:', wErr);
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

  // Saldo disponível real (Total Líquido menos Saques já realizados)
  const availableBalance = Math.max(0, Number((totalNet - totalWithdrawn).toFixed(2)));

  // Validações em tempo real
  const docDigits = cleanDigits(docNumberInput);
  const isDocFilled = docDigits.length > 0;
  const isDocValid = docTypeInput === 'CPF'
    ? (docDigits.length === 11 && validateCPF(docDigits))
    : (docDigits.length === 14 && validateCNPJ(docDigits));

  const pixValidation = validatePixKey(pixKeyInput);
  const detectedPixType = detectPixKeyType(pixKeyInput);

  const handleDocChange = (val: string) => {
    if (docTypeInput === 'CPF') {
      setDocNumberInput(formatCPF(val));
    } else {
      setDocNumberInput(formatCNPJ(val));
    }
  };

  const handleDocTypeToggle = (type: 'CPF' | 'CNPJ') => {
    setDocTypeInput(type);
    const digits = cleanDigits(docNumberInput);
    if (type === 'CPF') {
      setDocNumberInput(formatCPF(digits.slice(0, 11)));
    } else {
      setDocNumberInput(formatCNPJ(digits.slice(0, 14)));
    }
  };

  const handleCepChange = async (val: string) => {
    setCepInput(val);
    const clean = cleanDigits(val);
    if (clean.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddressInput(data.logradouro || '');
          setProvinceInput(data.bairro || '');
          setCityInput(data.localidade || '');
          setStateInput(data.uf || '');
        }
      } catch (e) {
        console.warn('Erro ao consultar ViaCEP:', e);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSaveBankAccount = async () => {
    if (!coachProfile?.id) return;

    if (!isDocValid) {
      setDialogNotice({
        title: 'Documento Inválido',
        description: `Por favor, preencha um ${docTypeInput} válido antes de salvar seus dados de recebimento.`,
      });
      return;
    }

    if (!pixValidation.isValid) {
      setDialogNotice({
        title: 'Chave Pix Inválida',
        description: pixValidation.error || 'Verifique o formato da chave Pix informada.',
      });
      return;
    }

    if (docTypeInput === 'CPF' && birthDateInput && !/^\d{4}-\d{2}-\d{2}$/.test(birthDateInput)) {
      setDialogNotice({
        title: 'Data de Nascimento Inválida',
        description: 'A data de nascimento deve estar no formato válido.',
      });
      return;
    }

    setSavingAccount(true);

    try {
      const res = await fetch('/api/finance/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: docTypeInput,
          documentNumber: docNumberInput,
          pixKey: pixKeyInput,
          birthDate: docTypeInput === 'CPF' ? birthDateInput : undefined,
          postalCode: cepInput,
          address: addressInput,
          addressNumber: numberInput,
          province: provinceInput,
          city: cityInput,
          state: stateInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao validar e salvar dados bancários.');
      }

      setCoachProfile((prev: any) => ({
        ...prev,
        asaas_pix_key: data.data.pixKey,
        document_type: data.data.documentType,
        document_number: data.data.documentNumber,
        asaas_wallet_id: data.data.walletId || prev?.asaas_wallet_id,
        birth_date: birthDateInput,
        postal_code: cepInput,
        address: addressInput,
        address_number: numberInput,
        province: provinceInput,
        city: cityInput,
        state: stateInput,
      }));
      setPixKeyInput(data.data.pixKey);
      setVerifiedBankData(data.data);

      const details = [
        `Chave Pix: ${data.data.pixKey}`,
        `Titular: ${data.data.ownerName}`,
        `Banco: ${data.data.bankName}`,
      ];
      if (data.data.walletId) {
        details.push(`Subconta Asaas Ativa (Wallet ID: ${data.data.walletId})`);
      }

      setDialogNotice({
        title: 'Dados de Recebimento Salvos!',
        description: data.data.walletId
          ? 'Seus desafios pagos agora realizam Split automático para sua carteira digital.'
          : 'Seus dados bancários foram validados e vinculados com sucesso.',
        details,
      });
    } catch (err: any) {
      setDialogNotice({
        title: 'Erro ao Validar Dados',
        description: err.message || 'Não foi possível salvar os dados bancários.',
      });
    } finally {
      setSavingAccount(false);
    }
  };

  const handleRequestWithdraw = async () => {
    if (!coachProfile?.asaas_pix_key) {
      setDialogNotice({
        title: 'Chave Pix Necessária',
        description: 'Cadastre e valide sua chave Pix antes de solicitar o saque.',
      });
      return;
    }

    if (availableBalance <= 0) {
      setDialogNotice({
        title: 'Saldo Insuficiente',
        description: 'Você não possui saldo disponível para saque no momento.',
      });
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch('/api/finance/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: availableBalance }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao solicitar saque Pix.');
      }

      setWithdrawModalOpen(false);
      setTotalWithdrawn((prev) => prev + availableBalance);
      setDialogNotice({
        title: 'Saque Solicitado com Sucesso!',
        description: 'Sua transferência Pix foi enviada para processamento bancário imediato (D+0).',
        details: [
          `Valor: R$ ${availableBalance.toFixed(2)}`,
          `Chave Pix: ${coachProfile.asaas_pix_key}`,
          `Status: Processando (Previsão: até 5 minutos)`,
        ],
      });
    } catch (err: any) {
      setDialogNotice({
        title: 'Erro ao Processar Saque',
        description: err.message || 'Não foi possível concluir a solicitação de saque.',
      });
    } finally {
      setWithdrawing(false);
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
      setDialogNotice({
        title: 'Erro ao Iniciar Upgrade',
        description: err.message || 'Falha ao comunicar com o gateway de pagamento.',
      });
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
                data-tour="finance-withdraw-btn"
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
        <SpotlightCard3D 
          data-tour="finance-account-card"
          className="p-6 md:p-8 border-white/[0.1] bg-zinc-950/70 backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-zinc-400" />
                Dados Fiscais, Endereço & Subconta Asaas (Split)
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Cadastre seus dados para receber repasses automáticos via Split e saques Pix D+0 instantâneos.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {coachProfile?.asaas_wallet_id ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 px-3 py-1 text-xs font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Split Ativo • {coachProfile.asaas_wallet_id.slice(0, 14)}...
                </Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 px-3 py-1 text-xs font-mono flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Subconta Pendente de Cadastro
                </Badge>
              )}
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs font-mono">
                Pix D+0 Imediato
              </Badge>
            </div>
          </div>

          {/* Dica importante esclarecendo a necessidade de conta no Asaas e regras de pagamento */}
          <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 space-y-2">
              <p className="font-semibold text-white flex items-center gap-2">
                <span>Como funciona o Split, Subconta e Liquidação Pix?</span>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px] font-mono">D+0 IMEDIATO</Badge>
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Ao preencher seus dados abaixo, nossa integração cria automaticamente a sua subconta no Asaas. Quando um aluno adquire seu desafio, o valor é dividido (Split) instantaneamente no nível bancário e cai na sua carteira. Você não precisa criar conta manualmente no site do Asaas!
              </p>
              <div className="pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 space-y-0.5">
                  <span className="text-white font-bold block">Inscrições de Alunos (Pix D+0)</span>
                  <span className="text-zinc-400 block">
                    Alunos pagam exclusivamente via Pix. O valor é liquidado em segundos e você fica 100% protegido contra fraudes e contestações (chargebacks) de cartão.
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 space-y-0.5">
                  <span className="text-white font-bold block">Tarifa Bancária Asaas Transparente</span>
                  <span className="text-zinc-400 block">
                    No Pro, a ArenaFitPro cobra 0% de taxa. É deduzida apenas a tarifa bancária fixa do gateway Asaas (a partir de R$ 0,99 fixo/Pix liquidado), sem taxas de antecipação.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Bloco 1: Dados do Titular e Pix */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                1. Identificação Fiscal & Chave Pix
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1.1 Tipo de Documento */}
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    Tipo de Titularidade
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDocTypeToggle('CPF')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                        docTypeInput === 'CPF'
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-zinc-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      CPF (Física)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDocTypeToggle('CNPJ')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                        docTypeInput === 'CNPJ'
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-zinc-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      CNPJ (MEI/PJ)
                    </button>
                  </div>
                </div>

                {/* 1.2 Número do Documento */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-zinc-400 uppercase">
                      Número do {docTypeInput}
                    </label>
                    {isDocFilled && (
                      isDocValid ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                          <Check className="w-3 h-3" /> Válido
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Inválido
                        </span>
                      )
                    )}
                  </div>
                  <Input
                    value={docNumberInput}
                    onChange={(e) => handleDocChange(e.target.value)}
                    placeholder={docTypeInput === 'CPF' ? '000.000.000-00' : '00.000.000/0001-00'}
                    maxLength={docTypeInput === 'CPF' ? 14 : 18}
                    className={`bg-black/60 text-white placeholder:text-zinc-600 ${
                      isDocFilled 
                        ? isDocValid 
                          ? 'border-emerald-500/50 focus:border-emerald-500' 
                          : 'border-rose-500/50 focus:border-rose-500'
                        : 'border-white/10'
                    }`}
                  />
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    {docTypeInput === 'CPF' ? '11 dígitos com validação matemática' : '14 dígitos para empresas'}
                  </p>
                </div>

                {/* 1.3 Data de Nascimento (apenas se CPF) ou Razão */}
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    {docTypeInput === 'CPF' ? 'Data de Nascimento' : 'Tipo de Empresa (Asaas)'}
                  </label>
                  {docTypeInput === 'CPF' ? (
                    <div className="relative">
                      <Input
                        type="date"
                        value={birthDateInput}
                        onChange={(e) => setBirthDateInput(e.target.value)}
                        className="bg-black/60 text-white border-white/10 focus:border-white/30"
                      />
                    </div>
                  ) : (
                    <div className="py-2.5 px-3 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-zinc-300">
                      MEI / Sociedade Limitada
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    {docTypeInput === 'CPF' ? 'Obrigatório pelo Asaas para subconta PF' : 'Identificação de pessoa jurídica'}
                  </p>
                </div>
              </div>

              {/* Linha da Chave Pix */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase">
                    Chave Pix para Recebimento de Repasses
                  </label>
                  {pixKeyInput.trim() && (
                    <div className="flex items-center gap-1.5">
                      {detectedPixType !== 'UNKNOWN' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {detectedPixType === 'EMAIL' ? 'E-mail' : detectedPixType === 'PHONE' ? 'Celular' : detectedPixType === 'EVP' ? 'Chave Aleatória' : detectedPixType}
                        </span>
                      )}
                      {pixValidation.isValid ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5 font-bold">
                          <Check className="w-3 h-3" /> Ok
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-rose-400 flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> Erro
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Input
                  value={pixKeyInput}
                  onChange={(e) => setPixKeyInput(e.target.value)}
                  placeholder="Seu E-mail, CPF, celular com DDD ou chave aleatória"
                  className={`bg-black/60 text-white placeholder:text-zinc-600 ${
                    pixKeyInput.trim()
                      ? pixValidation.isValid
                        ? 'border-emerald-500/50 focus:border-emerald-500'
                        : 'border-rose-500/50 focus:border-rose-500'
                      : 'border-white/10'
                  }`}
                />
                {pixKeyInput.trim() && !pixValidation.isValid && (
                  <p className="text-[10px] text-rose-400 mt-1 font-mono">
                    {pixValidation.error}
                  </p>
                )}
              </div>
            </div>

            {/* Bloco 2: Endereço (Necessário para a subconta Asaas) */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                2. Endereço Comercial / Residencial (Exigido pelo BACEN / Asaas)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                {/* CEP */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-zinc-400 uppercase">
                      CEP
                    </label>
                    {loadingCep && (
                      <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                      </span>
                    )}
                  </div>
                  <Input
                    value={cepInput}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="bg-black/60 text-white border-white/10 focus:border-white/30 placeholder:text-zinc-600"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                    Preenchimento automático via ViaCEP
                  </p>
                </div>

                {/* Logradouro / Rua */}
                <div className="md:col-span-3">
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    Logradouro / Rua / Avenida
                  </label>
                  <Input
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Ex: Av. Paulista"
                    className="bg-black/60 text-white border-white/10 focus:border-white/30 placeholder:text-zinc-600"
                  />
                </div>

                {/* Número */}
                <div className="md:col-span-1">
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    Número
                  </label>
                  <Input
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    placeholder="100"
                    className="bg-black/60 text-white border-white/10 focus:border-white/30 placeholder:text-zinc-600"
                  />
                </div>

                {/* Bairro */}
                <div className="md:col-span-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    Bairro
                  </label>
                  <Input
                    value={provinceInput}
                    onChange={(e) => setProvinceInput(e.target.value)}
                    placeholder="Centro"
                    className="bg-black/60 text-white border-white/10 focus:border-white/30 placeholder:text-zinc-600"
                  />
                </div>

                {/* Cidade */}
                <div className="md:col-span-3">
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    Cidade
                  </label>
                  <Input
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="São Paulo"
                    className="bg-black/60 text-white border-white/10 focus:border-white/30 placeholder:text-zinc-600"
                  />
                </div>

                {/* UF */}
                <div className="md:col-span-1">
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    UF
                  </label>
                  <Input
                    value={stateInput}
                    onChange={(e) => setStateInput(e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                    className="bg-black/60 text-white border-white/10 focus:border-white/30 placeholder:text-zinc-600 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 3: Botão de Salvar e Criar Subconta */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dados protegidos por criptografia de ponta a ponta e auditoria BACEN.</span>
              </div>
              <Button 
                onClick={handleSaveBankAccount} 
                disabled={savingAccount || !isDocValid || !pixValidation.isValid}
                className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold px-6 py-2.5 h-auto disabled:opacity-50"
              >
                {savingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Subconta & Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Salvar Dados & Ativar Split
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Card de Confirmação de Chave Cadastrada & Subconta */}
          {coachProfile?.asaas_pix_key && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    Conta e Split Configurados
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">
                      ATIVA
                    </Badge>
                    {coachProfile.asaas_wallet_id && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        (Wallet ID: {coachProfile.asaas_wallet_id})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Chave Pix: <span className="text-emerald-300 font-semibold">{coachProfile.asaas_pix_key}</span> • Titular: {coachProfile.document_number ? `${coachProfile.document_type}: ${coachProfile.document_number}` : 'Cadastrado'}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setWithdrawModalOpen(true)}
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 font-bold text-xs shrink-0"
              >
                Solicitar Saque Pix
              </Button>
            </div>
          )}
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
        hideFooter
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-zinc-400">
            O valor disponível de <strong className="text-white">R$ {availableBalance.toFixed(2)}</strong> será transferido via Pix instantâneo para a sua chave:
          </p>

          <div className="bg-black/70 border border-white/10 rounded-xl p-3.5 font-mono text-sm text-emerald-400 flex items-center justify-between">
            <span className="truncate mr-2">{coachProfile?.asaas_pix_key || 'Nenhuma chave Pix cadastrada'}</span>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] shrink-0">
              D+0 PIX
            </Badge>
          </div>

          {!coachProfile?.asaas_pix_key && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Você precisa cadastrar e validar sua chave Pix na seção acima antes de solicitar o saque.</span>
            </div>
          )}

          <div className="text-xs text-zinc-500">
            A transferência é processada automaticamente pela infraestrutura bancária do Asaas diretamente para a sua conta. O valor é creditado em poucos minutos.
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleRequestWithdraw}
              disabled={withdrawing || !coachProfile?.asaas_pix_key || availableBalance <= 0}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold disabled:opacity-50"
            >
              {withdrawing ? 'Processando Transferência...' : 'Confirmar Transferência Pix'}
            </Button>
            <Button
              variant="outline"
              disabled={withdrawing}
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
        hideFooter
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
                      showToast('Código PIX Copia e Cola copiado para a área de transferência!');
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
                    setUpgradeLoading(true);
                    try {
                      const res = await fetch('/api/checkout/confirm-plan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          planTier: upgradePixData.planTier,
                          paymentMethod: 'PIX',
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok || !data.success) {
                        throw new Error(data.error || 'Erro ao confirmar plano.');
                      }

                      setCoachProfile((prev: any) => ({
                        ...prev,
                        plan_tier: data.planTier,
                        platform_fee_percent: data.platformFeePercent,
                      }));
                      setUpgradeModalOpen(false);
                      setUpgradePixData(null);
                      showToast('Plano Pro Coach ativado com sucesso!');
                    } catch (err: any) {
                      console.error('Erro ao confirmar upgrade Pix:', err);
                      setDialogNotice({
                        title: 'Erro ao Confirmar Plano',
                        description: err.message || 'Não foi possível confirmar a ativação do plano.',
                      });
                    } finally {
                      setUpgradeLoading(false);
                    }
                  }}
                  disabled={upgradeLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs"
                >
                  {upgradeLoading ? 'Confirmando...' : 'Já Efetuei o Pagamento PIX (Ativar Plano)'}
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
                  PIX Recorrente (D+0)
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
                  Cartão de Crédito
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
                    Criptografia PCI Asaas • Renovação mensal sem bloqueio de limite
                  </p>
                </div>
              )}

              <p className="text-xs text-zinc-400">
                Escolha o plano ideal para a sua estrutura. A contratação é imediata.
              </p>

              <div className="pt-2">
                {/* Opção Pro - DISPONÍVEL */}
                <div 
                  onClick={() => {
                    if (currentPlanTier !== 'pro') {
                      setSelectedPlanForUpgrade('pro');
                    }
                  }}
                  className={`p-5 rounded-xl border transition-all ${
                    currentPlanTier === 'pro'
                      ? 'border-emerald-500/40 bg-emerald-500/5 cursor-not-allowed opacity-90'
                      : selectedPlanForUpgrade === 'pro'
                      ? 'border-white bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer'
                      : 'border-white/10 bg-black/40 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-base">Pro Coach</span>
                    {currentPlanTier === 'pro' ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono uppercase tracking-wider">
                        SEU PLANO ATUAL
                      </Badge>
                    ) : (
                      <Badge className="bg-white text-black font-extrabold border-0 text-[10px]">RECOMENDADO</Badge>
                    )}
                  </div>
                  <div className="text-2xl font-black text-white mb-2">R$ 49,90<span className="text-xs text-zinc-500 font-normal">/mês</span></div>
                  <ul className="text-xs text-zinc-300 space-y-1.5 mb-2">
                    <li className="flex items-center gap-1.5">• Desbloqueia <strong className="text-white">Squads (Times Cooperativos)</strong></li>
                    <li className="flex items-center gap-1.5">• <strong className="text-white">Radar Anti-Churn & Resgate WhatsApp</strong></li>
                    <li className="flex items-center gap-1.5">• <strong className="text-emerald-400">Taxa ZERO (0%) da plataforma</strong> (100% do lucro é seu)</li>
                    <li className="flex items-center gap-1.5">• Até <strong className="text-white">5 desafios simultâneos</strong> (100 alunos/desafio)</li>
                  </ul>
                  {currentPlanTier === 'pro' && (
                    <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[10px] text-emerald-400 font-mono text-center">
                      Você já possui este plano ativo
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de Downgrade para Starter caso o coach já esteja no Pro */}
              {currentPlanTier === 'pro' && (
                <div className="pt-2 text-center border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={async () => {
                      setUpgradeLoading(true);
                      try {
                        const res = await fetch('/api/checkout/confirm-plan', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            planTier: 'starter',
                            paymentMethod: 'DOWNGRADE',
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                          throw new Error(data.error || 'Erro ao alterar plano.');
                        }
                        setCoachProfile((prev: any) => ({ ...prev, plan_tier: 'starter', platform_fee_percent: data.platformFeePercent }));
                        setUpgradeModalOpen(false);
                      } catch (e: any) {
                        console.error('Erro ao voltar para Starter:', e);
                      } finally {
                        setUpgradeLoading(false);
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
                      return;
                    }

                    if (upgradePaymentMethod === 'CREDIT_CARD') {
                      if (!cardNumber.trim() || !cardHolder.trim()) {
                        setDialogNotice({
                          title: 'Dados do Cartão Incompletos',
                          description: 'Preencha os dados do cartão de crédito para continuar.',
                        });
                        return;
                      }
                      setUpgradeLoading(true);
                      try {
                        const expiryParts = cardExpiry.split('/');
                        const res = await fetch('/api/checkout/coach-plan', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            planTier: 'pro',
                            billingType: 'CREDIT_CARD',
                            creditCard: {
                              holderName: cardHolder.trim(),
                              number: cardNumber.replace(/\D/g, ''),
                              expiryMonth: expiryParts[0]?.trim() || '12',
                              expiryYear: expiryParts[1]?.length === 2 ? '20' + expiryParts[1].trim() : (expiryParts[1]?.trim() || '2028'),
                              ccv: cardCvv.trim(),
                            },
                            creditCardHolderInfo: {
                              name: cardHolder.trim(),
                              email: coachProfile?.email || 'coach@arenafit.pro',
                              cpfCnpj: cleanDigits(coachProfile?.document_number || '') || '00000000000',
                              postalCode: '01310100',
                              addressNumber: '100',
                              phone: coachProfile?.phone || '11999999999',
                            },
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                          throw new Error(data.error || 'Erro ao processar assinatura com cartão.');
                        }
                        setCoachProfile((prev: any) => ({ ...prev, plan_tier: 'pro', platform_fee_percent: 12 }));
                        setUpgradeModalOpen(false);
                        setDialogNotice({
                          title: 'Assinatura Pro Ativada!',
                          description: 'Sua assinatura Pro Coach foi ativada com sucesso com cobrança recorrente no cartão!',
                        });
                      } catch (err: any) {
                        setDialogNotice({
                          title: 'Erro na Assinatura',
                          description: err.message || 'Erro ao processar assinatura no cartão.',
                        });
                      } finally {
                        setUpgradeLoading(false);
                      }
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
                    : `Contratar Plano Pro Coach com ${upgradePaymentMethod === 'CREDIT_CARD' ? 'Cartão' : 'PIX'}`}
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

      {/* Modal de Avisos e Confirmações do Sistema */}
      <CustomDialog
        isOpen={Boolean(dialogNotice)}
        onClose={() => setDialogNotice(null)}
        title={dialogNotice?.title || 'Aviso do Sistema'}
        description={dialogNotice?.description}
        confirmText="Entendido"
      >
        {dialogNotice?.details && dialogNotice.details.length > 0 && (
          <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-1.5 text-xs font-mono text-zinc-300">
            {dialogNotice.details.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}
      </CustomDialog>

      {/* Toast Monocromático Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 mono-glass-card px-5 py-3.5 rounded-2xl border border-white/25 text-white text-xs font-bold shadow-[0_0_30px_rgba(255,255,255,0.12)] animate-in fade-in slide-in-from-bottom-4 duration-200 flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
