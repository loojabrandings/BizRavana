# BizRavana Card & Table Surface Consistency Audit

**Audit date:** 2026-07-27  
**Scope:** All user-facing routes under `src/app`, shared layouts, cards, tables, responsive record cards, dialogs, and supporting components under `src/components`  
**Change policy:** Audit only. No UI or application code was changed.

## Executive summary

BizRavana does not currently have one clear surface system for cards and tables. Components that perform the same visual role use different combinations of:

- `bg-card`
- `bg-background`
- `bg-muted/*`
- `bg-[var(--glass-bg)]`
- transparent backgrounds
- hard-coded black, white, or custom gradient backgrounds
- `border`, `ring`, or no visible boundary
- `rounded-xl` or `rounded-2xl`
- no shadow, `shadow-sm`, or stronger custom shadows

This inconsistency is most visible in dark mode. The global dark theme sets both `--background` and `--card` to black, so cards cannot be distinguished by fill alone. Their separation depends on borders, rings, shadows, and inner muted areas—but those treatments vary significantly between pages.

## Audit inventory

The audited source contains:

- 45 page route files.
- 192 TSX files in the application/component scope.
- 124 `bg-card` occurrences, including 28 opacity-modified forms.
- 95 `bg-background` occurrences, including 21 opacity-modified forms.
- 471 `bg-muted` occurrences, including 339 opacity-modified forms.
- 16 `bg-popover` occurrences.
- 53 backdrop-blur occurrences.
- 482 `border-border` occurrences, including 441 opacity-modified forms.
- 110 `shadow-sm` occurrences and 32 `shadow-lg` occurrences.
- 401 `rounded-xl` occurrences and 172 `rounded-2xl` occurrences.
- 22 shared `<Card>` references.
- 62 shared table-component references.
- 8 raw HTML `<table>` implementations.

These are source occurrences, not unique rendered components. They show the size and fragmentation of the current visual vocabulary.

## Overall verdict

**Status: A canonical glassmorphism surface system is required.**

### Confirmed design direction

BizRavana will keep glassmorphism as the primary visual language for dashboard and admin backgrounds. The goal is therefore not to remove transparency or blur. The goal is to replace arbitrary glass, solid, and muted combinations with a controlled glass hierarchy that remains readable in both themes.

The UI currently has several competing design languages:

1. Shared `Card`: `rounded-xl`, `bg-card`, `ring-foreground/10`, no default shadow.
2. Shared dashboard `DataTable`: `rounded-2xl`, glass background, `border-border/50`, blur.
3. Admin responsive table: `rounded-2xl`, solid `bg-card`, `border-border/40`.
4. Admin mobile record card: `rounded-2xl`, `bg-card`, `border-border/30`, `shadow-sm`.
5. Page-specific cards: arbitrary `bg-card`, `bg-background`, `bg-muted/5–50`, gradients, border opacities, and shadows.
6. Raw import/preview tables: page-specific sticky headers and row colors.

Each approach can work independently, but mixing them on adjacent screens makes the product feel assembled from different systems.

## Severity scale

- **P0 — Critical:** Content hierarchy or usability is lost.
- **P1 — High:** Repeated inconsistency across normal workflows.
- **P2 — Medium:** Local mismatch that reduces polish or clarity.
- **P3 — Low:** Cosmetic difference with limited impact.

## Highest-priority findings

### P0 — Dark-mode cards and page background share the same fill

In the dark theme:

- `--background: oklch(0 0 0)`
- `--card: oklch(0 0 0)`
- `--muted: oklch(0 0 0)`

Three important surface tokens collapse to the same black fill. A card is therefore visible only when a border, ring, shadow, gradient, or tinted child is added.

Because the project uses border opacity values ranging from `/10` to `/80`, some cards appear clearly separated while others visually disappear into the page.

**Recommendation:** Keep the dark page background and decorative blobs/gradients, then define progressively stronger glass fills for base cards, inset areas, and elevated overlays. Borders and shadows should support that hierarchy rather than create it alone.

### P1 — Shared Card and hand-built cards disagree

The shared `Card` component uses:

- `rounded-xl`
- `bg-card`
- `ring-1 ring-foreground/10`
- internal spacing controlled by `--card-spacing`

Many page-specific cards use:

- `rounded-2xl`
- `border border-border/20–80`
- optional `shadow-sm`
- manual padding
- sometimes `bg-background` or `bg-muted/*`

