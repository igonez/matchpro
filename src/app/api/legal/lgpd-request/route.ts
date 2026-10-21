import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { sanitizeString, sanitizeEmail, sanitizeDocument } from '@/lib/security/sanitize';
import { logSecurityEvent } from '@/lib/security/audit';
import { createClient } from '@/lib/supabase/server';

const lgpdRequestSchema = z.object({
  name: z.string().min(3, 'Nome muito curto.').max(120, 'Nome muito longo.').transform(sanitizeString),
  email: z.string().email('E-mail inválido.').transform(sanitizeEmail),
  cpf: z.string().optional().transform((val) => (val ? sanitizeDocument(val) : undefined)),
  userType: z.enum(['student', 'coach', 'visitor'], {
    message: 'Selecione o seu perfil na plataforma.',
  }),
  requestType: z.enum([
    'access',
    'correction',
    'deletion',
    'anonymization',
    'portability',
    'revocation',
    'other',
  ], {
    message: 'Selecione o tipo de solicitação LGPD.',
  }),
  details: z.string().min(10, 'Detalhes devem conter ao menos 10 caracteres.').max(2000, 'Detalhes excedem 2000 caracteres.').transform(sanitizeString),
  confirmedIdentity: z.boolean().refine((val) => val === true, {
    message: 'É necessário declarar a titularidade dos dados.',
  }),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting estrito (prevenção contra DoS e abuso do canal do DPO)
    const rateLimitResponse = enforceRateLimit(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const rawBody = await request.json();

    // 2. Validação estrita
    const parseResult = lgpdRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      await logSecurityEvent({
        eventType: 'SUSPICIOUS_PAYLOAD',
        severity: 'WARN',
        resourcePath: '/api/legal/lgpd-request',
        details: { issues: parseResult.error.issues },
      });
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parseResult.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const { name, email, cpf, userType, requestType, details } = parseResult.data;

    // 3. Geração de Protocolo de Atendimento LGPD
    const protocolNumber = `LGPD-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Registro no log de auditoria
    await logSecurityEvent({
      eventType: 'SENSITIVE_DATA_ACCESSED',
      severity: 'INFO',
      resourcePath: '/api/legal/lgpd-request',
      details: {
        protocol: protocolNumber,
        requestType,
        userType,
        emailMasked: email.replace(/(?<=.{2}).(?=[^@]*?@)/g, '*'),
      },
    });

    // 5. Tenta persistir no Supabase (se a tabela de auditoria ou solicitações existir)
    try {
      const supabase = await createClient();
      await supabase.from('audit_logs').insert({
        action: 'LGPD_DATA_SUBJECT_REQUEST',
        table_name: 'lgpd_requests',
        record_id: protocolNumber,
        new_data: {
          protocol: protocolNumber,
          name,
          email,
          cpf,
          userType,
          requestType,
          details,
          status: 'PENDING_DPO_REVIEW',
          submittedAt: new Date().toISOString(),
        },
      });
    } catch {
      // Falha não-bloqueante na tabela
    }

    return NextResponse.json({
      success: true,
      protocol: protocolNumber,
      message: 'Sua solicitação de titularidade de dados foi protocolada com sucesso.',
      legalDeadlineDays: 15, // Art. 19, II LGPD
      dpoEmail: 'dpo@arenafitpro.com.br',
    });
  } catch (error) {
    console.error('[LGPD Request API Error]:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar solicitação de titularidade de dados.' },
      { status: 500 }
    );
  }
}
