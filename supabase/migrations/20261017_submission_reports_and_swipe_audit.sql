-- ==============================================================================
-- Migration: 20261017_submission_reports_and_swipe_audit.sql
-- Descrição: Criação da tabela de denúncias de fotos (submission_reports) com RLS
--            multi-tenant para fiscalização em tempo real e modo Swipe no Dashboard.
-- ==============================================================================

-- 1. Criar tabela submission_reports se não existir
CREATE TABLE IF NOT EXISTS public.submission_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.student_submissions(id) ON DELETE CASCADE,
  reporter_student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'Denúncia de foto suspeita',
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_submission_report_per_student UNIQUE (submission_id, reporter_student_id)
);

-- 2. Índices para performance de joins e contagens no painel de auditoria
CREATE INDEX IF NOT EXISTS idx_submission_reports_sub_id ON public.submission_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_reports_reporter ON public.submission_reports(reporter_student_id);
CREATE INDEX IF NOT EXISTS idx_submission_reports_created ON public.submission_reports(created_at DESC);

-- 3. Habilitar RLS
ALTER TABLE public.submission_reports ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS Multi-Tenant:
-- A) Treinador (coach/professional) pode ver todas as denúncias de fotos das turmas que ele administra
DROP POLICY IF EXISTS "Coaches can view reports for their challenges" ON public.submission_reports;
CREATE POLICY "Coaches can view reports for their challenges"
  ON public.submission_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_submissions ss
      JOIN public.missions m ON m.id = ss.mission_id
      JOIN public.challenges c ON c.id = m.challenge_id
      WHERE ss.id = submission_reports.submission_id
        AND c.professional_id = auth.uid()
    )
  );

-- B) Alunos autenticados podem reportar fotos de submissões da mesma turma em que participam
DROP POLICY IF EXISTS "Students can insert reports for challenge submissions" ON public.submission_reports;
CREATE POLICY "Students can insert reports for challenge submissions"
  ON public.submission_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reporter_student_id
    AND EXISTS (
      SELECT 1 FROM public.student_submissions ss
      JOIN public.missions m ON m.id = ss.mission_id
      JOIN public.challenge_participants cp ON cp.challenge_id = m.challenge_id
      WHERE ss.id = submission_reports.submission_id
        AND cp.student_id = auth.uid()
    )
  );

-- C) Treinadores podem remover ou arquivar denúncias se desejado
DROP POLICY IF EXISTS "Coaches can delete reports for their challenges" ON public.submission_reports;
CREATE POLICY "Coaches can delete reports for their challenges"
  ON public.submission_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_submissions ss
      JOIN public.missions m ON m.id = ss.mission_id
      JOIN public.challenges c ON c.id = m.challenge_id
      WHERE ss.id = submission_reports.submission_id
        AND c.professional_id = auth.uid()
    )
  );
