# BizRavana Client Demo Showcase Architecture

This directory houses standalone, high-converting concept demo landing pages used for direct client outreach and the BizRavana Web Design portfolio showcase.

---

## 🏗️ Architecture & Isolation

All demo pages are grouped inside the `(demos)` route group:
- **Zero Bundle Impact on Main Website:** Next.js Route-level code splitting ensures that none of the demo components, assets, or scripts load on the main website routes (`/`, `/services/*`, `/dashboard`, etc.).
- **Standalone Layout:** Demos do not inherit BizRavana's global header and footer, allowing clients to experience the page as an authentic, dedicated business website.
- **Global Demo Toolbar:** The `DemoPreviewToolbar` provides a non-intrusive floating pill allowing prospective clients to convert and reach out to BizRavana.
- **Interactive Toast Context:** Demo action buttons (e.g. Booking forms, inquiries) trigger `useDemoToast()` without needing complex backend endpoints during the demo stage.

---

## 📁 Directory Structure

```text
src/
├── app/
│   └── (demos)/
│       └── demos/
│           ├── layout.tsx                    <-- Standalone layout + Floating CTA bar + Toast Provider
│           ├── README.md                     <-- This architecture documentation
│           │
│           ├── event-planner/                <-- 1. Event Planners Landing Page
│           │   ├── page.tsx                  <-- Single Landing Page
│           │   └── components/               <-- Section components (Hero, Services, Portfolio, etc.)
│           │
│           ├── salon-spa/                    <-- 2. Salons & Spas Landing Page
│           │   ├── page.tsx
│           │   └── components/
│           │
│           └── luxury-villa/                 <-- 3. Hotels & Villas Landing Page
│               ├── page.tsx
│               └── components/
│
├── components/
│   └── demos/
│       ├── DemoPreviewToolbar.tsx            <-- Floating BizRavana CTA pill
│       └── DemoToastContext.tsx              <-- Demo action feedback toast provider
│
└── data/
    └── demo-sites.ts                         <-- Showcase metadata for web-design portfolio
```

---

## ⚡ Performance & Development Rules

1. **Images:** Always use `next/image` with optimized dimensions, `loading="lazy"`, and WebP/AVIF format.
2. **Icons:** Use Lucide icons or lightweight SVG vectors directly in components.
3. **Animations:** Use `framer-motion` for viewport animations (`whileInView`, `viewport={{ once: true }}`).
4. **Isolated Styling:** Keep demo-specific colors and theme tokens scoped to the respective demo component files or dedicated stylesheets.

---

## 🚀 Adding a New Section

When implementing a UI design section by section:
1. Create the section component inside the demo's `components/` folder (e.g., `components/EventHero.tsx`).
2. Import and place it in the demo's `page.tsx`.
3. Use `useDemoToast()` for any interactive buttons (booking, contact, pricing inquiry).
