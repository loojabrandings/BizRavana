# BizRavana Release-Fixing Log

This document records public-release remediation work, verification evidence,
and any operational steps that must still be performed outside the repository.

## Working rules

- Branch: `codex/release-security`
- Existing user changes are preserved and are not part of this remediation.
- Historical migrations are never edited; security changes use new migrations.
- A migration is marked **created** until it is separately applied and verified
  in the target Supabase environment.

## Baseline — 2026-08-02

- Source branch before remediation: `main`
- Baseline commit: `63fa526`
- Existing migrations: `001` through `039`
- Production build: passed before remediation
- TypeScript: passed before remediation
- Repository-wide lint baseline: 158 errors and 158 warnings
- Automated test suite: not present
- CI workflow: not present

### Preserved pre-existing working-tree changes

- `.freebuff/desktop-v2.db*`
- `src/app/(dashboard)/dashboard/subscription/payment/payment-page-client.tsx`
- `src/app/globals.css`
- `src/components/layout/nav-item-indicator.tsx`
- `src/components/layout/sidebar.tsx`

## Milestone 1 — Team invitation security

Status: **staging behavioral verification complete; production rollout pending**

### Scope

- Authenticate every team-management API request with `auth.getUser()`.
- Derive user and business identity from the authenticated profile.
- Restrict management operations to business owners and admins.
- Apply tenant filters before every service-role read or mutation.
- Prevent self-role changes, self-removal, owner demotion, and owner removal.
- Bind invitation discovery and acceptance to the authenticated user's email.
- Remove public/anonymous execution rights from invitation RPC functions.

### Repository changes

- Added `src/lib/team-authorization.ts`.
- Secured `/api/invitations` GET, POST, and DELETE handlers.
- Secured `/api/invitations/member-role` PATCH and DELETE handlers.
- Replaced the browser Supabase client in the acceptance route with the server
  client and removed service-role acceptance.
- Created `040_secure_team_invitations.sql`.

### Operational work still required

- [x] Review migrations 040 and 043 against a staging database.
- [x] Apply migrations 040 and 043 to staging in order.
- [x] Run authenticated owner/admin/member and cross-tenant tests.
- [ ] Apply migrations 040 and 043 to production only after staging verification.
- [x] Record the applied migration timestamp and verification evidence here.

### Verification

- [x] Targeted ESLint
- [x] TypeScript
- [x] Production build (Next.js 16.2.10; 61 pages generated)

- [x] Unauthenticated API checks (all six protected operations returned 401)
- [x] Cross-tenant checks
- [x] Invitation acceptance happy path
- [x] Repository review confirmed migration 040 binds invitation discovery and
  acceptance to the authenticated ID and email
- [x] Repository review identified and remediated same-business role downgrade
  risk in follow-up migration 043
- [x] Staging invitation matrix passed 17 checks: email-bound discovery,
  cross-user and cross-business rejection, owner/admin/member role
  preservation, member promotion, happy-path acceptance, and exactly-once
  concurrent acceptance

## Milestone 2 — Super Admin notification security

Status: **staging behavioral and API authorization verification complete**

### Findings

- `/api/admin/deliver-broadcast` used the service-role client without first
  authenticating and authorizing a Super Admin.
- An empty `selected` audience could fall through to an all-business query.
- The delivery route allowed an already-sent broadcast to be delivered again.
- Broadcast delivery activity was recorded with a null `admin_id`.
- `/api/admin/user-emails` trusted `getSession()` instead of verifying the user
  with `auth.getUser()` on the server.
- Notification `SECURITY DEFINER` functions created in migration 025 did not
  explicitly revoke PostgreSQL's default PUBLIC execution privilege.

### Repository changes

- Added one server-only Super Admin authorization helper and used it across all
  `/api/admin/*` routes.
- Added UUID validation to admin email lookup and broadcast delivery inputs.
- Rejected empty selected audiences and normal broadcast re-delivery.
- Added recipient-state verification and cleanup for partial delivery failure.
- Recorded the authenticated Super Admin as the delivery audit actor.
- Changed Send Now so only the server marks a successful broadcast as sent.
- Updated notification database TypeScript types added by migration 024.
- Created `041_secure_notification_execution.sql` to revoke browser-role access
  to internal notification functions and repair scheduled-delivery selection.
- Added migration 044 and moved manual delivery into one row-locked database
  transaction so concurrent manual/cron delivery cannot duplicate recipients.
- Added migration 045 after staging exposed an empty-`search_path` runtime
  failure in the notification helper; its public table references are now
  explicitly schema-qualified without weakening the hardened search path.
- Added migration 046 after the hourly automatic-notification worker reproduced
  the same historical schema-resolution failure. All application relations and
  helper calls are now explicitly qualified while service-role-only execution
  and the empty `search_path` remain intact.

### Operational work still required

- [x] Review migrations 041, 044, 045, and 046 against a staging database.
- [x] Apply migrations 041 and 044 to staging in order.
- [x] Test authenticated Super Admin panel access without using production data.
- [x] Verify a normal authenticated user receives 403 from every admin route.
- [x] Verify scheduled and manual delivery are idempotent under concurrency.
- [ ] Apply migrations 041, 044, 045, and 046 to production only after staging verification.
- [x] Record the applied migration timestamp and verification evidence here.

### Verification

- [x] Targeted ESLint
- [x] TypeScript
- [x] Unauthenticated admin API checks (all five protected routes returned 401)
- [x] Production build (Next.js 16.2.10; 61 pages generated)
- [x] Authenticated Super Admin panel access
- [x] Authenticated non-admin panel guard (member redirected to `/dashboard`)
- [x] Authenticated non-admin API matrix (all five protected Admin endpoints
  returned `403` before validation or mutation)
- [x] Hourly automatic-notification worker executed successfully after
  migration 046
- [x] Scheduled/manual concurrent-delivery staging test (13 checks; exact
  recipient/notification counts and no duplicates)

## Milestone 3 — Message Template tenant isolation

Status: **staging behavioral and tenant-isolation verification complete**

### Findings

- The default-template handler cleared defaults inside the authenticated
  business, but set the requested template using only its `id`. Because the
  route used the service-role client, this allowed a known cross-business ID to
  bypass tenant isolation.
- The route trusted `auth.getSession()` instead of verifying the user with
  `auth.getUser()`.
- Message Template CRUD unnecessarily bypassed RLS with the service-role client.
- Client helpers accepted business and user IDs even though identity must come
  from the authenticated server session.
- The UI creates the unified `order_whatsapp` context, but migration 015 and the
  generated database type only allow the three legacy contexts.

### Repository changes

- Added a server-only business-user authorization helper that verifies the user
  and derives business membership from the authenticated profile.
- Used the authenticated Supabase client and RLS for every Message Template
  operation instead of the service-role client.
- Added schema validation and authenticated-business filters to every operation.
- Resolved default context from the owned target template instead of request data.
- Removed business and user identity parameters from browser API helpers.
- Grouped unified and legacy order contexts when listing and changing defaults.
- Added `order_whatsapp` to database types.
- Created migration 042 to add explicit `order_whatsapp` constraint support.
- Added migration 047 after staging exposed an RLS conflict when a soft-deleted
  row became invisible before PostgREST could return it. The authenticated-only
  RPC derives business identity from `auth.uid()` and preserves deleted-row
  privacy without accepting a client-supplied tenant ID.
- Cleaned React effect/ref violations in the changed template settings component.

### Operational work still required

- [x] Review migrations 042 and 047 against a staging database.
- [x] Apply migration 042 to staging.
- [x] Test owner/admin/member Message Template CRUD in staging.
- [x] Verify a user cannot read or mutate another business's template ID.
- [x] Verify unified and legacy order templates maintain one UI-level default.
- [ ] Apply migrations 042 and 047 to production only after staging verification.
- [x] Record the applied migration timestamp and verification evidence here.

### Verification

- [x] Targeted ESLint
- [x] TypeScript
- [x] Unauthenticated API checks (all five methods returned 401)
- [x] Production build (Next.js 16.2.10; 61 pages generated)
- [x] Authenticated same-business CRUD
- [x] Authenticated cross-business checks
- [x] Staging Message Template matrix passed 22 checks across Owner, Business
  Manager, Member, and foreign-business sessions
- [x] Disposable templates, users, businesses, and local test credentials removed

## Milestone 4 — Remaining API/RLS security audit

Status: **repository changes and local signed-callback staging verification complete**

### Audit results

- Audited every remaining API route for verified authentication, service-role
  usage, tenant filtering, input handling, and public callback boundaries.
- Confirmed bank-transfer creation, PayHere completion, payment review, and
  business purge functions already revoke unsafe direct execution privileges.
- Confirmed migrations 040 and 041 cover the invitation and notification
  `SECURITY DEFINER` gaps found earlier.
- Remaining authenticated service-role routes derive user/business identity
  before privileged queries and apply user or tenant filters.
- Found that a PayHere callback with an invalid signature could mark a known
  legitimate order invalid and create audit rows.
- Found that the native login POST used the framework's default 307 redirect,
  which could preserve POST when following the redirect to the dashboard.

### Repository changes

