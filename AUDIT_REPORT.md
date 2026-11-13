# Relatório de Auditoria de Qualidade, UX e Resiliência Técnica
## ArenaFitPro — Plataforma SaaS Multi-Tenant para Treinadores e Atletas

**Data da Auditoria:** 13 de Novembro de 2026  
**Versão do Framework:** Next.js 16.4.3 (App Router) | React 19.2.8 | Supabase SSR | Tailwind CSS v4  
**Responsável:** Engenheiro de Software Sênior & Especialista em QA/UX  
**Status da Auditoria:** Concluída (Auditoria Estática Aprofundada & Análise de Fluxos de Execução)

---

## 1. Cabeçalho Executivo

Este documento consolida a auditoria completa de qualidade técnica, experiência do usuário (UX), integridade de estados de carregamento (*loading states*), tratamento de erros e resiliência de código realizada no projeto **ArenaFitPro**.

A plataforma apresenta alto nível de sofisticação técnica, com arquitetura multi-tenant robusta, proteção de rotas com convenções modernas do Next.js 16 (`src/proxy.ts`), integração de pagamentos com split Pix (Asaas Engine v3), gamificação com antifraude por IA e design system escuro (*dark mode*) de forte apelo visual.

Contudo, a varredura aprofundada revelou inconsistências críticas e moderadas na camada de interação e apresentação, decorrentes do ciclo rápido de desenvolvimento:
1. **Falhas Críticas de Hydration (React 19 / Next.js 16):** Leitura síncrona de `sessionStorage` na inicialização de múltiplos estados do aplicativo do aluno (`/app`), gerando discrepâncias entre a árvore do servidor (SSR) e a do navegador (CSR), com descarte e remontagem de nós do DOM.
2. **Estados de Carregamento Zumbis / Esquecidos:** Variáveis de `loading` declaradas em hooks mas completamente ignoradas no retorno JSX em telas vitais — como o Cockpit Geral do Treinador (`/dashboard`), a Central Financeira (`/dashboard/finance`) e o Perfil do Aluno (`/app/profile`). O usuário é submetido a dados falsos zerados (*"R$ 0,00"*, *"0 Turmas"*, *"Nenhum desafio"*) antes de os dados reais chegarem do Supabase.
3. **Riscos de Crash em Runtime (Uncaught TypeErrors):** Métodos encadeados como `.filter()`, `.length`, `.slice()` e `.replace()` executados sem checagem de nulos em componentes de medalhas, cards de compartilhamento para Instagram, auditoria de macros por IA e listagem de alunos.
4. **Vulnerabilidade Serverless (EROFS):** Tentativa de escrita de arquivos em disco (`process.cwd()/data`) no buffer de leads, o que provoca quebra fatal em ambientes de produção imutáveis como Vercel ou AWS Lambda.
5. **Ausência de Error Boundaries de Nível de Rota (`error.tsx` / `global-error.tsx`):** A falta de boundaries específicos em `/dashboard`, `/app`, `/admin` e `/join` faz com que qualquer exceção local desmonte todo o layout da aplicação, deslogando visualmente o usuário e jogando-o na Landing Page pública.
6. **Fricção de Interação e Formulários:** Botões assíncronos que não desabilitam cliques múltiplos durante requisições de rede, falta de estados `:disabled` com Tailwind, e atualizações otimistas sem mecanismo de rollback em falhas.

Abaixo segue a matriz de apontamentos detalhados, categorizados por severidade, com localização precisa e soluções de engenharia prontas para aplicação.

---

## 2. Resumo das Descobertas

### Matriz Consolidada por Severidade e Categoria

| Categoria da Descoberta | 🔴 Crítico | 🟡 Moderado | 🔵 Polimento / UX | Total por Categoria |
|---|:---:|:---:|:---:|:---:|
| **Estados de Carregamento & Hydration** | 4 | 2 | 1 | **7** |
| **Resiliência de Componentes & Crashes** | 4 | 3 | 2 | **9** |
| **Integridade de Dados & Gravação em Banco** | 3 | 3 | 0 | **6** |
| **Arquitetura Serverless & Boundaries de Erro** | 1 | 3 | 1 | **5** |
| **Interações, Formulários & Prevenção de Duplo Clique** | 0 | 5 | 2 | **7** |
| **Responsividade Mobile & Layout Shift (CLS)** | 0 | 3 | 2 | **5** |
| **Consistência de Idioma & Polimento de UI** | 0 | 1 | 5 | **6** |
| **Total Consolidado** | **12** | **20** | **13** | **45** |

---

## 3. 🔴 Problemas Críticos (Quebra de Tela, Falha Silenciosa ou Erro de Console)

### [CRIT-01] Hydration Mismatch Severo por Leitura Síncrona de `sessionStorage` em `useState`
- **Arquivo / Rota:** `src/app/app/page.tsx:43-131` (Home do Aluno / PWA)
- **O que acontece:**
  O estado do aluno é inicializado através de lazy evaluation que acessa diretamente o `sessionStorage`:
  ```tsx
  // src/app/app/page.tsx:43-51
  const [student, setStudent] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const c = sessionStorage.getItem('arena_student_profile');
        if (c) return JSON.parse(c);
      } catch (_) {}
    }
    return null;
  });
  // Padrão replicado para challenge (52-60), standing (62-70), todayTasks (76-84), loading (126-131)
  ```
  No SSR do servidor, `window` é indefinido, logo o Next.js renderiza HTML com `student = null` e `loading = true` (exibindo o splash de loading). No navegador do cliente, se o aluno já tiver sessão aberta, o `sessionStorage` existe, fazendo o cliente hidratar com `student` preenchido e `loading = false` (árvore do dashboard completa).  
  **Impacto:** Dispara erro de hidratação do React 19 (`Error: Hydration failed because the initial UI does not match what was rendered on the server`), descartando o DOM do servidor e forçando a remontagem completa da página, gerando piscadas brancas e perda de performance no mobile.
