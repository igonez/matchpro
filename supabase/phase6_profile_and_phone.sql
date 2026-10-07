-- Adicionar colunas de contato e perfil para professionals
ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Garantir que students tenha a coluna phone
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS phone TEXT;