- Invalid PayHere callbacks no longer update payment state or write audit rows.
- Added a 64 KB callback limit and bounded PayHere callback field lengths.
- Added validated native-login form inputs and stable error codes.
- Changed native-login redirects to `303 See Other`.
- Added `LINT_REMEDIATION.md` with severity, file hotspots, and batch order.

### Lint baseline after Milestones 1–3

- Files with issues: 77
- Errors: 147 (baseline before remediation: 158)
- Warnings: 142 (baseline before remediation: 158)
- Highest-priority backlog: two Rules of Hooks errors, followed by React effect,
  ref, purity, and immutability errors.

### Operational work still required

- [x] Verify an invalid callback cannot mutate a disposable staging payment.
- [x] Verify a valid signed PayHere staging callback activates exactly once.
- [ ] Exercise native-form login with JavaScript disabled.
- [x] Add distributed database-backed rate limiting for login and the PayHere
  callback.
- [ ] Add hosting-provider/WAF rate limiting after the production host is
  finalized.
- [ ] Run a PayHere-hosted Sandbox checkout against a public HTTPS staging
  callback URL after actual Sandbox credentials are configured.

### Verification

- [x] Targeted ESLint
- [x] TypeScript
- [x] Native login missing-field redirect returned 303
- [x] Oversized PayHere callback returned 413
- [x] Incomplete PayHere callback returned 400 before config/database access
- [x] Production build (Next.js 16.2.10; 61 pages generated)
- [x] Valid/invalid PayHere staging callback matrix passed 13 checks

### PayHere callback staging evidence (2026-08-03)

- Used the verified `BizRavana Staging` Supabase project and a local-only
  synthetic merchant ID/secret with `PAYHERE_SANDBOX=true`; no production
  PayHere or Supabase credentials/data were used.
- Rejected invalid signatures, signed amount mismatches, signed currency
  mismatches, signed merchant mismatches, unknown orders, and successful
  callbacks missing a PayHere payment ID.
- Confirmed every invalid callback left the payment and audit state unchanged.
- Fired five correctly signed callbacks concurrently. All returned `200 OK`,
  while the payment, subscription activation, audit row, and user notification
  were each created/applied exactly once.
- Replayed the same valid callback and confirmed that it did not extend the
  subscription or create duplicate audit/notification side effects.
- The matrix passed 13/13 checks. Its disposable Auth user, business, payment,
  notification, and audit data were removed after the run.
- This verifies the local callback boundary and database transaction behavior.
  It does not replace the pending PayHere-hosted Sandbox checkout test, which
  needs actual Sandbox credentials and a public HTTPS `notify_url`.

## Milestone 5 — React correctness lint, P0 batch

Status: **complete**

### Findings

- `DockIcon` returned early when no Dock context was present, causing
  `useTransform` and `useSpring` to be called conditionally on other renders.
- The Dock accepted custom spring options but did not pass them to Dock icons.

### Repository changes

- Added an unconditional fallback motion value and default dimensions so every
  DockIcon render calls hooks in the same order.
- Kept the original plain fallback markup when no Dock context exists.
- Passed configured spring options through Dock context to Dock icons.
- Removed the unused `createElement` import.

### Verification

- [x] Targeted ESLint with zero issues
- [x] TypeScript
- [x] Repository Rules of Hooks errors reduced from 2 to 0
- [x] Repository baseline reduced from 147/142 to 145/140
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 6 — React correctness lint, P1 batch A

Status: **complete**

### Scope and changes

- Rebuilt DonutChart arc segments with a pure reducer instead of mutating a
  render-scoped cumulative percentage.
- Moved keyboard-shortcut state and callback ref synchronization from render
  into effects while keeping one stable global keydown listener.
- Replaced four render-time `Date.now()` calls in admin business, cleanup,
  subscription, and trial views with lazy timestamp snapshots.

### Verification

- [x] DonutChart and keyboard-shortcut targeted ESLint with zero issues
- [x] Admin purity errors reduced from 4 to 0
- [x] TypeScript
- [x] Repository errors reduced from 145 to 138
- [x] Repository warnings remain at 140
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 7 — Courier reactive provider state

Status: **complete**

### Finding

- The Courier page stored the active provider in a ref and read that ref while
  rendering status cards and recent activity. Ref changes do not trigger a
  render, and React's ref lint rule rejects render-time `ref.current` reads.
- The same ref also retained provider credentials even though all credential
  consumers already use the local, server-returned configuration inside the
  asynchronous refresh operation.

### Repository changes

- Replaced the render-facing provider ref with reactive `providerId` state.
- Cleared that state when no courier is configured and updated it after a valid
  configuration loads.
- Updated status merging, category selection, and display labels to derive from
  provider state.
- Removed the unused credential ref and `useRef` import.

### Verification

- [x] Courier `react-hooks/refs` errors reduced from 3 to 0
- [x] Targeted ESLint introduced no new issues
- [x] TypeScript
- [x] Repository errors reduced from 138 to 135
- [x] Repository warnings remain at 140
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 8 — Subscription card ref cleanup

Status: **complete**

### Finding

- The mobile subscription cards stored every card element in a ref array and
  truncated that array during render.
- No feature read the individual card refs: scroll tracking and dot navigation
  both use the cards container ref. The array and its render-time mutation were
  dead state.

### Repository changes

- Removed the unused individual-card ref array and card callback refs.
- Removed the render-time ref mutation.
- Removed the map index that became unused after the dead refs were deleted.
- Preserved the container and file-input refs used by event handlers.

### Verification

- [x] Subscription `react-hooks/refs` errors reduced from 3 to 0
- [x] Repository `react-hooks/refs` errors reduced from 3 to 0
- [x] Targeted ESLint introduced no new issues
- [x] TypeScript
- [x] Repository errors reduced from 135 to 132
- [x] Repository warnings remain at 140
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 9 — React declaration-order correctness

Status: **complete**

### Findings

- The Orders URL-filter effect used the order-form state setter before that
  hook was declared.
- The Orders status handler captured `applyStatusChange` before that callback
  was declared.
- The Subscription data loader captured `fetchUsage` before that callback was
  declared.
- React Compiler reports these declaration-order problems under its
  immutability rule because earlier closures cannot safely track later values.

### Repository changes

- Moved Orders in-page form state alongside the page's other UI state.
- Declared `applyStatusChange` before the handler that calls it.
- Declared `fetchUsage` before the Subscription data loader.
- Completed the affected callback dependency lists to prevent stale closures.
- Kept the existing status-update, usage-query, and URL-action behavior.

### Verification

- [x] Repository `react-hooks/immutability` errors reduced from 3 to 0
- [x] Repository `react-hooks/preserve-manual-memoization` reduced from 1 to 0
- [x] TypeScript
- [x] Repository errors reduced from 132 to 128
- [x] Repository warnings reduced from 140 to 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 10 — Stable React components

Status: **complete**

### Findings

- Data Security created its shared export/import selection-grid component with
  `useCallback` during every parent component lifecycle.
- The Subscription hero selected a component type during render for the active
  plan icon.
- Components created or selected through these render-local definitions can
  lose identity and reset child state across renders.

### Repository changes

- Extracted the entity selection grid and its immutable Set toggle logic to a
  module-level component shared by both dialogs.
- Replaced the plan-icon component factory with one stable module-level
  component that returns the selected icon element.
- Reused the stable plan icon for the current-plan hero and mobile plan cards.
- Preserved selection behavior, styling, and plan-to-icon mappings.

### Verification

- [x] Repository `react-hooks/static-components` errors reduced from 3 to 0
- [x] Targeted Settings and Subscription ESLint
- [x] TypeScript
- [x] Repository errors reduced from 128 to 125
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch A

Status: **complete**

### Scope decision

- Audited all 53 `react-hooks/set-state-in-effect` errors by file and selected
  two user-input components with clear synchronous-reset patterns.
- Deferred Category Manager because its warning crosses the controlled-dialog
  and external database refresh boundary and needs a separate lifecycle review.

### Repository changes

- Product Search now clears query results and closes its popover in the input
  and selection event handlers instead of synchronously inside its search
  effect.
- Order Item product loading now keys completed results by business and category.
- Product results and loading state are derived from the active request key, so
  a category change immediately hides stale results without an effect reset.
- Preserved the debounced search, category-scoped database query, cancellation,
  focus restoration, and product selection behavior.

### Verification

- [x] Targeted files reduced from 2 effect-state errors to 0
- [x] Product Search targeted ESLint has zero issues
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 53 to 51
- [x] Repository errors reduced from 125 to 123
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch B

Status: **complete**

### Scope decision

- Reviewed Stock Form, Stock Preview, normal and bulk dispatch dialogs, and
  shipment tracking.
- Selected prop-to-form and dialog-reset effects for this batch.
- Deferred Stock Preview and shipment tracking because they synchronize with
  external courier/database requests and need async-data lifecycle treatment.

### Repository changes

- Removed Stock Form's redundant `initialData` synchronization effect. The
  Inventory parent already increments `formKey` for every new/edit session and
  React now initializes the complete form state on that remount.
- Rendered normal and bulk dispatch dialogs only while open, so every workflow
  session mounts with fresh focus, progress, and result state.
