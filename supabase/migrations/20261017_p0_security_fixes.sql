-- ==============================================================================
-- ARENAFITPRO: SPRINT 0 & SPRINT 1 SECURITY & MULTI-TENANT HARDENING
-- Arquivo: supabase/migrations/20261017_p0_security_fixes.sql
-- ==============================================================================

-- 1. CORREÇÃO DE RLS NA TABELA STUDENTS (VULNERABILIDADE P0 - CRÍTICA)
-- Remove a política pública permissiva que permitia adulteração irrestrita de alunos
DROP POLICY IF EXISTS "Professionals can insert or update students" ON public.students;
DROP POLICY IF EXISTS "Students can view all students in their challenge" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
DROP POLICY IF EXISTS "Students can insert own profile" ON public.students;
DROP POLICY IF EXISTS "Users can view own student profile" ON public.students;

-- 1.1 O aluno autenticado pode inserir seu próprio registro no cadastro
CREATE POLICY "Students can insert own profile" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 1.2 O aluno autenticado pode atualizar apenas o seu próprio perfil
CREATE POLICY "Students can update own profile" ON public.students
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 1.3 Leitura controlada: Aluno lê seu próprio perfil, colegas da mesma turma, ou treinador da turma
CREATE POLICY "Users can view relevant student profiles" ON public.students
  FOR SELECT TO authenticated
  USING (
    -- O próprio aluno
    auth.uid() = id
    OR
    -- O treinador que é dono de um desafio onde o aluno está matriculado
    EXISTS (
      SELECT 1 FROM public.challenge_participants cp
      JOIN public.challenges c ON c.id = cp.challenge_id
      WHERE cp.student_id = public.students.id
      AND c.professional_id = auth.uid()
    )
    OR
    -- Colegas matriculados no mesmo desafio (para feed social e ranking da turma)
    EXISTS (
      SELECT 1 FROM public.challenge_participants cp_me
      JOIN public.challenge_participants cp_peer ON cp_me.challenge_id = cp_peer.challenge_id
      WHERE cp_me.student_id = auth.uid()
      AND cp_peer.student_id = public.students.id
    )
  );

-- 2. BLINDAGEM DE SUBMISSÕES (PREVENÇÃO DE XP FRAUDULENTO DIRETO PELO CLIENT)
-- Alunos só podem inserir submissões com status 'pending'. 
-- Aprovações exigem validação do treinador ou rota segura de check-in autenticada no servidor.
DROP POLICY IF EXISTS "Students can insert submissions" ON public.student_submissions;
CREATE POLICY "Students can insert submissions" ON public.student_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND status = 'pending'
  );

-- 3. TABELA DE PROCESSAMENTO IDEMPOTENTE DE WEBHOOKS (ASAAS)
CREATE TABLE IF NOT EXISTS public.processed_webhooks (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages processed webhooks" ON public.processed_webhooks;
CREATE POLICY "Service role manages processed webhooks" ON public.processed_webhooks
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. TABELA DE SAQUES (WITHDRAWALS) E BLINDAGEM FINANCEIRA
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  pix_key TEXT NOT NULL,
  asaas_transfer_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  error_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Professionals view own withdrawals" ON public.withdrawals;
CREATE POLICY "Professionals view own withdrawals" ON public.withdrawals
  FOR SELECT TO authenticated
  USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Service role manages withdrawals" ON public.withdrawals;
CREATE POLICY "Service role manages withdrawals" ON public.withdrawals
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. BLINDAGEM DE VIEWS (SECURITY INVOKER)
-- Corrige at_risk_students_view se existir para respeitar RLS do chamador
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'at_risk_students_view' AND schemaname = 'public'
  ) THEN
    ALTER VIEW public.at_risk_students_view SET (security_invoker = true);
  END IF;
END $$;

-- 6. POLÍTICA DE STORAGE ISOLADA POR USUÁRIO PARA SUBMISSÕES
-- Cada aluno só pode fazer upload dentro de sua própria pasta no bucket 'submissions'
DROP POLICY IF EXISTS "Authenticated users can upload submission images" ON storage.objects;
DROP POLICY IF EXISTS "Users can only upload to own submission folder" ON storage.objects;

CREATE POLICY "Users can only upload to own submission folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
