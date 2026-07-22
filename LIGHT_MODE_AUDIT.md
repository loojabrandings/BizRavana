# BizRavana — Light Mode Compatibility Audit

> Date: 2026-07-16
> Status: Pre-fix audit (Phase 3) — Not yet actioned
> Next: Phase 4 — Theme token refinement and CSS fix implementation

---

## Theme System Overview

The application uses OKLCH CSS variables with:
- **Light mode** (`:root`) — well-defined tokens
- **Dark mode** (`.dark`) — well-defined tokens  
- **5 accent colors** — blue, green, purple, rose, amber + custom
- **Glass utilities** — `glass-card`, `glass-panel`, `glass-sidebar`
- **Status colors** — info, success, warning, danger

**Existing semantic tokens** (all correct):
`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--border`, `--input`, `--ring`, `--destructive`, `--success`, `--success-foreground`, `--warning`, `--warning-foreground`, `--sidebar*`, `--chart-1-5`, `--status-*`, `--revenue`, `--expense`, `--net-profit`

**Missing tokens that would help:**
- `--tooltip-bg` / `--tooltip-text` — for chart tooltips
- `--table-stripe` — for alternating table rows
- `--badge-success` / `--badge-warning` / `--badge-info` / `--badge-danger` — for status badges
- `--overlay` — for dialog/sheet backdrops

---

## SECTION 1 — Hardcoded Colors

### 1.1 `text-white` — Critical — Used where semantic `text-primary-foreground` should be used

| File | Line | Current | Replace With | Severity |
|------|------|---------|--------------|----------|
| `src/components/ui/button.tsx` | 29 | `text-white` | `text-primary-foreground` | Critical |
| `src/components/ui/button.tsx` | 34 | `text-white` | `text-primary-foreground` | Critical |
| `src/components/layout/sidebar.tsx` | 459 | `text-white` | `text-primary-foreground` | High |
| `src/components/layout/sidebar.tsx` | 503 | `text-white` | `text-primary-foreground` | High |
| `src/components/delivery/courier-settings.tsx` | 235 | `text-white` | `text-primary-foreground` | Medium |
| `src/components/orders/shipment-status-panel.tsx` | 205 | `text-white` | `text-primary-foreground` | Medium |
| `src/components/orders/dispatch-dialog.tsx` | 112 | `text-white` | `text-primary-foreground` | Medium |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 297 | `text-white` | `text-primary-foreground` | High |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 305 | `text-white` | `text-primary-foreground` | High |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 394 | `text-white` | (brand icon — intentional) | Low |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 402 | `text-white` | (brand icon — intentional) | Low |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 418 | `text-white` | (brand icon — intentional) | Low |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 465 | `text-white` | `text-primary-foreground` | Medium |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 474 | `text-white` | `text-primary-foreground` | Medium |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 518 | `text-white` | `text-primary-foreground` | High |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 598 | `text-white` | `text-primary-foreground` | High |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 614 | `text-white` | `text-primary-foreground` | High |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 1015 | `text-white` | `text-primary-foreground` | Medium |

### 1.2 `bg-black/` — Overlay backdrops — Should use themed overlay token

| File | Line | Current | Replace With | Severity |
|------|------|---------|--------------|----------|
| `src/components/ui/sheet.tsx` | 31 | `bg-black/15` | `bg-overlay/30` or `bg-foreground/10` | Medium |
| `src/components/ui/dialog.tsx` | 34 | `bg-black/10` | `bg-overlay/30` or `bg-foreground/10` | Medium |
| `src/components/shared/keyboard-shortcuts-dialog.tsx` | 64 | `bg-black/40 backdrop-blur-sm` | `bg-background/80 backdrop-blur-sm` | High |
| `src/components/shared/image-crop-dialog.tsx` | 148 | `bg-black/5` | `bg-muted` | Low |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 458 | `bg-black/40` | `bg-foreground/20` | Medium |