- Removed the three synchronous reset effects and unused `useEffect` imports.
- Preserved dispatch callbacks, pending-order cleanup, eligibility checks, and
  success/failure progress behavior.

### Verification

- [x] Targeted form/dialog effect-state errors reduced from 3 to 0
- [x] Stock Form targeted ESLint has zero issues
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 51 to 48
- [x] Repository errors reduced from 123 to 120
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch C

Status: **complete**

### Scope

- Corrected the async database/courier lifecycles deferred from Batch B:
  Inventory Stock Preview, shipment tracking, and Category Manager.

### Repository changes

- Stock Preview now derives loading and visible transactions from the item ID
  whose request completed, preventing stale transactions during item changes.
- Added transaction-request cancellation so an obsolete response cannot update
  a newer preview session.
- Shipment Tracking now keys results by waybill and retry generation. Loading,
  errors, and visible events are derived from that key instead of reset effects.
- Retry increments the generation from its click handler, and stale courier
  responses are ignored after cleanup.
- Category Manager resets its next-open loader during the Sheet close event and
  starts its database refresh as a cancellable post-commit task.
- Preserved category mutation refreshes, tracking error toasts, and empty states.

### Verification

- [x] All three targeted files have zero ESLint issues
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 48 to 45
- [x] Repository errors reduced from 120 to 117
- [x] Files with issues reduced from 72 to 69
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch D

Status: **complete**

### Scope

- Audited invoice and quotation previews, Product Form, and quotation item
  product loading for prop-to-state synchronization and stale async results.

### Repository changes

- Removed Product Form's redundant `initialData` synchronization effect. Its
  Products parent already remounts edit sessions with `editKey` and unmounts
  the new-product form between sessions.
- Invoice and Quotation templates now use a supplied business profile directly
  and retain only the optional fallback fetch result in local state.
- Added fallback-profile request cleanup and derived fetching state so supplied
  props do not cause an extra synchronization render.
- Quotation items now key loaded product results by business and category,
  deriving loading and visibility without synchronous effect resets.
- Preserved PDF generation, profile fallback, category-scoped product queries,
  and product-selection behavior.

### Verification

- [x] All four targeted files have zero ESLint issues
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 45 to 41
- [x] Repository errors reduced from 117 to 113
- [x] Files with issues reduced from 69 to 65
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch E

Status: **complete**

### Scope

- Corrected the five remaining effect-state errors in Order Form and Quotation
  Form, plus one mechanical error in the changed submit block.

### Repository changes

- Removed both redundant edit-data synchronization effects; Orders and
  Quotations parents already remount edit sessions with `editKey`.
- Replaced subtotal, total, balance, and grand-total state-copy effects with
  memoized canonical submit payloads derived from item and discount inputs.
- Moved automatic Order payment-status selection into payment-method and
  advance-payment input updates.
- Applied the same automatic payment normalization during initial form setup,
  while preserving later manual payment-status changes.
- Order image uploads now extend the canonical calculated payload before submit.
- Changed the submit payload binding to `const` because its identity is not
  reassigned.

### Verification

- [x] Both targeted forms have zero ESLint errors
- [x] Targeted effect-state errors reduced from 5 to 0
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 41 to 36
- [x] Repository errors reduced from 113 to 107
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch F

Status: **complete**

### Scope

- Corrected mount-time admin data loading in the overview, Businesses, Storage,
  and Activity Log pages.

### Repository changes

- Scheduled each initial fetch as a post-commit browser task instead of calling
  a loading-state function synchronously from its effect.
- Added effect cleanup that cancels the task if the page unmounts before the
  initial request starts.
- Kept initial loading screens, database queries, enrichment, toasts, and
  action-triggered refresh functions unchanged.

### Verification

- [x] All four targeted admin pages have zero ESLint errors
- [x] Activity Log page has zero ESLint issues
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 36 to 32
- [x] Repository errors reduced from 107 to 103
- [x] Files with issues reduced from 65 to 64
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch G

Status: **complete**

### Scope

- Corrected the remaining mount-time admin data loaders in Business Detail,
  Cleanup, Payments, Plans, Settings, Subscriptions, and Trials.

### Repository changes

- Scheduled each initial fetch as a cancellable post-commit browser task so
  loading state is not changed synchronously inside an effect.
- Preserved page loading states, existing fetch logic, toasts, dialog behavior,
  and action-triggered refreshes.
- Left the six dialog/form reset effects for the next focused remediation batch.

### Verification

- [x] Targeted mount-time effect errors reduced from 7 to 0
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 32 to 25
- [x] Repository errors reduced from 103 to 96
- [x] Files with issues reduced from 64 to 62
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch H

Status: **complete**

### Scope

- Corrected the six remaining admin dialog and form reset effects across
  Cleanup, Payments, Plans, Subscriptions, and Trials.

### Repository changes

- Dialogs with editable local state now mount only while their target is
  selected, so each open session starts from its declared initial state.
- Plan editing now remounts the form for each create/edit session instead of
  copying incoming data through an effect.
- Subscription plan selection initializes directly from the selected business.
- Payment review notes reset naturally on remount, with native textarea
  autofocus replacing the delayed focus effect.
- Preserved dialog actions, validation, loading states, and parent-owned close
  behavior.

### Verification

- [x] Targeted dialog/form effect errors reduced from 6 to 0
- [x] All five targeted files have zero ESLint errors
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 25 to 19
- [x] Repository errors reduced from 96 to 90
- [x] Files with issues reduced from 62 to 59
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch I

Status: **complete**

### Scope

- Corrected pagination reset effects in Expenses, Inventory, Orders, Products,
  and Quotations.

### Repository changes

- Each page now tracks the previously rendered filtered collection and resets
  pagination immediately when that collection changes.
- Removed the post-render effects that synchronously copied filter changes into
  page state.
- Preserved page-size selection, row numbering, table navigation, filter-clear
  behavior, and the existing page-one reset contract.

### Verification

- [x] Targeted pagination effect errors reduced from 5 to 0
- [x] No `set-state-in-render` errors introduced
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 19 to 14
- [x] Repository errors reduced from 90 to 85
- [x] Files with issues remain at 59
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch J

Status: **complete**

### Scope

- Corrected URL query, URL hash, and browser auth-state initialization effects
  in Expenses, Inventory, Orders, Settings, and the public home page.

### Repository changes

- Query-driven form and filter initialization now runs as cancellable
  post-commit tasks when navigation parameters change.
- Settings hash initialization now uses the same lifecycle-safe task while
  retaining the direct `hashchange` event subscription.
- The home page now releases its auth-loading state after commit and cancels
  that pending transition on unmount.
- Preserved deep-link filtering, read-only guards, auth redirects, hash
  navigation, and landing-page behavior.

### Verification

- [x] Targeted external-state effect errors reduced from 5 to 0
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 14 to 9
- [x] Repository errors reduced from 85 to 80
- [x] Files with issues reduced from 59 to 58
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch K

Status: **complete**

### Scope

- Corrected seven remaining data-loading effects across the Courier and
  Subscription pages, Courier Finance, Waybill Settings, Shipment Status, and
  Cloud Backup.

### Repository changes

- Initial and dependency-driven fetches now begin through cancellable
  post-commit browser tasks.
- Courier cache freshness and API-sync decisions remain evaluated at task
  execution time.
- Cloud Backup independently cancels pending business/plan and backup-list
  loads when dependencies change or the component unmounts.
- Preserved refresh actions, courier status synchronization, loading states,
  error handling, and backup behavior.

### Verification

- [x] Targeted data-loading effect errors reduced from 7 to 0
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 9 to 2
- [x] Repository errors reduced from 80 to 73
- [x] Files with issues reduced from 58 to 57
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 11 — Effect state remediation, Batch L

Status: **complete**

### Scope

- Corrected the final two effect-state errors in Waybill Settings and Global
  Search.

### Repository changes

- Waybill pagination now resets directly from status, debounced search, clear,
  and page-size actions instead of synchronizing filters through an effect.
- Global Search query cleanup now runs as a cancellable post-commit task when
  the dialog opens.
- Preserved debounced searching, server pagination, filter clearing, dialog
  open/close behavior, and recent-search handling.

### Verification

- [x] Targeted effect-state errors reduced from 2 to 0
- [x] TypeScript
- [x] Repository `set-state-in-effect` errors reduced from 2 to 0
- [x] Repository errors reduced from 73 to 71
- [x] Files with issues remain at 57
- [x] Repository warnings remain at 138
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 12 — Type-safety remediation, Batch A

Status: **complete**

### Scope

- Removed all eight explicit-`any` casts from the cross-device settings-sync
  hydration boundary.

### Repository changes

- Added a generic hydration selector that accepts only keys present in the
  current Zustand store and excludes action functions.
- Reused the selector for Orders, Quotations, Expenses, and Preferences instead
  of assigning server JSON through untyped indexed casts.
- Cleaned the unused tuple binding in the existing function-stripping helper.
- Preserved server-wins hydration, partial store updates, debounced persistence,
  and local-state initial push behavior.

### Verification

