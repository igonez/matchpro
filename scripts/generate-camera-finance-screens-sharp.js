const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'social', 'App Screens Realistas');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// =========================================================================
// TELA 2: CÂMERA ANTIFRAUDE & IA NUTRICIONAL
// =========================================================================

function buildCameraScreenSvg() {
  return `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Fundo OLED Escuro -->
      <radialGradient id="cam-bg-glow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#121216"/>
        <stop offset="60%" stop-color="#050507"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>

      <!-- HUD Corner Brackets Gradient -->
      <linearGradient id="hud-line-glow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#34D399"/>
      </linearGradient>

      <!-- Viewfinder Scan Beam -->
      <linearGradient id="scan-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#34D399" stop-opacity="0"/>
        <stop offset="50%" stop-color="#34D399" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#34D399" stop-opacity="0"/>
      </linearGradient>

      <!-- Macro Cards Gradient -->
      <linearGradient id="macro-card-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#18181B"/>
        <stop offset="100%" stop-color="#09090B"/>
      </linearGradient>
    </defs>

    <!-- Fundo OLED -->
    <rect width="1080" height="1920" fill="url(#cam-bg-glow)"/>

    <!-- Status Bar iOS 18 -->
    <g transform="translate(60, 48)">
      <text x="0" y="24" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="22">09:41</text>
      <!-- Dynamic Island -->
      <g transform="translate(370, 0)">
        <rect x="0" y="0" width="220" height="42" rx="21" fill="#000000" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1"/>
        <circle cx="28" cy="21" r="6" fill="#34D399"/>
        <circle cx="28" cy="21" r="10" fill="#34D399" fill-opacity="0.25"/>
        <text x="46" y="26" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="1">SENSOR ATIVO</text>
        <circle cx="196" cy="21" r="5" fill="#EF4444"/>
      </g>
      <!-- Wi-Fi e Bateria -->
      <g transform="translate(860, 4)">
        <path d="M0 18 A12 12 0 0 1 20 18 M4 14 A8 8 0 0 1 16 14 M8 20 A2 2 0 0 1 12 20" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
        <g transform="translate(40, -2)">
          <rect x="0" y="4" width="34" height="18" rx="5" fill="none" stroke="#FFFFFF" stroke-width="2"/>
          <rect x="3" y="7" width="24" height="12" rx="3" fill="#FFFFFF"/>
          <path d="M36 10v6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        </g>
      </g>
    </g>

    <!-- Top Bar da Câmera (src/app/app/camera/[missionId]/page.tsx) -->
    <g transform="translate(50, 130)">
      <!-- Botão Voltar -->
      <rect x="0" y="10" width="140" height="50" rx="16" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5"/>
      <path d="M26 35l-5-5 5-5" stroke="#D4D4D8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="38" y="40" fill="#D4D4D8" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="13" letter-spacing="1">VOLTAR</text>

      <!-- Título Central -->
      <g transform="translate(490, 18)" text-anchor="middle">
        <text x="0" y="16" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="2">OPTICAL_SENSOR_HUD</text>
        <text x="0" y="42" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="22">Almoço Limpo • 2ª Refeição</text>
      </g>

      <!-- Recompensa em Pontos -->
      <g transform="translate(850, 10)">
        <rect x="0" y="0" width="130" height="50" rx="16" fill="#FBBF24" fill-opacity="0.12" stroke="#FBBF24" stroke-opacity="0.3" stroke-width="1.5"/>
        <text x="65" y="32" text-anchor="middle" fill="#FDE047" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="16">+15 XP</text>
      </g>
    </g>

    <!-- ==============================================
         ÁREA DO VISOR ÓPTICO TÉCNICO (HUD VIEW指)
         X=50, Y=220, W=980, H=1240, rx=36
         ============================================== -->
    <g transform="translate(50, 220)">
      <!-- Container do Visor -->
      <rect x="0" y="0" width="980" height="1240" rx="36" fill="#050508" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="2"/>
      
      <!-- Simulação de imagem de prato saudável ao fundo -->
      <g opacity="0.45">
        <circle cx="490" cy="540" r="280" fill="#18181B" stroke="#27272A" stroke-width="8"/>
        <circle cx="490" cy="540" r="230" fill="#09090B"/>
        <!-- Comida (frango, arroz, legumes) representados em camadas estilizadas -->
        <ellipse cx="440" cy="500" rx="100" ry="60" fill="#78350F" opacity="0.8"/>
        <ellipse cx="540" cy="560" rx="90" ry="70" fill="#D97706" opacity="0.6"/>
        <circle cx="420" cy="580" r="40" fill="#047857" opacity="0.9"/>
        <circle cx="480" cy="600" r="35" fill="#065F46" opacity="0.9"/>
        <circle cx="560" cy="480" r="30" fill="#B45309" opacity="0.7"/>
      </g>

      <!-- Feixe de Varredura Laser da IA -->
      <rect x="40" y="460" width="900" height="160" fill="url(#scan-beam)"/>
      <line x1="40" y1="540" x2="940" y2="540" stroke="#34D399" stroke-width="2" stroke-dasharray="8 6"/>

      <!-- Mira HUD: Cantoneiras nos 4 Cantos -->
      <g stroke="#FFFFFF" stroke-width="4" stroke-linecap="round">
        <!-- Top Left -->
        <path d="M40 90 V40 H90"/>
        <!-- Top Right -->
        <path d="M940 90 V40 H890"/>
        <!-- Bottom Left -->
        <path d="M40 1150 V1200 H90"/>
        <!-- Bottom Right -->
        <path d="M940 1150 V1200 H890"/>
      </g>

      <!-- Crosshair Central com Anéis de Foco -->
      <g transform="translate(490, 540)">
        <circle cx="0" cy="0" r="54" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="6 4" fill="none"/>
        <circle cx="0" cy="0" r="28" stroke="#34D399" stroke-width="2" fill="none"/>
        <circle cx="0" cy="0" r="5" fill="#34D399"/>
        <line x1="-70" y1="0" x2="-35" y2="0" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.5"/>
        <line x1="35" y1="0" x2="70" y2="0" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.5"/>
        <line x1="0" y1="-70" x2="0" y2="-35" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.5"/>
        <line x1="0" y1="35" x2="0" y2="70" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.5"/>
      </g>

      <!-- ==============================================
           BANNER SUPERIOR: IA NUTRICIONAL MULTIMODAL
           ============================================== -->
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="920" height="190" rx="26" fill="#09090B" fill-opacity="0.95" stroke="#34D399" stroke-opacity="0.4" stroke-width="1.5"/>
        
        <!-- Header da IA -->
        <g transform="translate(26, 24)">
          <circle cx="10" cy="10" r="6" fill="#34D399"/>
          <circle cx="10" cy="10" r="10" fill="#34D399" fill-opacity="0.25"/>
          <text x="26" y="16" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="13" letter-spacing="2">REFEIÇÃO IDENTIFICADA • IA NUTRICIONAL</text>
        </g>

        <!-- Badge de Calorias à Direita -->
        <g transform="translate(710, 18)">
          <rect x="0" y="0" width="180" height="38" rx="12" fill="#FFFFFF" fill-opacity="0.10" stroke="#FFFFFF" stroke-opacity="0.2"/>
          <text x="90" y="25" text-anchor="middle" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="16">580 KCAL</text>
        </g>

        <!-- Linha Divisória -->
        <line x1="26" y1="70" x2="894" y2="70" stroke="#FFFFFF" stroke-opacity="0.1"/>

        <!-- 3 Colunas de Macros -->
        <g transform="translate(26, 84)">
          <!-- Proteínas -->
          <g transform="translate(0, 0)">
            <rect x="0" y="0" width="270" height="64" rx="14" fill="#000000" stroke="#FFFFFF" stroke-opacity="0.08"/>
            <text x="20" y="26" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="10" letter-spacing="1">PROTEÍNAS</text>
            <text x="20" y="52" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="20">42g</text>
          </g>

          <!-- Carboidratos -->
          <g transform="translate(295, 0)">
            <rect x="0" y="0" width="270" height="64" rx="14" fill="#000000" stroke="#FFFFFF" stroke-opacity="0.08"/>
            <text x="20" y="26" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="10" letter-spacing="1">CARBOIDRATOS</text>
            <text x="20" y="52" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="20">54g</text>
          </g>

          <!-- Gorduras -->
          <g transform="translate(590, 0)">
            <rect x="0" y="0" width="278" height="64" rx="14" fill="#000000" stroke="#FFFFFF" stroke-opacity="0.08"/>
            <text x="20" y="26" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="10" letter-spacing="1">GORDURAS BOAS</text>
            <text x="20" y="52" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="20">14g</text>
          </g>
        </g>

        <!-- Resumo da IA -->
        <text x="26" y="172" fill="#A1A1AA" font-family="'Plus Jakarta Sans', sans-serif" font-size="12">
          Análise: Frango grelhado em tiras, arroz integral, brócolis e azeite extravirgem (Conformidade 98%).
        </text>
      </g>

      <!-- ==============================================
           BANNER INFERIOR: METADADOS CRIPTOGRÁFICOS
           ============================================== -->
      <g transform="translate(30, 1020)">
        <rect x="0" y="0" width="920" height="180" rx="26" fill="#000000" fill-opacity="0.92" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5"/>
        
        <!-- Linha 1: Status de Antifraude -->
        <g transform="translate(24, 32)">
          <rect x="0" y="0" width="180" height="26" rx="6" fill="#EF4444" fill-opacity="0.15" stroke="#EF4444" stroke-opacity="0.4"/>
          <text x="90" y="18" text-anchor="middle" fill="#F87171" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="11">GALERIA BLOQUEADA</text>

          <rect x="195" y="0" width="190" height="26" rx="6" fill="#34D399" fill-opacity="0.15" stroke="#34D399" stroke-opacity="0.4"/>
          <text x="290" y="18" text-anchor="middle" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="11">SENSOR ÓPTICO NATIVO</text>
        </g>

        <!-- Linha 2: Timestamp e GPS -->
        <g transform="translate(24, 90)">
          <text x="0" y="16" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="12">TIMESTAMP:</text>
          <text x="140" y="16" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="13">23/10/2026 12:45:19 UTC-3</text>

          <text x="500" y="16" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="12">GPS ENCRYPTED:</text>
          <text x="660" y="16" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="13">-23.56168, -46.65598</text>
        </g>

        <!-- Linha 3: Hash do Sensor -->
        <g transform="translate(24, 134)">
          <text x="0" y="16" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="11">HASH DE INTEGRIDADE:</text>
          <text x="190" y="16" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-size="11">e8b7c4a199f302d91bb3a2099c27f</text>
        </g>
      </g>
    </g>

    <!-- ==============================================
         BOTÃO DE DISPARO DA CÂMERA (BOTTOM BAR)
         ============================================== -->
    <g transform="translate(540, 1680)" text-anchor="middle">
      <!-- Anel Externo de Foco -->
      <circle cx="0" cy="0" r="54" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="4" fill="none"/>
      <!-- Botão Branco Pulsante -->
      <circle cx="0" cy="0" r="42" fill="#FFFFFF" filter="drop-shadow(0 0 25px rgba(255,255,255,0.45))"/>
      <circle cx="0" cy="0" r="36" fill="#000000"/>
      <circle cx="0" cy="0" r="30" fill="#FFFFFF"/>
    </g>

    <text x="540" y="1790" text-anchor="middle" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="13" letter-spacing="1">
      TOQUE PARA VALIDAR CHECK-IN
    </text>
  </svg>
  `;
}

