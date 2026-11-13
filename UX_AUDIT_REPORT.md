# Relatório de Auditoria de UX/UI — ArenaFitPro
**Data:** 13 de Novembro de 2026  
**Framework:** Next.js 16 (App Router) • React 19 • Tailwind CSS v4 • Supabase SSR  
**Metodologia:** Auditoria Técnica Exaustiva das 20 Leis de UX (Workflow `/ux-audit`)  
**Modo:** Somente Leitura (Read-Only)

---

## 1. Mapeamento da Aplicação

### 1.1 Rotas do Projeto (`src/app/`)
A arquitetura de rotas do ArenaFitPro está dividida em 5 domínios operacionais e de acesso:

| Domínio de Rota | Caminho | Descrição e Finalidade |
|---|---|---|
| **Público Institucional** | `/` (`src/app/page.tsx`) | Landing page de alta conversão para personal trainers e atletas com tabelas comparativas, depoimentos 3D e demonstração interativa. |
| **Institucional & Legal** | `/ajuda`, `/termos`, `/privacidade`, `/lgpd` | Central de ajuda ao usuário, bases contratuais e termos de privacidade LGPD com formulário de requisição de dados. |
| **Autenticação & Onboarding** | `/login` (`src/app/login/page.tsx`) | Portal unificado de login com segmentação dinâmica de abas: Aluno (Inscrição via código/link da turma ou Login recorrente) e Treinador (Google OAuth ou E-mail/Senha). |
| **Área do Aluno (PWA Mobile)** | `/app` (`src/app/app/page.tsx`) | Cockpit diário do atleta: tarefas do dia, status de ofensiva (streak), banners de risco das 20h, pódio de pontos e categorias de missão. |
| | `/app/camera/[missionId]` | Câmera fotográfica antifraude em tempo real com sensor óptico e validação por IA. |
| | `/app/missions` | Cronograma semanal de missões, filtros por categoria (treino, cardio, refeição, hábito) e status de desbloqueio. |
| | `/app/feed` | Feed social da turma com fotos de check-in, curtidas e comentários de incentivo. |
| | `/app/leaderboard` | Classificação geral da turma em tempo real, pódio metálico e histórico de pontuação. |
| | `/app/profile` | Perfil do atleta, estatísticas vitais, cofre de fotos de transformação e insígnias conquistadas. |
| | `/app/materials` | Biblioteca de arquivos e comunicados oficiais fixados pelo treinador. |
| **Cockpit do Treinador** | `/dashboard` (`src/app/dashboard/page.tsx`) | Visão geral executiva com métricas de turmas ativas, alunos matriculados, fila de revisão pendente e faturamento. |
| | `/dashboard/challenges` | Gestão de turmas/desafios, listagem com status e links de convite direto. |
| | `/dashboard/challenges/new` | Wizard de criação de novas turmas com presets rápidos, regras de pontuação e precificação. |
| | `/dashboard/challenges/[challengeId]/edit` | Edição completa dos parâmetros e cronograma de semanas da turma. |
| | `/dashboard/audit` | Mesa de auditoria antifraude com análise visual de fotos, macronutrientes estimados por IA e botões de validação. |
| | `/dashboard/students` | Listagem e gestão de alunos matriculados, status de pagamento e exportação. |
| | `/dashboard/leaderboard` | Classificação da turma com pódio e ferramenta de geração de card para Instagram Stories. |
| | `/dashboard/finance` | Central financeira com integração Asaas: saldo disponível Pix D+0, extrato de transações, gestão de repasses e upgrade de plano. |
| | `/dashboard/feed` | Moderação do feed social da turma pelo treinador com reações e comentários. |
| | `/dashboard/announcements` | Publicação de comunicados rápidos e avisos urgentes para os alunos. |
| | `/dashboard/materials` | Upload e compartilhamento de materiais de apoio (PDFs, vídeos, treinos). |
| | `/dashboard/squads` | Organização de alunos em equipes e pelotões internos para disputas coletivas. |
| | `/dashboard/profile` | Configurações do perfil profissional, biografia, chave Pix e dados cadastrais. |
| **Checkout & Matrícula** | `/join/[challengeId]` | Checkout público da turma com validação de vaga, cálculo de split e pagamento Pix em tempo real. |
| **Terminal Mestre (Admin)** | `/admin` (`src/app/admin/page.tsx`) | Painel do fundador para acompanhamento de ARR/MRR, split da plataforma, ativação de planos de treinadores e métricas de leads. |
| **Compartilhamento Público** | `/r/[code]` (`src/app/r/[code]/page.tsx`) | Página pública com Server-Side Rendering (SSR) e OpenGraph dinâmico para visualização de rankings compartilhados. |
| **APIs e Webhooks** | `/api/*` | Endpoints de IA (`/api/ai/analyze-submission`), Webhooks Asaas (`/api/webhooks/asaas`), Pagamento Pix (`/api/checkout/pix`), Leads (`/api/leads`), Saque (`/api/finance/withdraw`), etc. |

---

### 1.2 Componentes Principais (`src/components/`)
A arquitetura de componentes é modularizada e distribuída por responsabilidade:

