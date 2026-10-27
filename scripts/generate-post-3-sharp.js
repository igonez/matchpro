const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePost3() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Post 3');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const heroImgPath = path.join(__dirname, '..', 'public', 'social', 'hero-post-3.jpg');
  const logoPath = path.join(__dirname, '..', 'public', 'social', 'app-logo.png');

  console.log('Iniciando geração dos 5 slides do Post 3 com Sharp (1080x1350)...');

  // Preparar logo 48x48
  const logoBuffer = await sharp(logoPath).resize(48, 48).toBuffer();

  // Helper para base visual compartilhada
  const commonDefs = `
    <defs>
      <linearGradient id="bgGradOled" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.75" />
        <stop offset="35%" stop-color="#000000" stop-opacity="0.88" />
        <stop offset="70%" stop-color="#000000" stop-opacity="0.98" />
        <stop offset="100%" stop-color="#000000" stop-opacity="1.0" />
      </linearGradient>

      <linearGradient id="textGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#A1A1AA" />
      </linearGradient>

      <radialGradient id="topGlow" cx="50%" cy="10%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.10" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>

      <pattern id="dotGrid" width="36" height="36" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" fill-opacity="0.07" />
      </pattern>

      <style>
        .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>
    </defs>
  `;

  // ==========================================
  // SLIDE 1: CAPA
  // ==========================================
  const slide1Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="url(#bgGradOled)" />
    <rect width="1080" height="600" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="280" height="52" rx="26" fill="#18181B" fill-opacity="0.8" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="2">ARENAFITPRO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">01 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 240)">
      <rect x="0" y="0" width="310" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="16" font-weight="700" fill="#A1A1AA" letter-spacing="3">PROGRAMA FUNDADOR</text>

      <text x="0" y="130" class="font-sans" font-size="82" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Buscamos 15</text>
      <text x="0" y="220" class="font-sans" font-size="82" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">Treinadores.</text>

      <text x="0" y="300" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Para testar em primeira mão a plataforma que transformou
      </text>
      <text x="0" y="345" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        desafios fitness em campeonatos de engajamento diário.
      </text>

      <!-- Highlight Metric Box -->
      <g transform="translate(0, 420)">
        <rect x="0" y="0" width="920" height="190" rx="24" fill="#09090B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2" />
        <text x="460" y="90" text-anchor="middle" class="font-mono" font-size="64" font-weight="900" fill="#FFFFFF" letter-spacing="4">15 VAGAS</text>
        <text x="460" y="145" text-anchor="middle" class="font-mono" font-size="20" font-weight="700" fill="#A1A1AA" letter-spacing="2">PLANO PRO GRATUITO VITALÍCIO • 0% DE TAXA</text>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
      <text x="60" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="760" y="16" width="160" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
      <text x="840" y="44" text-anchor="middle" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">ARRASTE →</text>
    </g>
  </svg>
  `;

  // Compor Slide 1
  const heroBuffer = await sharp(heroImgPath)
    .resize(1080, 1350, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 0.35, saturation: 0.8 })
    .toBuffer();

  await sharp(heroBuffer)
    .composite([
      { input: Buffer.from(slide1Svg), top: 0, left: 0 },
      { input: logoBuffer, top: 82, left: 86 },
      { input: logoBuffer, top: 1234, left: 80 }
    ])
    .jpeg({ quality: 96 })
    .toFile(path.join(outputDir, 'slide-1.jpg'));
  console.log('✓ Slide 1 gerado: slide-1.jpg');

  // ==========================================
  // SLIDE 2: O PROGRAMA DE FUNDADORES
  // ==========================================
  const slide2Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="#000000" />
    <rect width="1080" height="500" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">FASE PILOTO FECHADA</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">02 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 220)">
      <rect x="0" y="0" width="290" height="40" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="26" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2">VALIDAÇÃO EM CAMPO</text>

      <text x="0" y="110" class="font-sans" font-size="56" font-weight="900" fill="#FFFFFF" letter-spacing="-2">O que é o Programa</text>
      <text x="0" y="180" class="font-sans" font-size="56" font-weight="900" fill="url(#textGrad)" letter-spacing="-2">de Fundadores?</text>

      <text x="0" y="250" class="font-sans" font-size="24" font-weight="400" fill="#D4D4D8" letter-spacing="-0.3">
        Antes de abrirmos a plataforma globalmente, selecionaremos um grupo
      </text>
      <text x="0" y="290" class="font-sans" font-size="24" font-weight="400" fill="#D4D4D8" letter-spacing="-0.3">
        exclusivo de 15 treinadores para rodarem desafios com turmas reais.
      </text>

      <!-- Bento Card 1 -->
      <g transform="translate(0, 360)">
        <rect x="0" y="0" width="920" height="180" rx="24" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="36" y="36" width="90" height="108" rx="16" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="81" y="104" text-anchor="middle" class="font-mono" font-size="40" font-weight="800" fill="#71717A">01</text>
        <text x="160" y="80" class="font-sans" font-size="32" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Turma Real (5 a 30 Alunos)</text>
        <text x="160" y="122" class="font-sans" font-size="22" font-weight="400" fill="#A1A1AA">Você roda seu próximo desafio de 21 dias sem mudar sua prescrição.</text>
      </g>

      <!-- Bento Card 2 -->
      <g transform="translate(0, 580)">
        <rect x="0" y="0" width="920" height="180" rx="24" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="36" y="36" width="90" height="108" rx="16" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="81" y="104" text-anchor="middle" class="font-mono" font-size="40" font-weight="800" fill="#71717A">02</text>
        <text x="160" y="80" class="font-sans" font-size="32" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Acompanhamento Direto</text>
        <text x="160" y="122" class="font-sans" font-size="22" font-weight="400" fill="#A1A1AA">Nosso time técnico acompanha seu desafio para calibrar cada detalhe.</text>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
      <text x="60" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="760" y="16" width="160" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
      <text x="840" y="44" text-anchor="middle" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">ARRASTE →</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(slide2Svg))
    .composite([
      { input: logoBuffer, top: 82, left: 86 },
      { input: logoBuffer, top: 1234, left: 80 }
    ])
    .jpeg({ quality: 96 })
    .toFile(path.join(outputDir, 'slide-2.jpg'));
  console.log('✓ Slide 2 gerado: slide-2.jpg');

  // ==========================================
  // SLIDE 3: O QUE VOCÊ GANHA (4 BENTO CARDS)
  // ==========================================
  const slide3Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="#000000" />
    <rect width="1080" height="500" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="310" height="52" rx="26" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">BENEFÍCIOS VITALÍCIOS</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">03 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 220)">
      <rect x="0" y="0" width="260" height="40" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="26" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2">CONDIÇÃO ESPECIAL</text>

      <text x="0" y="110" class="font-sans" font-size="56" font-weight="900" fill="#FFFFFF" letter-spacing="-2">O que você ganha</text>
      <text x="0" y="180" class="font-sans" font-size="56" font-weight="900" fill="url(#textGrad)" letter-spacing="-2">como Fundador:</text>

      <!-- 4 Cards Grid 2x2 -->
      <!-- Card 1 -->
      <g transform="translate(0, 260)">
        <rect x="0" y="0" width="445" height="270" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="28" y="28" width="56" height="56" rx="12" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
        <text x="56" y="66" text-anchor="middle" class="font-mono" font-size="24" font-weight="800" fill="#71717A">01</text>
        <text x="28" y="130" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Plano PRO Gratuito</text>
        <text x="28" y="175" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Isenção vitalícia da</text>
        <text x="28" y="205" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">mensalidade do plano PRO</text>
        <text x="28" y="235" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">para sempre na sua conta.</text>
      </g>

      <!-- Card 2 -->
      <g transform="translate(475, 260)">
        <rect x="0" y="0" width="445" height="270" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="28" y="28" width="56" height="56" rx="12" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
        <text x="56" y="66" text-anchor="middle" class="font-mono" font-size="24" font-weight="800" fill="#71717A">02</text>
        <text x="28" y="130" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">0% de Taxa sobre Alunos</text>
        <text x="28" y="175" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Zero comissão sobre as</text>
        <text x="28" y="205" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">inscrições. 100% do valor</text>
        <text x="28" y="235" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">do desafio fica com você.</text>
      </g>

      <!-- Card 3 -->
      <g transform="translate(0, 560)">
        <rect x="0" y="0" width="445" height="270" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="28" y="28" width="56" height="56" rx="12" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
        <text x="56" y="66" text-anchor="middle" class="font-mono" font-size="24" font-weight="800" fill="#71717A">03</text>
        <text x="28" y="130" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Canal VIP WhatsApp</text>
        <text x="28" y="175" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Contato direto com os</text>
        <text x="28" y="205" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">fundadores para sugerir</text>
        <text x="28" y="235" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">recursos sob medida.</text>
      </g>

      <!-- Card 4 -->
      <g transform="translate(475, 560)">
        <rect x="0" y="0" width="445" height="270" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="28" y="28" width="56" height="56" rx="12" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
        <text x="56" y="66" text-anchor="middle" class="font-mono" font-size="24" font-weight="800" fill="#71717A">04</text>
        <text x="28" y="130" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Template 21 Dias</text>
        <text x="28" y="175" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Estrutura pronta de</text>
        <text x="28" y="205" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">missões validadas para</text>
        <text x="28" y="235" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">aplicar de imediato.</text>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
      <text x="60" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="760" y="16" width="160" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
      <text x="840" y="44" text-anchor="middle" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">ARRASTE →</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(slide3Svg))
    .composite([
      { input: logoBuffer, top: 82, left: 86 },
      { input: logoBuffer, top: 1234, left: 80 }
    ])
    .jpeg({ quality: 96 })
    .toFile(path.join(outputDir, 'slide-3.jpg'));
  console.log('✓ Slide 3 gerado: slide-3.jpg');

  // ==========================================
  // SLIDE 4: QUEM PODE PARTICIPAR (CHECKLIST)
  // ==========================================
  const slide4Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="#000000" />
    <rect width="1080" height="500" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="310" height="52" rx="26" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">CRITÉRIOS DE SELEÇÃO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">04 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 220)">
      <rect x="0" y="0" width="220" height="40" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="26" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2">PERFIL BUSCADO</text>

      <text x="0" y="110" class="font-sans" font-size="56" font-weight="900" fill="#FFFFFF" letter-spacing="-2">Quem pode se candidatar</text>
      <text x="0" y="180" class="font-sans" font-size="56" font-weight="900" fill="url(#textGrad)" letter-spacing="-2">às 15 vagas?</text>

      <!-- Checklist Items -->
      <g transform="translate(0, 240)">
        <!-- Item 1 -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="920" height="150" rx="20" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="30" y="45" width="60" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1" />
          <text x="60" y="84" text-anchor="middle" class="font-mono" font-size="28" font-weight="900" fill="#FFFFFF">✓</text>
          <text x="120" y="66" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Personais, Nutris ou Coaches</text>
          <text x="120" y="104" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Profissionais que já rodam ou desejam lançar desafios em grupo.</text>
        </g>

        <!-- Item 2 -->
        <g transform="translate(0, 180)">
          <rect x="0" y="0" width="920" height="150" rx="20" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="30" y="45" width="60" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1" />
          <text x="60" y="84" text-anchor="middle" class="font-mono" font-size="28" font-weight="900" fill="#FFFFFF">✓</text>
          <text x="120" y="66" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Ao Menos 5 Alunos no Piloto</text>
          <text x="120" y="104" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Capacidade de rodar com 5 a 30 alunos nas próximas semanas.</text>
        </g>

        <!-- Item 3 -->
        <g transform="translate(0, 360)">
          <rect x="0" y="0" width="920" height="150" rx="20" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="30" y="45" width="60" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1" />
          <text x="60" y="84" text-anchor="middle" class="font-mono" font-size="28" font-weight="900" fill="#FFFFFF">✓</text>
          <text x="120" y="66" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Compromisso de Feedback Honesto</text>
          <text x="120" y="104" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Disponibilidade para relatar o que funcionou e o que melhorar.</text>
        </g>
      </g>

      <text x="460" y="820" text-anchor="middle" class="font-mono" font-size="18" font-weight="600" fill="#71717A" letter-spacing="1">
        Não exigimos milhares de seguidores. Exigimos compromisso e padrão.
      </text>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
      <text x="60" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="760" y="16" width="160" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
      <text x="840" y="44" text-anchor="middle" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">ARRASTE →</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(slide4Svg))
    .composite([
      { input: logoBuffer, top: 82, left: 86 },
      { input: logoBuffer, top: 1234, left: 80 }
    ])
    .jpeg({ quality: 96 })
    .toFile(path.join(outputDir, 'slide-4.jpg'));
  console.log('✓ Slide 4 gerado: slide-4.jpg');

  // ==========================================
  // SLIDE 5: COMO GARANTIR A VAGA (CTA FINAL)
  // ==========================================
  const slide5Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="#000000" />
    <rect width="1080" height="500" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="310" height="52" rx="26" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">CANDIDATURAS ABERTAS</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">05 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 220)">
      <rect x="0" y="0" width="220" height="40" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="26" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2">APENAS 15 VAGAS</text>

      <text x="0" y="110" class="font-sans" font-size="56" font-weight="900" fill="#FFFFFF" letter-spacing="-2">Como garantir sua vaga</text>
      <text x="0" y="180" class="font-sans" font-size="56" font-weight="900" fill="url(#textGrad)" letter-spacing="-2">no Beta Fechado:</text>

      <!-- 3 Steps -->
      <g transform="translate(0, 240)">
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="920" height="110" rx="18" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="24" y="25" width="60" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1" />
          <text x="54" y="64" text-anchor="middle" class="font-mono" font-size="22" font-weight="800" fill="#FFFFFF">01</text>
          <text x="110" y="48" class="font-sans" font-size="24" font-weight="800" fill="#FFFFFF">Toque no link da bio</text>
          <text x="110" y="80" class="font-sans" font-size="18" font-weight="400" fill="#A1A1AA">Acesse o portal oficial em arenafitpro.app/beta</text>
        </g>

        <g transform="translate(0, 130)">
          <rect x="0" y="0" width="920" height="110" rx="18" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="24" y="25" width="60" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1" />
          <text x="54" y="64" text-anchor="middle" class="font-mono" font-size="22" font-weight="800" fill="#FFFFFF">02</text>
          <text x="110" y="48" class="font-sans" font-size="24" font-weight="800" fill="#FFFFFF">Preencha em menos de 60 segundos</text>
          <text x="110" y="80" class="font-sans" font-size="18" font-weight="400" fill="#A1A1AA">Informe sua especialidade e tamanho estimado de turma.</text>
        </g>

        <g transform="translate(0, 260)">
          <rect x="0" y="0" width="920" height="110" rx="18" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="24" y="25" width="60" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1" />
          <text x="54" y="64" text-anchor="middle" class="font-mono" font-size="22" font-weight="800" fill="#FFFFFF">03</text>
          <text x="110" y="48" class="font-sans" font-size="24" font-weight="800" fill="#FFFFFF">Receba o convite direto no WhatsApp</text>
          <text x="110" y="80" class="font-sans" font-size="18" font-weight="400" fill="#A1A1AA">Nossa equipe entrará em contato com os 15 selecionados.</text>
        </g>
      </g>

      <!-- Callout Direct/Comment -->
      <g transform="translate(0, 670)">
        <rect x="0" y="0" width="920" height="160" rx="24" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="8 6" />
        <text x="460" y="66" text-anchor="middle" class="font-mono" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="2">OU COMENTE "BETA" ABAIXO</text>
        <text x="460" y="112" text-anchor="middle" class="font-sans" font-size="22" font-weight="500" fill="#A1A1AA">
          Enviaremos o link de candidatura direto no seu direct
        </text>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
      <text x="60" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="680" y="16" width="240" height="44" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.5" />
      <text x="800" y="44" text-anchor="middle" class="font-mono" font-size="15" font-weight="800" fill="#FFFFFF" letter-spacing="1">15 VAGAS ABERTAS</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(slide5Svg))
    .composite([
      { input: logoBuffer, top: 82, left: 86 },
      { input: logoBuffer, top: 1234, left: 80 }
    ])
    .jpeg({ quality: 96 })
    .toFile(path.join(outputDir, 'slide-5.jpg'));
  console.log('✓ Slide 5 gerado: slide-5.jpg');

  // Salvar legenda.txt
  const legendaText = `Antes de abrirmos a plataforma globalmente, decidimos rodar um piloto exclusivo com apenas 15 treinadores e nutricionistas comprometidos.

