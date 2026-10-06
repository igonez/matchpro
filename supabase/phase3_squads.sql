-- ==============================================================================
-- FASE 3: SQUADS / MICRO-EQUIPES (GUERRA DE TIMES DENTRO DO DESAFIO)
-- MatchPro SaaS Gamificado
-- ==============================================================================

-- 1. TABELA DE SQUADS (TIMES CRIADOS NO DESAFIO)
CREATE TABLE IF NOT EXISTS public.challenge_squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ex: "Squad Foco Total", "Os Espartanos", "Team Alpha"
    color_theme TEXT DEFAULT 'emerald', -- Tema de cor para badges ('emerald', 'orange', 'cyan', 'purple', 'amber')
    motto TEXT, -- Lema do time
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELA DE MEMBROS DO SQUAD
CREATE TABLE IF NOT EXISTS public.squad_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL REFERENCES public.challenge_squads(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, challenge_id) -- Cada aluno só pertence a 1 Squad por desafio
);

-- 3. HABILITAR RLS
ALTER TABLE public.challenge_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACESSO
CREATE POLICY "Todos podem ler Squads dos desafios"
ON public.challenge_squads FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Treinadores podem gerenciar Squads"
ON public.challenge_squads FOR ALL
TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.challenges c
        WHERE c.id = challenge_id AND c.professional_id = auth.uid()
    )
);

CREATE POLICY "Todos podem ler membros de Squads"
ON public.squad_members FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Treinadores ou Alunos podem associar a Squads"
ON public.squad_members FOR ALL
TO authenticated USING (true);

-- 5. VIEW DE RANKING DE SQUADS (MÉDIA DE PONTOS DA EQUIPE)
CREATE OR REPLACE VIEW public.squad_standings AS
SELECT 
    s.id AS squad_id,
    s.challenge_id,
    s.name AS squad_name,
    s.color_theme,
    s.motto,
    COUNT(sm.student_id) AS total_members,
    COALESCE(SUM(ls.total_points), 0) AS squad_total_points,
    ROUND(
        COALESCE(SUM(ls.total_points), 0)::numeric / GREATEST(COUNT(sm.student_id), 1),
        1
    ) AS squad_average_points
FROM public.challenge_squads s
LEFT JOIN public.squad_members sm ON sm.squad_id = s.id
LEFT JOIN public.leaderboard_standings ls ON ls.student_id = sm.student_id AND ls.challenge_id = s.challenge_id
GROUP BY s.id, s.challenge_id, s.name, s.color_theme, s.motto
ORDER BY squad_average_points DESC, squad_total_points DESC;
