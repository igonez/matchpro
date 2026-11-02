import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import {
  buildRankingSnapshot,
  generateShortCode,
  getPublicAppOrigin,
  SHARE_EXPIRATION_DAYS,
  verifyUserCanShareChallenge,
} from '@/lib/share/ranking-share.server';

const uuidSchema = z.string().uuid();

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const limited = enforceRateLimit(req, 'share');
    if (limited) return limited;

    const { id: challengeId } = await context.params;
    if (!uuidSchema.safeParse(challengeId).success) {
      return NextResponse.json(
        { error: 'ID de desafio inválido.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Autenticação necessária para compartilhar o ranking.' },
        { status: 401 }
      );
    }

    let forceNew = false;
    try {
      const body = await req.json();
      forceNew = Boolean(body?.forceNew);
    } catch {
      // Corpo opcional
    }

    const access = await verifyUserCanShareChallenge(challengeId, user.id);
    if (!access.challenge) {
      return NextResponse.json(
        { error: 'Desafio não encontrado.' },
        { status: 404 }
      );
    }

    if (!access.allowed) {
      return NextResponse.json(
        { error: 'Você não participa deste desafio.' },
        { status: 403 }
      );
    }

    const snapshot = await buildRankingSnapshot(
      access.challenge.id,
      access.challenge.title,
      user.id
    );

    if (!snapshot) {
      return NextResponse.json(
        { error: 'Ainda não há pontuação registrada neste ranking para compartilhar.' },
        { status: 422 }
      );
    }

    const origin = getPublicAppOrigin(req.nextUrl.origin);
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const nowIso = new Date().toISOString();

    if (!forceNew) {
      const { data: existingLink } = await supabaseAdmin
        .from('ranking_share_links')
        .select('id, code, expires_at, created_at')
        .eq('challenge_id', challengeId)
        .eq('created_by', user.id)
        .is('revoked_at', null)
        .gt('expires_at', nowIso)
        .gte('created_at', fifteenMinAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingLink) {
        const expiresAt = new Date(
          Date.now() + SHARE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
        ).toISOString();

        await supabaseAdmin
          .from('ranking_share_links')
          .update({
            snapshot,
            expires_at: expiresAt,
          })
          .eq('id', existingLink.id);

        return NextResponse.json(
          {
            code: existingLink.code,
            url: `${origin}/r/${existingLink.code}`,
            expiresAt,
            snapshot,
          },
          { status: 200 }
        );
      }
    }

    const expiresAt = new Date(
      Date.now() + SHARE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    let createdCode: string | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateShortCode(8);
      const { error: insertError } = await supabaseAdmin
        .from('ranking_share_links')
        .insert({
          code: candidate,
          challenge_id: challengeId,
          created_by: user.id,
          snapshot,
          expires_at: expiresAt,
        });

      if (!insertError) {
        createdCode = candidate;
        break;
      }

      // Colisão de unique key (23505): tenta novo código
      if ((insertError as any)?.code !== '23505') {
        console.error('[POST /api/rankings/:id/share] Erro ao salvar link:', insertError);
        return NextResponse.json(
          { error: 'Não foi possível gerar o link público de compartilhamento.' },
          { status: 500 }
        );
      }
    }

    if (!createdCode) {
      return NextResponse.json(
        { error: 'Falha ao alocar código curto único. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        code: createdCode,
        url: `${origin}/r/${createdCode}`,
        expiresAt,
        snapshot,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[POST /api/rankings/:id/share] Erro inesperado:', err);
    return NextResponse.json(
      { error: 'Erro interno ao gerar link de compartilhamento.' },
      { status: 500 }
    );
  }
}
