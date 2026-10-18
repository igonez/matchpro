-- Criação da tabela de Leads / Lista VIP para treinadores e parceiros
CREATE TABLE IF NOT EXISTS public.coach_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'personal_trainer', -- 'personal_trainer', 'nutricionista', 'academia_box', 'outro'
    students_range TEXT NOT NULL, -- '1_10', '11_30', '31_60', '60_plus'
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    status TEXT DEFAULT 'new' -- 'new', 'contacted', 'converted'
);

-- Habilitar RLS
ALTER TABLE public.coach_leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção anônima pública (formulário de captura)
CREATE POLICY "Permitir insercao anonima de leads" 
ON public.coach_leads 
FOR INSERT 
WITH CHECK (true);

-- Política para leitura apenas por administradores / service_role
CREATE POLICY "Leitura restrita a administradores" 
ON public.coach_leads 
FOR SELECT 
USING (auth.jwt() ->> 'role' = 'service_role');
