# Dashboard and OMS Performance Remediation

## Scope

This document records the performance audit and remediation work completed on
2026-09-18. The goal is to reduce initial dashboard and OMS page-load latency
without changing business behaviour.

## Findings

### 1. Shared dashboard shell performed avoidable network work

Before remediation, every dashboard-shell mount:

- reads shared business settings;
- writes all four settings objects back to the database, even when the user
  did not change a setting;
- fetches the notification count and notification list; and
- performs extra authentication/profile lookups in the sidebar before loading
  the business branding.

These requests ran alongside the actual page query, competing for browser,
network, and Supabase capacity. The unnecessary writes and duplicate lookups
have now been removed.

### 2. Dashboard overview fetches too much data

The overview starts seven queries together. One orders query has no result
limit and is used for summary calculations. As historic order volume grows,
both the transfer size and browser-side calculations grow with it.

### 3. OMS list pages fetch a large client-side working set

Orders fetches up to 200 orders together with all nested order items, then
filters and paginates in the browser. Inventory and Expenses follow the same
pattern with up to 500 rows. This produces a visibly slow first load for
businesses with more records.

### 4. Page rendering is client-first

The overview and OMS pages load their data after JavaScript hydration. This
adds a round trip before useful data can appear and makes slower devices feel
the delay more strongly.

## Remediation Order

| Status | Work item | Expected effect |
| --- | --- | --- |
| Complete | Stop the four unconditional settings writes at shell startup | Removes four database writes per dashboard entry |
| Complete | Reuse the dashboard session for sidebar branding and parallelize the remaining branding reads | Removes duplicate auth/profile calls and a request waterfall |
| Complete | Fetch notification count and notification list in parallel | Reduces shell startup wait time |
| Complete | Load unopened dashboard dialogs and mobile drawers on demand | Reduces the initial dashboard JavaScript bundle |
| Complete | Add an immediate dashboard route loading state | Gives users feedback during route transitions |
| Complete | Reuse the dashboard session in global search | Removes duplicate authentication and profile lookups before searching |
| Complete | Replace unbounded dashboard summary reads with bounded/aggregate queries | Prevents summary latency increasing with historical data |
| Complete | Move OMS filtering and pagination to database queries | Transfers and renders only the requested subset of rows |
| Complete | Further reduce page-specific client bundles | Dynamic import of heavy modals, forms, and dialogs across Orders, Expenses, and Inventory |
| Pending | Measure production query timings and browser Core Web Vitals before/after | Confirms improvement with real production data |

## Completed Changes

1. **Settings startup sync** — Removed the initial four-record settings write.
   Settings are still saved when the user makes an actual change.
2. **Sidebar branding** — Reused the dashboard session and made the remaining
   business-branding requests concurrent. This removes redundant auth and
   profile requests.
3. **Notifications** — The unread count and notification list are now fetched
   concurrently instead of sequentially.
4. **On-demand UI code** — Unopened keyboard shortcuts, search dialog, bug
   report dialog, mobile drawer, and quick-action sheet are loaded only when
   needed.
5. **Route feedback** — Added a dashboard loading skeleton for route changes.
6. **Global search** — Desktop and mobile search reuse the dashboard business
   session instead of requesting the auth session and profile again.
7. **Bounded Dashboard Overview Queries** — `order_items` queries are bounded by the active date range / last month, active deliveries are filtered by status, and `inventory_items` soft-deleted items are excluded at the database level.
8. **Server-Side OMS Filtering** — `orders` page now passes status and payment filters directly into Supabase queries and React Query cache keys. `expenses` and `inventory` push category and payment status filters directly down to database queries, preventing large client downloads.
9. **Page-Specific Bundle Reduction** — Heavy dialogs and forms (`CategoryManager`, `DateRangePickerModal`, `ConfirmDialog`, `StockForm`, `StockPreview`, `BulkOrderImportForm`, `InvoiceTemplate`) are code-split with `next/dynamic` across Orders, Expenses, and Inventory pages.

## Validation

- `npm run typecheck` passed cleanly after the changes.
- `npx eslint` passed across all modified dashboard and OMS routes.
- `npm test` repository test suite passed 5/5.

## Verification Criteria

- [x] A dashboard entry performs no settings writes unless a user changes a setting.
- [x] Sidebar branding does not query the authenticated user or profile again.
- [x] Notifications begin both initial reads together.
- [x] Dashboard summary and OMS list requests have a fixed, data-size-safe cost.
- [x] Heavy page-specific dialogs, forms, and utilities are loaded on-demand.
- [ ] Before/after measurements are captured from a signed-in production account.

## Notes

The project had existing, uncommitted edits in the Dashboard page, Orders page,
and a Supabase index migration (054) at the time this work began. They have been
preserved. Those edits already include OMS dialog code-splitting, React Query
caching, an order-list limit, dashboard date scoping, and a matching order-sort
index; deployment and production validation remain required.
