'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  FileCheck, 
  AlertCircle, 
  Send, 
  Clock, 
  UserCheck, 
  Database, 
  CheckCircle2, 
  Copy, 
  Sparkles 
} from 'lucide-react';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { CorporateFooter } from '@/components/layout/corporate-footer';
import { JsonLd } from '@/components/seo/json-ld';
import { CORPORATE_CONFIG } from '@/lib/corporate-config';

const lgpdPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Canal de Atendimento ao Titular de Dados • LGPD | ArenaFitPro',
  description: 'Canal oficial e formulário para exercício dos direitos de titular de dados pessoais previstos no Art. 18 da Lei Geral de Proteção de Dados (Lei 13.709/2018).',
  url: 'https://arenafitpro.com.br/lgpd',
};

const REQUEST_TYPES = [
  {
    id: 'access',
    label: 'Confirmação e Acesso aos Dados',
    description: 'Solicitar confirmação da existência de tratamento e cópia dos dados cadastrais mantidos pela plataforma.',
  },
  {
    id: 'correction',
    label: 'Correção de Dados',
    description: 'Solicitar correção de informações pessoais incompletas, inexatas ou desatualizadas.',
  },
  {
    id: 'deletion',
    label: 'Eliminação Definitiva / Exclusão de Conta',
    description: 'Excluir permanentemente sua conta, fotos de check-in e dados tratados com base em consentimento.',
  },
  {
    id: 'anonymization',
    label: 'Anonimização ou Bloqueio',
    description: 'Solicitar anonimização ou suspensão temporária do tratamento de dados excessivos.',
  },
  {
    id: 'portability',
    label: 'Portabilidade dos Dados',
    description: 'Receber relatório estruturado com os dados fornecidos à plataforma para transferência a outro serviço.',
  },
  {
    id: 'revocation',
    label: 'Revogação de Consentimento',
    description: 'Retirar o consentimento previamente fornecido para permissões específicas de câmera ou cofre.',
  },
  {
    id: 'other',
    label: 'Outras Dúvidas ou Esclarecimentos',
    description: 'Fazer uma pergunta específica ao Encarregado de Proteção de Dados (DPO).',
  },
];

