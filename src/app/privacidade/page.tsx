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
  MapPin,
  FileText
} from 'lucide-react';
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
    <div className="min-h-screen bg-black text-white p-6 sm:p-12 relative max-w-4xl mx-auto selection:bg-amber-400 selection:text-black">
      <JsonLd data={privacyBreadcrumbSchema} />

      {/* Navegação Topo */}
      <div className="mb-8 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white/5 border border-white/10"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Início
        </Link>
        <Link 
          href="/termos" 
          className="text-xs font-mono text-zinc-400 hover:text-white underline decoration-zinc-600 transition-colors"
        >
          Ver Termos de Uso
        </Link>
      </div>

      <div className="space-y-8">
        {/* Cabeçalho */}
        <div className="space-y-3 border-b border-white/10 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Conformidade LGPD (Lei 13.709/2018)
            </span>
            <span className="text-xs font-mono uppercase bg-white/5 text-zinc-400 px-3 py-1 rounded-full border border-white/10">
              Versão 2.4
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Política de Privacidade & Proteção de Dados
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Última atualização: 17 de Outubro de 2026 • ArenaFitPro Ltda.
          </p>
        </div>

        {/* Resumo Rápido */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-400" /> Resumo em Linguagem Clara
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            O <strong>ArenaFitPro</strong> valoriza a sua privacidade e segurança física e digital. Não vendemos seus dados em hipótese alguma. Coletamos estritamente o necessário para operacionalizar as turmas de desafios fitness, validar missões e garantir a integridade dos rankings entre alunos e treinadores.
          </p>
        </div>

        {/* Conteúdo Detalhado */}
        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed font-sans">
          
          {/* Seção 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <Database className="h-4 w-4 text-emerald-400" /> 1. Dados que Coletamos e Finalidades
            </h2>
            <p>
              Para a execução do serviço e participação nos desafios esportivos, coletamos as seguintes categorias de dados:
            </p>
            <ul className="space-y-2.5 list-none pl-0">
              <li className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                <div>
                  <strong className="text-white block font-medium">Dados Cadastrais:</strong>
                  Nome completo, e-mail, número de WhatsApp/telefone e foto de perfil.
                </div>
                <span className="text-xs font-mono text-zinc-500 shrink-0">Autenticação e Turmas</span>
              </li>

              <li className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                <div>
                  <strong className="text-white block font-medium flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-zinc-400" /> Registros de Missões e Câmera ao Vivo:
                  </strong>
                  Fotos capturadas em tempo real durante as missões (prato de comida, treino, cardio, água) com carimbo de data, horário e localização GPS aproximada.
                </div>
                <span className="text-xs font-mono text-zinc-500 shrink-0">Validação Antifraude</span>
              </li>

              <li className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                <div>
                  <strong className="text-white block font-medium flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-400" /> Fotos de Evolução Corporal (Cofre Antes & Depois):
                  </strong>
                  Imagens enviadas opcionalmente pelo aluno para acompanhamento de composição física. Possuem nível máximo de criptografia e só podem ser visualizadas pelo próprio aluno e pelo seu treinador responsável.
                </div>
                <span className="text-xs font-mono text-amber-400/80 shrink-0">Acesso Restrito</span>
              </li>

              <li className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                <div>
                  <strong className="text-white block font-medium">Dados Financeiros e Faturamento:</strong>
                  Informações de transações Pix ou Cartão para emissão de cobranças e repasses. Dados sensíveis de cartão não são salvos em nossos servidores.
                </div>
                <span className="text-xs font-mono text-zinc-500 shrink-0">Gestão Asaas / BCB</span>
              </li>
            </ul>
          </section>

          {/* Seção 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 2. Bases Legais (LGPD - Art. 7º)
            </h2>
            <p>
              O tratamento dos dados pessoais no ArenaFitPro está fundamentado nas seguintes bases da Lei Geral de Proteção de Dados:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs font-mono text-emerald-400 block mb-1">Execução de Contrato</span>
                <p className="text-xs text-zinc-400">Para liberar o acesso ao desafio, rankings e serviços contratados com o treinador.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs font-mono text-emerald-400 block mb-1">Consentimento Explícito</span>
                <p className="text-xs text-zinc-400">Para acesso à câmera, geolocalização e envio de fotos do Cofre de Evolução.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs font-mono text-emerald-400 block mb-1">Legítimo Interesse & Antifraude</span>
                <p className="text-xs text-zinc-400">Para auditoria de integridade da pontuação e segurança dos participantes.</p>
              </div>
            </div>
          </section>

          {/* Seção 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <Server className="h-4 w-4 text-emerald-400" /> 3. Compartilhamento com Terceiros
            </h2>
            <p>
              Não comercializamos nem cedemos seus dados para fins de publicidade de terceiros. O compartilhamento ocorre única e exclusivamente com provedores essenciais para a operação da aplicação:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
              <li><strong className="text-white">Supabase / PostgreSQL:</strong> Hospedagem segura de banco de dados e autenticação com criptografia em repouso e em trânsito (SSL/TLS).</li>
              <li><strong className="text-white">Asaas Gestão Financeira S.A.:</strong> Instituição autorizada pelo Banco Central do Brasil para liquidação de Pix, cobranças e split de pagamentos.</li>
              <li><strong className="text-white">Serviços de IA Multimodal (Google Cloud / Gemini):</strong> Processamento efêmero e instantâneo de fotos de refeições para cálculo nutricional estimativo. As imagens não são usadas para treinamento de modelos públicos com dados identificáveis.</li>
            </ul>
          </section>

          {/* Seção 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <Lock className="h-4 w-4 text-emerald-400" /> 4. Câmera, Geolocalização e Permissões do Dispositivo
            </h2>
            <p>
              Para assegurar que as atividades físicas sejam comprovadamente realizadas:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-400">
              <li><strong className="text-white">Câmera:</strong> Solicitada apenas no momento do check-in de missões ou foto de evolução.</li>
              <li><strong className="text-white">Localização (GPS):</strong> Capturada de forma estritamente pontual durante o check-in para atestar a veracidade das corridas e treinos. O ArenaFitPro <strong>não rastreia</strong> sua movimentação em tempo real ou segundo plano.</li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <Trash2 className="h-4 w-4 text-red-400" /> 5. Direitos do Titular e Exclusão de Conta (LGPD Art. 18 / Apple & Google Policy)
            </h2>
            <p>
              Você é o proprietário dos seus dados pessoais e possui o direito irrevogável de:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-400">
              <li>Acessar, corrigir ou atualizar seus dados a qualquer momento pelo aplicativo.</li>
              <li>Revogar consentimentos concedidos anteriormente.</li>
              <li>Solicitar a exclusão completa e permanente de sua conta e histórico de fotos.</li>
            </ul>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm space-y-2">
              <strong className="text-red-400 block font-mono uppercase">Como solicitar a exclusão de dados:</strong>
              <p className="text-zinc-300">
                O usuário pode solicitar o encerramento da conta e expurgo dos dados enviando um e-mail com o assunto <strong>"Exclusão de Dados - [Seu E-mail]"</strong> para <a href="mailto:privacidade@arenafitpro.com.br" className="text-white underline font-mono">privacidade@arenafitpro.com.br</a> ou diretamente nas configurações de perfil do aplicativo. A solicitação é atendida em até 15 dias úteis, resguardados os prazos fiscais e legais obrigatórios de guarda financeira.
              </p>
            </div>
          </section>

          {/* Seção 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2 border-b border-white/5 pb-2">
              <Mail className="h-4 w-4 text-emerald-400" /> 6. Contato com o Encarregado de Dados (DPO)
            </h2>
            <p>
              Para esclarecer qualquer dúvida sobre o tratamento de seus dados ou exercer os seus direitos perante a LGPD, entre em contato diretamente com o nosso Encarregado de Proteção de Dados:
            </p>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-xs sm:text-sm font-mono">
              <p><span className="text-zinc-500">Controlador:</span> ArenaFitPro Tecnologia Ltda.</p>
              <p><span className="text-zinc-500">Encarregado (DPO):</span> Igor Telmo / Comitê de Segurança e Privacidade</p>
              <p><span className="text-zinc-500">E-mail Direto:</span> <a href="mailto:privacidade@arenafitpro.com.br" className="text-amber-400 hover:underline">privacidade@arenafitpro.com.br</a></p>
              <p><span className="text-zinc-500">Suporte Geral:</span> <a href="mailto:suporte@arenafitpro.com.br" className="text-white hover:underline">suporte@arenafitpro.com.br</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
