-- ==============================================================================
-- CORREÇÃO E ATUALIZAÇÃO COMPLETA: CAMPOS BANCÁRIOS E SUBCONTAS (ASAAS)
-- Execute este script no SQL Editor do Supabase para garantir que todas
-- as colunas necessárias para salvar dados bancários e Pix existam na tabela.
-- ==============================================================================

ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'CPF',
ADD COLUMN IF NOT EXISTS document_number TEXT,
ADD COLUMN IF NOT EXISTS asaas_pix_key TEXT,
ADD COLUMN IF NOT EXISTS asaas_wallet_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan_cycle TEXT DEFAULT 'MONTHLY',
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS address_number TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_professionals_asaas_wallet_id ON public.professionals(asaas_wallet_id);
CREATE INDEX IF NOT EXISTS idx_professionals_asaas_pix_key ON public.professionals(asaas_pix_key);