function buildCameraMockupTitaniumSvg() {
  return `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cam-studio" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#141418"/>
        <stop offset="50%" stop-color="#08080A"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
      <radialGradient id="cam-light" cx="50%" cy="35%" r="50%">
        <stop offset="0%" stop-color="#34D399" stop-opacity="0.08"/>
        <stop offset="70%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="chassis-rim-2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#52525B"/>
        <stop offset="25%" stop-color="#27272A"/>
        <stop offset="50%" stop-color="#71717A"/>
        <stop offset="75%" stop-color="#18181B"/>
        <stop offset="100%" stop-color="#3F3F46"/>
      </linearGradient>
    </defs>

    <rect width="1080" height="1920" fill="url(#cam-studio)"/>
    <ellipse cx="540" cy="800" rx="460" ry="700" fill="url(#cam-light)"/>

    <!-- Header Anúncio -->
    <g transform="translate(540, 100)" text-anchor="middle">
      <rect x="-160" y="0" width="320" height="34" rx="17" fill="#34D399" fill-opacity="0.12" stroke="#34D399" stroke-opacity="0.3"/>
      <text x="0" y="22" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="2">TECNOLOGIA ANTIFRAUDE</text>
      
      <text x="0" y="78" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="46" letter-spacing="-1.5">
        O Fim da Foto de Galeria
      </text>
      <text x="0" y="126" fill="#D4D4D8" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="24">
        Sensor óptico nativo com auditoria por IA em tempo real.
      </text>
    </g>

    <!-- Badges Flutuantes -->
    <g transform="translate(60, 480)">
      <rect x="0" y="0" width="230" height="74" rx="20" fill="#09090B" fill-opacity="0.9" stroke="#EF4444" stroke-opacity="0.4" filter="drop-shadow(0 20px 30px rgba(0,0,0,0.8))"/>
      <circle cx="32" cy="37" r="8" fill="#EF4444"/>
      <text x="56" y="32" fill="#F87171" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="10" letter-spacing="1">ZERO TRAPAÇA</text>
      <text x="56" y="52" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="13">Galeria Desabilitada</text>
    </g>

    <g transform="translate(800, 1180)" text-anchor="end">
      <rect x="-240" y="0" width="240" height="92" rx="22" fill="#09090B" fill-opacity="0.95" stroke="#34D399" stroke-opacity="0.4" filter="drop-shadow(0 20px 40px rgba(0,0,0,0.9))"/>
      <text x="-24" y="30" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="10" letter-spacing="1">IA NUTRICIONAL</text>
      <text x="-24" y="60" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="26">580 kcal</text>
      <text x="-24" y="78" fill="#A1A1AA" font-family="'Plus Jakarta Sans', sans-serif" font-size="11">Proteínas 42g • Carbos 54g</text>
    </g>

    <!-- iPhone Chassis -->
    <g transform="translate(220, 270)">
      <rect x="10" y="30" width="620" height="1300" rx="66" fill="#000000" filter="blur(30px)" opacity="0.9"/>
      <rect x="0" y="0" width="640" height="1320" rx="68" fill="#1C1C1F" stroke="url(#chassis-rim-2)" stroke-width="4"/>
      <rect x="8" y="8" width="624" height="1304" rx="60" fill="#09090B" stroke="#000000" stroke-width="6"/>

      <g transform="translate(16, 16)">
        <clipPath id="iphone-screen-clip-2">
          <rect width="608" height="1288" rx="52" fill="#000000"/>
        </clipPath>
        <g clip-path="url(#iphone-screen-clip-2)">
          <g transform="scale(0.563)">
            ${buildCameraScreenSvg().replace('<svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
          </g>
          <path d="M0 0 L608 0 L300 1288 L0 1288 Z" fill="#FFFFFF" fill-opacity="0.02"/>
        </g>
      </g>
    </g>

    <!-- CTA Footer -->
    <g transform="translate(540, 1720)" text-anchor="middle">
      <rect x="-240" y="0" width="480" height="64" rx="32" fill="#FFFFFF" filter="drop-shadow(0 15px 35px rgba(255,255,255,0.25))"/>
      <text x="0" y="38" fill="#000000" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="18" letter-spacing="0.5">
        CONHECER A CÂMERA AO VIVO →
      </text>
      <text x="0" y="94" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-size="13">
        Plano PRO Vitalício Gratuito ($0) • 15 Vagas Fundadores
      </text>
    </g>
  </svg>
  `;
}

