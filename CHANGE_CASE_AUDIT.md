# BizRavana — Change Case (Text Transform) Audit

**Audit date:** 2026-08-02
**Scope:** All of `src/**/*.tsx`, `src/**/*.ts`, `src/app/globals.css`
**Change policy:** Read-only. No files, styles, or behavior were changed.

---

## Executive summary

BizRavana has **no single definition of where uppercase, title-case, or sentence-case should be applied**. Case decisions are made per-file, per-element, and sometimes twice in the same element. The three text-transform mechanisms are used inconsistently:

| Mechanism | Occurrences | Files |
|---|---:|---:|
| `uppercase` class | **221** | 62 |
| `capitalize` class | **14** | 9 |
| `lowercase` / `normal-case` class | **0** | — |
| `text-transform` in CSS | **1** (`sidebar-section-label` utility) | 1 |
| `.toUpperCase()` / `.toLocaleUpperCase()` in JS | **22** | ~8 |
| `formatEnumLabel()` (title-casing helper) | many | ~6 |
| Hardcoded ALL-CAPS JSX strings | **2** (`FALSE` / `TRUE` data options) | 1 |

The good news: the project **already has the right raw materials** — a central title-casing helper (`formatEnumLabel` in `src/lib/utils.ts`), a shared table primitive, and shared dropdown/command primitives. The problem is that these are used as a starting point and then overridden or bypassed per page.

The three most important structural findings:

1. **Three canonical table-header declarations live in `data-table.tsx`, but ~10 other places hand-roll their own header case/size/spacing** (some `text-xs`, some `text-sm`; some solid `muted-foreground`, some `/70`).
2. **Status values reach the UI in three different casings**: title case via `formatEnumLabel` (dashboard badges), `capitalize` CSS (admin badges), and **raw lowercase DB values** (order/quotation previews render `new_order`, `draft`, etc. verbatim).
3. **One element in global search applies both `formatEnumLabel` (Title Case) *and* `uppercase`** — a contradictory double transform that shows how ungoverned case decisions have become.

## Overall verdict

**Status: Needs a defined case system and tokenization before the UI can be considered typographically consistent.**

Uppercase is already used in the right places (table headers, form-section headings, dropdown group labels, eyebrows) but at inconsistent sizes, spacing, and colors — and it leaks into places where it should not (tiny 8–11px metadata, and on top of already-title-cased status text).

## Severity scale

- **P0 — Critical:** Content is unreadable or mis-cased in a way that looks broken.
- **P1 — High:** Repeated inconsistency affecting normal workflows.
- **P2 — Medium:** Legible but inconsistent or locally confusing.
- **P3 — Low:** Cosmetic consistency issue.

## Current-state map — what case lives where today

### Table headers — the dominant `uppercase` cluster

The canonical pattern (repeated 3× in `src/components/shared/data-table.tsx`, lines 105, 153, 674):

```text
text-sm font-semibold uppercase tracking-wider text-muted-foreground
```

The same header concept is re-declared differently elsewhere:

| Location | Size | Case | Color |
|---|---|---|---|
| `data-table.tsx` (shared) | `text-sm` (14px) | uppercase | solid muted |
| `admin/responsive-table.tsx` (shared) | own rules | uppercase | muted |
| `bulk-order-import-form.tsx` (10 headers) | `text-xs` (12px) | uppercase | solid muted |
| `bulk-import-form.tsx` (9 headers) | `text-xs` | uppercase | solid muted |
| `stock-preview.tsx` (4 headers) | `text-xs` | uppercase | solid muted |
| `quotation-preview.tsx` / `order-preview.tsx` | `text-xs` | uppercase | `muted-foreground/70` |
| `courier-finance-tab.tsx` | `text-xs` | uppercase | solid muted |
| `financial-performance-content.tsx` | `text-sm` | uppercase | solid muted |
| `invoice-document.tsx` / `quotation-document.tsx` | `text-xs` | uppercase | `text-white` (document, intentional) |

### Form-section headings — `uppercase` on `<h2>`/`<h3>`

37 headings use `uppercase`, with two competing recipes:

- **Recipe A** (product-form, stock-form, customer-details-section, order-items-section, order-management-section, payment-section):
  ```text
  text-sm font-semibold uppercase tracking-wider text-foreground/70
  ```
- **Recipe B** (stock-preview, stock-form "Insights", order-form-review-step, order-preview, quotation-preview, quotation-items-section):
  ```text
  text-xs font-semibold uppercase tracking-wider text-muted-foreground/70
  ```

Same visual role, two sizes and two colors.

### Eyebrow / kicker labels — sizes from 8px to 14px

