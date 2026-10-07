-- ==============================================================================
-- ArenaPro: Atualização Estrutural (CRUD, Missões Segmentadas, Travas e Geolocalização)
-- Execute este script no SQL Editor do seu Supabase Dashboard
-- ==============================================================================

-- 1. Campos extras na tabela de missões para controle de cooldown e bônus
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS requires_cooldown boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cooldown_hours integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS is_bonus boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- 2. Campos extras na tabela de submissões para geolocalização e carimbo horário real
ALTER TABLE public.student_submissions 
ADD COLUMN IF NOT EXISTS latitude numeric(10, 7),
ADD COLUMN IF NOT EXISTS longitude numeric(10, 7),
ADD COLUMN IF NOT EXISTS location_name text,
ADD COLUMN IF NOT EXISTS client_captured_at timestamptz DEFAULT now();

-- 3. Tabela de Avisos Oficiais do Desafio (para suporte a CRUD completo)
CREATE TABLE IF NOT EXISTS public.challenge_announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.challenge_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view announcements" ON public.challenge_announcements;
CREATE POLICY "Public view announcements" ON public.challenge_announcements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Professionals manage announcements" ON public.challenge_announcements;
CREATE POLICY "Professionals manage announcements" ON public.challenge_announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_announcements.challenge_id
      AND c.professional_id = auth.uid()
    )
  );

-- 4. Políticas completas de DELETE e UPDATE para Missões, Materiais, Mystery Boxes e Parceiros
-- Garantir que o criador do desafio possa atualizar e excluir tudo sem restrições

DROP POLICY IF EXISTS "Professionals can manage missions of their challenges" ON public.missions;
CREATE POLICY "Professionals can manage missions of their challenges" ON public.missions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.challenges
      WHERE challenges.id = missions.challenge_id
      AND challenges.professional_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Professionals manage challenge_materials" ON public.challenge_materials;
CREATE POLICY "Professionals manage challenge_materials" ON public.challenge_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_materials.challenge_id
      AND c.professional_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Professionals manage challenge_sponsors" ON public.challenge_sponsors;
CREATE POLICY "Professionals manage challenge_sponsors" ON public.challenge_sponsors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_sponsors.challenge_id
      AND c.professional_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Professionals manage mystery_box_rewards" ON public.mystery_box_rewards;
CREATE POLICY "Professionals manage mystery_box_rewards" ON public.mystery_box_rewards
  FOR ALL USING (
    challenge_id IS NULL OR EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = mystery_box_rewards.challenge_id
      AND c.professional_id = auth.uid()
    )
  );
