import { NextRequest, NextResponse } from 'next/server';
import { analyzeSubmissionPhoto } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Validar autenticação do usuário para prevenir abuso de quota
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Autenticação obrigatória para análise de imagens.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { photoUrl, category = 'refeicao', caption = '' } = body;

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Parâmetro photoUrl é obrigatório.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeSubmissionPhoto({
      imageUrl: photoUrl,
      category,
      caption,
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