The uppercase "eyebrow" pattern (`uppercase + tracking-* + semibold`) is used for section kickers, badges, and metadata, but **33 instances combine `uppercase` with 8–11px fonts** — the worst-case readability combo in this app. Worst offenders: `whatsapp-templates-settings.tsx` (`text-micro` 8px + `/30` opacity), `waybill-settings.tsx` (`text-nano` 9px), settings page (`text-[9px]` + `/25`), `global-search-popover.tsx` (`text-[9px]` badges), `shipment-status-panel.tsx` (`text-[11px]` + `/50`).

### Status badges — three competing conventions

| Context | Mechanism | Example result |
|---|---|---|
| Dashboard tables (`EditableStatusBadge`) | `formatEnumLabel(value)` | `Advance Paid`, `COD` |
| Admin tables (`payments`, `trials`, `subscriptions`, `storage`, `notifications`, `cleanup`, `activity-log`, `businesses/[id]`) | `capitalize` + `.replace("_"," ")` | `Paid`, `Bank Transfer` |
| Global search dialog/popover | `formatEnumLabel(value)` **+ `uppercase` class** | `NEW ORDER` (double transform) |
| Order/quotation previews (`SelectValue`) | **raw DB value** | `new_order`, `draft` |

Note that admin's `capitalize` path also bypasses `formatEnumLabel`'s special overrides, so `COD` would render as `Cod` and `walk_in` as `Walk In` (vs `Walk-in`).

### Elements that are case-neutral today (and should stay that way)

- **`ui/button.tsx`** — no uppercase anywhere. Button labels are sentence case in source.
- **`ui/tabs.tsx`** — no uppercase. Tab labels are Title/Sentence case in source.
- **`ui/badge.tsx`** — no uppercase. Badge content is caller-controlled.
- **Sidebar nav items** — Title Case in data (`Overview`, `Orders`, `Quick actions`). Section headers use the CSS utility `sidebar-section-label` (11px, uppercase, 0.12em, 55% opacity) — the project's *only* CSS-level text-transform.
- **Mobile bottom nav** — sentence case at 10px, no uppercase.

## Highest-priority findings

### P1 — No canonical "where" for table-header case

The `uppercase tracking-wider` header convention is correct and consistent in spirit, but it's re-typed in ~10 files with 3 sizes and 2 colors. **Where to set it:** centralize in the shared `TableHead` usage sites (`data-table.tsx` desktop + skeleton + empty-state) and `admin/responsive-table.tsx`, and stop letting raw tables re-declare it.

### P1 — Raw enum/status values render lowercase in previews

`order-preview.tsx` (lines 322–326, 409–414) and `quotation-preview.tsx` (lines 331–335, 395–400) render `{data.status}` directly — showing DB values like `new_order` and `draft` to users. **Where to set it:** `formatEnumLabel(data.status)` at every DB-value render site; ideally enforce via the shared status component.

### P1 — Contradictory double transform in global search

`global-search-dialog.tsx` (lines 610–611, 714–715) and `global-search-popover.tsx` (471, 543) wrap `formatEnumLabel` output in an `uppercase` class. Title-casing then uppercasing is contradictory and signals the case decision is not owned. **Where to set it:** decide one — either Title Case badges (recommended, matches tables) or uppercase badges; remove the other.

### P1 — Uppercase combined with 8–11px text (33 instances)

Detail in the "Eyebrow / kicker labels" section. This compounds the known typography problems from `TYPOGRAPHY_UI_AUDIT.md`. **Where to set it:** an eyebrow token that *mandates* ≥11px (preferably 12px), or remove uppercase from tiny text entirely (uppercase makes small type *harder* to read).

### P2 — Dropdown/command group labels use inconsistent tracking

`orders/page.tsx` uses `uppercase tracking-widest-alt` (0.16em, via the `--tracking-widest-alt` token); `command.tsx` and `context-menu.tsx` use `uppercase tracking-widest text-muted-foreground/60`; expenses page uses `tracking-widest-alt` too. Related but not identical. **Where to set it:** one `dropdown-group-label` token used by `DropdownMenuLabel`, `ContextMenu`, and `Command` group headings.

### P2 — Admin `capitalize` badges bypass `formatEnumLabel`

`formatEnumLabel` already exists with correct special-override behavior; the admin pages re-implement "capitalize" with CSS and `.replace()`. **Where to set it:** `formatEnumLabel` for all dynamic status rendering; keep `capitalize` only for *literal static text* (rarely needed).

### P2 — Form headings: `text-xs` vs `text-sm`, `/70` foreground vs muted

