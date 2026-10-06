# 🚀 MatchPro — Guia Rápido de Configuração e Execução

O **MatchPro** é um SaaS B2B2C para gestão gamificada de desafios de fitness e saúde construído com **Next.js 15, TypeScript, Tailwind CSS, Shadcn UI e Supabase**.

---

## 1. Configurar Banco de Dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com).
2. Vá até o **SQL Editor** do Supabase Dashboard.
3. Copie o conteúdo completo do arquivo [`supabase/schema.sql`](file:///c:/Users/igort/OneDrive/Documentos/Projetos%20Antigravity/MatchPro/supabase/schema.sql) e execute.
   - Isso criará as 7 tabelas relacionais (`professionals`, `challenges`, `students`, `challenge_participants`, `missions`, `student_submissions`, `leaderboard_standings`).
   - Criará a função e **Trigger antifraude** `on_submission_approved` que credita pontos automaticamente assim que uma foto for aprovada.
   - Criará as políticas de **Row Level Security (RLS)** e o bucket público `submissions` no Supabase Storage.

---

## 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as chaves do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
```

---

## 3. Rodar o Projeto Localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 4. Estrutura de Rotas e Telas

### Módulo de Autenticação & Landing
- `/`: Landing page com apresentação do SaaS e botões de acesso.
- `/login`: Autenticação unificada por E-mail/Senha ou Google OAuth, permitindo criar conta como **Profissional** ou **Aluno**.
- `middleware.ts`: Roteamento automático baseado no papel (Profissional redirecionado para `/dashboard` e Aluno para `/app`).

### Área do Profissional (B2B - Desktop Otimizado)
- `/dashboard`: Visão geral com métricas (Alunos ativos, Faturamento estimado, Desafios e Submissões pendentes).
- `/dashboard/challenges/new`: Criação de novo desafio fitness com datas, valor em R$ e aviso de integração com gateway de pagamento.
- `/dashboard/missions`: Cadastro e gestão das missões diárias com pontos atribuídos (ex: Refeição Limpa, Treino do Dia).
- `/dashboard/audit`: Interface **Swipe/Tinder** com botões **Aprovar (Verde)** e **Rejeitar (Vermelho)** para avaliação de fotos com efeito de confete e acionamento da trigger de pontuação.

### Área do Aluno (B2C - Mobile-First PWA)
- `/app`: Feed Diário com as tarefas do dia e badges dinâmicos de status (*Pendente*, *Aguardando Aprovação*, *Concluída*).
- `/app/camera/[missionId]`: Captura forçada pela câmera nativa (`capture="environment"` para bloquear upload prévio da galeria) e upload direto para o Supabase Storage.
- `/app/leaderboard`: Classificação e pódio da turma com assinatura em tempo real via **Supabase Realtime (WebSockets)**.