// =========================================================================
// TELA 3: PAINEL FINANCEIRO & SPLIT PIX D+0
// =========================================================================

function buildFinanceScreenSvg() {
  return `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="fin-bg-glow" cx="50%" cy="20%" r="70%">
        <stop offset="0%" stop-color="#141E18"/>
        <stop offset="50%" stop-color="#080A08"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>

      <!-- Emerald Specular Highlights -->
      <linearGradient id="emerald-balance" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#34D399"/>
        <stop offset="100%" stop-color="#059669"/>
      </linearGradient>

      <!-- Card Glass -->
      <linearGradient id="glass-card" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#18181B" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#09090B" stop-opacity="0.95"/>
      </linearGradient>
    </defs>

    <rect width="1080" height="1920" fill="url(#fin-bg-glow)"/>

    <!-- Status Bar iOS 18 -->
    <g transform="translate(60, 48)">
      <text x="0" y="24" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="22">09:41</text>
      <g transform="translate(370, 0)">
        <rect x="0" y="0" width="220" height="42" rx="21" fill="#000000" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1"/>
        <circle cx="28" cy="21" r="6" fill="#10B981"/>
        <text x="46" y="26" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="1">SPLIT D+0 ON</text>
      </g>
      <g transform="translate(860, 4)">
        <path d="M0 18 A12 12 0 0 1 20 18 M4 14 A8 8 0 0 1 16 14 M8 20 A2 2 0 0 1 12 20" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
        <g transform="translate(40, -2)">
          <rect x="0" y="4" width="34" height="18" rx="5" fill="none" stroke="#FFFFFF" stroke-width="2"/>
          <rect x="3" y="7" width="24" height="12" rx="3" fill="#FFFFFF"/>
          <path d="M36 10v6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        </g>
      </g>
    </g>

    <!-- Header da Central Financeira (src/app/dashboard/finance/page.tsx) -->
    <g transform="translate(50, 130)">
      <g transform="translate(0, 10)">
        <rect x="0" y="0" width="56" height="56" rx="18" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.15"/>
        <path d="M18 36V20a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2z" stroke="#34D399" stroke-width="2" fill="none"/>
        <circle cx="28" cy="28" r="4" fill="#34D399"/>
      </g>
      
      <g transform="translate(74, 16)">
        <text x="0" y="24" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="34">Central Financeira</text>
        <rect x="330" y="4" width="140" height="24" rx="6" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.15"/>
        <text x="400" y="20" text-anchor="middle" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="10">ASAAS ENGINE v3</text>
        <text x="0" y="52" fill="#A1A1AA" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Split de faturamento em tempo real &amp; Saques Pix D+0</text>
      </g>

      <!-- Badge de Plano PRO à Direita -->
      <g transform="translate(780, 14)">
        <rect x="0" y="0" width="200" height="52" rx="16" fill="#09090B" stroke="#34D399" stroke-opacity="0.4" stroke-width="1.5"/>
        <text x="100" y="22" text-anchor="middle" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="9" letter-spacing="1">SEU PLANO ATUAL</text>
        <text x="100" y="42" text-anchor="middle" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="14">PRO • 0% TAXA</text>
      </g>
    </g>

    <!-- ==============================================
         CARD PRINCIPAL: SALDO DISPONÍVEL PIX (D+0)
         ============================================== -->
    <g transform="translate(50, 240)">
      <rect x="0" y="0" width="980" height="240" rx="30" fill="url(#glass-card)" stroke="#34D399" stroke-opacity="0.35" stroke-width="2"/>
      
      <g transform="translate(36, 36)">
        <text x="0" y="20" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="13" letter-spacing="1">DISPONÍVEL PARA SAQUE IMEDIATO</text>
        <circle cx="900" cy="14" r="14" fill="#34D399" fill-opacity="0.15"/>
        <path d="M895 14l3 3 7-7" stroke="#34D399" stroke-width="2.5" fill="none"/>

        <!-- Valor Gigante -->
        <text x="0" y="88" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="56" letter-spacing="-1">
          R$ 4.750,00
        </text>

        <line x1="0" y1="120" x2="908" y2="120" stroke="#FFFFFF" stroke-opacity="0.08"/>

        <!-- Rodapé do Card com Botão de Saque -->
        <text x="0" y="152" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="13">
          ⚡ Transferência Pix em até 5 minutos (D+0)
        </text>

        <g transform="translate(730, 126)">
          <rect x="0" y="0" width="180" height="48" rx="14" fill="#34D399"/>
          <text x="90" y="30" text-anchor="middle" fill="#000000" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="15">
            SACAR PIX ↗
          </text>
        </g>
      </g>
    </g>

    <!-- ==============================================
         GRID DE 3 CARDS DE MÉTRICAS FINANCEIRAS
         ============================================== -->
    <g transform="translate(50, 510)">
      <!-- Card Líquido -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="314" height="130" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.1"/>
        <text x="24" y="32" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11" letter-spacing="1">FATURAMENTO LÍQUIDO</text>
        <text x="24" y="78" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="28">R$ 14.850</text>
        <text x="24" y="106" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="11">Já no seu bolso (100%)</text>
      </g>

      <!-- Card Bruto -->
      <g transform="translate(333, 0)">
        <rect x="0" y="0" width="314" height="130" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.1"/>
        <text x="24" y="32" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11" letter-spacing="1">FATURAMENTO BRUTO</text>
        <text x="24" y="78" fill="#D4D4D8" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="28">R$ 14.850</text>
        <text x="24" y="106" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="11">Total em inscrições</text>
      </g>

      <!-- Card Taxa PRO (0%) -->
      <g transform="translate(666, 0)">
        <rect x="0" y="0" width="314" height="130" rx="22" fill="#09090B" stroke="#34D399" stroke-opacity="0.3"/>
        <text x="24" y="32" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11" letter-spacing="1">TAXA DO SPLIT</text>
        <text x="24" y="78" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="34">0%</text>
        <text x="24" y="106" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-size="11">R$ 0,00 retido no PRO</text>
      </g>
    </g>

    <!-- ==============================================
         BLOCO DE INTEGRAÇÃO & SUBCONTA BANCÁRIA
         ============================================== -->
    <g transform="translate(50, 670)">
      <rect x="0" y="0" width="980" height="160" rx="26" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5"/>
      <g transform="translate(30, 32)">
        <circle cx="16" cy="16" r="14" fill="#34D399" fill-opacity="0.15"/>
        <path d="M12 16l3 3 6-6" stroke="#34D399" stroke-width="2" fill="none"/>
        <text x="44" y="22" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="18">
          Subconta Bancária Asaas Ativa &amp; Homologada
        </text>
        <rect x="740" y="4" width="180" height="28" rx="8" fill="#34D399" fill-opacity="0.15" stroke="#34D399" stroke-opacity="0.4"/>
        <text x="830" y="22" text-anchor="middle" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="11">SPLIT AUTOMÁTICO</text>

        <text x="0" y="72" fill="#A1A1AA" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" max-width="800">
          Chave Pix Cadastrada: (11) 98765-4321 • Proteção total contra bitributação (nota fiscal apenas do lucro líquido).
        </text>
        <text x="0" y="102" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="11">
          WALLET_ID: sub_asaas_8842918820 • STATUS: VERIFICADO BACEN D+0
        </text>
      </g>
    </g>

    <!-- ==============================================
         TABELA DE TRANSAÇÕES RECENTES DOS ALUNOS
         ============================================== -->
    <g transform="translate(50, 860)">
      <text x="0" y="24" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="1">
        ÚLTIMAS INSCRIÇÕES CONFIRMADAS VIA PIX (D+0)
      </text>

      <!-- Transação 1 -->
      <g transform="translate(0, 44)">
        <rect x="0" y="0" width="980" height="100" rx="22" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.08"/>
        <circle cx="45" cy="50" r="24" fill="#27272A"/>
        <text x="45" y="56" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="16">ML</text>
        <g transform="translate(85, 36)">
          <text x="0" y="16" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18">Mariana Lima</text>
          <text x="0" y="38" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="12">Desafio 21D Verão • Inscrição Confirmada</text>
        </g>
        <g transform="translate(940, 36)" text-anchor="end">
          <text x="0" y="18" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="22">+ R$ 150,00</text>
          <text x="0" y="38" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="11">Split: 0% Taxa • D+0</text>
        </g>
      </g>

      <!-- Transação 2 -->
      <g transform="translate(0, 156)">
        <rect x="0" y="0" width="980" height="100" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.06"/>
        <circle cx="45" cy="50" r="24" fill="#27272A"/>
        <text x="45" y="56" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="16">RS</text>
        <g transform="translate(85, 36)">
          <text x="0" y="16" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18">Rodrigo Silveira</text>
          <text x="0" y="38" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="12">Desafio 21D Verão • Inscrição Confirmada</text>
        </g>
        <g transform="translate(940, 36)" text-anchor="end">
          <text x="0" y="18" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="22">+ R$ 150,00</text>
          <text x="0" y="38" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="11">Split: 0% Taxa • D+0</text>
        </g>
      </g>

      <!-- Transação 3 -->
      <g transform="translate(0, 268)">
        <rect x="0" y="0" width="980" height="100" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.06"/>
        <circle cx="45" cy="50" r="24" fill="#27272A"/>
        <text x="45" y="56" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="16">CS</text>
        <g transform="translate(85, 36)">
          <text x="0" y="16" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18">Camila Santos</text>
          <text x="0" y="38" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="12">Desafio 21D Verão • Inscrição Confirmada</text>
        </g>
        <g transform="translate(940, 36)" text-anchor="end">
          <text x="0" y="18" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="22">+ R$ 150,00</text>
          <text x="0" y="38" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="11">Split: 0% Taxa • D+0</text>
        </g>
      </g>

      <!-- Transação 4 -->
      <g transform="translate(0, 380)">
        <rect x="0" y="0" width="980" height="100" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.06"/>
        <circle cx="45" cy="50" r="24" fill="#27272A"/>
        <text x="45" y="56" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="16">AL</text>
        <g transform="translate(85, 36)">
          <text x="0" y="16" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18">André Lucca</text>
          <text x="0" y="38" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="12">Desafio 21D Verão • Inscrição Confirmada</text>
        </g>
        <g transform="translate(940, 36)" text-anchor="end">
          <text x="0" y="18" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="22">+ R$ 150,00</text>
          <text x="0" y="38" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="11">Split: 0% Taxa • D+0</text>
        </g>
      </g>
    </g>

    <!-- Footer Bar -->
    <g transform="translate(50, 1790)">
      <rect x="0" y="0" width="980" height="80" rx="24" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.1"/>
      <text x="40" y="46" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-size="13">
        MOTOR FINANCEIRO: ASAAS IP S.A. • CONTA AUTORIZADA BACEN
      </text>
      <text x="940" y="46" text-anchor="end" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="13">
        ● SISTEMA 100% OPERACIONAL
      </text>
    </g>
  </svg>
  `;
}