Two recipes (Recipe A / Recipe B above) are peers but render differently. **Where to set it:** one `form-section-heading` token (recommend `text-xs font-semibold uppercase tracking-wider text-muted-foreground` — matching Recipe B, which is already used by order/quotation previews).

### P2 — Uppercase letter-spacing scale is ad-hoc

`tracking-wider` (181), `tracking-widest` (41), `tracking-wide` (11), plus 9 hard-coded `tracking-[0.12em]`–`[0.16em]`. **Where to set it:** the theme already defines `--tracking-widest-alt: 0.16em`; expose `wide` / `wider` / `widest` tokens and ban raw `tracking-[…]` for uppercase labels.

### P3 — `sidebar-section-label` is the only CSS utility

It's well-scoped (11px, uppercase, 0.12em, 0.55 opacity) and used in exactly 2 places in `sidebar.tsx`. **Where to set it:** this is the right *pattern* for eyebrow labels — generalize it into a theme utility (`label-eyebrow`) instead of per-file class soup.

### P3 — `.toUpperCase()` usages are mostly legitimate

22 usages: avatar initials (settings page, admin layout, businesses/[id]) — all correct. No action needed.

### P3 — Hardcoded ALL-CAPS: only `FALSE`/`TRUE` import options

`bulk-import-form.tsx` lines 831–832 — these are Excel data values, not UI labels. No action needed.

## Where to set change cases — the canonical "where" map

The six anchor points that should own case decisions, plus the shared primitives that should stay neutral.

### Anchor 1 — `src/lib/utils.ts` → `formatEnumLabel()`

**Owns:** all dynamic enum/status/DB-value display casing (Title Case + acronym overrides). Already the best helper in the project. Rule: *every value that comes from a database column must pass through it (or an explicit display map) before rendering.*

### Anchor 2 — `src/components/shared/data-table.tsx` (3 sites)

**Owns:** the desktop table-header contract — `text-sm font-semibold uppercase tracking-wider text-muted-foreground` (lines 105, 153, 674). Every other table header (admin responsive table, raw import/preview tables) should copy this single source or be made a named variant.

### Anchor 3 — `src/components/shared/editable-status-badge.tsx`

**Owns:** status display + `formatEnumLabel`. Extend its reach: admin badges, global search badges, and preview status selects should all render through this same label logic (if not the component itself).

### Anchor 4 — `src/app/globals.css` → `sidebar-section-label` + new tokens

**Owns:** the one true CSS text-transform. Convert to a general `label-eyebrow` utility and add a `form-section-heading` utility so form headings, dropdown group labels, and table headers each have one definition instead of ~50 inline declarations.

### Anchor 5 — Shared primitives stay case-neutral

`button.tsx`, `tabs.tsx`, `badge.tsx`, `table.tsx` (the `TableHead` primitive) must **not** bake in `text-transform`. Case is a content-level decision; these primitives should only enforce size/weight/tracking when a caller opts into a named token. Current state already complies — keep it that way, and document it.

### Anchor 6 — Navigation

Sidebar section labels → `sidebar-section-label` utility (already correct). Nav items → Title Case in data (already correct). Mobile bottom nav → keep sentence case; do **not** uppercase at 10px.

## Recommended convention table ("how")

| Context | Recommended case | Mechanism | Size / weight |
|---|---|---|---|
| Page titles (`h1`) | Sentence case | source text | 20–24px semibold |
| Section/card titles (`h2`/`h3`) | Sentence case | source text | 16–18px semibold |
| Form-section headings | **UPPERCASE** | `form-section-heading` token | 12px semibold, tracking-wider, solid muted |
| Table headers | **UPPERCASE** | shared `data-table.tsx` | 13–14px semibold, tracking-wider, solid muted |
| Dropdown/command group labels | **UPPERCASE** | shared token | 12px semibold, tracking-widest |
| Eyebrow / kicker labels | **UPPERCASE** | `label-eyebrow` utility | ≥11px (target 12px), semibold |
| Dynamic status badges | Title Case | `formatEnumLabel()` | 12–14px semibold, semantic color |
| Buttons | Sentence case | source text | 14px medium |
| Tabs | Sentence case | source text | 14px medium |
| Input/label text | Sentence case | source text | 13–14px medium |
| Nav items | Title Case | source data | 13–14px |
| Sidebar section labels | **UPPERCASE** | `sidebar-section-label` | 11px, 0.12em, 55% |
| Document/PDF headers (`INVOICE`, `QUOTATION`) | **UPPERCASE** | intentional document style | keep as-is |
| Raw DB values | never render | always `formatEnumLabel` | — |
| Acronyms (COD, VAT, API, LKR…) | preserve | `formatEnumLabel` overrides | — |

## File-by-file hotspots (most `uppercase` per file)

