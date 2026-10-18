'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  ShieldCheck, 
  Trophy, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Smartphone, 
  Lock, 
  Flame, 
  MessageCircle,
  HelpCircle,
  BadgeCheck,
  Percent,
  Check,
  ChevronRight
} from 'lucide-react';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';
import { JsonLd } from '@/components/seo/json-ld';

export default function VipCapturePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [role, setRole] = useState('personal_trainer');
  const [studentsRange, setStudentsRange] = useState('11_30');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formatWhatsapp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsapp(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || whatsapp.replace(/\D/g, '').length < 10) {
      setErrorMessage('Preencha todos os campos obrigatórios com DDD.');
      return;
    }

    setLoading(true);

    try {
      const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const utm_source = searchParams.get('utm_source') || undefined;
      const utm_medium = searchParams.get('utm_medium') || undefined;
      const utm_campaign = searchParams.get('utm_campaign') || undefined;

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          role,
          students_range: studentsRange,
          utm_source,
          utm_medium,
          utm_campaign,
        }),
      });

      const data = await res.json();
      if (!res.ok && data.error) {
        setErrorMessage(data.error);
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const vipPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Lista VIP de Lançamento | ArenaFitPro para Treinadores',
    description: 'Acesso prioritário ao sistema operacional de gamificação fitness e desafios esportivos com split bancário Pix D+0.',
    url: 'https://arenafitpro.com.br/vip',
  };

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white selection:text-black overflow-x-hidden font-sans">
      <JsonLd data={vipPageSchema} />

      {/* Background 3D com partículas de profundidade (o mesmo do App) */}
      <Monochrome3DBackground />

      {/* Top Bar Minimalista Titanium */}
      <header className="border-b border-white/[0.08] bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-transform bg-black shrink-0">
              <img
                src="/app-logo.png"
                alt="ArenaFitPro Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white block leading-none">
                ArenaFitPro
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-zinc-400 block mt-1">
                Gamification OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950 border border-white/10 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-300 font-bold uppercase tracking-wider">
                Vagas Abertas • Lista VIP 2026
              </span>
            </div>
            <Link 
              href="/login" 
              className="text-xs font-mono text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 active:scale-95 transition-all"
            >
              Área de Acesso
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          
          {/* Lado Esquerdo: Headline & Value Proposition Luxury Titanium */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-zinc-300 text-[11px] font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Exclusivo para Treinadores, Nutris e Academias
            </div>

            <div className="relative">
              {/* Estrela 3D cromada flutuante sutil */}
              <div className="absolute -top-10 -right-6 hidden sm:block opacity-40">
                <Chrome3DStar size={70} delay={0.5} />
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-white text-balance">
                Engaje sua turma e fature{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400">
                  R$ 1.500 a R$ 6.000 extras
                </span>{' '}
                a cada desafio.
              </h1>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl text-pretty font-normal">
              O sistema operacional de gamificação fitness e auditoria de hábitos. Validação com <strong>Câmera ao Vivo Antifraude</strong>, IA nutricional e <strong>Split Bancário Pix D+0 direto na sua conta</strong>.
            </p>

            {/* Cards de Pilares do Sistema - Estilo App */}
            <div className="space-y-3 pt-2">
              
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl flex items-start gap-3.5 hover:border-white/20 transition-all">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">Zero Prescrição Manual em App</h4>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Continue prescrevendo no seu PDF ou planilha habitual. O ArenaFitPro audita o cumprimento diário dos alunos.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl flex items-start gap-3.5 hover:border-white/20 transition-all">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">Split Bancário Pix D+0 (Sem Bitributação)</h4>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Seu lucro líquido cai direto na sua conta bancária após o pagamento do aluno, sem reter dinheiro em plataformas por 30 dias.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl flex items-start gap-3.5 hover:border-white/20 transition-all">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">Pódio, Squads e Ranking Oficial</h4>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Pressão social positiva e mecânicas de retenção que multiplicam o engajamento e evitam desistências na 2ª semana.
                  </p>
                </div>
              </div>

            </div>

            {/* Bônus de Lançamento VIP */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 text-xs sm:text-sm text-zinc-300 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <div>
                <strong className="text-white font-mono uppercase text-xs block">Vantagem de Fundador:</strong>
                Garantia de <strong>taxa de split reduzida</strong> para os primeiros 100 profissionais + Template de Desafio de 21 Dias validado.
              </div>
            </div>

          </div>

          {/* Lado Direito: SpotlightCard3D de Formulário */}
          <div className="lg:col-span-5">
            <SpotlightCard3D glowIntensity={0.16} className="p-6 sm:p-8">
              
              {!submitted ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/15">
                        LISTA VIP • ACESSO PRIORITÁRIO
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Cadastre-se Gratuitamente
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Receba o convite de ativação e o roteiro passo a passo para lançar seu desafio.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Treinador Lucas Silva"
                        className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all min-h-[48px]"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">
                        WhatsApp (com DDD)
                      </label>
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={handleWhatsappChange}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all min-h-[48px]"
                      />
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">
                        E-mail Profissional
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="lucas@personal.com.br"
                        className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all min-h-[48px]"
                      />
                    </div>

                    {/* Atuação e Volume de Alunos */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">
                          Atuação
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-white/40 min-h-[48px]"
                        >
                          <option value="personal_trainer">Personal Trainer</option>
                          <option value="nutricionista">Nutricionista</option>
                          <option value="academia_box">Academia / Box</option>
                          <option value="outro">Consultoria Online</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">
                          Alunos Ativos
                        </label>
                        <select
                          value={studentsRange}
                          onChange={(e) => setStudentsRange(e.target.value)}
                          className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-white/40 min-h-[48px]"
                        >
                          <option value="1_10">1 a 10 alunos</option>
                          <option value="11_30">11 a 30 alunos</option>
                          <option value="31_60">31 a 60 alunos</option>
                          <option value="60_plus">Mais de 60 alunos</option>
                        </select>
                      </div>
                    </div>

                    {/* Primary Button — Optical White Pill (Padrão DESIGN.md) */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs sm:text-sm tracking-wider py-4 transition-all shadow-[0_10px_25px_rgba(255,255,255,0.18)] active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px]"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Reservando Vaga...
                        </span>
                      ) : (
                        <>
                          Garantir Vaga na Lista VIP <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 text-center pt-1 font-mono">
                      <Lock className="w-3 h-3 text-zinc-400" /> Seus dados estão 100% seguros sob a LGPD. Zero spam.
                    </div>
                  </form>
                </div>
              ) : (
                /* Estado de Sucesso */
                <div className="py-8 text-center space-y-5 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/20 text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    <Check className="w-8 h-8 text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/25">
                      Inscrição VIP Confirmada
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Parabéns, {name.split(' ')[0]}!
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      Sua vaga prioritária com benefícios de fundador foi reservada com sucesso.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-zinc-300 space-y-1.5 text-left">
                    <strong className="text-white block font-mono uppercase text-[11px]">Canal Exclusivo de Treinadores:</strong>
                    <p className="text-zinc-400">
                      Entre no grupo silencioso de WhatsApp para receber a aula prática e o script de fechamento do desafio.
                    </p>
                  </div>

                  <a
                    href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20acabei%20de%20me%20cadastrar%20na%20Lista%20VIP%20da%20ArenaFitPro!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs sm:text-sm tracking-wider py-4 transition-all shadow-[0_10px_25px_rgba(255,255,255,0.18)] active:scale-[0.98] min-h-[48px]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" /> Entrar no Grupo VIP de Treinadores
                  </a>

                  <Link 
                    href="/" 
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors pt-2"
                  >
                    Conhecer a plataforma institucional <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

            </SpotlightCard3D>
          </div>

        </div>

        {/* Métricas e Prova de Conceito */}
        <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white block">D+0</span>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Repasse Pix Instantâneo</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 block">3.8x</span>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Mais adesão dos alunos</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white block">100%</span>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Auditoria ao Vivo Antifraude</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 block">R$ 0</span>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Mensalidade no Starter</p>
          </div>
        </div>
      </main>

      {/* Rodapé Oficial */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-zinc-400 font-mono space-y-2 relative z-10">
        <div>© {new Date().getFullYear()} ArenaFitPro Ltda. Todos os direitos reservados.</div>
        <div className="flex items-center justify-center gap-4 text-zinc-300">
          <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
          <span>•</span>
          <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade & LGPD</Link>
          <span>•</span>
          <Link href="/ajuda" className="hover:text-white transition-colors">Central de Ajuda</Link>
        </div>
      </footer>
    </div>
  );
}
