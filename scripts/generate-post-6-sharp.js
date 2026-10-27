const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePost6() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Post 6');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const logoPath = path.join(__dirname, '..', 'public', 'social', 'app-logo.png');

  console.log('Iniciando geração dos 5 slides do Post 6 com Sharp (1080x1350)...');

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

      <pattern id="blueprintGrid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/>
      </pattern>

      <style>
        .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>
    </defs>
  `;

  // ==========================================
  // SLIDE 1: CAPA (Zero Fricção)
  // Background: Blueprint de prancheta técnica + feixe de luz
  // ==========================================
  const slide1Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    <rect width="1080" height="700" fill="url(#topGlow)" />
    
    <!-- Background Específico: Blueprint técnico e marca d'água sutil [PDF / METHOD] -->
    <text x="960" y="440" text-anchor="end" class="font-mono" font-size="140" font-weight="900" fill="#FFFFFF" fill-opacity="0.015">PDF</text>
    <rect width="1080" height="1350" fill="url(#blueprintGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="300" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">ZERO BUROCRACIA</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">01 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <!-- Badge -->
      <rect x="0" y="0" width="320" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">O MAIOR ALÍVIO DO TREINADOR</text>

      <!-- Headline -->
      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Não, você NÃO</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">precisa digitar treinos</text>
      <text x="0" y="295" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">nem dietas aqui.</text>

      <!-- Subtitle -->
      <text x="0" y="375" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Continue entregando no seu PDF, vídeo ou planilha de sempre.
      </text>
      <text x="0" y="420" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        A ArenaFitPro é uma camada de auditoria e jogo — não um software burocrático.
      </text>

      <!-- Central Feature Box (Moldura Oficial) -->
      <g transform="translate(0, 480)">
        <rect x="0" y="0" width="920" height="240" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2" />
        <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1" />
        
        <text x="460" y="95" text-anchor="middle" class="font-mono" font-size="54" font-weight="900" fill="#FFFFFF" letter-spacing="1">ZERO CADASTRO MANUAL</text>
        <rect x="140" y="135" width="640" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="460" y="163" text-anchor="middle" class="font-mono" font-size="15" font-weight="700" fill="#D4D4D8" letter-spacing="2">SEU MÉTODO INTACTO • O APP AUDITA SE O ALUNO CUMPRIU</text>
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
  // SLIDE 2: O TRAUMA DOS APPS TRADICIONAIS
  // Background: Linhas diagonais sutis de 135 graus transmitindo ruptura do modelo arcaico
  // ==========================================
  const slide2Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Diagonais de ruptura -->
    <g stroke="#FFFFFF" stroke-opacity="0.02" stroke-width="1">
      <line x1="0" y1="0" x2="1080" y2="1080" />
      <line x1="200" y1="0" x2="1080" y2="880" />
      <line x1="0" y1="200" x2="880" y2="1080" />
      <line x1="400" y1="0" x2="1080" y2="680" />
    </g>
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="280" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">O PROBLEMA REAL</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">02 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="310" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">A FRUSTRAÇÃO DOS SOFTWARES</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Quantos apps você</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">já abandonou?</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Seja sincero: quantos sistemas você assinou e desistiu porque exigiam que você
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        passasse 3 finais de semana cadastrando 150 exercícios que ninguém lê?
      </text>

      <!-- Central Feature Box (Moldura Oficial: Comparativo) -->
      <g transform="translate(0, 390)">
        <rect x="0" y="0" width="920" height="390" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="2" />

        <!-- Card Pesadelo Tradicional -->
        <g transform="translate(30, 30)">
          <rect x="0" y="0" width="860" height="150" rx="16" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="150" stroke="#71717A" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="700" fill="#A1A1AA" letter-spacing="1">O PESADELO BUROCRÁTICO</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#71717A">LENTO &amp; PESADO</text>
          <text x="35" y="85" class="font-sans" font-size="22" font-weight="500" fill="#D4D4D8">Cadastrar séries, repetições e gramas de arroz em telas lentas.</text>
          <text x="35" y="118" class="font-sans" font-size="19" font-weight="400" fill="#71717A">O aluno acha confuso e volta a te pedir o treino em PDF no WhatsApp.</text>
        </g>

        <!-- Card Filosofia ArenaFitPro -->
        <g transform="translate(30, 205)">
          <rect x="0" y="0" width="860" height="155" rx="16" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="155" stroke="#FFFFFF" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="700" fill="#FFFFFF" letter-spacing="1">A FILOSOFIA ARENAFITPRO</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF">FOCO NA AÇÃO</text>
          <text x="35" y="85" class="font-sans" font-size="22" font-weight="600" fill="#FFFFFF">Você já tem seu método validado e aprovado pelos seus alunos.</text>
          <text x="35" y="118" class="font-sans" font-size="19" font-weight="400" fill="#A1A1AA">Nosso papel é garantir com tecnologia que o aluno execute até o final.</text>
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
  // SLIDE 3: A DIVISÃO DE TAREFAS (Arquitetura de Validação)
  // Background: Camadas concêntricas de arquitetura limpa
  // ==========================================
  const slide3Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Layer Architecture Markers -->
    <g transform="translate(540, 560)" stroke="#FFFFFF" fill="none">
      <rect x="-260" y="-180" width="520" height="360" rx="20" stroke-opacity="0.02" stroke-width="1.5" />
      <rect x="-380" y="-280" width="760" height="560" rx="30" stroke-opacity="0.015" stroke-width="1" stroke-dasharray="8 8" />
    </g>
    <rect width="1080" height="1350" fill="url(#blueprintGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="280" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">COMO FUNCIONA</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">03 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="310" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">ARQUITETURA DE VALIDAÇÃO</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Seu PDF prescreve.</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">O app audita.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Cada parte faz exatamente aquilo em que é especialista, sem retrabalho:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Camadas) -->
      <g transform="translate(0, 340)">
        <rect x="0" y="0" width="920" height="430" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Camada 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">01 • SEU PDF / VÍDEOS DE COSTUME</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#71717A">MÉTODO</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Entrega a periodização técnica, biomecânica e dieta que você já confia.</text>
        </g>

        <!-- Camada 2 -->
        <g transform="translate(30, 155)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">02 • FEED DE METAS DIÁRIAS</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF">JOGO</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">O app traduz sua rotina em check-ins claros: Treino do Dia, Água e Dieta.</text>
        </g>

        <!-- Camada 3 -->
        <g transform="translate(30, 285)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">03 • CÂMERA AO VIVO &amp; PÓDIO</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF">PROVA REAL</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#D4D4D8">O aluno fotografa na hora e ganha pontos reais. O ranking atualiza sozinho.</text>
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
  // SLIDE 4: PRODUTIVIDADE EXTREMA (Central de Swipe)
  // Background: Telemetria de cockpits e velocidade
  // ==========================================
  const slide4Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Colunas de auditoria rápida -->
    <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1.5">
      <line x1="240" y1="0" x2="240" y2="1350" />
      <line x1="480" y1="0" x2="480" y2="1350" />
      <line x1="720" y1="0" x2="720" y2="1350" />
      <line x1="960" y1="0" x2="960" y2="1350" />
    </g>
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">GESTÃO EFICIENTE</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">04 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="280" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">CENTRAL DE COMANDO</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Gerencie 50 alunos</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">em 15 min diários.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Chega de rolar centenas de conversas soltas no WhatsApp cobrando
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        se o aluno foi treinar ou se bebeu água:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Pilares de Produtividade) -->
      <g transform="translate(0, 380)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Item 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">01 • CENTRAL DE SWIPE RÁPIDO</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Fotos organizadas em lote. Deslize para aprovar ou reprovar em segundos.</text>
        </g>

        <!-- Item 2 -->
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">02 • RETENÇÃO COMUNITÁRIA</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">A disputa de posições engaja a turma sem você precisar cobrar no individual.</text>
        </g>

        <!-- Item 3 -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">03 • ZERO SUPORTE OPERACIONAL</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Interface web nativa (PWA): o aluno entra com 1 toque sem baixar na loja.</text>
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

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Rode seu próximo</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">desafio sem estresse.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Estamos selecionando 15 treinadores para o programa piloto fechado.
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        Condições permanentes e benefícios perpétuos na sua conta:
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
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Estrutura completa pronta para aplicar na sua turma de imediato.</text>
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
  const legendaText = `Seja sincero: quantos softwares você já assinou e abandonou porque tinha preguiça de passar horas cadastrando exercícios?