### 1.3 Hardcoded Tailwind Utility Colors (gray, zinc, slate, etc.)

| File | Line | Current | Replace With | Severity |
|------|------|---------|--------------|----------|
| `src/components/reports/orders-analytics-content.tsx` | 176 | `bg-gray-400/15 text-gray-500 dark:text-gray-400` | `bg-muted text-muted-foreground` | High |

### 1.4 Hardcoded Brand Colors (Intentional — skip unless problematic)

| File | Line | Color | Notes |
|------|------|-------|-------|
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 393 | `bg-[#1877F2]` | Facebook brand blue — intentional |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 401 | `from-[#F58529] via-[#DD2A7B] to-[#8134AF]` | Instagram gradient — intentional |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 409 | `bg-[#000000] dark:bg-white` | TikTok black/white — intentional |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 417 | `bg-[#0A66C2]` | LinkedIn brand blue — intentional |

### 1.5 `text-emerald-*` / `text-amber-*` / `text-blue-*` Status Colors

These use hardcoded Tailwind colors with dark mode overrides. Should use semantic status tokens.

| File | Line | Current | Replace With | Severity |
|------|------|---------|--------------|----------|
| `src/components/orders/order-preview.tsx` | 333 | `text-emerald-600 dark:text-emerald-400` | `text-success` | High |
| `src/components/orders/order-preview.tsx` | 571 | `text-emerald-600 dark:text-emerald-400` | `text-success` | High |
| `src/components/orders/order-preview.tsx` | 600 | `bg-amber-500/10 text-amber-600 dark:text-amber-400` | `bg-warning/10 text-warning` | High |
| `src/components/orders/order-preview.tsx` | 605 | `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400` | `bg-success/10 text-success` | High |
| `src/components/orders/order-preview.tsx` | 610 | `bg-blue-500/10 text-blue-600 dark:text-blue-400` | `bg-info/10 text-info` | High |
| `src/components/reports/orders-analytics-content.tsx` | 174 | `bg-amber-500/15 text-amber-600 dark:text-amber-400` | `bg-warning/15 text-warning` | High |
| `src/components/reports/orders-analytics-content.tsx` | 176 | `bg-gray-400/15 text-gray-500 dark:text-gray-400` | `bg-muted text-muted-foreground` | High |
| `src/components/reports/orders-analytics-content.tsx` | 178 | `bg-orange-400/15 text-orange-600 dark:text-orange-400` | `bg-warning/15 text-warning` | High |
| `src/components/quotations/quotation-preview.tsx` | 327 | `text-emerald-600 dark:text-emerald-400` | `text-success` | High |
| `src/components/delivery/courier-settings.tsx` | 302 | `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400` | `bg-success/10 text-success` | Medium |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 258 | `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400` | `bg-success/10 text-success` | High |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 259 | `bg-amber-500/10 text-amber-600 dark:text-amber-400` | `bg-warning/10 text-warning` | High |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 260 | `bg-blue-500/10 text-blue-600 dark:text-blue-400` | `bg-info/10 text-info` | High |

### 1.6 Hex Colors in Donut Chart & Preferences

| File | Line | Current | Replace With | Severity |
|------|------|---------|--------------|----------|
| `src/components/charts/donut-chart.tsx` | 10-19 | `#6366f1`, `#10b981`, `#f59e0b`, etc. | Use CSS variables via `var(--chart-1)` through `var(--chart-5)` + computed colors | High |
| `src/stores/preferences-store.ts` | 34 | `#6366f1` | (default custom accent — intentional) | Low |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 567 | `#6366f1` | (custom color preview — intentional) | Low |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 577 | `#6366f1` | (color input default — intentional) | Low |

### 1.7 Login Page — Hardcoded Colors

