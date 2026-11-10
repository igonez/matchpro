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

## 2. Color Palette & Functional Roles (V4 — Monochrome + Blue Accent)
> Rule: the app is predominantly black / gray / white. Blue is reserved for actions and subtle details. Never use blue-tinted grays.

**Neutrals (pure, no blue tint)**
* **Background (`#000000`):** Full screen backdrop.
* **Surface (`#0E0E10`):** Page sections, drawers, nav bars.
* **Card / Elevated (`#18181B`):** Cards, inputs, sheets.
* **Border (`#27272A`) / Hairline (`border-white/10`):** Dividers and card/badge outlines.
* **Text Primary (`#FAFAFA`)**, **Text Secondary (`#D4D4D8`)**, **Text Muted (`#A1A1AA`)**.
* **Neutral chip background:** `bg-white/[0.06]`.

**Accent — Electric Blue (`#3478F6`, hover `#75A7FF`)** — use ONLY for:
* Primary buttons (`bg-[#3478F6]`), active tabs, selected states (solid border).
* Focus rings, hover borders/text, active-nav icon and indicator dot.
* Small icons and progress fills as subtle details.
* Do NOT use blue for card borders, chip backgrounds, eyebrow labels or body text.

**Semantic colors (kept)**
* **Red / Rose:** Anti-churn radar, risk alerts, errors.
* **Amber / Gold, Silver, Bronze:** Ranking podium, XP, rewards, streaks.
* **Emerald:** Payment confirmations and approvals.

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
