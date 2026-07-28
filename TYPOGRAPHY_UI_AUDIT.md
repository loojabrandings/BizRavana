# BizRavana Typography & Readability Audit

**Audit date:** 2026-07-27  
**Scope:** All user-facing routes under `src/app`, their layouts, and shared components under `src/components`  
**Change policy:** Audit only. No UI styles or application behavior were changed.

## Executive summary

BizRavana does not currently have a consistent, accessibility-safe typography system. The main body text is generally acceptable, but secondary text is frequently made both **too small** and **too faint** at the same time.

The audit found:

- 45 `page.tsx` route files and 192 TSX files in the audited application/component scope.
- 536 occurrences of `text-xs` (12px).
- 50 occurrences of explicit `text-[10px]`.
- 28 occurrences of explicit `text-[11px]`.
- 8 occurrences of explicit `text-[9px]`.
- Additional `text-xxs`, `text-nano`, and `text-micro` tokens resolve to 10px, 9px, and 8px.
- 165 occurrences of `text-muted-foreground/50`.
- 238 occurrences of `text-muted-foreground/60`.
- 181 occurrences of `text-muted-foreground/70`.

These are source declarations, not a count of unique rendered elements. Even so, their frequency proves that the readability issue is systemic rather than isolated.

## Overall verdict

**Status: Needs a typography normalization pass before the UI can be considered consistently readable.**

The biggest problem is this repeated combination:

```text
10–12px text + muted-foreground + 30–60% opacity
```

`--muted-foreground` is already a secondary color. Applying another opacity modifier produces compounded contrast loss. This is especially difficult to read on dark cards, glass surfaces, disabled-looking panels, and smaller laptop screens.

## Severity scale

- **P0 — Critical:** Important information or actions can become effectively unreadable.
- **P1 — High:** Repeated readability problem affecting normal workflows.
- **P2 — Medium:** Legible for many users, but inconsistent or unnecessarily difficult.
- **P3 — Low:** Cosmetic hierarchy or consistency issue.

## Highest-priority findings

### P0 — 8–10px text is used for meaningful information

The global theme defines:

- `text-micro`: 8px
- `text-nano`: 9px
- `text-xxs`: 10px

These sizes are used for labels, descriptions, warnings, counts, timestamps, dropdown actions, field hints, and navigation labels—not only decorative metadata.

Main hotspots:

- `src/components/whatsapp/whatsapp-templates-settings.tsx`
- `src/components/delivery/waybill-settings.tsx`
- `src/components/whatsapp/template-selection-dialog.tsx`
- `src/components/whatsapp/no-template-dialog.tsx`
- `src/app/(dashboard)/dashboard/settings/page.tsx`
- `src/components/shared/global-search-popover.tsx`
- `src/components/notifications/notification-popover.tsx`
- `src/app/admin/subscriptions/page.tsx`
- `src/app/admin/storage/page.tsx`
- `src/app/admin/activity-log/page.tsx`

Examples include:

- 8px labels such as status badges and timestamps.
- 9px field counters, preview labels, and search result badges.
- 10px owner information, pricing, table metadata, keyboard help, and mobile navigation labels.

**Recommendation:** Do not use text below 12px for meaningful UI content. Reserve 10–11px only for non-essential badges when space is genuinely constrained. Remove the 8px and 9px semantic tokens from normal application use.

### P0 — Muted text is repeatedly faded a second time

Common patterns include:

- `text-muted-foreground/20`
- `text-muted-foreground/25`
- `text-muted-foreground/30`
- `text-muted-foreground/35`
- `text-muted-foreground/40`
- `text-muted-foreground/50`
- `text-muted-foreground/60`

Because `muted-foreground` is already designed as secondary text, these modifiers can make content look disabled even when it is active and important.

Worst examples occur in:

- Settings previews and field hints.
- WhatsApp template editor labels, counters, actions, and empty states.
- Waybill IDs, batch controls, status descriptions, and delete actions.
- Search result metadata and recent-search controls.
- Notification timestamps and status tags.
- Admin table secondary rows and activity-log details.

**Recommendation:** Use solid `text-muted-foreground` for readable secondary text. Use opacity only for decorative icons, separators, or truly disabled content. Never use less than `/70` on informative text without verifying contrast against its final background.

### P1 — Typography hierarchy changes between dashboard and admin

There are separate page-header systems:

- Dashboard shared header uses a 20px title.
- Admin shared header uses an 18px title.
- Several pages implement their own headers and supporting text.

