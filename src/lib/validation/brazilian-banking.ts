/**
 * Utilitários de validação e formatação bancária brasileira
 * Suporta CPF, CNPJ e Chaves Pix (CPF, CNPJ, E-mail, Telefone, Chave Aleatória EVP)
 */

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP' | 'UNKNOWN';

/**
 * Remove todos os caracteres não numéricos
 */
export function cleanDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/**
 * Valida CPF utilizando o algoritmo oficial de dígitos verificadores (Módulo 11)
 */
export function validateCPF(cpf: string): boolean {
  const digits = cleanDigits(cpf);

  if (digits.length !== 11) return false;

  // Rejeita sequências de números iguais como 00000000000, 11111111111...
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  let digit1 = rev === 10 || rev === 11 ? 0 : rev;
  if (digit1 !== parseInt(digits.charAt(9), 10)) return false;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  let digit2 = rev === 10 || rev === 11 ? 0 : rev;
  if (digit2 !== parseInt(digits.charAt(10), 10)) return false;

  return true;
}

/**
 * Valida CNPJ utilizando o algoritmo oficial de dígitos verificadores
 */
export function validateCNPJ(cnpj: string): boolean {
  const digits = cleanDigits(cnpj);

  if (digits.length !== 14) return false;

  // Rejeita sequências de números iguais
  if (/^(\d)\1{13}$/.test(digits)) return false;

  // Primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits.charAt(i), 10) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(digits.charAt(12), 10)) return false;

  // Segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits.charAt(i), 10) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(digits.charAt(13), 10)) return false;

  return true;
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Formata CNPJ: 00.000.000/0001-00
 */
export function formatCNPJ(value: string): string {
  const digits = cleanDigits(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Formata telefone brasileiro: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(value: string): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Identifica o tipo de uma Chave Pix
 */
export function detectPixKeyType(key: string): PixKeyType {
  const trimmed = (key || '').trim();
  const digits = cleanDigits(trimmed);

  if (!trimmed) return 'UNKNOWN';

  // E-mail
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'EMAIL';
  }

  // Chave Aleatória (EVP) formato UUID: 123e4567-e89b-12d3-a456-426614174000
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return 'EVP';
  }

  // CPF (11 dígitos)
  if (digits.length === 11 && !trimmed.startsWith('+55') && !trimmed.includes('(')) {
    // Se for 11 dígitos, pode ser CPF ou celular sem DDD + 9 dígitos
    // Se o usuário digitou pontos/traços de CPF, é CPF
    if (trimmed.includes('.') || trimmed.includes('-')) {
      return 'CPF';
    }
    // Se for válido como CPF, prioriza CPF
    if (validateCPF(digits)) {
      return 'CPF';
    }
    return 'PHONE';
  }

  // CNPJ (14 dígitos)
  if (digits.length === 14) {
    return 'CNPJ';
  }

  // Telefone celular (10 ou 11 dígitos, ou iniciando com +55)
  if (
    trimmed.startsWith('+55') ||
    (digits.length >= 10 && digits.length <= 11)
  ) {
    return 'PHONE';
  }

  return 'UNKNOWN';
}

export interface PixValidationResult {
  isValid: boolean;
  type: PixKeyType;
  error?: string;
  formatted: string;
}

/**
 * Validação rigorosa de Chave Pix com detecção automática
 */
export function validatePixKey(key: string): PixValidationResult {
  const trimmed = (key || '').trim();
  if (!trimmed) {
    return { isValid: false, type: 'UNKNOWN', error: 'Informe a chave Pix.', formatted: '' };
  }

  const type = detectPixKeyType(trimmed);

  switch (type) {
    case 'CPF': {
      const digits = cleanDigits(trimmed);
      if (!validateCPF(digits)) {
        return { isValid: false, type: 'CPF', error: 'CPF inválido (dígitos verificadores incorretos).', formatted: trimmed };
      }
      return { isValid: true, type: 'CPF', formatted: formatCPF(digits) };
    }

    case 'CNPJ': {
      const digits = cleanDigits(trimmed);
      if (!validateCNPJ(digits)) {
        return { isValid: false, type: 'CNPJ', error: 'CNPJ inválido (dígitos verificadores incorretos).', formatted: trimmed };
      }
      return { isValid: true, type: 'CNPJ', formatted: formatCNPJ(digits) };
    }

    case 'EMAIL': {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(trimmed)) {
        return { isValid: false, type: 'EMAIL', error: 'Formato de e-mail inválido.', formatted: trimmed };
      }
      return { isValid: true, type: 'EMAIL', formatted: trimmed.toLowerCase() };
    }

    case 'PHONE': {
      const digits = cleanDigits(trimmed);
      // Celular no Brasil tem DDD (2 dígitos) + 9 dígitos = 11 dígitos
      if (digits.length !== 11) {
        return { isValid: false, type: 'PHONE', error: 'Telefone Pix deve ter DDD + 9 dígitos (ex: (11) 98765-4321).', formatted: trimmed };
      }
      return { isValid: true, type: 'PHONE', formatted: formatPhone(digits) };
    }

    case 'EVP': {
      return { isValid: true, type: 'EVP', formatted: trimmed.toLowerCase() };
    }

    default:
      return {
        isValid: false,
        type: 'UNKNOWN',
        error: 'Chave Pix não reconhecida. Use CPF, CNPJ, E-mail, Celular ou Chave Aleatória.',
        formatted: trimmed,
      };
  }
}