function buildFinanceMockupTitaniumSvg() {
  return `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="fin-studio" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#141E18"/>
        <stop offset="50%" stop-color="#080A08"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>
      <radialGradient id="fin-light" cx="50%" cy="35%" r="50%">
        <stop offset="0%" stop-color="#34D399" stop-opacity="0.12"/>
        <stop offset="70%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="chassis-rim-3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#52525B"/>
        <stop offset="25%" stop-color="#27272A"/>
        <stop offset="50%" stop-color="#71717A"/>
        <stop offset="75%" stop-color="#18181B"/>
        <stop offset="100%" stop-color="#3F3F46"/>
      </linearGradient>
    </defs>

    <rect width="1080" height="1920" fill="url(#fin-studio)"/>
    <ellipse cx="540" cy="800" rx="460" ry="700" fill="url(#fin-light)"/>

    <!-- Header Anúncio -->
    <g transform="translate(540, 100)" text-anchor="middle">
      <rect x="-160" y="0" width="320" height="34" rx="17" fill="#34D399" fill-opacity="0.12" stroke="#34D399" stroke-opacity="0.3"/>
      <text x="0" y="22" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="2">FINTECH &amp; SPLIT PIX D+0</text>
      
      <text x="0" y="78" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="46" letter-spacing="-1.5">
        O Dinheiro Cai no Mesmo Dia
      </text>
      <text x="0" y="126" fill="#D4D4D8" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="24">
        Zero dias retidos, 0% de taxa no PRO e proteção fiscal.
      </text>
    </g>

    <!-- Badges Flutuantes -->
    <g transform="translate(60, 480)">
      <rect x="0" y="0" width="220" height="74" rx="20" fill="#09090B" fill-opacity="0.9" stroke="#34D399" stroke-opacity="0.4" filter="drop-shadow(0 20px 30px rgba(0,0,0,0.8))"/>
      <circle cx="32" cy="37" r="8" fill="#34D399"/>
      <text x="56" y="32" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="10" letter-spacing="1">LIQUIDAÇÃO IMEDIATA</text>
      <text x="56" y="52" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="13">Pix D+0 sem Trava</text>
    </g>

    <g transform="translate(800, 1180)" text-anchor="end">
      <rect x="-240" y="0" width="240" height="92" rx="22" fill="#09090B" fill-opacity="0.95" stroke="#34D399" stroke-opacity="0.4" filter="drop-shadow(0 20px 40px rgba(0,0,0,0.9))"/>
      <text x="-24" y="30" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="10" letter-spacing="1">TAXA POR TRANSAÇÃO</text>
      <text x="-24" y="60" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="28">0% NO PRO</text>
      <text x="-24" y="78" fill="#A1A1AA" font-family="'Plus Jakarta Sans', sans-serif" font-size="11">R$ 49,90/mês sem comissão</text>
    </g>

    <!-- iPhone Chassis -->
    <g transform="translate(220, 270)">
      <rect x="10" y="30" width="620" height="1300" rx="66" fill="#000000" filter="blur(30px)" opacity="0.9"/>
      <rect x="0" y="0" width="640" height="1320" rx="68" fill="#1C1C1F" stroke="url(#chassis-rim-3)" stroke-width="4"/>
      <rect x="8" y="8" width="624" height="1304" rx="60" fill="#09090B" stroke="#000000" stroke-width="6"/>

      <g transform="translate(16, 16)">
        <clipPath id="iphone-screen-clip-3">
          <rect width="608" height="1288" rx="52" fill="#000000"/>
        </clipPath>
        <g clip-path="url(#iphone-screen-clip-3)">
          <g transform="scale(0.563)">
            ${buildFinanceScreenSvg().replace('<svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
          </g>
          <path d="M0 0 L608 0 L300 1288 L0 1288 Z" fill="#FFFFFF" fill-opacity="0.02"/>
        </g>
      </g>
    </g>

    <!-- CTA Footer -->
    <g transform="translate(540, 1720)" text-anchor="middle">
      <rect x="-240" y="0" width="480" height="64" rx="32" fill="#FFFFFF" filter="drop-shadow(0 15px 35px rgba(255,255,255,0.25))"/>
      <text x="0" y="38" fill="#000000" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="18" letter-spacing="0.5">
        QUERO RECEBER VIA SPLIT PIX →
      </text>
      <text x="0" y="94" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-size="13">
        Plano PRO Vitalício Gratuito ($0 de mensalidade) • 15 Fundadores
      </text>
    </g>
  </svg>
  `;
}