- **`src/components/ui/`**: Primitivas visuais e utilitários de interface (`custom-dialog.tsx`, `mobile-loading-screen.tsx`, `sticky-mobile-cta.tsx`, `social-proof-testimonials.tsx`, `monochrome-3d-background.tsx`, `button.tsx`, `badge.tsx`, etc.).
- **`src/components/dashboard/`**: Componentes do painel do treinador (`sidebar.tsx`, `header.tsx`, etc.).
- **`src/components/student/`**: Componentes da experiência do atleta (`bottom-nav.tsx`, `achievements-grid.tsx`, `notifications-drawer.tsx`, `transformation-vault-modal.tsx`, `workout-active-session-hud.tsx`, `push-notification-banner.tsx`, etc.).
- **`src/components/share-ranking/`**: Motor de exportação de Stories (`ranking-share-card.tsx`, `share-ranking-sheet.tsx`).
- **`src/components/legal/`**: Componentes de conformidade jurídica (`cookie-consent-banner.tsx`, `privacy-consent-modal.tsx`).

---

### 1.3 Layouts e Hierarquia de Envelopamento
- **RootLayout (`src/app/layout.tsx`)**: Define metadados globais, viewport móvel com `maximumScale: 1`, tema dark nativo, injeção de fontes (`Plus_Jakarta_Sans` e monospace), banner de cookies LGPD e scripts de marketing.
- **StudentAppLayout (`src/app/app/layout.tsx`)**: Envelopa o app do aluno em uma casca PWA mobile-first (`max-w-md mx-auto`), provê o contexto `WorkoutSessionProvider` para cronometragem contínua de treinos em segundo plano e renderiza a `BottomNav`.
- **DashboardLayout (`src/app/dashboard/layout.tsx`)**: Fornece a estrutura de painel desktop com `Sidebar` retrátil, cabeçalho global com switcher de turmas, notificações e menu de usuário.
- **AdminLayout (`src/app/admin/layout.tsx`)**: Estrutura dedicada ao terminal master com navegação por abas executivas.

---

### 1.4 Tokens de Estilo e Design System (`src/app/globals.css`)
O projeto adota Tailwind CSS v4 com sistema de design escuro monocromático de alta fidelidade:
- **Superfícies**: Fundo absoluto `#000000`, cartões de primeiro nível `#0E0E10`, cartões elevados `#18181B`.
- **Bordas**: `#27272A` (cinza titânio chanfrado de 1px) e `rgba(255,255,255,0.08)`.
- **Tipografia**: Primária clara `#FAFAFA`, texto secundário/silenciado `#A1A1AA`, elementos de contraste `#D4D4D8`.
- **Cor de Ação / Destaque**: Azul elétrico `#3478F6` com hover `#75A7FF` (reservado exclusivamente para botões de conversão e elementos com foco visual ativo).
- **Vidro 3D Monocromático**: Classes utilitárias `.mono-glass-card`, `.mono-button-primary`, `.mono-button-secondary`, `.arena-input`.
- **Ergonomia Mobile**: Piso de legibilidade tipográfica (`[class*="text-[8px]"]` forçado para 11px mínimo) e classes de suporte a Safe Area do iOS (`.pb-safe`, `.pt-safe`, `.safe-bottom-nav`, `.safe-bottom-hud`).

---

### 1.5 Limites de Carregamento e Erro (Boundaries)
- **`loading.tsx`**: Presente na raiz (`src/app/loading.tsx`), no cockpit do treinador (`src/app/dashboard/loading.tsx` com Skeletons estruturados de cards) e no app do aluno (`src/app/app/loading.tsx` com splash screen mobile).
- **`error.tsx`**: Presente na raiz (`src/app/error.tsx`), no painel do treinador (`src/app/dashboard/error.tsx`), no app do aluno (`src/app/app/error.tsx`), no checkout (`src/app/join/error.tsx`) e no terminal admin (`src/app/admin/error.tsx`).
- **`global-error.tsx`**: Implementado na raiz (`src/app/global-error.tsx`) com tags `<html>` e `<body>` próprias para captura de falhas catastróficas em layouts superiores.
- **`not-found.tsx`**: Implementado na raiz (`src/app/not-found.tsx`) com interface escura integrada e botão de retorno seguro.

---

### 1.6 Fluxos Principais da Aplicação

1. **Jornada do Treinador (Personal Trainer)**:
   - Login/Cadastro em `/login` com seleção de perfil profissional.
   - Acesso ao Cockpit em `/dashboard` e criação da primeira turma em `/dashboard/challenges/new`.
   - Customização das semanas de missões em `/dashboard/challenges/[id]/edit` e `/dashboard/missions`.
   - Divulgação do link de convite da turma (`/join/[challengeId]`).
   - Auditoria diária de check-ins fotográficos dos alunos com IA em `/dashboard/audit`.
   - Gestão de extrato e saques Pix D+0 na Central Financeira em `/dashboard/finance`.

