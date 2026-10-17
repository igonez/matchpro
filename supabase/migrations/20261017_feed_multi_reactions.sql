-- ==============================================================================
-- FEED SOCIAL INTERATIVO: MULTI-REAÇÕES (EMOJIS) & ENGAJAMENTO
-- Permite reações como Fogo (🔥), Força/Monstro (💪), Palmas (👏) e Coração (❤️)
-- ==============================================================================

-- 1. Garantir que a tabela submission_likes exista com estrutura completa
CREATE TABLE IF NOT EXISTS public.submission_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.student_submissions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'fire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Garantir coluna reaction_type caso a tabela já tenha sido criada anteriormente
ALTER TABLE public.submission_likes 
  ADD COLUMN IF NOT EXISTS reaction_type TEXT NOT NULL DEFAULT 'fire';

-- 3. Adicionar constraint de tipos de reações válidas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_reaction_type'
  ) THEN
    ALTER TABLE public.submission_likes 
      ADD CONSTRAINT check_valid_reaction_type 
      CHECK (reaction_type IN ('fire', 'muscle', 'clap', 'heart'));
  END IF;
END $$;

-- 4. Índice único para evitar reações duplicadas do mesmo usuário na mesma foto
CREATE UNIQUE INDEX IF NOT EXISTS idx_submission_likes_user_post 
ON public.submission_likes (submission_id, student_id);

CREATE INDEX IF NOT EXISTS idx_submission_likes_submission_reaction 
ON public.submission_likes (submission_id, reaction_type);

-- 5. Row Level Security
ALTER TABLE public.submission_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos autenticados podem ver reacoes" ON public.submission_likes;
CREATE POLICY "Todos autenticados podem ver reacoes"
ON public.submission_likes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados podem reagir" ON public.submission_likes;
CREATE POLICY "Usuarios autenticados podem reagir"
ON public.submission_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Usuarios autenticados podem atualizar sua reacao" ON public.submission_likes;
CREATE POLICY "Usuarios autenticados podem atualizar sua reacao"
ON public.submission_likes FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Usuarios autenticados podem remover sua reacao" ON public.submission_likes;
CREATE POLICY "Usuarios autenticados podem remover sua reacao"
ON public.submission_likes FOR DELETE
TO authenticated
USING (auth.uid() = student_id);
