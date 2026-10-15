-- Migration: Suporte avançado a Assinaturas Recorrentes Asaas e Subcontas (Split)
-- Data: 2026-10-15

ALTER TABLE public.professionals
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

CREATE INDEX IF NOT EXISTS idx_professionals_asaas_subscription_id ON public.professionals(asaas_subscription_id);
CREATE INDEX IF NOT EXISTS idx_professionals_asaas_wallet_id ON public.professionals(asaas_wallet_id);