2. **Jornada do Aluno (Atleta)**:
   - Abertura do link de convite ou inserção de código alfanumérico em `/login`.
   - Matrícula rápida (gratuita ou com pagamento Pix gerado pelo Asaas em `/join/[challengeId]`).
   - Entrada no Cockpit diário em `/app`: visualização da "Próxima Ação" de treino/dieta.
   - Início do cronômetro de treino (`WorkoutSessionProvider` + `WorkoutActiveSessionHud`).
   - Envio de foto ao vivo na Câmera Antifraude (`/app/camera/[missionId]`) com estimativa de macros por IA.
   - Acúmulo de pontos XP, proteção do Streak diário e consulta ao ranking em `/app/leaderboard`.
   - Compartilhamento de Stories de alta resolução para o Instagram em `/app/profile`.

---

## 2. Avaliação Exaustiva das 20 Leis de UX

Abaixo segue a análise detalhada e individual de cada uma das 20 leis estabelecidas em `.agents/rules/ux-laws.md` e `.agents/workflows/ux-audit.md`:

---

### 1. Lei de Hick
> *O tempo para tomar uma decisão aumenta com o número e a complexidade das escolhas. Reduza opções por tela, agrupe e oculte ações secundárias.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/components/dashboard/sidebar.tsx:13-68` e `src/app/dashboard/challenges/new/page.tsx:250-400`
- **Problema:** A barra lateral do painel do treinador expõe 14 itens de navegação planos no mesmo nível de hierarquia visual sem nenhum agrupamento temático ("Visão Geral", "Turmas", "Missões", "Alunos", "Revisão de Fotos", "Ranking", "Central Financeira", "Feed Social", "Avisos", "Materiais", "Squads", "Patrocinadores", "Mystery Box", "Configurações"). Um treinador novato enfrenta sobrecarga de decisão ao entrar no cockpit pela primeira vez. No wizard de desafios, dezenas de campos de configuração concorrem sem pré-seleção orientada.
- **Correção Recomendada:** Agrupar a navegação da sidebar em 3 categorias retráteis claras: **Operação Diária** (Visão Geral, Turmas, Auditoria de Fotos, Alunos), **Engajamento & Comunidade** (Ranking, Feed, Avisos, Materiais, Squads) e **Gestão & Negócios** (Financeiro, Patrocinadores, Configurações). Ocultar itens pouco frequentes em um menu colapsável "Mais Recursos".
- **Prioridade:** MÉDIA

---

### 2. Lei de Fitts (Tamanho do Alvo)
> *O tempo para alcançar um alvo é função da distância e do tamanho do alvo. Alvos clicáveis devem ter pelo menos 44x44px (`min-h-11 min-w-11`).*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/components/share-ranking/share-ranking-sheet.tsx:1180-1187`, `src/components/student/notifications-drawer.tsx:172-177`, `src/app/dashboard/announcements/page.tsx:280-290`
- **Problema:** Enquanto os botões primários e inputs possuem altura mínima adequada (`min-h-[44px]` ou `h-11`), vários botões de ação secundária e controles inline apresentam áreas clicáveis minúsculas (inferiores a 28x20px). O botão "Reativar link público" (`share-ranking-sheet.tsx:1180`), o botão "Ler todas" (`notifications-drawer.tsx:172`) e os botões de exclusão de avisos não atingem a área física de toque de 44x44px exigida pelas diretrizes WCAG 2.2 AA. Em dispositivos móveis, atletas com dedos suados ou em movimento erram o toque com frequência.
- **Correção Recomendada:** Aplicar `min-h-[44px] min-w-[44px]` com flexbox centralizado em todos os botões interativos ou adicionar padding invisível com pseudoclasse Tailwind (`before:absolute before:-inset-2.5`).
- **Prioridade:** ALTA

---