- [x] Settings Sync has zero ESLint issues
- [x] Targeted explicit-`any` errors reduced from 8 to 0
- [x] TypeScript
- [x] Repository explicit-`any` errors reduced from 60 to 52
- [x] Repository errors reduced from 71 to 63
- [x] Files with issues reduced from 57 to 56
- [x] Repository warnings reduced from 138 to 137
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 12 — Type-safety remediation, Batch B

Status: **complete**

### Scope

- Removed all seven explicit-`any` boundaries from the Koombiyo delivery
  provider.

### Repository changes

- Koombiyo HTTP responses now enter the application as `unknown` and are
  narrowed through record and field helpers before use.
- Array extraction now validates supported response envelopes while retaining
  support for direct arrays, single objects, and plain-text waybill values.
- Tracking, district, city, and finance outputs now use their declared delivery
  domain types.
- Removed unused finance parameters from the provider implementation while
  preserving interface compatibility.
- Preserved authentication, waybill allocation, order registration, location
  sync, tracking fallbacks, and error reporting.

### Verification

- [x] Koombiyo provider has zero ESLint issues
- [x] Targeted explicit-`any` errors reduced from 7 to 0
- [x] TypeScript
- [x] Repository explicit-`any` errors reduced from 52 to 45
- [x] Repository errors reduced from 63 to 56
- [x] Files with issues reduced from 56 to 55
- [x] Repository warnings reduced from 137 to 135
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 12 — Type-safety remediation, Batch C

Status: **complete**

### Scope

- Removed all seven explicit-`any` boundaries from the Royal Express delivery
  provider.

### Repository changes

- Added shared response-narrowing helpers for Royal Express JSON records,
  collection envelopes, scalar fields, nullable fields, and API errors.
- Authentication now requires a validated token, and merchant selection
  requires a validated business ID.
- Shipment, tracking, finance, dashboard-status, state, and city responses are
  narrowed from `unknown` into their declared delivery domain types.
- Field-level API validation messages remain flattened into actionable errors.
- Preserved tenant authentication, shipment creation, provider status mapping,
  location sync, tracking display, and finance behavior.

### Verification

- [x] Royal Express provider has zero ESLint issues
- [x] Targeted explicit-`any` errors reduced from 7 to 0
- [x] TypeScript
- [x] Repository explicit-`any` errors reduced from 45 to 38
- [x] Repository errors reduced from 56 to 49
- [x] Files with issues reduced from 55 to 54
- [x] Repository warnings remain at 135
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 12 — Type-safety remediation, Batch D

Status: **complete**

### Scope

- Removed all eight explicit-`any` boundaries from the shared manual-waybill
  utility.

### Repository changes

- Added explicit database-row shapes for manual waybills and their joined order
  number.
- Summary calculations now operate on typed status rows.
- Single and bulk status mutations now use a constrained update payload instead
  of an unrestricted record.
- Removed an unused user ID from waybill-method persistence and its caller.
- Preserved provider filtering, pagination, assignment, soft deletion, bulk
  operations, status transitions, and available-waybill lookup behavior.

### Verification

- [x] Waybill utility has zero ESLint issues
- [x] Targeted explicit-`any` errors reduced from 8 to 0
- [x] TypeScript
- [x] Repository explicit-`any` errors reduced from 38 to 30
- [x] Repository errors reduced from 49 to 41
- [x] Files with issues reduced from 54 to 53
- [x] Repository warnings reduced from 135 to 134
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 12 — Type-safety remediation, Batch E

Status: **complete**

### Scope

- Removed all five explicit-`any` casts from the Product bulk-import workbook
  template boundary.

### Repository changes

- Added a local spreadsheet data-validation type for category, inventory-link,
  and product-status dropdown rules.
- Workbook header and instruction styling now uses the worksheet cell shape
  directly without untyped assertions.
- Removed unused row-validation and category-change bindings.
- Preserved XLSX/CSV parsing, template output, header normalization, validation,
  preview editing, and import behavior.

### Verification

- [x] Product bulk-import form has zero ESLint issues
- [x] Targeted explicit-`any` errors reduced from 5 to 0
- [x] TypeScript
- [x] Repository explicit-`any` errors reduced from 30 to 25
- [x] Repository errors reduced from 41 to 36
- [x] Files with issues reduced from 53 to 52
- [x] Repository warnings reduced from 134 to 132
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 12 — Type-safety remediation, Batch F

Status: **complete**

### Scope

- Removed all ten explicit-`any` boundaries from the Order bulk-import
  workbook and database payload.

### Repository changes

- Added typed spreadsheet data-validation metadata for payment method,
  discount type, order source, order status, and payment status dropdowns.
- Added constrained import types and normalization for every order enum before
  valid rows reach the database insert boundary.
- Workbook header styling now uses the worksheet cell shape directly without
  untyped assertions.
- Removed the unused row-index validation argument.
- Preserved XLSX/CSV parsing, template output, validation messages, preview,
  batching, order-number generation, order insertion, and item insertion.

### Verification

- [x] Order bulk-import form has zero ESLint issues
- [x] Targeted explicit-`any` errors reduced from 10 to 0
- [x] TypeScript
- [x] Repository explicit-`any` errors reduced from 25 to 15
- [x] Repository errors reduced from 36 to 26
- [x] Files with issues reduced from 52 to 51
- [x] Repository warnings reduced from 132 to 131
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 12 — Type-safety remediation, Batch G

Status: **complete**

### Scope

- Removed all seven explicit-`any` boundaries and the remaining error-level
  `prefer-const` issue from the Orders dashboard page.

### Repository changes

- Added a reusable type guard for validating URL-provided order, payment, and
  delivery filters before applying them to dashboard state.
- Added selected-row types derived from the database schema for order lists,
  full-order previews, and preview items.
- Order image parsing and storage cleanup now receive typed database values
  instead of unchecked casts.
- Removed an unused Orders settings subscription and made the preview image map
  immutable at its binding.
- Preserved filtering, order loading, preview/edit data, image handling,
  deletion, and dashboard behavior.

### Verification

- [x] Orders dashboard has zero ESLint errors
- [x] Targeted explicit-`any` errors reduced from 7 to 0
- [x] Targeted error-level issues reduced from 8 to 0
- [x] TypeScript
- [x] Repository explicit-`any` errors reduced from 15 to 8
- [x] Repository errors reduced from 26 to 18
- [x] Files with issues remain at 51 because reviewed warnings remain
- [x] Repository warnings reduced from 131 to 130
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 12 — Type-safety remediation, Batch H

Status: **complete**

### Scope

- Removed all four explicit-`any` boundaries from the Global Search dialog and
  desktop popover.

### Repository changes

- Added a union representing every searchable entity and used it at Fuse result
  and result-rendering boundaries.
- Category rendering now narrows each result to its declared order, customer,
  product, inventory, expense, or quotation shape.
- Search value derivation now uses property narrowing instead of unrestricted
  field access.
- Removed stale imports, state, destructured values, and list indices from both
  search implementations.
- Preserved fuzzy matching, grouped results, keyboard navigation, recent
  searches, and destination routing.

### Verification

- [x] Global Search dialog and popover have zero ESLint issues
- [x] Targeted explicit-`any` errors reduced from 4 to 0
- [x] TypeScript
- [x] Repository explicit-`any` errors reduced from 8 to 4
- [x] Repository errors reduced from 18 to 14
- [x] Files with issues reduced from 51 to 49
- [x] Repository warnings reduced from 130 to 124
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 12 — Type-safety remediation, Batch I

Status: **complete**

### Scope

- Removed the final four explicit-`any` boundaries from Quotations, Cloud
  Backup restore, and the shared DataTable.

### Repository changes

- Quotation conversion and form-preview items now use selected row types
  derived from the database schema.
- Cloud restore now passes a declared optional conflict target to batch upserts
  without bypassing the client API type.
- DataTable now accepts object rows and reads fallback display values through a
  narrow unknown-returning accessor.
- Removed two stale Cloud Backup imports.
- Preserved quotation conversion/edit behavior, restore batching and conflict
  handling, and DataTable rendering behavior.

### Verification

- [x] All three target files have zero ESLint errors
- [x] Targeted explicit-`any` errors reduced from 4 to 0
- [x] TypeScript
- [x] Repository explicit-`any` errors reduced from 4 to 0
- [x] Repository errors reduced from 14 to 10
- [x] Files with issues reduced from 49 to 47
- [x] Repository warnings reduced from 124 to 122
- [x] Production build (Next.js 16.2.10; 61 pages generated)

### Milestone result

- Milestone 12 is complete. The repository-wide
  `@typescript-eslint/no-explicit-any` count is now zero.

## Milestone 13 — Exhaustive-dependencies remediation, Batch A

Status: **complete**

### Scope

- Reviewed and removed six isolated `react-hooks/exhaustive-deps` warnings
  across form initialization, customer parsing, number animation, and user
  preferences.

### Repository changes

- NumberTicker now memoizes its formatter and subscribes its spring listener to
  that stable formatter.
- Order and Quotation customer parsers now construct courier lookup data inside
  their callbacks from explicit location dependencies.
- Order and Quotation form initialization now responds explicitly to editing
  mode while preserving sequence initialization rules.
