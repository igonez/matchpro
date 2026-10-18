-- Migration: Master Dashboard Schema & Ad Spend Tracker
-- Data: 2026-10-18

-- 1. Coluna de Super Admin na tabela de profissionais
ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS is_master_admin BOOLEAN DEFAULT false;

-- 2. Tabela para registro de gastos com anúncios (Tráfego Pago & ROI)
CREATE TABLE IF NOT EXISTS public.platform_ad_spend (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    spend_date DATE NOT NULL,
    platform TEXT NOT NULL DEFAULT 'meta_ads', -- 'meta_ads', 'google_ads', 'tiktok', 'influencer', 'outro'
    amount NUMERIC(10, 2) NOT NULL,
    campaign_name TEXT,
    notes TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_platform_ad_spend_date ON public.platform_ad_spend(spend_date);

-- Habilitar RLS
ALTER TABLE public.platform_ad_spend ENABLE ROW LEVEL SECURITY;

-- Política de RLS: Apenas service_role ou administradores têm acesso
DROP POLICY IF EXISTS "Service role can manage platform_ad_spend" ON public.platform_ad_spend;
CREATE POLICY "Service role can manage platform_ad_spend"
ON public.platform_ad_spend
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'is_master_admin' = 'true');
