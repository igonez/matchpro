import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { SHARE_CODE_REGEX } from '@/lib/share/ranking-share.server';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const limited = enforceRateLimit(req, 'share');
    if (limited) return limited;

    const { code } = await context.params;
    if (!SHARE_CODE_REGEX.test(code)) {
      return NextResponse.json({ error: 'Código inválido.' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Autenticação obrigatória.' },
        { status: 401 }
      );
    }

    const { data: linkRecord, error } = await supabaseAdmin
      .from('ranking_share_links')
      .select('id, code, created_by, challenge_id, revoked_at')
      .eq('code', code)
      .maybeSingle();

    if (error || !linkRecord) {
      return NextResponse.json(
        { error: 'Link público não encontrado.' },
        { status: 404 }
      );
    }

    let canRevoke = linkRecord.created_by === user.id;

    if (!canRevoke) {
      const { data: challenge } = await supabaseAdmin
        .from('challenges')
        .select('professional_id')
        .eq('id', linkRecord.challenge_id)
        .maybeSingle();

      if (challenge?.professional_id === user.id) {
        canRevoke = true;
      }
    }

    if (!canRevoke) {
      return NextResponse.json(
        { error: 'Sem permissão para desativar este link.' },
        { status: 403 }
      );
    }

    const revokedAt = linkRecord.revoked_at || new Date().toISOString();

    await supabaseAdmin
      .from('ranking_share_links')
      .update({ revoked_at: revokedAt })
      .eq('id', linkRecord.id);

    return NextResponse.json({
      success: true,
      code: linkRecord.code,
      revokedAt,
    });
  } catch (err: any) {
    console.error('[DELETE /api/rankings/share/:code] Erro inesperado:', err);
    return NextResponse.json(
      { error: 'Não foi possível desativar o link.' },
      { status: 500 }
    );
  }
}
