-- ==============================================================================
-- Migration: Coach Leads & Beta Testers Capture Table
-- Tabela de Leads, Candidaturas Beta e Lista VIP
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.coach_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'personal_trainer', -- 'personal_trainer', 'nutricionista', 'academia_box', 'outro'
    students_range TEXT NOT NULL DEFAULT '11_30', -- '1_10', '11_30', '31_60', '60_plus'
    instagram TEXT,
    lead_type TEXT DEFAULT 'beta_tester', -- 'beta_tester', 'vip', 'coach'
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    status TEXT DEFAULT 'new' -- 'new', 'contacted', 'converted'
);

-- Garantir colunas caso a tabela já tenha sido criada anteriormente sem elas
ALTER TABLE public.coach_leads ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.coach_leads ADD COLUMN IF NOT EXISTS lead_type TEXT DEFAULT 'beta_tester';
ALTER TABLE public.coach_leads ADD COLUMN IF NOT EXISTS students_range TEXT DEFAULT '11_30';
ALTER TABLE public.coach_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Índices para buscas rápidas no painel mestre
CREATE INDEX IF NOT EXISTS idx_coach_leads_created_at ON public.coach_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_leads_email ON public.coach_leads(email);
CREATE INDEX IF NOT EXISTS idx_coach_leads_whatsapp ON public.coach_leads(whatsapp);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.coach_leads ENABLE ROW LEVEL SECURITY;

-- 1. Política para permitir inserção pública anônima (formulários /beta e /vip)
DROP POLICY IF EXISTS "Permitir insercao anonima de leads" ON public.coach_leads;
CREATE POLICY "Permitir insercao anonima de leads" 
ON public.coach_leads 
FOR INSERT 
WITH CHECK (true);

-- 2. Política para leitura e gestão por service_role ou Super Admins
DROP POLICY IF EXISTS "Leitura restrita a administradores" ON public.coach_leads;
CREATE POLICY "Leitura restrita a administradores" 
ON public.coach_leads 
FOR ALL 
USING (
    auth.jwt() ->> 'role' = 'service_role' 
    OR auth.jwt() ->> 'is_master_admin' = 'true'
);
