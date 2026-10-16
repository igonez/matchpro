# Design System: ArenaFitPro — Luxury Monochrome & Titanium Gamification OS
**Project ID:** ArenaFitPro-2026-V3

## 1. Visual Theme & Atmosphere
* **Mood & Atmosphere:** Minimalist, Ultra-Luxury, Cinematic, Tactile Titanium, Whisper-Quiet Authority.
* **Philosophy:** True Black OLED (`#000000`) infinite field of depth with zero visual clutter. Elimination of cheap UI clichés (such as spinning circular loaders, generic colorful gradients, or unstyled emojis). The brand communicates authority, athletic discipline, and fintech reliability.
* **Motion Choreography:**
  - **Fade-In & Entrance:** Decelerating ease curve `cubic-bezier(0.16, 1, 0.3, 1)` expanding from scale 0.94 with 8px Gaussian blur reduction into sharp focus.
  - **Idle State:** Meditative, organic breathing of the specular backglow (3.5s cycle).
  - **Hover & Touch Interaction:** Interactive halo expansion (up to 420px) with parallax depth tracking, specular rim highlights, and subtle 1.5° 3D tilt.
  - **Tactile Feedback:** Press states use scale reduction (`active:scale-[0.98]`) without triggering layout shifts or bounds jitter.

---

## 2. Color Palette & Functional Roles
* **Pitch OLED Black (`#000000`):** Full screen backdrop, eliminating canvas boundaries on mobile and desktop OLED displays.
* **Deep Titanium Charcoal (`#09090b` / `zinc-950`):** Squircle container backing, providing tactile volume and card elevation.
* **Zinc Surface Muted (`#18181b` / `zinc-900`):** Secondary container surface and nested badge background.
* **Whisper Platinum Glow (`rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.16)`): Diffused volumetric backglow simulating ambient light reflected off polished titanium.
* **Specular White Highlight (`rgba(255, 255, 255, 0.50)`): Hairline border illumination and interactive rim glow.
* **Pure Optical White (`#ffffff`):** Primary action buttons, headline text, and critical contrast highlights.
* **Emerald Precision (`#34d399` / `emerald-400`):** Fintech verification, Pix split confirmations, approved missions, and positive streaks.
* **Amber Aureum (`#fbbf24` / `amber-400`):** XP points, 1st place crown, Mystery Box rewards, and active streak flames.
* **Cyan Cryogenic (`#22d3ee` / `cyan-400`):** Freeze Shield protection, cardio track telemetry, and timer HUD.

---

## 3. Typography & Hierarchy Rules
* **Headline Typographic Scale:**
  - Hero Display: `text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] text-balance`.
  - Section Headings: `text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 text-balance`.
  - Card Titles: `text-xl sm:text-2xl font-black text-white tracking-tight`.
* **Body & Supporting Copy:**
  - Body Text: `text-sm sm:text-base text-zinc-300 leading-relaxed font-normal text-pretty`.
  - Secondary Details: `text-xs text-zinc-400 leading-normal`.
  - Minimum Contrast Rule: **Never use `zinc-500` for informational text** over black surfaces. Minimum standard is `zinc-400` for tertiary metadata and `zinc-300` for readable body text, satisfying WCAG AA 4.5:1 ratio.
* **Monospace Badges:**
  - Standard font-mono labels: `text-[10px] sm:text-[11px] font-mono uppercase tracking-wider`.

---

## 4. Component Stylings & Token Standards
* **Buttons:**
  - *Primary Button (`mono-button-primary`):* Pill-shaped (`rounded-full`), optical white background (`#ffffff`), pitch black bold text (`#000000`), inset specular border, elevation shadow `shadow-[0_10px_25px_rgba(255,255,255,0.18)]`, active press scale `0.98`.
  - *Secondary Button (`mono-button-secondary`):* Pill-shaped (`rounded-full`), titanium dark glass (`rgba(20, 20, 24, 0.7)`), hairline white rim `border border-white/12 border-t-white/25`, backdrop blur `16px`.
* **Cards & Containers (`SpotlightCard3D`):**
  - Generously rounded squircle (`rounded-3xl` / `rounded-[28px]`).
  - True glass backing (`bg-zinc-950/80` or `rgba(10, 10, 12, 0.75)`), backdrop blur `28px`.
  - Hairline specular top border: `border-t-white/22`, lateral border `border-white/08`.
  - Interactive mouse/touch radial spotlight follower.
* **Medals & Badges:**
  - **Zero Emoji Rule:** Structural podium and status indicators must NEVER use OS emojis (`🥇 🥈 🥉`). They are strictly rendered via vector SVG metallic gradients (`GoldMedalBadge`, `SilverMedalBadge`, `BronzeMedalBadge`).

---

## 5. Layout & Responsive Principles
* **Mobile First (PWA Standard):** Mobile-first viewport centered with safe area padding.
* **Desktop Frame:** When viewed on desktop, mobile app screens are contained in `max-w-md` with `border-x border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.95)]` simulating an elegant hardware bezel.
* **8dp Spacing Rhythm:** All margins, paddings, and component gaps follow strict 4px / 8px increments (`p-2 = 8px`, `p-4 = 16px`, `p-6 = 24px`, `p-8 = 32px`).
