import { supabaseAdmin } from '@/lib/supabase/admin';

export type SecurityEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'PRIVILEGE_ESCALATION_ATTEMPT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_API_ACCESS'
  | 'SUSPICIOUS_PAYLOAD'
  | 'ADMIN_TIER_CHANGED'
  | 'ADMIN_VIP_TOGGLED'
  | 'PAYMENT_STATUS_CHANGED'
  | 'WEBHOOK_SIGNATURE_MISMATCH'
  | 'SENSITIVE_DATA_ACCESSED';

export type SecuritySeverity = 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';

export interface SecurityEventData {
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string | null;
  userEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  resourcePath?: string | null;
  details?: Record<string, any>;
}

/**
 * Registra eventos de segurança em formato estruturado (SIEM/CloudWatch/Log Drain)
 * e persiste no banco de dados na tabela `security_audit_logs`.
 */
export async function logSecurityEvent(event: SecurityEventData): Promise<void> {
  const timestamp = new Date().toISOString();
  const logPayload = {
    ...event,
    timestamp,
    environment: process.env.NODE_ENV || 'development',
  };

  // 1. Saída estruturada em console para observabilidade (Vercel Logs, Sentry, Datadog)
  const logPrefix = `[SECURITY_AUDIT][${event.severity}][${event.eventType}]`;
  if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
    console.error(logPrefix, JSON.stringify(logPayload));
  } else if (event.severity === 'WARN') {
    console.warn(logPrefix, JSON.stringify(logPayload));
  } else {
    console.info(logPrefix, JSON.stringify(logPayload));
  }

  // 2. Persistência assíncrona no Supabase (não bloqueia a resposta da requisição)
  try {
    if (supabaseAdmin) {
      await supabaseAdmin.from('security_audit_logs').insert({
        event_type: event.eventType,
        severity: event.severity,
        user_id: event.userId || null,
        user_email: event.userEmail || null,
        ip_address: event.ipAddress || null,
        user_agent: event.userAgent || null,
        resource_path: event.resourcePath || null,
        details: event.details || {},
        created_at: timestamp,
      });
    }
  } catch (err) {
    // Falha de gravação de log nunca deve derrubar o fluxo da aplicação
    console.error('[SECURITY_AUDIT] Erro ao persistir log no Supabase:', err);
  }
}
