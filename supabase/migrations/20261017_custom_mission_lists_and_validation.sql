-- ==============================================================================
-- ARENAFITPRO: LISTAS DE MISSÕES TOTALMENTE PERSONALIZÁVEIS PELO PERSONAL
-- Suporte a Listas/Categorias Dinâmicas, Tipos de Comprovação Flexíveis e Limites
-- ==============================================================================

-- 1. TABELA DE LISTAS/TRILHAS DE MISSÕES (CHALLENGE MISSION LISTS)
CREATE TABLE IF NOT EXISTS public.challenge_mission_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '⚡',
  color TEXT DEFAULT 'zinc',
  validation_type TEXT DEFAULT 'photo' CHECK (validation_type IN ('photo', 'timer', 'simple_click', 'text')),
  daily_limit INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance em multi-tenancy
CREATE INDEX IF NOT EXISTS idx_mission_lists_challenge 
ON public.challenge_mission_lists (challenge_id, order_index ASC);

-- 2. HABILITAR RLS NA TABELA DE LISTAS DE MISSÕES
ALTER TABLE public.challenge_mission_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer autenticado pode visualizar listas de missoes" ON public.challenge_mission_lists;
CREATE POLICY "Qualquer autenticado pode visualizar listas de missoes"
ON public.challenge_mission_lists FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Profissional pode gerenciar listas de seus desafios" ON public.challenge_mission_lists;
CREATE POLICY "Profissional pode gerenciar listas de seus desafios"
ON public.challenge_mission_lists FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.challenges c
    WHERE c.id = challenge_mission_lists.challenge_id
    AND c.professional_id = auth.uid()
  )
);

-- 3. ADICIONAR COLUNAS EXTRAS NA TABELA DE MISSÕES
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES public.challenge_mission_lists(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS validation_type TEXT DEFAULT 'photo',
  ADD COLUMN IF NOT EXISTS daily_limit INTEGER DEFAULT 1;

-- 4. TORNAR PHOTO_URL OPCIONAL PARA SUBMISSÕES DE 1-CLIQUE OU TEXTO
ALTER TABLE public.student_submissions
  ALTER COLUMN photo_url DROP NOT NULL;

ALTER TABLE public.student_submissions
  ADD COLUMN IF NOT EXISTS text_response TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0;

-- 5. FUNÇÃO PARA CRIAR LISTAS PADRÃO (PRESETS) AUTOMATICAMENTE EM NOVOS DESAFIOS
CREATE OR REPLACE FUNCTION public.seed_default_mission_lists(p_challenge_id UUID)
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.challenge_mission_lists WHERE challenge_id = p_challenge_id) THEN
    RETURN;
  END IF;

  INSERT INTO public.challenge_mission_lists (challenge_id, name, key, icon, color, validation_type, daily_limit, order_index)
  VALUES 
    (p_challenge_id, 'Treinos', 'treino', '⚡', 'amber', 'timer', 1, 1),
    (p_challenge_id, 'Cardios', 'cardio', '🏃', 'cyan', 'timer', 1, 2),
    (p_challenge_id, 'Refeições', 'refeicao', '🥗', 'emerald', 'photo', 4, 3),
    (p_challenge_id, 'Hábitos & Água', 'habito', '💧', 'purple', 'simple_click', 0, 4);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
