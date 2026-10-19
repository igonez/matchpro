import { z } from 'zod';
import { sanitizeString, sanitizeDocument, sanitizeEmail } from './sanitize';

// Schema para validação de UUID v4
export const uuidSchema = z.string().uuid({ message: 'Identificador UUID inválido.' });

// Schema para validação de CPF (11 dígitos)
export const cpfSchema = z
  .string()
  .transform((val) => sanitizeDocument(val))
  .refine((val) => val.length === 11, {
    message: 'CPF deve conter exatamente 11 dígitos numéricos.',
  });

// Schema para validação e higienização de E-mail
export const emailSchema = z
  .string()
  .email({ message: 'Endereço de e-mail inválido.' })
  .transform((val) => sanitizeEmail(val));

// Schema para texto seguro (prevenção de injeção e XSS)
export const safeTextSchema = (maxLength = 255) =>
  z
    .string()
    .max(maxLength, { message: `Texto não pode exceder ${maxLength} caracteres.` })
    .transform((val) => sanitizeString(val));

// Schema para valores monetários positivos
export const positiveMoneySchema = z
  .number({ message: 'Valor deve ser numérico.' })
  .positive({ message: 'Valor deve ser maior que zero.' })
  .max(1000000, { message: 'Valor excede o limite máximo permitido.' });

// Schema para payload de criação de Pix / Checkout
export const checkoutPixSchema = z.object({
  challengeId: uuidSchema,
  studentName: safeTextSchema(120).optional(),
  studentEmail: emailSchema.optional(),
  studentCpf: z.string().transform(sanitizeDocument).optional(),
});

// Schema para payload de requisição para IA (Gemini)
export const aiPromptSchema = z.object({
  prompt: z
    .string()
    .min(3, { message: 'Prompt muito curto.' })
    .max(4000, { message: 'Prompt excede o limite de 4000 caracteres.' })
    .transform(sanitizeString),
  context: z.record(z.string(), z.any()).optional(),
});