Dialog titles use 20px, while dense settings panels can use 10–12px section labels. The visual step between hierarchy levels is therefore inconsistent.

**Recommendation:** Define one hierarchy for both dashboard and admin:

- Page title: 24px desktop, 20px mobile.
- Section title: 18px.
- Card title: 16px.
- Body: 14px minimum for application UI.
- Secondary/help text: 13px minimum.
- Metadata/badges: 12px minimum.

### P1 — Settings is the largest route-level hotspot

`src/app/(dashboard)/dashboard/settings/page.tsx` contains approximately:

- 40 tiny-text declarations.
- 54 low-opacity text declarations.
- Multiple 9–11px labels and hints.

Examples include theme descriptions, business preview labels, contact fields, live-preview text, website labels, keyboard guidance, and popover hints.

The settings route also embeds several large feature areas, so typography drift inside this file affects Profile, Business, Preferences, Team, Delivery, Waybill, and WhatsApp workflows.

**Recommendation:** Treat Settings as a dedicated remediation phase, not a few local text-size edits.

### P1 — WhatsApp template UI is the most severe component hotspot

`src/components/whatsapp/whatsapp-templates-settings.tsx` has the largest concentration:

- Approximately 61 tiny-text declarations.
- Approximately 52 low-contrast declarations.

Meaningful information is rendered at 8–10px, including badges, character counts, placeholder labels, empty states, timestamps, dropdown menu items, warnings, and action buttons.

**Recommendation:** Rebuild its type hierarchy around 14px body, 13px supporting text, and 12px metadata. Dropdown actions should use the same typography as other project menus.

### P1 — Waybill management is overly compressed

`src/components/delivery/waybill-settings.tsx` contains approximately:

- 37 tiny-text declarations.
- 40 low-contrast declarations.

Several hints use 9–10px with `/30` to `/60` opacity. Important operational controls and identifiers should not share the visual treatment of decorative metadata.

**Recommendation:** Increase operational data and controls to at least 12–14px and use solid semantic colors for warnings/errors.

### P1 — Admin tables prioritize density over readability

Affected routes include:

- `/admin/payments`
- `/admin/subscriptions`
- `/admin/trials`
- `/admin/businesses`
- `/admin/businesses/[id]`
- `/admin/storage`
- `/admin/cleanup`
- `/admin/activity-log`
- `/admin/notifications`

Owner names, emails, prices, dates, times, counts, descriptions, and table sublabels often use 10–12px plus reduced opacity.

**Recommendation:** Table primary values should be 14px. Secondary values should be 12–13px at full muted color. Avoid 10px text for email addresses, payment information, dates, or subscription details.

### P1 — Mobile navigation text is too small

Dashboard and admin mobile navigation labels use 10px. A 10px label is difficult to scan and is more vulnerable to truncation, font rendering differences, and browser zoom.

Affected files:

- `src/components/layout/mobile-bottom-nav.tsx`
- `src/app/admin/layout.tsx`

**Recommendation:** Use at least 12px with medium weight. Keep labels short instead of shrinking the type.

## Page-by-page audit

### Public and landing routes

| Route | Risk | Finding |
|---|---:|---|
| `/` | Low | Entry route itself has no notable typography issue. |
| `/landing` | Medium | Main marketing copy is readable; mockups, badges, and small decorative labels reach 10–11px. |
| `/about` | Low | Body hierarchy is generally readable. |
| `/features` | Low | Mostly standard marketing typography. |
| `/contact` | Low–Medium | Form/supporting text uses small secondary styles but is less compressed than dashboard/admin. |
| `/privacy-policy` | Low–Medium | Long-form text is readable; footer metadata is faded. |
| `/refund-policy` | Low–Medium | Final/supporting text uses additional opacity. |
| `/terms` | Low–Medium | Final/supporting text uses additional opacity. |

Shared landing footer text uses 12px for legal/footer metadata. This is acceptable only if contrast remains solid.

### Authentication routes

| Route | Risk | Finding |
|---|---:|---|
| `/login` | Low | Core labels and inputs are readable. |
| `/register` | Medium | Several 12px supporting/error/helper elements create denser reading. |
| `/forgot-password` | Low | Standard form hierarchy. |
| `/reset-password` | Low | Standard form hierarchy. |
| `/auth/callback` | N/A | Transitional route, not a normal reading surface. |
| `/auth/callback/recovery` | N/A | Transitional route, not a normal reading surface. |

Shared input behavior changes from 16px on mobile to 14px at `md`, which is unusual. The desktop size is smaller than the mobile size and should be standardized.