- Custom accent CSS property metadata is now a module-level constant.
- Removed an unused React import and unused save-error binding from OrderForm.
- Preserved number animation, paste-to-fill, form numbering, edit behavior, and
  preference application.

### Verification

- [x] All six target files have zero ESLint issues
- [x] Targeted exhaustive-deps warnings reduced from 6 to 0
- [x] TypeScript
- [x] Repository exhaustive-deps warnings reduced from 35 to 29
- [x] Repository warnings reduced from 122 to 114
- [x] Files with issues reduced from 47 to 41
- [x] Repository explicit-`any` count remains zero
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 13 — Exhaustive-dependencies remediation, Batch B

Status: **complete**

### Scope

- Reviewed and removed all four `react-hooks/exhaustive-deps` warnings from
  Waybill Settings.

### Repository changes

- Waybill list and summary loading now refresh when the selected courier
  provider changes.
- Single, multiple, and generated-range creation callbacks now explicitly track
  the provider passed to the persistence boundary.
- Removed unused mobile detection, unused single-add state, and four unused
  error bindings.
- Preserved search debounce, pagination, method selection, waybill creation,
  summary loading, provider filtering, and mutation feedback.

### Verification

- [x] Waybill Settings has zero ESLint issues
- [x] Targeted exhaustive-deps warnings reduced from 4 to 0
- [x] TypeScript
- [x] Repository exhaustive-deps warnings reduced from 29 to 25
- [x] Repository warnings reduced from 114 to 104
- [x] Files with issues reduced from 41 to 40
- [x] Repository explicit-`any` count remains zero
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 13 — Exhaustive-dependencies remediation, Batch C

Status: **complete**

### Scope

- Reviewed and removed four `react-hooks/exhaustive-deps` warnings from the
  Dashboard Settings and Expenses pages.

### Repository changes

- Backup import sanitization and destructive reset table metadata now live at
  module scope, keeping their callbacks stable.
- Business saving no longer declares preference-store snapshots as callback
  dependencies it does not read from render state.
- Expense table actions now explicitly track the read-only guard.
- Removed unused Settings and Expenses imports, constants, state, and bindings.
- Completed the Settings search combobox relationship and escaped dynamic empty
  result guidance.
- Preserved backup/restore, password-protected reset, business preferences,
  expense fetching, and read-only action behavior.

### Verification

- [x] Dashboard Settings and Expenses pages have zero ESLint issues
- [x] Targeted exhaustive-deps warnings reduced from 4 to 0
- [x] TypeScript
- [x] Repository exhaustive-deps warnings reduced from 25 to 21
- [x] Repository errors reduced from 10 to 2
- [x] Repository warnings reduced from 104 to 90
- [x] Files with issues reduced from 40 to 38
- [x] Repository unescaped-entities and required-ARIA counts are zero
- [x] Repository explicit-`any` count remains zero
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 13 — Exhaustive-dependencies remediation, Batch D

Status: **complete**

### Scope

- Reviewed and removed all three `react-hooks/exhaustive-deps` warnings from
  the Inventory dashboard.

### Repository changes

- Desktop columns now explicitly track the read-only guard and stable edit
  callback used by row actions.
- Mobile cards and the empty-state creation action now track the read-only
  guard they execute.
- Removed an unused stock-value helper import and an inactive refetch trigger.
- Preserved inventory loading, filtering, pagination, editing, deletion,
  read-only protection, and empty-state behavior.

### Verification

- [x] Inventory dashboard has zero ESLint issues
- [x] Targeted exhaustive-deps warnings reduced from 3 to 0
- [x] TypeScript
- [x] Repository exhaustive-deps warnings reduced from 21 to 18
- [x] Repository warnings reduced from 90 to 85
- [x] Files with issues reduced from 38 to 37
- [x] Repository errors remain at 2
- [x] Repository explicit-`any` count remains zero
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 13 — Exhaustive-dependencies remediation, Batch E

Status: **complete**

### Scope

- Reviewed and removed all three `react-hooks/exhaustive-deps` warnings from
  the Products dashboard.

### Repository changes

- Desktop product columns now track full-product loading and the read-only
  guard used by view, edit, and delete actions.
- Mobile product cards now track the full-product loading callback used for
  preview and editing.
- The empty-state creation action now tracks its read-only guard.
- Removed an unused formatter import and an obsolete filtered-state binding.
- Preserved product loading, preview/edit hydration, filtering, bulk import,
  status updates, deletion, and read-only behavior.

### Verification

- [x] Products dashboard has zero ESLint issues
- [x] Targeted exhaustive-deps warnings reduced from 3 to 0
- [x] TypeScript
- [x] Repository exhaustive-deps warnings reduced from 18 to 15
- [x] Repository warnings reduced from 85 to 80
- [x] Files with issues reduced from 37 to 36
- [x] Repository errors remain at 2
- [x] Repository explicit-`any` count remains zero
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 13 — Exhaustive-dependencies remediation, Batch F

Status: **complete**

### Scope

- Reviewed and removed all three `react-hooks/exhaustive-deps` warnings from
  the Quotations dashboard.

### Repository changes

- Quotation editing now tracks the read-only guard used after full quotation
  hydration.
- Desktop columns now track preview and guarded delete actions alongside their
  existing edit, convert, status, and hover dependencies.
- Mobile quotation cards now track the read-only guard used by delete actions.
- Preserved quotation preview/edit hydration, conversion, status updates,
  deletion, and read-only behavior.

### Verification

- [x] Quotations dashboard has zero ESLint issues
- [x] Targeted exhaustive-deps warnings reduced from 3 to 0
- [x] TypeScript
- [x] Repository exhaustive-deps warnings reduced from 15 to 12
- [x] Repository warnings reduced from 80 to 77
- [x] Files with issues reduced from 36 to 35
- [x] Repository errors remain at 2
- [x] Repository explicit-`any` count remains zero
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 13 — Exhaustive-dependencies remediation, Batch G

Status: **complete**

### Scope

- Reviewed and removed all 12 remaining `react-hooks/exhaustive-deps` warnings
  from the Orders dashboard.

### Repository changes

- Query-driven order creation and all guarded update, deletion, dispatch, and
  empty-state actions now track the read-only guard they execute.
- Order submission, bulk courier dispatch, mobile cards, table columns, and
  bulk actions now track the live order, customer-count, courier, and preview
  values they consume.
- Broadened the manual-waybill callback's courier dependency to the complete
  configuration object required by the React compiler.
- Preserved order loading, filtering, preview/edit, submission, dispatch,
  payment/status updates, deletion, export, and read-only behavior.

### Verification

- [x] Orders dashboard has zero ESLint issues
- [x] Targeted exhaustive-deps warnings reduced from 12 to 0
- [x] TypeScript
- [x] Repository exhaustive-deps warnings reduced from 12 to 0
- [x] Repository warnings reduced from 77 to 65
- [x] Files with issues reduced from 35 to 34
- [x] Repository errors remain at 2
- [x] Repository explicit-`any` count remains zero
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 14 — Mechanical lint-error cleanup

Status: **complete**

### Scope

- Removed the repository's two remaining `prefer-const` errors.

### Repository changes

- The Courier dashboard's mutable order-name map binding is now declared with
  `const`; the map contents remain mutable and retain the same behavior.
- The main dashboard's all-time order query binding is now declared with
  `const` because that query is returned without reassignment.

### Verification

- [x] Targeted lint has zero errors
- [x] Repository `prefer-const` count reduced from 2 to 0
- [x] Repository ESLint errors reduced from 2 to 0
- [x] Repository warnings remain at 65
- [x] Files with issues reduced from 34 to 33
- [x] Repository exhaustive-deps and explicit-`any` counts remain zero
- [x] TypeScript
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 15 — Unused-variable remediation, Batch A

Status: **complete**

### Scope

- Removed 20 unused imports and bindings from seven low-risk admin, dashboard,
  landing, and shared-component files.

### Repository changes

- Removed obsolete React hooks, icons, and UI-component imports from the admin
  dashboard, businesses, payments, and storage pages.
- Removed unused imports from the Reports and Landing pages and the shared
  responsive admin table.
- Simplified an admin business-action catch clause that did not consume its
  error value, while preserving the existing user-facing error message.

### Verification

- [x] Targeted lint has zero errors
- [x] Repository unused-variable warnings reduced from 55 to 35
- [x] Repository warnings reduced from 65 to 45
- [x] Files with issues reduced from 33 to 27
- [x] Repository ESLint errors remain at zero
- [x] Exhaustive-deps, explicit-`any`, and `prefer-const` counts remain zero
- [x] TypeScript
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 15 — Unused-variable remediation, Batch B

Status: **complete**

### Scope

- Removed 14 unused imports and bindings from ten order, landing, reporting,
  and courier-support files.

### Repository changes

- Removed obsolete icons, UI components, React hooks, toast helpers, and utility
  imports that were no longer referenced by their components.
- Removed a dead bulk-dispatch order map that was built but never read.
- Removed an unused read-only guard subscription from Order Preview; active
  read-only behavior elsewhere is unchanged.
- Removed unused courier registry imports without changing provider registration
  or dispatch behavior.