export default function LgpdRequestPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [userType, setUserType] = useState<'student' | 'coach' | 'visitor'>('student');
  const [requestType, setRequestType] = useState<string>('access');
  const [details, setDetails] = useState('');
  const [confirmedIdentity, setConfirmedIdentity] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successProtocol, setSuccessProtocol] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!confirmedIdentity) {
      setErrorMessage('Por favor, confirme a declaração de titularidade dos dados.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/legal/lgpd-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          cpf: cpf.trim() || undefined,
          userType,
          requestType,
          details: details.trim(),
          confirmedIdentity,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.details || data.error || 'Erro ao processar sua solicitação. Tente novamente.');
        setLoading(false);
        return;
      }

      setSuccessProtocol(data.protocol);
    } catch {
      setErrorMessage('Erro de conexão ao enviar a solicitação. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const copyProtocol = () => {
    if (!successProtocol) return;
    navigator.clipboard.writeText(successProtocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white selection:text-black overflow-x-hidden font-sans">
      <JsonLd data={lgpdPageSchema} />

      {/* Link Acessível para Pular Navegação */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-white text-black font-bold rounded-lg"
      >
        Pular para o conteúdo principal
      </a>

      {/* Background 3D animado */}
      <Monochrome3DBackground />

      {/* Header Institucional */}
      <header className="border-b border-white/[0.08] bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 focus-visible:ring-2 focus-visible:ring-white rounded-lg">
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                ArenaFitPro
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mt-1">
                Canal LGPD • Art. 18
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/privacidade"
              className="text-xs font-mono text-zinc-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1"
            >
              Ver Política
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main id="conteudo-principal" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10 space-y-8">
        
        {/* Cabeçalho Editorial */}
        <div className="space-y-3 border-b border-white/10 pb-8 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Canal de Requisições Legais
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase bg-white/5 text-zinc-300 px-3 py-1 rounded-full border border-white/10">
              Lei nº 13.709/2018
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Portal de Privacidade & Atendimento ao Titular
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 font-mono">
            {CORPORATE_CONFIG.legalName} • Encarregado (DPO): {CORPORATE_CONFIG.contacts.dpoName}
          </p>
        </div>

        {/* Resumo Legal */}
        <SpotlightCard3D glowIntensity={0.12} className="p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Seus Direitos Fundamentais de Privacidade
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            A LGPD assegura a você a titularidade plena e o controle sobre seus dados pessoais. Através deste canal oficial, você pode protocolar formalmente qualquer requisição prevista no Art. 18 da Lei. As solicitações são recebidas diretamente pelo nosso Encarregado de Proteção de Dados (DPO) e respondidas no prazo legal de até <strong>{CORPORATE_CONFIG.legal.dpoResponseDays} dias úteis</strong>.
          </p>
        </SpotlightCard3D>

        {/* Formulário ou Mensagem de Sucesso */}
        {!successProtocol ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-white/15 backdrop-blur-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Formulário Oficial de Solicitação</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Preencha os dados abaixo com as informações idênticas às cadastradas no ArenaFitPro para validação de identidade.
              </p>
            </div>

            {errorMessage && (
              <div 
                role="alert" 
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-200 text-xs sm:text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Identificação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name-input" className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Nome Completo *
                </label>
                <input
                  id="name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/15 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email-input" className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                  E-mail Cadastrado na Plataforma *
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/15 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cpf-input" className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                  CPF (Apenas Números) <span className="text-zinc-500 font-normal">(Opcional, para alunos Pix)</span>
                </label>
                <input
                  id="cpf-input"
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/15 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="user-type-select" className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Seu Perfil na Plataforma *
                </label>
                <select
                  id="user-type-select"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="student">Aluno de Desafio (Participante)</option>
                  <option value="coach">Treinador / Personal / Nutricionista (Coach)</option>
                  <option value="visitor">Visitante / Lead do Site</option>
                </select>
              </div>
            </div>

            {/* Tipo de Solicitação */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Selecione o Direito a Exercer (Art. 18 LGPD) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {REQUEST_TYPES.map((type) => {
                  const isSelected = requestType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setRequestType(type.id)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-white text-white shadow-sm'
                          : 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center justify-between">
                        <span>{type.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-normal font-normal">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detalhes */}
            <div className="space-y-1.5">
              <label htmlFor="details-textarea" className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Detalhamento da sua Solicitação *
              </label>
              <textarea
                id="details-textarea"
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Descreva detalhadamente a sua solicitação. Se for correção, informe o dado correto. Se for exclusão de fotos do cofre ou da conta, mencione o e-mail ou turma."
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/15 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white resize-y"
              />
            </div>

            {/* Declaração de Titularidade */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedIdentity}
                  onChange={(e) => setConfirmedIdentity(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-zinc-900 text-white focus:ring-white cursor-pointer"
                />
                <span className="text-xs text-zinc-300 leading-relaxed">
                  Declaro, sob as penas da lei, ser o legítimo titular dos dados pessoais informados ou seu representante legal devidamente constituído, ciente de que o fornecimento de informações falsas constitui crime previsto no Código Penal Brasileiro.
                </span>
              </label>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Protocolando Solicitação...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Solicitação ao DPO</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-8 sm:p-10 rounded-3xl bg-zinc-950/90 border border-emerald-500/30 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/25">
                Protocolo Registrado com Sucesso
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Sua Solicitação foi Protocolada!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
                Guarde o número de protocolo abaixo para acompanhar o andamento. Nosso Encarregado de Proteção de Dados (DPO) analisará a requisição e enviará a resposta formal em até <strong>15 dias úteis</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black border border-white/15 max-w-md mx-auto flex items-center justify-between gap-4 font-mono">
              <div className="text-left">
                <span className="text-[10px] text-zinc-500 uppercase block">Número do Protocolo:</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400">{successProtocol}</span>
              </div>
              <button
                type="button"
                onClick={copyProtocol}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                aria-label="Copiar número de protocolo"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/" className="w-full sm:w-auto">
                <button className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors w-full sm:w-auto">
                  Voltar à Página Inicial
                </button>
              </Link>
              <Link href="/privacidade" className="w-full sm:w-auto">
                <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-mono text-xs uppercase tracking-wider hover:text-white transition-colors w-full sm:w-auto">
                  Consultar Política de Privacidade
                </button>
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* Rodapé Corporativo Padronizado */}
      <CorporateFooter />
    </div>
  );
}
