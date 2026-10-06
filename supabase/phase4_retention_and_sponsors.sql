-- ==============================================================================
-- FASE 4: RADAR DE RETENÇÃO (AT-RISK) & VITRINE DE PATROCINADORES / PARCEIROS
-- MatchPro SaaS Gamificado
-- ==============================================================================

-- 1. ADICIONAR COLUNA DE TELEFONE/WHATSAPP NA TABELA DE ALUNOS (CASO NÃO EXISTA)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. TABELA DE PATROCINADORES & PARCEIROS DO TREINADOR (B2B MONETIZATION)
CREATE TABLE IF NOT EXISTS public.challenge_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ex: "Marmitas Fit Gourmet", "Growth Suplementos Bairro"
    category TEXT NOT NULL DEFAULT 'nutrition', -- 'nutrition', 'supplements', 'apparel', 'clinic', 'other'
    logo_url TEXT,
    discount_code TEXT, -- Ex: "MATCHPRO15"
    discount_description TEXT NOT NULL, -- Ex: "15% de desconto em todo o cardápio fit"
    whatsapp_or_link TEXT, -- Link direto para pedir ou comprar
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. HABILITAR RLS
ALTER TABLE public.challenge_sponsors ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACESSO AOS PATROCINADORES
CREATE POLICY "Todos os usuários autenticados podem ver os patrocinadores"
ON public.challenge_sponsors FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Treinadores podem gerenciar seus parceiros e patrocinadores"
ON public.challenge_sponsors FOR ALL
TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.challenges c
        WHERE c.id = challenge_id AND c.professional_id = auth.uid()
    )
);

-- 5. VIEW ANALÍTICA DE RADAR DE RISCO (ALUNOS INATIVOS A MAIS DE 48H)
CREATE OR REPLACE VIEW public.at_risk_students_view AS
SELECT 
    cp.challenge_id,
    c.title AS challenge_title,
    s.id AS student_id,
    s.full_name AS student_name,
    s.phone AS student_phone,
    COALESCE(MAX(sub.submitted_at), cp.joined_at) AS last_activity_at,
    ROUND(
        EXTRACT(EPOCH FROM (NOW() - COALESCE(MAX(sub.submitted_at), cp.joined_at))) / 86400,
        1
    ) AS days_inactive
FROM public.challenge_participants cp
JOIN public.challenges c ON c.id = cp.challenge_id
JOIN public.students s ON s.id = cp.student_id
LEFT JOIN public.student_submissions sub ON sub.student_id = cp.student_id AND sub.challenge_id = cp.challenge_id
GROUP BY cp.challenge_id, c.title, s.id, s.full_name, s.phone, cp.joined_at;
