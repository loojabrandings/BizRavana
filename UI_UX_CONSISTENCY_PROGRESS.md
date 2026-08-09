# UI/UX Consistency Migration Progress

Last updated: 2026-08-03

## Canonical rule

- `/prototype` is the UI source of truth for the production application.
- Production pages should be migrated toward the prototype language; the prototype should only change when a design-system change is explicitly requested.
- UI migrations must not change business logic, API behavior, database operations, or user workflows unless separately authorized.

## Status legend

- **Complete** — implementation and proportional verification completed.
- **Mostly complete** — foundation is in place, but project-wide exceptions or final QA remain.
- **Partial** — some related work exists, but the phase/module has not completed its acceptance criteria.
- **Pending** — not yet handled in the current migration pass.

## Phase status summary

| Phase | Status | Current checkpoint |
| --- | --- | --- |
| Phase 0 — Canonical UI decisions | Complete | `/prototype` confirmed as the master design reference. |
| Phase 1 — Design-system foundation | Mostly complete | Canonical buttons, typography direction, glass surfaces, semantic colors, and case rules are in place. Project-wide exceptions still need final scanning. |
| Phase 2 — Critical accessibility/readability | Mostly complete | Critical shared controls and several high-risk surfaces were improved. Full keyboard/touch verification remains for Phase 8. |
| Phase 3 — Shared UI infrastructure | Mostly complete | Shared buttons, cards, tables, headers, sidebars, and related infrastructure were normalized. Remaining caller-level overrides require final guardrail scanning. |
| Phase 4 — High-drift feature modules | In progress | WhatsApp Template Settings and Waybill Settings are complete. Dashboard Settings is next. |
| Phase 5 — Core workflow pages | Partial | Some shared components and workflow surfaces already benefit from earlier changes, but the ordered page migration is not complete. |
| Phase 6 — Admin, Auth, Public | Partial | Admin/shared navigation and selected auth accessibility work exist; full phase acceptance criteria remain. |
| Phase 7 — Copy, grammar, case | Partial | Previous audit documents and some centralized formatting exist; project-wide cleanup remains. |
| Phase 8 — Visual QA/regression | Partial | Type/lint checks and selected desktop/mobile visual checks were performed. The complete test matrix remains. |

## Completed work

### Phase 0 — Canonical decisions

- `/prototype` established as the production design target.
- Standard radius: 10px.
- Button size contract: 32px / 40px / 48px.
- Minimum meaningful text: 12px.
- Dashboard/Admin page-title direction: 20px.
- Glass hierarchy: Glass Inset, Glass Base, Glass Elevated.
- Desktop icon target and mobile 44px touch-target direction established.
- Existing prototype glass appearance was preserved after restoration; later prototype edits were limited to explicitly requested button-system changes.

### Phase 1–3 — Foundation and shared infrastructure

- Shared `Button` system aligned with the prototype, including semantic variants, loading support, links, radius, sizing, focus states, and shimmer behavior.
- Outline buttons use a transparent background.
- Semantic button variants use shimmer.
- Light-mode shimmer uses the theme primary color; dark-mode shimmer retains its prior appearance.
- Shared card/table/header patterns and major dashboard/admin navigation surfaces were aligned with the canonical system.
- Dashboard and Admin sidebars were aligned with the updated button language.
- Canonical glass and theme behavior was retained across light/dark modes.

### Phase 4.1 — WhatsApp Template Settings

Status: **Complete**

- Conventional actions migrated to the shared `Button` system.
- Context selectors and placeholder chips retained their correct custom interaction roles while receiving canonical visual/focus/touch treatment.
- Nested surfaces aligned to the prototype glass hierarchy.
- `text-micro`, `text-nano`, and `text-xxs` removed from the module.
- Faded informative text replaced with readable semantic text colors.
- Semantic warning colors, 10px controls, focus rings, and mobile touch targets normalized.
- Desktop and 390px mobile states visually checked.
- No template business logic, API behavior, or data flow was intentionally changed as part of this UI pass.

Primary file:

- `src/components/whatsapp/whatsapp-templates-settings.tsx`

### Phase 4.2 — Waybill Settings

Status: **Complete**