| File | `uppercase` count | Notable issue |
|---|---:|---|
| `quotations/quotation-preview.tsx` | 12 | headers + labels at `text-xs`/`/70`; raw status in Select |
| `whatsapp/whatsapp-templates-settings.tsx` | 10 | 8–9px uppercase + `/30–/50` — worst combo in app |
| `orders/bulk-order-import-form.tsx` | 10 | hand-rolled header block |
| `products/bulk-import-form.tsx` | 9 | hand-rolled header block |
| `invoices/quotation-document.tsx` | 9 | document style (intentional) |
| `(dashboard)/settings/page.tsx` | 9 | 6 instances of 9–10px uppercase; `Live Preview` at 9px `/25` |
| `reports/financial-performance-content.tsx` | 8 | `From`/`To` field labels uppercase at `text-sm` |
| `invoices/invoice-document.tsx` | 8 | document style (intentional) |
| `(dashboard)/subscription/page.tsx` | 8 | 10–12px uppercase with `/50–/70` |
| `(dashboard)/orders/page.tsx` | 7 | dropdown labels at `tracking-widest-alt` (0.16em) |
| `reports/orders-analytics-content.tsx` | 7 | — |
| `products/product-form.tsx` / `inventory/stock-form.tsx` | 6 each | Recipe A headings |
| `orders/order-preview.tsx` / `inventory/stock-preview.tsx` | 6 each | Recipe B headings; raw status in Select |
| `prototype/page.tsx` | 6 | reference surfaces |

Admin `capitalize` files (9): `payments` (3), `cleanup` (2), `businesses/[id]` (2), `activity-log` (2), `trials`, `subscriptions`, `storage`, `notifications` (1 each) — all status-badge related.

## Recommended remediation order

### Phase 0 — Decide & document

Agree on the convention table above; keep this file as the living contract alongside the other audits.

### Phase 1 — Tokens

Add `label-eyebrow` and `form-section-heading` utilities in `globals.css`; reuse the existing `--tracking-widest-alt`; deprecate raw `tracking-[…]` on uppercase labels.

### Phase 2 — Shared components

Standardize the 3 `data-table.tsx` headers and the admin `responsive-table` header; unify `DropdownMenuLabel`/`ContextMenu`/`Command` group-label casing; extend `formatEnumLabel` coverage.

### Phase 3 — Status values

Route order/quotation preview status selects through `formatEnumLabel`; replace admin `capitalize` badges with `formatEnumLabel`; pick one case for global-search badges.

### Phase 4 — Page cleanup

Fix the 8–11px uppercase combos (settings, WhatsApp, waybill, shipment panel, global search); align form headings to one recipe; fix quotation-preview labels.

### Phase 5 — Verify

Grep-based checkpoints (below) must pass; review at 360px/768px/1366px/1920px in both themes.

## Verification checkpoints

```bash
# Contradictory double transforms (title-case + uppercase)
grep -rn "formatEnumLabel.*uppercase\|uppercase.*formatEnumLabel" src --include="*.tsx"

# Uppercase at unreadable sizes
grep -rn "uppercase" src --include="*.tsx" | grep -E "text-(micro|nano|xxs|\[9px\]|\[10px\]|\[11px\])"

# Raw DB values rendered directly
grep -rn "SelectValue>{data.status}\|{data.status}" src/components/orders src/components/quotations

# Hand-rolled header blocks duplicating data-table
grep -rn "uppercase tracking-wider" src --include="*.tsx" | grep -v "data-table"
```

## Acceptance criteria

The change-case cleanup is complete when:

- Table headers, form-section headings, dropdown group labels, and eyebrow labels each come from one named token.
- No meaningful uppercase text is below 11px (target 12px).
- No element applies both `formatEnumLabel` and `uppercase`.
- Every DB-derived status/enum value renders through `formatEnumLabel` (or an explicit display map).
- No raw `tracking-[…]` values remain on uppercase labels; the theme's wide/wider/widest tokens are used.
- Shared primitives (button, tabs, badge, TableHead) contain no text-transform.
- Buttons, tabs, titles, input labels, and nav items are consistently sentence/title case with no uppercase.

## Conclusion

The project's case system is *directionally right* — uppercase belongs on table headers, form-section headings, dropdown group labels, and eyebrows; Title Case belongs on status values; sentence case belongs on buttons, tabs, titles, and nav. What's missing is ownership: the same decision is re-made 221 times per-file instead of once per shared token. The cleanest path is the one the previous audits already recommend — **define tokens first, normalize the shared components second, then migrate pages** — with `formatEnumLabel` and the existing table primitive as the two anchors that already do the right thing.