// =========================================================================
// RUNNER
// =========================================================================
async function run() {
  console.log('Iniciando geração das Telas 2 e 3 em Alta Resolução (1080x1920)...');

  // 1. Tela 2 - Câmera Mobile
  const camMobileSvg = Buffer.from(buildCameraScreenSvg());
  const camMobileOut = path.join(OUTPUT_DIR, 'tela-camera-antifraude-mobile.jpg');
  await sharp(camMobileSvg).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(camMobileOut);
  console.log(`✓ 1. Tela Câmera Mobile gerada: ${camMobileOut}`);

  // 2. Tela 2 - Câmera Mockup 3D
  const camMockupSvg = Buffer.from(buildCameraMockupTitaniumSvg());
  const camMockupOut = path.join(OUTPUT_DIR, 'mockup-camera-antifraude-titanium.jpg');
  await sharp(camMockupSvg).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(camMockupOut);
  console.log(`✓ 2. Mockup Câmera 3D Titanium gerado: ${camMockupOut}`);

  // 3. Tela 3 - Financeiro Mobile
  const finMobileSvg = Buffer.from(buildFinanceScreenSvg());
  const finMobileOut = path.join(OUTPUT_DIR, 'tela-financeiro-split-mobile.jpg');
  await sharp(finMobileSvg).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(finMobileOut);
  console.log(`✓ 3. Tela Financeiro Mobile gerada: ${finMobileOut}`);

  // 4. Tela 3 - Financeiro Mockup 3D
  const finMockupSvg = Buffer.from(buildFinanceMockupTitaniumSvg());
  const finMockupOut = path.join(OUTPUT_DIR, 'mockup-financeiro-split-titanium.jpg');
  await sharp(finMockupSvg).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(finMockupOut);
  console.log(`✓ 4. Mockup Financeiro 3D Titanium gerado: ${finMockupOut}`);

  console.log('✅ Todas as 4 novas telas foram geradas com sucesso!');
}

run().catch(console.error);
