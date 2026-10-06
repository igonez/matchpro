-- ==============================================================================
-- FASE 2: COFRE ANTES & DEPOIS + GERADOR DE STORIES COM SLIDER
-- MatchPro SaaS Gamificado
-- ==============================================================================

-- 1. TABELA DO COFRE PESSOAL DE TRANSFORMAÇÃO DO ALUNO
CREATE TABLE IF NOT EXISTS public.student_transformation_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    
    -- Foto de Início (Dia 1)
    before_photo_url TEXT,
    before_weight_kg NUMERIC(5,2),
    before_notes TEXT,
    before_submitted_at TIMESTAMPTZ,
    
    -- Foto Final (Dia 30 / Encerramento)
    after_photo_url TEXT,
    after_weight_kg NUMERIC(5,2),
    after_notes TEXT,
    after_submitted_at TIMESTAMPTZ,
    
    -- Status do Cofre
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_revealed BOOLEAN NOT NULL DEFAULT FALSE, -- Se o aluno já desbloqueou e viu
    is_public_story_approved BOOLEAN NOT NULL DEFAULT FALSE, -- Autorização para feed/personal divulgar
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, challenge_id)
);

-- 2. HABILITAR RLS
ALTER TABLE public.student_transformation_vault ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS RLS (PRIVACIDADE MÁXIMA PARA FOTOS INICIAIS)
CREATE POLICY "Alunos têm acesso total ao seu próprio cofre"
ON public.student_transformation_vault FOR ALL
TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Treinadores podem ver o cofre de alunos dos seus desafios"
ON public.student_transformation_vault FOR SELECT
TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.challenges c
        WHERE c.id = challenge_id AND c.professional_id = auth.uid()
    )
);