This creates visible differences in corner radius, edge color, padding, and depth between cards that should be peers.

**Recommendation:** Define canonical card levels and implement them through one reusable component or variants.

### P1 — There are multiple unrelated table shells

Current table systems include:

- Shared `DataTable`: glass background with blur and `/50` border.
- Admin responsive table: solid card background with `/40` border.
- Base UI table: no surface wrapper of its own.
- Raw order/product import tables: sticky `bg-muted/80` headers.
- Order/quotation previews: `bg-muted/20` header rows.
- Report tables: `bg-muted/30` header rows.

The same table concept therefore has different surface opacity, header contrast, border strength, radius, and blur depending on the route.

**Recommendation:** Establish one desktop table shell, one mobile record-card shell, and one document-preview table style.

### P1 — Glass surfaces are not used consistently

The dashboard `DataTable` uses:

```text
bg-[var(--glass-bg)] + backdrop-blur-xl + border-border/50
```

The admin table uses:

```text
bg-card + border-border/40
```

Other cards use `glass-card`, `bg-card/90`, or `bg-background/95`. This means “glass” is both a table style and a general elevated-surface style without a clear rule.

In light mode, `--glass-bg` is only 25% white. The final visual result depends heavily on the background behind it. In dark mode it is 25% black, which can collapse into the black page.

**Recommendation:** Make glass the standard material for dashboard/admin cards and tables, but expose only three calibrated levels: Glass Base, Glass Inset, and Glass Elevated. Each level must have fixed light/dark opacity, blur, border, and shadow values.

### P1 — Border opacity has no semantic scale

The project uses `border-border/10`, `/20`, `/30`, `/40`, `/50`, `/60`, `/80`, and solid `border-border`.

These values are applied across:

- Main cards.
- Nested cards.
- Tables.
- Mobile record cards.
- Separators.
- Empty states.
- Selection bars.
- Dialog content blocks.

The same opacity can represent a container boundary in one place and a subtle separator in another.

**Recommendation:** Use three named boundary levels:

- Subtle divider.
- Standard card/table boundary.
- Strong/interactive boundary.

Avoid arbitrary opacity selection at page level.

### P1 — Nested surfaces sometimes reverse hierarchy

Several pages place `bg-background` panels inside `bg-card`, while others place `bg-card` panels inside `bg-background`. Settings and payment-related screens also use very faint `bg-muted/5` sections inside solid cards.

Without a fixed elevation model, an inner panel can appear stronger than its parent in light mode and disappear in dark mode.

**Recommendation:** Define parent-to-child rules:

- Page → card.
- Card → inset section.
- Card → interactive row.
- Card → elevated popover/dialog.

An inset section should never look more elevated than its parent.

### P1 — Mobile cards do not always match their desktop table

The admin responsive table uses:

- Desktop: `bg-card`, `/40` border, no default shadow.
- Mobile: `bg-card`, `/30` border, `shadow-sm`.

The dashboard data table uses a glass desktop wrapper, while its mobile record cards use solid `bg-card`, `/80` borders, and `shadow-sm`.

The same dataset therefore changes visual material and depth at the responsive breakpoint.

**Recommendation:** Desktop table and mobile card views should share the same surface token, boundary strength, and elevation family.

### P2 — Corner radii are inconsistent

The shared card is `rounded-xl`; table wrappers and many mobile cards are `rounded-2xl`. Nested blocks may also use `rounded-xl`, while controls use 10px or `rounded-lg`.

This is especially noticeable when a `rounded-2xl` table sits next to a shared `rounded-xl` card.

**Recommendation:** Use:

- 12px for cards and tables.
- 10px for controls and inset sections.
- 16px only for hero/marketing or large modal surfaces.

### P2 — Shadow usage does not match elevation

Some flat content cards use `shadow-sm`; some floating/glass surfaces have no shadow; mobile table cards may have shadows when desktop equivalents do not.

Dark-mode shadows are inherently less visible on black, so they cannot replace a boundary or surface-color change.

**Recommendation:** Apply shadow by elevation role, not by page preference.

## Page-by-page audit

### Public and landing routes