- **Como corrigir:**
  Inicializar os estados estritamente com `null` ou valores padrão fixos e realizar a hidratação dos dados do `sessionStorage` exclusivamente dentro de um `useEffect` pós-montagem com flag de controle:
  ```tsx
  const [student, setStudent] = useState<any>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const c = sessionStorage.getItem('arena_student_profile');
      if (c) setStudent(JSON.parse(c));
    } catch (_) {}
  }, []);
  ```

---

### [CRIT-02] Estado de Carregamento Zumbi e Exibição de Falsos Zeros no Cockpit do Treinador
- **Arquivo / Rota:** `src/app/dashboard/page.tsx:16, 29, 85, 252-256, 320-380` (Visão Geral do Cockpit)
- **O que acontece:**
  A variável `isInitialBoot` está travada como `false` e a condicional de loading principal é:
  ```tsx
  // src/app/dashboard/page.tsx:252-254
  if (loading && isInitialBoot) {
    return <MobileLoadingScreen fullScreen={true} />;
  }
  ```
  Como `isInitialBoot` é permanentemente `false`, a condição nunca é atendida. A variável `loading` **não é utilizada em nenhum outro lugar do retorno JSX**.  
  **Impacto:** Sempre que o treinador acessa o painel ou recarrega a página, a tela exibe imediatamente:
  - *"0" Turmas Ativas*
  - *"0" Alunos Inscritos*
  - *"0" Fila de Revisão*
  - *"R$ 0,00" Faturamento*
  - *"Nenhum desafio cadastrado"* (empty state exibido no centro)  
  Após 1 a 2 segundos, quando o Supabase responde, os números saltam repentinamente e a mensagem de turma inexistente é substituída pelas turmas reais, assustando o treinador (parece perda de dados) e gerando Cumulative Layout Shift (CLS) extremo.
- **Como corrigir:**
  Remover a trava `isInitialBoot` e renderizar Skeletons estruturados enquanto `loading` for `true`:
  ```tsx
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-zinc-900 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-3xl border border-white/5" />
          ))}
        </div>
        <div className="h-80 bg-zinc-900 rounded-3xl border border-white/5" />
      </div>
    );
  }
  ```

---

### [CRIT-03] Falta Total de Estado de Loading na Central Financeira (Exibe R$ 0,00 e Falsos Saldos Zerados)
- **Arquivo / Rota:** `src/app/dashboard/finance/page.tsx:67, 110, 223, 420-530`
- **O que acontece:**
  O componente declara `const [loading, setLoading] = useState(true);`, faz `setLoading(true)` no início do fetch e `setLoading(false)` no `finally`. Contudo, a variável `loading` **NUNCA é referenciada no retorno JSX** (linhas 420 a 1411).  
  **Impacto:** Durante as requisições à API do Asaas e ao Supabase:
  - `availableBalance` inicia como 0 -> Exibe *"R$ 0.00 Disponível para Saque"*
  - `totalNet` inicia como 0 -> Exibe *"R$ 0.00 Faturamento Líquido"*
  - `totalGross` inicia como 0 -> Exibe *"R$ 0.00 Faturamento Bruto"*
  - `payments` inicia como `[]` -> Exibe *"Nenhuma transação financeira registrada até o momento."*  
  Se houver lentidão ou falha transitória de rede, o treinador visualiza saldo zerado e acredita que seus recebíveis desapareceram.
- **Como corrigir:**
  Condicionar os 4 cards financeiros e a tabela de transações ao estado de `loading`, exibindo `<div className="h-10 w-32 bg-[#18181B] animate-pulse rounded-xl" />` enquanto os dados são calculados.

---

### [CRIT-04] Estado de Carregamento Ignorado no Perfil do Aluno (Falsos Dados e Repaint Brusco)
- **Arquivo / Rota:** `src/app/app/profile/page.tsx:51, 95, 128, 268-356`
- **O que acontece:**
  O estado `const [loading, setLoading] = useState(true);` é manipulado no hook de busca, mas não é avaliado no JSX renderizado a partir da linha 268.  
  **Impacto:** Enquanto a consulta roda:
  - Nome do atleta aparece como *"Atleta ArenaFitPro"*
  - Pontuação aparece como *"0 Pontos"*
  - Ofensiva aparece como *"0 Dias de Ofensiva"*
  - Check-ins aparecem como *"0 Check-ins"*
  - O cofre de evolução fotográfica é renderizado bloqueado.  
  Assim que a resposta chega, todos os campos sofrem repaint em cadeia sem feedback prévio.
- **Como corrigir:**
  Renderizar um Skeleton de perfil com avatar pulsante, placeholders para dados do atleta e grade de conquistas durante `loading === true`.

---

### [CRIT-05] Risco Crítico de Falha em Runtime Serverless (EROFS) no Buffer de Leads
- **Arquivo / Rota:** `src/lib/leads-backup.ts:22-31, 54-65` chamado por `src/app/api/leads/route.ts:114`
- **O que acontece:**
  O mecanismo de contingência para salvar leads em arquivo em caso de instabilidade no banco de dados define:
  ```ts
  const BACKUP_DIR = path.join(process.cwd(), 'data');
  const BACKUP_FILE = path.join(BACKUP_DIR, 'leads_backup.json');
  ```
  O código tenta executar `fs.mkdir(BACKUP_DIR)` e `fs.writeFile(BACKUP_FILE)` no diretório raiz do projeto.  
  **Impacto:** Em provedores serverless como Vercel, AWS Lambda ou GCP Cloud Run, o sistema de arquivos local é estritamente de apenas leitura (*Read-Only File System*), com permissão de escrita concedida unicamente no diretório temporário `/tmp`. A execução desse fallback em produção dispara a exceção fatal:
  `EROFS: read-only file system, mkdir '/var/task/data'`, derrubando a API com erro HTTP 500 não tratado.
- **Como corrigir:**
  Utilizar `os.tmpdir()` para caminhos de escrita em tempo de execução serverless:
  ```ts
  import os from 'os';
  const BACKUP_DIR = process.env.NODE_ENV === 'production' ? os.tmpdir() : path.join(process.cwd(), 'data');
  const BACKUP_FILE = path.join(BACKUP_DIR, 'leads_backup.json');
  ```

