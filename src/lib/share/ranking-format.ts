export interface PublicRankingEntry {
  rank: number;
  name: string;
  initials: string;
  points: number;
}

export interface PublicRankingSharer {
  rank: number;
  name: string;
  initials: string;
  points: number;
  percentile: number | null;
}

export interface PublicRankingSnapshot {
  v: 1;
  challengeId: string;
  challengeTitle: string;
  totalParticipants: number;
  top: PublicRankingEntry[];
  sharer?: PublicRankingSharer;
  generatedAt: string;
}

const PREPOSITIONS = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);

/**
 * Converte nome completo em formato público LGPD ("Maria Fernanda Souza" -> "Maria S.")
 * e trunca com reticências se ultrapassar maxLen.
 */
export function formatPublicName(fullName?: string | null, maxLen = 18): string {
  const cleaned = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'Atleta';

  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return truncateWithEllipsis(capitalizeWord(parts[0]), maxLen);
  }

  const firstName = capitalizeWord(parts[0]);
  const meaningfulTail = parts.slice(1).filter((p) => !PREPOSITIONS.has(p.toLowerCase()));
  const lastWord = meaningfulTail.length > 0 ? meaningfulTail[meaningfulTail.length - 1] : parts[parts.length - 1];
  const lastInitial = lastWord ? `${lastWord[0].toUpperCase()}.` : '';

  const formatted = lastInitial ? `${firstName} ${lastInitial}` : firstName;
  if (formatted.length <= maxLen) return formatted;

  // Se o primeiro nome for muito longo, trunca o primeiro nome preservando a inicial do sobrenome
  const maxFirst = Math.max(3, maxLen - (lastInitial ? lastInitial.length + 2 : 1));
  return `${firstName.slice(0, maxFirst)}…${lastInitial ? ` ${lastInitial}` : ''}`;
}

/**
 * Trunca um nome de exibição para os cards visuais sem quebrar layout
 */
export function formatCardDisplayName(fullName?: string | null, maxLen = 18): string {
  const cleaned = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'Atleta';
  if (cleaned.length <= maxLen) return cleaned;
  // Tenta usar Nome + Inicial antes de cortar seco
  const abbreviated = formatPublicName(cleaned, maxLen);
  return abbreviated.length <= maxLen ? abbreviated : truncateWithEllipsis(cleaned, maxLen);
}

/**
 * Extrai até 2 iniciais do nome ("Maria Fernanda Souza" -> "MS")
 */
export function getInitials(fullName?: string | null): string {
  const cleaned = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'AF';
  const parts = cleaned.split(' ').filter((p) => !PREPOSITIONS.has(p.toLowerCase()));
  if (parts.length === 0) return cleaned.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Calcula o percentil ("Top X%") somente quando houver pelo menos 20 participantes.
 * Em grupos menores (< 20), retorna null para evitar mensagens estranhas.
 */
export function computeTopPercentile(rank?: number | null, totalParticipants?: number | null): number | null {
  if (!rank || !totalParticipants || rank <= 0 || totalParticipants < 20) {
    return null;
  }
  const pct = Math.ceil((rank / totalParticipants) * 100);
  return Math.max(1, Math.min(100, pct));
}

/**
 * Formata o destaque principal de posição: "3º de 42"
 */
export function formatRankOfTotal(rank?: number | null, totalParticipants?: number | null): string {
  const safeTotal = Math.max(0, Number(totalParticipants || 0));
  if (!rank || rank <= 0) {
    return safeTotal > 0 ? `${safeTotal} atletas` : 'Sem classificação';
  }
  return `${rank}º de ${Math.max(rank, safeTotal)}`;
}

/**
 * Trunca texto genérico com reticências
 */
export function truncateWithEllipsis(text?: string | null, maxLen = 28): string {
  const cleaned = (text || '').trim();
  if (!cleaned) return '';
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, Math.max(1, maxLen - 1)).trimEnd()}…`;
}

function capitalizeWord(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}
