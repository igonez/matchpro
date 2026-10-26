import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enforceRateLimit } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(req, 'submissions');
    if (rateLimitResponse) return rateLimitResponse;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId, submissionIds, status } = body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }

    const idsToUpdate: string[] = submissionIds || (submissionId ? [submissionId] : []);
    if (idsToUpdate.length === 0) {
      return NextResponse.json({ error: 'Nenhuma submissão informada.' }, { status: 400 });
    }

    // Validar se o usuário é o treinador das turmas dessas missões
    // Buscar as submissões e o professional_id do desafio relacionado
    const { data: subs, error: subsError } = await supabaseAdmin
      .from('student_submissions')
      .select(`
        id,
        missions!inner (
          id,
          challenges!inner (
            id,
            professional_id
          )
        )
      `)
      .in('id', idsToUpdate);

    if (subsError || !subs || subs.length === 0) {
      return NextResponse.json({ error: 'Submissões não encontradas.' }, { status: 404 });
    }

    // Verificar se todas as submissões pertencem ao treinador logado
    const unauthorized = subs.some((s: any) => {
      const challengeProfId = s.missions?.challenges?.professional_id;
      return challengeProfId !== user.id;
    });

    if (unauthorized) {
      return NextResponse.json(
        { error: 'Você não tem permissão para auditar submissões de outros treinadores.' },
        { status: 403 }
      );
    }

    // Executar a atualização via supabaseAdmin garantindo persistência no PostgreSQL
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('student_submissions')
      .update({ status })
      .in('id', idsToUpdate)
      .select('id, status');

    if (updateError) {
      console.error('[Audit API] Erro ao atualizar status:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updatedCount: updated?.length || idsToUpdate.length,
      status,
    });
  } catch (err: any) {
    console.error('[Audit API] Erro inesperado:', err);
    return NextResponse.json({ error: err.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