---

### [CRIT-06] Crash Imediato (Uncaught TypeError) em `AchievementsGrid` por Lista Nula ou Indefinida
- **Arquivo / Rota:** `src/components/student/achievements-grid.tsx:8, 11, 15, 16, 19, 59`
- **O que acontece:**
  O componente recebe a prop `achievements` sem valor padrão (`achievements: StudentAchievementStatus[]`). Na linha 15 e 16, executa imediatamente:
  ```tsx
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalPoints = achievements.filter((a) => a.isUnlocked).reduce((acc, curr) => acc + curr.points_reward, 0);
  ```
  **Impacto:** Se o componente pai passar `undefined` ou `null` durante a carga assíncrona ou em caso de retorno vazio, a aplicação dispara `TypeError: Cannot read properties of undefined (reading 'filter')`. Como não há error boundary local, a tela inteira do aluno quebra em tela branca.
- **Como corrigir:**
  Atribuir valor padrão defensivo na assinatura do componente e usar optional chaining:
  ```tsx
  export function AchievementsGrid({ achievements = [] }: AchievementsGridProps) {
    const safeAchievements = Array.isArray(achievements) ? achievements : [];
    const unlockedCount = safeAchievements.filter((a) => a.isUnlocked).length;
    // ...
  ```

---

### [CRIT-07] Crash Imediato (Uncaught TypeError) em `RankingShareCard` por Lista de Standings Nula
- **Arquivo / Rota:** `src/components/share-ranking/ranking-share-card.tsx:64, 68-70, 106`
- **O que acontece:**
  O componente que gera a prévia de cards para redes sociais e stories executa:
  ```tsx
  const totalParticipants = standings.length;
  ```
  sem validar se a prop `standings` é um array válido.  
  **Impacto:** Se a lista for injetada como `null` ou `undefined`, dispara `TypeError: Cannot read properties of undefined (reading 'length')`, quebrando o modal de compartilhamento do ranking do aluno e do treinador.
- **Como corrigir:**
  Tratar defensivamente no topo do componente:
  ```tsx
  const safeStandings = Array.isArray(standings) ? standings : [];
  const totalParticipants = safeStandings.length;
  ```

---

### [CRIT-08] Toast Falso de Sucesso em Falha de Upload de Foto e Logo do Treinador
- **Arquivo / Rota:** `src/components/share-ranking/share-ranking-sheet.tsx:169-185`
- **O que acontece:**
  Em `handleUploadLogo`:
  ```tsx
  const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
  const data = await res.json();
  if (res.ok && data?.publicUrl) {
    setCustomCoachLogo(data.publicUrl);
    // ...
  }
  showToast('Foto e logo do treinador sincronizadas!', 'success');
  ```
  A emissão do toast de sucesso está posicionada **fora** do bloco condicional `if (res.ok && data?.publicUrl)`.  
  **Impacto:** Em respostas HTTP 400 ou 500 da API (arquivo muito pesado, formato inválido ou falha no storage), a requisição não cai no `catch`. O treinador recebe um toast verde afirmando que a logo foi salva com sucesso, quando na verdade o upload foi rejeitado e o card compartilhado continuará sem imagem.
- **Como corrigir:**
  Mover o toast de sucesso para dentro do bloco `if (res.ok && data?.publicUrl)` e emitir toast de erro no `else`:
  ```tsx
  if (res.ok && data?.publicUrl) {
    setCustomCoachLogo(data.publicUrl);
    // ...
    showToast('Foto e logo do treinador sincronizadas!', 'success');
  } else {
    showToast(data?.error || 'Erro ao sincronizar logo.', 'error');
  }
  ```

---

### [CRIT-09] Gravação no Banco Sem Validação de Erro no Cofre de Fotos de Transformação
- **Arquivo / Rota:** `src/components/student/transformation-vault-modal.tsx:108-130`
- **O que acontece:**
  O salvamento de fotos no cofre do aluno executa `await supabase.from('student_transformation_vault').update(...)` ou `.insert(...)`. As chamadas do Supabase Client retornam `{ data, error }` e não lançam exceções automáticas em caso de violação de RLS ou tipos inválidos. O código ignora o retorno `{ error }` e executa incondicionalmente:
  ```tsx
  setFile(null);
  setPreviewUrl(null);
  setWeight('');
  setNotes('');
  showStatus('Foto salva com segurança no cofre!');
  ```
  **Impacto:** Se houver rejeição da gravação no banco, o formulário e a foto são descartados localmente e o aluno é notificado com sucesso. A foto de evolução física do aluno é perdida sem que ele perceba.
- **Como corrigir:**
  Capturar e validar o objeto `{ error }`:
  ```tsx
  const { error } = vaultData?.id
    ? await supabase.from('student_transformation_vault').update(updatePayload).eq('id', vaultData.id)
    : await supabase.from('student_transformation_vault').insert({ student_id: studentId, challenge_id: challengeId, ...updatePayload });

  if (error) {
    showStatus('Erro ao salvar no cofre: ' + error.message, 'error');
    return;
  }
  ```

---

### [CRIT-10] Inserção de Aluno Sem Checagem de Erro no Cadastro e Matrícula
- **Arquivo / Rota:** `src/app/login/page.tsx:178-201`
- **O que acontece:**
  No fluxo de registro de novo aluno com código de convite:
  ```tsx
  await supabase.from('students').insert({ id: authData.user.id, full_name: fullName || 'Aluno ArenaFitPro', phone: phone || null });
  await supabase.from('challenge_participants').upsert({ challenge_id: validatedChallenge.id, student_id: authData.user.id, payment_status: isFree ? 'paid' : 'pending' });
  ```
  Não há desestruturação de `{ error }` em nenhuma das duas chamadas de escrita.  
  **Impacto:** Se a inserção em `students` for bloqueada por política de RLS ou conflito de chave primária, o código ignora o erro, emite mensagem de sucesso *"Bem-vindo à turma..."* e redireciona o aluno para `/app`. Chegando lá, todas as consultas que buscam o perfil do aluno falham ou quebram.