| Route | Risk | Findings |
|---|---:|---|
| `/` | Low | Entry route has no significant card/table surface of its own. |
| `/landing` | Medium | Marketing cards intentionally use gradients, glass, black/white, and custom visual treatments; these should remain isolated from application card tokens. |
| `/about` | Medium | Mostly solid cards, but custom background treatments do not follow the shared Card shell. |
| `/features` | Medium | Feature surfaces mix solid cards and custom marketing backgrounds. |
| `/contact` | Medium–High | Multiple `bg-card` panels plus custom hard-coded surfaces create stronger variation than other public pages. |
| `/privacy-policy` | Low–Medium | Long-form content cards are mostly solid and stable. |
| `/refund-policy` | Low–Medium | Similar to policy pages; custom background details should remain within the public-page family. |
| `/terms` | Low–Medium | Similar to policy pages; generally consistent within its own page. |

**Public-site rule:** Marketing surfaces may be expressive, but application surface utilities should not be imported into them accidentally, and marketing gradients/glass should not leak into dashboard/admin tables.

### Authentication routes

| Route | Risk | Findings |
|---|---:|---|
| `/login` | Medium | Form card, side content, and decorative panels use a mixture of card/background/muted surfaces. |
| `/register` | High | Highest card concentration in auth; several nested surfaces use different fills and radii. |
| `/forgot-password` | Medium | Main form card is understandable but nested informational surfaces vary. |
| `/reset-password` | Medium | Similar structure to other auth routes but surface treatment is independently composed. |
| Auth callback routes | N/A | Transitional routes; not meaningful card/table surfaces. |

**Auth rule:** Login, register, forgot-password, and reset-password should use the exact same auth-card shell and inset-message style.

### Dashboard routes

| Route | Risk | Findings |
|---|---:|---|
| `/dashboard` | High | Hero cards, stats, chart/status cards, ad banner, and lower content panels use multiple custom surface treatments. |
| `/dashboard/orders` | High | Shared table shell, mobile cards, filters, dialogs, preview surfaces, and action panels do not all share one elevation model. |
| `/dashboard/expenses` | High | Card filters and data table combine `bg-card`, `bg-background`, and shared table glass. |
| `/dashboard/quotations` | High | Main page plus quotation preview/document table introduce different header and row backgrounds. |
| `/dashboard/products` | High | Page cards, bulk import table, forms, and shared table create several competing shells. |
| `/dashboard/inventory` | High | Main list plus stock preview tables/cards mix background and inset conventions. |
| `/dashboard/reports` | Medium | Route shell is light, but linked analytics surfaces define their own card system. |
| `/dashboard/reports/orders` | High | Report section cards plus solid report table header conflict with glass data-table language elsewhere. |
| `/dashboard/reports/expenses` | High | Chart and metric surfaces contain several muted/background inset levels. |
| `/dashboard/reports/financial` | High | Large concentration of custom cards and a report-specific table shell. |
| `/dashboard/subscription` | High | Pricing cards, usage cards, selected-plan emphasis, and nested feature areas use many `bg-muted/*` variants. |
| `/dashboard/subscription/payment` | High | Payment client has multiple `bg-background`, `bg-muted/*`, and card-like sections without one clear parent/inset relationship. |
| `/dashboard/settings` | Critical | Largest route-level surface fragmentation: many muted fills, hard-coded backgrounds, previews, settings cards, and embedded feature components. |
| Settings wrapper routes | Inherited | Their consistency is controlled by the main settings implementation. |

### Admin routes

| Route | Risk | Findings |
|---|---:|---|
| `/admin` | Medium–High | Summary cards are individually composed and only partly match table/list pages. |
| `/admin/businesses` | High | Desktop table uses admin table shell; mobile cards add a different shadow/border treatment. |
| `/admin/businesses/[id]` | High | Summary, subscription, payment, usage, warning, and destructive sections use many muted levels. |
| `/admin/payments` | High | Metric cards, table, receipt preview, and review dialog use different card shells. |
| `/admin/subscriptions` | High | Metric cards, table, extend-plan dialog, and inset details use inconsistent surface strengths. |
| `/admin/trials` | High | Table/mobile cards follow admin patterns but still diverge between breakpoints. |
| `/admin/plans` | High | Plan management cards and admin table use separate radius/background rules. |
| `/admin/notifications` | Critical | Large number of preview, composer, rule, history, audience, and table surfaces with many muted levels. |
| `/admin/storage` | High | Metric cards, bucket cards, and table shell use different card strengths. |
| `/admin/cleanup` | High | Warning surfaces, summary cards, table, and actions use a broad range of border/background opacities. |
| `/admin/activity-log` | High | Stats, table, detail dialog, and raw JSON block use several unrelated surface levels. |
| `/admin/ads` | High | Form card, preview card, targeting sections, and dashboard-style ad preview intentionally differ but need clear preview isolation. |
| `/admin/bug-reports` | Medium–High | Report list and detail content are readable, but table/card hierarchy is not fully aligned with other admin pages. |
| `/admin/profile` | Medium | Limited number of surfaces; still does not use a clearly shared admin settings-card variant. |
| `/admin/settings` | High | Several independently composed setting cards and muted subsections. |

