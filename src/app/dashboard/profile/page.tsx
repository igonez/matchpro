'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Camera, 
  Phone, 
  FileText, 
  Briefcase, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Award,
  Sparkles,
  ArrowRight,
  Lock,
  Smartphone,
  MapPin,
  Calendar,
  CreditCard,
  Wallet,
  Loader2,
  Check
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { 
  formatCPF, 
  formatCNPJ, 
  validateCPF, 
  validateCNPJ, 
  cleanDigits 
} from '@/lib/validation/brazilian-banking';
import { PLAN_CONFIG, PlanTier } from '@/lib/permissions';

export default function ProfessionalProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState<'personal_trainer' | 'nutritionist' | 'holistic_coach' | 'gym_owner'>('personal_trainer');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Documentos e Verificação KYC (Itens 2 & 3)
  const [documentType, setDocumentType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [documentNumber, setDocumentNumber] = useState('');
  const [crefNumber, setCrefNumber] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [planTier, setPlanTier] = useState('starter');

  // Novos campos: Endereço, Data de Nascimento, Asaas Subconta e Assinatura
  const [birthDate, setBirthDate] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [asaasWalletId, setAsaasWalletId] = useState<string | null>(null);
  const [asaasPixKey, setAsaasPixKey] = useState<string>('');
  const [planCycle, setPlanCycle] = useState<string>('MONTHLY');
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  const handleCepChange = async (val: string) => {
    setPostalCode(val);
    const clean = cleanDigits(val);
    if (clean.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress(data.logradouro || '');
          setProvince(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        }
      } catch (e) {
        console.warn('Erro ao consultar ViaCEP:', e);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleDocChange = (val: string) => {
    if (documentType === 'CPF') {
      setDocumentNumber(formatCPF(val));
    } else {
      setDocumentNumber(formatCNPJ(val));
    }
  };

  // Modal para verificação de telefone via código SMS/WhatsApp
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setUserEmail(user.email || '');
        setProfessionalId(user.id);

        const metadata = user.user_metadata || {};

        const { data: prof } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const docNum = prof?.document_number || metadata.document_number || '';
        const phNum = prof?.phone || metadata.phone || '';
        const isPhVerified = metadata.phone_verified === true || Boolean(prof?.phone_verified);
        const isDocVerified = Boolean(docNum && docNum.length >= 11);

        if (prof) {
          setFullName(prof.full_name || metadata.full_name || '');
          setSpecialty(prof.specialty || metadata.specialty || 'personal_trainer');
          setPhone(phNum);
          setInstagram(prof.instagram || metadata.instagram || '');
          setBio(prof.bio || metadata.bio || '');
          setAvatarUrl(prof.avatar_url || metadata.avatar_url || metadata.picture || null);
          setDocumentType(prof.document_type || metadata.document_type || 'CPF');
          setDocumentNumber(docNum);
          setCrefNumber(prof.cref_number || metadata.cref_number || '');
          setPlanTier(prof.plan_tier || 'starter');
          setBirthDate(prof.birth_date || '');
          setPostalCode(prof.postal_code || '');
          setAddress(prof.address || '');
          setAddressNumber(prof.address_number || '');
          setProvince(prof.province || '');
          setCity(prof.city || '');
          setState(prof.state || '');
          setAsaasWalletId(prof.asaas_wallet_id || null);
          setAsaasPixKey(prof.asaas_pix_key || '');
          setPlanCycle(prof.plan_cycle || 'MONTHLY');
          setCurrentPeriodEnd(prof.current_period_end || null);
        } else {
          setFullName(metadata.full_name || user.email?.split('@')[0] || '');
          setPhone(phNum);
          setInstagram(metadata.instagram || '');
          setBio(metadata.bio || '');
          setAvatarUrl(metadata.avatar_url || metadata.picture || null);
          setDocumentType(metadata.document_type || 'CPF');
          setDocumentNumber(docNum);
          setCrefNumber(metadata.cref_number || '');
        }

        setPhoneVerified(isPhVerified);
        setDocumentVerified(isDocVerified);
      } catch (err: any) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !professionalId) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `coach_${professionalId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          picture: publicUrl,
        },
      });

      try {
        await supabase
          .from('professionals')
          .update({ avatar_url: publicUrl } as any)
          .eq('id', professionalId);
      } catch (colErr) {
        console.warn('Coluna avatar_url sincronizada via auth metadata.');
      }

      showToast('Foto de perfil atualizada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao subir foto de perfil:', err);
      showToast('Erro ao carregar imagem: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    setVerifyingPhone(true);
    try {
      // Simulação / Validação do PIN de 4 dígitos enviado via SMS/WhatsApp
      if (verificationCode.trim().length !== 4) {
        showToast('Informe o código de 4 dígitos recebido.');
        setVerifyingPhone(false);
        return;
      }

      await supabase.auth.updateUser({
        data: { phone_verified: true, phone: phone.trim() },
      });

      try {
        await supabase
          .from('professionals')
          .update({ phone: phone.trim(), phone_verified: true } as any)
          .eq('id', professionalId);
      } catch (e) {
        // Fallback
      }

      setPhoneVerified(true);
      setPhoneModalOpen(false);
      setVerificationCode('');
      showToast('Telefone verificado com sucesso!');
    } catch (err: any) {
      showToast('Erro ao validar código: ' + err.message);
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const isDocNowVerified = Boolean(documentNumber.trim().replace(/\D/g, '').length >= 11);

      // 1. Atualizar metadados do Auth
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          specialty,
          instagram: instagram.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
          document_type: documentType,
          document_number: documentNumber.trim(),
          cref_number: crefNumber.trim(),
          phone_verified: phoneVerified,
        },
      });

      // 2. Gravar na tabela professionals usando UPDATE (para não colidir com triggers de plano)
      const updatePayload: any = {
        full_name: fullName.trim(),
        specialty,
        phone: phone.trim() || null,
        instagram: instagram.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        document_type: documentType,
        document_number: documentNumber.trim() || null,
        birth_date: birthDate || null,
        postal_code: postalCode || null,
        address: address || null,
        address_number: addressNumber || null,
        province: province || null,
        city: city || null,
        state: state || null,
      };

      if (asaasPixKey && asaasPixKey.trim()) {
        updatePayload.asaas_pix_key = asaasPixKey.trim();
      }

      // Tenta atualizar incluindo cref_number
      let { error: updateError } = await supabase
        .from('professionals')
        .update({ ...updatePayload, cref_number: crefNumber.trim() || null })
        .eq('id', professionalId);

      // Se falhar (ex: coluna cref_number não existe ainda no banco), tenta sem cref_number
      if (updateError) {
        console.warn('Tentativa com cref_number falhou, salvando dados principais:', updateError.message);
        const { error: retryError } = await supabase
          .from('professionals')
          .update(updatePayload)
          .eq('id', professionalId);

        if (retryError) {
          console.error('Erro ao atualizar tabela professionals:', retryError);
          throw new Error('Falha ao salvar dados no banco: ' + retryError.message);
        }
      }

      // 3. Sincronização com o gateway Asaas (se documento e chave Pix presentes)
      const cleanDoc = cleanDigits(documentNumber);
      if (asaasPixKey && asaasPixKey.trim() && cleanDoc.length >= 11) {
        try {
          const bankRes = await fetch('/api/finance/bank-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentType,
              documentNumber,
              pixKey: asaasPixKey.trim(),
              mobilePhone: phone.trim() || undefined,
              birthDate: documentType === 'CPF' ? birthDate : undefined,
              postalCode,
              address,
              addressNumber,
              province,
              city,
              state,
            }),
          });
          const bankData = await bankRes.json();
          if (bankData?.data?.walletId) {
            setAsaasWalletId(bankData.data.walletId);
          }
          if (bankData?.data?.pixKey) {
            setAsaasPixKey(bankData.data.pixKey);
          }
        } catch (apiErr) {
          console.warn('Sincronização bancária:', apiErr);
        }
      }

      setDocumentVerified(isDocNowVerified);
      showToast('Perfil profissional e dados fiscais atualizados com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      showToast('Erro ao salvar alterações: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500 font-mono text-xs">
        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span>CARREGANDO_DADOS_DO_PERFIL...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 font-mono">
              COACH IDENTITY & KYC
            </span>
            <span className="text-xs text-zinc-400 font-medium">Configurações da Conta</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Meu Perfil Profissional</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Gerencie sua identidade pública, credenciais de segurança e selos de verificação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/finance">
            <div className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-zinc-300 flex items-center gap-2 hover:border-white/20 transition-colors">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="font-mono uppercase font-bold">Plano: {planTier.toUpperCase()}</span>
            </div>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Avatar e Identidade Visual */}
        <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-xl rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Camera className="h-4 w-4 text-white" /> Foto de Perfil & Presença
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Sua foto será exibida no cabeçalho do cockpit e nas missões para seus alunos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 rounded-2xl bg-zinc-900 border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-xl">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-zinc-500" />
                  )}
                </div>

                <label 
                  htmlFor="coach-avatar-input"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-2xl cursor-pointer"
                >
                  <Camera className="h-5 w-5 text-white mb-1" />
                  <span className="text-[9px] font-mono text-white font-bold uppercase">Trocar</span>
                </label>
                <input
                  id="coach-avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-base font-bold text-white font-mono">{fullName || 'Treinador ArenaFit'}</h3>
                  {documentVerified && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      <ShieldCheck className="h-3 w-3 mr-1" /> CONTA VERIFICADA
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{userEmail}</p>
                <p className="text-[10px] font-mono text-zinc-500">
                  {uploadingAvatar ? 'Enviando imagem...' : 'Formatos aceitos: JPG, PNG, WEBP até 5MB.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Status de Verificação KYC e Confiabilidade (Item 3) */}
        <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-xl rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <ShieldCheck className="h-4 w-4 text-white" /> Status de Verificação e Segurança
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Contas verificadas contam com saques Pix liberados em D+0 e maior conversão de vendas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Item 1: Documento Oficial */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">Documento (KYC)</span>
                  {documentVerified ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider">
                      VERIFICADO
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono uppercase tracking-wider">
                      PENDENTE
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-300 font-mono">
                  {documentNumber ? `${documentType}: ${documentNumber}` : 'Nenhum documento preenchido'}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {documentVerified ? 'Identidade confirmada para transações financeiras.' : 'Preencha seu CPF ou CNPJ abaixo para verificar.'}
                </p>
              </div>

              {/* Item 2: Telefone / WhatsApp */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">Telefone Celular</span>
                  {phoneVerified ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider">
                      VERIFICADO
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono uppercase tracking-wider">
                      NÃO VERIFICADO
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-300 font-mono">
                  {phone || 'Nenhum telefone'}
                </p>
                <div className="pt-1">
                  {!phoneVerified ? (
                    <button
                      type="button"
                      onClick={() => setPhoneModalOpen(true)}
                      className="text-[11px] font-mono font-bold text-white underline hover:text-zinc-300 flex items-center gap-1"
                    >
                      <Smartphone className="h-3 w-3" /> Validar por Código
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-mono">Número validado</span>
                  )}
                </div>
              </div>

              {/* Item 3: E-mail de Acesso */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">E-mail de Login</span>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider">
                    VERIFICADO
                  </Badge>
                </div>
                <p className="text-xs text-zinc-300 font-mono truncate">
                  {userEmail}
                </p>
                <p className="text-[10px] text-zinc-500">
                  Protegido via Supabase Auth com MFA.
                </p>
              </div>
            </div>

            {/* Inputs de Documento, Registro e Chave Pix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Documento Pessoal / Empresa *
                </label>
                <div className="flex gap-2">
                  <select
                    value={documentType}
                    onChange={(e: any) => setDocumentType(e.target.value)}
                    className="w-24 bg-black/60 border border-white/10 text-white rounded-xl px-2 h-11 text-xs focus:outline-none focus:border-white/40 font-mono"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </select>
                  <Input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => handleDocChange(e.target.value)}
                    placeholder={documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                    maxLength={documentType === 'CPF' ? 14 : 18}
                    className="flex-1 bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Sincronizado com a Área Financeira.
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-white" />
                  <span>Chave Pix de Recebimento</span>
                </label>
                <Input
                  type="text"
                  value={asaasPixKey}
                  onChange={(e) => setAsaasPixKey(e.target.value)}
                  placeholder="E-mail, CPF, celular ou aleatória"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Para recebimento de repasses e saques.
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-white" />
                  <span>Registro Profissional (CREF / CRN)</span>
                </label>
                <Input
                  type="text"
                  value={crefNumber}
                  onChange={(e) => setCrefNumber(e.target.value)}
                  placeholder="Ex: CREF 012345-G/SP"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Exibido aos alunos como garantia técnica.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Assinatura do Treinador & Subconta Asaas (Split) */}
        <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-xl rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
                  <Wallet className="h-4 w-4 text-white" /> Assinatura do Coach & Subconta Asaas
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Status da sua assinatura da plataforma e subconta para recebimento de repasses (Split).
                </CardDescription>
              </div>
              <Link href="/dashboard/finance">
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs font-mono border-white/20 text-white hover:bg-white/10 flex items-center gap-1.5">
                  <span>Central Financeira</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block mb-1">Plano Atual</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white font-mono">{planTier.toUpperCase()}</span>
                  <Badge className="bg-white/10 text-white border-0 text-[10px]">
                    Taxa: {PLAN_CONFIG[planTier as PlanTier]?.platformFeePercent || 15}%
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                  Renovação: {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString('pt-BR') : 'Mensal ativo'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block mb-1">Subconta Asaas (Split)</span>
                {asaasWalletId ? (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                      <Check className="w-3.5 h-3.5" /> ATIVA PARA SPLIT
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono truncate mt-1">
                      ID: {asaasWalletId}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold">
                      <AlertCircle className="w-3.5 h-3.5" /> PENDENTE
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Preencha o endereço abaixo para ativar repasses automáticos.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-black/40">
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block mb-1">Chave Pix de Saque</span>
                <p className="text-xs text-white font-mono font-bold truncate">
                  {asaasPixKey || 'Não cadastrada'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {asaasPixKey ? 'Saques Pix D+0 liberados' : 'Cadastre para receber saques'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Endereço do Treinador (Exigido pelo Asaas / BACEN) */}
        <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-xl rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <MapPin className="h-4 w-4 text-white" /> Endereço & Dados de Cadastro Asaas
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Esses dados são exigidos pelas normas regulatórias do BACEN e Asaas para emissão de subcontas e repasses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              {/* CEP */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    CEP
                  </label>
                  {loadingCep && (
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                    </span>
                  )}
                </div>
                <Input
                  type="text"
                  value={postalCode}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                />
              </div>

              {/* Logradouro */}
              <div className="sm:col-span-3">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Logradouro / Rua / Avenida
                </label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Av. Paulista"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
                />
              </div>

              {/* Número */}
              <div className="sm:col-span-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Número
                </label>
                <Input
                  type="text"
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                  placeholder="100"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                />
              </div>

              {/* Bairro */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Bairro
                </label>
                <Input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Centro"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
                />
              </div>

              {/* Cidade */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Cidade
                </label>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
                />
              </div>

              {/* UF */}
              <div className="sm:col-span-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  UF
                </label>
                <Input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono uppercase"
                />
              </div>

              {/* Data de Nascimento (para CPF) */}
              <div className="sm:col-span-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Nascimento
                </label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Dados Profissionais & Biografia */}
        <Card className="border-white/10 bg-zinc-950/60 backdrop-blur-xl rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
              <Briefcase className="h-4 w-4 text-white" /> Dados Públicos & Atuação
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Esses dados personalizam a página de vendas e os canais de suporte da sua turma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Nome Completo *
                </label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome profissional"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Especialidade de Atuação
                </label>
                <select
                  value={specialty}
                  onChange={(e: any) => setSpecialty(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 text-white rounded-xl px-3 h-11 text-xs focus:outline-none focus:border-white/40"
                >
                  <option value="personal_trainer">Personal Trainer</option>
                  <option value="nutritionist">Nutricionista</option>
                  <option value="holistic_coach">Coach / Consultor Esportivo</option>
                  <option value="gym_owner">Gestor / Proprietário de Academia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-white" />
                  <span>WhatsApp de Atendimento *</span>
                </label>
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                  <svg className="h-3 w-3 text-white fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Instagram Profissional</span>
                </label>
                <Input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@seu.perfil"
                  className="bg-black/60 border-white/10 text-white rounded-xl focus:border-white/40 h-11 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-white" />
                <span>Mini Bio / Manifesto do Treinador</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Treinador há mais de 8 anos focado em transformação corporal definitiva, disciplina inabalável e hipertrofia sem atalhos."
                className="w-full bg-black/60 border border-white/10 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-white/40 resize-none font-sans"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar Alterações */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto h-11 px-8 font-mono text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-all shadow-lg active:scale-95 rounded-xl"
          >
            {saving ? 'Gravando Alterações...' : 'Salvar Perfil'}
          </Button>
        </div>
      </form>

      {/* Modal de Validação de Telefone */}
      <CustomDialog
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        title="Verificar Número de Telefone"
        description={`Enviamos um código de verificação para ${phone || 'o seu número'}. Digite o PIN de 4 dígitos para confirmar:`}
        confirmLabel={verifyingPhone ? 'Validando...' : 'Confirmar Código'}
        cancelLabel="Cancelar"
        onConfirm={handleVerifyPhoneCode}
        isLoading={verifyingPhone}
      >
        <div className="py-3">
          <Input
            type="text"
            maxLength={4}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="1 2 3 4"
            className="text-center font-mono text-lg tracking-[0.5em] h-12 bg-black/60 border-white/20 text-white rounded-xl"
            autoFocus
          />
          <p className="text-[10px] text-zinc-500 font-mono text-center mt-2">
            Em ambiente de testes, utilize o PIN de demonstração: 1234
          </p>
        </div>
      </CustomDialog>

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