- **Como corrigir:**
  Validar os retornos `{ error: studentError }` e `{ error: participantError }`, revertendo ou interrompendo a navegação caso a inserção relacional falhe.

---

### [CRIT-11] Crash de Execução ao Manipular `calories` Não-String na Auditoria com IA
- **Arquivo / Rota:** `src/app/dashboard/audit/page.tsx:742`
- **O que acontece:**
  No card de análise de macros por visão computacional da refeição:
  ```tsx
  aiAnalysisMap[sub.id].estimatedMacros.calories?.replace('kcal', '').trim()
  ```
  A resposta em JSON gerada por modelos de IA (Gemini / Claude) frequentemente entrega valores numéricos puros (ex: `{ calories: 450 }` em vez de `{ calories: "450 kcal" }`).  
  **Impacto:** Ao chamar `.replace()` diretamente sobre um tipo `number`, o JavaScript dispara `TypeError: calories.replace is not a function`, travando a tela de auditoria do treinador e impedindo a aprovação dos check-ins.
- **Como corrigir:**
  Garantir a conversão segura para string antes de manipular:
  ```tsx
  String(aiAnalysisMap[sub.id]?.estimatedMacros?.calories ?? '').replace(/kcal/i, '').trim()
  ```

---

### [CRIT-12] Crash de Execução por `student_id.slice` com Valor Nulo na Gestão de Alunos
- **Arquivo / Rota:** `src/app/dashboard/students/page.tsx:440`
- **O que acontece:**
  Na renderização do identificador de fallback do aluno:
  ```tsx
  p.student_id.slice(0, 8)
  ```
  Não há checagem de existência do campo `student_id`.  
  **Impacto:** Caso um participante seja retornado com `student_id: null` (ex: matrícula em processamento ou inconsistência transitória de foreign key), a tabela sofre crash com `TypeError: Cannot read properties of null (reading 'slice')`.
- **Como corrigir:**
  Utilizar fallback seguro: `p.student_id ? p.student_id.slice(0, 8) : '---'`.

---

## 4. 🟡 Problemas Moderados (Falta de Loading, Duplo Clique, Inconsistência de Dados e Ausência de Boundaries)

### [MOD-01] `dashboard/loading.tsx` Renderiza SplashScreen Mobile FullScreen no Desktop
- **Arquivo / Rota:** `src/app/dashboard/loading.tsx:1-6`
- **O que acontece:**
  O arquivo de loading global do cockpit do treinador retorna:
  ```tsx
  import { MobileLoadingScreen } from '@/components/ui/mobile-loading-screen';
  export default function DashboardLoading() {
    return <MobileLoadingScreen fullScreen={true} />;
  }
  ```
  `MobileLoadingScreen` com `fullScreen={true}` aplica `fixed inset-0 z-[100] bg-black`.  
  Ao clicar em qualquer menu lateral do dashboard (como Financeiro, Alunos ou Auditoria), o Next.js suspende e projeta uma tela preta cheia com layout mobile sobre o menu lateral e o cabeçalho desktop, destruindo a sensação de software SaaS profissional e piscando a tela toda.
- **Como corrigir:**
  Criar um `DashboardLoadingSkeleton` específico para o painel web que preserve a barra lateral e anime apenas o miolo do `<main>`.

---

### [MOD-02] Ausência de `error.tsx` Dedicados nos Níveis de Rota Principais
- **Arquivo / Rota:** `src/app/dashboard/`, `src/app/app/`, `src/app/admin/`, `src/app/join/`
- **O que acontece:**
  Nenhuma dessas rotas possui arquivo `error.tsx` próprio. Quando ocorre uma falha em uma subpágina (ex: erro de permissão no Supabase ou timeout), o erro borbulha até o `src/app/error.tsx` na raiz do projeto.  
  O `error.tsx` da raiz desmonta o `DashboardLayout` e o `StudentAppLayout`, retirando menu, cabeçalho e contextos de sessão, exibindo um card isolado no meio de uma tela preta com botão que envia o usuário para a Home institucional (`/`).
- **Como corrigir:**
  Criar `error.tsx` dentro de `src/app/dashboard/` e `src/app/app/`, mantendo os layouts intactos e permitindo ao usuário acionar `reset()` na rota interna sem ser jogado para fora do sistema.

---

### [MOD-03] Ausência de `global-error.tsx` na Raiz do App Router
- **Arquivo / Rota:** `src/app/global-error.tsx` (**Arquivo inexistente**)
- **O que acontece:**
  De acordo com as convenções do Next.js App Router, `app/error.tsx` não captura exceções lançadas dentro de `app/layout.tsx` (o RootLayout). Se ocorrer uma falha durante o carregamento de fontes, scripts de marketing ou banners no layout raiz, o Next.js cai na tela de erro crua e genérica do framework ("Application error: a client-side exception has occurred").
- **Como corrigir:**
  Criar `src/app/global-error.tsx` definindo suas próprias tags `<html>` e `<body>` com tela de recuperação personalizada na identidade visual do ArenaFitPro.

---

### [MOD-04] Exceção Não Tratada em Server Component e Metadata na Rota de Ranking Público
- **Arquivo / Rota:** `src/app/r/[code]/page.tsx:13-37, 73-82`
- **O que acontece:**
  Em `generateMetadata` e no Server Component `PublicRankingSharePage`, a função `getPublicShareByCode(code)` é invocada com `await` diretamente, sem bloco `try / catch`. Em caso de instabilidade na conexão com o banco ou snapshot malformado, o servidor lança uma exceção 500 no SSR. Como também não há `src/app/r/error.tsx`, o link público compartilhado no Instagram quebra por completo.
- **Como corrigir:**
  Encapsular a consulta em bloco `try / catch` defensivo retornando metadados de fallback e acionando `notFound()` caso o registro não exista ou a consulta falhe.

---

