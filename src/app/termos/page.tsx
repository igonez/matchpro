'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  FileText, 
  Lock, 
  AlertTriangle, 
  CreditCard, 
  Scale, 
  HelpCircle,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { JsonLd } from '@/components/seo/json-ld';

const termsBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Início',
      item: 'https://arenafitpro.com.br',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Termos de Uso',
      item: 'https://arenafitpro.com.br/termos',
    },
  ],
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white selection:text-black overflow-x-hidden font-sans">
      <JsonLd data={termsBreadcrumbSchema} />

      {/* Background 3D animado */}
      <Monochrome3DBackground />

      {/* Top Header */}
      <header className="border-b border-white/[0.08] bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-white transition-colors px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 active:scale-95 min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao Início
          </Link>

          <Link 
            href="/privacidade" 
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            Ver Política de Privacidade (LGPD) <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10 space-y-8">
        
        {/* Cabeçalho */}
        <div className="space-y-3 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase bg-white/10 text-white px-3 py-1 rounded-full border border-white/20">
              DOCUMENTO LEGAL v2.4
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase bg-amber-400/10 text-amber-300 px-3 py-1 rounded-full border border-amber-400/20">
              CONTRATO DE ADESÃO SAAS
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Termos e Condições de Uso
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Última atualização: 17 de Outubro de 2026 • Plataforma ArenaFitPro
          </p>
        </div>

        {/* Resumo em SpotlightCard3D */}
        <SpotlightCard3D glowIntensity={0.12} className="p-6 sm:p-7 space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Adesão ao Ecossistema ArenaFitPro
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            Ao se cadastrar ou navegar na plataforma web e aplicativo, você concorda com as diretrizes de conduta, integridade desportiva, antifraude e condições comerciais estabelecidas a seguir.
          </p>
        </SpotlightCard3D>

        {/* Seções em Containers Titanium */}
        <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          
          {/* Seção 1 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <FileText className="h-4 w-4 text-white" /> 1. Natureza da Plataforma SaaS e Isenção Médica
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              O <strong>ArenaFitPro</strong> é uma plataforma tecnológica de software como serviço (SaaS), fornecendo ferramentas de infraestrutura para desafios esportivos, gamificação em equipes (squads), validação visual de missões, controle de rankings e automação de cobranças.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200/90 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-mono text-xs mb-1">Aviso Mandatório de Saúde:</strong>
                O ArenaFitPro não prescreve treinos médicos ou cardápios diretamente. Todo protocolo esportivo e nutricional é de responsabilidade técnica integral dos <strong>Treinadores ou Nutricionistas devidamente certificados</strong>. É recomendada avaliação médica prévia antes do início de qualquer desafio de alta intensidade.
              </div>
            </div>
          </div>

          {/* Seção 2 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <Award className="h-4 w-4 text-white" /> 2. Regras de Missões, Auditoria e Antifraude
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              O ecossistema é baseado na justiça desportiva e na veracidade dos rankings. São diretrizes mandatórias:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-zinc-400">
              <li>As comprovações diárias (refeições, treinos, hidratação) devem ser capturadas <strong>ao vivo</strong> através da câmera do aplicativo com carimbo de tempo e geolocalização.</li>
              <li>O uso de fotos da galeria, capturas de outras telas, simulações de GPS ou registros de terceiros acarretam na anulação imediata da pontuação.</li>
              <li>O treinador ou a administração da plataforma reservam-se o direito de anular pontos e expulsar participantes que tentarem burlar os sensores ópticos.</li>
            </ul>
          </div>

          {/* Seção 3 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-400" /> 3. Pagamentos, Splits e Política de Reembolso
            </h2>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-white text-xs sm:text-sm block">Direito de Arrependimento (CDC Art. 49):</strong>
                <p className="text-xs text-zinc-400">O participante pode solicitar o cancelamento e reembolso da inscrição em até 7 (sete) dias corridos após a compra, desde que a turma ainda esteja ativa e em andamento regular.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-white text-xs sm:text-sm block">Repasse D+0 a Treinadores:</strong>
                <p className="text-xs text-zinc-400">Os valores líquidos arrecadados são repassados ao treinador através do split bancário automático via Asaas, com retenção exclusiva da taxa tecnológica acordada no plano.</p>
              </div>
            </div>
          </div>

          {/* Seção 4 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <Scale className="h-4 w-4 text-white" /> 4. Foro e Legislação Aplicável
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer litígios oriundos deste instrumento, fica eleito o Foro da Comarca da sede da empresa administradora.
            </p>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-xs sm:text-sm text-zinc-400 space-y-1">
              <p>Canal Jurídico: <a href="mailto:juridico@arenafitpro.com.br" className="text-white underline">juridico@arenafitpro.com.br</a></p>
              <p>Dúvidas Operacionais: <Link href="/ajuda" className="text-white underline">Central de Ajuda</Link></p>
            </div>
          </div>

        </div>

      </main>

      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-zinc-400 font-mono space-y-2 relative z-10">
        <div>© {new Date().getFullYear()} ArenaFitPro Ltda. • Luxury Monochrome & Titanium Gamification OS</div>
        <div className="flex items-center justify-center gap-4 text-zinc-300">
          <Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade & LGPD</Link>
          <span>•</span>
          <Link href="/vip" className="hover:text-white transition-colors">Lista VIP</Link>
          <span>•</span>
          <Link href="/ajuda" className="hover:text-white transition-colors">Central de Ajuda</Link>
        </div>
      </footer>
    </div>
  );
}
