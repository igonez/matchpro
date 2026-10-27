const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePost4() {
  const outputDir = path.join(__dirname, '..', 'public', 'social', 'Postagens Instagram', 'Post 4');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const heroImgPath = path.join(__dirname, '..', 'public', 'social', 'hero-post-2.jpg');
  const logoPath = path.join(__dirname, '..', 'public', 'social', 'app-logo.png');

  console.log('Iniciando geração dos 5 slides do Post 4 com Sharp (1080x1350)...');

  // Preparar logo 48x48
  const logoBuffer = await sharp(logoPath).resize(48, 48).toBuffer();

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
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" fill-opacity="0.8" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="2">INTEGRIDADE REAL</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">01 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 240)">
      <rect x="0" y="0" width="320" height="42" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="27" class="font-mono" font-size="16" font-weight="700" fill="#A1A1AA" letter-spacing="3">TECNOLOGIA ANTIFRAUDE</text>

      <text x="0" y="130" class="font-sans" font-size="80" font-weight="900" fill="#FFFFFF" letter-spacing="-3">O fim da foto</text>
      <text x="0" y="220" class="font-sans" font-size="80" font-weight="900" fill="url(#textGrad)" letter-spacing="-3">da galeria.</text>

      <text x="0" y="300" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        Por que desafios no WhatsApp perdem a credibilidade
      </text>
      <text x="0" y="345" class="font-sans" font-size="28" font-weight="500" fill="#D4D4D8" letter-spacing="-0.5">
        quando a turma percebe que o pódio não é 100% honesto.
      </text>

      <!-- Highlight Metric Box -->
      <g transform="translate(0, 420)">
        <rect x="0" y="0" width="920" height="190" rx="24" fill="#09090B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="2" />
        <text x="460" y="85" text-anchor="middle" class="font-mono" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="3">BLOQUEIO NATIVO</text>
        <text x="460" y="145" text-anchor="middle" class="font-mono" font-size="20" font-weight="700" fill="#A1A1AA" letter-spacing="2">CHECK-IN VÁLIDO APENAS PELA CÂMERA AO VIVO</text>
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
  // SLIDE 2: O PROBLEMA NO WHATSAPP
  // ==========================================
  const slide2Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="#000000" />
    <rect width="1080" height="500" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="310" height="52" rx="26" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">O CAOS NO WHATSAPP</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">02 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 220)">
      <rect x="0" y="0" width="290" height="40" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="26" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2">VULNERABILIDADE REAL</text>

      <text x="0" y="110" class="font-sans" font-size="54" font-weight="900" fill="#FFFFFF" letter-spacing="-2">Como saber se o treino</text>
      <text x="0" y="175" class="font-sans" font-size="54" font-weight="900" fill="url(#textGrad)" letter-spacing="-2">foi feito hoje ou há 2 semanas?</text>

      <text x="0" y="250" class="font-sans" font-size="24" font-weight="400" fill="#D4D4D8" letter-spacing="-0.3">
        Nos grupos convencionais de WhatsApp, o treinador depende da boa-fé cega.
      </text>
      <text x="0" y="290" class="font-sans" font-size="24" font-weight="400" fill="#D4D4D8" letter-spacing="-0.3">
        E quando alguém burla as regras, toda a dinâmica da turma desmorona:
      </text>

      <!-- Bento Card 1 -->
      <g transform="translate(0, 360)">
        <rect x="0" y="0" width="920" height="180" rx="24" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="36" y="36" width="90" height="108" rx="16" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="81" y="104" text-anchor="middle" class="font-mono" font-size="40" font-weight="800" fill="#71717A">01</text>
        <text x="160" y="80" class="font-sans" font-size="32" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">A Trapaça Silenciosa</text>
        <text x="160" y="122" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">O aluno não treina na quarta, busca uma foto antiga no rolo e posta às 23h.</text>
      </g>

      <!-- Bento Card 2 -->
      <g transform="translate(0, 580)">
        <rect x="0" y="0" width="920" height="180" rx="24" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
        <rect x="36" y="36" width="90" height="108" rx="16" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
        <text x="81" y="104" text-anchor="middle" class="font-mono" font-size="40" font-weight="800" fill="#71717A">02</text>
        <text x="160" y="80" class="font-sans" font-size="32" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Desmotivação da Turma</text>
        <text x="160" y="122" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">Quem acordou cedo de verdade percebe o pódio corrompido e abandona o desafio.</text>
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
  // SLIDE 3: MECANISMO CÂMERA NATIVA AO VIVO
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
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">MECANISMO EXCLUSIVO</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">03 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 220)">
      <rect x="0" y="0" width="300" height="40" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="26" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2">SENSOR FORÇADO AO VIVO</text>

      <text x="0" y="110" class="font-sans" font-size="54" font-weight="900" fill="#FFFFFF" letter-spacing="-2">Zero upload de galeria.</text>
      <text x="0" y="175" class="font-sans" font-size="54" font-weight="900" fill="url(#textGrad)" letter-spacing="-2">Foto capturada na hora.</text>

      <!-- Checklist 3 Items -->
      <g transform="translate(0, 240)">
        <!-- Item 1 -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="920" height="150" rx="20" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="30" y="45" width="60" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1" />
          <text x="60" y="84" text-anchor="middle" class="font-mono" font-size="28" font-weight="900" fill="#FFFFFF">✓</text>
          <text x="120" y="66" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Bloqueio Nativo de Galeria</text>
          <text x="120" y="104" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">O app aciona o sensor óptico. Não existe botão de escolher foto da biblioteca.</text>
        </g>

        <!-- Item 2 -->
        <g transform="translate(0, 180)">
          <rect x="0" y="0" width="920" height="150" rx="20" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="30" y="45" width="60" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1" />
          <text x="60" y="84" text-anchor="middle" class="font-mono" font-size="28" font-weight="900" fill="#FFFFFF">✓</text>
          <text x="120" y="66" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Timestamp Criptografado</text>
          <text x="120" y="104" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">Cada submissão recebe carimbo temporal no clique antes do sincronismo em nuvem.</text>
        </g>

        <!-- Item 3 -->
        <g transform="translate(0, 360)">
          <rect x="0" y="0" width="920" height="150" rx="20" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="30" y="45" width="60" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.1" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1" />
          <text x="60" y="84" text-anchor="middle" class="font-mono" font-size="28" font-weight="900" fill="#FFFFFF">✓</text>
          <text x="120" y="66" class="font-sans" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Pódio 100% Inquestionável</text>
          <text x="120" y="104" class="font-sans" font-size="20" font-weight="400" fill="#A1A1AA">A turma compete com total confiança de que os líderes realmente cumpriram a meta.</text>
        </g>
      </g>

      <text x="460" y="820" text-anchor="middle" class="font-mono" font-size="18" font-weight="600" fill="#71717A" letter-spacing="1">
        Mais respeito a quem realmente treina. Menos desgaste para você.
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

  await sharp(Buffer.from(slide3Svg))
    .composite([
      { input: logoBuffer, top: 82, left: 86 },
      { input: logoBuffer, top: 1234, left: 80 }
    ])
    .jpeg({ quality: 96 })
    .toFile(path.join(outputDir, 'slide-3.jpg'));
  console.log('✓ Slide 3 gerado: slide-3.jpg');

  // ==========================================
  // SLIDE 4: IA NUTRICIONAL + AUDITORIA EM SWIPE
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
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">VISÃO COMPUTACIONAL</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">04 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 220)">
      <rect x="0" y="0" width="300" height="40" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="26" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2">IA NUTRICIONAL INTEGRADA</text>

      <text x="0" y="110" class="font-sans" font-size="54" font-weight="900" fill="#FFFFFF" letter-spacing="-2">Foto do prato auditada</text>
      <text x="0" y="175" class="font-sans" font-size="54" font-weight="900" fill="url(#textGrad)" letter-spacing="-2">com estimativa de macros.</text>

      <g transform="translate(0, 240)">
        <!-- Card 1 -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="920" height="160" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
          <text x="36" y="58" class="font-sans" font-size="30" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Reconhecimento Visual Instantâneo</text>
          <text x="36" y="100" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">O aluno fotografa a refeição e a IA estima calorias e distribuição de</text>
          <text x="36" y="130" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">proteínas, carboidratos e gorduras para educar a disciplina diária.</text>
        </g>

        <!-- Card 2 -->
        <g transform="translate(0, 190)">
          <rect x="0" y="0" width="920" height="160" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5" />
          <text x="36" y="58" class="font-sans" font-size="30" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Cockpit do Coach em Swipe</text>
          <text x="36" y="100" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">Chega de abrir dezenas de mensagens no WhatsApp. Você audita</text>
          <text x="36" y="130" class="font-sans" font-size="21" font-weight="400" fill="#A1A1AA">30 check-ins em segundos deslizando os cards na tela.</text>
        </g>

        <!-- Metric Highlight -->
        <g transform="translate(0, 380)">
          <rect x="0" y="0" width="920" height="170" rx="24" fill="#18181B" fill-opacity="0.7" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2" />
          <text x="460" y="75" text-anchor="middle" class="font-mono" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="2">2 MINUTOS</text>
          <text x="460" y="130" text-anchor="middle" class="font-mono" font-size="19" font-weight="700" fill="#A1A1AA" letter-spacing="2">PARA AUDITAR OS CHECK-INS DIÁRIOS DE 30 ALUNOS</text>
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

  await sharp(Buffer.from(slide4Svg))
    .composite([
      { input: logoBuffer, top: 82, left: 86 },
      { input: logoBuffer, top: 1234, left: 80 }
    ])
    .jpeg({ quality: 96 })
    .toFile(path.join(outputDir, 'slide-4.jpg'));
  console.log('✓ Slide 4 gerado: slide-4.jpg');

  // ==========================================
  // SLIDE 5: CTA CONVOCAÇÃO BETA
  // ==========================================
  const slide5Svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    ${commonDefs}
    <rect width="1080" height="1350" fill="#000000" />
    <rect width="1080" height="500" fill="url(#topGlow)" />
    <rect width="1080" height="1350" fill="url(#dotGrid)" />

    <!-- TOP HEADER -->
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="290" height="52" rx="26" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5" />
      <text x="64" y="33" class="font-mono" font-size="16" font-weight="700" fill="#FFFFFF" letter-spacing="1">PROGRAMA FUNDADOR</text>
      <text x="920" y="34" text-anchor="end" class="font-mono" font-size="19" font-weight="700" fill="#71717A">05 / 05</text>
    </g>

    <!-- BODY -->
    <g transform="translate(80, 220)">
      <rect x="0" y="0" width="230" height="40" rx="8" fill="#FFFFFF" fill-opacity="0.06" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1" />
      <text x="18" y="26" class="font-mono" font-size="15" font-weight="700" fill="#A1A1AA" letter-spacing="2">15 VAGAS PILOTO</text>

      <text x="0" y="110" class="font-sans" font-size="54" font-weight="900" fill="#FFFFFF" letter-spacing="-2">Coloque integridade total</text>
      <text x="0" y="175" class="font-sans" font-size="54" font-weight="900" fill="url(#textGrad)" letter-spacing="-2">no seu próximo desafio.</text>

      <!-- 3 Perks -->
      <g transform="translate(0, 240)">
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="920" height="110" rx="18" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="24" y="25" width="70" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1" />
          <text x="59" y="64" text-anchor="middle" class="font-mono" font-size="19" font-weight="800" fill="#FFFFFF">PRO</text>
          <text x="120" y="48" class="font-sans" font-size="24" font-weight="800" fill="#FFFFFF">Plano PRO Gratuito Vitalício</text>
          <text x="120" y="80" class="font-sans" font-size="18" font-weight="400" fill="#A1A1AA">Isenção perpétua da mensalidade de R$ 49,90 para os 15 selecionados.</text>
        </g>

        <g transform="translate(0, 130)">
          <rect x="0" y="0" width="920" height="110" rx="18" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="24" y="25" width="70" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1" />
          <text x="59" y="64" text-anchor="middle" class="font-mono" font-size="19" font-weight="800" fill="#FFFFFF">0%</text>
          <text x="120" y="48" class="font-sans" font-size="24" font-weight="800" fill="#FFFFFF">0% de Taxa sobre Inscrições</text>
          <text x="120" y="80" class="font-sans" font-size="18" font-weight="400" fill="#A1A1AA">Zero comissão sobre os alunos. 100% da receita fica no seu bolso.</text>
        </g>

        <g transform="translate(0, 260)">
          <rect x="0" y="0" width="920" height="110" rx="18" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.5" />
          <rect x="24" y="25" width="70" height="60" rx="14" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1" />
          <text x="59" y="64" text-anchor="middle" class="font-mono" font-size="19" font-weight="800" fill="#FFFFFF">03</text>
          <text x="120" y="48" class="font-sans" font-size="24" font-weight="800" fill="#FFFFFF">Acompanhamento Direto com os Devs</text>
          <text x="120" y="80" class="font-sans" font-size="18" font-weight="400" fill="#A1A1AA">Rodamos seu desafio de 21 dias lado a lado com sua turma.</text>
        </g>
      </g>

      <!-- Callout Direct/Comment -->
      <g transform="translate(0, 670)">
        <rect x="0" y="0" width="920" height="160" rx="24" fill="#18181B" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="8 6" />
        <text x="460" y="66" text-anchor="middle" class="font-mono" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="2">OU COMENTE "BETA" ABAIXO</text>
        <text x="460" y="112" text-anchor="middle" class="font-sans" font-size="22" font-weight="500" fill="#A1A1AA">
          Para receber o link de candidatura direto no seu direct
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
  const legendaText = `Desafio fitness sem regras rígidas vira discussão em grupo de WhatsApp.

Se você já rodou desafio, conhece a cena:
O aluno esquece de treinar na quarta-feira. Às 23h, ele abre a galeria do celular, pega uma foto do treino da semana passada e manda no grupo para fingir que pontuou.

O resultado?
Quem realmente acordou às 6h da manhã e se esforçou percebe a injustiça, se desmotiva e para de engajar. O ranking perde o valor.

Na ArenaFitPro, nós eliminamos essa fraude pela raiz:

1. CÂMERA FORÇADA AO VIVO
O botão de envio abre o sensor da câmera do celular. O aluno é obrigado a tirar a foto no exato momento. O botão de upload da galeria simplesmente não existe.

2. IA DE RECONHECIMENTO NUTRICIONAL
Ao registrar o prato, nossa inteligência de visão computacional analisa os alimentos e estima calorias e distribuição de macros para orientar o aluno.

3. CENTRAL DE AUDITORIA EM SWIPE
Você, como treinador, aprova ou reprova 30 check-ins em menos de 2 minutos deslizando os cards na tela do seu painel.

Mais integridade para a sua turma. Menos tempo perdido cobrando pessoas.

Estamos selecionando 15 Treinadores Fundadores para testar a plataforma gratuitamente no piloto (com Plano PRO vitalício gratuito, 0% de taxa por inscrição e isenção perpétua da mensalidade de R$ 49,90).

👉 Toque no link da bio e cadastre-se: arenafitpro.app/beta
Ou comente "BETA" aqui embaixo que enviamos o link no direct.

#personaltrainer #consultoriafitness #desafiofitness #gamificacao #treinador #arenafitpro #nutricaoesportiva #tecnologiafitness`;

  fs.writeFileSync(path.join(outputDir, 'legenda.txt'), legendaText, 'utf-8');
  console.log('✓ Legenda salva em Post 4/legenda.txt');

  console.log('✅ Todos os 5 slides do Post 4 foram gerados com sucesso!');
}

generatePost4().catch(err => {
  console.error('Erro ao gerar Post 4:', err);
  process.exit(1);
});
