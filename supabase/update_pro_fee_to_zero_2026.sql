-- ==============================================================================
-- ArenaFitPro: Migração para Taxa Zero no Plano Pro (0.00 / 0%)
-- Data: Outubro 2026
-- ==============================================================================

-- 1. Atualizar a taxa padrão e atual de todos os profissionais no plano 'pro' para 0.00 (0%)
UPDATE public.professionals
SET 
  platform_fee_percent = 0.00,
  updated_at = NOW()
WHERE 
  subscription_tier = 'pro';

-- 2. Garantir que profissionais no plano 'starter' estejam com 15.00 (15%)
UPDATE public.professionals
SET 
  platform_fee_percent = 15.00,
  updated_at = NOW()
WHERE 
  subscription_tier = 'starter' OR subscription_tier IS NULL;

-- 3. Atualizar a trigger de criação de novos profissionais para atribuir 0% para pro e 15% para starter
CREATE OR REPLACE FUNCTION public.handle_new_professional_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_tier = 'pro' THEN
    NEW.platform_fee_percent := 0.00;
  ELSE
    NEW.subscription_tier := 'starter';
    NEW.platform_fee_percent := 15.00;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Notificar conclusão
COMMENT ON COLUMN public.professionals.platform_fee_percent IS 'Taxa de intermediação da plataforma: 15% no Starter, 0% no Pro (Taxa Zero)';
