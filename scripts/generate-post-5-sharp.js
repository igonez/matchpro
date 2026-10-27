const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePost5() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Post 5');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const logoPath = path.join(__dirname, '..', 'public', 'social', 'app-logo.png');

  console.log('Iniciando geração dos 5 slides do Post 5 com Sharp (1080x1350)...');

  // Preparar logo 48x48
  const logoBuffer = await sharp(logoPath).resize(48, 48).toBuffer();

  const commonDefs = `
    <defs>
      <linearGradient id="bgOled" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#050507" />
        <stop offset="40%" stop-color="#000000" />
        <stop offset="100%" stop-color="#000000" />
      </linearGradient>

      <linearGradient id="textGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#A1A1AA" />
      </linearGradient>

      <radialGradient id="topGlow" cx="50%" cy="12%" r="45%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.10" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>

      <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>

      <pattern id="dotGrid" width="36" height="36" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" fill-opacity="0.06" />
      </pattern>

      <pattern id="matrixGrid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/>
      </pattern>

      <style>
        .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>
    </defs>
  `;

  // ==========================================
  // SLIDE 1: CAPA (Alavancagem Financeira)
  // Background: Financial telemetry grid + ascendência geométrica
  // ==========================================
  const slide1Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Curvas e colunas financeiras ascendentes discretas em titânio -->
    <rect width="1080" height="700" fill="url(#topGlow)" />
    <path d="M 0 950 Q 280 920 540 820 T 1080 620 L 1080 1350 L 0 1350 Z" fill="#0C0C10" fill-opacity="0.6" />
    <path d="M 0 950 Q 280 920 540 820 T 1080 620" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2" />
    <path d="M 0 1050 Q 320 1010 600 890 T 1080 710" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1.5" stroke-dasharray="6 6" />
    <rect width="1080" height="1350" fill="url(#matrixGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="310" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">MODELO FINANCEIRO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">01 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <!-- Badge -->
      <rect x="0" y="0" width="280" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">ESCALA SEM HORA EXTRA</text>

      <!-- Headline -->
      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Como colocar</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">R$ 2.500 a R$ 6.000</text>
      <text x="0" y="295" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">a mais no bolso.</text>

      <!-- Subtitle -->
      <text x="0" y="375" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        A cada 21 dias, sem dar 1 hora a mais de aula.
      </text>
      <text x="0" y="420" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        O modelo financeiro que rompe a trava da sua agenda.
      </text>

      <!-- Central Feature Box (Moldura Oficial) -->
      <g transform="translate(0, 480)">
        <rect x="0" y="0" width="920" height="240" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2" />
        <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1" />
        
        <text x="460" y="95" text-anchor="middle" class="font-mono" font-size="60" font-weight="900" fill="#FFFFFF" letter-spacing="-1">+ R$ 6.350 / TURMA</text>
        <rect x="180" y="135" width="560" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="460" y="163" text-anchor="middle" class="font-mono" font-size="15" font-weight="700" fill="#D4D4D8" letter-spacing="2">ZERO HORAS EXTRAS • 15 MIN/DIA NO APP</text>
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

  // ==========================================
  // SLIDE 2: DIAGNÓSTICO (A Trava da Hora-Aula)
  // Background: Linha horizontal de teto rígido 24h + grade de tempo
  // ==========================================
  const slide2Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Linha de Teto Biológico 24H -->
    <line x1="0" y1="380" x2="1080" y2="380" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2" stroke-dasharray="12 12" />
    <rect x="800" y="360" width="200" height="28" rx="6" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
    <text x="900" y="379" text-anchor="middle" class="font-mono" font-size="11" font-weight="700" fill="#71717A" letter-spacing="1">TETO BIOLÓGICO 24H</text>
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="260" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">DIAGNÓSTICO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">02 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="270" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">A TRAVA DA HORA-AULA</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">O limite físico</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">do seu tempo.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Se você atende 8 a 10 alunos por dia, você bateu no teto.
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        Para faturar mais, você precisa abdicar da sua saúde ou da sua família.
      </text>

      <!-- Central Feature Box (Moldura Oficial: Comparativo) -->
      <g transform="translate(0, 390)">
        <rect x="0" y="0" width="920" height="390" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="2" />

        <!-- Card 1x1 -->
        <g transform="translate(30, 30)">
          <rect x="0" y="0" width="860" height="150" rx="16" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="150" stroke="#71717A" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="700" fill="#A1A1AA" letter-spacing="1">MODELO 1x1 TRADICIONAL</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#71717A">TETO RÍGIDO</text>
          <text x="35" y="85" class="font-sans" font-size="22" font-weight="500" fill="#D4D4D8">8 horas de aula presencial = 8 horas vendidas.</text>
          <text x="35" y="118" class="font-sans" font-size="19" font-weight="400" fill="#71717A">Se o aluno falta ou viaja, você não fatura. Zero alavancagem.</text>
        </g>

        <!-- Card Desafio -->
        <g transform="translate(30, 205)">
          <rect x="0" y="0" width="860" height="155" rx="16" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="155" stroke="#FFFFFF" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="700" fill="#FFFFFF" letter-spacing="1">MODELO DESAFIO SAZONAL 21 DIAS</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF">ESCALA LIMPA</text>
          <text x="35" y="85" class="font-sans" font-size="22" font-weight="600" fill="#FFFFFF">1 turma de 40 alunos = R$ 4.000 a R$ 6.000 de lucro.</text>
          <text x="35" y="118" class="font-sans" font-size="19" font-weight="400" fill="#A1A1AA">O app audita os check-ins. Você dedica apenas 15 min/dia.</text>
        </g>
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

  // ==========================================
  // SLIDE 3: A CALCULADORA (Matriz de Receita Líquida)
  // Background: Ledger matrix financeiro com marca d'água R$ discreta
  // ==========================================
  const slide3Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Marca d'água sutil de R$ e grid ortogonal de dados -->
    <text x="960" y="450" text-anchor="end" class="font-mono" font-size="240" font-weight="900" fill="#FFFFFF" fill-opacity="0.02">R$</text>
    <rect width="1080" height="1350" fill="url(#matrixGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">SIMULAÇÃO REAL</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">03 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="310" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">MATRIZ DE RECEITA LÍQUIDA</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">A conta é simples.</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">E previsível.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Veja quanto uma única turma trimestral injeta direto no seu caixa:
      </text>

      <!-- Central Feature Box (Moldura Oficial: Tabela Financeira) -->
      <g transform="translate(0, 340)">
        <rect x="0" y="0" width="920" height="440" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Linha 1: 30 alunos -->
        <g transform="translate(30, 30)">
          <rect x="0" y="0" width="860" height="95" rx="14" fill="#18181B" fill-opacity="0.5" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-sans" font-size="22" font-weight="700" fill="#FFFFFF">TURMA INICIAL DE TESTE</text>
          <text x="35" y="70" class="font-mono" font-size="17" font-weight="500" fill="#71717A">30 alunos × R$ 97,00</text>
          <text x="825" y="58" text-anchor="end" class="font-mono" font-size="30" font-weight="800" fill="#FFFFFF">R$ 2.910,00</text>
        </g>

        <!-- Linha 2: 50 alunos (Destaque) -->
        <g transform="translate(30, 140)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2" />
          <rect x="35" y="16" width="170" height="24" rx="6" fill="#FFFFFF" fill-opacity="0.12" />
          <text x="45" y="32" class="font-mono" font-size="11" font-weight="800" fill="#FFFFFF" letter-spacing="1">TURMA PADRÃO</text>
          <text x="35" y="65" class="font-sans" font-size="22" font-weight="700" fill="#FFFFFF">TURMA CONSOLIDADA</text>
          <text x="35" y="90" class="font-mono" font-size="17" font-weight="500" fill="#A1A1AA">50 alunos × R$ 127,00</text>
          <text x="825" y="68" text-anchor="end" class="font-mono" font-size="36" font-weight="900" fill="#FFFFFF">R$ 6.350,00</text>
        </g>

        <!-- Linha 3: 80 alunos -->
        <g transform="translate(30, 260)">
          <rect x="0" y="0" width="860" height="95" rx="14" fill="#18181B" fill-opacity="0.5" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-sans" font-size="22" font-weight="700" fill="#FFFFFF">COMUNIDADE MADURA</text>
          <text x="35" y="70" class="font-mono" font-size="17" font-weight="500" fill="#71717A">80 alunos × R$ 147,00</text>
          <text x="825" y="58" text-anchor="end" class="font-mono" font-size="30" font-weight="800" fill="#FFFFFF">R$ 11.760,00</text>
        </g>

        <!-- Bottom Pill -->
        <text x="460" y="405" text-anchor="middle" class="font-mono" font-size="16" font-weight="700" fill="#A1A1AA" letter-spacing="2">0% DE TAXA SOBRE INSCRIÇÕES • APENAS R$ 49,90/MÊS NO PRO</text>
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

  // ==========================================
  // SLIDE 4: PSICOLOGIA DE PREÇO (Ticket Acessível vs Alto Valor)
  // Background: Rede de nós interconectados (squads & comunidade)
  // ==========================================
  const slide4Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Nós conectados e linhas de rede em baixa opacidade -->
    <g stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1.5">
      <line x1="120" y1="200" x2="350" y2="350" />
      <line x1="350" y1="350" x2="700" y2="280" />
      <line x1="700" y1="280" x2="950" y2="420" />
      <line x1="350" y1="350" x2="480" y2="600" />
      <line x1="480" y1="600" x2="850" y2="750" />
      <line x1="850" y1="750" x2="1000" y2="950" />
      <circle cx="350" cy="350" r="4" fill="#FFFFFF" fill-opacity="0.2" />
      <circle cx="700" cy="280" r="4" fill="#FFFFFF" fill-opacity="0.2" />
      <circle cx="480" cy="600" r="4" fill="#FFFFFF" fill-opacity="0.2" />
      <circle cx="850" cy="750" r="4" fill="#FFFFFF" fill-opacity="0.2" />
    </g>
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">COMPORTAMENTO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">04 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="310" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">ALTA PERCEPÇÃO DE VALOR</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Ticket acessível,</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">experiência premium.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Quem não tem R$ 800/mês para personal particular compra seu desafio de
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        R$ 97 na hora. Veja os 3 pilares que geram essa adesão imediata:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Pilares) -->
      <g transform="translate(0, 380)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Pilar 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">01 • ACESSO À SUA LIDERANÇA</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">O aluno treina sob seu comando por 21 dias por uma fração do valor individual.</text>
        </g>

        <!-- Pilar 2 -->
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">02 • EXPERIÊNCIA DE JOGO REAL</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">App próprio com câmera antifraude, missões e pódio ao vivo. Parece um reality show.</text>
        </g>

        <!-- Pilar 3 -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">03 • CICLO FECHADO DE 21 DIAS</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Prazos curtos geram 3x mais comprometimento do que promessas de início de ano.</text>
        </g>
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

  // ==========================================
  // SLIDE 5: CONVOCAÇÃO BETA (15 Treinadores Fundadores)
  // Background: Anéis de selo de prestígio (Founder Seal) + Titânio
  // ==========================================
  const slide5Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Anéis concêntricos de selo institucional de fundador -->
    <g transform="translate(540, 500)" stroke="#FFFFFF" fill="none">
      <circle r="180" stroke-opacity="0.04" stroke-width="2" />
      <circle r="300" stroke-opacity="0.03" stroke-width="1.5" stroke-dasharray="10 10" />
      <circle r="440" stroke-opacity="0.02" stroke-width="1" />
    </g>
    <rect width="1080" height="600" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="280" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">BETA FECHADO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">05 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="260" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">15 VAGAS EXCLUSIVAS</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Rode sua 1ª turma</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">no Plano PRO Grátis.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Estamos selecionando 15 treinadores para o programa piloto.
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        Você roda o desafio com seus alunos e fica com o lucro da turma.
      </text>

      <!-- Central Feature Box (Moldura Oficial: Benefícios de Fundador) -->
      <g transform="translate(0, 380)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2" />

        <!-- Benefício 1: Plano PRO Gratuito -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">PLANO PRO VITALÍCIO GRATUITO</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">R$ 0 / MÊS</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#D4D4D8">Isenção perpétua da mensalidade de R$ 49,90 para os 15 treinadores fundadores.</text>
        </g>

        <!-- Benefício 2: 0% de Taxa -->
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">ZERO TAXA POR TRANSAÇÃO</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">0% DE TAXA</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">0% de taxa sobre inscrições. 100% da receita dos seus alunos fica no seu bolso.</text>
        </g>

        <!-- Benefício 3: Template Validado -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">TEMPLATE VALIDADO DE 21 DIAS</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">PRONTO</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Regras, pontuações e calendário prontos para aplicar na sua turma hoje.</text>
        </g>
      </g>
    </g>

    <!-- FOOTER -->
    <g transform="translate(80, 1220)">
      <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
      <text x="60" y="44" class="font-mono" font-size="20" font-weight="700" fill="#FFFFFF" letter-spacing="1">arenafitpro.app/beta</text>
      <rect x="710" y="14" width="210" height="48" rx="24" fill="#FFFFFF" />
      <text x="815" y="44" text-anchor="middle" class="font-mono" font-size="16" font-weight="900" fill="#000000" letter-spacing="1">CANDIDATURA →</text>
    </g>
  </svg>
  `;

  // Array de Slides
  const slides = [
    { svg: slide1Svg, file: 'slide-1.jpg' },
    { svg: slide2Svg, file: 'slide-2.jpg' },
    { svg: slide3Svg, file: 'slide-3.jpg' },
    { svg: slide4Svg, file: 'slide-4.jpg' },
    { svg: slide5Svg, file: 'slide-5.jpg' },
  ];

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const outputPath = path.join(outputDir, s.file);

    // Composições de logo
    const composites = [
      { input: Buffer.from(s.svg), top: 0, left: 0 },
      // Header logo
      { input: logoBuffer, top: 82, left: 82 },
      // Footer logo
      { input: logoBuffer, top: 1226, left: 80 }
    ];

    await sharp({
      create: {
        width: 1080,
        height: 1350,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      }
    })
    .composite(composites)
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toFile(outputPath);

    console.log(`✓ Slide ${i + 1}/5 gerado: ${outputPath}`);
  }

  console.log('Todos os 5 slides do Post 5 foram gerados com sucesso!');
}

generatePost5().catch(err => {
  console.error('Erro ao gerar slides do Post 5:', err);
  process.exit(1);
});
