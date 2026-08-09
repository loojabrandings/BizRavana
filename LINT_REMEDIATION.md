# BizRavana Lint Remediation Roadmap

> Baseline captured: 2026-08-02 on `codex/release-security`

## Current baseline

- Files with issues: 0
- Errors: 0
- Warnings: 0
- Production build: passing
- TypeScript: passing

| Rule | Errors | Warnings | Priority |
|------|-------:|---------:|----------|
| `react-hooks/set-state-in-effect` | 0 | 0 | P1 complete |
| `react-hooks/refs` | 0 | 0 | P1 complete |
| `react-hooks/purity` | 0 | 0 | P1 complete |
| `react-hooks/immutability` | 0 | 0 | P1 complete |
| `react-hooks/static-components` | 0 | 0 | P1 complete |
| `react-hooks/rules-of-hooks` | 0 | 0 | P0 complete |
| `react-hooks/preserve-manual-memoization` | 0 | 0 | P1 complete |
| `@typescript-eslint/no-explicit-any` | 0 | 0 | P2 complete |
| `react/no-unescaped-entities` | 0 | 0 | P3 complete |
| `prefer-const` | 0 | 0 | P3 complete |
| `@typescript-eslint/no-unused-vars` | 0 | 0 | P3 complete |
| `react-hooks/exhaustive-deps` | 0 | 0 | P2 complete |
| `@next/next/no-img-element` | 0 | 0 | P3 complete |
| `jsx-a11y/role-has-required-aria-props` | 0 | 0 | P2 complete |

## Highest-issue files

None. Repository ESLint currently reports zero errors and zero warnings.

## Remediation order

1. ~~Fix the two Rules of Hooks violations first.~~ Completed in Milestone 5;
   the repository now has zero `react-hooks/rules-of-hooks` errors.
2. ~~Continue React effect errors in
   small page-level batches. Run targeted lint, TypeScript, and a production
   build after each batch.~~ Completed in Milestone 11. Courier and Subscription ref batches were completed
   in Milestones 7 and 8. Declaration-order issues were completed in Milestone
   9, and static components in Milestone 10; all of those categories are now
   zero. Effect Batch A removed synchronous resets from product search and
   order-item product loading; Batch B moved form/dialog resets to parent keys
   and conditional remounting; Batch C corrected async inventory, tracking, and
   category-loading lifecycles; Batch D removed preview/form prop copies and
   keyed quotation product requests; Batch E made Order and Quotation totals
   canonical derived submit data; Batch F moved four admin mount fetches to
   cancellable post-commit tasks; Batch G applied the same lifecycle-safe
   loading pattern to the remaining seven admin pages; Batch H replaced six
   admin dialog reset effects with fresh-state conditional mounts; Batch I
   moved five dashboard pagination resets into guarded render-time state
   adjustment; Batch J made five URL/hash/browser initialization effects
   lifecycle-safe; Batch K applied cancellable post-commit loading to seven
   remaining dashboard and delivery fetch effects; Batch L removed the final
   Waybill pagination and Global Search reset errors. The repository now has
   zero `react-hooks/set-state-in-effect` errors.
3. ~~Replace `any` in payment, delivery, settings-sync, and bulk-import boundaries
   with validated external-data types before working through UI-only casts.~~
   Completed in Milestone 12. Batch A completed the settings-sync boundary with a generic,
   action-excluding hydration selector; Batch B typed Koombiyo API responses,
   collections, tracking events, locations, and finance results; Batch C added
   equivalent validation and domain typing for Royal Express; Batch D typed
   manual-waybill query rows, summaries, and update payloads; Batch E typed the
   Product bulk-import workbook validation metadata and cell styling; Batch F
   typed Order bulk-import workbook rules and normalized import payload enums;
   Batch G typed Orders dashboard query parameters, database rows, preview
   items, and image-storage cleanup boundaries; Batch H added a shared result
   union to both Global Search surfaces and removed their stale bindings; Batch
   I typed Quotation item rows, cloud-restore upsert options, and the generic
   DataTable fallback accessor. The repository now
   has zero `@typescript-eslint/no-explicit-any` errors.
4. Review every exhaustive-deps warning individually. Do not bulk-add
   dependencies because doing so can introduce render loops. Milestone 13 Batch
   A stabilized number formatting and parser inputs, made form initialization
   respond to editing mode, and moved custom accent metadata to module scope;
   Batch B made Waybill Settings provider-aware across loading and creation
   callbacks and removed its stale state and error bindings; Batch C stabilized
   Settings backup/reset metadata and Expenses action guards while also
   clearing the Settings page's stale, text-escaping, and combobox issues;
   Batch D stabilized Inventory table, mobile-card, and empty-state action
   dependencies and removed its inactive refetch state; Batch E stabilized
   Products desktop/mobile fetch actions and its guarded empty-state action;
   Batch F stabilized Quotations edit, desktop-row, and mobile-card actions;
   Batch G reviewed and resolved all 12 remaining warnings in the Orders
   dashboard, bringing the repository exhaustive-deps count to zero.
5. Finish mechanical unused-variable, escaping, image, and accessibility work.
   Milestone 14 completed both remaining `prefer-const` fixes, bringing the
   repository ESLint error count to zero; unused-variable and image warnings
   remain for subsequent batches. Milestone 15 Batch A removed 20 unused
   imports and bindings from admin, reports, landing, and shared table files;
   Batch B removed 14 more from order dialogs, reports, landing, and courier
   utilities; Batch C removed the final 21 across registration, subscription,
   plan administration, courier finance, order numbering, shared UI, and
   template rendering, bringing the repository unused-variable count to zero.
   Milestone 16 migrated the final ten raw image elements to Next.js 16 Image
   usage, completing the lint remediation roadmap at zero errors and warnings.

## Completion gate

- [x] Repository ESLint exits successfully with zero errors and warnings.
- [x] TypeScript and production build remain successful.
- [x] Public landing, registration, login, password-recovery, and unauthenticated
  dashboard/admin guard behavior received browser smoke coverage.
- [x] Authenticated Super Admin overview and every admin navigation destination
  received read-only browser smoke coverage with no console errors.
- [x] Super Admin role routing redirects direct `/dashboard` access to `/admin`.
- [x] Authenticated normal-user dashboard, orders, quotations, products,
  courier, inventory, expenses, reports, subscription, and settings pages
  received read-only browser smoke coverage with no remaining console errors
  or warnings.
- [x] Normal business-user role routing redirects direct `/admin` access to
  `/dashboard`.
- [ ] State-changing admin workflows require controlled test data and explicit
  mutation coverage; the release smoke test intentionally remained read-only.
- [ ] State-changing business workflows—including orders, imports, courier,
  backups, subscription, and payments—require controlled test data and
  explicit mutation coverage.
- [x] Investigated the apparent 15–27 second authenticated-page delays. The
  original figures included fixed automation waits and navigation timeouts;
  cold development compilation was the main contributor.
- [x] Validated an optimized production build: dashboard readiness was about
  1.4 seconds and primary route content completed in about 0.46–4.52 seconds,
  with no browser console errors or warnings.
- [ ] Consider later query-level profiling for Courier and Subscription, which
  remained near 3.3 seconds in repeated production measurements.
