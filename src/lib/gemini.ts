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
    const isMealCategory = category === 'refeicao' || String(category).toLowerCase().includes('refei');

    const prompt = `Você é o sistema de Inteligência Artificial do ArenaFitPro, especializado em nutrição esportiva e análise visual de refeições e treinos.
Analise a imagem da submissão do aluno e retorne um parecer técnico estritamente em português em formato JSON puro, sem blocos de markdown adicionais.

Categoria esperada da missão: ${category}
Legenda enviada pelo aluno: "${caption || 'Sem legenda'}"

DIRETRIZES PARA FOTOS DE REFEIÇÃO / NUTRIÇÃO:
1. Primeiro verifique com rigor se a imagem contém DE FATO alimentos, prato de comida, lanche, shake ou bebida nutricional.
2. Se a imagem NÃO for comida (ex: foto de celular, tela de computador, espelho, pessoa, academia, parede, animal ou objeto não alimentar):
   - "isValid": false
   - "isFood": false
   - "summary": "Nenhum alimento identificado nesta imagem."
   - "estimatedMacros": null
   - "feedback": "A foto capturada não contém alimentos. Aponte a câmera para o seu prato para calcular os nutrientes."
   - "complianceScore": 0
3. Se a imagem FOR comida ou refeição real:
   - "isValid": true
   - "isFood": true
   - "summary": descreva brevemente os alimentos identificados de forma factual
   - "estimatedMacros": calcule a estimativa calórica e de macronutrientes com base estritamente no volume visível no prato:
     - "calories": valor calculado em kcal (ex: "520 kcal")
     - "protein": valor calculado em gramas (ex: "38g proteico")
     - "carbs": valor calculado em gramas (ex: "45g carbo")
     - "fats": valor calculado em gramas (ex: "14g gordura")
   - "feedback": breve feedback motivacional e técnico sobre a qualidade do prato
   - "complianceScore": nota de 60 a 100 baseada no equilíbrio nutricional

DIRETRIZES PARA TREINO / CARDIO / HÁBITOS:
- Verifique se a foto mostra exercício, aparelho, ambiente esportivo ou comprovante. Se não for refeição, "estimatedMacros" deve ser null.

Retorne estritamente este JSON:
{
  "isValid": true ou false,
  "isFood": true ou false,
  "summary": "Descrição clara do que está na imagem",
  "estimatedMacros": {
    "calories": "X kcal",
    "protein": "Xg proteico",
    "carbs": "Xg carbo",
    "fats": "Xg gordura"
  } ou null,
  "feedback": "Comentário curto",
  "complianceScore": número de 0 a 100
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

    // Modelo oficial atualizado do Gemini (gemini-2.5-flash com fallback para gemini-2.0-flash)
    let response: any;
    try {
      response = await geminiClient.models.generateContent({
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
    } catch (primaryErr: any) {
      console.warn('Falha no modelo gemini-2.5-flash, tentando gemini-2.0-flash:', primaryErr?.message);
      response = await geminiClient.models.generateContent({
        model: 'gemini-2.0-flash',
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
    }

    const cleanJson = response.text?.replace(/```json|```/g, '').trim();
    if (!cleanJson) throw new Error('Resposta vazia da IA');

    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error('Erro na análise com Gemini:', error?.message || error);
    return {
      isValid: false,
      isFood: false,
      summary: 'Não foi possível analisar a imagem automaticamente.',
      estimatedMacros: null,
      feedback: 'A imagem foi registrada e aguarda validação do treinador.',
      complianceScore: 0,
      requiresManualReview: true,
    };
  }
}
