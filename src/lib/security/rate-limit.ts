import { NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number; // Número máximo de requisições permitidas
  windowMs: number;    // Janela de tempo em milissegundos
}

// Configurações por tipo de rota / sensibilidade
export const RATE_LIMIT_TIERS: Record<string, RateLimitConfig> = {
  // Autenticação e MFA (Login, Magic Link, 2FA)
  auth: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 reqs / 1 min
  // Operações financeiras e Pix
  checkout: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 reqs / 1 min
  // Chamadas de Inteligência Artificial (Google Gemini)
  ai: { maxRequests: 15, windowMs: 60 * 1000 }, // 15 reqs / 1 min
  // Rotas de API públicas / Envio de Submissões
  submissions: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 reqs / 1 min
  // Padrão geral para endpoints de API
  default: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 reqs / 1 min
};

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

// Armazenamento em memória (LRU-like cache com garbage collection periódico)
const ipCache = new Map<string, TokenBucket>();

// Limpeza automática a cada 5 minutos para evitar vazamento de memória
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of ipCache.entries()) {
      if (now - bucket.lastRefill > 10 * 60 * 1000) {
        ipCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Obtém o IP do cliente a partir dos cabeçalhos da requisição
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Verifica se a requisição está dentro do limite de taxa permitido
 */
export function checkRateLimit(
  key: string,
  tier: keyof typeof RATE_LIMIT_TIERS = 'default'
): RateLimitResult {
  const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.default;
  const now = Date.now();
  const cacheKey = `${tier}:${key}`;

  let bucket = ipCache.get(cacheKey);

  if (!bucket) {
    bucket = { tokens: config.maxRequests - 1, lastRefill: now };
    ipCache.set(cacheKey, bucket);
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: Math.ceil((now + config.windowMs) / 1000),
    };
  }

  // Calcula quanto tempo passou e reabastece tokens proporcionalmente
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= config.windowMs) {
    bucket.tokens = config.maxRequests - 1;
    bucket.lastRefill = now;
    return {
      success: true,
      limit: config.maxRequests,
      remaining: bucket.tokens,
      reset: Math.ceil((now + config.windowMs) / 1000),
    };
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return {
      success: true,
      limit: config.maxRequests,
      remaining: bucket.tokens,
      reset: Math.ceil((bucket.lastRefill + config.windowMs) / 1000),
    };
  }

  // Limite excedido
  return {
    success: false,
    limit: config.maxRequests,
    remaining: 0,
    reset: Math.ceil((bucket.lastRefill + config.windowMs) / 1000),
  };
}

/**
 * Helper rápido para validar e retornar resposta 429 se exceder o limite
 */
export function enforceRateLimit(
  request: Request,
  tier: keyof typeof RATE_LIMIT_TIERS = 'default',
  customIdentifier?: string
): NextResponse | null {
  const ip = customIdentifier || getClientIp(request);
  const result = checkRateLimit(ip, tier);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Muitas requisições. Por favor, aguarde alguns instantes antes de tentar novamente.',
        retryAfter: result.reset,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.reset),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(result.reset),
        },
      }
    );
  }

  return null;
}
