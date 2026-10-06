-- ==============================================================================
-- MATCHPRO SAAS GAMIFICADO: MIGRAÇÃO CONSOLIDADA (FASES 1, 2, 3 E 4)
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- ==============================================================================
-- PARTE 1: FASE 1 - RETENÇÃO & DOPAMINA (FREEZE SHIELD & MYSTERY BOX)
-- ==============================================================================

-- 1.1 Tabela de Estado Gamificado do Aluno
CREATE TABLE IF NOT EXISTS public.student_gamification_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    freeze_shields_available INT NOT NULL DEFAULT 1,
    freeze_shields_used INT NOT NULL DEFAULT 0,
    last_freeze_used_at TIMESTAMPTZ,
    current_streak INT NOT NULL DEFAULT 1,
    best_streak INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, challenge_id)
);

-- 1.2 Tabela de Recompensas da Mystery Box
CREATE TABLE IF NOT EXISTS public.mystery_box_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('points', 'freeze_shield', 'consultation', 'coupon', 'badge', 'custom')),
    reward_value TEXT,
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    probability_weight INT NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 1.3 Histórico de Abertura de Mystery Box
CREATE TABLE IF NOT EXISTS public.student_mystery_box_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    reward_id UUID REFERENCES public.mystery_box_rewards(id) ON DELETE SET NULL,
    reward_title TEXT NOT NULL,
    reward_type TEXT NOT NULL,
    reward_value TEXT,
    claimed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, challenge_id, week_number)
);

-- 1.4 Log de Ativação de Freeze Shields
CREATE TABLE IF NOT EXISTS public.freeze_shield_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    shield_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT,
    activated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS da Fase 1
ALTER TABLE public.student_gamification_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_box_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mystery_box_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freeze_shield_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Gamification State - Leitura Livre" ON public.student_gamification_state FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Gamification State - Aluno Atualiza" ON public.student_gamification_state FOR ALL TO authenticated USING (student_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Mystery Box Rewards - Leitura Livre" ON public.mystery_box_rewards FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Mystery Box Claims - Aluno Grava" ON public.student_mystery_box_claims FOR ALL TO authenticated USING (student_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Freeze Shield Logs - Aluno Grava" ON public.freeze_shield_logs FOR ALL TO authenticated USING (student_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Inserir recompensas padrão se vazio
INSERT INTO public.mystery_box_rewards (title, description, reward_type, reward_value, rarity, probability_weight)
VALUES 
    ('+50 Pontos Extras', 'Injeção de 50 pontos diretos na tabela do ranking!', 'points', '50', 'common', 50),
    ('+100 Pontos de Ouro', 'Um bônus massivo de 100 pontos para colar no topo!', 'points', '100', 'rare', 25),
    ('Escudo de Emergência Extra', 'Garante 1 Freeze Shield extra para salvar sua semana!', 'freeze_shield', '1', 'rare', 20),
    ('Badge Lendário: "Muralha de Ferro"', 'Insígnia de prestígio supremo no seu perfil!', 'badge', 'wall_of_iron', 'epic', 10),
    ('Sessão 1-a-1 com o Treinador', 'Feedback personalizado de alinhamento com seu treinador!', 'consultation', 'call_1on1', 'legendary', 5)
ON CONFLICT DO NOTHING;


-- ==============================================================================
-- PARTE 2: FASE 2 - COFRE ANTES & DEPOIS (PROVA SOCIAL BLINDADA)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.student_transformation_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    before_photo_url TEXT,
    before_weight_kg NUMERIC(5,2),
    before_notes TEXT,
    before_submitted_at TIMESTAMPTZ,
    after_photo_url TEXT,
    after_weight_kg NUMERIC(5,2),
    after_notes TEXT,
    after_submitted_at TIMESTAMPTZ,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_revealed BOOLEAN NOT NULL DEFAULT FALSE,
    is_public_story_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, challenge_id)
);

ALTER TABLE public.student_transformation_vault ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Transformation Vault - Acesso Total Aluno" ON public.student_transformation_vault FOR ALL TO authenticated USING (student_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Transformation Vault - Treinador Leitura" ON public.student_transformation_vault FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.challenges c
            WHERE c.id = challenge_id AND c.professional_id = auth.uid()
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ==============================================================================
-- PARTE 3: FASE 3 - SQUADS / MICRO-EQUIPES (GUERRA DE TRIBOS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.challenge_squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color_theme TEXT DEFAULT 'emerald',
    motto TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.squad_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID NOT NULL REFERENCES public.challenge_squads(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, challenge_id)
);

ALTER TABLE public.challenge_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Squads - Leitura Livre" ON public.challenge_squads FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Squads - Treinador Gerencia" ON public.challenge_squads FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.challenges c
            WHERE c.id = challenge_id AND c.professional_id = auth.uid()
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Squad Members - Leitura Livre" ON public.squad_members FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Squad Members - Gerenciar" ON public.squad_members FOR ALL TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- View Analítica de Standings de Squads
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


-- ==============================================================================
-- PARTE 4: FASE 4 - RADAR ANTI-CHURN & PARCEIROS/PATROCINADORES
-- ==============================================================================

-- Coluna de WhatsApp na tabela de alunos
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Tabela de Parceiros e Patrocinadores do Treinador
CREATE TABLE IF NOT EXISTS public.challenge_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'nutrition',
    logo_url TEXT,
    discount_code TEXT,
    discount_description TEXT NOT NULL,
    whatsapp_or_link TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.challenge_sponsors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Sponsors - Leitura Livre" ON public.challenge_sponsors FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Sponsors - Treinador Gerencia" ON public.challenge_sponsors FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.challenges c
            WHERE c.id = challenge_id AND c.professional_id = auth.uid()
        )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- View Analítica de Alunos em Risco de Desistência (CORRIGIDA: submissão vinculada via missions)
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
LEFT JOIN public.missions m ON m.challenge_id = cp.challenge_id
LEFT JOIN public.student_submissions sub ON sub.student_id = cp.student_id AND sub.mission_id = m.id
GROUP BY cp.challenge_id, c.title, s.id, s.full_name, s.phone, cp.joined_at;