### Dashboard routes

| Route | Risk | Finding |
|---|---:|---|
| `/dashboard` | Medium–High | Hero metric labels and badges use 10–12px with reduced opacity. |
| `/dashboard/orders` | High | Dense table metadata, image counts, menus, dialogs, previews, and dispatch/shipment panels use small text. |
| `/dashboard/expenses` | Medium | Main table is mostly readable; secondary table/filter text remains small. |
| `/dashboard/quotations` | Medium–High | Page plus quotation preview/form components contain extensive 12px text. |
| `/dashboard/products` | Medium | Main page is moderate; product forms and bulk import increase small helper text. |
| `/dashboard/inventory` | Medium | Page is moderate; stock previews and forms use dense secondary typography. |
| `/dashboard/reports` | Medium | Route shell is acceptable; linked report content is dense. |
| `/dashboard/reports/orders` | Medium | Analytics labels and chart metadata rely heavily on 12–14px. |
| `/dashboard/reports/expenses` | Medium | Analytics labels and chart metadata rely heavily on 12–14px. |
| `/dashboard/reports/financial` | Medium–High | Financial component contains multiple small labels and condensed supporting data. |
| `/dashboard/subscription` | High | Pricing, usage, plan metadata, and feature labels frequently use 12px with opacity. |
| `/dashboard/subscription/payment` | Medium | Route wrapper is clean; payment client contains several 12px details. |
| `/dashboard/settings` | Critical | Largest route-level combination of tiny and low-contrast text. |
| `/dashboard/settings/profile` | Inherited | Redirect/wrapper; readability is controlled by main Settings implementation. |
| `/dashboard/settings/preferences` | Inherited | Redirect/wrapper; readability is controlled by main Settings implementation. |

### Admin routes

| Route | Risk | Finding |
|---|---:|---|
| `/admin` | Medium | Summary cards are mostly readable; supporting labels are small. |
| `/admin/businesses` | High | Email, plan, status, empty-state, and mobile action text are small/faded. |
| `/admin/businesses/[id]` | High | Subscription details, dates, record metadata, and dialog descriptions are frequently 12px with opacity. |
| `/admin/payments` | High | Email, prices, review metadata, auto-verification text, and dates are compressed. |
| `/admin/subscriptions` | High | Owner details and monthly pricing include 10px faded text. |
| `/admin/trials` | High | Owner identity metadata includes 10px faded text. |
| `/admin/plans` | High | Feature labels, sort order, and plan metadata use 10–12px. |
| `/admin/notifications` | High | Large concentration of tiny and low-contrast preview, rule, recipient, and scheduling text. |
| `/admin/storage` | High | Bucket paths, status badges, sublabels, and technical data use 10px. |
| `/admin/cleanup` | High | Owner details, storage estimates, warnings, and table metadata are small/faded. |
| `/admin/activity-log` | High | Time, JSON, action details, and metadata use 10–12px with opacity. |
| `/admin/ads` | Medium | Form is generally readable; ad preview label is 9px. |
| `/admin/bug-reports` | Medium | Descriptions and URLs use 12px; still more readable than other admin tools. |
| `/admin/profile` | Medium | Several 12px metadata items; contrast is generally safer. |
| `/admin/settings` | Medium–High | Multiple helper and configuration labels use small/faded text. |

### Prototype

| Route | Risk | Finding |
|---|---:|---|
| `/prototype` | Medium | Button system is intentionally compact in a few metadata labels; it should not establish 10–12px faded text as the global body standard. |

## Shared components that spread the issue across pages

### High-impact shared components

- `src/components/shared/global-search-popover.tsx`
- `src/components/shared/global-search-dialog.tsx`
- `src/components/notifications/notification-popover.tsx`
- `src/components/layout/mobile-bottom-nav.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/admin/responsive-table.tsx`
- `src/components/admin/page-header.tsx`
- `src/components/shared/page-header.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/pagination.tsx`

### Shared-component inconsistencies

- Dashboard and admin page headers use different title sizes.
- Dialog descriptions globally add `/70` opacity to `muted-foreground`.
- Pagination uses `/30` and `/40` for disabled or separator states; some of these are still informative.
- Input text is 16px by default but 14px at desktop breakpoints.
- The button component is consistently 14px, but local raw buttons frequently override it to 10–12px.
- Table base text is 14px, but individual routes repeatedly override secondary rows to 10–12px.

## Contrast risks

### Safe direction