### 3. Lei de Jakob
> *Os usuários passam a maior parte do tempo em outros sites. Eles preferem que seu site funcione da mesma forma que todos os outros que já conhecem.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/components/dashboard/sidebar.tsx:13-68`, `src/app/dashboard/audit/page.tsx:148, 777-795`, `src/app/dashboard/finance/page.tsx:85-98, 926`, `src/components/ui/custom-dialog.tsx:45-72`
- **Problema:** 
  1. **Inconsistência de Idioma e Termos Técnicos:** A interface mistura constantemente inglês técnico e jargões de banco de dados com português: `"Leaderboard"`, `"PIX D+0"`, `"Asaas Engine v3"`, `"Stories 9:16 White-Label"`, `"OPTICAL_SENSOR_HUD"`, status de auditoria internos vazados (`'approved'`, `'rejected'`, `'pending'`), e status financeiros brutos (`"RECEIVED"`, `"CONFIRMED"`, `"OVERDUE"`). O usuário brasileiro padrão estranha e perde a sensação de aplicativo nacional nativo.
  2. **Quebra de Padrão em Diálogos/Modais:** O componente `CustomDialog` não fecha com a tecla `Escape` nem ao clicar fora (no backdrop escuro), frustrando o hábito instintivo de navegação em qualquer plataforma web moderna.
- **Correção Recomendada:** Traduzir todos os rótulos e status para português brasileiro polido ("Classificação / Ranking", "Pendente", "Confirmado", "Recebido", "Atrasado", "Cronômetro", "Foto Antifraude"); adicionar listener para tecla `Escape` e clique no backdrop em `CustomDialog`.
- **Prioridade:** ALTA

---

### 4. Lei da Proximidade
> *Objetos próximos uns dos outros tendem a ser agrupados perceptivamente. O que é relacionado fica junto; o que não é, separado por espaçamento generoso.*

- **Status:** ✅ Atende
- **Evidência:** `src/app/app/page.tsx:1020-1085`, `src/app/globals.css:70-85`, `src/components/student/bottom-nav.tsx:50-120`
- **Problema:** Nenhum problema crítico detectado.
- **Correção Recomendada:** Manter a consistência observada. Os cards de "Próxima Ação" agrupam título, badge de XP, instruções contextuais e botão de ação dentro do mesmo contêiner `p-5 sm:p-6 space-y-3.5`, claramente isolados das métricas globais e de avisos fixados por espaçamentos verticais de `space-y-6`.
- **Prioridade:** BAIXA

---

### 5. Lei de Miller
> *A pessoa média só consegue manter 7 (mais ou menos 2) itens na memória de trabalho. Divida formulários e listas longas em blocos ou etapas.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/dashboard/challenges/new/page.tsx:150-480` e `src/app/dashboard/finance/page.tsx:70-85`
- **Problema:** O formulário de criação de nova turma (`/dashboard/challenges/new`) é uma página contínua e excessivamente longa com mais de 15 campos empilhados verticalmente (título, tipo, data início, data término, horário limite, preço, vagas, presets, imagem de capa, critérios de pontuação, descrição). O mesmo ocorre no cadastro bancário de saque em `finance/page.tsx`, que exige preenchimento simultâneo de 12 campos de formulário (CPF, nascimento, CEP, rua, número, complemento, bairro, cidade, estado, chave Pix). A taxa de abandono nessas telas tende a ser elevada por fadiga cognitiva.
- **Correção Recomendada:** Reestruturar o cadastro de desafios em um Stepper guiado de 3 passos: (1. Dados Básicos & Datas, 2. Precificação & Vagas, 3. Regras & Missões). No cadastro financeiro, autopreencher endereço via busca assíncrona pelo CEP informado.
- **Prioridade:** MÉDIA

---

### 6. Lei do Limiar de Doherty (<400ms)
> *A produtividade aumenta quando o computador e o usuário interagem a um ritmo (<400ms) que garante que nenhum deles tenha que esperar pelo outro. Use skeletons, feedback imediato e estados pendentes.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/dashboard/announcements/page.tsx:350-354`, `src/app/dashboard/materials/page.tsx:351-356`, `src/app/dashboard/finance/page.tsx:936-943`, `src/components/student/notifications-drawer.tsx:172-177`, `src/components/dashboard/header.tsx:377-383`
- **Problema:** 
  1. Em `announcements/page.tsx` e `materials/page.tsx`, o estado `loading` não é avaliado no retorno visual das listas; o componente renderiza imediatamente a mensagem "Nenhum comunicado/material publicado ainda", que depois de ~500ms é substituída abruptamente pelos cards reais, gerando layout shift e sensação de lentidão.
  2. No extrato da Central Financeira (`finance/page.tsx:936`), o carregamento exibe uma linha de texto simples "Carregando transações financeiras..." em vez de uma tabela com linhas skeleton pulsantes.
  3. Os botões "Ler todas" (notificações) e "Sair da Conta" (header/sidebar) não possuem indicador visual de pending nem desabilitação imediata ao clique, permitindo disparos múltiplos concorrentes em conexões lentas.
- **Correção Recomendada:** Implementar skeletons em todas as tabelas e listas antes de checar se a lista é vazia (`{loading ? <SkeletonRows /> : items.length === 0 ? <EmptyState /> : <List />}`); adicionar estado `disabled` e spinner em todas as mutações assíncronas de botões.
- **Prioridade:** ALTA

---

### 7. Efeito de Von Restorff (Efeito do Isolamento)
> *Quando múltiplos estímulos semelhantes estão presentes, aquele que difere dos demais é mais provável de ser lembrado. Apenas UMA ação primária em destaque por tela.*

- **Status:** ✅ Atende
- **Evidência:** `src/app/globals.css:94-129`, `src/app/app/page.tsx:1060-1080`, `src/app/dashboard/page.tsx:40-60`
- **Problema:** Nenhum problema detectado.
- **Correção Recomendada:** Excelente aplicação do princípio. A paleta monocromática escura do ArenaFitPro permite que a cor azul `#3478F6` funcione como um "farol" visual inequívoco. Na Home do Aluno, apenas o botão de registrar a missão prioritária brilha com sombra e fundo azul; botões secundários adotam grafite neutro `#18181B`.
- **Prioridade:** BAIXA

---

