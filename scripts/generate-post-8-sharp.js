const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePost8() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Post 8');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const logoPath = path.join(__dirname, '..', 'public', 'social', 'app-logo.png');

  console.log('Iniciando geração dos 5 slides do Post 8 com Sharp (1080x1350)...');

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

      <pattern id="communityMesh" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/>
      </pattern>

      <style>
        .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>
    </defs>
  `;

  // ==========================================
  // SLIDE 1: CAPA (Psicologia Social & Retenção 94.8%)
  // Background: Constelação de membros interconectados
  // ==========================================
  const slide1Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    <rect width="1080" height="700" fill="url(#topGlow)" />
    
    <!-- Background Específico: Constelação de nós comunitários -->
    <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1.5" fill="none">
      <circle cx="540" cy="500" r="260" stroke-opacity="0.02" />
      <line x1="280" y1="500" x2="800" y2="500" stroke-dasharray="8 8" />
      <circle cx="380" cy="420" r="5" fill="#FFFFFF" fill-opacity="0.1" />
      <circle cx="700" cy="420" r="5" fill="#FFFFFF" fill-opacity="0.1" />
      <circle cx="540" cy="360" r="7" fill="#FFFFFF" fill-opacity="0.2" />
      <circle cx="440" cy="580" r="5" fill="#FFFFFF" fill-opacity="0.1" />
      <circle cx="640" cy="580" r="5" fill="#FFFFFF" fill-opacity="0.1" />
    </g>
    <rect width="1080" height="1350" fill="url(#communityMesh)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">CIÊNCIA SOCIAL</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">01 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <!-- Badge -->
      <rect x="0" y="0" width="280" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">O EFEITO COMUNIDADE</text>

      <!-- Headline -->
      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Por que ninguém desiste</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">quando o pódio está</text>
      <text x="0" y="295" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">sendo disputado.</text>

      <!-- Subtitle -->
      <text x="0" y="375" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        A solidão é o maior veneno da disciplina física.
      </text>
      <text x="0" y="420" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        Veja como squads e ranking elevam a retenção dos seus alunos para 94.8%.
      </text>

      <!-- Central Feature Box (Moldura Oficial) -->
      <g transform="translate(0, 480)">
        <rect x="0" y="0" width="920" height="240" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2" />
        <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1" />
        
        <text x="460" y="95" text-anchor="middle" class="font-mono" font-size="54" font-weight="900" fill="#FFFFFF" letter-spacing="1">94.8% DE ADESÃO ATÉ O FIM</text>
        <rect x="150" y="135" width="620" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="460" y="163" text-anchor="middle" class="font-mono" font-size="15" font-weight="700" fill="#D4D4D8" letter-spacing="2">PRESSÃO SOCIAL POSITIVA • O GRUPO SE AUTOESTIMULA</text>
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
  // SLIDE 2: O ABANDONO SILENCIOSO
  // Background: Curva de evasão solitária em baixa luz
  // ==========================================
  const slide2Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Curva de evasão -->
    <path d="M 0 550 Q 300 580 600 780 T 1080 1100" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="2" stroke-dasharray="10 10" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="280" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">COMPORTAMENTO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">02 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="310" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">A MECÂNICA DA DESISTÊNCIA</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Na solidão do WhatsApp,</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">o abandono é silencioso.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Quando o aluno treina sozinho, faltar na quarta-feira não tem custo social.
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        Ninguém viu, ninguém sentiu falta e a desmotivação vence.
      </text>

      <!-- Central Feature Box (Moldura Oficial: Comparativo) -->
      <g transform="translate(0, 390)">
        <rect x="0" y="0" width="920" height="390" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="2" />

        <!-- Card Consultoria Solitária -->
        <g transform="translate(30, 30)">
          <rect x="0" y="0" width="860" height="150" rx="16" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="150" stroke="#71717A" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="700" fill="#A1A1AA" letter-spacing="1">CONSULTORIA SOLITÁRIA TRADICIONAL</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#71717A">23% ADESÃO</text>
          <text x="35" y="85" class="font-sans" font-size="22" font-weight="500" fill="#D4D4D8">O aluno para de responder no WhatsApp. Você cobra,</text>
          <text x="35" y="118" class="font-sans" font-size="19" font-weight="400" fill="#71717A">ele inventa desculpas de rotina e desaparece sem atrito nenhum.</text>
        </g>

        <!-- Card Squads & Leaderboard -->
        <g transform="translate(30, 205)">
          <rect x="0" y="0" width="860" height="155" rx="16" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="155" stroke="#FFFFFF" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="700" fill="#FFFFFF" letter-spacing="1">SQUADS &amp; LEADERBOARD ARENAFITPRO</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF">94.8% ADESÃO</text>
          <text x="35" y="85" class="font-sans" font-size="22" font-weight="600" fill="#FFFFFF">Cada check-in pontua no ranking e soma pontos para o time.</text>
          <text x="35" y="118" class="font-sans" font-size="19" font-weight="400" fill="#A1A1AA">Se o aluno falta, o time percebe. O custo de desistir se torna alto.</text>
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
  // SLIDE 3: OS 3 GATILHOS DA RETENÇÃO
  // Background: Tríade comportamental
  // ==========================================
  const slide3Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Triângulo sutil de forças comportamentais -->
    <g stroke="#FFFFFF" stroke-opacity="0.02" stroke-width="2" fill="none">
      <polygon points="540,240 240,680 840,680" />
    </g>
    <rect width="1080" height="1350" fill="url(#communityMesh)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="310" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">ENGENHARIA DO HÁBITO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">03 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="280" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">CIÊNCIA COMPORTAMENTAL</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">3 forças que fazem</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">o aluno ir treinar.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Mesmo nos dias de chuva, preguiça ou cansaço da rotina:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Forças) -->
      <g transform="translate(0, 340)">
        <rect x="0" y="0" width="920" height="430" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Item 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">01 • COMPARAÇÃO SOCIAL ASCENDENTE</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#71717A">INSTINTO</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Ver os colegas pontuando ativa o impulso inato de não ficar para trás na tabela.</text>
        </g>

        <!-- Item 2 -->
        <g transform="translate(30, 155)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">02 • RESPONSABILIDADE COLETIVA</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF">SQUADS</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">A pontuação da equipe depende de cada um. O aluno treina pelo compromisso com o time.</text>
        </g>

        <!-- Item 3 -->
        <g transform="translate(30, 285)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">03 • FEEDBACK LOOP IMEDIATO</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF">DOPAMINA</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#D4D4D8">Câmera ao vivo -> validação instantânea -> pontos e subida no ranking em segundos.</text>
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
  // SLIDE 4: O FIM DO COBRADOR CHATO
  // Background: Silhueta minimalista de pódio
  // ==========================================
  const slide4Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Silhueta sutil de pódio (degraus 2, 1, 3) -->
    <g stroke="#FFFFFF" stroke-opacity="0.03" fill="none">
      <rect x="220" y="600" width="180" height="400" rx="10" />
      <rect x="440" y="520" width="200" height="480" rx="10" />
      <rect x="680" y="660" width="180" height="340" rx="10" />
    </g>
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="280" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">POSICIONAMENTO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">04 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="280" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">LIDERANÇA DE IMPACTO</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Você deixa de ser</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">o cobrador chato.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Em vez de passar o dia implorando no individual para o aluno ir treinar,
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        você se torna o mentor que comemora a conquista e entrega a premiação:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Pilares de Liderança) -->
      <g transform="translate(0, 380)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Item 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">01 • AUTOENGAGAMENTO ORGÂNICO</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Os próprios alunos se motivam e cobram quem atrasou. A energia vem do grupo.</text>
        </g>

        <!-- Item 2 -->
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">02 • FOTOS REAIS DE RESULTADO</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Mais de 90% cumprem os 21 dias até o fim. O volume de antes/depois explode suas vendas.</text>
        </g>

        <!-- Item 3 -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">03 • RENOVAÇÃO EM MASSA</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">A dopamina da disputa pelo pódio faz a turma pedir para entrar na próxima turma na hora.</text>
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

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Crie uma comunidade</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">viciada em evoluir.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Estamos selecionando 15 treinadores para o programa piloto fechado.
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        Benefícios perpétuos e o sistema de retenção completo na sua conta:
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

        <!-- Benefício 3: Squads e Leaderboard -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">GAMIFICAÇÃO &amp; SQUADS COMPLETOS</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">ATIVADO</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Leaderboard em tempo real, pontuação diária e mecânica de times pronta para rodar.</text>
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
  const legendaText = `Por que seus alunos começam empolgados na segunda-feira e na segunda semana começam a sumir?

