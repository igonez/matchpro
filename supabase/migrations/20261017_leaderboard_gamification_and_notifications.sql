-- ==============================================================================
-- GAMIFICAÇÃO DO RANKING & SISTEMA DE NOTIFICAÇÕES MULTI-TENANT
-- ==============================================================================

-- 1. TABELA DE NOTIFICAÇÕES DO ALUNO (ESTRITAMENTE ISOLADA POR CHALLENGE_ID)
CREATE TABLE IF NOT EXISTS public.student_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('streak_risk', 'rank_change', 'feed_reaction', 'feed_comment', 'coach_announcement', 'reminder_20h')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de performance multi-tenant
CREATE INDEX IF NOT EXISTS idx_student_notifications_student 
ON public.student_notifications (student_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_notifications_challenge 
ON public.student_notifications (challenge_id, student_id);

-- RLS para Notificações
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aluno pode ver suas proprias notificacoes" ON public.student_notifications;
CREATE POLICY "Aluno pode ver suas proprias notificacoes"
ON public.student_notifications FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Qualquer autenticado pode inserir notificacao valida" ON public.student_notifications;
CREATE POLICY "Qualquer autenticado pode inserir notificacao valida"
ON public.student_notifications FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Aluno pode marcar suas notificacoes como lidas" ON public.student_notifications;
CREATE POLICY "Aluno pode marcar suas notificacoes como lidas"
ON public.student_notifications FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Aluno pode excluir suas notificacoes" ON public.student_notifications;
CREATE POLICY "Aluno pode excluir suas notificacoes"
ON public.student_notifications FOR DELETE
TO authenticated
USING (auth.uid() = student_id);


-- 2. TABELA DE HISTÓRICO DIÁRIO DE POSIÇÕES DO RANKING (LEADERBOARD HISTORY)
CREATE TABLE IF NOT EXISTS public.leaderboard_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  rank_position INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_challenge_daily_rank UNIQUE (challenge_id, student_id, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_history_challenge_date 
ON public.leaderboard_history (challenge_id, recorded_date DESC);

-- RLS para Histórico de Leaderboard
ALTER TABLE public.leaderboard_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos autenticados podem ver historico de leaderboard" ON public.leaderboard_history;
CREATE POLICY "Todos autenticados podem ver historico de leaderboard"
ON public.leaderboard_history FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Permitir gravacao de snapshot de ranking" ON public.leaderboard_history;
CREATE POLICY "Permitir gravacao de snapshot de ranking"
ON public.leaderboard_history FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao do snapshot diario" ON public.leaderboard_history;
CREATE POLICY "Permitir atualizacao do snapshot diario"
ON public.leaderboard_history FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