| File | Line | Current | Severity |
|------|------|---------|----------|
| `src/app/(auth)/login/page.tsx` | 88 | `bg-card text-card-foreground shadow-lg shadow-foreground/10` | OK — semantic |
| `src/app/(auth)/login/page.tsx` | 110 | `border-hero-foreground/10 bg-hero-foreground/[0.07]` | OK — uses hero tokens |
| `src/app/(auth)/login/page.tsx` | 162 | `border-hero-foreground/10 bg-hero/95` | OK — uses hero tokens |
| `src/app/(auth)/login/page.tsx` | 311 | `bg-primary/5 blur-3xl dark:bg-primary/[0.08]` | OK — semantic with dark override |
| `src/app/(auth)/login/page.tsx` | 312 | `bg-accent/30 blur-3xl dark:bg-accent/10` | OK — semantic with dark override |
| `src/app/(auth)/login/page.tsx` | 317 | `bg-foreground text-background shadow-lg dark:bg-background dark:text-foreground` | High — dark: override needed, works but fragile |
| `src/app/(auth)/login/page.tsx` | 371 | `shadow-sm shadow-border/30` | Low — shadow using border color |
| `src/app/(auth)/login/page.tsx` | 401 | `shadow-sm shadow-border/30` | Low — shadow using border color |

---

## SECTION 2 — Light Mode Surfaces Check

### 2.1 Background
- Current: `--background: oklch(0.95 0.003 286.375)` — warm light gray
- **Verdict**: Slightly too dark for a clean SaaS background. Should be `oklch(0.97 0 0)` or similar for a brighter, more professional look.

### 2.2 Cards
- Current: `--card: oklch(1 0 0)` — pure white
- **Verdict**: OK. White cards on light gray background provides good contrast.

### 2.3 Glass Card
- Current: `background: var(--glass-bg)` where `--glass-bg: oklch(1 0 0 / 0.75)`
- **Verdict**: OK. Semi-transparent white with backdrop blur.

### 2.4 Glass Sidebar (Light Mode)
- Current: `background: oklch(1 0 0 / 0.85)` — hardcoded white with 85% opacity
- **Issue**: Should use semantic token instead of hardcoded OKLCH.
- **Severity**: Medium

### 2.5 Hero Section (Light Mode)
- Current: `--hero: oklch(0.09 0.04 265)` — very dark blue
- **Verdict**: This is intentionally dark as a hero backdrop. OK for accent contrast but creates a very dark section in light mode.

---

## SECTION 3 — Low Contrast Issues in Light Mode

### 3.1 Muted Text
- Current: `--muted-foreground: oklch(0.556 0 0)` — approx #8E8E8E
- **Verdict**: Contrast ratio ~4.5:1 against white card — borderline for WCAG AA for normal text. Acceptable for secondary/muted text.

### 3.2 Input Placeholder
- Uses `placeholder:text-muted-foreground` in inputs
- **Verdict**: Same as above — borderline but acceptable.

### 3.3 Status Badge Text
- `text-emerald-600` on white background — contrast is adequate
- `dark:text-emerald-400` on dark background — contrast is adequate

### 3.4 Light Mode Border
- Current: `--border: oklch(0.922 0 0)` — very light gray
- **Verdict**: May be too subtle in light mode. Consider `oklch(0.87 0 0)` for better definition.

### 3.5 Input Border
- Current: `--input: oklch(0.922 0 0)` — same as border
- **Verdict**: Acceptable but could be slightly more visible.

---

## SECTION 4 — Shadows in Light Mode

### 4.1 Glass Shadow
- Current: `0 1px 3px oklch(0 0 0 / 0.04), 0 1px 1px oklch(0 0 0 / 0.02)`
- **Verdict**: Very subtle — may be invisible in light mode. Consider `oklch(0 0 0 / 0.08)` and `oklch(0 0 0 / 0.04)`.

### 4.2 Card Shadows
- Cards use `shadow-sm` which in shadcn is very subtle
- Some components have `hover:shadow-md` 
- **Verdict**: OK for glass design, but elevated elements need more distinct shadows.

---