### [MOD-05] Botões Assíncronos sem Feedback de Desativação e Risco de Duplo Clique
- **Arquivo / Rota:**
  - `src/app/login/page.tsx:455-466, 508, 588, 606, 655, 676, 774`
  - `src/app/dashboard/audit/page.tsx:777-795`
  - `src/app/app/page.tsx:840`
- **O que acontece:**
  Vários botões que executam requisições assíncronas usam `disabled={loading}`, mas **não possuem classes de estilização Tailwind para o estado `:disabled`** (`disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`).  
  O botão permanece com `cursor-pointer` e hover ativo enquanto a requisição está em trânsito. Em `app/page.tsx:840`, o botão *"Validar e Entrar na Turma"* sequer possui a propriedade `disabled` vinculada ao campo vazio.
- **Como corrigir:**
  Adicionar a classe padrão nos botões interativos:
  `className="... disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"`.

---

### [MOD-06] Botão de Reativação de Link Público Sem Desabilitação ou Spinner de Loading
- **Arquivo / Rota:** `src/components/share-ranking/share-ranking-sheet.tsx:1180-1187`
- **O que acontece:**
  O botão *"Reativar link público"* executa `createOrRefreshShareLink(true)`. Enquanto o botão de revogar tem controle `disabled={revokingLink}`, o botão de reativar não possui propriedade `disabled` nem spinner.  
  O treinador pode clicar várias vezes consecutivas gerando chamadas concorrentes à API e possíveis conflitos no token de compartilhamento.
- **Como corrigir:**
  Adicionar estado `isReactivating` com `disabled={isReactivating}` e ícone `Loader2` com `animate-spin`.

---

### [MOD-07] Botões "Ler Todas as Notificações" e "Sair da Conta" Sem Proteção Contra Concorrência
- **Arquivo / Rota:**
  - `src/components/student/notifications-drawer.tsx:172-177`
  - `src/components/dashboard/header.tsx:377-383`
  - `src/components/dashboard/sidebar.tsx:268-275`
- **O que acontece:**
  Em `notifications-drawer.tsx`, o botão *"Ler todas"* executa update assíncrono no Supabase mas permanece clicável. No Header e Sidebar, o botão *"Sair da Conta"* executa `supabase.auth.signOut()` sem desabilitar o botão. Em conexões lentas, cliques múltiplos geram erros 400 de sessão já terminada no console.
- **Como corrigir:**
  Adicionar estados `isMarkingAll` e `isLoggingOut`, aplicando desabilitação visual e bloqueio de cliques.

---

### [MOD-08] Mutação Otimista no Feed Social Sem Mecanismo de Rollback em Falha de Rede
- **Arquivo / Rota:** `src/app/dashboard/feed/page.tsx:232-281`
- **O que acontece:**
  Ao curtir ou reagir a uma publicação, o estado local `posts` é modificado de imediato de forma otimista. No bloco `try/catch`, se a operação no Supabase falhar, o código apenas emite `console.warn` e não restaura o array de reações anterior.
- **Como corrigir:**
  Salvar uma cópia do estado anterior (`previousPosts`) antes do `setPosts` e restaurá-la caso ocorra erro ou caso o Supabase retorne `{ error }`.

---

### [MOD-09] Botão Fictício "Compartilhar nos Stories" no Cofre de Transformação
- **Arquivo / Rota:** `src/components/student/transformation-vault-modal.tsx:255-263`
- **O que acontece:**
  O modal exibe um botão de destaque *"Compartilhar nos Stories"* com ícone `Share2`. Ao ser clicado, a função apenas executa `showStatus('Story pronto para exportação!')` sem gerar imagem, sem abrir canvas nem invocar o modal de stories real (`StoryShareModal`).
- **Como corrigir:**
  Integrar o clique ao fluxo do gerador de stories ou ocultar o botão até que a rotina esteja finalizada.

---

### [MOD-10] Risco de Hydration Mismatch em Inputs de Data Baseados em UTC
- **Arquivo / Rota:** `src/app/dashboard/challenges/new/page.tsx:115-128`, `src/app/admin/page.tsx:83`
- **O que acontece:**
  O estado inicial da data é definido com `new Date().toISOString().split('T')[0]`. No Brasil (UTC-3), entre 21h00 e 23h59 o horário local é dia D, mas em UTC já é dia D+1. Se o servidor SSR pré-renderizar a página em ambiente UTC (servidores Vercel nos EUA) e o navegador cliente hidratar no fuso local, o valor inicial do input diverge na montagem.
- **Como corrigir:**
  Formatar a data inicial respeitando o fuso horário local ou calcular o offset dentro de um `useEffect` no cliente.

---

### [MOD-11] Overflow Horizontal e Quebra de Layout em Tabelas Mobile (375px)
- **Arquivo / Rota:**
  - `src/app/dashboard/students/page.tsx:410`
  - `src/app/dashboard/finance/page.tsx:926`
  - `src/app/page.tsx:1094`
- **O que acontece:**
  Em visualizações móveis compactas (viewport de 375px de largura):
  - A tabela de alunos e a tabela de extrato financeiro não possuem container encapsulado com `overflow-x-auto` e largura mínima controlada, fazendo a tabela empurrar as margens laterais da tela inteira.
  - A tabela comparativa da Landing Page corta a margem direita da última coluna em 375px.
- **Como corrigir:**
  Envolver as tabelas em contêineres `<div className="w-full overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">` com `min-w-[640px]` na tag `<table>`.

---

### [MOD-12] Conflito de Safe Area e Z-Index no Toast Flutuante vs Barra Inferior do Aluno
- **Arquivo / Rota:** `src/app/app/page.tsx:1402`, `src/components/student/bottom-nav.tsx:32`
- **O que acontece:**
  A barra de navegação inferior flutuante do aluno está configurada com `z-[60]`. O toast de notificação da página está posicionado em `fixed bottom-20 left-1/2 -translate-x-1/2 z-50`.  
  Em dispositivos menores (iPhone SE, 375x667), o toast é renderizado atrás ou imediatamente sobreposto pela barra de navegação inferior.
