# Design System: ArenaFitPro — Luxury Splash & Monochrome Design System

## 1. Visual Theme & Atmosphere
* **Mood & Atmosphere:** Minimalist, Ultra-Luxury, Cinematic, Whisper-Quiet.
* **Philosophy:** True Black OLED (`#000000`) infinite field of depth with zero visual noise. Elimination of cheap UI clichés (such as spinning circular loaders, progress bars, or generic loading text). The brand mark communicates authority and luxury in isolation.
* **Motion Choreography:**
  - **Fade-In:** Decelerating ease curve `cubic-bezier(0.16, 1, 0.3, 1)` expanding from scale 0.94 with 8px Gaussian blur reduction into sharp focus.
  - **Idle State:** Organic, meditative breathing of the specular backglow (3.5s cycle).
  - **Hover / Touch Interaction:** Interactive halo expansion (up to 420px) with parallax depth tracking, specular rim highlights, and surface glass shimmer.
  - **Fade-Out:** Accelerating ease-in dissolve (750ms) with subtle scale expansion (1.04) and gentle blur, providing a seamless transition to the destination view.

## 2. Color Palette & Roles
* **Pitch OLED Black (`#000000`):** Full screen backdrop, eliminating canvas boundaries on mobile and desktop OLED displays.
* **Deep Titanium Charcoal (`#09090b` / `zinc-950`):** Squircle container backing, providing tactile volume.
* **Whisper Platinum Glow (`rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.16)`): Diffused volumetric backglow simulating ambient light reflected off polished metal.
* **Specular White Highlight (`rgba(255, 255, 255, 0.50)`): Hairline border illumination and interactive rim glow.

## 3. Geometry & Elevation
* **Emblem Container:** Generously rounded squircle (`rounded-[28px]` mobile, `rounded-[32px]` desktop).
* **Layering & Shadows:**
  - Multi-tier Gaussian blur: 60px ambient spread combined with a 24px luminous core.
  - Layered elevation shadows: `shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.05)]` elevating on hover to `shadow-[0_0_50px_rgba(255,255,255,0.35)]`.

## 4. Typography Rules
* **Rule:** Strict omission of text during loading/splash sequence. Zero typography ensures universal luxury appeal, cross-language elegance, and avoids the cheap appearance of generic loading spinners.
