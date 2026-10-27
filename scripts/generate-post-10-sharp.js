const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePost10() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Post 10');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const logoPath = path.join(__dirname, '..', 'public', 'social', 'app-logo.png');
  const heroBgPath = path.join(__dirname, '..', 'public', 'social', 'hero-post-1.jpg');

  console.log('Iniciando geração dos 5 slides do Post 10 (100% Luxury Monochromatic Titanium • 1080x1350)...');

  // Preparar logo 48x48 arredondada
  const logoMask = Buffer.from(
    `<svg width="48" height="48"><rect x="0" y="0" width="48" height="48" rx="12" fill="#fff"/></svg>`
  );
  const logoBuffer = await sharp(logoPath)
    .resize(48, 48)
    .composite([{ input: logoMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Preparar hero background low-key monocromático para o Slide 1 (Capa)
  const heroDarkBuffer = await sharp(heroBgPath)
    .resize(1080, 1350, { fit: 'cover', position: 'center' })
    .grayscale()
    .modulate({ brightness: 0.24 })
    .blur(1.2)
    .toBuffer();

  const commonDefs = `
    <defs>
      <linearGradient id="bgOled" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#070709" />
        <stop offset="45%" stop-color="#000000" />
        <stop offset="100%" stop-color="#000000" />
      </linearGradient>

      <linearGradient id="heroOverlay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.52" />
        <stop offset="50%" stop-color="#000000" stop-opacity="0.84" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.98" />
      </linearGradient>

      <linearGradient id="textGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#A1A1AA" />
      </linearGradient>

      <linearGradient id="rimHighlight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.05" />
        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.05" />
      </linearGradient>

      <radialGradient id="topGlow" cx="50%" cy="12%" r="48%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.10" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>

      <pattern id="dotGrid" width="36" height="36" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" fill-opacity="0.055" />
      </pattern>

      <pattern id="calendarGrid" width="54" height="54" patternUnits="userSpaceOnUse">
        <path d="M 54 0 L 0 0 0 54" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/>
      </pattern>

      <style>
        .font-mono { font-family: 'Consolas', 'Segoe UI', Arial, sans-serif; }
        .font-sans { font-family: 'Segoe UI', -apple-system, Arial, sans-serif; }
      </style>
    </defs>
  `;

  // =========================================================================
  // SLIDE 1: CAPA (Hook Sazonal — Novembro & 13º Salário)
  // =========================================================================
  const slide1Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="url(#heroOverlay)" />
    <rect width="1080" height="700" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="340" height="52" rx="26" fill="#18181B" fill-opacity="0.88" stroke="#FFFFFF" stroke-opacity="0.20" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="2">TIMING DE MERCADO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">01 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 225)">
      <rect x="0" y="0" width="440" height="44" rx="8" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1" />
      <circle cx="24" cy="22" r="4.5" fill="#FFFFFF" />
      <text x="42" y="28" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="2.5">OPERAÇÃO PRÉ-VERÃO • NOVEMBRO</text>

      <text x="0" y="128" class="font-sans" font-size="74" font-weight="900" fill="#FFFFFF" letter-spacing="-2.5">Faltam 5 dias para</text>
      <text x="0" y="212" class="font-sans" font-size="74" font-weight="900" fill="#FFFFFF" letter-spacing="-2.5">Novembro: <tspan fill="url(#textGrad)">o mês do</tspan></text>
      <text x="0" y="296" class="font-sans" font-size="74" font-weight="900" fill="url(#textGrad)" letter-spacing="-2.5">seu 13º salário.</text>

      <text x="0" y="375" class="font-sans" font-size="27" font-weight="400" fill="#D4D4D8">
        Como usar a última janela de 21 dias antes de dezembro para
      </text>
      <text x="0" y="418" class="font-sans" font-size="27" font-weight="400" fill="#A1A1AA">
        blindar seus alunos atuais e injetar <tspan fill="#FFFFFF" font-weight="700">R$ 3.000 a R$ 6.000</tspan> no caixa.
      </text>

      <!-- Central Feature Box (Luxury Titanium Specular) -->
      <g transform="translate(0, 480)">
        <rect x="0" y="0" width="920" height="245" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2" />
        <line x1="80" y1="0" x2="840" y2="0" stroke="url(#rimHighlight)" stroke-width="2" />
        
        <text x="460" y="98" text-anchor="middle" class="font-mono" font-size="56" font-weight="700" fill="#FFFFFF" letter-spacing="1">09/11 A 30/11 • 21 DIAS</text>
        <rect x="120" y="138" width="680" height="46" rx="23" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1" />
        <text x="460" y="167" text-anchor="middle" class="font-mono" font-size="15" font-weight="700" fill="#E4E4E7" letter-spacing="2">A ÚLTIMA JANELA DE OURO DO ANO • PIX D+0 IMEDIATO</text>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
      <text x="64" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="750" y="14" width="170" height="46" rx="23" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
      <text x="835" y="43" text-anchor="middle" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">ARRASTE →</text>
    </g>
  </svg>
  `;

  // =========================================================================
  // SLIDE 2: A DOR (O Abismo de Fim de Ano — 100% Monocromático)
  // =========================================================================
  const slide2Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    <rect width="1080" height="600" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="350" height="52" rx="26" fill="#18181B" fill-opacity="0.88" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="2">DIAGNÓSTICO SAZONAL</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">02 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 225)">
      <rect x="0" y="0" width="460" height="44" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="20" y="28" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2.5">O ABISMO DE NOVEMBRO E DEZEMBRO</text>

      <text x="0" y="125" class="font-sans" font-size="74" font-weight="900" fill="#FFFFFF" letter-spacing="-2.5">Todo fim de ano</text>
      <text x="0" y="210" class="font-sans" font-size="74" font-weight="900" fill="url(#textGrad)" letter-spacing="-2.5">o roteiro se repete.</text>

      <text x="0" y="285" class="font-sans" font-size="27" font-weight="400" fill="#D4D4D8">
        Enquanto quem é CLT recebe 13º salário, o treinador autônomo
      </text>
      <text x="0" y="328" class="font-sans" font-size="27" font-weight="400" fill="#A1A1AA">
        enfrenta os 60 dias mais perigosos para o seu faturamento:
      </text>

      <!-- Central Feature Box -->
      <g transform="translate(0, 385)">
        <rect x="0" y="0" width="920" height="400" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="2" />
        <line x1="80" y1="0" x2="840" y2="0" stroke="url(#rimHighlight)" stroke-width="1.5" />

        <!-- Card 1 (Muted Titanium) -->
        <g transform="translate(30, 30)">
          <rect x="0" y="0" width="860" height="155" rx="16" fill="#18181B" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="155" stroke="#52525B" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="17" font-weight="700" fill="#A1A1AA" letter-spacing="1.5">01 • A DESCULPA DO "VOLTO EM JANEIRO"</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#71717A">QUEDA DE CAIXA</text>
          <text x="35" y="88" class="font-sans" font-size="21" font-weight="400" fill="#D4D4D8">Sem um prazo curto e competitivo, o aluno perde o ritmo nos</text>
          <text x="35" y="120" class="font-sans" font-size="21" font-weight="400" fill="#71717A">feriados de novembro e adia a renovação da consultoria.</text>
        </g>

        <!-- Card 2 (Optical White Highlight) -->
        <g transform="translate(30, 210)">
          <rect x="0" y="0" width="860" height="160" rx="16" fill="#18181B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.26" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="160" stroke="#FFFFFF" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">02 • O ANTÍDOTO: DESAFIO PRÉ-VERÃO 21 DIAS</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF">ALTA RETENÇÃO</text>
          <text x="35" y="88" class="font-sans" font-size="21" font-weight="600" fill="#FFFFFF">Ninguém quer chegar nas festas de dezembro fora de forma.</text>
          <text x="35" y="120" class="font-sans" font-size="21" font-weight="400" fill="#D4D4D8">Um sprint gamificado de 21 dias vicia a turma e trava o abandono.</text>
        </g>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
      <text x="64" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="750" y="14" width="170" height="46" rx="23" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
      <text x="835" y="43" text-anchor="middle" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">ARRASTE →</text>
    </g>
  </svg>
  `;

  // =========================================================================
  // SLIDE 3: CRONOGRAMA TÁTICO DE NOVEMBRO (100% Monocromático)
  // =========================================================================
  const slide3Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    <rect width="1080" height="600" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#calendarGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="340" height="52" rx="26" fill="#18181B" fill-opacity="0.88" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="2">CRONOGRAMA TÁTICO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">03 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 225)">
      <rect x="0" y="0" width="330" height="44" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="20" y="28" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2.5">EXECUÇÃO EM 3 FASES</text>

      <text x="0" y="125" class="font-sans" font-size="72" font-weight="900" fill="#FFFFFF" letter-spacing="-2.5">O calendário exato</text>
      <text x="0" y="208" class="font-sans" font-size="72" font-weight="900" fill="url(#textGrad)" letter-spacing="-2.5">da turma de Novembro.</text>

      <text x="0" y="280" class="font-sans" font-size="26" font-weight="400" fill="#D4D4D8">
        Basta copiar e rodar esta janela oficial antes do início de dezembro:
      </text>

      <!-- Central Feature Box: 3 Fases -->
      <g transform="translate(0, 335)">
        <rect x="0" y="0" width="920" height="435" rx="24" fill="#09090B" fill-opacity="0.96" stroke="#FFFFFF" stroke-opacity="0.20" stroke-width="2" />
        <line x1="80" y1="0" x2="840" y2="0" stroke="url(#rimHighlight)" stroke-width="1.5" />

        <!-- Fase 1 -->
        <g transform="translate(30, 26)">
          <rect x="0" y="0" width="860" height="114" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.09" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">FASE 1 • CAPTAÇÃO &amp; SPLIT PIX D+0</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#A1A1AA">01/11 A 08/11</text>
          <text x="30" y="82" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Você envia o link da turma para alunos e ex-alunos. O Pix cai na hora.</text>
        </g>

        <!-- Fase 2 (Destaque Titânio Branco) -->
        <g transform="translate(30, 160)">
          <rect x="0" y="0" width="860" height="114" rx="14" fill="#18181B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.28" stroke-width="2" />
          <line x1="0" y1="0" x2="0" y2="114" stroke="#FFFFFF" stroke-width="5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">FASE 2 • 21 DIAS DE COMPETIÇÃO AO VIVO</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF">09/11 A 30/11</text>
          <text x="30" y="82" class="font-sans" font-size="20" font-weight="400" fill="#E4E4E7">Câmera Antifraude sem galeria + Pódio em tempo real. Você audita em 15 min.</text>
        </g>

        <!-- Fase 3 -->
        <g transform="translate(30, 294)">
          <rect x="0" y="0" width="860" height="114" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.09" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">FASE 3 • PREMIAÇÃO &amp; RENOVAÇÃO DE VERÃO</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#D4D4D8">01/12</text>
          <text x="30" y="82" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Coroação do Top 3 e oferta direta para continuarem na sua consultoria.</text>
        </g>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
      <text x="64" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="750" y="14" width="170" height="46" rx="23" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
      <text x="835" y="43" text-anchor="middle" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">ARRASTE →</text>
    </g>
  </svg>
  `;

  // =========================================================================
  // SLIDE 4: A MATEMÁTICA DO SEU 13º SALÁRIO (100% Monocromático)
  // =========================================================================
  const slide4Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    <text x="980" y="440" text-anchor="end" class="font-sans" font-size="220" font-weight="900" fill="#FFFFFF" fill-opacity="0.02">13º</text>
    <rect width="1080" height="1350" fill="url(#calendarGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="340" height="52" rx="26" fill="#18181B" fill-opacity="0.88" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="2">CAIXA DE FIM DE ANO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">04 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 225)">
      <rect x="0" y="0" width="440" height="44" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="20" y="28" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2.5">SIMULAÇÃO DE FATURAMENTO LÍQUIDA</text>

      <text x="0" y="125" class="font-sans" font-size="72" font-weight="900" fill="#FFFFFF" letter-spacing="-2.5">Construa o seu próprio</text>
      <text x="0" y="208" class="font-sans" font-size="72" font-weight="900" fill="url(#textGrad)" letter-spacing="-2.5">13º salário em 21 dias.</text>

      <text x="0" y="275" class="font-sans" font-size="25" font-weight="400" fill="#D4D4D8">
        Ex-alunos que não pagam R$ 500 de personal entram em um
      </text>
      <text x="0" y="310" class="font-sans" font-size="25" font-weight="400" fill="#A1A1AA">
        Desafio Pré-Verão de R$ 97 a R$ 127 na mesma hora:
      </text>

      <!-- Central Feature Box: Tabela -->
      <g transform="translate(0, 350)">
        <rect x="0" y="0" width="920" height="430" rx="24" fill="#09090B" fill-opacity="0.96" stroke="#FFFFFF" stroke-opacity="0.20" stroke-width="2" />
        <line x1="80" y1="0" x2="840" y2="0" stroke="url(#rimHighlight)" stroke-width="1.5" />

        <!-- Linha 1 -->
        <g transform="translate(30, 28)">
          <rect x="0" y="0" width="860" height="94" rx="14" fill="#18181B" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-sans" font-size="22" font-weight="700" fill="#FFFFFF">TURMA ENXUTA DE NOVEMBRO</text>
          <text x="35" y="70" class="font-mono" font-size="17" font-weight="500" fill="#A1A1AA">25 alunos × R$ 97,00</text>
          <text x="825" y="58" text-anchor="end" class="font-mono" font-size="32" font-weight="700" fill="#FFFFFF">R$ 2.425,00</text>
        </g>

        <!-- Linha 2 (Destaque Monocromático Puro) -->
        <g transform="translate(30, 138)">
          <rect x="0" y="0" width="860" height="106" rx="14" fill="#18181B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.32" stroke-width="2" />
          <rect x="35" y="15" width="210" height="24" rx="6" fill="#FFFFFF" fill-opacity="0.14" />
          <text x="48" y="31" class="font-mono" font-size="11" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">META RECOMENDADA</text>
          <text x="35" y="66" class="font-sans" font-size="22" font-weight="700" fill="#FFFFFF">TURMA PRÉ-VERÃO (21 DIAS)</text>
          <text x="35" y="92" class="font-mono" font-size="17" font-weight="500" fill="#D4D4D8">35 alunos × R$ 117,00</text>
          <text x="825" y="68" text-anchor="end" class="font-mono" font-size="38" font-weight="700" fill="#FFFFFF">R$ 4.095,00</text>
        </g>

        <!-- Linha 3 -->
        <g transform="translate(30, 260)">
          <rect x="0" y="0" width="860" height="94" rx="14" fill="#18181B" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-sans" font-size="22" font-weight="700" fill="#FFFFFF">TURMA ESCALADA (COM SQUADS)</text>
          <text x="35" y="70" class="font-mono" font-size="17" font-weight="500" fill="#A1A1AA">50 alunos × R$ 127,00</text>
          <text x="825" y="58" text-anchor="end" class="font-mono" font-size="32" font-weight="700" fill="#FFFFFF">R$ 6.350,00</text>
        </g>

        <text x="460" y="398" text-anchor="middle" class="font-mono" font-size="14.5" font-weight="700" fill="#A1A1AA" letter-spacing="1.5">
          0% DE TAXA SOBRE INSCRIÇÕES NO PLANO PRO • PIX D+0 NA CONTA
        </text>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
      <text x="64" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="750" y="14" width="170" height="46" rx="23" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
      <text x="835" y="43" text-anchor="middle" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">ARRASTE →</text>
    </g>
  </svg>
  `;

  // =========================================================================
  // SLIDE 5: CTA OFICIAL (Plataforma Oficial no Ar — arenafitpro.app)
  // =========================================================================
  const slide5Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    <g transform="translate(540, 500)" stroke="#FFFFFF" fill="none">
      <circle r="180" stroke-opacity="0.04" stroke-width="2" />
      <circle r="300" stroke-opacity="0.03" stroke-width="1.5" stroke-dasharray="10 10" />
      <circle r="440" stroke-opacity="0.02" stroke-width="1" />
    </g>
    <rect width="1080" height="600" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="320" height="52" rx="26" fill="#18181B" fill-opacity="0.88" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="2">ACESSO IMEDIATO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">05 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 225)">
      <rect x="0" y="0" width="380" height="44" rx="8" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1" />
      <circle cx="24" cy="22" r="4.5" fill="#FFFFFF" />
      <text x="42" y="28" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF" letter-spacing="2.5">PLATAFORMA OFICIAL NO AR</text>

      <text x="0" y="125" class="font-sans" font-size="72" font-weight="900" fill="#FFFFFF" letter-spacing="-2.5">Lance seu Desafio de</text>
      <text x="0" y="208" class="font-sans" font-size="72" font-weight="900" fill="url(#textGrad)" letter-spacing="-2.5">Novembro em 3 minutos.</text>

      <text x="0" y="280" class="font-sans" font-size="26" font-weight="400" fill="#D4D4D8">
        Crie sua conta de treinador agora em <tspan fill="#FFFFFF" font-weight="700">arenafitpro.app</tspan> e ative
      </text>
      <text x="0" y="320" class="font-sans" font-size="26" font-weight="400" fill="#A1A1AA">
        a estrutura completa para abrir as inscrições da sua turma hoje:
      </text>

      <!-- Central Feature Box -->
      <g transform="translate(0, 375)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.96" stroke="#FFFFFF" stroke-opacity="0.24" stroke-width="2" />
        <line x1="80" y1="0" x2="840" y2="0" stroke="url(#rimHighlight)" stroke-width="2" />

        <!-- Benefício 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="106" rx="14" fill="#18181B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.26" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">01 • CONTA STARTER GRÁTIS OU PRO ILIMITADO</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF">ACESSO LIVRE</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#D4D4D8">Comece grátis sem cartão no Starter ou ative o PRO por R$ 49,90/mês.</text>
        </g>

        <!-- Benefício 2 -->
        <g transform="translate(30, 152)">
          <rect x="0" y="0" width="860" height="106" rx="14" fill="#18181B" fill-opacity="0.65" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">02 • 100% DA RECEITA NO SEU PIX (D+0)</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF">0% DE TAXA</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">No Plano PRO cobramos 0% de comissão sobre as inscrições da sua turma.</text>
        </g>

        <!-- Benefício 3 -->
        <g transform="translate(30, 279)">
          <rect x="0" y="0" width="860" height="106" rx="14" fill="#18181B" fill-opacity="0.65" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">03 • ZERO PRESCRIÇÃO MANUAL DE TREINOS</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="17" font-weight="700" fill="#D4D4D8">PRONTO</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Continue com seu PDF atual. O app cuida da câmera antifraude e do ranking.</text>
        </g>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
      <text x="64" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app</text>
      <rect x="640" y="14" width="280" height="48" rx="24" fill="#FFFFFF" />
      <text x="780" y="44" text-anchor="middle" class="font-mono" font-size="15" font-weight="700" fill="#000000" letter-spacing="1">CRIAR CONTA GRÁTIS →</text>
    </g>
  </svg>
  `;

  // Renderizar os 5 Slides do Carrossel
  const slides = [
    { svg: slide1Svg, file: 'slide-1.jpg', useHeroBg: true },
    { svg: slide2Svg, file: 'slide-2.jpg', useHeroBg: false },
    { svg: slide3Svg, file: 'slide-3.jpg', useHeroBg: false },
    { svg: slide4Svg, file: 'slide-4.jpg', useHeroBg: false },
    { svg: slide5Svg, file: 'slide-5.jpg', useHeroBg: false },
  ];

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const outPath = path.join(outputDir, s.file);

    const composites = [];
    if (s.useHeroBg) {
      composites.push({ input: heroDarkBuffer, top: 0, left: 0 });
    }
    composites.push(
      { input: Buffer.from(s.svg), top: 0, left: 0 },
      { input: logoBuffer, top: 82, left: 84 },
      { input: logoBuffer, top: 1226, left: 80 }
    );

    await sharp({
      create: { width: 1080, height: 1350, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } }
    })
      .composite(composites)
      .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
      .toFile(outPath);

    console.log(`✓ Slide ${i + 1}/5 gerado: ${outPath}`);
  }

  // Remover post-unico-novembro.jpg antigo colorido se existir
  const oldSingle = path.join(outputDir, 'post-unico-novembro.jpg');
  if (fs.existsSync(oldSingle)) {
    fs.unlinkSync(oldSingle);
  }

  // Salvar Legenda Oficial (Sem /beta — Plataforma Oficial no Ar)
  const legendaText = `Faltam 5 dias para Novembro. Você vai esperar seus alunos começarem a cancelar por causa do fim de ano ou vai criar o seu próprio 13º salário nos próximos 21 dias?

Todo ano o roteiro do mercado fitness se repete entre novembro e dezembro:
Enquanto quem trabalha no modelo CLT recebe 13º salário, o personal trainer e o nutricionista veem alunos perdendo o ritmo nos feriados, adiando renovações e prometendo "voltar em janeiro".

Mas existe uma janela cirúrgica no calendário que os treinadores mais lucrativos usam a seu favor:
Os 21 dias entre 09/11 e 30/11 (antes das confraternizações de dezembro).

Ninguém quer chegar nas festas de fim de ano e na praia fora de forma.

Quando você lança o seu "Desafio Operação Pré-Verão (21 Dias)" dentro da ArenaFitPro, você resolve dois problemas de uma vez só:

1. BLINDA A SUA RETENÇÃO ATUAL
Seus alunos entram em clima de campeonato, disputando ponto a ponto no Leaderboard em tempo real. Ninguém abandona o plano no meio de uma competição.

2. CRIA O SEU 13º SALÁRIO COM EX-ALUNOS E SEGUIDORES
Aquele seguidor ou ex-aluno que hoje não pode pagar R$ 500/mês de consultoria individual entra na hora em um Desafio de 21 Dias por R$ 97 a R$ 127:
• 25 alunos × R$ 97 = R$ 2.425,00
• 35 alunos × R$ 117 = R$ 4.095,00
• 50 alunos × R$ 127 = R$ 6.350,00

E o melhor: sem você precisar digitar 1 único exercício no aplicativo.
Você continua entregando seu treino/dieta pelo PDF ou app que já usa hoje, e a ArenaFitPro cuida de:
- Validar os treinos e refeições por Câmera Antifraude ao vivo (sem upload da galeria) + IA Nutricional.
- Atualizar o pódio da turma automaticamente a cada check-in aprovado na sua central de Swipe (15 min/dia).
- Liquidar as inscrições via Split Pix D+0 direto na sua conta bancária.

No Plano PRO da ArenaFitPro (apenas R$ 49,90/mês), nós cobramos 0% de taxa sobre as inscrições dos seus desafios — 100% do lucro da turma vai para o seu bolso. E você também pode criar sua conta gratuita agora mesmo no Plano Starter sem precisar de cartão.

👉 Comente "NOVEMBRO" aqui embaixo para receber o link direto no seu Direct ou acesse agora o link na bio: arenafitpro.app

#personaltrainer #consultoriafitness #desafiofitness #nutricaoesportiva #treinador #gestaofitness #gamificacao #arenafitpro`;

  fs.writeFileSync(path.join(outputDir, 'legenda.txt'), legendaText, 'utf-8');
  console.log('✓ Legenda atualizada salva em Post 10/legenda.txt');
  console.log('✅ Todos os 5 slides monocromáticos do Post 10 foram gerados com sucesso!');
}

generatePost10().catch(err => {
  console.error('Erro ao gerar Post 10:', err);
  process.exit(1);
});