### 8. Lei de Fitts (Distância do Alvo e Ergonomia de Polegar)
> *Ações frequentes devem estar ao alcance natural do polegar no mobile; botões relacionados devem ficar juntos.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/app/camera/[missionId]/page.tsx:380-450`, `src/components/student/bottom-nav.tsx:30-80`, `src/app/app/page.tsx:840-848`
- **Problema:** A navegação inferior (`BottomNav`) está perfeitamente posicionada na zona ergonômica do polegar. Porém, na tela da câmera antifraude (`/app/camera/[missionId]`), os botões de controle de flash e de alternância entre câmera frontal e traseira estão situados no topo extremo da tela (`top-4`), forçando o atleta a segurar o smartphone com as duas mãos durante o treino. Além disso, o botão "SALVAR" do banner de ofensiva em risco fica no topo direito de um card superior.
- **Correção Recomendada:** Reposicionar os controles secundários da câmera para a barra inferior, alinhados horizontalmente ao lado do disparador central de foto.
- **Prioridade:** MÉDIA

---

### 9. Efeito da Posição Serial
> *Os usuários têm propensão a lembrar melhor do primeiro e do último item em uma série ou lista.*

- **Status:** ✅ Atende
- **Evidência:** `src/components/student/bottom-nav.tsx:40-70`, `src/components/dashboard/sidebar.tsx:15-65`
- **Problema:** Nenhum problema detectado.
- **Correção Recomendada:** Os itens de maior impacto e frequência de uso ("Hoje" no app do aluno e "Visão Geral" no cockpit do coach) são os primeiros da lista. Os itens de encerramento de sessão, configurações e perfil ocupam a última posição.
- **Prioridade:** BAIXA

---

### 10. Regra do Pico-Fim (Peak-End Rule)
> *As pessoas julgam uma experiência amplamente com base em como se sentiram no seu auge (pico) e no seu final, em vez da soma de cada momento.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/app/camera/[missionId]/page.tsx:450-520`, `src/components/student/transformation-vault-modal.tsx:255-263`, `src/app/join/[challengeId]/page.tsx:250-320`
- **Problema:** 
  1. O clímax do atleta (finalizar um treino intenso e submeter o check-in na câmera antifraude) é recompensado apenas com um toast simples de texto ("Check-in realizado!"). Não há explosão de confetes, animação de XP subindo ou som de validação comemorativa.
  2. No Cofre de Transformação, o botão "Compartilhar nos Stories" (`transformation-vault-modal.tsx:255`) é fictício: emite apenas um toast `showStatus('Story pronto para exportação!')` sem gerar imagem real ou abrir modal de compartilhamento, quebrando o momento de glória do aluno ao ver sua foto antes/depois.
- **Correção Recomendada:** Introduzir modal de comemoração com confetes canvas ao validar o check-in; integrar o botão do cofre ao gerador de card de Stories de alta resolução já existente no projeto.
- **Prioridade:** MÉDIA

---

### 11. Efeito Zeigarnik
> *As pessoas se lembram de tarefas não concluídas ou interrompidas melhor do que de tarefas concluídas. Mostre progresso visível e checklists incompletos.*

- **Status:** ✅ Atende
- **Evidência:** `src/app/app/page.tsx:830-850, 1340-1370`, `src/components/student/achievements-grid.tsx:15-25`, `src/app/dashboard/audit/page.tsx:80-95`
- **Problema:** Nenhum problema detectado.
- **Correção Recomendada:** O app faz uso brilhante desta lei. O alerta de "Ofensiva em Risco" informa exatamente quantas horas restam para a meia-noite; a barra de progresso do dia mostra claramente o percentual incompleto (ex: "Falta 1 check-in para bater a meta de hoje"); o cofre de fotos exibe cadeado fechado até que ambas as fotos (antes e depois) sejam cadastradas.
- **Prioridade:** BAIXA

---

### 12. Navalha de Occam
> *Entre hipóteses concorrentes ou elementos visuais, a mais simples é preferível. Se um elemento, etapa ou texto pode sair sem perda de função, remova.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/dashboard/master/page.tsx`, `src/app/mestre/page.tsx`, `src/app/spot-ad/page.tsx`, `src/app/beta/page.tsx`
- **Problema:** Existem rotas órfãs e legadas no código:
  - `/dashboard/master/page.tsx` é uma versão antiga do painel master (que foi substituído por `/admin`). Está desprotegida no proxy (`src/proxy.ts`), usa `alert()` e `confirm()` nativos e polui a árvore de páginas.
  - `/mestre/page.tsx` concorre diretamente com `/admin/page.tsx`.
- **Correção Recomendada:** Excluir ou redirecionar permanentemente as rotas legadas `/dashboard/master` e `/mestre` para `/admin`, limpando a árvore de rotas da aplicação.
- **Prioridade:** MÉDIA

---

### 13. Lei de Tesler (Conservação da Complexidade)
> *Existe uma quantidade de complexidade inerente a qualquer sistema que não pode ser reduzida; ela precisa ser absorvida pelo sistema em vez de ser jogada no usuário.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/api/challenges/validate-code/route.ts:78-89`, `src/app/login/page.tsx:430-475`, `src/app/dashboard/challenges/new/page.tsx:280-320`
- **Problema:** 
  1. Na validação de código de turma (`/api/challenges/validate-code`), o backend faz `.limit(50)` sem filtro `WHERE` e realiza um `.find` em memória JavaScript. Se houver mais de 50 desafios na plataforma, qualquer código da 51ª turma em diante falhará para o usuário com "Código não encontrado", repassando a falha de arquitetura para o aluno.
  2. Ao receber um link no WhatsApp, o aluno precisa extrair manualmente o código alfanumérico e digitar no campo, em vez do app capturar automaticamente o código via Clipboard API ou parâmetros de query na URL (`?code=...`).
