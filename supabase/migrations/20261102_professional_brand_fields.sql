-- Marca / Nome de escolha e Logo do Personal para os cards de Ranking
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS brand_name text,
  ADD COLUMN IF NOT EXISTS brand_logo_url text;