A resposta não está na sua periodização técnica nem na dieta que você prescreveu. Está na solidão.

O treino individual solitário é o ambiente perfeito para o abandono. Se o aluno falta em uma quarta-feira de chuva, ninguém viu. Ninguém cobra. Não há custo social. A desistência é silenciosa.

Na ArenaFitPro, nós ativamos a força mais poderosa do comportamento humano: a pressão social positiva.

1. LEADERBOARD EM TEMPO REAL
Cada check-in validado pela câmera ao vivo atualiza o placar imediatamente. A disputa pelo top 3 do pódio vicia a turma e gera um engajamento visceral.

2. DINÂMICA DE SQUADS (EQUIPES)
Os alunos são divididos em times. A pontuação da equipe depende da disciplina de todos. O aluno vai para a academia não apenas por si, mas para não deixar seus companheiros para trás.

3. VOCÊ DEIXA DE SER O COBRADOR CHATO
Chega de ficar mandando mensagem no individual perguntando "treinou hoje?". A própria comunidade se autoengaja, comemora as vitórias e puxa quem está ficando para trás.

O resultado? A retenção média sobe de 23% para 94.8% dos participantes completando os 21 dias até o fim.

No Plano PRO da ArenaFitPro, você tem 0% de taxa sobre as inscrições e apenas R$ 49,90/mês de mensalidade.

E para os 15 Treinadores Fundadores do programa piloto:
Plano PRO Vitalício Gratuito ($0 de mensalidade para sempre) com 0% de taxa por transação.

👉 Toque no link da bio e candidate-se ao Beta Fechado: arenafitpro.app/beta
Ou comente "SQUADS" que enviamos o link no seu direct.

#personaltrainer #consultoriafitness #desafiofitness #gamificacao #treinador #arenafitpro #nutricaoesportiva #tecnologiafitness`;

  fs.writeFileSync(path.join(outputDir, 'legenda.txt'), legendaText, 'utf-8');
  console.log('✓ Legenda salva em Post 8/legenda.txt');

  console.log('✅ Todos os 5 slides do Post 8 foram gerados com sucesso!');
}

generatePost8().catch(err => {
  console.error('Erro ao gerar Post 8:', err);
  process.exit(1);
});
