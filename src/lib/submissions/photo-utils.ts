/**
 * Valida se `photo_url` de `student_submissions` representa uma imagem renderizável
 * (rejeita null, vazio, marcadores como 'simple_click' e esquemas não-imagem).
 */
export function isValidSubmissionPhotoUrl(
  url: string | null | undefined
): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'simple_click') return false;

  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('blob:')) return true;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && trimmed.length > 1) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
