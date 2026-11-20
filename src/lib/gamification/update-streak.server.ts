import { supabaseAdmin } from '@/lib/supabase/admin';

const SAO_PAULO_TZ = 'America/Sao_Paulo';

const saoPauloDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SAO_PAULO_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function toSaoPauloDateKey(date: Date): string {
  return saoPauloDateFormatter.format(date);
}

function prevDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

/**
 * Recalcula a ofensiva (current_streak / best_streak) de um aluno em um desafio
 * com base nas datas civis (America/Sao_Paulo) das submissões 'approved'.
 * Usa select('id, best_streak') -> update/insert sem onConflict nomeado.
 */
export async function recalculateStudentStreak(
  studentId: string,
  challengeId: string
): Promise<{ currentStreak: number; bestStreak: number }> {
  if (!studentId || !challengeId) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const { data: approvedSubs, error: subsError } = await supabaseAdmin
    .from('student_submissions')
    .select('submitted_at')
    .eq('student_id', studentId)
    .eq('challenge_id', challengeId)
    .eq('status', 'approved');

  if (subsError) {
    console.error('[recalculateStudentStreak] Erro ao buscar submissões:', subsError);
    throw subsError;
  }

  const uniqueDates = new Set<string>();
  for (const row of approvedSubs ?? []) {
    if (!row?.submitted_at) continue;
    const dt = new Date(row.submitted_at);
    if (!Number.isNaN(dt.getTime())) {
      uniqueDates.add(toSaoPauloDateKey(dt));
    }
  }

  const todayKey = toSaoPauloDateKey(new Date());
  const yesterdayKey = prevDateKey(todayKey);

  let cursor: string | null = uniqueDates.has(todayKey)
    ? todayKey
    : uniqueDates.has(yesterdayKey)
    ? yesterdayKey
    : null;

  let currentStreak = 0;
  while (cursor && uniqueDates.has(cursor)) {
    currentStreak += 1;
    cursor = prevDateKey(cursor);
  }

  const { data: existing, error: selectError } = await supabaseAdmin
    .from('student_gamification_state')
    .select('id, best_streak')
    .eq('student_id', studentId)
    .eq('challenge_id', challengeId)
    .limit(1)
    .maybeSingle();

  if (selectError) {
    console.error('[recalculateStudentStreak] Erro ao ler gamificação:', selectError);
    throw selectError;
  }

  const bestStreak = Math.max(existing?.best_streak ?? 0, currentStreak);
  const nowIso = new Date().toISOString();

  if (existing?.id) {
    const { error: updateError } = await supabaseAdmin
      .from('student_gamification_state')
      .update({
        current_streak: currentStreak,
        best_streak: bestStreak,
        updated_at: nowIso,
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error('[recalculateStudentStreak] Erro ao atualizar gamificação:', updateError);
      throw updateError;
    }
  } else if (currentStreak > 0) {
    const { error: insertError } = await supabaseAdmin
      .from('student_gamification_state')
      .insert({
        student_id: studentId,
        challenge_id: challengeId,
        current_streak: currentStreak,
        best_streak: bestStreak,
        updated_at: nowIso,
      });

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: raced } = await supabaseAdmin
          .from('student_gamification_state')
          .select('id, best_streak')
          .eq('student_id', studentId)
          .eq('challenge_id', challengeId)
          .limit(1)
          .maybeSingle();

        if (raced?.id) {
          const mergedBest = Math.max(raced.best_streak ?? 0, currentStreak);
          await supabaseAdmin
            .from('student_gamification_state')
            .update({
              current_streak: currentStreak,
              best_streak: mergedBest,
              updated_at: nowIso,
            })
            .eq('id', raced.id);
          return { currentStreak, bestStreak: mergedBest };
        }
      }
      console.error('[recalculateStudentStreak] Erro ao inserir gamificação:', insertError);
      throw insertError;
    }
  }

  return { currentStreak, bestStreak };
}