## SECTION 5 — Glassmorphism Issues

### 5.1 glass-sidebar Light Mode
```
background: oklch(1 0 0 / 0.85);
```
- Hardcoded white — should use a semantic variable like `var(--sidebar-glass-bg)`
- **Severity**: Medium

### 5.2 glass-sidebar Dark Mode
```
background: oklch(0.15 0.005 280 / 0.7);
```
- Hardcoded dark — should use a semantic variable
- **Severity**: Medium

---

## SECTION 6 — Invisible Border Issues

### 6.1 Light Mode Border
- `--border: oklch(0.922 0 0)` — #EBEBEB on `--background: oklch(0.95 0.003 286.375)` (#F2F2F0)
- **Difference**: Only ~7% luminance difference — very subtle, may disappear
- **Severity**: Medium

### 6.2 Glass Card Border
- `--glass-border: oklch(0 0 0 / 0.06)` — 6% black on white glass
- **Verdict**: Very faint — intended for glass design. OK for the aesthetic.

---

## SECTION 7 — Chart & Data Visualization Issues

### 7.1 Donut Chart — Hardcoded Colors
- 10 hardcoded hex colors with `dark:` overrides
- Should use `var(--chart-1)` through `var(--chart-5)` and cycle through accent-aware colors
- **Severity**: High

### 7.2 Report Chart Colors
- `orders-analytics-content.tsx` uses hardcoded status colors (amber, orange, gray)
- Should use semantic status tokens
- **Severity**: High

---

## SECTION 8 — Dark Mode Specific Issues

### 8.1 Dark Mode Background
- `--background: oklch(0 0 0)` — pure black
- **Verdict**: Pure black can cause eye strain with bright content. Consider `oklch(0.12 0 0)` for a more comfortable dark gray.

### 8.2 Dark Mode Border
- `--border: oklch(1 0 0 / 10%)` — 10% white
- **Verdict**: Very subtle on pure black. Acceptable for the glass aesthetic.

---

## SECTION 9 — Summary of Required Fixes

### Critical (7)
1. `text-white` → `text-primary-foreground` in button.tsx (2 occurrences)
2. `text-white` → `text-primary-foreground` in sidebar.tsx
3. `text-white` → `text-primary-foreground` in settings page icon buttons
4. Hardcoded status colors → semantic tokens (order-preview, quotation-preview)
5. Donut chart hex colors → CSS variable-based colors
6. Reports order analytics hardcoded status colors → semantic tokens
7. Keyboard shortcuts dialog `bg-black/40` → `bg-background/80`

### High (12)
1. `text-white` → `text-primary-foreground` in various remaining locations
2. `bg-white/20` → `bg-background/20` in settings page
3. Hardcoded emerald/amber/blue status colors → `text-success`, `text-warning`, `text-info`
4. Login page foreground/background inversion → use proper semantic tokens
5. Donut chart needs complete retheme
6. `glass-sidebar` hardcoded OKLCH → use CSS variable
7. Reports orders analytics `bg-gray-400/15` → `bg-muted`
8. Light mode border `oklch(0.922 0 0)` → slightly darker for better visibility
9. Light mode background `oklch(0.95 0.003 286.375)` → brighter
10. Login page decorative blur circles use hardcoded dark: overrides
11. Couriers settings badge uses emerald/amber directly
12. Settings page badge variant uses emerald/amber/blue directly

### Medium (8)
1. Sheet/dialog backdrops `bg-black/` → `bg-foreground/`
2. Glass sidebar hardcoded colors
3. `text-white` in dispatch-dialog, shipment-status-panel, courier-settings
4. Image overlay hover states in settings page
5. Image crop dialog `bg-black/5` → `bg-muted`
6. Shadow visibility in light mode
7. Border contrast in light mode
8. `settings-section.tsx` ring color for border

### Low (5)
1. Brand social media icons (intentional brand colors)
2. Custom accent color defaults (intentional)
3. Login page decorative shadows
4. Avatar ring mix-blend-mode modes
5. Dark mode pure black background (design choice)

