'use client';

import React from 'react';
import Link from 'next/link';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { trackMarketingEvent } from '@/lib/analytics/tracking';
import { 
  X, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Camera, 
  Trophy, 
  Zap, 
  Flame,
  Share2
} from 'lucide-react';

export function SocialProofTestimonials() {
  const comparisons = [
    {
      title: 'Divulgação & Novos Alunos',
      icon: Share2,
      badge: 'Sua Marca nos Stories 9:16',
      whatsapp: {
        label: 'No WhatsApp ou Planilha',
        text: 'Ninguém posta print de planilha ou conversa de grupo nos Stories. Seu desafio acontece escondido e não atrai nenhum aluno novo do Instagram.',
      },
      arena: {
        label: 'Na ArenaFitPro',
        text: 'Cards 9:16 prontos para Stories (Foto, Galeria ou Sticker Transparente) com o SEU Logo e Nome da sua Consultoria em dourado no topo.',
      },
    },
    {
      title: 'Auditoria & Seu Tempo Livre',
      icon: Camera,
      badge: 'Zero Tempo com Prints',
      whatsapp: {
        label: 'No WhatsApp Comum',
        text: 'Você perde 2 a 3 horas toda noite rolando 300 mensagens para conferir fotos frias de prato e prints repetidos da semana passada.',
      },
      arena: {
        label: 'Na ArenaFitPro',
        text: 'Câmera Antifraude ao vivo que bloqueia fotos da galeria + IA Nutricional que calcula calorias e proteínas automaticamente na hora.',
      },
    },
    {
      title: 'Retenção até o Último Dia',
      icon: Trophy,
      badge: '94.8% de Conclusão',
      whatsapp: {
        label: 'No WhatsApp Comum',
        text: 'Metade da turma silencia o grupo no 7º dia. Sem placar ao vivo, os alunos desanimam calados e não renovam para a próxima turma.',
      },
      arena: {
        label: 'Na ArenaFitPro',
        text: 'Pódio em tempo real, Streaks diários, Squads em equipe e Radar Anti-Churn que avisa quem sumiu há 48h para resgate em 1 toque.',
      },
    },
    {
      title: 'Faturamento & Pagamentos',
      icon: Zap,
      badge: 'Pix D+0 (Taxa 0% no Pro)',
      whatsapp: {
        label: 'No WhatsApp Comum',
        text: 'Ficar cobrando comprovante de Pix no privado, anotando quem pagou em planilha e levando prejuízo com estorno de cartão.',
      },
      arena: {
        label: 'Na ArenaFitPro',
        text: 'Checkout automático com Split Pix D+0 integrado ao Asaas: o aluno paga, entra na hora e 100% do seu lucro cai direto na sua conta.',
      },
    },
  ];

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 relative border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-mono uppercase tracking-wider text-zinc-200 mb-3">
            <Flame className="w-4 h-4 text-amber-400" />
            WHATSAPP CAÓTICO VS. ARENAFITPRO
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 text-balance">
            Por que grupos de WhatsApp matam seus desafios (e o seu tempo)
          </h2>
          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed text-pretty font-normal">
            Mais de 60% dos alunos abandonam desafios em grupos desorganizados na primeira semana. Veja como você transforma um grupo silencioso em uma máquina de retenção, divulgação e lucro:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisons.map((item, index) => {
            const Icon = item.icon;
            return (
              <SpotlightCard3D key={index} className="p-6 sm:p-8 flex flex-col justify-between border-white/10 bg-zinc-950/80 backdrop-blur-xl">
                <div>
                  {/* Top Header Card */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/12 flex items-center justify-center text-white shrink-0 shadow-inner">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-200 font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 shrink-0">
                      {item.badge}
                    </span>
                  </div>

                  {/* Comparativo: O Caos do WhatsApp */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/[0.06] mb-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-wider">
                      <X className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{item.whatsapp.label}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                      {item.whatsapp.text}
                    </p>
                  </div>

                  {/* Comparativo: A Solução ArenaFitPro */}
                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-bold">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.arena.label}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                      {item.arena.text}
                    </p>
                  </div>
                </div>
              </SpotlightCard3D>
            );
          })}
        </div>

        {/* Chamada de Conversão Direta ao final da comparação */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-white/15 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Pronto para rodar seu próximo desafio com 0% de mensalidade inicial?
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 font-normal">
              Crie sua conta grátis agora, configure sua turma em 3 minutos e teste hoje mesmo.
            </p>
          </div>
          <Link
            href="/login?role=professional&mode=signup"
            onClick={() => trackMarketingEvent('Lead', { content_name: 'Comparativo WhatsApp Criar Conta' })}
            className="shrink-0 w-full sm:w-auto"
          >
            <button className="mono-button-primary w-full sm:w-auto min-h-[48px] px-7 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Criar Conta Grátis Agora</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