- Conventional provider CTA, search-clear action, and delete action migrated to shared `Button` controls.
- Manual/Auto method selectors and status-filter chips intentionally retained as custom selectable controls.
- Custom selectors received `aria-pressed`, visible keyboard focus, press feedback, and mobile touch sizing.
- Tiny typography and faded informative text removed from the module.
- Summary cards, list records, dialog previews, and helper surfaces aligned to Glass Inset styling.
- Search/add controls, status controls, labels, empty states, and dialog metadata normalized.
- A real 390px page-level horizontal-overflow issue caused by the provider CTA was found during browser QA and fixed.
- No waybill generation, status, deletion, provider, API, or database logic was intentionally changed as part of this UI pass.

Primary file:

- `src/components/delivery/waybill-settings.tsx`

Visual QA note: the current local data state has no selected courier provider. The no-provider state was checked on desktop and mobile. The provider-selected/manual-management branch was source-reviewed and must be included in the complete Phase 8 state matrix.

## Remaining work

### Phase 1–3 close-out

- Run project-wide scans for remaining meaningful text below 12px.
- Flag informative text using excessive opacity.
- Find remaining conventional raw buttons.
- Find caller-level button height, radius, and typography overrides.
- Confirm shared table/card/header callers no longer need local geometry overrides.

### Phase 4 — Remaining high-drift modules

Recommended resume order:

1. **Dashboard Settings** — next checkpoint.
2. Global Search.
3. Notification popovers and notification pages.
4. Subscription/payment flow.
5. Team Settings.
6. Courier management.

Each module still needs:

- Raw conventional actions migrated to shared controls.
- Tiny/faded informative text removed.
- Desktop/mobile markup and information hierarchy aligned.
- Nested surfaces mapped to the canonical glass hierarchy.
- Semantic colors, labels, helper text, errors, loading, empty, and disabled states normalized.
- Proportional type, lint, and visual verification.

### Phase 5 — Core workflow pages

Pending ordered migration:

1. Orders.
2. Products.
3. Inventory.
4. Expenses.
5. Quotations.
6. Reports.
7. Dashboard Home.
8. Subscription.

Required focus areas: headers, toolbar actions, filters, table shells, mobile record cards, status badges, previews, form action bars, responsive spacing, and loading/empty/error states.

### Phase 6 — Admin, Auth, and Public surfaces

- Complete Admin table/card/status/action normalization.
- Complete Auth form, password-control, validation, loading, and mobile-spacing checks.
- Verify public/marketing CTA levels, ButtonLink usage, reduced motion, theme parity, and documented exceptions.

### Phase 7 — Copy, grammar, and case cleanup

- Apply the findings in `CHANGE_CASE_AUDIT.md` and `SPELLING_GRAMMAR_AUDIT.md` project-wide.
- Normalize status/enum labels through centralized formatters.
- Remove customer-facing implementation terminology.
- Normalize table-header case and empty-state grammar.
- Remove remaining uppercase + tiny/faded text combinations.

### Phase 8 — Full visual QA and regression protection

Run the complete matrix:

- 375px mobile.
- 768px tablet.
- 1024px small desktop.
- 1440px desktop.
- Light mode and dark mode.
- Reduced motion.
- Keyboard-only navigation.
- 200% zoom.
- Loading, empty, error, disabled, and read-only states.
- Provider-selected Waybill manual-management state.

Add or run guardrails for:

- Button geometry overrides.
- Meaningful text below 12px.
- Conventional raw buttons.
- Hardcoded palette colors.
- Excessively faded informative text.
- Hand-built page headers/tables where shared infrastructure should be used.

## Verification record

- Targeted TypeScript checks passed after the WhatsApp and Waybill module changes.
- Targeted ESLint checks passed for both module files.
- WhatsApp Template Settings received desktop and 390px mobile visual checks.
- Waybill Settings no-provider state received desktop and 390px mobile visual checks.
- Waybill mobile page width was verified at 390px with no page-level horizontal overflow after the CTA fix.
- A production build reached successful compilation; the build runner was interrupted during its subsequent TypeScript stage by a Windows helper issue. Independent TypeScript checks passed. A clean full production-build run remains part of final Phase 8 verification.

## Resume checkpoint

When this migration resumes, start with:

**Phase 4.3 — Dashboard Settings**

Continue to treat `/prototype` as the design source of truth and avoid functional changes during UI-only migration work.
