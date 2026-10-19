-- ==============================================================================
-- Migration: 20261019_enterprise_security_hardening.sql
-- Description: Implementação de Audit Logs de Segurança, RLS Estrito, Pgcrypto,
--              e Políticas de Isolamento Multi-tenant contra Acessos Não Autorizados.
-- ==============================================================================

-- 1. Habilitar extensões criptográficas necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tabela de Logs de Auditoria de Segurança (Imutável / Write-Only por Service Role)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARN', 'HIGH', 'CRITICAL')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    resource_path TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de performance para investigações de segurança e incidentes
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.security_audit_logs(user_id);

-- 3. Ativar Row Level Security (RLS) estrito na tabela de logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Proibir qualquer leitura ou escrita direta via API pública/anônima/autenticada padrão
-- Apenas service_role ou funções SECURITY DEFINER podem inserir/ler registros
DROP POLICY IF EXISTS "Deny all public reads on security_audit_logs" ON public.security_audit_logs;
CREATE POLICY "Deny all public reads on security_audit_logs"
    ON public.security_audit_logs
    FOR SELECT
    TO authenticated, anon
    USING (false);

DROP POLICY IF EXISTS "Deny all public writes on security_audit_logs" ON public.security_audit_logs;
CREATE POLICY "Deny all public writes on security_audit_logs"
    ON public.security_audit_logs
    FOR ALL
    TO authenticated, anon
    USING (false)
    WITH CHECK (false);

-- 4. Garantir RLS ativo em todas as tabelas sensíveis da plataforma
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.processed_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leaderboard_standings ENABLE ROW LEVEL SECURITY;
ALTER VIEW IF EXISTS public.submissions SET (security_invoker = true);

-- 5. Bloquear manipulação direta da tabela de idempotência de webhooks por usuários comuns
DROP POLICY IF EXISTS "Restrict processed_webhooks to service_role" ON public.processed_webhooks;
CREATE POLICY "Restrict processed_webhooks to service_role"
    ON public.processed_webhooks
    FOR ALL
    TO authenticated, anon
    USING (false)
    WITH CHECK (false);

-- 6. Trigger de Imutabilidade nos Logs de Auditoria (Prevenção de Adulteração / Tamper-Proof)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Registros de auditoria de segurança são estritamente imutáveis. UPDATE e DELETE são proibidos.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_update ON public.security_audit_logs;
CREATE TRIGGER trg_prevent_audit_log_update
    BEFORE UPDATE OR DELETE ON public.security_audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_audit_log_modification();

-- 7. Correção de Vulnerabilidade Crítica de Pagamento (CS-01):
-- Proibir que qualquer usuário insira ou manipule payment_status = 'paid' em desafios pagos diretamente via client
DROP POLICY IF EXISTS "Students can join challenges" ON public.challenge_participants;
CREATE POLICY "Students can join challenges"
    ON public.challenge_participants
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = student_id AND (
            payment_status = 'pending' OR
            EXISTS (
                SELECT 1 FROM public.challenges c
                WHERE c.id = challenge_id AND c.price = 0
            )
        )
    );

-- Bloquear atualização direta de status de pagamento por usuários no client
-- Apenas service_role (webhooks e jobs do servidor) pode alterar status de participantes
DROP POLICY IF EXISTS "Deny direct payment_status update by students" ON public.challenge_participants;
CREATE POLICY "Deny direct payment_status update by students"
    ON public.challenge_participants
    FOR UPDATE
    TO authenticated, anon
    USING (false)
    WITH CHECK (false);

