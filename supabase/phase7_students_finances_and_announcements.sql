-- ==============================================================================
-- Arena Fit Pro: Migração Fase 7 (Gestão de Alunos, Finanças & Permissões RLS)
-- Execute este script no SQL Editor do painel do Supabase
-- ==============================================================================

-- 1. GARANTIR COLUNA DE TELEFONE NA TABELA STUDENTS
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. GARANTIR COLUNAS DE STATUS DE PAGAMENTO NA TABELA CHALLENGE_PARTICIPANTS
ALTER TABLE public.challenge_participants 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'complimentary')),
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pix';

-- 3. PERMISSÕES DE RLS PARA MATRÍCULA MANUAL POR TREINADORES

-- 3.1 Permitir que treinadores autenticados cadastrem alunos na tabela students (balcão/manual)
DROP POLICY IF EXISTS "Professionals can insert or update students" ON public.students;
CREATE POLICY "Professionals can insert or update students" ON public.students
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3.2 Permitir que treinadores matriculem alunos em seus próprios desafios
DROP POLICY IF EXISTS "Professionals can insert participants in own challenges" ON public.challenge_participants;
CREATE POLICY "Professionals can insert participants in own challenges" ON public.challenge_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_participants.challenge_id
      AND c.professional_id = auth.uid()
    )
    OR auth.uid() = student_id
  );

-- 3.3 Permitir que treinadores atualizem status de participantes de seus desafios
DROP POLICY IF EXISTS "Professionals can update participants of own challenges" ON public.challenge_participants;
CREATE POLICY "Professionals can update participants of own challenges" ON public.challenge_participants
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_participants.challenge_id
      AND c.professional_id = auth.uid()
    )
  );

-- 3.4 Permitir que treinadores excluam participantes de seus desafios
DROP POLICY IF EXISTS "Professionals can delete participants from own challenges" ON public.challenge_participants;
CREATE POLICY "Professionals can delete participants from own challenges" ON public.challenge_participants
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_participants.challenge_id
      AND c.professional_id = auth.uid()
    )
  );

-- 3.5 Permitir que treinadores insiram registros iniciais no ranking (leaderboard_standings)
DROP POLICY IF EXISTS "Professionals can insert standings for own challenges" ON public.leaderboard_standings;
CREATE POLICY "Professionals can insert standings for own challenges" ON public.leaderboard_standings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = leaderboard_standings.challenge_id
      AND c.professional_id = auth.uid()
    )
    OR auth.uid() = student_id
  );

-- 4. TABELA DE AVISOS DO MURAL (CASO AINDA NÃO TENHA SIDO CRIADA)
CREATE TABLE IF NOT EXISTS public.challenge_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.challenge_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view announcements" ON public.challenge_announcements;
CREATE POLICY "Public view announcements" ON public.challenge_announcements
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Professionals manage announcements" ON public.challenge_announcements;
CREATE POLICY "Professionals manage announcements" ON public.challenge_announcements
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_announcements.challenge_id
      AND c.professional_id = auth.uid()
    )
  );

-- 5. VIEW DO RADAR DE RETENÇÃO (AT-RISK) 100% BLINDADA
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