### Verification

- [x] Targeted lint has zero errors
- [x] Repository unused-variable warnings reduced from 35 to 21
- [x] Repository warnings reduced from 45 to 31
- [x] Files with issues reduced from 27 to 18
- [x] Repository ESLint errors remain at zero
- [x] Exhaustive-deps, explicit-`any`, and `prefer-const` counts remain zero
- [x] TypeScript
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 15 — Unused-variable remediation, Batch C

Status: **complete**

### Scope

- Removed all 21 remaining unused-variable warnings from 12 application and
  shared-library files.

### Repository changes

- Removed unused registration iteration data and an unreachable registration
  skeleton component.
- Removed stale courier, subscription, and plan-administration derived values
  while preserving their active data flows and form payloads.
- Removed dead invoice styling and legacy template-rendering helpers.
- Simplified unused state bindings, sequence-parser destructuring, read-only
  banner state, and ignored dropdown props without changing current behavior.

### Verification

- [x] Repository unused-variable warnings reduced from 21 to 0
- [x] Repository warnings reduced from 31 to 10
- [x] Files with issues reduced from 18 to 8
- [x] Repository ESLint errors remain at zero
- [x] Exhaustive-deps, explicit-`any`, `prefer-const`, and unused-variable counts are zero
- [x] TypeScript
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 16 — Next.js image remediation

Status: **complete**

### Scope

- Replaced the final ten raw image elements across eight files using the
  bundled Next.js 16 Image guidance.

### Repository changes

- Converted static landing and fallback logos to optimized local Image usage
  with explicit intrinsic dimensions.
- Converted upload previews, receipt previews, and business-provided logos to
  layout-stable Image containers with `unoptimized` passthrough where sources
  are blob URLs, signed URLs, or user-configured remote URLs.
- Preserved light/dark logo switching, object-fit behavior, preview dimensions,
  and image-upload removal overlays.
- Aliased the order-upload framework component to avoid shadowing the browser's
  native `Image` constructor used during client-side compression.

### Verification

- [x] Repository image warnings reduced from 10 to 0
- [x] Repository ESLint reports 0 errors and 0 warnings across 0 files
- [x] TypeScript
- [x] Production build (Next.js 16.2.10; 61 pages generated)

## Milestone 17 — Browser smoke testing, Public and auth guards

Status: **complete for unauthenticated coverage**

### Scope

- Exercised the public landing, about, features, contact, registration, login,
  and password-recovery pages in a real browser session.
- Exercised unauthenticated access to the dashboard and admin entry points.

### Findings and fixes

- Confirmed landing, registration, login, recovery, about, features, and contact
  content renders and exposes the expected navigation and form controls.
- Confirmed the login password-visibility control toggles the input from
  `password` to `text`.
- Confirmed `/dashboard` redirects to `/login?redirect=%2Fdashboard` and
  `/admin` redirects to `/login?redirect=%2Fadmin` when unauthenticated.
- Corrected the landing badge from the Israeli flag to the Sri Lankan flag.
- Added explicit aspect-ratio styles to framework-managed logos, clearing the
  runtime Next.js image warning found during the smoke test.

### Verification

- [x] Fresh landing session reports no browser console errors or warnings
- [x] Correct Sri Lankan landing badge is rendered
- [x] Targeted lint
- [x] TypeScript
- [x] Production build (Next.js 16.2.10; 61 pages generated)
- [x] Authenticated super-admin smoke coverage completed in Milestone 18
- [ ] Authenticated business-user workflows require a separate non-super-admin
  test account

## Milestone 18 — Browser smoke testing, Super Admin

Status: **complete for read-only super-admin coverage**

### Scope

- Exercised every Super Admin navigation destination using the promoted test
  account, without submitting forms or triggering any data-changing actions.
- Verified the role-routing boundary between the business dashboard and the
  Super Admin panel.

### Verified routes

- `/admin`, `/admin/businesses`, `/admin/payments`, `/admin/subscriptions`
- `/admin/plans`, `/admin/trials`, `/admin/notifications`, `/admin/ads`
- `/admin/bug-reports`, `/admin/cleanup`, `/admin/storage`
- `/admin/activity-log`, `/admin/settings`

### Findings

- All routes rendered their expected authenticated content and existing test
  data without browser console errors.
- A direct visit to `/dashboard` correctly redirected the Super Admin account
  to `/admin`, confirming role separation.
- The Storage page displayed its data successfully but needed approximately
  15 seconds to populate during the development-server test. No console error
  accompanied the delay; record this as a performance observation for later
  investigation rather than a functional failure.
- Destructive and state-changing controls (save, delete, approve, reject,
  update, cleanup, notification send, and ad changes) were intentionally not
  exercised during this read-only release smoke test.

### Verification

- [x] Super Admin overview and all navigation destinations render
- [x] Existing businesses, subscriptions, trials, ads, bug reports, storage,
  activity, and settings data can be read
- [x] No browser console errors observed across the tested routes
- [x] Super Admin `/dashboard` access redirects to `/admin`
- [ ] Business dashboard and state-changing workflows require a separate,
  non-super-admin test account and controlled test data

## Milestone 19 — Browser smoke testing, Business User

Status: **complete for read-only business-user coverage**

### Scope

- Removed the test account's Super Admin claim and exercised the authenticated
  business dashboard using its normal business membership.
- Tested all primary business navigation destinations without creating,
  editing, importing, uploading, dispatching, subscribing, or submitting data.

### Verified routes

- `/dashboard`, `/dashboard/orders`, `/dashboard/quotations`
- `/dashboard/products`, `/dashboard/courier`, `/dashboard/inventory`
- `/dashboard/expenses`, `/dashboard/reports`
- `/dashboard/subscription`, `/dashboard/settings`

### Findings and fixes

- Confirmed the normal business dashboard and each primary section render the
  expected Test Business state without browser console errors.
- Confirmed direct `/admin` access by the normal business account redirects to
  `/dashboard`, completing both sides of the role-routing smoke coverage.
- Corrected the fallback sidebar logo's intrinsic dimensions to match the
  source image (`1678 x 2364`). This clears the remaining Next.js development
  warning while preserving its responsive rendered width and aspect ratio.
- Several dashboard navigations needed approximately 15–27 seconds in the
  development server and sometimes reached the browser navigation timeout
  before eventually rendering. No application error accompanied the delay;
  investigate shared authenticated-page loading and development-mode network
  activity as a performance follow-up.

### Verification

- [x] All primary business navigation destinations render
- [x] No fresh browser console errors or warnings after the logo correction
- [x] Normal business-user `/admin` access redirects to `/dashboard`
- [x] Targeted sidebar lint
- [x] TypeScript
- [ ] State-changing business workflows require controlled test data and
  explicit mutation coverage

## Milestone 20 — Authenticated performance validation

Status: **complete for release-blocker triage**

### Scope

- Re-measured authenticated route readiness using real sidebar navigation
  instead of full-page automation waits.
- Compared cold and warm development navigation with an optimized production
  build running against the same test account and Supabase project.

### Findings

- The previously recorded 15–27 second values combined a fixed test delay with
  the browser driver's full-page navigation timeout and overstated user-visible
  loading time.
- Cold development visits took approximately 4–11 seconds because Next.js was
  compiling routes on demand. Warm development visits generally completed in
  approximately 0.6–3.3 seconds.
- The production dashboard became ready in approximately 1.4 seconds.
- Production route content completed in approximately 0.46–4.52 seconds on the
  first measured traversal, with no browser console errors or warnings.
- Orders improved to approximately 1.1 seconds on a repeated traversal;
  Courier and Subscription remained near 3.3 seconds and are suitable for
  later query-level profiling, but neither is a release-blocking failure.
- No speculative loading rewrite was made because the evidence identified
  development compilation and test methodology as the main source of the
  original alert.

### Environment notes

- The production build initially could not download configured Google Fonts
  inside the restricted sandbox. With normal network access it compiled
  successfully and generated all 61 pages.
- A sandboxed production server could not reach Supabase (`EACCES`); the valid
  measurements were taken after allowing the server normal network access.
- After testing, the production server was stopped, the generated `.next`
  cache was cleared, and the development server was restored successfully.

### Verification

- [x] Production build (Next.js 16.2.10; 61 pages generated)
- [x] Authenticated production dashboard ready in approximately 1.4 seconds
- [x] All primary production dashboard routes render
- [x] No production browser console errors or warnings
- [x] Development server restored; `/login` returns HTTP 200
- [ ] Profile Courier and Subscription queries later if tighter performance
  targets are required

## Milestone 21 — Business role terminology

Status: **complete**

### Scope

- Removed user-facing ambiguity between the business-level `admin` role and
  the platform-level Super Admin role.
- Preserved the existing database role values and authorization behavior.

### Changes

- Business users stored with the `admin` database role are now displayed as
  **Business Manager** in dashboard badges, Team settings, invitations, role
  selection, promotion feedback, and public feature copy.
- Business permission errors now refer to the **business owner or Business
  Manager** instead of the ambiguous owner/admin wording.
- API and database documentation explain the user-facing term while retaining
  the internal `admin` value required by existing schema and policies.
- Super Admin terminology and authorization were not changed.