O maior pesadelo de qualquer personal trainer ou nutricionista é ter que digitar 150 exercícios, repetições, intervalos e cardápios dentro de um sistema novo que o aluno mal vai abrir.

A ArenaFitPro NÃO é um aplicativo de montagem de treino.

Nós somos uma camada de auditoria e gamificação:

1. VOCÊ CONTINUA PRESCREVENDO DO SEU JEITO
Continue entregando seu PDF, sua planilha ou seus vídeos de execução que você já domina e em que seus alunos confiam.

2. O APP TRANSFORMA SUA ROTINA EM MISSÕES
Seus alunos entram no app apenas para ver o placar e registrar o cumprimento do dia (Treino Feito com Câmera Antifraude ao vivo, Água e Dieta).

3. GERENCIE 50 ALUNOS EM 15 MINUTOS POR DIA
Você não precisa rolar grupos de WhatsApp nem responder 80 mensagens individuais. Com nossa central de Swipe, você aprova ou reprova check-ins com um toque.

Seu trabalho é prescrever. O nosso é garantir que o aluno vá lá e faça.

No Plano PRO da ArenaFitPro, cobramos 0% de taxa sobre inscrições (zero comissão por aluno) e apenas R$ 49,90/mês de mensalidade.

E para os 15 Treinadores Fundadores do Beta Fechado:
Plano PRO Vitalício Gratuito ($0 de mensalidade para sempre) com 0% de taxa por transação.

👉 Toque no link da bio e cadastre-se: arenafitpro.app/beta
Ou comente "PRO" que te enviamos o link no direct.

#personaltrainer #consultoriafitness #desafiofitness #gamificacao #treinador #arenafitpro #nutricaoesportiva #tecnologiafitness`;

  fs.writeFileSync(path.join(outputDir, 'legenda.txt'), legendaText, 'utf-8');
  console.log('✓ Legenda salva em Post 6/legenda.txt');

  console.log('✅ Todos os 5 slides do Post 6 foram gerados com sucesso!');
}

generatePost6().catch(err => {
  console.error('Erro ao gerar Post 6:', err);
  process.exit(1);
});