- **Como corrigir:**
  Elevar o z-index do toast para `z-[70]` e ajustar o distanciamento para `bottom-24` ou utilizar um contexto de toast unificado no topo da viewport.

---

### [MOD-13] Anti-Padrão de Aninhamento Proibido `<Link><button>`
- **Arquivo / Rota:** `src/app/app/page.tsx:804, 869, 1029, 1035, 1101`
- **O que acontece:**
  O código faz aninhamento direto de tags interativas: `<Link href="..."> <button className="...">...</button> </Link>`.  
  A especificação HTML5 e as diretrizes do Next.js proíbem elementos interativos aninhados (`<a><button>`), gerando warnings no console de hidratação e desorientando leitores de tela de acessibilidade.
- **Como corrigir:**
  Remover a tag `<button>` interna e aplicar as classes de estilização diretamente no componente `<Link>`.

---

### [MOD-14] Flicker de Mensagem de "Vazio" Durante Busca Ativa em Comunicados, Materiais e Ranking
- **Arquivo / Rota:**
  - `src/app/dashboard/announcements/page.tsx:350-354`
  - `src/app/dashboard/materials/page.tsx:351-356`
  - `src/app/dashboard/leaderboard/page.tsx:607-613`
- **O que acontece:**
  Em todas essas telas, o estado `loading` não é considerado na condição de exibição da lista vazia:
  `{announcements.length === 0 ? <EmptyState /> : <List />}`.  
  Como a lista inicia como `[]`, a mensagem *"Nenhum comunicado publicado ainda"* ou *"Nenhum aluno pontuou nesta turma ainda"* é exibida imediatamente durante o primeiro meio segundo de requisição, sumindo abruptamente quando os dados chegam.
- **Como corrigir:**
  Alterar a expressão para: `{loading ? <SkeletonList /> : items.length === 0 ? <EmptyState /> : <List />}`.

---

### [MOD-15] Falha Silenciosa e Formulário Vazio em Edição de Desafio Inexistente
- **Arquivo / Rota:** `src/app/dashboard/challenges/[challengeId]/edit/page.tsx:66-68, 172-270`
- **O que acontece:**
  Se o treinador acessar a URL de edição com um ID inexistente ou sem permissão, a consulta falha e entra no `catch`. O estado `loading` vira `false`, mas o JSX ignora o erro e renderiza o formulário de edição completamente em branco com preço R$ 0. Se o treinador salvar, a ação falha silenciosamente.
- **Como corrigir:**
  Se houver erro ou `!challenge`, exibir um card explícito de "Desafio Não Encontrado" com botão de retorno para `/dashboard/challenges` ou acionar a função `notFound()` do Next.js.

---

### [MOD-16] Falha Silenciosa e Risco de Erro de Chave Estrangeira na Câmera com `missionId` Inválido
- **Arquivo / Rota:** `src/app/app/camera/[missionId]/page.tsx:69-92, 411`
- **O que acontece:**
  Se a tela de câmera do aluno for aberta com um ID de missão inválido ou deletado, a busca por `.single()` falha e `data` é nulo. A interface monta com o título genérico *"Check-in de Missão"*. Quando o aluno tira a foto e confirma o envio, a inserção em `student_submissions` tenta vincular a chave estrangeira inexistente, disparando erro de foreign key do PostgreSQL.
- **Como corrigir:**
  Validar a existência da missão no carregamento inicial; se não existir, emitir aviso e redirecionar imediatamente para `/app`.

---

### [MOD-17] Floating Promises com `async` em `forEach` no Leaderboard do Aluno
- **Arquivo / Rota:** `src/app/app/leaderboard/page.tsx:234-250`
- **O que acontece:**
  O componente executa uma função assíncrona dentro de `forEach`:
  ```ts
  safeStandings.slice(0, 50).forEach(async (s: any, idx: number) => {
    try {
      await supabase.from('leaderboard_history').upsert(...);
    } catch { ... }
  });
  ```
  `Array.prototype.forEach` não aguarda promises retornadas. Isso cria até 50 promises flutuantes concorrentes sem controle de término, podendo mascarar erros de conexão.
- **Como corrigir:**
  Substituir por `Promise.allSettled(safeStandings.slice(0, 50).map(...))` ou delegar o snapshot histórico para uma rotina de backend (RPC ou Edge Function).

---

### [MOD-18] Erro de Rede Mascarado Silenciosamente como Feed Vazio no App do Aluno
- **Arquivo / Rota:** `src/app/app/feed/page.tsx:210-214, 679`
- **O que acontece:**
  Na função `fetchFeed()`:
  ```ts
  } catch (err) {
    console.error('Erro ao carregar feed social:', err);
  } finally {
    setLoading(false);
  }
  ```
  Em caso de falha de conexão ou timeout do Supabase, o erro é silenciado no console e `posts` permanece `[]`. O aluno vê a mensagem: *"Nenhum check-in publicado ainda. Seja o primeiro a compartilhar seu treino!"*, acreditando que ninguém postou nada, sem qualquer opção para tentar recarregar.
- **Como corrigir:**
  Armazenar o erro em um estado `error` e renderizar card com botão *"Tentar Novamente"*.

---

### [MOD-19] Gargalo de Escala e Falha Silenciosa com `.limit(50)` na Validação de Códigos de Turma
- **Arquivo / Rota:** `src/app/api/challenges/validate-code/route.ts:78-89`
- **O que acontece:**
  Quando o aluno valida um código de turma por prefixo de UUID:
  ```ts
  const { data: allActive } = await supabaseAdmin.from('challenges').select(baseSelect).limit(50);
  const matched = (allActive || []).find((c: any) =>
    c.id.replace(/-/g, '').toLowerCase().startsWith(cleanHex.toLowerCase())
  );
  ```
  A query busca apenas os primeiros 50 desafios no banco e tenta encontrar correspondência em memória no Node.js. Se o sistema ultrapassar 50 turmas ativas, qualquer código pertencente à 51ª turma em diante falhará com *"Código não encontrado"*.
- **Como corrigir:**
  Executar o filtro diretamente no banco PostgreSQL com cast para texto ou implementar coluna dedicada para código de convite curto indexado.

