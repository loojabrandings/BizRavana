---
name: build-awwwards-quality-sites
description: "Use when designing, architecting, or building Awwwards-level, ultra-premium, high-craft web experiences, landing pages, interactive demos, or portfolio sites. Triggers: Awwwards styling, luxury design, creative frontend, rich micro-interactions, fluid animations, typography hierarchy, editorial layouts, noise/glassmorphism aesthetics, GSAP/Framer Motion animations, smooth scrolling, and dynamic web craft."
metadata:
  author: Antigravity
  version: "1.0.0"
---

# Building Awwwards-Quality Web Experiences

A comprehensive guide for crafting world-class, award-winning web applications and landing pages that captivate users with high visual craft, smooth motion, and uncompromising polish.

---

## 1. Visual Identity & Art Direction

### Color & Atmosphere
- **Avoid Generic Default Colors**: Never use standard saturated reds, greens, or blues. Use deep, cohesive, and curated color palettes (e.g., deep obsidian `#0A0A0C`, warm zinc `#18181B`, champagne gold `#D4AF37`, luminous emerald `#10B981`, electric indigo `#6366F1`).
- **Surface Layering & Depth**: Build tactile hierarchy using subtle borders (`rgba(255, 255, 255, 0.08)`), backdrop blurs (`backdrop-blur-md` / `backdrop-blur-xl`), inner glows, and multi-layered drop shadows.
- **Grain & Texture**: Incorporate subtle noise overlays (`mix-blend-overlay` / SVG grain filters at 3–6% opacity) to add physical texture and prevent flat gradients from banding.
- **Dynamic Lighting**: Use radial gradient ambient orbs, conic glows, and spotlights that react to mouse position or scroll progress.

### Typography & Editorial Structure
- **Distinctive Typefaces**: Pair high-character display fonts (e.g., *Syne*, *Clash Display*, *Cabinet Grotesk*, *Playfair Display*, *Cinzel*) with clean, highly readable geometric or neo-grotesque body fonts (e.g., *Inter*, *Plus Jakarta Sans*, *General Sans*).
- **Extreme Scale Contrasts**: Pair giant editorial headlines (`clamp(3rem, 8vw, 7rem)`) with ultra-refined, tracked uppercase labels (`text-[10px] tracking-[0.25em] uppercase font-semibold`).
- **Fluid Type & Spacing**: Use `clamp()` for fluid responsive sizing across viewports without abrupt breakpoint jumps.
- **Text Masking & Gradients**: Use `bg-clip-text` with multi-stop linear or angled gradients for key focal points.

---

## 2. Motion Design & Interaction Physics

### Fluidity & Feel
- **Cubic Bézier Curves**: Never use linear transitions for UI elements. Use custom easing curves with spring-like character:
  - Snappy enter: `cubic-bezier(0.16, 1, 0.3, 1)` (easeOutExpo)
  - Smooth deceleration: `cubic-bezier(0.25, 1, 0.5, 1)` (easeOutQuart)
  - Elastic / Fluid: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Staggered Reveals**: Reveal card grids, lists, and headline words with staggered delays (e.g., 50ms–100ms per child) using Framer Motion or CSS orchestration.
- **Scroll-Linked Motion**: Implement parallax offsets, progressive scale changes, and pinned horizontal reveal sections as users scroll.
- **Magnetic & Interactive Cursor**: Implement magnetic button hover effects where buttons subtly pull towards the cursor within a bounding radius.

### Micro-Interactions
- **Button Polish**: Buttons should feature subtle scale-down on press (`active:scale-[0.98]`), shimmering borders, subtle shine sweeps on hover, and distinct icon translation effects (`group-hover:translate-x-1`).
- **Card Hover Physics**: 3D tilt effects reacting to cursor position (`perspective: 1000px`, `rotateX`, `rotateY`) combined with dynamic spotlight overlays following the mouse coordinates.
- **Tab & Segment Transitions**: Use shared layout animations (`framer-motion` `layoutId`) for active pill indicators moving smoothly across items.

---

## 3. Layout Architecture & Composition

### Breaking the Monotony
- **Asymmetrical & Editorial Layouts**: Break out of traditional 3-column equal boxes. Combine wide feature hero blocks with vertical stat columns, overlapping cards, and floating badge callouts.
- **Marquees & Live Badges**: Integrate infinite auto-scrolling ticker bands (logos, client reviews, tech stacks) with seamless pause-on-hover.
- **Bento Grid Layouts**: Structure dashboard/feature sections into modular bento grids with varying aspect ratios (1x1, 2x1, 2x2), accented with glowing borders and contextual illustrations.
- **Hero Staging**: Hero sections must tell a story immediately with strong visual anchors (e.g., 3D canvas, interactive mockups with live simulated previews, floating metric pills).

---

## 4. Technical Implementation & Performance

### Next.js & React Best Practices
1. **Client vs. Server Boundary**: Keep heavy interactive motion components in dedicated `'use client'` files while keeping data fetching and SEO copy server-rendered.
2. **Smooth Scrolling**: Integrate Lenis (`@studio-freight/lenis` or `lenis`) for momentum-based butter-smooth scrolling without breaking native accessibility.
3. **Hardware Acceleration**: Always animate `transform` (GPU: `translate3d`, `scale`, `rotate`) and `opacity`. Avoid animating layout-triggering properties (`width`, `height`, `top`, `left`, `margin`).
4. **Will-Change & GPU Layers**: Apply `will-change: transform` or `transform: translateZ(0)` thoughtfully to avoid compositing layer bloat.

### Asset Excellence
- **Zero Placeholder Images**: Use high-fidelity photography, custom generated generative imagery, or crisp vector SVG art.
- **Modern Formats**: Serve images via Next.js `<Image />` with modern `webp`/`avif` formats, proper `priority` flags on above-the-fold heroes, and blur placeholders.
- **Dynamic Icons**: Use modern, cohesive icon sets (e.g., `lucide-react`, `phosphor-icons`) with matching stroke widths (1.5px or 2px).

---

## 5. Awwwards Checklist

Before marking any design complete, verify:
- [ ] **First Impression**: Does the hero section evoke an immediate emotional reaction / "wow" factor?
- [ ] **Typography**: Are font pairings distinctive and is the visual hierarchy unmistakable?
- [ ] **Hover Polish**: Does every clickable element provide rich, intentional visual feedback?
- [ ] **Scroll Continuity**: Does the page feel alive and reactive throughout the entire scroll journey?
- [ ] **Contrast & Accessibility**: Are text and critical actions clearly legible across light and dark backgrounds?
- [ ] **60fps Performance**: Are animations stutter-free and optimized for mobile screens as well as 4K monitors?