### Prototype

| Route | Risk | Findings |
|---|---:|---|
| `/prototype` | Reference | Includes live Glass Base, Glass Inset, Glass Elevated, semantic glass, and canonical glass-table previews for light/dark comparison. |

## Shared component audit

### `src/components/ui/card.tsx`

Strengths:

- Central spacing behavior.
- Stable `bg-card` token.
- Consistent content slots.

Inconsistencies:

- Uses `ring` while most hand-built cards use `border`.
- Uses `rounded-xl` while many page/table shells use `rounded-2xl`.
- Footer defaults to `bg-muted/50`, which may be visually stronger than other inset sections.
- No explicit elevation variant.

### `src/components/ui/table.tsx`

Strengths:

- Consistent cell primitives.
- Neutral base that can support multiple contexts.

Inconsistencies:

- Does not define a table surface or header fill.
- Default row hover uses `bg-muted/50`, while report and data-table implementations override it to `/20` or other values.
- Table shell decisions are repeated elsewhere.

### `src/components/shared/data-table.tsx`

Strengths:

- Unified selection, pagination, loading, desktop, and mobile behavior.

Inconsistencies:

- Desktop table is glass.
- Mobile cards are solid with stronger borders and shadows.
- Loading and error states use different surface shells.
- Header uses `bg-muted/30`.

### `src/components/admin/responsive-table.tsx`

Strengths:

- Reusable desktop/mobile admin behavior.
- More stable solid background than the dashboard glass table.

Inconsistencies:

- Desktop and mobile elevation differ.
- Uses a different shell from dashboard `DataTable`.
- Empty state outside the desktop shell can lose the same boundary context on mobile.

### Raw tables

Bulk import, document preview, and report tables use custom header fills:

- `bg-muted/80` with blur for import tables.
- `bg-muted/20` for order/quotation previews.
- `bg-muted/30` for report tables.

These contexts do need variants, but they should be named variants instead of unrelated page-level values.

## Recommended canonical glassmorphism surface system

### Surface levels

| Level | Intended use | Recommended treatment |
|---|---|---|
| Page | Main canvas | `bg-background` plus restrained blobs/gradient so transparency has visible depth |
| Glass Base | Standard cards and data tables | Calibrated translucent fill, 12–16px blur, standard glass border, subtle glass shadow |
| Glass Inset | Group within a glass card and table header | Lower-elevation translucent/tinted fill, 6–10px blur or no extra blur, subtle divider |
| Interactive row | Clickable list/table row | Transparent default; one canonical hover/selected fill |
| Glass Elevated | Dialog, popover, dropdown, floating menu | More opaque glass fill, 20–24px blur, stronger boundary and shadow |
| Marketing Glass | Landing/hero only | More expressive gradients and glow, while remaining separate from application glass |

### Card variants

Recommended variants:

- `glass-base`: normal dashboard/admin content.
- `glass-inset`: secondary group inside a card.
- `glass-interactive`: clickable glass card with hover/focus states.
- `glass-elevated`: floating or emphasized content.
- `glass-status`: semantic success/warning/danger/info tint over the glass material.

Avoid separate card implementations for simple padding, border-opacity, or radius differences.

### Table variants

Recommended variants:

- `application`: normal dashboard/admin data table.
- `compact`: dense admin data with the same shell and reduced row height.
- `document`: invoice/order/quotation preview.
- `import`: editable spreadsheet-like validation table.

All table variants should explicitly define:

- Container background.
- Border strength.
- Radius.
- Header fill.
- Row divider.
- Hover.
- Selected state.
- Empty/loading state.
- Mobile-card equivalent.

## Proposed visual contract

### Standard application card

