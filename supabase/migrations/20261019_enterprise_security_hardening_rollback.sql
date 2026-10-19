-- ==============================================================================
-- Rollback Migration: 20261019_enterprise_security_hardening_rollback.sql
-- Description: Script de reversão para a migration de segurança 20261019
-- ==============================================================================

-- 1. Remover trigger de imutabilidade
DROP TRIGGER IF EXISTS trg_prevent_audit_log_update ON public.security_audit_logs;
DROP FUNCTION IF EXISTS public.prevent_audit_log_modification();

-- 2. Remover políticas e tabela de logs
DROP POLICY IF EXISTS "Deny all public reads on security_audit_logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "Deny all public writes on security_audit_logs" ON public.security_audit_logs;
DROP TABLE IF EXISTS public.security_audit_logs;

-- 3. Remover política da tabela processed_webhooks se necessário
DROP POLICY IF EXISTS "Restrict processed_webhooks to service_role" ON public.processed_webhooks;

-- 4. Reverter políticas de challenge_participants
DROP POLICY IF EXISTS "Deny direct payment_status update by students" ON public.challenge_participants;
DROP POLICY IF EXISTS "Students can join challenges" ON public.challenge_participants;
CREATE POLICY "Students can join challenges" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = student_id);

