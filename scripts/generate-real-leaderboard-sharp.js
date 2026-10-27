const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'social', 'App Screens Realistas');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// -------------------------------------------------------------
// 1. GERAR TELA MOBILE PURA 100% FIDEDIGNA (1080 x 1920)
// -------------------------------------------------------------
function buildMobileScreenSvg() {
  return `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg-glow" x1="540" y1="0" x2="540" y2="1920" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#000000"/>
        <stop offset="20%" stop-color="#09090B"/>
        <stop offset="60%" stop-color="#040405"/>
        <stop offset="100%" stop-color="#000000"/>
      </linearGradient>

      <!-- Radial Ambient Lights -->
      <radialGradient id="top-gold-beam" cx="50%" cy="10%" r="50%">
        <stop offset="0%" stop-color="#FBBF24" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="mid-emerald-beam" cx="80%" cy="40%" r="40%">
        <stop offset="0%" stop-color="#34D399" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>

      <!-- Gold Rank Gradient -->
      <linearGradient id="gold-rank-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FDE047"/>
        <stop offset="50%" stop-color="#FBBF24"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>

      <!-- Personal Performance Glow -->
      <radialGradient id="personal-card-grad" cx="20%" cy="20%" r="80%">
        <stop offset="0%" stop-color="#FBBF24" stop-opacity="0.14"/>
        <stop offset="70%" stop-color="#09090B" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>

      <!-- Progress Fill Gradient -->
      <linearGradient id="overtake-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="50%" stop-color="#FBBF24"/>
        <stop offset="100%" stop-color="#34D399"/>
      </linearGradient>

      <!-- Podiums -->
      <linearGradient id="silver-pedestal" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#09090B"/>
        <stop offset="60%" stop-color="#334155" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.5"/>
      </linearGradient>
      <linearGradient id="gold-pedestal" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#09090B"/>
        <stop offset="40%" stop-color="#B45309" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#FBBF24" stop-opacity="0.55"/>
      </linearGradient>
      <linearGradient id="bronze-pedestal" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#09090B"/>
        <stop offset="60%" stop-color="#7C2D12" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#EA580C" stop-opacity="0.45"/>
      </linearGradient>

      <!-- Metallic Medals Radial -->
      <radialGradient id="gold-medal-rad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#FFF2A3"/>
        <stop offset="45%" stop-color="#EAB308"/>
        <stop offset="85%" stop-color="#A16207"/>
        <stop offset="100%" stop-color="#713F12"/>
      </radialGradient>
      <radialGradient id="silver-medal-rad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="50%" stop-color="#CBD5E1"/>
        <stop offset="85%" stop-color="#64748B"/>
        <stop offset="100%" stop-color="#334155"/>
      </radialGradient>
      <radialGradient id="bronze-medal-rad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#FFEDD5"/>
        <stop offset="45%" stop-color="#EA580C"/>
        <stop offset="85%" stop-color="#9A3412"/>
        <stop offset="100%" stop-color="#431407"/>
      </radialGradient>
    </defs>

    <!-- Fundo Base OLED -->
    <rect width="1080" height="1920" fill="url(#bg-glow)"/>
    <rect width="1080" height="1920" fill="url(#top-gold-beam)"/>
    <rect width="1080" height="1920" fill="url(#mid-emerald-beam)"/>

    <!-- ==============================================
         STATUS BAR (iOS 18)
         ============================================== -->
    <g transform="translate(60, 48)">
      <text x="0" y="24" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="22">09:41</text>
      <!-- Dynamic Island -->
      <g transform="translate(370, 0)">
        <rect x="0" y="0" width="220" height="42" rx="21" fill="#000000" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1"/>
        <circle cx="28" cy="21" r="6" fill="#10B981"/>
        <circle cx="28" cy="21" r="10" fill="#10B981" fill-opacity="0.25"/>
        <text x="46" y="26" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="1">ARENA LIVE</text>
        <circle cx="196" cy="21" r="5" fill="#3B82F6"/>
      </g>
      <!-- Wi-Fi & Battery -->
      <g transform="translate(860, 4)">
        <path d="M0 18 A12 12 0 0 1 20 18 M4 14 A8 8 0 0 1 16 14 M8 20 A2 2 0 0 1 12 20" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>
        <g transform="translate(40, -2)">
          <rect x="0" y="4" width="34" height="18" rx="5" fill="none" stroke="#FFFFFF" stroke-width="2"/>
          <rect x="3" y="7" width="24" height="12" rx="3" fill="#FFFFFF"/>
          <path d="M36 10v6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        </g>
      </g>
    </g>

    <!-- ==============================================
         HEADER REAL (src/app/app/leaderboard/page.tsx)
         ============================================== -->
    <g transform="translate(50, 130)">
      <text x="0" y="40" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="44" letter-spacing="-1">LEADERBOARD</text>
      <text x="0" y="70" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-weight="600" font-size="14" letter-spacing="1">CLASSIFICAÇÃO AUDITADA • DESAFIO 21 DIAS</text>
      
      <!-- Botão Voltar -->
      <g transform="translate(820, 14)">
        <rect x="0" y="0" width="160" height="52" rx="16" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5"/>
        <path d="M30 26l-6-6 6-6" stroke="#D4D4D8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="44" y="32" fill="#D4D4D8" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="13" letter-spacing="1">VOLTAR</text>
      </g>
    </g>

    <!-- ==============================================
         BLOCO 1: CARD DE PERFORMANCE PESSOAL
         ============================================== -->
    <g transform="translate(50, 240)">
      <!-- Container Squircle com Glow Dourado -->
      <rect x="0" y="0" width="980" height="220" rx="28" fill="url(#personal-card-grad)" stroke="#FBBF24" stroke-opacity="0.32" stroke-width="1.5"/>
      <rect x="0" y="0" width="980" height="220" rx="28" fill="none" stroke="#FFFFFF" stroke-opacity="0.10" stroke-width="1"/>
      
      <!-- Rank Box Dourada -->
      <g transform="translate(26, 26)">
        <rect x="0" y="0" width="80" height="80" rx="22" fill="url(#gold-rank-grad)"/>
        <text x="40" y="28" text-anchor="middle" fill="#000000" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="11" letter-spacing="1">RANK</text>
        <text x="40" y="62" text-anchor="middle" fill="#000000" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="32">#04</text>
      </g>

      <!-- Informações do Atleta -->
      <g transform="translate(126, 32)">
        <text x="0" y="24" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="20" letter-spacing="0.5">SEU DESEMPENHO</text>
        <!-- Badge Competidor Ativo -->
        <g transform="translate(200, 4)">
          <rect x="0" y="0" width="160" height="26" rx="6" fill="#FBBF24" fill-opacity="0.15" stroke="#FBBF24" stroke-opacity="0.35"/>
          <text x="80" y="17" text-anchor="middle" fill="#FDE047" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="11" letter-spacing="1">COMPETIDOR ATIVO</text>
        </g>
        <text x="0" y="62" fill="#D4D4D8" font-family="'JetBrains Mono', monospace" font-size="14">
          Faltam <tspan fill="#FDE047" font-weight="800">45 XP</tspan> para ultrapassar <tspan fill="#FFFFFF" font-weight="700">#03 Carlos Silva</tspan>
        </text>
      </g>

      <!-- Pontuação XP à Direita -->
      <g transform="translate(950, 42)" text-anchor="end">
        <text x="0" y="32" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="36" letter-spacing="-1">1.820</text>
        <text x="0" y="56" fill="#FBBF24" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="2">XP TOTAL</text>
      </g>

      <!-- Linha Divisória & Barra de Ultrapassagem -->
      <line x1="26" y1="130" x2="954" y2="130" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1"/>
      
      <g transform="translate(26, 148)">
        <text x="0" y="16" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="1">ALVO DE ULTRAPASSAGEM: #03 CARLOS SILVA</text>
        <text x="928" y="16" text-anchor="end" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="13">78% CONCLUÍDO</text>
        
        <!-- Track & Fill -->
        <rect x="0" y="28" width="928" height="14" rx="7" fill="#000000" stroke="#FFFFFF" stroke-opacity="0.12"/>
        <rect x="2" y="30" width="724" height="10" rx="5" fill="url(#overtake-grad)"/>
      </g>
    </g>

    <!-- ==============================================
         BLOCO 2: 3 MÉTRICAS DA TURMA (ATLETAS, MÉDIA, STREAK)
         ============================================== -->
    <g transform="translate(50, 485)">
      <!-- Card 1: Atletas -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="314" height="116" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.08"/>
        <text x="20" y="30" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="12" letter-spacing="1">ATLETAS</text>
        <circle cx="284" cy="24" r="10" fill="#22D3EE" fill-opacity="0.15"/>
        <path d="M280 28v-2a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v2" stroke="#22D3EE" stroke-width="1.8" fill="none"/>
        <text x="20" y="74" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="32">28</text>
        <text x="20" y="98" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="11">Na disputa ativa</text>
      </g>

      <!-- Card 2: Média Turma -->
      <g transform="translate(333, 0)">
        <rect x="0" y="0" width="314" height="116" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.08"/>
        <text x="20" y="30" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="12" letter-spacing="1">MÉDIA TURMA</text>
        <circle cx="284" cy="24" r="10" fill="#34D399" fill-opacity="0.15"/>
        <path d="M284 18l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#34D399"/>
        <text x="20" y="74" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="30">1.460 <tspan font-size="14" fill="#A1A1AA">XP</tspan></text>
        <text x="20" y="98" fill="#34D399" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11">Ritmo coletivo forte</text>
      </g>

      <!-- Card 3: Top Streak -->
      <g transform="translate(666, 0)">
        <rect x="0" y="0" width="314" height="116" rx="22" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.08"/>
        <text x="20" y="30" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="12" letter-spacing="1">TOP STREAK</text>
        <circle cx="284" cy="24" r="10" fill="#FBBF24" fill-opacity="0.15"/>
        <path d="M284 18c-2 2-3 4-1 6 1 1 2 2 1 4 3-1 4-4 2-6 1-1 0-3-2-4z" fill="#FBBF24"/>
        <text x="20" y="74" fill="#FDE047" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="32">19d</text>
        <text x="20" y="98" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-size="11">Mariana (Ofensiva)</text>
      </g>
    </g>

    <!-- ==============================================
         SELETOR SEGMENTADO (INDIVIDUAL VS SQUADS)
         ============================================== -->
    <g transform="translate(50, 625)">
      <rect x="0" y="0" width="980" height="58" rx="20" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.10"/>
      <!-- Active Button -->
      <g transform="translate(6, 6)">
        <rect x="0" y="0" width="480" height="46" rx="15" fill="#FFFFFF"/>
        <path d="M200 24h-4a4 4 0 0 1 0-8h4m80 8h4a4 4 0 0 0 0-8h-4m-60 20h30m-20-10v3a2 2 0 0 1-2 2h-4v3h20v-3h-4a2 2 0 0 1-2-2v-3" stroke="#000000" stroke-width="2" fill="none"/>
        <text x="240" y="29" text-anchor="middle" fill="#000000" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="14" letter-spacing="1">INDIVIDUAL (28)</text>
      </g>
      <!-- Inactive Button -->
      <g transform="translate(494, 6)">
        <text x="240" y="29" text-anchor="middle" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="14" letter-spacing="1">SQUADS (5)</text>
      </g>
    </g>

    <!-- ==============================================
         BLOCO 3: O PÓDIO 3D DOS TOP 3
         ============================================== -->
    <g transform="translate(50, 710)">
      <!-- Container com Glow Especular -->
      <rect x="0" y="0" width="980" height="500" rx="30" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.10" stroke-width="1.5"/>
      <ellipse cx="490" cy="100" rx="360" ry="100" fill="#FBBF24" fill-opacity="0.08"/>

      <!-- 2º LUGAR: PRATA (ESQUERDA) -->
      <g transform="translate(160, 110)" text-anchor="middle">
        <!-- Avatar Squircle Prata -->
        <rect x="-44" y="0" width="88" height="88" rx="26" fill="#18181B" stroke="#94A3B8" stroke-width="3"/>
        <text x="0" y="55" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="28">LM</text>
        
        <!-- Medalha Prata SVG -->
        <g transform="translate(24, 66)">
          <circle cx="16" cy="16" r="16" fill="url(#silver-medal-rad)" stroke="#FFFFFF" stroke-width="2"/>
          <path d="M16 8L18.2 12.8L23.4 13.5L19.5 17.1L20.5 22.2L16 19.7L11.5 22.2L12.5 17.1L8.6 13.5L13.8 12.8L16 8Z" fill="#1E293B"/>
        </g>

        <!-- Nome & XP -->
        <text x="0" y="126" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18">Lucas Mendes</text>
        <text x="0" y="150" fill="#CBD5E1" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="16">2.340 XP</text>

        <!-- Pedestal Prata (H=170) -->
        <g transform="translate(-110, 170)">
          <path d="M0 20 Q0 0 20 0 L200 0 Q220 0 220 20 L220 170 L0 170 Z" fill="url(#silver-pedestal)" stroke="#94A3B8" stroke-width="1.5"/>
          <line x1="0" y1="0" x2="220" y2="0" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="2"/>
          <text x="110" y="70" text-anchor="middle" fill="#E2E8F0" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="38">2º</text>
          <text x="110" y="100" text-anchor="middle" fill="#94A3B8" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="13" letter-spacing="2">PRATA</text>
        </g>
      </g>

      <!-- 1º LUGAR: OURO (CENTRAL, MAIS ALTO) -->
      <g transform="translate(490, 40)" text-anchor="middle">
        <!-- Coroa Dourada no Topo -->
        <g transform="translate(-20, 0)">
          <path d="M4 10l6 14h20l6-14-8 8-8-12-8 12-8-8z" fill="#FBBF24"/>
          <circle cx="10" cy="8" r="3" fill="#FDE047"/>
          <circle cx="20" cy="4" r="3.5" fill="#FDE047"/>
          <circle cx="30" cy="8" r="3" fill="#FDE047"/>
        </g>

        <!-- Avatar Squircle Ouro Maior -->
        <g transform="translate(0, 40)">
          <rect x="-56" y="0" width="112" height="112" rx="32" fill="#18181B" stroke="#FDE047" stroke-width="4"/>
          <text x="0" y="70" fill="#FDE047" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="38">BC</text>
          
          <!-- Medalha Ouro SVG Maior -->
          <g transform="translate(32, 84)">
            <circle cx="18" cy="18" r="18" fill="url(#gold-medal-rad)" stroke="#FFF2A3" stroke-width="2.5"/>
            <path d="M18 9L20.4 14.4L26.3 15.2L21.9 19.2L23.1 25L18 22.2L12.9 25L14.1 19.2L9.7 15.2L15.6 14.4L18 9Z" fill="#422006"/>
          </g>
        </g>

        <!-- Nome & XP -->
        <text x="0" y="194" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="22">Beatriz Costa</text>
        <text x="0" y="222" fill="#FDE047" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="20">2.890 XP</text>

        <!-- Pedestal Ouro Mais Alto (H=240) -->
        <g transform="translate(-130, 240)">
          <path d="M0 24 Q0 0 24 0 L236 0 Q260 0 260 24 L260 240 L0 240 Z" fill="url(#gold-pedestal)" stroke="#FBBF24" stroke-width="2"/>
          <line x1="0" y1="0" x2="260" y2="0" stroke="#FDE047" stroke-width="3"/>
          <text x="130" y="80" text-anchor="middle" fill="#FDE047" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="52">1º</text>
          <text x="130" y="118" text-anchor="middle" fill="#FEF08A" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="15" letter-spacing="3">LÍDER OURO</text>
        </g>
      </g>

      <!-- 3º LUGAR: BRONZE (DIREITA) -->
      <g transform="translate(820, 140)" text-anchor="middle">
        <!-- Avatar Squircle Bronze -->
        <rect x="-44" y="0" width="88" height="88" rx="26" fill="#18181B" stroke="#EA580C" stroke-width="3"/>
        <text x="0" y="55" fill="#FED7AA" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="28">CS</text>
        
        <!-- Medalha Bronze SVG -->
        <g transform="translate(24, 66)">
          <circle cx="16" cy="16" r="16" fill="url(#bronze-medal-rad)" stroke="#FED7AA" stroke-width="2"/>
          <path d="M16 8L18.2 12.8L23.4 13.5L19.5 17.1L20.5 22.2L16 19.7L11.5 22.2L12.5 17.1L8.6 13.5L13.8 12.8L16 8Z" fill="#2A0B02"/>
        </g>

        <!-- Nome & XP -->
        <text x="0" y="126" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18">Carlos Silva</text>
        <text x="0" y="150" fill="#FB923C" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="16">1.865 XP</text>

        <!-- Pedestal Bronze (H=140) -->
        <g transform="translate(-110, 170)">
          <path d="M0 20 Q0 0 20 0 L200 0 Q220 0 220 20 L220 140 L0 140 Z" fill="url(#bronze-pedestal)" stroke="#EA580C" stroke-width="1.5"/>
          <line x1="0" y1="0" x2="220" y2="0" stroke="#FED7AA" stroke-opacity="0.6" stroke-width="2"/>
          <text x="110" y="65" text-anchor="middle" fill="#FED7AA" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="34">3º</text>
          <text x="110" y="94" text-anchor="middle" fill="#EA580C" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="2">BRONZE</text>
        </g>
      </g>
    </g>

    <!-- ==============================================
         BLOCO 4: TABELA GERAL (CARDS INDIVIDUAIS)
         ============================================== -->
    <g transform="translate(50, 1240)">
      <!-- Card #04: VOCÊ (Gabriel Santos) -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="980" height="110" rx="24" fill="#18181B" stroke="#FBBF24" stroke-opacity="0.60" stroke-width="2"/>
        <!-- Rank Pill Branco -->
        <g transform="translate(20, 24)">
          <rect x="0" y="0" width="62" height="62" rx="16" fill="#FFFFFF"/>
          <text x="31" y="41" text-anchor="middle" fill="#000000" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="22">#04</text>
        </g>
        <!-- Avatar GS -->
        <g transform="translate(100, 24)">
          <rect x="0" y="0" width="62" height="62" rx="18" fill="#27272A" stroke="#FFFFFF" stroke-opacity="0.15"/>
          <text x="31" y="41" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="22">GS</text>
        </g>
        <!-- Nome & Badges -->
        <g transform="translate(182, 34)">
          <text x="0" y="18" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="20">Gabriel Santos</text>
          <!-- Badge VOCÊ -->
          <rect x="160" y="2" width="60" height="22" rx="4" fill="#FBBF24"/>
          <text x="190" y="17" text-anchor="middle" fill="#000000" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="11">VOCÊ</text>
          <!-- Streak Flame -->
          <rect x="230" y="2" width="64" height="22" rx="6" fill="#FBBF24" fill-opacity="0.15" stroke="#FBBF24" stroke-opacity="0.3"/>
          <text x="262" y="17" text-anchor="middle" fill="#FDE047" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="11">🔥 14d</text>
          
          <!-- Barra Relativa -->
          <rect x="0" y="32" width="500" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.08"/>
          <rect x="0" y="32" width="380" height="8" rx="4" fill="url(#overtake-grad)"/>
          <text x="515" y="40" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="12">76%</text>
        </g>
        <!-- XP Total à Direita -->
        <g transform="translate(940, 44)" text-anchor="end">
          <text x="0" y="24" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="28">1.820</text>
          <text x="0" y="44" fill="#FBBF24" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="11" letter-spacing="1">XP TOTAL</text>
        </g>
      </g>

      <!-- Card #05: Rafael Souza -->
      <g transform="translate(0, 126)">
        <rect x="0" y="0" width="980" height="110" rx="24" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5"/>
        <g transform="translate(20, 24)">
          <rect x="0" y="0" width="62" height="62" rx="16" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.15"/>
          <text x="31" y="41" text-anchor="middle" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="20">#05</text>
        </g>
        <g transform="translate(100, 24)">
          <rect x="0" y="0" width="62" height="62" rx="18" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.10"/>
          <text x="31" y="41" text-anchor="middle" fill="#D4D4D8" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="22">RS</text>
        </g>
        <g transform="translate(182, 34)">
          <text x="0" y="18" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="20">Rafael Souza</text>
          <!-- Streak Flame -->
          <rect x="140" y="2" width="64" height="22" rx="6" fill="#FBBF24" fill-opacity="0.15" stroke="#FBBF24" stroke-opacity="0.3"/>
          <text x="172" y="17" text-anchor="middle" fill="#FDE047" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="11">🔥 11d</text>
          <!-- Barra Relativa -->
          <rect x="0" y="32" width="500" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.08"/>
          <rect x="0" y="32" width="340" height="8" rx="4" fill="#71717A"/>
          <text x="515" y="40" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="12">68%</text>
        </g>
        <g transform="translate(940, 44)" text-anchor="end">
          <text x="0" y="24" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="28">1.640</text>
          <text x="0" y="44" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11" letter-spacing="1">XP TOTAL</text>
        </g>
      </g>

      <!-- Card #06: Juliana Prado -->
      <g transform="translate(0, 252)">
        <rect x="0" y="0" width="980" height="110" rx="24" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5"/>
        <g transform="translate(20, 24)">
          <rect x="0" y="0" width="62" height="62" rx="16" fill="#09090B" stroke="#FFFFFF" stroke-opacity="0.15"/>
          <text x="31" y="41" text-anchor="middle" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="20">#06</text>
        </g>
        <g transform="translate(100, 24)">
          <rect x="0" y="0" width="62" height="62" rx="18" fill="#18181B" stroke="#FFFFFF" stroke-opacity="0.10"/>
          <text x="31" y="41" text-anchor="middle" fill="#A1A1AA" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="22">JP</text>
        </g>
        <g transform="translate(182, 34)">
          <text x="0" y="18" fill="#D4D4D8" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="20">Juliana Prado</text>
          <!-- Streak Flame -->
          <rect x="140" y="2" width="60" height="22" rx="6" fill="#FBBF24" fill-opacity="0.15" stroke="#FBBF24" stroke-opacity="0.3"/>
          <text x="170" y="17" text-anchor="middle" fill="#FDE047" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="11">🔥 9d</text>
          <!-- Barra Relativa -->
          <rect x="0" y="32" width="500" height="8" rx="4" fill="#FFFFFF" fill-opacity="0.08"/>
          <rect x="0" y="32" width="310" height="8" rx="4" fill="#52525B"/>
          <text x="515" y="40" fill="#71717A" font-family="'JetBrains Mono', monospace" font-size="12">62%</text>
        </g>
        <g transform="translate(940, 44)" text-anchor="end">
          <text x="0" y="24" fill="#D4D4D8" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="28">1.490</text>
          <text x="0" y="44" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11" letter-spacing="1">XP TOTAL</text>
        </g>
      </g>
    </g>

    <!-- ==============================================
         DOCK FLUTUANTE INFERIOR PWA
         ============================================== -->
    <g transform="translate(50, 1780)">
      <rect x="0" y="0" width="980" height="100" rx="32" fill="#09090B" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1.5"/>
      
      <!-- Nav Items -->
      <g transform="translate(80, 50)" text-anchor="middle">
        <path d="M-10-2l10-8 10 8v12h-6v-6h-8v6h-6z" fill="#71717A"/>
        <text x="0" y="24" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11">INÍCIO</text>
      </g>

      <g transform="translate(260, 50)" text-anchor="middle">
        <circle cx="0" cy="4" r="9" stroke="#71717A" stroke-width="2" fill="none"/>
        <path d="M-3 4l2 2 4-4" stroke="#71717A" stroke-width="2" fill="none"/>
        <text x="0" y="24" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11">MISSÕES</text>
      </g>

      <!-- Botão Central: CÂMERA ANTIFRAUDE -->
      <g transform="translate(490, 40)">
        <circle cx="0" cy="0" r="38" fill="#FFFFFF" filter="drop-shadow(0 0 20px rgba(255,255,255,0.4))"/>
        <path d="M-12-6h5l2.5-3h9l2.5 3h5a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3h-24a3 3 0 0 1-3-3v-13a3 3 0 0 1 3-3z" fill="#000000"/>
        <circle cx="0" cy="4" r="5" fill="#FFFFFF"/>
      </g>

      <!-- Ativo: RANKING -->
      <g transform="translate(720, 50)" text-anchor="middle">
        <path d="M-8 6h-3a3 3 0 0 1 0-6h3m16 6h3a3 3 0 0 0 0-6h-3m-12 14h8m-5-4v2" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
        <circle cx="0" cy="28" r="3" fill="#FFFFFF"/>
        <text x="0" y="24" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="11">RANKING</text>
      </g>

      <g transform="translate(900, 50)" text-anchor="middle">
        <circle cx="0" cy="0" r="6" stroke="#71717A" stroke-width="2" fill="none"/>
        <path d="M-8 12c0-4 4-6 8-6s8 2 8 6" stroke="#71717A" stroke-width="2" fill="none"/>
        <text x="0" y="24" fill="#71717A" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="11">PERFIL</text>
      </g>
    </g>
  </svg>
  `;
}

