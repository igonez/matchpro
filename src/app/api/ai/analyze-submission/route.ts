import { NextRequest, NextResponse } from 'next/server';
import { analyzeSubmissionPhoto } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoUrl, category = 'refeicao', caption = '' } = body;

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Parâmetro photoUrl é obrigatório' },
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
      { error: error.message || 'Erro ao processar análise da foto' },
      { status: 500 }
    );
  }
}