---

### [MOD-20] Operações de Armazenamento Local sem Tratamento para Navegação Privada no Safari iOS
- **Arquivo / Rota:**
  - `src/app/dashboard/page.tsx:33-42`
  - `src/app/dashboard/leaderboard/page.tsx:77-80`
  - `src/app/app/page.tsx:477-494`
- **O que acontece:**
  Operações diretas de `sessionStorage.setItem` e `localStorage.setItem` sem bloco `try / catch`.  
  No modo de Navegação Privada do Safari no iOS ou em WebViews com políticas restritas de cookies, operações de escrita em `Storage` lançam `QuotaExceededError` ou `SecurityError`, interrompendo o ciclo de execução do componente.
- **Como corrigir:**
  Encapsular todas as chamadas a `Storage` em funções utilitárias seguras com bloco `try/catch`.

---

## 5. 🔵 Polimento / UX (Textos Inconsistentes PT/EN, Feedback Visual e Refinamento)

### [POL-01] Layout Shift (CLS) Severo por Substituição de Áreas por Spinners ou Textos Puros
- **Arquivos Afetados:**
  - `src/app/app/feed/page.tsx:674-678` (Spinner centralizado de 20px)
  - `src/app/app/leaderboard/page.tsx:698-704` (Spinner simples empurrando o pódio)
  - `src/app/app/missions/page.tsx:1131-1135` (Colapso total da lista ao trocar de semana)
  - `src/app/dashboard/challenges/page.tsx:474` (Apenas texto "Carregando turmas...")
  - `src/app/dashboard/students/page.tsx:400` (Spinner circular isolado)
  - `src/app/dashboard/audit/page.tsx:550` (Apenas texto "SINCRONIZANDO...")
- **O que acontece:**
  Toda a área de cartões ou tabelas é substituída por um spinner pequeno ou linha de texto puro. Quando os dados chegam, elementos visuais de grande porte (pódios metálicos, tabelas de 5 colunas) são inseridos instantaneamente, fazendo a página saltar bruscamente.
- **Como corrigir:**
  Criar componentes de Skeleton correspondentes à geometria real de cada tela (ex: `ChallengeCardSkeleton`, `LeaderboardPodiumSkeleton`, `StudentRowSkeleton`).

---

### [POL-02] Termos em Inglês Misturados com Português em Menus e Telas do Aluno e Coach
- **Arquivos Afetados:**
  - `src/components/dashboard/sidebar.tsx:13-68`
  - `src/app/dashboard/audit/page.tsx:148, 777-795`
  - `src/app/dashboard/finance/page.tsx:85-98, 926`
  - `src/app/dashboard/missions/page.tsx:120-135`
  - `src/app/app/camera/[missionId]/page.tsx:408-410`
- **O que acontece:**
  - No menu do treinador: mistura termos como *"Leaderboard"*, *"Cockpit do Fundador"*, *"Feed Social"*, *"Asaas Engine v3"*.
  - Na auditoria: status internos do banco aparecem em inglês (`'approved'`, `'rejected'`, `'pending'`) ao lado de botões em português *"INVALIDAR"* e *"APROVAR"*.
  - No financeiro: colunas exibem status do Asaas em inglês puro (`"RECEIVED"`, `"CONFIRMED"`, `"OVERDUE"`).
  - Na câmera do aluno: o topo exibe rótulo técnico *"OPTICAL_SENSOR_HUD"*.
- **Como corrigir:**
  Criar mapa de tradução unificado para português:
  - `"Leaderboard"` -> *"Ranking Oficial"*
  - `"RECEIVED"` -> *"Recebido"*, `"CONFIRMED"` -> *"Confirmado"*, `"OVERDUE"` -> *"Vencido"*
  - `"OPTICAL_SENSOR_HUD"` -> *"Câmera de Validação"*

---

### [POL-03] Uso de `alert()` e `confirm()` Nativos no Terminal Mestre do Dashboard
- **Arquivo / Rota:** `src/app/dashboard/master/page.tsx:103, 110`
- **O que acontece:**
  O arquivo utiliza funções síncronas bloqueantes do navegador: `alert(e.message)` e `confirm('Deseja excluir este registro de gasto?')`.  
  Esses diálogos bloqueiam o thread principal, destoam do design system escuro e podem ser silenciados pelo navegador do usuário.
- **Como corrigir:**
  Substituir pelo componente `CustomDialog` já consolidado em `src/app/admin/page.tsx`.

---

### [POL-04] Rota Duplicada e Desprotegida no Cockpit: `/dashboard/master` vs `/admin`
- **Arquivo / Rota:** `src/app/dashboard/master/page.tsx`
- **O que acontece:**
  O painel oficial do Super Admin foi migrado para `/admin`. O arquivo `src/app/dashboard/master/page.tsx` permanece no projeto como código legado. O middleware (`src/proxy.ts:119`) protege `/admin`, mas não bloqueia `/dashboard/master`, permitindo que treinadores comuns acessem uma casca vazia do terminal mestre.
- **Como corrigir:**
  Excluir `dashboard/master/page.tsx` ou redirecionar permanentemente a rota para `/admin`.

---

### [POL-05] Fallback de Suspense de Texto Puro no Painel Admin Mestre
- **Arquivo / Rota:** `src/app/admin/page.tsx:1503`
- **O que acontece:**
  O container principal do terminal mestre é envolvido por:
  ```tsx
  <Suspense fallback={<div className="text-xs text-zinc-500 font-mono p-8">Carregando Terminal Mestre...</div>}>
    <MasterDashboardContent />
  </Suspense>
  ```
  Ao alternar entre abas com query parameters (`/admin?tab=financial`), uma linha de texto cinza aparece e desaparece.
- **Como corrigir:**
  Substituir por um layout de Skeleton com abas e cartões estilizados.

---