- Glass Base fill and blur.
- One standard glass boundary color.
- 12px radius.
- One subtle shared glass shadow.
- 16–24px internal padding depending on size.

### Standard data table

- Same Glass Base material and boundary as the standard card.
- 12px outer radius.
- Glass Inset header fill.
- Subtle row separators.
- One hover color and one selected color.
- One fixed backdrop blur inherited from the table shell.

### Mobile record card

- Same Glass Base fill, blur, boundary, and shadow family as its desktop table.
- No extra shadow unless desktop table is also elevated.
- Same selected/status semantics.

### Inset section

- Dedicated Glass Inset background, not arbitrary `/5`, `/10`, `/20`, or `/30`.
- 10px radius.
- No independent shadow.
- Boundary only when required.

## Canonical glass levels

| Level | Blur | Opacity direction | Border | Shadow |
|---|---:|---|---|---|
| Glass Base | 12–16px | Medium translucency | Standard glass border | Subtle |
| Glass Inset | 6–10px or inherited | Slightly quieter/tinted than parent | Divider or very subtle border | None |
| Glass Elevated | 20–24px | More opaque for readability | Stronger glass border | Medium/strong |

Exact colors must be separate for light and dark themes. The levels should be implemented as shared tokens/utilities rather than repeated Tailwind opacity values.

Glass surfaces require something visible behind them. Dashboard/admin page backgrounds should retain restrained blobs or gradients. A transparent black card over a plain black page will not produce a meaningful glass effect.

## Recommended remediation order

### Phase 1 — Define the surface tokens

1. Separate dark page, card, inset, and popover fills.
2. Define Glass Base, Glass Inset, and Glass Elevated tokens for both themes.
3. Define standard/subtle/strong glass boundary tokens.
4. Define one radius scale for controls, cards/tables, and large overlays.
5. Define base and elevated glass shadow roles.
6. Keep restrained page blobs/gradients behind application glass.

### Phase 2 — Normalize shared foundations

1. Add glass variants to the shared Card component.
2. Create a canonical glass table shell.
3. Align dashboard `DataTable` and admin responsive table.
4. Align desktop tables and mobile record cards.
5. Normalize empty, loading, error, and selection states.

### Phase 3 — Fix highest-impact routes

1. Dashboard Settings.
2. Admin Notifications.
3. Dashboard home.
4. Orders, products, inventory, and quotations.
5. Subscription and payment.
6. Admin payments, subscriptions, businesses, storage, cleanup, and activity log.
7. Report surfaces.

### Phase 4 — Isolate special contexts

1. Keep expressive marketing glass separate from controlled application glass.
2. Create named document-preview and import-table variants.
3. Keep ad preview visually framed as a preview rather than a normal admin card.
4. Standardize auth cards across all auth routes.

### Phase 5 — Visual verification

Review at:

- 360px mobile.
- 768px tablet.
- 1366px laptop.
- 1920px desktop.
- Light mode.
- Dark mode.

Verify:

- Parent card versus nested inset hierarchy.
- Adjacent card boundary strength.
- Table header and row differentiation.
- Hover, selected, loading, empty, error, and disabled states.
- Desktop table versus mobile card parity.
- Long content, horizontal scrolling, and sticky headers.

## Acceptance criteria

The surface cleanup is complete when:

- One Glass Base dashboard/admin card looks the same on every route.
- One standard glass table shell is shared by dashboard and admin unless a named variant is required.
- Desktop tables and mobile record cards share the same material/elevation family.
- Dark-mode page, card, inset, and popover surfaces are visually distinguishable.
- `bg-background`, glass base, glass inset, and glass elevated have defined roles and are not interchangeable.
- Informative workflow cards use the calibrated Glass Base material by default.
- Border opacity is selected through named roles rather than arbitrary page-level values.
- Card/table radius is consistent.
- Loading, empty, error, and selection states remain inside the same surface shell.
- Marketing and document-preview exceptions are explicit variants.
- No page introduces a new hard-coded black/white/custom surface without a documented special-purpose reason.

## Conclusion

The user's observation is correct. The project has broad card and table background consistency issues, especially in dark mode and at responsive table breakpoints. The selected direction is controlled glassmorphism—not flat solid cards. The safest approach is to establish canonical Page, Glass Base, Glass Inset, Glass Elevated, and glass-table roles first, normalize the shared components second, and only then migrate individual pages.