### Verification

- [x] Targeted ESLint
- [x] TypeScript
- [x] Team invitation selector displays `Business Manager — Full access
  (except billing)`
- [x] No standalone `Admin` label remains in the verified business Team UI
- [x] Browser console reports no errors or warnings

## Milestone 22 — Team invitation migration review

Status: **repository review complete; staging verification pending**

### Scope

- Reviewed migration 040 against migration 027, the current profile/business
  schema, invitation Route Handlers, and server-side team authorization.
- Did not connect to or mutate a staging or production database.

### Findings

- Migration 040 correctly requires `auth.uid()`, binds pending-invitation
  discovery to the authenticated email, binds acceptance to both the
  authenticated user ID and email, locks the invitation row during acceptance,
  rejects expired/used tokens, blocks membership transfer across businesses,
  and revokes anonymous/public RPC execution.
- The migration could overwrite the role of an existing same-business profile
  with the invitation role. A redundant invitation could therefore downgrade
  an Owner or Business Manager.

### Remediation

- Added migration 043 to retain all migration-040 identity checks while making
  same-business role transitions promotion-only: Owner remains Owner, Business
  Manager remains Business Manager, and Member can be promoted to Business
  Manager.
- Detached profiles and new users still adopt the role carried by a valid
  invitation.
- Historical migration 040 was not edited, and no migration was applied.

### Staging verification still required

- [ ] Apply migrations 040 and 043 in order to staging
- [ ] Verify anonymous calls to both invitation RPCs are rejected
- [ ] Verify another authenticated email cannot discover or accept the token
- [ ] Verify another authenticated user ID cannot accept the token
- [ ] Verify a user belonging to another business cannot accept the token
- [ ] Verify a new user can accept Member and Business Manager invitations
- [ ] Verify a same-business Member can be promoted to Business Manager
- [ ] Verify Owner and Business Manager roles cannot be downgraded by accepting
  a redundant invitation
- [ ] Verify concurrent acceptance marks the invitation accepted exactly once

## Milestone 23 — Notification delivery migration review

Status: **repository remediation complete; staging verification pending**

### Scope

- Reviewed migration 041 against the notification schema and functions from
  migrations 024–025, the current Super Admin authorization helper, and the
  manual broadcast-delivery Route Handler.
- Did not connect to or mutate a staging or production database.

### Findings

- Migration 041 correctly groups the scheduled-expiry predicate, processes only
  due scheduled broadcasts, uses `FOR UPDATE SKIP LOCKED` between cron workers,
  performs exact selected-business matching, and removes browser-role execution
  from internal `SECURITY DEFINER` notification helpers.
- Manual delivery still performed its recipient check, notification inserts,
  recipient inserts, and status update as separate requests. Two simultaneous
  manual requests—or a manual request racing the scheduled worker—could both
  deliver the same broadcast.

### Remediation

- Added migration 044 with service-role-only
  `deliver_notification_broadcast(UUID)`.
- The function locks the broadcast row for the complete delivery transaction,
  rechecks status and prior recipients after acquiring the lock, validates a
  selected audience, creates notifications and recipient records, then marks
  the broadcast sent atomically.
- Updated the manual delivery API to invoke that function after its existing
  verified Super Admin check. Audit logging remains best-effort after a
  successful delivery.
- Historical migration 041 was not edited, and no migration was applied.

### Repository verification

- [x] Full ESLint run
- [x] TypeScript (`tsc --noEmit`)
- [x] Migration 044 denies PUBLIC, anonymous, and authenticated execution
- [x] Migration 044 grants execution only to `service_role`
- [x] Manual and scheduled paths coordinate through the same broadcast-row lock

### Staging verification still required

- [ ] Apply migrations 041 and 044 in order to staging
- [ ] Verify anonymous and normal authenticated users cannot execute internal
  notification functions or the atomic delivery function
- [ ] Verify an authenticated non-Super-Admin receives 403 from Send Now
- [ ] Verify a Super Admin can deliver every supported audience type
- [ ] Verify an empty or malformed selected audience is rejected
- [ ] Fire two simultaneous Send Now requests and verify exactly one succeeds
- [ ] Race Send Now against the scheduled worker and verify one recipient per
  target business and one final `sent` transition
- [ ] Verify a zero-match audience is marked sent with recipient count zero

## Environment safety note — 2026-08-03

- The project currently configured in `.env.local` was confirmed by the owner
  as the real database intended for future public users.
- It is therefore treated as the production database, not as staging.
- Migrations 040, 041, 043, and 044 were **not** applied to that database.
- A separate staging Supabase project must be created and configured before the
  pending migration and concurrency/security test matrix can be executed.

## Milestone 24 — Clean staging bootstrap

Status: **core invitation, broadcast, and role-guard behavior verified**

### First bootstrap attempt

- Confirmed the external-browser project is `BizRavana Staging`, is separate
  from the configured production project, and initially has zero public tables.
- Loaded migrations 001–044 as one ordered transaction in the staging SQL
  Editor. The transaction failed at migration 027 and rolled back completely;
  a follow-up query confirmed the public table count remained zero.
- Root cause: migration 027 created `SECURITY DEFINER` functions with an empty
  `search_path` but referenced public tables without schema qualification.
- Qualified those function-body references with `public.` so a clean database
  can compile the historical invitation functions. Later migrations 040 and
  043 still replace them with the hardened implementations.
- Production was not accessed or changed.

### Successful bootstrap and schema verification

- Re-ran migrations 001–044 from the repaired repository source as one ordered
  transaction against `BizRavana Staging`; the transaction committed.
- Verified 34 public tables, six Storage buckets, and two cron jobs.
- Verified all required representative tables exist and no public table has RLS
  disabled.
- Verified both invitation RPCs, both notification-delivery RPCs, and the
  migration-042 unified Message Template context constraint exist.
- Verified anonymous users cannot execute invitation acceptance or atomic
  broadcast delivery; normal authenticated users cannot execute atomic
  delivery; `service_role` can execute it.
- The batch was applied through the Supabase SQL Editor because the temporary
  CLI installer was unavailable. Before future CLI-driven pushes, remote
  migration-history rows must be reconciled with the 001–046 files.

### Behavioral staging verification

- [x] Configure a staging-only local environment without replacing production
  `.env.local`
- [x] Create disposable staging Super Admin and business-user accounts
- [x] Run invitation identity, role-preservation, and concurrent-acceptance tests
- [x] Run manual/scheduled broadcast concurrency tests
- [x] Verify a normal business member is redirected away from `/admin`
- [x] Verify a staging Super Admin claim can open `/admin`
- [x] Record cleanup of disposable staging data

### Behavioral evidence (2026-08-03)

- Invitation security and concurrency script: 17/17 checks passed.
- Broadcast delivery and concurrency script: 13/13 checks passed.
- Authenticated non-admin Admin API matrix: 5/5 checks passed.
- Automatic-notification worker runtime check passed after migration 046.
- The first broadcast run reproduced a runtime schema-resolution failure in
  `create_business_notification`; migration 045 repaired it and the full
  broadcast matrix then passed.
- Staging project credentials remain in an ignored staging-only local file.
  Production `.env.local` and the production Supabase project were not changed.
- After verification, the six disposable Auth users, both test businesses, and
  their dependent staging records were removed. The generated local test-user
  credential file was also deleted; only the ignored staging project
  configuration remains.

## Milestone 25 — Distributed login and callback rate limiting

Status: **repository and staging verification complete; provider WAF pending**

### Scope and implementation

- Added a database-backed fixed-window limiter shared atomically by every
  application instance. It stores SHA-256 hashes rather than raw account or
  client-address values and removes counters older than 24 hours hourly.
- Restricted the counter table and `consume_request_rate_limit` RPC from
  anonymous and authenticated browser roles; only the server service role can
  consume limits.
- Routed both hydrated and native-form login through `/api/login`, removing the
  browser-side path that could bypass application rate limiting.
- Enforced 10 login attempts per normalized account and 30 per client address
  in 15 minutes. JSON clients receive `429` and `Retry-After`; the native form
  retains `303 See Other` and stable error codes.
- Enforced 120 PayHere callback requests per client address per minute before
  callback payload parsing. Oversized callbacks still return `413` before the
  limiter/database path.
- The limiter fails closed with `503` when its shared persistence layer is
  unavailable.

### Migration evidence

- Applied migration 048 to `BizRavana Staging` only.
- The first runtime call exposed a collision between the PL/pgSQL variable
  `current_time` and SQL `CURRENT_TIME`; migration 049 replaced it with
  unambiguous `v_*` variables.
- The next runtime call exposed that PostgreSQL's `GREATEST` conditional
  expression cannot be schema-qualified; migration 050 installed the final
  working implementation.
- Updated migration 048 as well so a clean database bootstrap receives the
  corrected implementation directly. Migrations 049–050 remain ordered,
  idempotent repair evidence for the staging history.

### Staging verification (2026-08-03)

- [x] Distributed limiter matrix passed 10/10 checks
- [x] Twelve simultaneous calls allowed exactly five against a five-request
  budget and rejected the other seven
