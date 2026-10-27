const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePost7() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Post 7');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const logoPath = path.join(__dirname, '..', 'public', 'social', 'app-logo.png');

  console.log('Iniciando geração dos 5 slides do Post 7 com Sharp (1080x1350)...');

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

      <pattern id="dotGrid" width="36" height="36" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" fill-opacity="0.06" />
      </pattern>

      <pattern id="pixGrid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/>
      </pattern>

      <style>
        .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>
    </defs>
  `;

  // ==========================================
  // SLIDE 1: CAPA (Liquidação Imediata D+0)
  // Background: Malha de nós Pix e fluxos instantâneos
  // ==========================================
  const slide1Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    <rect width="1080" height="700" fill="url(#topGlow)" />
    
    <!-- Background Específico: Nós e conexões de pagamento Pix D+0 -->
    <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1.5" fill="none">
      <line x1="200" y1="180" x2="540" y2="340" />
      <line x1="540" y1="340" x2="880" y2="240" />
      <line x1="540" y1="340" x2="540" y2="780" />
      <line x1="540" y1="780" x2="280" y2="980" />
      <line x1="540" y1="780" x2="800" y2="980" />
      <circle cx="540" cy="340" r="6" fill="#FFFFFF" fill-opacity="0.15" />
      <circle cx="540" cy="780" r="6" fill="#FFFFFF" fill-opacity="0.15" />
    </g>
    <rect width="1080" height="1350" fill="url(#pixGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">FINANÇAS REAIS</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">01 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <!-- Badge -->
      <rect x="0" y="0" width="280" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">LIQUIDAÇÃO IMEDIATA D+0</text>

      <!-- Headline -->
      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">O dinheiro dos alunos</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">cai no seu Pix</text>
      <text x="0" y="295" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">no mesmo dia.</text>

      <!-- Subtitle -->
      <text x="0" y="375" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Sem esperar 14 a 30 dias para poder sacar. Sem risco de bitributação.
      </text>
      <text x="0" y="420" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        Conheça a infraestrutura financeira que protege o caixa do seu desafio.
      </text>

      <!-- Central Feature Box (Moldura Oficial) -->
      <g transform="translate(0, 480)">
        <rect x="0" y="0" width="920" height="240" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2" />
        <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1" />
        
        <text x="460" y="95" text-anchor="middle" class="font-mono" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="2">SPLIT PIX D+0 • 0% DE TAXA</text>
        <rect x="140" y="135" width="640" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="460" y="163" text-anchor="middle" class="font-mono" font-size="15" font-weight="700" fill="#D4D4D8" letter-spacing="2">PAGAMENTO DIRETO NA SUA CONTA • SEM INTERMEDIÁRIOS</text>
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
  // SLIDE 2: A ARMADILHA DO D+30
  // Background: Linha do tempo com barreira temporal cortada
  // ==========================================
  const slide2Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Linhas de retenção temporal D+30 -->
    <line x1="0" y1="420" x2="1080" y2="420" stroke="#FFFFFF" stroke-opacity="0.05" stroke-width="2" stroke-dasharray="14 14" />
    <rect x="780" y="400" width="220" height="28" rx="6" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
    <text x="890" y="419" text-anchor="middle" class="font-mono" font-size="11" font-weight="700" fill="#71717A" letter-spacing="1">TRAVA DE 30 DIAS</text>
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="270" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">O RISCO REAL</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">02 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="310" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">A TRAVA DOS LINKS GENÉRICOS</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Por que você não deve</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">usar links genéricos.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Plataformas convencionais foram desenhadas para infoprodutos gravados,
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        não para turmas ao vivo que exigem fluxo de caixa rápido e previsível.
      </text>

      <!-- Central Feature Box (Moldura Oficial: Comparativo) -->
      <g transform="translate(0, 390)">
        <rect x="0" y="0" width="920" height="390" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="2" />

        <!-- Card Plataformas Genéricas -->
        <g transform="translate(30, 30)">
          <rect x="0" y="0" width="860" height="150" rx="16" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="150" stroke="#71717A" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="700" fill="#A1A1AA" letter-spacing="1">PLATAFORMAS GENÉRICAS</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#71717A">D+14 A D+30</text>
          <text x="35" y="85" class="font-sans" font-size="22" font-weight="500" fill="#D4D4D8">Seu dinheiro fica bloqueado por até 30 dias na plataforma.</text>
          <text x="35" y="118" class="font-sans" font-size="19" font-weight="400" fill="#71717A">Taxas abusivas de 10% a 15% por inscrição + bitributação na nota.</text>
        </g>

        <!-- Card Infraestrutura ArenaFitPro -->
        <g transform="translate(30, 205)">
          <rect x="0" y="0" width="860" height="155" rx="16" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="155" stroke="#FFFFFF" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="700" fill="#FFFFFF" letter-spacing="1">INFRAESTRUTURA ARENAFITPRO</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF">PIX D+0</text>
          <text x="35" y="85" class="font-sans" font-size="22" font-weight="600" fill="#FFFFFF">O aluno paga via Pix. O dinheiro compensa na hora na sua conta.</text>
          <text x="35" y="118" class="font-sans" font-size="19" font-weight="400" fill="#A1A1AA">No Plano PRO: 0% de comissão retida. 100% da receita é sua.</text>
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
  // SLIDE 3: ARQUITETURA DE SPLIT (Zero Bitributação)
  // Background: Árvore de split em linhas ortogonais
  // ==========================================
  const slide3Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Split Tree Markers -->
    <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1.5" fill="none">
      <path d="M 540 180 L 540 280 L 280 380 L 280 480" />
      <path d="M 540 280 L 800 380 L 800 480" />
      <circle cx="540" cy="180" r="4" fill="#FFFFFF" fill-opacity="0.1" />
      <circle cx="280" cy="480" r="4" fill="#FFFFFF" fill-opacity="0.1" />
      <circle cx="800" cy="480" r="4" fill="#FFFFFF" fill-opacity="0.1" />
    </g>
    <rect width="1080" height="1350" fill="url(#pixGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="310" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">ARQUITETURA BANCÁRIA</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">03 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="260" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">DIVISÃO INTELIGENTE</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Divisão na fonte.</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">Zero bitributação.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Se você roda o desafio com um nutricionista ou academia parceira:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Pilares do Split) -->
      <g transform="translate(0, 340)">
        <rect x="0" y="0" width="920" height="430" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Item 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">01 • CHECKOUT PIX NATIVO</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#71717A">3 SEGUNDOS</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">O aluno escaneia o QR Code no app. Compensação instantânea na conta bancária.</text>
        </g>

        <!-- Item 2 -->
        <g transform="translate(30, 155)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">02 • SPLIT MULTICONTAS AUTOMÁTICO</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF">NA FONTE</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Se houver parceiros, a divisão é feita pelo banco. Nada de transferir no manual.</text>
        </g>

        <!-- Item 3 -->
        <g transform="translate(30, 285)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">03 • BLINDAGEM FISCAL</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF">100% LEGAL</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#D4D4D8">Cada parceiro emite nota apenas sobre sua parte. Você não paga imposto por terceiros.</text>
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
  // SLIDE 4: TELEMETRIA EM TEMPO REAL (Cockpit Financeiro)
  // Background: Matriz de auditoria bancária
  // ==========================================
  const slide4Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Colunas de auditoria bancária -->
    <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1.5">
      <line x1="240" y1="0" x2="240" y2="1350" />
      <line x1="480" y1="0" x2="480" y2="1350" />
      <line x1="720" y1="0" x2="720" y2="1350" />
      <line x1="960" y1="0" x2="960" y2="1350" />
    </g>
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="300" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">TRANSPARÊNCIA TOTAL</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">04 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="280" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">COCKPIT FINANCEIRO</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Controle total de cada</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">centavo da sua turma.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Chega de pedir print de comprovante de Pix no WhatsApp para
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        conferir um a um no extrato do seu aplicativo bancário:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Pilares) -->
      <g transform="translate(0, 380)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Item 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">01 • CONCILIAÇÃO BANCÁRIA REAL</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Zero comprovantes falsos. O app só libera acesso após a liquidação oficial no Banco Central.</text>
        </g>

        <!-- Item 2 -->
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">02 • RECEBIMENTO 100% LÍQUIDO</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">No Plano PRO você não perde 10% a 15% para a plataforma. Toda a receita do desafio é sua.</text>
        </g>

        <!-- Item 3 -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">03 • RELATÓRIO EXECUTIVO</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Extrato transparente com lista de alunos, horários e valores para controle do seu negócio.</text>
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

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Rode sua turma com</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">segurança bancária.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Estamos selecionando 15 treinadores para o programa piloto fechado.
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        Benefícios perpétuos e infraestrutura completa para o seu negócio:
      </text>

      <!-- Central Feature Box (Moldura Oficial: Benefícios de Fundador) -->
      <g transform="translate(0, 380)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2" />

        <!-- Benefício 1: Plano PRO Gratuito -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">PLANO PRO VITALÍCIO GRATUITO</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">R$ 0 / MÊS</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#D4D4D8">Isenção perpétua da mensalidade de R$ 49,90/mês para os 15 selecionados.</text>
        </g>

        <!-- Benefício 2: 0% de Taxa -->
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">ZERO TAXA POR TRANSAÇÃO</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">0% DE TAXA</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">0% de taxa sobre inscrições. 100% da receita dos seus alunos fica no seu bolso.</text>
        </g>

        <!-- Benefício 3: Split Pix D+0 -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">SPLIT PIX D+0 INTEGRADO</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">INSTANTÂNEO</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Recebimento direto na sua conta bancária sem travas de 14 ou 30 dias.</text>
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

  // Salvar legenda.txt
  const legendaText = `Você já esperou 30 dias para conseguir sacar o dinheiro de uma turma que você já começou a atender?