---

## SECTION 10 — Files Requiring Changes

### UI Components (7 files)
1. `src/components/ui/button.tsx` — text-white → text-primary-foreground
2. `src/components/ui/badge.tsx` — verify dark: overrides
3. `src/components/ui/dialog.tsx` — bg-black/10 → overlay token
4. `src/components/ui/sheet.tsx` — bg-black/15 → overlay token
5. `src/components/ui/avatar.tsx` — after:mix-blend-mode
6. `src/components/ui/tabs.tsx` — verify dark: overrides
7. `src/components/ui/switch.tsx` — verify dark: overrides

### Layout Components (3 files)
1. `src/components/layout/sidebar.tsx` — text-white, shadow classes
2. `src/components/layout/bottom-nav.tsx` — shadow verification
3. `src/components/layout/dashboard-layout.tsx` — header backdrop verification

### Shared Components (4 files)
1. `src/components/shared/theme-toggle.tsx` — uses dark:✔
2. `src/components/shared/settings-section.tsx` — ring-1 ring-border/30
3. `src/components/shared/keyboard-shortcuts-dialog.tsx` — bg-black/40
4. `src/components/shared/image-crop-dialog.tsx` — bg-black/5

### Dashboard Components (3 files)
1. `src/components/dashboard/hero-stat-card.tsx` — ring-offset-hero
2. `src/components/dashboard/stats-card.tsx` — ring-1 ring-inset
3. `src/components/dashboard/onboarding-empty.tsx` — gradient check

### Feature Components (10 files)
1. `src/components/orders/order-preview.tsx` — emerald/amber/blue status colors
2. `src/components/orders/dispatch-dialog.tsx` — text-white
3. `src/components/orders/shipment-status-panel.tsx` — text-white
4. `src/components/quotations/quotation-preview.tsx` — emerald status color
5. `src/components/delivery/courier-settings.tsx` — emerald badge, text-white
6. `src/components/charts/donut-chart.tsx` — 10 hardcoded hex colors
7. `src/components/reports/orders-analytics-content.tsx` — gray/amber status colors
8. `src/components/inventory/stock-form.tsx` — success/destructive colors

### Pages (7 files)
1. `src/app/(auth)/login/page.tsx` — dark: overrides, shadow colors
2. `src/app/(dashboard)/dashboard/settings/page.tsx` — text-white, emerald/amber/blue
3. `src/app/(dashboard)/dashboard/orders/page.tsx` — shadow-sm on cards
4. `src/app/(dashboard)/dashboard/inventory/page.tsx` — status colors
5. `src/app/(dashboard)/dashboard/expenses/page.tsx` — shadow-sm
6. `src/app/(dashboard)/dashboard/products/page.tsx` — shadow-sm
7. `src/app/(dashboard)/dashboard/quotations/page.tsx` — shadow-sm

### CSS (1 file)
1. `src/app/globals.css` — glass-sidebar hardcoded, light mode background brightness

---

## SECTION 11 — Implementation Order

Based on the audit, the recommended fix order is:

1. **globals.css** — Fix light mode background brightness, border contrast, glass-sidebar tokens, add missing overlay/badge tokens
2. **UI Components** — button.tsx (text-white), dialog/sheet backdrops, badge component
3. **Layout** — sidebar text-white, glass-sidebar, bottom-nav, dashboard-layout header
4. **Shared Components** — keyboard-shortcuts-dialog backdrop, settings-section ring
5. **Charts** — donut-chart colors, report status colors
6. **Feature Components** — order-preview, quotation-preview, courier-settings status colors
7. **Dashboard** — hero-stat-card, stats-card
8. **Pages** — settings page text-white, login page
9. **Status Colors** — Fix remaining emerald/amber/blue → success/warning/info across all files
10. **Verification** — Build, test both themes, document remaining issues
