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
  Award
} from 'lucide-react';
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
    <div className="min-h-screen bg-black text-white p-6 sm:p-12 relative max-w-4xl mx-auto selection:bg-amber-400 selection:text-black">
      <JsonLd data={termsBreadcrumbSchema} />
      
      {/* Navegação Topo */}
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white/5 border border-white/10"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Início
        </Link>
        <Link 
          href="/privacidade" 
          className="text-xs font-mono text-zinc-400 hover:text-white underline decoration-zinc-600 transition-colors"
        >
          Ver Política de Privacidade (LGPD)
        </Link>
      </div>

      <div className="space-y-8">
        {/* Cabeçalho */}
        <div className="space-y-3 border-b border-white/10 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase bg-white/10 text-white px-3 py-1 rounded-full border border-white/20">
              DOCUMENTO LEGAL v2.4
            </span>
            <span className="text-xs font-mono uppercase bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full border border-amber-400/20">
              CONTRATO DE ADESÃO
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Termos e Condições de Uso
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Última atualização: 17 de Outubro de 2026 • Plataforma ArenaFitPro
          </p>
        </div>

        {/* Resumo */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2">
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Bem-vindo ao <strong>ArenaFitPro</strong>. Ao se cadastrar ou utilizar nossa plataforma web e aplicativo, você concorda integralmente com estes Termos de Uso. Leia-os com atenção antes de concluir seu registro ou efetuar pagamentos em desafios.
          </p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-sans">
          
          {/* Seção 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <FileText className="h-4 w-4 text-amber-400" /> 1. Natureza da Plataforma SaaS e Isenção Médica
            </h2>
            <p>
              O <strong>ArenaFitPro</strong> é uma plataforma tecnológica de software como serviço (SaaS), fornecendo ferramentas de infraestrutura para desafios esportivos, gamificação em equipes (squads), validação visual de missões, controle de rankings e automação de cobranças.
            </p>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200/90 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Aviso de Saúde e Responsabilidade Técnica:</strong> O ArenaFitPro <strong>não é um serviço médico, nutricional ou de assessoria esportiva direta</strong>. Todo treinamento, protocolo físico, prescrição alimentar e orientação de saúde é de responsabilidade técnica exclusiva do <strong>Treinador/Coach ou Academia</strong> responsável pela turma criada. Recomenda-se a realização de avaliação médica prévia antes do início de qualquer programa de atividade física intensa.
              </div>
            </div>
          </section>

          {/* Seção 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <Scale className="h-4 w-4 text-amber-400" /> 2. Cadastro e Requisitos dos Usuários
            </h2>
            <p>
              Para utilizar a plataforma, o usuário declara ter no mínimo 18 anos de idade ou estar devidamente assistido por seus responsáveis legais. As informações fornecidas durante o cadastro devem ser autênticas, completas e atualizadas. A guarda do login e senha é pessoal e intransferível.
            </p>
          </section>

          {/* Seção 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <Award className="h-4 w-4 text-amber-400" /> 3. Regras das Missões, Integridade e Antifraude
            </h2>
            <p>
              O ecossistema ArenaFitPro baseia-se na justiça desportiva e na veracidade dos rankings. São diretrizes mandatórias:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
              <li>As comprovações de missões (alimentação, treino, cardio, água) devem ser capturadas <strong>ao vivo</strong> via câmera do aplicativo, com registro de data e geolocalização.</li>
              <li>É expressamente proibido o uso de fotos retiradas da internet, fotografar telas, usar registros de terceiros ou ferramentas de simulação de GPS/mock location.</li>
              <li>O treinador ou a administração da plataforma reservam-se o direito de anular pontuações, rebaixar participantes ou excluir usuários que fraudem o sistema de auditoria.</li>
            </ul>
          </section>

          {/* Seção 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <CreditCard className="h-4 w-4 text-amber-400" /> 4. Pagamentos, Reembolso e Split
            </h2>
            <p>
              As inscrições em desafios e assinaturas são liquidadas por parceiros de pagamento autorizados (Asaas Gestão Financeira S.A.).
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
              <li><strong className="text-white">Direito de Arrependimento (CDC Art. 49):</strong> O participante pode solicitar o cancelamento e reembolso da inscrição em até 7 (sete) dias corridos após a compra, desde que o desafio não tenha sido encerrado.</li>
              <li><strong className="text-white">Taxas e Repasses de Treinadores:</strong> O treinador recebe o repasse líquido diretamente em conta bancária cadastrada após o split automático, descontada a taxa de serviço de intermediação tecnológica da plataforma.</li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <Lock className="h-4 w-4 text-amber-400" /> 5. Propriedade Intelectual e Proteção de Dados
            </h2>
            <p>
              Todos os elementos de interface, marcas, logotipos, códigos-fonte e algoritmos de pontuação e IA são de propriedade exclusiva da ArenaFitPro Tecnologia Ltda.
            </p>
            <p>
              O tratamento de dados pessoais obedece rigorosamente à nossa <Link href="/privacidade" className="text-amber-400 hover:underline">Política de Privacidade & LGPD</Link>, em total conformidade com a Lei nº 13.709/2018.
            </p>
          </section>

          {/* Seção 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <HelpCircle className="h-4 w-4 text-amber-400" /> 6. Foro e Disposições Gerais
            </h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Para a resolução de eventuais litígios que não possam ser resolvidos amigavelmente entre as partes, fica eleito o Foro da Comarca da sede da empresa administradora.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm font-mono text-zinc-400 space-y-1">
              <p>Contato para suporte legal e regulatório: <a href="mailto:juridico@arenafitpro.com.br" className="text-white hover:underline">juridico@arenafitpro.com.br</a></p>
              <p>Dúvidas da comunidade: <Link href="/ajuda" className="text-amber-400 hover:underline">Acesse a Central de Ajuda</Link></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
