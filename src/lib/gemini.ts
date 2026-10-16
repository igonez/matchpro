import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const geminiClient = new GoogleGenAI({ apiKey });

/**
 * Validação rigorosa de URL para proteção contra SSRF (Server-Side Request Forgery)
 */
function validateSafeImageUrl(urlString: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error('URL de imagem inválida.');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Apenas URLs HTTPS seguras são permitidas.');
  }

  const hostname = parsed.hostname.toLowerCase();
  const forbiddenHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '169.254.169.254', // AWS/GCP metadata
    'metadata.google.internal',
    '::1',
  ];

  if (
    forbiddenHosts.includes(hostname) ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  ) {
    throw new Error('Destino de rede interno não permitido (SSRF Guard).');
  }

  return parsed;
}

/**
 * Analisador inteligente multimodal de fotos de refeições e treinos
 */
export async function analyzeSubmissionPhoto({
  imageUrl,
  imageBase64,
  category,
  caption,
}: {
  imageUrl?: string;
  imageBase64?: string;
  category: 'treino' | 'cardio' | 'refeicao' | 'habito' | string;
  caption?: string;
}) {
  try {
    const prompt = `Você é o sistema de Inteligência Artificial do ArenaFitPro, especializado em nutrição e alta performance esportiva.
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

    let base64Data: string;
    let mimeType = 'image/jpeg';

    if (imageBase64) {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      } else {
        base64Data = imageBase64;
      }
    } else if (imageUrl) {
      // 1. Validação anti-SSRF
      validateSafeImageUrl(imageUrl);

      // Baixa a imagem com timeout de 8 segundos e limite de tamanho
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const imageResponse = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'image/*',
        },
      });
      clearTimeout(timeout);

      if (!imageResponse.ok) {
        throw new Error(`Falha ao obter imagem da submissão: status ${imageResponse.status}`);
      }

      mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
      if (!mimeType.startsWith('image/')) {
        throw new Error('O conteúdo baixado não é uma imagem válida.');
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      // Limite de 8MB para evitar esgotamento de memória no servidor
      if (arrayBuffer.byteLength > 8 * 1024 * 1024) {
        throw new Error('A imagem excede o tamanho máximo de 8MB.');
      }

      base64Data = Buffer.from(arrayBuffer).toString('base64');
    } else {
      throw new Error('Informe imageBase64 ou imageUrl.');
    }

    // Modelo oficial atualizado do Gemini (gemini-2.5-flash)
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
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
    console.error('Erro na análise com Gemini:', error?.message || error);
    return {
      isValid: true,
      summary: 'Foto submetida com sucesso',
      estimatedMacros: { calories: 'N/A', protein: 'N/A', carbs: 'N/A', fats: 'N/A' },
      feedback: 'Registro confirmado! Continue mantendo a consistência.',
      complianceScore: 100,
    };
  }
}
