const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePost9() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Post 9');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const logoPath = path.join(__dirname, '..', 'public', 'social', 'app-logo.png');

  console.log('Iniciando geração dos 5 slides do Post 9 com Sharp (1080x1350)...');

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

      <pattern id="faqMesh" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/>
      </pattern>

      <style>
        .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .font-sans { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>
    </defs>
  `;

  // ==========================================
  // SLIDE 1: CAPA (FAQ & Seleção Final)
  // Background: Malha de checklist e nó de verificação
  // ==========================================
  const slide1Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    <rect width="1080" height="700" fill="url(#topGlow)" />
    
    <!-- Background Específico: Marca d'água sutil FAQ / 15 -->
    <text x="960" y="440" text-anchor="end" class="font-mono" font-size="140" font-weight="900" fill="#FFFFFF" fill-opacity="0.015">FAQ</text>
    <rect width="1080" height="1350" fill="url(#faqMesh)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="280" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">ÚLTIMA CHAMADA</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">01 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <!-- Badge -->
      <rect x="0" y="0" width="310" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">FAQ &amp; SELEÇÃO DE FUNDADORES</text>

      <!-- Headline -->
      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Tudo o que você precisa</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">saber antes de entrar</text>
      <text x="0" y="295" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">no Beta Fechado.</text>

      <!-- Subtitle -->
      <text x="0" y="375" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Respondemos as 4 principais dúvidas dos treinadores e explicamos
      </text>
      <text x="0" y="420" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        o que acontece se as 15 vagas de fundador esgotarem.
      </text>

      <!-- Central Feature Box (Moldura Oficial) -->
      <g transform="translate(0, 480)">
        <rect x="0" y="0" width="920" height="240" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2" />
        <line x1="0" y1="0" x2="920" y2="0" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1" />
        
        <text x="460" y="95" text-anchor="middle" class="font-mono" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="2">15 VAGAS DE FUNDADOR</text>
        <rect x="110" y="135" width="700" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="460" y="163" text-anchor="middle" class="font-mono" font-size="15" font-weight="700" fill="#D4D4D8" letter-spacing="2">PLANO PRO VITALÍCIO GRATUITO • 0% DE TAXA • ACESSO VIP</text>
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
  // SLIDE 2: CUSTOS & TAMANHO DA TURMA
  // Background: Grid analítico com linhas guias
  // ==========================================
  const slide2Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Linhas guias analíticas -->
    <line x1="120" y1="0" x2="120" y2="1350" stroke="#FFFFFF" stroke-opacity="0.02" stroke-width="1" />
    <line x1="960" y1="0" x2="960" y2="1350" stroke="#FFFFFF" stroke-opacity="0.02" stroke-width="1" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">REGRAS DO PILOTO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">02 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="280" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">CRITÉRIOS DE ADMISSÃO</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Custos e tamanho</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">da sua turma.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Acesso descomplicado para você validar o app com alunos reais:
      </text>

      <!-- Central Feature Box (Moldura Oficial: Comparativo) -->
      <g transform="translate(0, 370)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="2" />

        <!-- Card 1: Quanto Custa -->
        <g transform="translate(30, 30)">
          <rect x="0" y="0" width="860" height="160" rx="16" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="160" stroke="#FFFFFF" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF" letter-spacing="1">QUANTO CUSTA PARTICIPAR DO PILOTO?</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="18" font-weight="900" fill="#FFFFFF">R$ 0,00</text>
          <text x="35" y="88" class="font-sans" font-size="21" font-weight="500" fill="#D4D4D8">Os 15 selecionados recebem o Plano PRO Vitalício Gratuito ($0 de mensalidade</text>
          <text x="35" y="122" class="font-sans" font-size="21" font-weight="500" fill="#D4D4D8">para sempre) com 0% de taxa sobre inscrições. 100% do lucro é seu.</text>
        </g>

        <!-- Card 2: Quantos Alunos -->
        <g transform="translate(30, 215)">
          <rect x="0" y="0" width="860" height="160" rx="16" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <line x1="0" y1="0" x2="0" y2="160" stroke="#71717A" stroke-width="6" />
          <text x="35" y="45" class="font-mono" font-size="18" font-weight="700" fill="#A1A1AA" letter-spacing="1">QUANTOS ALUNOS EU PRECISO TER?</text>
          <text x="825" y="45" text-anchor="end" class="font-mono" font-size="17" font-weight="700" fill="#71717A">5 A 30 ALUNOS</text>
          <text x="35" y="88" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">Pode ser sua turma atual de consultoria presencial ou online que você quer</text>
          <text x="35" y="122" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">transformar em um desafio gamificado de 21 dias de alta retenção.</text>
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
  // SLIDE 3: OPERAÇÃO TÉCNICA (Prescrição & Saque)
  // Background: Blueprint de conexões operacionais
  // ==========================================
  const slide3Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Blueprint de conexões operacionais -->
    <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1.5" fill="none">
      <path d="M 200 400 L 540 400 L 540 800 L 880 800" />
      <circle cx="200" cy="400" r="5" fill="#FFFFFF" fill-opacity="0.1" />
      <circle cx="540" cy="400" r="5" fill="#FFFFFF" fill-opacity="0.1" />
      <circle cx="540" cy="800" r="5" fill="#FFFFFF" fill-opacity="0.1" />
      <circle cx="880" cy="800" r="5" fill="#FFFFFF" fill-opacity="0.1" />
    </g>
    <rect width="1080" height="1350" fill="url(#faqMesh)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">OPERAÇÃO TÉCNICA</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">03 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="270" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">SIMPLICIDADE DE USO</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Prescrição e saque</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">das inscrições.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Zero atrito técnico e financeiro na sua rotina diária:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Dúvidas Técnicas) -->
      <g transform="translate(0, 340)">
        <rect x="0" y="0" width="920" height="430" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Item 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">01 • PRECISO DIGITAR TREINOS NO APP?</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#71717A">NÃO</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Você continua entregando seu PDF ou vídeo de costume. O app apenas audita as metas.</text>
        </g>

        <!-- Item 2 -->
        <g transform="translate(30, 155)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">02 • QUANDO O DINHEIRO CAI NA CONTA?</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF">PIX D+0</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Imediatamente no mesmo dia via Pix, direto na sua conta bancária sem travas de 30 dias.</text>
        </g>

        <!-- Item 3 -->
        <g transform="translate(30, 285)">
          <rect x="0" y="0" width="860" height="110" rx="14" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
          <text x="35" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">03 • TEREI SUPORTE PARA RODAR?</text>
          <text x="825" y="42" text-anchor="end" class="font-mono" font-size="15" font-weight="700" fill="#FFFFFF">WHATSAPP VIP</text>
          <text x="35" y="80" class="font-sans" font-size="20" font-weight="400" fill="#D4D4D8">Acesso direto ao grupo com os desenvolvedores da plataforma para calibrar sua turma.</text>
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
  // SLIDE 4: O TRANSBORDO VIP
  // Background: Fila de prioridade e assento reservado
  // ==========================================
  const slide4Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <!-- Fundo OLED Base -->
    <rect width="1080" height="1350" fill="url(#bgOled)" />
    
    <!-- Background Específico: Diagonais de fila de espera -->
    <g stroke="#FFFFFF" stroke-opacity="0.02" stroke-width="1.5">
      <line x1="0" y1="200" x2="1080" y2="200" stroke-dasharray="12 12" />
      <line x1="0" y1="600" x2="1080" y2="600" stroke-dasharray="12 12" />
      <line x1="0" y1="1000" x2="1080" y2="1000" stroke-dasharray="12 12" />
    </g>
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="270" height="52" rx="26" fill="#18181B" fill-opacity="0.85" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">FILA DE ESPERA</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">04 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 230)">
      <rect x="0" y="0" width="260" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">TRANSBORDO VIP</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">E se as 15 vagas</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">já tiverem acabado?</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Para manter a qualidade e o suporte próximo, não aceitaremos mais de 15
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        treinadores no piloto deste mês. Veja como funciona a fila de espera:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Passos da Fila) -->
      <g transform="translate(0, 380)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="2" />

        <!-- Item 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">01 • AVALIAÇÃO POR ORDEM DE CHEGADA</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Analisamos cada cadastro manualmente. Se seu perfil for aprovado, o acesso é liberado.</text>
        </g>

        <!-- Item 2 -->
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">02 • PRIORIDADE NA LISTA VIP</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Quem não entrar na primeira turma é direcionado para a Lista VIP com prioridade oficial.</text>
        </g>

        <!-- Item 3 -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="700" fill="#FFFFFF" letter-spacing="1">03 • CONDIÇÃO ESPECIAL PRESERVADA</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Membros da Lista VIP receberão condições especiais exclusivas no lançamento oficial.</text>
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
  // SLIDE 5: COMO GARANTIR SUA VAGA
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
      <rect x="0" y="0" width="240" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="3">ÚLTIMO PASSO</text>

      <text x="0" y="125" class="font-sans" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-3">Garanta sua vaga</text>
      <text x="0" y="210" class="font-sans" font-size="76" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">de Treinador Fundador.</text>

      <text x="0" y="285" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Leva menos de 60 segundos para preencher sua candidatura:
      </text>
      <text x="0" y="330" class="font-sans" font-size="28" font-weight="500" fill="#A1A1AA" letter-spacing="-0.5">
        Processo simples, sem burocracia e com liberação direta pelo time:
      </text>

      <!-- Central Feature Box (Moldura Oficial: 3 Passos) -->
      <g transform="translate(0, 380)">
        <rect x="0" y="0" width="920" height="410" rx="24" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2" />

        <!-- Passo 1 -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">01 • TOQUE NO LINK DA BIO</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">LINK</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#D4D4D8">Acesse arenafitpro.app/beta e preencha seus dados de treinador em 1 minuto.</text>
        </g>

        <!-- Passo 2 -->
        <g transform="translate(30, 150)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">02 • DEFINA SUA TURMA</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">5 A 30 ALUNOS</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Informe a data aproximada em que você pretende rodar o seu desafio de 21 dias.</text>
        </g>

        <!-- Passo 3 -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="860" height="105" rx="14" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5" />
          <text x="30" y="42" class="font-mono" font-size="17" font-weight="800" fill="#FFFFFF" letter-spacing="1">03 • LIBERAÇÃO IMEDIATA</text>
          <text x="830" y="42" text-anchor="end" class="font-mono" font-size="18" font-weight="800" fill="#FFFFFF">WHATSAPP</text>
          <text x="30" y="78" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Nosso time entra em contato e libera seu Plano PRO Vitalício Gratuito (0% de taxa).</text>
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
  const legendaText = `Você ainda tem dúvidas sobre como funciona o Programa Beta Fechado da ArenaFitPro?

Separamos as 4 perguntas mais comuns dos treinadores antes de se candidatarem:

1. QUANTO CUSTA PARTICIPAR DO BETA?
R$ 0,00. Os 15 treinadores selecionados recebem o Plano PRO Vitalício Gratuito ($0 de mensalidade para sempre) com 0% de taxa sobre as inscrições. 100% da receita dos seus alunos fica no seu bolso.

2. QUANTOS ALUNOS EU PRECISO TER?
De 5 a 30 alunos. Pode ser sua turma atual de consultoria presencial ou online que você quer transformar em um desafio gamificado de 21 dias.

3. PRECISO CADASTRAR TREINOS OU DIETAS NO APP?
Não. Você continua prescrevendo seu método no seu PDF, vídeo ou planilha de costume. A ArenaFitPro é uma camada de jogo e auditoria (Câmera Antifraude ao vivo e Ranking em tempo real).

4. E SE AS 15 VAGAS DE FUNDADOR ACABAREM?
Para garantir suporte próximo, limitamos rigorosamente a 15 vagas no piloto deste mês. Quem não entrar na primeira turma é automaticamente direcionado para a Lista VIP com prioridade e condições especiais na abertura global.

As candidaturas estão abertas e avaliamos cada perfil por ordem de chegada.

Como garantir sua vaga:
👉 Toque no link da bio: arenafitpro.app/beta
Ou comente "VAGA" aqui embaixo que te enviamos o link no direct.

#personaltrainer #consultoriafitness #desafiofitness #gamificacao #treinador #arenafitpro #nutricaoesportiva #tecnologiafitness`;

  fs.writeFileSync(path.join(outputDir, 'legenda.txt'), legendaText, 'utf-8');
  console.log('✓ Legenda salva em Post 9/legenda.txt');

  console.log('✅ Todos os 5 slides do Post 9 foram gerados com sucesso!');
}

generatePost9().catch(err => {
  console.error('Erro ao gerar Post 9:', err);
  process.exit(1);
});