- Primary body text: `text-foreground`.
- Secondary text: solid `text-muted-foreground`.
- Disabled text: opacity reduction is acceptable when the state is unmistakably disabled.
- Decorative text/icons: opacity reduction is acceptable when no information is lost.

### Unsafe direction found in the project

- Muted text at `/20`–`/60` on black/dark cards.
- 10px labels combined with uppercase and wide letter spacing.
- Primary/status colors at `/40`–`/60` when the color is carrying meaning.
- Placeholder text reduced to `/30`.
- Hover-revealed actions whose default state is nearly invisible.
- Text embedded in translucent/glass backgrounds without a stable contrast guarantee.

All final colors should meet WCAG AA contrast:

- **4.5:1** for normal text.
- **3:1** only for large text (at least 24px regular or about 18.7px bold).
- **3:1** for meaningful icons and component boundaries.

Almost all text in this application is normal-size text, so the 4.5:1 target applies.

## Recommended canonical typography system

| Role | Desktop | Mobile | Weight | Color |
|---|---:|---:|---:|---|
| Display/marketing | 40–48px | 32–40px | 600–700 | Foreground |
| Page title | 24px | 20px | 600 | Foreground |
| Section title | 18px | 18px | 600 | Foreground |
| Card title | 16px | 16px | 600 | Foreground |
| Body | 14px | 14–16px | 400 | Foreground |
| Emphasized body | 14px | 14–16px | 500–600 | Foreground |
| Supporting/help | 13px | 13–14px | 400 | Solid muted foreground |
| Metadata/badge | 12px | 12px | 500–600 | Solid muted or semantic color |
| Form label | 13–14px | 14px | 500 | Foreground |
| Button | 14px | 14px | 500–600 | Variant foreground |
| Table header | 12–13px | 12–13px | 600 | Muted/foreground |
| Table cell | 14px | 14px | 400–500 | Foreground |

Recommended line heights:

- Titles: 1.2–1.3.
- Body and descriptions: 1.5–1.6.
- Labels and compact controls: 1.3–1.4.
- Avoid `leading-none` on readable labels unless the control has only one short line.

## Recommended remediation order

### Phase 1 — Establish tokens and guardrails

1. Define named roles such as page title, section title, body, supporting, metadata, label, and table cell.
2. Set 12px as the absolute minimum for meaningful application text.
3. Remove `micro` and `nano` from normal UI usage.
4. Prohibit opacity modifiers below `/70` on informative text.
5. Add a lint/search checklist for raw `text-[9px]`, `text-[10px]`, `text-micro`, `text-nano`, and low-opacity text.

### Phase 2 — Fix shared foundations

1. Unify dashboard/admin page headers.
2. Normalize dialog description, pagination, mobile navigation, table, input, label, dropdown, and tooltip typography.
3. Make shared secondary text solid `text-muted-foreground`.
4. Use the shared components instead of local raw typography overrides.

### Phase 3 — Fix critical workflows

1. Dashboard Settings.
2. WhatsApp templates and selection dialogs.
3. Waybill and courier settings.
4. Admin payments, subscriptions, trials, businesses, cleanup, storage, activity log, and notifications.
5. Orders, quotations, and report analytics.

### Phase 4 — Visual and accessibility verification

Verify every surface at:

- 360px mobile.
- 768px tablet.
- 1366px laptop.
- 1920px desktop.
- Light mode.
- Dark mode.
- 100%, 125%, and 200% browser zoom.

Test active, hover, focus, disabled, error, empty, loading, and long-content states. Use automated contrast checks plus human inspection because translucent backgrounds and nested opacity can evade simple source-level checks.

## Acceptance criteria

The typography cleanup is complete when:

- No meaningful UI text is below 12px.
- Body and table content is normally at least 14px.
- Supporting text is at least 13px except compact metadata.
- No informative `muted-foreground` text uses opacity below `/70`.
- All text meets WCAG AA contrast in both themes.
- Dashboard and admin share the same hierarchy.
- Mobile navigation labels are at least 12px.
- Inputs, dropdowns, dialogs, menus, tables, and buttons use consistent typography.
- Long names, emails, Sinhala text, prices, and dates remain readable without clipping.
- 200% zoom does not hide information or actions.

## Conclusion

The user's observation is correct: the project contains many typography issues, particularly text that is simultaneously too small and too low-contrast. The best solution is a system-level typography pass followed by targeted cleanup of the highest-risk workflows. Fixing isolated pages without first establishing shared tokens and contrast rules would allow the inconsistency to return.