// -------------------------------------------------------------
// 2. GERAR MOCKUP 3D TITANIUM COM IPHONE 16 PRO (1080 x 1920)
// -------------------------------------------------------------
function buildMockupTitaniumSvg() {
  return `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Studio Deep Background -->
      <radialGradient id="studio-dark" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#18181D"/>
        <stop offset="50%" stop-color="#09090B"/>
        <stop offset="100%" stop-color="#000000"/>
      </radialGradient>

      <!-- Spot Light Reflections -->
      <radialGradient id="phone-backglow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.08"/>
        <stop offset="60%" stop-color="#FBBF24" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>

      <!-- Titanium Brushed Chassis Rim -->
      <linearGradient id="chassis-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#52525B"/>
        <stop offset="25%" stop-color="#27272A"/>
        <stop offset="50%" stop-color="#71717A"/>
        <stop offset="75%" stop-color="#18181B"/>
        <stop offset="100%" stop-color="#3F3F46"/>
      </linearGradient>

      <!-- Specular Highlight Top -->
      <linearGradient id="specular-top" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Fundo de Estúdio -->
    <rect width="1080" height="1920" fill="url(#studio-dark)"/>
    <ellipse cx="540" cy="850" rx="460" ry="700" fill="url(#phone-backglow)"/>

    <!-- ==============================================
         HEADER DO ANÚNCIO (TOP MARKETING)
         ============================================== -->
    <g transform="translate(540, 100)" text-anchor="middle">
      <!-- Tag Pill -->
      <rect x="-140" y="0" width="280" height="34" rx="17" fill="#FBBF24" fill-opacity="0.12" stroke="#FBBF24" stroke-opacity="0.3"/>
      <text x="0" y="22" fill="#FDE047" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="12" letter-spacing="2">ARENAFITPRO OS</text>
      
      <!-- Headline Impactante -->
      <text x="0" y="78" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="46" letter-spacing="-1.5">
        Gamificação que Vicia
      </text>
      <text x="0" y="126" fill="#D4D4D8" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="24">
        Seus alunos disputando o pódio em tempo real.
      </text>
    </g>

    <!-- ==============================================
         BADGES FLUTUANTES 3D (PROVA SOCIAL & AUDITORIA)
         ============================================== -->
    <!-- Badge Esquerda: Auditoria Ativa -->
    <g transform="translate(60, 480)">
      <rect x="0" y="0" width="220" height="74" rx="20" fill="#09090B" fill-opacity="0.9" stroke="#FFFFFF" stroke-opacity="0.18" filter="drop-shadow(0 20px 30px rgba(0,0,0,0.8))"/>
      <circle cx="32" cy="37" r="8" fill="#10B981"/>
      <circle cx="32" cy="37" r="14" fill="#10B981" fill-opacity="0.2"/>
      <text x="56" y="32" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="10" letter-spacing="1">AUDITORIA NATIVA</text>
      <text x="56" y="52" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="13">Câmera sem Galeria</text>
    </g>

    <!-- Badge Direita: Retenção 94.8% -->
    <g transform="translate(800, 1180)" text-anchor="end">
      <rect x="-220" y="0" width="220" height="92" rx="22" fill="#09090B" fill-opacity="0.95" stroke="#FBBF24" stroke-opacity="0.4" filter="drop-shadow(0 20px 40px rgba(0,0,0,0.9))"/>
      <text x="-24" y="30" fill="#FBBF24" font-family="'JetBrains Mono', monospace" font-weight="800" font-size="10" letter-spacing="1">RETENÇÃO MÉDIA</text>
      <text x="-24" y="60" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="28">94.8%</text>
      <text x="-24" y="78" fill="#A1A1AA" font-family="'Plus Jakarta Sans', sans-serif" font-size="11">Alunos até o dia 21</text>
    </g>

    <!-- ==============================================
         CHASSI IPHONE 16 PRO BLACK TITANIUM
         Dimensões: Largura 640px, Altura 1320px
         Centro: X=220, Y=270
         ============================================== -->
    <g transform="translate(220, 270)">
      <!-- Sombra Profunda 3D -->
      <rect x="10" y="30" width="620" height="1300" rx="66" fill="#000000" filter="blur(30px)" opacity="0.9"/>
      
      <!-- Aro Externo Titânio Fosco -->
      <rect x="0" y="0" width="640" height="1320" rx="68" fill="#1C1C1F" stroke="url(#chassis-rim)" stroke-width="4"/>
      
      <!-- Borda de Precisão CNC interna -->
      <rect x="8" y="8" width="624" height="1304" rx="60" fill="#09090B" stroke="#000000" stroke-width="6"/>

      <!-- Borda Especular Superior -->
      <line x1="80" y1="2" x2="560" y2="2" stroke="url(#specular-top)" stroke-width="2"/>

      <!-- Botoes Laterais Simulação -->
      <rect x="-5" y="180" width="4" height="40" rx="2" fill="#3F3F46"/>
      <rect x="-5" y="250" width="4" height="60" rx="2" fill="#3F3F46"/>
      <rect x="-5" y="325" width="4" height="60" rx="2" fill="#3F3F46"/>
      <rect x="641" y="270" width="4" height="80" rx="2" fill="#3F3F46"/>

      <!-- ============================================
           ÁREA DA TELA DO IPHONE (BEZEL FINO OLED)
           Largura: 608px, Altura: 1288px
           X=16, Y=16, rx=52
           ============================================ -->
      <g transform="translate(16, 16)">
        <clipPath id="iphone-screen-clip">
          <rect width="608" height="1288" rx="52" fill="#000000"/>
        </clipPath>

        <g clip-path="url(#iphone-screen-clip)">
          <!-- Render em Escala do Leaderboard (Scale = 608 / 1080 = 0.563) -->
          <g transform="scale(0.563)">
            ${buildMobileScreenSvg().replace('<svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
          </g>

          <!-- Vidro Especular Diagonal Suave -->
          <path d="M0 0 L608 0 L300 1288 L0 1288 Z" fill="#FFFFFF" fill-opacity="0.015"/>
        </g>
      </g>
    </g>

    <!-- ==============================================
         FOOTER DO ANÚNCIO (CTA & OFERTA DO BETA)
         ============================================== -->
    <g transform="translate(540, 1720)" text-anchor="middle">
      <!-- Pill CTA -->
      <rect x="-240" y="0" width="480" height="64" rx="32" fill="#FFFFFF" filter="drop-shadow(0 15px 35px rgba(255,255,255,0.25))"/>
      <text x="0" y="38" fill="#000000" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="18" letter-spacing="0.5">
        GARANTIR UMA DAS 15 VAGAS NO BETA →
      </text>

      <text x="0" y="94" fill="#A1A1AA" font-family="'JetBrains Mono', monospace" font-size="13">
        Plano PRO Vitalício Gratuito ($0 de mensalidade) • 0% de Taxa
      </text>
      <text x="0" y="120" fill="#FBBF24" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="13">
        arenafitpro.app/beta
      </text>
    </g>
  </svg>
  `;
}

// -------------------------------------------------------------
// EXECUÇÃO DO SHARP
// -------------------------------------------------------------
async function run() {
  console.log('Iniciando renderização de alta fidelidade com Sharp (1080x1920)...');

  // 1. Tela Mobile Pura
  const mobileSvg = Buffer.from(buildMobileScreenSvg());
  const mobileOutput = path.join(OUTPUT_DIR, 'tela-leaderboard-mobile.jpg');
  await sharp(mobileSvg)
    .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
    .toFile(mobileOutput);
  console.log(`✓ 1. Tela Mobile Pura gerada: ${mobileOutput}`);

  // 2. Mockup 3D iPhone 16 Pro Titanium
  const mockupSvg = Buffer.from(buildMockupTitaniumSvg());
  const mockupOutput = path.join(OUTPUT_DIR, 'mockup-leaderboard-titanium.jpg');
  await sharp(mockupSvg)
    .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
    .toFile(mockupOutput);
  console.log(`✓ 2. Mockup 3D Titanium gerado: ${mockupOutput}`);

  console.log('✅ Ambas as telas fidedignas foram geradas com sucesso!');
}

run().catch(console.error);