O QUE É O PROGRAMA DE FUNDADORES:
Você vai rodar um desafio real com seus alunos (turmas de 5 a 30 pessoas) com acompanhamento direto do nosso time de desenvolvimento.

O QUE VOCÊ GANHA COMO FUNDADOR:
1. Plano PRO Vitalício Gratuito: Isenção permanente e perpétua da mensalidade de R$ 49,90 do plano PRO para os 15 selecionados.
2. 0% de Taxa sobre Inscrições: Zero comissão sobre o valor pago pelos seus alunos (100% da receita do desafio é sua).
3. Canal Direto de WhatsApp com os Devs: Suas sugestões viram melhorias no app em tempo recorde.
4. Template Validado de Desafio de 21 Dias: Estrutura completa pronta para aplicar na sua turma de imediato.

O QUE PEDIMOS EM TROCA:
Apenas o seu feedback sincero sobre o engajamento e a adesão dos seus alunos.

As candidaturas estão abertas e avaliaremos cada perfil manualmente.

Como garantir sua vaga:
- Toque no link da bio: arenafitpro.app/beta
- Ou comente "BETA" aqui embaixo que te enviamos o link no direct.

#personaltrainer #consultoriafitness #desafiofitness #gamificacao #treinador #arenafitpro #nutricaoesportiva`;

  fs.writeFileSync(path.join(outputDir, 'legenda.txt'), legendaText, 'utf-8');
  console.log('✓ Legenda salva em Post 3/legenda.txt');

  console.log('✅ Todos os 5 slides do Post 3 foram gerados com sucesso!');
}

generatePost3().catch(err => {
  console.error('Erro ao gerar Post 3:', err);
  process.exit(1);
});
