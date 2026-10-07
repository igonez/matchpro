-- ==============================================================================
-- ArenaPro: Atualização de Schema (Duração do Treino no Schema Cache)
-- Execute este script no SQL Editor do Supabase se desejar que a coluna
-- 'duration_seconds' fique 100% nativa na tabela student_submissions
-- ==============================================================================

ALTER TABLE public.student_submissions 
ADD COLUMN IF NOT EXISTS duration_seconds integer,
ADD COLUMN IF NOT EXISTS started_at timestamptz;

-- Recarrega o cache do PostgREST para o schema atualizar imediatamente
NOTIFY pgrst, 'reload schema';
