const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateStory() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Story Abertura Beta');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'story-abertura-beta.jpg');
  const heroImgPath = path.join(__dirname, '..', 'public', 'social', 'hero-post-2.jpg');
  const logoPath = path.join(__dirname, '..', 'public', 'social', 'app-logo.png');

  console.log('Gerando Story 1080x1920 com Sharp...');

  // 1. Preparar hero background escurecido
  const heroBuffer = await sharp(heroImgPath)
    .resize(1080, 1920, { fit: 'cover', position: 'top' })
    .modulate({ brightness: 0.35, saturation: 0.8 })
    .toBuffer();

  // 2. Preparar logo oficial redondo/arredondado
  const logoBuffer = await sharp(logoPath)
    .resize(48, 48)
    .toBuffer();

  // 3. SVG overlay de alta fidelidade
  const svgOverlay = `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Gradiente de escurecimento OLED -->
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.75" />
        <stop offset="35%" stop-color="#000000" stop-opacity="0.88" />
        <stop offset="70%" stop-color="#000000" stop-opacity="0.98" />
        <stop offset="100%" stop-color="#000000" stop-opacity="1.0" />
      </linearGradient>

      <!-- Gradiente de texto titânio/branco -->
      <linearGradient id="textGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#A1A1AA" />
      </linearGradient>

      <!-- Glow radial de topo -->
      <radialGradient id="topGlow" cx="50%" cy="10%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>

      <!-- Estilos de Fonte Embutidos -->
      <style>
        .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>
    </defs>

    <!-- Fundo e Vinheta -->
    <rect width="1080" height="1920" fill="url(#bgGrad)" />
    <rect width="1080" height="800" fill="url(#topGlow)" />

    <!-- Grid sutil de pontos -->
    <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" fill-opacity="0.08" />
    </pattern>
    <rect width="1080" height="1920" fill="url(#dotGrid)" />

    <!-- ==================== HEADER (Safe Zone: Y=240) ==================== -->
    <g transform="translate(80, 240)">
      <!-- Pill da Marca -->
      <rect x="0" y="0" width="280" height="58" rx="29" fill="#18181B" fill-opacity="0.8" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
      <text x="64" y="37" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="2">ARENAFITPRO</text>

      <!-- Pill Status Live -->
      <rect x="670" y="0" width="250" height="58" rx="29" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1.5" />
      <circle cx="700" cy="29" r="6" fill="#FFFFFF" />
      <circle cx="700" cy="29" r="12" fill="#FFFFFF" fill-opacity="0.25" />
      <text x="722" y="36" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF" letter-spacing="1">VAGAS ABERTAS</text>
    </g>

    <!-- ==================== HERO TITLES ==================== -->
    <g transform="translate(80, 360)">
      <!-- Eyebrow Badge -->
      <rect x="0" y="0" width="310" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="17" font-weight="700" fill="#A1A1AA" letter-spacing="3">PROGRAMA FUNDADOR</text>

      <!-- Main Headline -->
      <text x="0" y="125" class="font-sans" font-size="82" font-weight="900" fill="#FFFFFF" letter-spacing="-3">BETA TESTE</text>
      <text x="0" y="210" class="font-sans" font-size="82" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">OFICIAL.</text>

      <!-- Subtitle -->
      <text x="0" y="280" class="font-sans" font-size="26" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Se você é personal trainer, nutricionista ou coach
      </text>
      <text x="0" y="320" class="font-sans" font-size="26" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        e quer rodar desafios sem o caos de grupos no WhatsApp,
      </text>
      <text x="0" y="360" class="font-sans" font-size="26" font-weight="700" fill="#FFFFFF" letter-spacing="-0.5">
        a plataforma está oficialmente pronta para testes.
      </text>
    </g>

    <!-- ==================== BENTO HIGHLIGHTS ==================== -->
    <g transform="translate(80, 800)">
      <!-- Card 1 -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="920" height="136" rx="24" fill="#09090B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="24" y="24" width="70" height="88" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
        <text x="44" y="78" class="font-mono" font-size="30" font-weight="800" fill="#71717A">01</text>
        <text x="120" y="58" class="font-sans" font-size="27" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Câmera Antifraude + Ranking Real</text>
        <text x="120" y="94" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">Alunos validam fotos na hora pelo app. Zero fotos salvas da galeria.</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(0, 160)">
        <rect x="0" y="0" width="920" height="136" rx="24" fill="#09090B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="24" y="24" width="70" height="88" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
        <text x="41" y="78" class="font-mono" font-size="30" font-weight="800" fill="#71717A">02</text>
        <text x="120" y="58" class="font-sans" font-size="27" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Split Pix D+0 (0% de Taxa)</text>
        <text x="120" y="94" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">Zero comissão sobre inscrições. 100% do valor do desafio é seu.</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(0, 320)">
        <rect x="0" y="0" width="920" height="136" rx="24" fill="#09090B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="24" y="24" width="70" height="88" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
        <text x="41" y="78" class="font-mono" font-size="30" font-weight="800" fill="#71717A">03</text>
        <text x="120" y="58" class="font-sans" font-size="27" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Plano PRO Vitalício Gratuito</text>
        <text x="120" y="94" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">Apenas 15 vagas com isenção perpétua dos R$ 49,90/mês do PRO.</text>
      </g>
    </g>

    <!-- ==================== CTA & STICKER DROPZONE ==================== -->
    <g transform="translate(80, 1340)">
      <!-- Caixa tracejada para o adesivo de link do Instagram -->
      <rect x="0" y="0" width="920" height="180" rx="28" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="2" stroke-dasharray="10 8" />
      
      <text x="460" y="56" text-anchor="middle" class="font-sans" font-size="32" fill="#FFFFFF">↓</text>
      <text x="460" y="102" text-anchor="middle" class="font-mono" font-size="24" font-weight="800" fill="#FFFFFF" letter-spacing="3">TOQUE NA FIGURINHA DE LINK ABAIXO</text>
      <text x="460" y="145" text-anchor="middle" class="font-sans" font-size="22" font-weight="500" fill="#A1A1AA">Para se candidatar a uma das 15 vagas do Beta Fechado</text>

      <!-- Pill Direct Fallback -->
      <g transform="translate(180, 215)">
        <rect x="0" y="0" width="560" height="54" rx="27" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
        <text x="280" y="34" text-anchor="middle" class="font-mono" font-size="20" font-weight="700" fill="#E4E4E7">
          Ou responda <tspan font-weight="800" fill="#FFFFFF" text-decoration="underline">"BETA"</tspan> aqui neste story
        </text>
      </g>
    </g>

    <!-- ==================== FOOTER (Safe Zone: Y=1680) ==================== -->
    <g transform="translate(80, 1690)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
      <text x="0" y="38" class="font-mono" font-size="18" fill="#71717A" letter-spacing="3">ARENAFITPRO OS</text>
      <text x="920" y="38" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
    </g>
  </svg>
  `;

  // 4. Composição final com Sharp em 1080x1920
  await sharp(heroBuffer)
    .composite([
      { input: Buffer.from(svgOverlay), top: 0, left: 0 },
      { input: logoBuffer, top: 245, left: 86 } // Posicionar logo no pill da marca
    ])
    .jpeg({ quality: 98, progressive: true })
    .toFile(outputPath);

  console.log(`✅ Story gerado com sucesso em: ${outputPath}`);

  const txtInstructions = `=== STORY OFICIAL: ABERTURA DO BETA TESTE ARENAFITPRO ===

Dimensões: 1080 x 1920 px (Proporção oficial 9:16 do Instagram Stories)
Cores: Luxury Monochromatic Titanium (OLED Black, Titânio, Branco Metálico)
Condição Especial: Plano PRO Vitalício Gratuito (R$ 0 de mensalidade) + 0% de Taxa sobre Inscrições

COMO POSTAR NO SEU INSTAGRAM:
1. Abra o Instagram e selecione o arquivo 'story-abertura-beta.jpg'.
2. Toque no ícone de Figurinhas/Stickers no topo.
3. Escolha a figurinha "LINK".
4. Insira o link da página do beta ou grupo de WhatsApp:
   Link sugerido: https://arenafitpro.app/beta
   Texto da figurinha: QUERO UMA VAGA NO BETA
5. Posicione a figurinha exatamente dentro da caixa tracejada:
   "TOQUE NA FIGURINHA DE LINK ABAIXO".
6. Se quiser reforçar, adicione uma caixa de perguntas ou enquete: "Você roda desafios hoje?".

Pronto! O design respeita 100% as áreas seguras (safe zones) do Instagram para que seu nome de usuário e a barra de envio de direct não fiquem por cima do texto.
`;

  fs.writeFileSync(path.join(outputDir, 'instrucoes.txt'), txtInstructions, 'utf-8');
  console.log('✓ Instruções salvas em instrucoes.txt');
}

generateStory().catch(err => {
  console.error('Erro ao gerar Story com Sharp:', err);
  process.exit(1);
});
