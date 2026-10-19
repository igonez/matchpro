# 🛡️ Diretrizes e Arquitetura de Segurança — ArenaFitPro

Este documento estabelece as políticas, controles técnicos e procedimentos operacionais de segurança da informação implementados no **ArenaFitPro**.

---

## 📋 Resumo dos 20 Requisitos de Segurança

| # | Requisito | Mecanismo Implementado | Camada / Arquivo |
|---|---|---|---|
| 1 | **HTTPS** | TLS 1.3 obrigatório + Header `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | `next.config.ts` + Vercel SSL |
| 2 | **Senhas com Hash** | Algoritmo **bcrypt / Argon2** com salt automático gerado e armazenado de forma isolada | Supabase Auth (`auth.users`) |
| 3 | **MFA (2FA)** | Suporte a **TOTP** (Google Authenticator, Authy, 1Password) com prioridade para Master e Treinadores | `supabase.auth.mfa` |
| 4 | **Rate Limit** | Sliding-window token bucket por IP/Identificador (`auth`, `checkout`, `ai`, `submissions`) com headers `429 Too Many Requests` | `src/lib/security/rate-limit.ts` |
| 5 | **Validação de Inputs** | Schemas estritos com **Zod**, rejeitando parâmetros excedentes e validando UUIDs, documentos e valores | `src/lib/security/validation.ts` |
| 6 | **Sanitização de Dados** | Higienização de strings contra XSS, remoção de tags HTML, esquemas `javascript:`, null-bytes e caracteres de controle | `src/lib/security/sanitize.ts` |
| 7 | **SQL Injection** | Queries 100% parametrizadas via PostgREST / Supabase SDK + Zero raw SQL concatenado com inputs de usuário | Supabase Client + PostgreSQL RLS |
| 8 | **Migrations** | Versionamento sequencial padronizado em `supabase/migrations/YYYYMMDD_*.sql` | `supabase/migrations/` |
| 9 | **Rollback** | Scripts dedicados de rollback correspondentes a cada migração estrutural (`*_rollback.sql`) | `supabase/migrations/*_rollback.sql` |
| 10 | **Controle de Acesso (RBAC)** | Validação no Next.js Edge Middleware (`student`, `professional`, `master`) + RLS estrito a nível de linha no PostgreSQL | `src/middleware.ts` + RLS Policies |
| 11 | **Expiração de Sessão** | Tokens JWT com validade de 1 hora + rotação de Refresh Tokens e cookies `httpOnly`, `secure`, `sameSite: lax` | Supabase SSR Cookie Manager |
| 12 | **Secrets fora do Código** | `.env.local` bloqueado no `.gitignore`, chaves de API restritas ao Server-side (`SUPABASE_SERVICE_ROLE_KEY`, `ASAAS_API_KEY`) | Variáveis de ambiente Vercel |
| 13 | **CORS Configurado** | Restrição de origens autorizadas em `next.config.ts` com métodos (`GET, POST, PUT, DELETE, OPTIONS`) e cabeçalhos permitidos | `next.config.ts` (`/api/:path*`) |
| 14 | **Logs de Segurança** | Registros de eventos com severidade (`INFO`, `WARN`, `HIGH`, `CRITICAL`) gravados na tabela imutável `security_audit_logs` | `src/lib/security/audit.ts` + DB Trigger |
| 15 | **Backups** | Backups diários automatizados + Supabase Point-in-Time Recovery (PITR) para restauração a qualquer segundo | Supabase Cloud Infrastructure |
| 16 | **Criptografia de Dados Sensíveis** | Criptografia em trânsito (TLS 1.3) + em repouso (AES-256 no disco) + extensão `pgcrypto` para dados ultra-sensíveis | PostgreSQL `pgcrypto` + Supabase Disk |
| 17 | **Dependências (SCA)** | Auditoria contínua de vulnerabilidades via `npm audit` com resolução de vulnerabilidades via `overrides` | `package.json` + CI/CD Audit |
| 18 | **PMP (Patch & Privileged Mgmt)** | Política formal de aplicação de patches de segurança e princípio do menor privilégio para administradores | Seção 3 deste documento |
| 19 | **Monitoramento** | Logging estruturado em console compatível com SIEM/Vercel Log Drains + alertas de erro em runtime | Vercel Analytics + Supabase Health |
| 20 | **Plano de Recuperação (DRP)** | RTO < 2 horas e RPO < 15 minutos documentados com procedimento de restauração passo a passo | Seção 4 deste documento |

---

## 🔒 1. Prevenção de Falhas Críticas & Vulnerabilidades

### 1.1. Elevação de Privilégios (CWE-269 / CWE-284)
- **Regra**: Nunca confiar em `user.user_metadata` para decisões de autorização, pois `user_metadata` pode ser editado pelo próprio usuário através de chamadas a `supabase.auth.updateUser()`.
- **Implementação**: Toda verificação de papéis administrativos (`isMasterAdmin`, `isProfessional`) depende exclusivamente de:
  1. `user.app_metadata` (gravável unicamente via Service Role);
  2. Lista explícita de e-mails em variável de ambiente (`MASTER_ADMIN_EMAILS`);
  3. Consulta autenticada contra a tabela `professionals` no banco.

### 1.2. Prevenção de Injeção de Código e XSS
- Dados textuais submetidos em formulários ou APIs passam por sanitização (`sanitizeString`) antes de serem armazenados ou renderizados.
- Todos os cabeçalhos de segurança contra Clickjacking (`X-Frame-Options: SAMEORIGIN`) e Sniffing (`X-Content-Type-Options: nosniff`) estão ativados globalmente.

---

## 🔑 2. Ativação e Gestão de MFA (Multi-Factor Authentication)

1. Contas com privilégios de **Super Admin** e **Profissionais** devem habilitar autenticação em duas etapas via TOTP.
2. Fluxo no frontend através do Supabase Auth:
   ```ts
   // Iniciar inscrição de fator TOTP
   const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
   // Validar código TOTP inicial gerado pelo app autenticador
   await supabase.auth.mfa.challengeAndVerify({ factorId: data.id, code: userCode });
   ```

---

## 🛠️ 3. PMP (Patch Management & Privileged Access Policy)

### 3.1. Gestão de Patches (SCA)
1. Semanalmente, executar `npm audit` para identificar CVEs em dependências diretas e transitivas.
2. Em caso de vulnerabilidades identificadas sem patch direto no pacote raiz, aplicar resolução forçada via `"overrides"` no `package.json`.
3. Atualizações de runtime (Node.js e Next.js) devem ser testadas em ambiente de staging antes da promoção para produção.

### 3.2. Gestão de Contas Privilegiadas (PAM)
1. Nenhum usuário recebe privilégios de `master` sem aprovação do proprietário técnico.
2. Chaves de serviço (`SUPABASE_SERVICE_ROLE_KEY`) nunca devem ser expostas ao client-side (prefixo `NEXT_PUBLIC_` é expressamente proibido para credenciais de admin).
3. Rotação trimestral de segredos de webhooks (`ASAAS_WEBHOOK_SECRET`) e tokens de serviço.

---

## 🚨 4. Plano de Recuperação de Desastres (DRP)

### 4.1. Métricas de Resiliência
- **RTO (Recovery Time Objective)**: Tempo máximo aceitável para retorno do serviço = **2 horas**.
- **RPO (Recovery Point Objective)**: Perda máxima aceitável de dados = **15 minutos**.

### 4.2. Procedimento de Restauração em Caso de Desastre
1. **Falha de Aplicação / Deploy Corrompido**:
   - Reverter instantaneamente para o deploy anterior no painel da Vercel (*Instant Rollback*).
2. **Corrupção de Banco de Dados ou Perda Acidental de Dados**:
   - Acessar o dashboard do Supabase Cloud -> *Database* -> *Backups* -> *Point in Time Recovery*.
   - Selecionar o timestamp imediatamente anterior ao incidente (ex: 5 minutos antes).
   - Iniciar o processo de *Clone/Restore* para restaurar o estado consistente do banco.
3. **Comprometimento de Credenciais**:
   - Rotacionar imediatamente a `SUPABASE_SERVICE_ROLE_KEY` e a `ASAAS_API_KEY` nos painéis de controle e atualizar as variáveis de ambiente na Vercel.
   - Forçar logout de todas as sessões ativas via `supabase.auth.admin.signOut(userId, 'global')`.
