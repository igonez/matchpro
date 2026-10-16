-- ==============================================================================
-- Migration: Correções da Auditoria Arquitetural Completa (P0 / P1)
-- Data: 2026-10-16
-- ==============================================================================

-- 1. Ajustar default da taxa de plataforma para 15.00% (Plano Starter)
ALTER TABLE public.professionals 
ALTER COLUMN platform_fee_percent SET DEFAULT 15.00;

-- 2. Adicionar coluna protegida para API Key da subconta Asaas (usada apenas via service_role)
ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS asaas_subaccount_api_key TEXT;

-- 3. Criar tabela de Saques / Transferências Pix (Withdrawals Ledger)
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  pix_key TEXT NOT NULL,
  asaas_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Coaches view own withdrawals" ON public.withdrawals;

CREATE POLICY "Service role manages withdrawals"
ON public.withdrawals FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Coaches view own withdrawals"
ON public.withdrawals FOR SELECT
TO authenticated
USING (auth.uid() = professional_id);

CREATE INDEX IF NOT EXISTS idx_withdrawals_professional_id ON public.withdrawals(professional_id);

-- 4. Atualizar Trigger de Integridade de Pagamento em challenge_participants
-- Permite service_role OU o próprio Personal Trainer dono do desafio aprovar/isentar manualmente seu aluno
CREATE OR REPLACE FUNCTION public.check_participant_payment_integrity()
RETURNS TRIGGER AS $$
DECLARE
  v_price NUMERIC;
  v_prof_id UUID;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT price, professional_id INTO v_price, v_prof_id
  FROM public.challenges
  WHERE id = NEW.challenge_id;

  -- Se quem está executando a ação é o próprio treinador dono da turma, permitir!
  IF auth.uid() IS NOT NULL AND auth.uid() = v_prof_id THEN
    RETURN NEW;
  END IF;

  -- Caso contrário (aluno tentando se auto-inserir ou atualizar como pago em desafio pago): bloquear
  IF COALESCE(v_price, 0) > 0 AND NEW.payment_status IN ('paid', 'complimentary') THEN
    RAISE EXCEPTION 'Inscrições em desafios pagos exigem confirmação pelo webhook do Asaas ou liberação pelo treinador.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_participant_payment_integrity ON public.challenge_participants;
CREATE TRIGGER trg_check_participant_payment_integrity
BEFORE INSERT OR UPDATE ON public.challenge_participants
FOR EACH ROW EXECUTE FUNCTION public.check_participant_payment_integrity();

-- 5. Blindar Trigger de Limite de Desafios Ativos também no UPDATE de is_active
CREATE OR REPLACE FUNCTION public.enforce_challenge_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_tier TEXT;
  v_active_count INT;
  v_max_allowed INT;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Só valida quando o desafio estiver sendo criado ou atualizado como ativo
  IF COALESCE(NEW.is_active, true) = true THEN
    SELECT COALESCE(plan_tier, 'starter') INTO v_plan_tier
    FROM public.professionals
    WHERE id = NEW.professional_id;

    IF v_plan_tier = 'starter' THEN
      v_max_allowed := 1;
    ELSIF v_plan_tier = 'pro' THEN
      v_max_allowed := 5;
    ELSE
      v_max_allowed := 9999;
    END IF;

    SELECT COUNT(*) INTO v_active_count
    FROM public.challenges
    WHERE professional_id = NEW.professional_id
      AND is_active = true
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_active_count >= v_max_allowed THEN
      RAISE EXCEPTION 'Limite de desafios ativos atingido para o plano % (máx: %). Faça upgrade na Central Financeira.', UPPER(v_plan_tier), v_max_allowed;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_challenge_limits ON public.challenges;
CREATE TRIGGER trg_enforce_challenge_limits
BEFORE INSERT OR UPDATE OF is_active ON public.challenges
FOR EACH ROW EXECUTE FUNCTION public.enforce_challenge_plan_limits();
