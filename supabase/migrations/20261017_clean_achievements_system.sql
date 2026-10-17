-- ==============================================================================
-- Migration: Clean Merit-Based Achievements & Badges System (Substitui Box/Freeze)
-- Data: 2026-10-17
-- ==============================================================================

-- 1. Tabela de Conquistas do Sistema
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streak', 'workout', 'cardio', 'nutrition', 'ranking', 'points')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak_days', 'submission_count', 'workout_count', 'cardio_count', 'meal_count', 'points', 'top_rank')),
  requirement_value INT NOT NULL,
  points_reward INT NOT NULL DEFAULT 100,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Conquistas Desbloqueadas pelos Alunos
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, challenge_id, achievement_id)
);

-- 3. Habilitar RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Leitura pública de conquistas" ON public.achievements;
CREATE POLICY "Leitura pública de conquistas"
ON public.achievements FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Alunos e Treinadores visualizam conquistas dos alunos" ON public.student_achievements;
CREATE POLICY "Alunos e Treinadores visualizam conquistas dos alunos"
ON public.student_achievements FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.challenges
    WHERE challenges.id = student_achievements.challenge_id
      AND challenges.professional_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Aluno desbloqueia sua própria conquista" ON public.student_achievements;
CREATE POLICY "Aluno desbloqueia sua própria conquista"
ON public.student_achievements FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
);

-- 4. Índices de performance
CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_challenge ON public.student_achievements(challenge_id);
CREATE INDEX IF NOT EXISTS idx_achievements_order ON public.achievements(order_index);

-- 5. Seed das 10 Conquistas Oficiais Baseadas em Mérito
INSERT INTO public.achievements (id, title, description, icon, category, requirement_type, requirement_value, points_reward, order_index)
VALUES
  ('first_step', 'Primeiro Passo', 'Realizou o seu primeiro check-in comprovado na Arena.', '🎯', 'streak', 'submission_count', 1, 50, 1),
  ('streak_7', 'Semana de Ferro', 'Manteve 7 dias consecutivos de ofensiva sem interrupções.', '🔥', 'streak', 'streak_days', 7, 150, 2),
  ('streak_14', 'Constância de Elite', 'Completou 14 dias ininterruptos de disciplina e consistência.', '⚡', 'streak', 'streak_days', 14, 300, 3),
  ('streak_21', 'Hábito Consolidado', 'Alcançou 21 dias seguidos — seu estilo de vida foi transformado.', '💎', 'streak', 'streak_days', 21, 500, 4),
  ('streak_30', 'Lenda da Arena', 'Completou os 30 dias do desafio com disciplina exemplar.', '👑', 'streak', 'streak_days', 30, 1000, 5),
  ('workout_10', 'Máquina de Treino', 'Completou 10 sessões comprovadas de treino de força.', '🏋️', 'workout', 'workout_count', 10, 200, 6),
  ('cardio_10', 'Pulmão de Aço', 'Realizou 10 sessões de cardio com ritmo e foco.', '🏃', 'cardio', 'cardio_count', 10, 200, 7),
  ('nutrition_15', 'Nutrição Sagrada', 'Registrou 15 refeições saudáveis alinhadas ao seu objetivo.', '🥗', 'nutrition', 'meal_count', 15, 200, 8),
  ('podium_top3', 'Guerreiro do Pódio', 'Alcançou o TOP 3 no Ranking Geral da Turma.', '🥇', 'ranking', 'top_rank', 3, 400, 9),
  ('centurion', 'Centurião de XP', 'Acumulou mais de 1.000 pontos no leaderboard da turma.', '💯', 'points', 'points', 1000, 250, 10)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  points_reward = EXCLUDED.points_reward;