- **Correção Recomendada:** Substituir o `.find` em memória por busca indexada no Postgres com `.ilike('id::text', ...)`; detectar e autopreencher links e códigos da área de transferência ao focar no formulário.
- **Prioridade:** ALTA

---

### 14. Lei de Postel (Princípio da Robustez)
> *Seja conservador no que você faz, seja liberal no que você aceita dos outros. Aceite entradas flexíveis, tolere erros de digitação e normalize os dados.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/dashboard/finance/page.tsx:70-85`, `src/app/login/page.tsx:450-470`, `src/app/dashboard/challenges/new/page.tsx:115-128`
- **Problema:**
  1. O input de código de turma rejeita códigos válidos se o usuário colar o link completo do WhatsApp (ex: `https://arenafitpro.com/join/TURMA2026`).
  2. Formulários financeiros em `finance/page.tsx` não removem automaticamente pontuações, traços ou espaços em branco ao colar CPF ou telefone, disparando erros de validação da API Asaas.
  3. Datas inicializadas via `new Date().toISOString().split('T')[0]` utilizam o fuso UTC, causando preenchimento de dia incorreto (D+1) para treinadores no Brasil acessando o painel entre 21h00 e 23h59.
- **Correção Recomendada:** Normalizar regex no `onChange` de todos os inputs (extrair slug de URLs, limpar caracteres não numéricos); inicializar campos de data respeitando a timezone local do navegador (`new Date().toLocaleDateString('sv-SE')`).
- **Prioridade:** ALTA

---

### 15. Lei de Murphy
> *Se algo pode dar errado, dará. Trate estados de erro, telas vazias, conexões lentas, falhas de rede e confirme ações destrutivas.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/dashboard/leaderboard/page.tsx:452, 537`, `src/app/app/leaderboard/page.tsx:590-594`, `src/app/dashboard/challenges/[challengeId]/edit/page.tsx:395`, `src/app/dashboard/squads/page.tsx:251-263`, `src/app/app/feed/page.tsx:210-214, 679`
- **Problema:**
  1. **Empty States Desamparados:** Quando uma turma tem apenas 1 atleta, os degraus 2 e 3 do ranking exibem `"2º VAGO"` e `"3º VAGO"` em caixas cinzas sem micro-copy ou botão para compartilhar convite da turma. Na edição do desafio, semanas sem missões exibem um texto itálico sutil sem botão para cadastrar missão naquela semana.
  2. **Falha Silenciosa de Rede:** No feed social (`app/feed/page.tsx:210`), falhas de conexão ou timeout com o Supabase caem em um `console.error` mudo, fazendo com que o aluno veja a mensagem "Nenhum check-in publicado ainda" em vez de um aviso de instabilidade com botão "Tentar Novamente".
  3. **Inconsistência de Estado em Squads:** Em `dashboard/squads/page.tsx`, se o treinador não tiver desafios criados, o formulário de criar squad continua visível e clicável, permitindo submissão de dados sem relacionamento válido.
- **Correção Recomendada:** Adicionar micro-copy com botão "Convidar Alunos" nos degraus vagos do pódio; adicionar botão "+ Adicionar Missão" direto na semana vazia; tratar falhas de rede com estado visual de erro e botão de recarregar; bloquear formulário de squads quando não houver desafios.
- **Prioridade:** ALTA

---

### 16. Lei da Semelhança
> *Elementos que compartilham características visuais são percebidos como tendo a mesma função. Mantenha consistência de cores, ícones e componentes.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/components/legal/cookie-consent-banner.tsx:177-198`, `src/app/dashboard/master/page.tsx:103, 110`
- **Problema:** 
  1. O banner de cookies LGPD (`cookie-consent-banner.tsx`) desvia do design system escuro do ArenaFitPro, utilizando classes legadas como `peer-checked:bg-white`, `peer-checked:after:bg-black` e tons de cinza fora do padrão dos tokens.
  2. Em `src/app/dashboard/master/page.tsx`, foram utilizados os diálogos padrão do navegador (`window.alert()` e `window.confirm()`) que quebram completamente a identidade visual escura da aplicação.
- **Correção Recomendada:** Alinhar o banner de cookies e seus switches aos tokens oficiais (`#3478F6` e `#18181B`); substituir os alertas nativos por instâncias do `CustomDialog`.
- **Prioridade:** MÉDIA

---

### 17. Lei da Conectividade Uniforme
> *Elementos que são visualmente conectados por cores, linhas, bordas ou outras formas são percebidos como mais relacionados do que elementos que não estão conectados.*

- **Status:** ✅ Atende
- **Evidência:** `src/app/globals.css:70-90, 157-168`, `src/app/app/page.tsx:1020-1085`, `src/app/dashboard/page.tsx:320-380`
- **Problema:** Nenhum problema detectado.
- **Correção Recomendada:** O aplicativo emprega containers bem delimitados (`.arena-card`, `.mono-glass-card`, `.arena-card-elevated`) com chanfros de borda uniformes de 1px (`#27272A`), criando blocos visuais conectados que facilitam a leitura visual de seções complexas.
- **Prioridade:** BAIXA

---

