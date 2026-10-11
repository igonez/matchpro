-- ==============================================================================
-- Migration Consolidada: Criação de Pagamentos, Planos SaaS e Correções de Segurança
-- MatchPro / ArenaFitPro
-- Execução 100% autocontida, com garantia de todas as colunas necessárias
-- ==============================================================================

-- 1. GARANTIR COLUNAS EM PROFISSIONAIS
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'CPF',
ADD COLUMN IF NOT EXISTS document_number TEXT,
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_wallet_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_pix_key TEXT,
ADD COLUMN IF NOT EXISTS platform_fee_percent NUMERIC DEFAULT 18.00;

-- 2. GARANTIR COLUNAS EM CHALLENGE_PARTICIPANTS
ALTER TABLE public.challenge_participants
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';

-- 3. GARANTIR COLUNAS EM MISSIONS
ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS week_id UUID,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'treino',
ADD COLUMN IF NOT EXISTS requires_cooldown BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cooldown_hours INT DEFAULT 0;

-- 4. GARANTIR COLUNAS EM STUDENT_SUBMISSIONS
ALTER TABLE public.student_submissions
ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS caption TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS client_captured_at TIMESTAMPTZ DEFAULT now();

-- Preencher challenge_id retroativamente em student_submissions a partir de missions se estiver nulo
UPDATE public.student_submissions s
SET challenge_id = m.challenge_id
FROM public.missions m
WHERE s.mission_id = m.id AND s.challenge_id IS NULL;


-- 5. CRIAÇÃO DA TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  asaas_payment_id TEXT UNIQUE,
  billing_type TEXT DEFAULT 'PIX',
  gross_value NUMERIC(10, 2) NOT NULL,
  net_coach_value NUMERIC(10, 2) NOT NULL,
  fee_platform_value NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'PENDING',
  pix_code TEXT,
  pix_qr_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS Seguras na tabela payments
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Coaches can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Students can view their own payments" ON public.payments;

CREATE POLICY "Service role can manage payments"
ON public.payments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Coaches can view their own payments"
ON public.payments FOR SELECT
TO authenticated
USING (auth.uid() = professional_id);

CREATE POLICY "Students can view their own payments"
ON public.payments FOR SELECT
TO authenticated
USING (auth.uid() = student_id);


-- 6. CRIAÇÃO DA ESTRUTURA DE SQUADS (SE NÃO EXISTIR)
CREATE TABLE IF NOT EXISTS public.challenge_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color_theme TEXT DEFAULT 'emerald',
  motto TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES public.challenge_squads(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, challenge_id)
);

-- Views de compatibilidade para permitir consultas com 'squads' e 'submissions'
CREATE OR REPLACE VIEW public.squads AS 
SELECT * FROM public.challenge_squads;

CREATE OR REPLACE VIEW public.submissions AS 
SELECT * FROM public.student_submissions;

-- Habilitar RLS em challenge_squads e squad_members
ALTER TABLE public.challenge_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS Seguras em squad_members
DROP POLICY IF EXISTS "Squad Members - Gerenciar" ON public.squad_members;
DROP POLICY IF EXISTS "Squad Members - Visualizar" ON public.squad_members;
DROP POLICY IF EXISTS "Squad Members - Leitura Livre" ON public.squad_members;
DROP POLICY IF EXISTS "Squad Members - Leitura autenticada" ON public.squad_members;
DROP POLICY IF EXISTS "Squad Members - Gerenciar treinador ou proprio aluno" ON public.squad_members;

CREATE POLICY "Squad Members - Leitura autenticada"
ON public.squad_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Squad Members - Gerenciar treinador ou proprio aluno"
ON public.squad_members FOR ALL
TO authenticated
USING (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.challenges ch
    WHERE ch.id = squad_members.challenge_id AND ch.professional_id = auth.uid()
  )
)
WITH CHECK (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.challenges ch
    WHERE ch.id = squad_members.challenge_id AND ch.professional_id = auth.uid()
  )
);


-- 7. GATILHO ANTI-FRAUDE EM INSCRIÇÃO DE DESAFIOS PAGOS (CHALLENGE_PARTICIPANTS)
CREATE OR REPLACE FUNCTION public.check_participant_payment_integrity()
RETURNS TRIGGER AS $$
DECLARE
  v_price NUMERIC;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT price INTO v_price FROM public.challenges WHERE id = NEW.challenge_id;

  IF COALESCE(v_price, 0) > 0 AND NEW.payment_status = 'paid' THEN
    RAISE EXCEPTION 'Inscrições em desafios pagos devem ser confirmadas pelo gateway de pagamento.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_participant_payment_integrity ON public.challenge_participants;
CREATE TRIGGER trg_check_participant_payment_integrity
BEFORE INSERT OR UPDATE ON public.challenge_participants
FOR EACH ROW EXECUTE FUNCTION public.check_participant_payment_integrity();


-- 8. ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_payments_professional_id ON public.payments(professional_id);
CREATE INDEX IF NOT EXISTS idx_payments_challenge_id ON public.payments(challenge_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_student_submissions_challenge_status ON public.student_submissions (challenge_id, status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_student_active ON public.challenge_participants (student_id, challenge_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_missions_challenge_week ON public.missions (challenge_id, week_id);
