-- ==============================================================================
-- FEED INTERATIVO: COMENTÁRIOS NAS FOTOS & MURAL / CHAT DA TURMA (REALTIME)
-- ==============================================================================

-- 1. TABELA DE COMENTÁRIOS NAS FOTOS (SUBMISSION COMMENTS)
CREATE TABLE IF NOT EXISTS public.submission_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.student_submissions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL DEFAULT 'Aluno',
  user_avatar TEXT,
  user_role TEXT NOT NULL DEFAULT 'student',
  content TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_submission_comments_submission 
ON public.submission_comments (submission_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_submission_comments_user 
ON public.submission_comments (user_id);

-- RLS para Comentários
ALTER TABLE public.submission_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer autenticado pode ler comentarios" ON public.submission_comments;
CREATE POLICY "Qualquer autenticado pode ler comentarios"
ON public.submission_comments FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuario autenticado pode postar comentario" ON public.submission_comments;
CREATE POLICY "Usuario autenticado pode postar comentario"
ON public.submission_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Autor ou admin pode excluir comentario" ON public.submission_comments;
CREATE POLICY "Autor ou admin pode excluir comentario"
ON public.submission_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR auth.role() = 'service_role');


-- 2. TABELA DO MURAL / CHAT DA TURMA (CHALLENGE MESSAGES)
CREATE TABLE IF NOT EXISTS public.challenge_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL DEFAULT 'Participante',
  user_avatar TEXT,
  user_role TEXT NOT NULL DEFAULT 'student', -- 'student' | 'coach'
  content TEXT NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_challenge_messages_challenge 
ON public.challenge_messages (challenge_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_challenge_messages_user 
ON public.challenge_messages (user_id);

-- RLS para Mural da Turma
ALTER TABLE public.challenge_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer participante autenticado pode ler mensagens" ON public.challenge_messages;
CREATE POLICY "Qualquer participante autenticado pode ler mensagens"
ON public.challenge_messages FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuario autenticado pode postar mensagem na turma" ON public.challenge_messages;
CREATE POLICY "Usuario autenticado pode postar mensagem na turma"
ON public.challenge_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Autor pode excluir sua mensagem" ON public.challenge_messages;
CREATE POLICY "Autor pode excluir sua mensagem"
ON public.challenge_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR auth.role() = 'service_role');


-- 3. HABILITAR REALTIME NO POSTGRESQL (SUPABASE_REALTIME)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'challenge_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'submission_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.submission_comments;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Ignora se a publication supabase_realtime for gerenciada internamente pela infraestrutura
END $$;