### 18. Lei de Parkinson
> *O trabalho se expande para preencher o tempo disponível para sua conclusão. Simplifique formulários, use defaults inteligentes e encurte fluxos.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/dashboard/challenges/new/page.tsx:115-140`, `src/app/join/[challengeId]/page.tsx:110-180`
- **Problema:**
  1. No formulário de nova turma, regras de repetição e limites de envio não vêm com defaults configurados para as melhores práticas do mercado fitness (ex: limite de check-in até 23h59, 1 foto por dia, 100 pontos por treino).
  2. No checkout do aluno em `/join/[challengeId]`, se o aluno já estiver logado, o formulário de pagamento Pix por vezes solicita confirmação manual de dados que já estão no seu perfil autenticado.
- **Correção Recomendada:** Fornecer defaults inteligentes pré-selecionados para todas as opções de desafio; preencher automaticamente dados do aluno no checkout Pix a partir da sessão ativa.
- **Prioridade:** MÉDIA

---

### 19. Carga Cognitiva
> *A quantidade total de esforço mental necessário para usar a interface deve ser minimizada. Use hierarquia tipográfica evidente e divulgação progressiva.*

- **Status:** ⚠️ Parcial
- **Evidência:** `src/app/dashboard/finance/page.tsx:420-530`, `src/app/dashboard/audit/page.tsx:700-760`
- **Problema:**
  1. Na Central Financeira, o coach é sobrecarregado por uma montanha de dados simultâneos no primeiro viewport: 4 cards monetários grandes, dados de plano, badges de tecnologia, extrato financeiro denso de 8 colunas e opções de saque.
  2. Na tela de auditoria de check-ins, a análise nutricional gerada pela IA apresenta texto técnico explicativo e 4 colunas de macros (calorias, carboidratos, proteínas, gorduras) em fontes pequenas e condensadas, tornando a conferência visual repetitiva e cansativa para o treinador após 15 a 20 análises diárias.
- **Correção Recomendada:** Aplicar divulgação progressiva com gavetas ou abas secundárias para detalhes profundos de transações e macronutrientes, mantendo a visão principal limpa com apenas status e botão de aprovação imediata.
- **Prioridade:** MÉDIA

---

### 20. Efeito do Gradiente de Meta
> *A tendência de se aproximar de um objetivo aumenta com a proximidade do objetivo. Exiba barras de progresso contínuo e celebre etapas intermediárias.*

- **Status:** ✅ Atende
- **Evidência:** `src/app/app/page.tsx:1355-1365`, `src/components/student/workout-active-session-hud.tsx:70-95`, `src/components/student/achievements-grid.tsx:16-25`
- **Problema:** Nenhum problema detectado.
- **Correção Recomendada:** Execução notável. O app do aluno possui barras de progresso animadas que mostram exatamente quantas tarefas foram cumpridas em cada categoria (ex: "3/4 - Falta 1 check-in para bater a meta do dia!"). O HUD flutuante do cronômetro de treino estimula a conclusão do tempo estipulado através de pulso dinâmico.
- **Prioridade:** BAIXA

---

## 3. Resumo Executivo e Diagnóstico Geral

### 3.1 Nota Geral de UX/UI

# **7.4 / 10**

**Diagnóstico Justo e Crítico:**  
O ArenaFitPro possui uma base técnica e visual excepcional. A paleta monocromática escura de alta fidelidade com acentos em azul elétrico `#3478F6` transmite sofisticação e seriedade técnica para treinadores e atletas de alto desempenho. A infraestrutura de segurança com validação antifraude via IA Gemini e o split de pagamentos Pix D+0 com a engine Asaas colocam o aplicativo em patamar superior a soluções convencionais.

No entanto, a experiência do usuário ainda apresenta **fricções pontuais e falhas de polimento** características de ciclos de desenvolvimento acelerado:
1. Mistura constante de termos em inglês e jargões internos em telas públicas e operacionais;
2. Botões com áreas de clique diminutas (<44px) que prejudicam o uso mobile;
3. Ausência de CTAs orientadores em estados vazios (empty states);
4. Falta de sanitização flexível em campos de texto (CPF, Pix, URLs de convite);
5. Diálogos modais sem suporte a acessibilidade e tecla `Escape`.

---

### 3.2 Top 5 Problemas Críticos

1. **🔴 Inconsistência de Idioma e Vazamento de Termos Técnicos em Inglês (Jakob / Carga Cognitiva):**  
   Termos em inglês cru como `"OPTICAL_SENSOR_HUD"`, `"RECEIVED"`, `"CONFIRMED"`, `"OVERDUE"`, `"Timer"`, `"Photo"`, `"Stories 9:16 White-Label"` e `"Leaderboard"` poluem a experiência de treinadores e alunos brasileiros, enfraquecendo a percepção de produto nacional refinado.
2. **🔴 Áreas de Toque Minúsculas (<44px) em Ações Críticas Mobile (Fitts - Tamanho):**  
   Botões de texto inline ("Reativar link público", "Ler todas", ícones de lixeira em tabelas) possuem áreas de ~20-24px, resultando em toques falhos e frustração em smartphones.
3. **🔴 Empty States Desamparados sem CTA Orientador (Murphy / Zeigarnik):**  
   O pódio do ranking com apenas 1 aluno exibe caixas `"2º VAGO"` e `"3º VAGO"` vazias sem botão para convidar atletas; semanas sem missões exibem apenas um texto itálico sem atalho para adicionar missões.
