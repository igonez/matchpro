/**
 * Sanitizador de entradas e strings do usuário
 * Prevenção de XSS (Cross-Site Scripting), Injeção de Tags e Caracteres de Controle Nulos
 */

/**
 * Remove tags HTML, scripts, iframes e URLs do tipo javascript:
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Substitui entidades HTML perigosas
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove esquemas javascript:, data:, vbscript:
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim();
}

/**
 * Remove qualquer tag HTML mantendo apenas texto simples legível
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Sanitiza números de CPF/CNPJ mantendo estritamente dígitos
 */
export function sanitizeDocument(doc: string): string {
  if (!doc) return '';
  return doc.replace(/\D/g, '').slice(0, 14);
}

/**
 * Sanitiza e valida formato de e-mail básico
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase().slice(0, 255);
}

/**
 * Sanitiza recursivamente objetos com múltiplos campos
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
