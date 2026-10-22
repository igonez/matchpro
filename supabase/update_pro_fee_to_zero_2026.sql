-- ==============================================================================
-- ArenaFitPro: Atualização de Taxas de Split e Planos (Starter 15% e Pro 0% Taxa Zero)
-- Execute este script no SQL Editor do seu Supabase Dashboard (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Desativar temporariamente os triggers de usuário para evitar erros de auditoria/sync
ALTER TABLE public.professionals DISABLE TRIGGER USER;

-- 2. Garantir o valor padrão da taxa de split para 15% (Starter) para novos cadastros
ALTER TABLE public.professionals 
ALTER COLUMN platform_fee_percent SET DEFAULT 15;

-- 3. Atualizar profissionais no plano Starter para 15%
UPDATE public.professionals 
SET platform_fee_percent = 15 
WHERE plan_tier = 'starter' OR plan_tier IS NULL;

-- 4. Atualizar profissionais no plano Pro para Taxa Zero (0%)
UPDATE public.professionals 
SET platform_fee_percent = 0 
WHERE plan_tier = 'pro';

-- 5. Migrar qualquer cadastro residual de 'studio' para 'pro' com Taxa Zero (0%)
UPDATE public.professionals 
SET plan_tier = 'pro', platform_fee_percent = 0 
WHERE plan_tier = 'studio';

-- 6. Reativar os triggers de usuário
ALTER TABLE public.professionals ENABLE TRIGGER USER;