4. **🔴 Fricção de Entrada e Falta de Tolerância a Formatos Variados (Postel / Tesler):**  
   Campos de código de turma rejeitam o link completo colado do WhatsApp; inputs de chave Pix e CPF não limpam caracteres especiais automaticamente; datas em UTC causam avanço indesejado de dia no horário noturno brasileiro.
5. **🔴 Acessibilidade e Ausência de Tecla ESC no Diálogo Global (Jakob / Fitts):**  
   O componente `CustomDialog` não escuta o evento de tecla `Escape`, não fecha ao clicar no backdrop escuro e carece de atributos `role="dialog"` e `aria-modal="true"`.

---

### 3.3 Pontos Fortes Notáveis da Aplicação

- **Identidade Visual Premium de Alto Impacto:** A aplicação de design monocromático 3D (`mono-glass-card`, chanfros de 1px `#27272A` e azul `#3478F6`) posiciona o ArenaFitPro entre os apps de fitness mais modernos do mercado.
- **Sensação de Segurança com IA e Antifraude:** A câmera fotográfica integrada com sensor óptico e feedback nutricional transmite extrema autoridade para os desafios do treinador.
- **Excelente Aplicação de Gamificação:** O banner de ofensiva em risco (proteção das 20h), as barras de progresso do dia e o gradiente de meta estimulam o retorno diário do atleta com grande eficácia psicológica.
- **Resiliência de Layout:** A recente implementação de `global-error.tsx` e dos limites de erro dedicados (`dashboard/error.tsx`, `app/error.tsx`, `admin/error.tsx`, `join/error.tsx`) impede que oscilações de rede desloguem o usuário da aplicação.

---

### 3.4 Plano de Correção Ordenado por Prioridade

#### Prioridade ALTA (Impacto Direto na Conversão e Usabilidade Imediata)
1. **Padronização de Idioma (PT-BR):**
   - Traduzir todos os termos técnicos na sidebar (`sidebar.tsx`), cabeçalho (`header.tsx`), tabela financeira (`finance/page.tsx`), tela de auditoria (`audit/page.tsx`) e câmera do aluno (`camera/[missionId]/page.tsx`).
2. **Acessibilidade e Ergonomia do Diálogo Modal (`CustomDialog`):**
   - Adicionar atributos `role="dialog"`, `aria-modal="true"`, fechamento com tecla `Escape` e clique no backdrop em `src/components/ui/custom-dialog.tsx`.
3. **Erradicação de Áreas de Toque <44px:**
   - Adicionar `min-h-[44px] min-w-[44px]` ou padding expandido em todos os botões de texto inline ("Reativar link público", "Ler todas", botões de ação em tabelas).
4. **Robustez de Entrada de Dados (Postel / Tesler):**
   - Sanitizar o input de código de turma para extrair o código mesmo quando o aluno colar a URL completa do WhatsApp (`arenafitpro.com/join/CODIGO`).
   - Aplicar máscara e limpeza automática de pontuação em campos de CPF, telefone e chave Pix.
   - Ajustar datas para respeitar a timezone local do usuário (`America/Sao_Paulo`).
5. **Empty States Ativos com Call-to-Action:**
   - Adicionar botão "Convidar Atletas" com link copiável nos degraus vagos do pódio (`dashboard/leaderboard` e `app/leaderboard`).
   - Adicionar botão "+ Adicionar Missão" em semanas vazias do editor de desafios (`dashboard/challenges/[id]/edit`).
   - Exibir card com botão "Tentar Novamente" em caso de erro de rede no feed social (`app/feed`).

#### Prioridade MÉDIA (Redução de Fricção e Aprimoramento de Fluxo)
1. **Agrupamento da Sidebar em Seções Colapsáveis:**
   - Agrupar os 14 itens do cockpit em 3 clusters: "Operação", "Engajamento", "Financeiro".
2. **Substituição de Textos Puros por Skeletons:**
   - Inserir skeletons estruturados no extrato de transações (`finance/page.tsx`) e nas listas de comunicados e materiais durante busca ativa.
3. **Divisão de Formulários Longos em Etapas (Miller):**
   - Reestruturar o cadastro de desafios (`challenges/new`) em um stepper visual de 3 etapas.
4. **Erradicação de Rotas Legadas (Occam):**
   - Redirecionar `/dashboard/master` e `/mestre` permanentemente para `/admin` e remover arquivos obsoletos.
5. **Celebração Pós-Check-in (Pico-Fim):**
   - Disparar modal com animação de confetes ao concluir a missão diária e ativar o botão real de compartilhamento de Stories no Cofre de Transformação.

#### Prioridade BAIXA (Polimento Fino e Consistência de Tokens)
1. **Harmonização de Tokens no Banner LGPD:**
   - Ajustar as classes do `cookie-consent-banner.tsx` para utilizarem os tokens `#3478F6` e `#18181B`.
2. **Chaves Semânticas em Loops Dinâmicos:**
   - Substituir chaves `key={index}` por identificadores estáveis (`key={item.id}`).

---

## 4. Fechamento Obrigatório

Quer que eu rode `/ux-fix` para aplicar as correções de prioridade ALTA?
