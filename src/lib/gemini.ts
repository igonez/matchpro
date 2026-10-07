import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const geminiClient = new GoogleGenAI({ apiKey });

/**
 * Analisador inteligente multimodal de fotos de refeições e treinos
 */
export async function analyzeSubmissionPhoto({
  imageUrl,
  category,
  caption,
}: {
  imageUrl: string;
  category: 'treino' | 'cardio' | 'refeicao' | 'habito' | string;
  caption?: string;
}) {
  try {
    const prompt = `Você é o sistema de Inteligência Artificial do ArenaPro, especializado em nutrição e alta performance esportiva.
Analise a imagem da submissão do aluno e retorne um parecer técnico em português em formato JSON puro.
Categoria informada pelo aluno: ${category}
Legenda enviada pelo aluno: "${caption || 'Sem legenda'}"

Retorne estritamente um objeto JSON com esta estrutura:
{
  "isValid": true ou false (se a imagem corresponde de fato a um treino, cardio, prato saudável ou hábito físico),
  "summary": "Resumo do que foi identificado na foto em 1 frase curta",
  "estimatedMacros": {
    "calories": "ex: 450 kcal ou N/A para treinos",
    "protein": "ex: 35g ou N/A",
    "carbs": "ex: 40g ou N/A",
    "fats": "ex: 12g ou N/A"
  },
  "feedback": "Mensagem motivacional curta e direta ao atleta (máximo 2 linhas)",
  "complianceScore": número de 0 a 100 indicando o nível de adequação ao desafio
}`;

    // Baixa a imagem para base64 para envio direto ao Gemini
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const response = await geminiClient.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
          ],
        },
      ],
    });

    const cleanJson = response.text?.replace(/```json|```/g, '').trim();
    if (!cleanJson) throw new Error('Resposta vazia da IA');

    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error('Erro na análise com Gemini:', error);
    return {
      isValid: true,
      summary: 'Foto submetida com sucesso',
      estimatedMacros: { calories: 'N/A', protein: 'N/A', carbs: 'N/A', fats: 'N/A' },
      feedback: 'Registro confirmado! Continue mantendo a consistência.',
      complianceScore: 100,
    };
  }
}
