-- ==============================================================================
-- FASE 1: RETENÇÃO & RECOMPENSAS VARIÁVEIS (FREEZE SHIELD & MYSTERY BOX)
-- MatchPro SaaS Gamificado
-- ==============================================================================

-- 1. TABELA DE ESTADO GAMIFICADO DO ALUNO (FREEZE SHIELDS & CONTADORES)
CREATE TABLE IF NOT EXISTS public.student_gamification_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    freeze_shields_available INT NOT NULL DEFAULT 1, -- Inicia com 1 escudo de emergência
    freeze_shields_used INT NOT NULL DEFAULT 0,
    last_freeze_used_at TIMESTAMPTZ,
    current_streak INT NOT NULL DEFAULT 1,
    best_streak INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, challenge_id)
);

-- 2. TABELA DE RECOMPENSAS CONFIGURADAS NA MYSTERY BOX (PELO PERSONAL OU PADRÃO)
CREATE TABLE IF NOT EXISTS public.mystery_box_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE, -- Se NULL, recompensa global
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('points', 'freeze_shield', 'consultation', 'coupon', 'badge', 'custom')),
    reward_value TEXT, -- Ex: "50" para pontos, "1" para escudo, "CUPOMFIT20" para cupom
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    probability_weight INT NOT NULL DEFAULT 50, -- Peso para sorteio ponderado
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. HISTÓRICO DE ABERTURA DE MYSTERY BOX PELO ALUNO
CREATE TABLE IF NOT EXISTS public.student_mystery_box_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    week_number INT NOT NULL, -- Semana do desafio (1, 2, 3, 4)
    reward_id UUID REFERENCES public.mystery_box_rewards(id) ON DELETE SET NULL,
    reward_title TEXT NOT NULL,
    reward_type TEXT NOT NULL,
    reward_value TEXT,
    claimed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, challenge_id, week_number) -- Apenas 1 caixa aberta por semana
);

-- 4. LOG DE ATIVAÇÃO DE ESCUDOS (FREEZE LOGS)
CREATE TABLE IF NOT EXISTS public.freeze_shield_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    shield_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT,
    activated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. RLS (ROW LEVEL SECURITY)
ALTER TABLE public.student_gamification_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_box_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mystery_box_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freeze_shield_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura e Escrita
CREATE POLICY "Alunos e Treinadores podem ver o estado gamificado"
ON public.student_gamification_state FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Alunos podem atualizar seu próprio estado gamificado"
ON public.student_gamification_state FOR ALL
TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Todos podem ler as recompensas da Mystery Box"
ON public.mystery_box_rewards FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Treinadores podem gerenciar recompensas da Mystery Box"
ON public.mystery_box_rewards FOR ALL
TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.challenges c 
        WHERE c.id = challenge_id AND c.professional_id = auth.uid()
    )
);

CREATE POLICY "Alunos podem ver e registrar seus claims da Mystery Box"
ON public.student_mystery_box_claims FOR ALL
TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Alunos podem registrar logs de escudo"
ON public.freeze_shield_logs FOR ALL
TO authenticated USING (student_id = auth.uid());

-- Inserir algumas recompensas padrão caso a tabela esteja vazia
INSERT INTO public.mystery_box_rewards (title, description, reward_type, reward_value, rarity, probability_weight)
VALUES 
    ('+50 Pontos Extras', 'Injeção de 50 pontos diretos na tabela do ranking!', 'points', '50', 'common', 50),
    ('+100 Pontos de Ouro', 'Um bônus massivo de 100 pontos para colar no topo!', 'points', '100', 'rare', 25),
    ('Escudo de Emergência Extra', 'Garante 1 Freeze Shield extra para salvar sua semana!', 'freeze_shield', '1', 'rare', 20),
    ('Badge Lendário: "Muralha de Ferro"', 'Insígnia de prestígio supremo no seu perfil!', 'badge', 'wall_of_iron', 'epic', 10),
    ('Sessão 1-a-1 com o Treinador', 'Feedback personalizado de alinhamento com seu treinador!', 'consultation', 'call_1on1', 'legendary', 5)
ON CONFLICT DO NOTHING;
