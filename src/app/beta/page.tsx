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
  ChevronRight,
  Code2,
  Bug,
  Gift,
  Compass
} from 'lucide-react';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { Chrome3DStar } from '@/components/ui/chrome-3d-star';
import { JsonLd } from '@/components/seo/json-ld';

export default function BetaTestersPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
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
      setErrorMessage('Preencha os campos obrigatórios com DDD.');
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
          instagram: instagram.trim(),
          lead_type: 'beta_tester',
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

  const betaPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Programa de Treinadores Fundadores • Beta Fechado ArenaFitPro',
    description: 'Inscrição para personais e nutricionistas testarem a plataforma ArenaFitPro em primeira mão com acesso gratuito e benefícios vitalícios de fundador.',
    url: 'https://arenafitpro.com.br/beta',
  };

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white selection:text-black overflow-x-hidden font-sans">
      <JsonLd data={betaPageSchema} />

      {/* Background 3D animado */}
      <Monochrome3DBackground />

      {/* Top Header Minimalista */}
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
                Beta Teste • 2026
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950 border border-white/10 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="text-zinc-300 font-bold uppercase tracking-wider">
                Vagas Limitadas: 15 Selecionados
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
          
          {/* Lado Esquerdo: Editorial & Proposta de Co-criação */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-zinc-300 text-[11px] font-mono uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5 text-white" />
              Programa de Treinadores Fundadores
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-6 hidden sm:block opacity-40">
                <Chrome3DStar size={70} delay={0.3} />
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-white text-balance">
                Ajude a lapidar o futuro dos desafios esportivos.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400">
                  Teste grátis com seus alunos.
                </span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl text-pretty font-normal">
              Estamos selecionando um grupo exclusivo de <strong>15 treinadores e nutricionistas</strong> para rodar desafios-piloto na ArenaFitPro antes do lançamento oficial. Em troca do seu feedback franco, você garante <strong>acesso gratuito e benefícios vitalícios de fundador</strong>.
            </p>

            {/* Como funciona o pacto de Beta Tester */}
            <div className="space-y-3 pt-2">
              
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl flex items-start gap-3.5 hover:border-white/20 transition-all">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">O que você ganha: Status Vitalício de Fundador</h4>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Isenção total de mensalidades durante o período de testes, taxa de split reduzida para sempre e canal de WhatsApp direto com os desenvolvedores para solicitar novas funções.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl flex items-start gap-3.5 hover:border-white/20 transition-all">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
                  <Bug className="w-4 h-4 text-amber-400" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">O que pedimos em troca: Olhar Crítico e Feedback</h4>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Rodar um desafio real com pelo menos 5 a 10 alunos, reportar pontos de atrito ou melhorias de usabilidade e nos ajudar a testar o fluxo completo.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl flex items-start gap-3.5 hover:border-white/20 transition-all">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">Acompanhamento e Suporte Prioritário</h4>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Ajudamos você a configurar a sua turma, preparar as missões e ativar seus alunos sem fricção.
                  </p>
                </div>
              </div>

            </div>

            {/* Aviso de Transparência Beta */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 text-xs sm:text-sm text-zinc-300 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div>
                <strong className="text-white font-mono uppercase text-xs block">Espírito de Co-criação:</strong>
                O app já está 100% funcional. Buscamos profissionais comprometidos que valorizem fazer parte da construção de um produto de alto nível.
              </div>
            </div>

          </div>

          {/* Lado Direito: Formulário SpotlightCard3D de Candidatura Beta */}
          <div className="lg:col-span-5">
            <SpotlightCard3D glowIntensity={0.16} className="p-6 sm:p-8">
              
              {!submitted ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/15">
                        CANDIDATURA BETA FECHADO
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Candidate-se a Fundador
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Entraremos em contato via WhatsApp para liberar sua turma piloto.
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
                        Seu Nome
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Treinador Rafael"
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

                    {/* Instagram */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">
                        Instagram Profissional
                      </label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@seu.perfil"
                        className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all min-h-[48px]"
                      />
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-zinc-400 block tracking-wider">
                        Seu Melhor E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rafael@personal.com"
                        className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all min-h-[48px]"
                      />
                    </div>

                    {/* Atuação e Volume para Teste */}
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
                          Alunos p/ Teste
                        </label>
                        <select
                          value={studentsRange}
                          onChange={(e) => setStudentsRange(e.target.value)}
                          className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-white/40 min-h-[48px]"
                        >
                          <option value="1_10">5 a 10 alunos</option>
                          <option value="11_30">11 a 30 alunos</option>
                          <option value="31_60">31 a 60 alunos</option>
                          <option value="60_plus">Mais de 60 alunos</option>
                        </select>
                      </div>
                    </div>

                    {/* Botão Primário Monocromático Pill */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs sm:text-sm tracking-wider py-4 transition-all shadow-[0_10px_25px_rgba(255,255,255,0.18)] active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px]"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Enviando Candidatura...
                        </span>
                      ) : (
                        <>
                          Quero Testar em Primeira Mão <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 text-center pt-1 font-mono">
                      <Lock className="w-3 h-3 text-zinc-400" /> Candidatura gratuita e sem compromisso.
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
                      Candidatura Recebida
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Excelente, {name.split(' ')[0]}!
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      Sua inscrição para o Beta Fechado foi registrada. Vamos entrar em contato pelo WhatsApp para liberar suas credenciais de fundador.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-zinc-300 space-y-1.5 text-left">
                    <strong className="text-white block font-mono uppercase text-[11px]">Agilize seu Acesso:</strong>
                    <p className="text-zinc-400">
                      Você pode mandar uma mensagem direta agora mesmo para adiantar o onboarding da sua turma:
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/5511999999999?text=Ol%C3%A1%2C%20me%20candidatei%20ao%20Beta%20da%20ArenaFitPro%20(Nome%3A%20${encodeURIComponent(name)})!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs sm:text-sm tracking-wider py-4 transition-all shadow-[0_10px_25px_rgba(255,255,255,0.18)] active:scale-[0.98] min-h-[48px]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" /> Falar Direto com o Desenvolvedor
                  </a>

                  <Link 
                    href="/" 
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors pt-2"
                  >
                    Conhecer os recursos da plataforma <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

            </SpotlightCard3D>
          </div>

        </div>

        {/* Linha do Tempo do Programa Beta */}
        <div className="mt-20 pt-10 border-t border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase text-zinc-400 tracking-widest block">
              COMO FUNCIONARÁ O TESTE
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Fases do Programa Beta Fechado
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                01 • Onboarding & Setup
              </div>
              <h4 className="text-base font-bold text-white">Criamos sua Turma com Você</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Você define a duração (ex: 21 dias), as missões diárias de alimentação e treino e o código de convite para os seus alunos.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                02 • Piloto com Alunos
              </div>
              <h4 className="text-base font-bold text-white">Validação Real em Campo</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Seus alunos entram no app, registram treinos com câmera ao vivo e disputam o ranking. Acompanhamos juntos a experiência.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2">
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                03 • Feedback & Reconhecimento
              </div>
              <h4 className="text-base font-bold text-white">Benefícios Eternos</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Você aponta melhorias, nos ajuda a ajustar os detalhes e ganha a menor taxa da plataforma para sempre.
              </p>
            </div>
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
