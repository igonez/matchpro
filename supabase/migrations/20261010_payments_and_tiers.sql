-- Migration: Suporte a Multi-Tier SaaS (Planos) e Pagamentos/Split via Asaas
-- Data: 2026-10-10

-- 1. Atualização na tabela de profissionais para suporte a SaaS, Documentos e Subcontas Asaas
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'CPF' CHECK (document_type IN ('CPF', 'CNPJ')),
ADD COLUMN IF NOT EXISTS document_number TEXT,
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'starter' CHECK (plan_tier IN ('starter', 'pro', 'studio')),
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'past_due', 'canceled')),
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_wallet_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_pix_key TEXT,
ADD COLUMN IF NOT EXISTS platform_fee_percent NUMERIC DEFAULT 18.00;

-- 2. Tabela de Pagamentos e Transações (Marketplace & Split)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  asaas_payment_id TEXT UNIQUE,
  billing_type TEXT DEFAULT 'PIX' CHECK (billing_type IN ('PIX', 'CREDIT_CARD', 'BOLETO')),
  gross_value NUMERIC(10, 2) NOT NULL,
  net_coach_value NUMERIC(10, 2) NOT NULL,
  fee_platform_value NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RECEIVED', 'CONFIRMED', 'REFUNDED', 'OVERDUE')),
  pix_code TEXT,
  pix_qr_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_professional_id ON payments(professional_id);
CREATE INDEX IF NOT EXISTS idx_payments_challenge_id ON payments(challenge_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS:
-- Treinadores só podem ver os pagamentos dos seus próprios desafios
CREATE POLICY "Coaches can view their own payments"
ON payments FOR SELECT
USING (auth.uid() = professional_id);

-- Alunos podem ver os pagamentos realizados por eles
CREATE POLICY "Students can view their own payments"
ON payments FOR SELECT
USING (auth.uid() = student_id);

-- Service role / backend pode inserir e atualizar pagamentos via Webhook
CREATE POLICY "Service role can manage payments"
ON payments FOR ALL
USING (true)
WITH CHECK (true);