- [x] Independent scopes and hashed keys remained isolated
- [x] Anonymous RPC execution and table reads were denied
- [x] Valid JSON login returned the authorized redirect and Supabase session
  cookies
- [x] The eleventh account login attempt returned `429` with `Retry-After`
- [x] Native-form login retained its `303` behavior and stable error code
- [x] Oversized login body returned `413` before parsing
- [x] PayHere callback overflow returned `429` before payload processing
- [x] Existing PayHere security/concurrency matrix still passed 13/13 checks
- [x] Disposable hashed counters, Auth user, business, payment, notification,
  and audit fixtures were removed
- [x] Full ESLint and TypeScript validation passed
- [x] Next.js 16.2.10 production build passed and generated 61 pages
- [x] Production `.env.local`, production Supabase, and PayHere production were
  not changed

### Remaining infrastructure boundary

- Database-backed limits protect application work across multiple instances,
  but do not absorb volumetric traffic before it reaches the app/database.
- Configure a hosting-provider/WAF rule after the production host and trusted
  proxy-header behavior are finalized.

## Milestone 26 — Upload signatures and same-origin mutation guard

Status: **repository and staging verification complete**

### Scope and implementation

- Added a centralized Proxy guard for all state-changing `/api/*` requests.
  Requests must supply an Origin matching the application origin. The signed
  PayHere notify callback is explicitly exempt because the gateway calls it
  without a browser Origin header.
- Added server-side magic-byte detection for JPEG, PNG, WEBP, GIF, AVIF, and
  PDF files. Claimed MIME and detected type must match before upload.
- Routed profile avatars, business logos, order images, Super Admin avatars,
  and dashboard-ad artwork through `/api/uploads`. The server derives user and
  business folders from the verified session; branding changes require Owner
  or Business Manager and admin purposes require the Super Admin claim.
- Applied the same signature validation to bank-transfer receipts and private
  bug-report screenshots.
- Added migration 051 to remove direct browser writes to profile images, order
  images, and dashboard ads. It keeps payment proofs private and aligns their
  allowlist with verified JPG, PNG, WEBP, and PDF receipts.
- The app-generated private cloud-backup JSON remains a direct Storage write;
  it is not user-supplied binary content and remains business-folder scoped by
  its dedicated RLS policy.

### Staging verification (2026-08-03)

- [x] Applied migration 051 to `BizRavana Staging` only through SQL Editor
- [x] Upload/Origin security matrix passed 12/12 checks
- [x] Cross-origin and missing-Origin mutations returned `403`
- [x] Same-origin requests reached their handlers
- [x] PayHere callback remained Origin-exempt and signature-authoritative
- [x] Spoofed content and claimed-MIME/signature mismatch returned `400`
- [x] Valid PNG uploaded only to the server-derived authenticated-user folder
- [x] Direct authenticated Storage upload was denied
- [x] Normal user was denied the dashboard-ad upload purpose
- [x] Authorized server-side delete remained folder-scoped
- [x] Payment proofs remained private and accepted PDF MIME
- [x] Distributed rate-limit matrix still passed 10/10 checks
- [x] PayHere callback security/concurrency matrix still passed 13/13 checks
- [x] Full ESLint and TypeScript validation passed
- [x] Next.js 16.2.10 production build passed and generated 62 pages
- [x] Disposable Auth user and uploaded test object were removed
- [x] Production `.env.local` and production Supabase were not changed

## Milestone 27 — Permanent regression runner and CI definition

Status: **local implementation verified; remote branch protection pending**

### Implementation

- Added `npm test`, a cross-platform Node test launcher, and five secret-free
  repository contract checks covering sequential migrations, migration
  documentation, same-origin mutation protection, upload-signature boundaries,
  and required CI stages.
- Added `npm run test:staging`, which verifies the dedicated staging identity,
  requires the port-3001 staging app, creates the shared disposable fixtures,
  executes all eight staging security scripts, and attempts fixture cleanup in
  a `finally` path.
- Added `npm run typecheck`, `npm run staging:start`, and the combined
  `npm run quality` gate.
- Added `.github/workflows/release-quality.yml` for pull requests and pushes to
  `main`. It uses Node.js 24, locked installation, read-only repository
  permission, inert build-time environment values, concurrency cancellation,
  and a 20-minute timeout.
- Documented local, staging, and CI usage in `QUALITY_GATES.md`. Real staging
  and payment credentials are not stored in GitHub Actions.

### Verification (2026-08-03)

- [x] Secret-free repository suite passed 5/5 checks
- [x] Aggregate staging runner passed invitation 17, broadcast 13, Admin API 5,
  automatic worker 1, Message Template 22, PayHere 13, rate-limit 10, and
  upload/Origin 12 checks
- [x] Aggregate runner removed its disposable fixture manifest and staging data
- [x] A simulated transient network failure stopped the runner and still
  completed fixture cleanup before the clean rerun
- [x] `npm run quality` passed ESLint, TypeScript, repository tests, and the
  Next.js 16.2.10 production build with 62 generated pages
- [x] Production `.env.local`, production Supabase, and PayHere production were
  not changed

### Remaining remote activation

- The workflow file has not been staged, committed, or pushed.
- GitHub cannot expose the `quality` status check until the workflow runs
  remotely at least once. After that, protect `main` and require `quality`
  before merging.

## Milestone 28 — Production migration readiness audit

Status: **read-only drift audit complete; deployment blocked by missing backup**

- Confirmed `.env.local` targets the `BizRavana` production Supabase project
  `htcqkdajlhvkspsmwyfk` without displaying credentials.
- Confirmed the project is healthy, but the Free plan dashboard reports
  **No backups** and states that scheduled backups are not included.
- Ran a read-only SQL audit for unique function, constraint, permission, table,
  policy, and bucket markers introduced by migrations `040–051`.
- All twelve migrations returned `missing_or_drifted`; none was applied.
- The dashboard also reports no migration-history entries because historical
  changes were deployed through SQL Editor rather than the CLI.
- Recorded the full result and safe backup options in
  `PRODUCTION_MIGRATION_READINESS.md`.
- A partial `040–046` deployment was rejected because the current application
  also depends on `047–051`.
- Production data, schema, Auth users, Storage objects, `.env.local`, and
  PayHere configuration were not changed.
- The direct database host was unreachable from the workstation's IPv4 network.
  The exact dashboard-provided session pooler was reachable, but the database
  password stored in `.env.local` failed authentication. No password was read
  from the browser or printed.
- A pgAdmin client-tool installation stalled without installing and its exact
  package-manager process was stopped. No PostgreSQL server was installed.

## Milestone 29 — Production deployment of 027 and 040–051

Status: **applied and verified in production (2026-08-14)**

### Prerequisite repair discovered during deployment

- The read-only drift audit (Milestone 28) checked only `040–051` markers and
  therefore did not reveal that **migration 027 was never applied to
  production**. Migration 040 fails without `public.team_invitations`.
- Production has no `supabase_migrations` schema (no CLI history), consistent
  with historical SQL Editor deployments.
- A full production table inventory showed every other migration-created table
  already present; `team_invitations` was the single missing object.
- Migration `027_add_team_invitations.sql` was reviewed (self-contained:
  table, indexes, RLS, policies, two RPCs) and applied first. Its policy
  dependencies (`get_user_business_id`, `is_super_admin`) were confirmed
  present before running.

### Deployment facts

- Connected through the IPv4 session pooler
  (`aws-0-ap-southeast-2.pooler.supabase.com:5432`, user
  `postgres.<ref>`). The direct `db.<ref>.supabase.co` host still resolves to
  no record from this workstation (IPv6-only).
- The user-supplied production database password authenticated successfully;
  the password embedded in `.env.local` remains stale (13-char value fails).
- A pre-migration logical data backup was created and verified at
  `~/bizravana-backups/bizravana-prod-20260814-pre-migration.sql`
  (154 INSERTs, 34 tables, 0.22 MB, valid BEGIN/COMMIT structure).
- Applied, each wrapped in an explicit transaction (except 048, already
  present): **027**, then **040, 041, 042, 043, 044, 045, 046, 047, 049,
  050, 051**.
- **048 was already fully applied in production** (table, RLS, both rate-limit
  functions, and the hourly `cleanup-request-rate-limits` cron job), so it was
  skipped; 049 and 050 were still applied to guarantee the final function
  definition.

### Verification

- Object-marker audit (13 markers incl. content-level checks for 041, 042,
  045, 046, 050, 051): all **APPLIED**.
- Functional smoke tests as `postgres`:
  - `consume_request_rate_limit` returned `allowed=true, remaining=2` (limit 3)
  - `soft_delete_message_template` callable, returned `false` for a bogus UUID
  - `deliver_scheduled_broadcasts` ran and delivered 0 (no due broadcasts)
  - `get_pending_invitations` and `accept_invitation` exist
  - Anonymous call of `get_pending_invitations` was rejected with
    `Authentication required`
  - Direct-write Storage policies are gone; only read policies remain
  - `payment-proofs` bucket: private, 5 MB limit, JPEG/PNG/WEBP/PDF allowlist
- Smoke-test rate-limit row was deleted after the test.
- Production data was not otherwise modified; the logical backup is the
  recovery point.
