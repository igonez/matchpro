-- ==============================================================================
-- ARENAFITPRO: RESET DIÁRIO CONFIGURÁVEL EM MISSÕES E BLOCOS (HÁBITOS & OUTROS)
-- Suporte a metas diárias que resetam às 00:00 e pontuam 7 vezes por semana
-- ==============================================================================

-- 1. Adicionar coluna is_daily_reset na tabela de missões
ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS is_daily_reset BOOLEAN DEFAULT false;

-- 2. Adicionar coluna is_daily_reset na tabela de listas/blocos de missões
ALTER TABLE public.challenge_mission_lists
ADD COLUMN IF NOT EXISTS is_daily_reset BOOLEAN DEFAULT false;

-- 3. Atualizar retroativamente todas as refeições para terem reset diário ativo por padrão
UPDATE public.missions
SET is_daily_reset = true,
    target_frequency = COALESCE(target_frequency, 7),
    daily_limit = 1
WHERE category = 'refeicao';

-- 4. Índice para agilizar consultas de missões diárias da turma
CREATE INDEX IF NOT EXISTS idx_missions_daily_reset
ON public.missions (challenge_id, is_daily_reset);
