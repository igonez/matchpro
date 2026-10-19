import { NextRequest, NextResponse } from 'next/server';
import { analyzeSubmissionPhoto } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { sanitizeString } from '@/lib/security/sanitize';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting estrito para proteção de quota de IA (15 req/min)
    const rateLimitResponse = enforceRateLimit(req, 'ai');
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Validar autenticação do usuário para prevenir abuso de quota
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Autenticação obrigatória para análise de imagens.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { photoUrl, imageBase64, category = 'refeicao', caption = '' } = body;

    if (!photoUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Parâmetro photoUrl ou imageBase64 é obrigatório.' },
        { status: 400 }
      );
    }

    const sanitizedCategory = sanitizeString(category);
    const sanitizedCaption = sanitizeString(caption).slice(0, 500);

    const analysis = await analyzeSubmissionPhoto({
      imageUrl: photoUrl,
      imageBase64,
      category: sanitizedCategory,
      caption: sanitizedCaption,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Erro na API de análise Gemini:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar análise da foto.' },
      { status: 500 }
    );
  }
}
