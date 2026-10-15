-- ==============================================================================
-- ArenaFitPro: Atualização de Taxas de Split e Planos (Starter 15% e Pro 8%)
-- Execute este script no SQL Editor do seu Supabase Dashboard (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Desativar temporariamente apenas os triggers de usuário (sem mexer em triggers de sistema)
ALTER TABLE public.professionals DISABLE TRIGGER USER;

-- 2. Atualizar o valor padrão da taxa de split para 15% na tabela de profissionais
ALTER TABLE public.professionals 
ALTER COLUMN platform_fee_percent SET DEFAULT 15;

-- 3. Atualizar profissionais já cadastrados no plano Starter para a nova taxa de 15%
UPDATE public.professionals 
SET platform_fee_percent = 15 
WHERE plan_tier = 'starter' OR plan_tier IS NULL;

-- 4. Atualizar profissionais no plano Pro para a taxa reduzida de 8%
UPDATE public.professionals 
SET platform_fee_percent = 8 
WHERE plan_tier = 'pro';

-- 5. Migrar qualquer cadastro residual que estivesse com 'studio' para 'pro' com taxa de 8%
UPDATE public.professionals 
SET plan_tier = 'pro', platform_fee_percent = 8 
WHERE plan_tier = 'studio';

-- 6. Reativar os triggers de usuário
ALTER TABLE public.professionals ENABLE TRIGGER USER;
