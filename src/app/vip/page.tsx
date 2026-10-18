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
  DollarSign, 
  Flame, 
  MessageCircle,
  HelpCircle,
  BadgeCheck,
  Percent
} from 'lucide-react';
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
      setErrorMessage('Por favor, preencha todos os campos obrigatórios com DDD.');
      return;
    }

    setLoading(true);

    try {
      // Capturar parâmetros UTM da URL se existirem
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
      setSubmitted(true); // Manter conversão mesmo em falha offline
    } finally {
      setLoading(false);
    }
  };

  const vipPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Lista VIP de Lançamento | ArenaFitPro para Treinadores',
    description: 'Acesso antecipado ao sistema operacional de gamificação fitness e desafios com split bancário Pix D+0.',
    url: 'https://arenafitpro.com.br/vip',
  };

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-amber-400 selection:text-black">
      <JsonLd data={vipPageSchema} />

      {/* Grid de Fundo & Glows de alta conversão */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Bar Minimalista */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black">
              ⚡
            </div>
            <span className="font-black text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
              Arena<span className="text-amber-400">Fit</span>Pro
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Vagas Abertas para Lista VIP 2026
            </span>
            <Link 
              href="/login" 
              className="text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
            >
              Já tenho acesso
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section com Grid Duplo (Promessa + Formulário) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Lado Esquerdo: Copywriting e Proposta de Valor B2B */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Exclusivo para Treinadores, Nutris e Academias
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] text-white">
              Transforme seus alunos em uma turma engajada e fature{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                R$ 5.000 a R$ 25.000
              </span>{' '}
              por desafio.
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
              Crie desafios esportivos gamificados com <strong>câmera ao vivo antifraude</strong>, IA nutricional e <strong>Split Pix D+0 direto na sua conta</strong>. Zero tempo perdido digitando fichas ou cardápios.
            </p>

            {/* Bullets com Ícones */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Zero Prescrição Manual em App</h4>
                  <p className="text-xs text-zinc-400">Continue prescrevendo em PDF ou planilha. O ArenaFitPro audita os hábitos e a disciplina diária.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Split Bancário Pix D+0 (Sem Bitributação)</h4>
                  <p className="text-xs text-zinc-400">Seu lucro cai direto na sua conta sem esperar 30 dias. Tributação apenas sobre o que é seu.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Squads, Pódio e Ranking Automático</h4>
                  <p className="text-xs text-zinc-400">Pressão social positiva que faz os alunos terminarem o desafio sem desistir na segunda semana.</p>
                </div>
              </div>
            </div>

            {/* Badge de Bônus de Lançamento */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 text-xs sm:text-sm text-zinc-300 flex items-center gap-3">
              <div className="text-2xl shrink-0">🎁</div>
              <div>
                <strong className="text-white block font-mono">Bônus da Lista VIP:</strong>
                Garantia de <strong>taxa de split reduzida</strong> para os primeiros 100 profissionais + Template de Desafio de 21 Dias validado.
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário de Alta Conversão */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Efeito Glow atrás do card */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-amber-400/30 to-amber-600/5 blur-xl opacity-75" />

              <div className="relative rounded-2xl bg-zinc-950/90 border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                
                {!submitted ? (
                  <>
                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-amber-400 font-bold">
                        <BadgeCheck className="w-4 h-4" /> Acesso Prioritário • Lista VIP
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        Cadastre-se Gratuitamente
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Receba o convite de ativação e a aula prática de lançamento do seu primeiro desafio.
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                        {errorMessage}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Nome */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase text-zinc-400">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Treinador Lucas Silva"
                          className="w-full bg-zinc-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all min-h-[48px]"
                        />
                      </div>

                      {/* WhatsApp com máscara */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase text-zinc-400">WhatsApp (com DDD)</label>
                        <input
                          type="tel"
                          required
                          value={whatsapp}
                          onChange={handleWhatsappChange}
                          placeholder="(11) 99999-9999"
                          className="w-full bg-zinc-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all min-h-[48px]"
                        />
                      </div>

                      {/* E-mail */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase text-zinc-400">Seu Melhor E-mail</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="lucas@personal.com.br"
                          className="w-full bg-zinc-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all min-h-[48px]"
                        />
                      </div>

                      {/* Perfil Profissional */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase text-zinc-400">Sua Atuação</label>
                          <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 min-h-[48px]"
                          >
                            <option value="personal_trainer">Personal Trainer</option>
                            <option value="nutricionista">Nutricionista</option>
                            <option value="academia_box">Academia / Box</option>
                            <option value="outro">Consultoria Online</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-mono uppercase text-zinc-400">Alunos Ativos</label>
                          <select
                            value={studentsRange}
                            onChange={(e) => setStudentsRange(e.target.value)}
                            className="w-full bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 min-h-[48px]"
                          >
                            <option value="1_10">1 a 10 alunos</option>
                            <option value="11_30">11 a 30 alunos</option>
                            <option value="31_60">31 a 60 alunos</option>
                            <option value="60_plus">Mais de 60 alunos</option>
                          </select>
                        </div>
                      </div>

                      {/* Botão de Envio */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black uppercase text-sm tracking-wider py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2 min-h-[52px]"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            Reservando Vaga...
                          </span>
                        ) : (
                          <>
                            Garantir Minha Vaga VIP <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 text-center pt-1 font-mono">
                        <Lock className="w-3 h-3" /> Seus dados estão 100% seguros sob a LGPD. Sem spam.
                      </div>
                    </form>
                  </>
                ) : (
                  /* Estado de Sucesso */
                  <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                        Inscrição VIP Confirmada!
                      </span>
                      <h3 className="text-2xl font-black text-white">
                        Parabéns, {name.split(' ')[0]}!
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
                        Sua vaga prioritária com benefícios de taxa reduzida foi reservada com sucesso.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-300 space-y-2 text-left">
                      <strong className="text-white block font-mono">Próximo Passo Recomendado:</strong>
                      <p>
                        Entre no nosso canal direto no WhatsApp para receber o tutorial de 10 minutos de como faturar R$ 5.000 no seu primeiro desafio com a ArenaFitPro:
                      </p>
                    </div>

                    <a
                      href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20acabei%20de%20me%20cadastrar%20na%20Lista%20VIP%20da%20ArenaFitPro!"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs sm:text-sm tracking-wider py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 min-h-[48px]"
                    >
                      <MessageCircle className="w-5 h-5" /> Entrar no Grupo VIP de Treinadores
                    </a>

                    <Link 
                      href="/" 
                      className="block text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                    >
                      Explorar a página institucional →
                    </Link>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

        {/* Prova Social & Métricas no Rodapé da Captura */}
        <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">D+0</span>
            <p className="text-xs text-zinc-400">Repasse Pix Instantâneo</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">3.8x</span>
            <p className="text-xs text-zinc-400">Mais adesão dos alunos</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">100%</span>
            <p className="text-xs text-zinc-400">Auditoria Antifraude ao vivo</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">R$ 0</span>
            <p className="text-xs text-zinc-400">Mensalidade no Starter</p>
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-500 font-mono space-y-2">
        <div>© {new Date().getFullYear()} ArenaFitPro Ltda. • Todos os direitos reservados.</div>
        <div className="flex items-center justify-center gap-4 text-zinc-400">
          <Link href="/termos" className="hover:text-white">Termos de Uso</Link>
          <span>•</span>
          <Link href="/privacidade" className="hover:text-white">Política de Privacidade & LGPD</Link>
          <span>•</span>
          <Link href="/ajuda" className="hover:text-white">Ajuda</Link>
        </div>
      </footer>
    </div>
  );
}
