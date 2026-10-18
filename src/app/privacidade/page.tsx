'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Eye, 
  Trash2, 
  Database, 
  Server, 
  CheckCircle2, 
  Mail,
  Camera,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Monochrome3DBackground } from '@/components/ui/monochrome-3d-background';
import { SpotlightCard3D } from '@/components/ui/spotlight-card-3d';
import { JsonLd } from '@/components/seo/json-ld';

const privacyBreadcrumbSchema = {
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
      name: 'Política de Privacidade & LGPD',
      item: 'https://arenafitpro.com.br/privacidade',
    },
  ],
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white selection:text-black overflow-x-hidden font-sans">
      <JsonLd data={privacyBreadcrumbSchema} />

      {/* Background 3D animado */}
      <Monochrome3DBackground />

      {/* Top Header */}
      <header className="border-b border-white/[0.08] bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-transform bg-black shrink-0">
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
                Privacidade & LGPD
              </span>
            </div>
          </Link>

          <Link 
            href="/termos" 
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            Termos de Uso <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10 space-y-8">
        
        {/* Cabeçalho */}
        <div className="space-y-3 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Conformidade LGPD (Lei 13.709/2018)
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase bg-white/5 text-zinc-400 px-3 py-1 rounded-full border border-white/10">
              DOCUMENTO OFICIAL v2.4
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Política de Privacidade & Proteção de Dados
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Última atualização: 17 de Outubro de 2026 • ArenaFitPro Tecnologia Ltda.
          </p>
        </div>

        {/* Resumo Rápido em SpotlightCard3D */}
        <SpotlightCard3D glowIntensity={0.12} className="p-6 sm:p-7 space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Compromisso de Privacidade em Linguagem Direta
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            O <strong>ArenaFitPro</strong> opera sob o princípio da minimização de dados. Não vendemos seus dados em nenhuma circunstância. Coletamos estritamente o necessário para operacionalizar as turmas de desafios fitness, validar as missões esportivas com Câmera ao Vivo e assegurar a integridade dos rankings entre alunos e treinadores.
          </p>
        </SpotlightCard3D>

        {/* Seções em Containers Titanium */}
        <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          
          {/* Seção 1 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <Database className="h-4 w-4 text-white" /> 1. Dados Coletados e Finalidades Específicas
            </h2>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-white text-xs sm:text-sm block">Dados Cadastrais e Perfil:</strong>
                <p className="text-xs text-zinc-400">Nome completo, e-mail, telefone/WhatsApp e foto de perfil para criação de conta e acesso à turma.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-white text-xs sm:text-sm block">Comprovações de Missões (Câmera ao Vivo & GPS):</strong>
                <p className="text-xs text-zinc-400">Registros ópticos de refeições, treinos, hidratação e cardio capturados ao vivo para auditoria antifraude e pontuação justa no leaderboard.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-white text-xs sm:text-sm block">Cofre de Evolução Corporal (Antes & Depois):</strong>
                <p className="text-xs text-zinc-400">Fotos de composição física armazenadas com criptografia de ponta a ponta. Visíveis exclusivamente pelo próprio aluno e pelo seu treinador cadastrado.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-white text-xs sm:text-sm block">Dados Financeiros e Split Pix:</strong>
                <p className="text-xs text-zinc-400">Processamento de pagamentos e repasses instantâneos via Asaas. Dados sensíveis de cartão não trafegam nem são guardados em nossos servidores.</p>
              </div>
            </div>
          </div>

          {/* Seção 2 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 2. Bases Legais de Tratamento (LGPD - Art. 7º)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] font-mono text-emerald-400 block mb-1 uppercase font-bold">Execução Contratual</span>
                <p className="text-xs text-zinc-400">Prestação do serviço de gamificação e acesso às turmas contratadas.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] font-mono text-emerald-400 block mb-1 uppercase font-bold">Consentimento</span>
                <p className="text-xs text-zinc-400">Acesso pontual à câmera e submissão opcional de fotos do Cofre.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] font-mono text-emerald-400 block mb-1 uppercase font-bold">Legítimo Interesse</span>
                <p className="text-xs text-zinc-400">Auditoria antifraude e proteção da integridade dos rankings.</p>
              </div>
            </div>
          </div>

          {/* Seção 3 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <Server className="h-4 w-4 text-white" /> 3. Compartilhamento com Provedores de Infraestrutura
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              O compartilhamento ocorre exclusivamente com provedores essenciais para a operação da aplicação:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-zinc-400">
              <li><strong className="text-white">Supabase / PostgreSQL:</strong> Hospedagem segura de banco de dados com criptografia em repouso e trânsito (SSL/TLS).</li>
              <li><strong className="text-white">Asaas Gestão Financeira S.A.:</strong> Instituição autorizada pelo Banco Central do Brasil para emissão e liquidação de Pix e split automático.</li>
              <li><strong className="text-white">APIs de Inteligência Artificial Multimodal:</strong> Processamento pontual e efêmero de imagens de refeições para estimativa de calorias e macronutrientes. Imagens não são usadas para treino público identificável.</li>
            </ul>
          </div>

          {/* Seção 4 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" /> 4. Direitos do Titular e Exclusão Total de Conta
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Em cumprimento ao Art. 18 da LGPD e às diretrizes da Apple App Store e Google Play Store, você pode solicitar a qualquer momento a exclusão permanente de seus dados e conta.
            </p>
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm space-y-2">
              <strong className="text-red-300 block font-mono uppercase text-xs">Procedimento para Exclusão:</strong>
              <p className="text-zinc-300 leading-relaxed">
                Envie um e-mail para <a href="mailto:privacidade@arenafitpro.com.br" className="text-white underline font-mono">privacidade@arenafitpro.com.br</a> com o assunto <strong>"Exclusão de Conta e Dados"</strong> a partir do e-mail cadastrado na plataforma, ou solicite diretamente na aba de perfil do aplicativo. A solicitação é processada em até 15 dias úteis.
              </p>
            </div>
          </div>

          {/* Seção 5 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
              <Mail className="h-4 w-4 text-white" /> 5. Canal de Contato do Encarregado de Dados (DPO)
            </h2>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 font-mono text-xs sm:text-sm">
              <p><span className="text-zinc-400">Controlador:</span> ArenaFitPro Tecnologia Ltda.</p>
              <p><span className="text-zinc-400">Encarregado (DPO):</span> Igor Telmo / Segurança e Privacidade</p>
              <p><span className="text-zinc-400">E-mail:</span> <a href="mailto:privacidade@arenafitpro.com.br" className="text-white underline">privacidade@arenafitpro.com.br</a></p>
            </div>
          </div>

        </div>

      </main>

      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-zinc-400 font-mono space-y-2 relative z-10">
        <div>© {new Date().getFullYear()} ArenaFitPro Ltda. Todos os direitos reservados.</div>
        <div className="flex items-center justify-center gap-4 text-zinc-300">
          <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
          <span>•</span>
          <Link href="/vip" className="hover:text-white transition-colors">Lista VIP</Link>
          <span>•</span>
          <Link href="/ajuda" className="hover:text-white transition-colors">Central de Ajuda</Link>
        </div>
      </footer>
    </div>
  );
}