Se você já usou plataformas genéricas de cursos ou gateways tradicionais, sabe a dor:
1. O aluno paga hoje, mas o seu dinheiro fica retido em "D+30".
2. Você perde entre 10% e 15% de taxa por venda.
3. Se você divide o projeto com um nutricionista ou academia parceira, você recebe o valor bruto na sua conta e paga imposto em dobro (bitributação).

Na ArenaFitPro, nós tratamos o treinador como um empresário sério:

1. LIQUIDAÇÃO PIX D+0
O aluno escaneia o QR Code direto no app e a confirmação é imediata. O dinheiro compensa na sua conta bancária no mesmo dia.

2. ZERO TAXA SOBRE INSCRIÇÕES NO PLANO PRO
Você não entrega 10% a 15% do seu faturamento para a plataforma. No Plano PRO da ArenaFitPro, cobramos 0% de comissão sobre suas vendas (apenas a mensalidade fixa de R$ 49,90/mês).

3. SPLIT MULTICONTAS COM BLINDAGEM FISCAL
Se você tem parceiros (ex: nutricionista ou co-treinador), o sistema divide os valores na fonte bancária oficial. Cada parte tributa apenas o que é seu por direito.

4. CONCILIAÇÃO BANCÁRIA REAL
Zero prints falsos de comprovante no WhatsApp. O app só libera o acesso após a confirmação oficial no Banco Central.

Estamos selecionando 15 Treinadores Fundadores para o Programa Beta Fechado.
Condição de fundador: Plano PRO Vitalício Gratuito ($0 de mensalidade para sempre) + 0% de taxa por transação.

👉 Toque no link da bio e cadastre-se: arenafitpro.app/beta
Ou comente "PIX" que enviamos o link no direct.

#personaltrainer #consultoriafitness #desafiofitness #gestaofitness #treinador #arenafitpro #nutricaoesportiva #tecnologiafitness`;

  fs.writeFileSync(path.join(outputDir, 'legenda.txt'), legendaText, 'utf-8');
  console.log('✓ Legenda salva em Post 7/legenda.txt');

  console.log('✅ Todos os 5 slides do Post 7 foram gerados com sucesso!');
}

generatePost7().catch(err => {
  console.error('Erro ao gerar Post 7:', err);
  process.exit(1);
});