### [POL-06] Acesso Não-Reativo a Query Strings via `window.location.search`
- **Arquivo / Rota:** `src/app/app/leaderboard/page.tsx:73-75`
- **O que acontece:**
  Para identificar filtros vindos de deep links:
  ```ts
  const requestedChallengeId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('challenge')
    : null;
  ```
  A leitura direta de `window.location.search` não reage a alterações de parâmetros via `router.push()` com transições do Next.js.
- **Como corrigir:**
  Utilizar o hook padrão `useSearchParams()` do `next/navigation` encapsulado em boundary de `<Suspense>`.

---

### [POL-07] Ausência de Atributos ARIA, Tecla Escape e Focus Trap no `CustomDialog`
- **Arquivo / Rota:** `src/components/ui/custom-dialog.tsx:45-72`
- **O que acontece:**
  O modal é renderizado em uma `div` sem `role="dialog"`, sem `aria-modal="true"` e sem listener de evento para a tecla `Escape`. O clique no backdrop externo também não fecha o diálogo.
- **Como corrigir:**
  Adicionar os atributos semânticos de acessibilidade e listener de teclado para tecla `Escape` em um `useEffect`.

---

### [POL-08] Uso de Índice Numérico de Array como `key` em Listas de Componentes
- **Arquivo / Rota:** `src/components/ui/social-proof-testimonials.tsx:95`
- **O que acontece:**
  O loop renderiza cartões usando `key={index}`.
- **Como corrigir:**
  Utilizar chaves únicas e estáveis, como `key={item.badge}` ou `key={item.title}`.

---

### [POL-09] Ausência de Estado Vazio Ilustrado em `AchievementsGrid`
- **Arquivo / Rota:** `src/components/student/achievements-grid.tsx:40-95`
- **O que acontece:**
  Quando a categoria selecionada não contém medalhas ou a lista é vazia, o container renderiza um espaço em branco sem feedback visual.
- **Como corrigir:**
  Renderizar um card de empty state com ícone de troféu e mensagem de incentivo: *"Nenhuma medalha nesta categoria ainda. Continue treinando para desbloquear!"*.

---

### [POL-10] Pódios com Degraus "VAGO" sem Micro-Copy ou Botão de Compartilhar
- **Arquivo / Rota:** `src/app/dashboard/leaderboard/page.tsx:452, 537`, `src/app/app/leaderboard/page.tsx:590-594`
- **O que acontece:**
  Quando a turma possui apenas 1 atleta, o 2º e 3º degraus do pódio exibem caixas cinzas opacas com a palavra *"VAGO"*, sem micro-copy explicativa nem atalho para convidar novos participantes.
- **Como corrigir:**
  Adicionar botão rápido no degrau vago: *"Convidar Atletas"* com cópia do link de matrícula.

---

### [POL-11] Semana do Desafio sem Missões sem Ação Rápida de Adicionar Missão
- **Arquivo / Rota:** `src/app/dashboard/challenges/[challengeId]/edit/page.tsx:395`
- **O que acontece:**
  Quando uma semana do desafio não possui missões, é exibido apenas um texto sutil *"Nenhuma missão cadastrada para esta semana"*, obrigando o treinador a rolar até o formulário do topo.
- **Como corrigir:**
  Adicionar botão CTA inline `+ Adicionar Missão nesta Semana` diretamente dentro do bloco vazio.

---

### [POL-12] Gestão de Squads Permite Envio de Formulário Mesmo Sem Desafios Cadastrados
- **Arquivo / Rota:** `src/app/dashboard/squads/page.tsx:251-263`
- **O que acontece:**
  Se o treinador não tiver desafios criados, o sistema exibe um aviso orientando a criar um desafio, mas mantém os campos de criação de squad renderizados e ativos abaixo, permitindo tentar criar um squad órfão.
- **Como corrigir:**
  Ocultar ou desabilitar o formulário de criação de squads enquanto não houver turmas ativas cadastradas.

---

### [POL-13] Inconsistência de Tokens de Cor no `CookieConsentBanner`
- **Arquivo / Rota:** `src/components/legal/cookie-consent-banner.tsx:177, 180, 198`
- **O que acontece:**
  O banner de cookies utiliza classes como `peer-checked:bg-white`, `peer-checked:after:bg-black` e `text-zinc-400`, destoando do padrão de cores do restante da aplicação que adota o azul primário `#3478F6` e `#FAFAFA` / `#A1A1AA`.
- **Como corrigir:**
  Padronizar as cores dos switches com os tokens globais do design system escuro da plataforma.

---

## 6. Recomendações de Arquitetura e Próximos Passos

Para elevar a estabilidade e a maturidade da base de código do ArenaFitPro, sugerimos um plano de ação estruturado em três fases:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ROADMAP DE RESOLUÇÃO SUGERIDO                                         │
├────────────────────────────────┬───────────────────────────────────────┤
│ 🚀 Fase 1: Estabilidade Crítica │ • Corrigir Hydration no app do aluno  │
│    (Zero Quebras & Dados Reais) │ • Implementar Skeletons no Cockpit    │
│                                │ • Blindar funções contra TypeErrors   │
│                                │ • Resolver EROFS serverless em leads  │
├────────────────────────────────┼───────────────────────────────────────┤
│ 🛡️ Fase 2: Resiliência Global   │ • Criar error.tsx, global-error.tsx   │
│    (Boundaries & Concorrência) │ • Adicionar estados disabled com CSS  │
│                                │ • Corrigir overflow-x em tabelas      │
│                                │ • Implementar rollback otimista       │
├────────────────────────────────┼───────────────────────────────────────┤
│ ✨ Fase 3: Polimento & UX       │ • Padronizar idioma para português    │
│    (Refinamento Visual & A11y) │ • Aprimorar empty states dos pódios   │
│                                │ • Acessibilidade em diálogos (ESC)    │
│                                │ • Limpeza da rota legada /master      │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 7. Fechamento

A plataforma **ArenaFitPro** possui regras de negócio completas e uma proposta de valor sólida. As correções mapeadas neste relatório transformarão a experiência de uso, eliminando qualquer sensação de instabilidade ou lentidão perceptível para treinadores e atletas.

**Quais itens deseja corrigir primeiro?**
