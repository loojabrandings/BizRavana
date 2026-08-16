# Annual Subscription Implementation — Tracking Doc

Status: **Implemented + staging-verified** · Started 2026-08-15
Scope: add yearly (annual) billing alongside the existing monthly subscription
without changing monthly pricing or the monthly flow.

---

## 1. What was built

Businesses can now buy any paid plan (Basic / Standard / Premium) with a
**monthly** or **yearly** billing period:

| Plan    | Monthly | Yearly  | Monthly equivalent | Saving |
|---------|---------|---------|--------------------|--------|
| Basic   | Rs. 1,250 | Rs. 12,000 | Rs. 1,000 | Rs. 3,000 |
| Standard| Rs. 2,450 | Rs. 23,400 | Rs. 1,950 | Rs. 6,000 |
| Premium | Rs. 4,450 | Rs. 42,000 | Rs. 3,500 | Rs. 11,400 |

Yearly prices mirror the marketing site's `/pricing` page (2 months free on
the annual commitment). Trial and Enterprise remain non-payable.

### Term rules (renewal stacking)

- **Monthly → monthly** (same plan, still active): extends the end date by
  **30 days** from the current end — exactly as before.
- **Yearly → yearly** (same plan, still active): extends the end date by
  **1 year** from the current end.
- **Switching monthly ↔ yearly** (same plan): starts a **fresh 1-year or
  30-day term** from the payment date (no stacking across periods).
- **Plan change / expired / first purchase**: fresh term from the payment date.

This applies to both PayHere card payments and admin-approved bank transfers.
The single source of truth for this math is the SQL helper
`public.plan_subscription_term(...)` in migration 052.

### Database (migration `052_add_annual_subscriptions.sql`)

| Change | Detail |
|---|---|
| `subscription_plans.yearly_price` | `DECIMAL(10,2) NOT NULL DEFAULT 0`; seeded 12,000 / 23,400 / 42,000 (0 = not offered) |
| `businesses.billing_period` | `TEXT` nullable, `CHECK IN ('monthly','yearly')`; backfilled `'monthly'` for existing active paid subscriptions; `NULL` = no paid term yet (treated as monthly) |
| `payhere_payments.billing_period` | `TEXT NOT NULL DEFAULT 'monthly'` with CHECK — records which period a checkout paid for |
| `payment_proofs.billing_period` | Same, for bank-transfer receipts |
| `plan_subscription_term(...)` | New helper: stacking vs fresh-term decision (see above) |
| `complete_payhere_payment(...)` | Now takes `p_billing_period` (9-arg signature); sets `businesses.billing_period`; audit/notification payloads include the period; legacy 8-arg signature dropped |
| `create_bank_transfer_payment(...)` | Now takes `p_billing_period`; charges `yearly_price` for yearly receipts; legacy 5-arg signature dropped |
| `review_bank_transfer_payment(...)` | Approve uses `plan_subscription_term`; sets `businesses.billing_period`; audit/notification payloads include the period |

**Decisions taken**

- **`billing_period` lives on `businesses`** (the current term) so renewal
  stacking can tell a monthly renewal from a period switch without guessing.
- **Stacking requires the same billing period** — per the requirement,
  "switching from monthly to yearly starts a fresh 1-year term".
- **The callback payload never carries the period**; it is read from the
  payment row created at checkout (mirrors the existing amount/currency
  trust model — never trust the callback).
- **Monthly behaviour is byte-for-byte preserved**: default `billing_period`
  is `'monthly'`, monthly renewals stack 30 days exactly as before, and the
  monthly price is unchanged.

### Code changes

| File | Change |
|---|---|
| `src/types/database.ts` | New columns + updated RPC arg types |
| `src/app/api/payments/payhere/initiate/route.ts` | Accepts `billingPeriod`; picks `monthly_price`/`yearly_price`; item name `… Plan - 30 Days` / `… Plan - 1 Year`; stores and returns the period |
| `src/app/api/payments/payhere/notify/route.ts` | Passes the stored `billing_period` to the activation RPC |
| `src/app/api/payments/bank-transfer/route.ts` | Accepts `billingPeriod` form field; charges the right price; passes period to the RPC |
| `src/app/(dashboard)/dashboard/subscription/page.tsx` | **Pricing Plans section redesigned** — four plan cards (no feature table), a Monthly/Yearly toggle at the section top, and a "See full plan comparison" link to the marketing `/pricing` page. The chosen period + plan travel to checkout via `?billing=monthly|yearly`. Hero shows the current billing period ("Yearly plan" pill) and the matching price; bank-transfer dialog keeps its period selector + period-aware amounts; payment history shows the period |
| `src/app/(dashboard)/dashboard/subscription/payment/payment-page-client.tsx` | **Toggle removed from checkout** — the billing period now comes from the subscription page through the URL (`?billing=monthly|yearly`); the order summary shows a read-only "Billing period" line, period-aware plan dropdown, total, term label ("30-day subscription" / "1-year subscription") and yearly saving line |
| `src/app/(site)/pricing/page.tsx` + `src/components/pricing-plans.tsx` | Plan CTAs wired auth-aware: registered users land on `/dashboard/subscription`; everyone else goes to `/register` |
| `src/app/admin/plans/page.tsx` | Yearly price field in the plan form; both prices in table + mobile card |
| `src/app/admin/subscriptions/page.tsx` | Billing period shown per subscription; change-plan dialog lists both prices |
| `src/app/admin/businesses/[id]/page.tsx` | Billing period + yearly price in the subscription card and change-plan dialog |
| `src/app/admin/payments/page.tsx` | Billing period on rows, review dialog and mobile card |
| `README.md`, `DATABASE_SCHEMA.md`, `RELEASE_ROADMAP.md` | Migration-range references bumped to 052 (required by the repo integrity test) |

---

## 2. Step-by-step tracker

- [x] **Audit** — read `/pricing`, payment routes, activation functions, admin screens. Monthly flow identified and left untouched.
- [x] **Migration 052 written** — yearly_price + billing_period columns, helper, three RPC updates, seed prices, legacy signature drops.
- [x] **Types updated** (`src/types/database.ts`) — `npm run typecheck` clean.
- [x] **PayHere routes updated** (initiate + notify) — item labels, amounts, stored period.
- [x] **Bank-transfer route + RPCs updated** — period-aware amounts and activation.
- [x] **Checkout order summary (period-aware)** in `payment-page-client.tsx`.
- [x] **Dashboard subscription page** — hero period pill, bank-transfer dialog period selector, history labels.
- [x] **Pricing Plans section redesign** — 4 plan cards (no features), billing toggle moved here from checkout, plan+period carried to the payment page via URL, "See full plan comparison" → `/pricing`.
- [x] **Marketing `/pricing` CTAs wired** — registered users → `/dashboard/subscription`; not registered → `/register`.
- [x] **Admin screens** — plans, subscriptions, business detail, payments show period + yearly prices.
- [x] **Staging migration history baselined** (001–051 recorded; 052 was re-recorded and applied for real).
- [x] **052 applied to staging** (backup taken at `backups/bizravana-pre-migration-*.sql`), columns/prices/functions verified via SQL.
- [x] **Staging test: annual subscription matrix** — 6 checks (see §3).
- [x] **Staging test: PayHere callback security** — 13 checks, all pass with the new RPC.
- [x] **Staging test: checkout initiate** — 4 checks (yearly amount/label, monthly amount/label, default period, stored rows).
- [x] **Card Payment option re-enabled for the sandbox pass** — the security release (`a1914b6`) had gated the UI button; backend was already fully wired and passing all 13 callback-security checks, so the button was restored (mirrors the Bank Transfer button styling). See the note in §4.
- [ ] **Manual PayHere sandbox UI pass** (requires a human + browser; steps in §4).
- [x] **Production migration 052 applied (2026-08-15)** — the live site was showing `column businesses.billing_period does not exist` on `/admin/subscriptions` because the new code was running against a production DB that still had the pre-052 schema. `npm run migrate:dry-run` confirmed 1 pending; `npm run migrate` applied it with an automatic backup (`backups/bizravana-pre-migration-2026-08-15T13-15-50-415Z.sql`, 35 tables). Verified: all four columns present, prices seeded (Basic 12,000 / Standard 23,400 / Premium 42,000), active paid business backfilled to `monthly`, and the previously-failing REST queries now return 200.
- [ ] **Post-production verification** (checklist in §5).

---

## 3. Automated staging verification (completed 2026-08-15)

Scripts (all refuse to run outside the staging project):

| Script | What it proves |
|---|---|
| `scripts/staging/test-annual-subscription.mjs` | yearly price seeded; monthly = fresh 30-day term; monthly→yearly switch = fresh 1-year term; yearly renewal stacks +1 year; yearly bank receipt charges yearly price; approved yearly bank transfer stacks +1 year |
| `scripts/staging/test-payhere-callback-security.mjs` | full callback matrix still green with the new 9-arg activation RPC (invalid signature/amount/currency/merchant rejected without mutation, concurrency idempotent, replay safe) |
| `scripts/staging/test-checkout-initiate.mjs` | initiate route: yearly → `Plan - 1 Year` + yearly amount; monthly → `Plan - 30 Days` + monthly amount; unknown period defaults monthly; stored rows carry period + amount |

Both new scripts are registered in `scripts/staging/run-security-regression.mjs`
so `npm run test:staging` covers them.

Local gates: `npm run typecheck` ✅ · `npm test` ✅ (5/5).

---

## 4. Manual PayHere sandbox test plan (staging)

Setup: run the staging server (`npm run staging:start` → http://localhost:3001)
and sign in with a staging business account. Open
`/dashboard/subscription/payment?plan=<plan-id>`, pick **Card Payment**.

> **Note (2026-08-15):** the Card Payment button had been gated off since the
> security release (`a1914b6`) with a plain `disabled` + "Unavailable" label.
> The PayHere backend was complete and passing all 13 callback-security
> checks, so the button was re-enabled in the working tree to run this sandbox
> pass — selecting it now shows the customer-details form and activates the
> "Continue to PayHere" button. If you are NOT testing card payments, keep the
> button gated until production go-live review.

Sandbox test cards (from
<https://support.payhere.lk/sandbox-and-testing>) — name/CVV/expiry can be any
valid values:

| Scenario | Card | Expected result |
|---|---|---|
| Success | Visa `4916 2175 0161 1292` · MC `5307 7321 2553 1191` · AMEX `3467 8100 5510 225` | Payment succeeds; subscription activated |
| Insufficient funds | Visa `4024 0071 9434 9121` · MC `5459 0514 3377 7487` · AMEX `3707 8771 1978 928` | Declined; status shows failure |
| Limit exceeded | Visa `4929 1197 9936 5646` · MC `5491 1822 4317 8283` · AMEX `3407 0181 1823 469` | Declined |
| Do not honor | Visa `4929 7689 0083 7248` · MC `5388 1721 3736 7973` · AMEX `3746 6417 5202 812` | Declined |
| Network error | Visa `4024 0071 2086 9333` · MC `5237 9805 6518 5003` · AMEX `3734 3350 0205 887` | Error handled gracefully |

### Manual test matrix (tick off)

- [ ] **Monthly success** — on `/dashboard/subscription` set the Pricing Plans toggle = Monthly, pick a plan → checkout shows "Monthly" + Rs. 1,250; pay success card → ends at +30 days, billing shows "Monthly plan", order summary "30-day subscription".
- [ ] **Yearly success** — on `/dashboard/subscription` set the toggle = Yearly, pick a plan → checkout shows "Yearly" + Rs. 12,000; pay success card → ends at +1 year, billing shows "Yearly plan", order summary "1-year subscription", total = yearly price with "Save Rs. …".
- [ ] **Toggle moved** — `/dashboard/subscription/payment` no longer has a Monthly/Yearly toggle; opening it directly without `billing` defaults to monthly, and the subscription page's selected period is what checkout charges.
- [ ] **Yearly renewal stacking** — make a second yearly payment while active → end date extends by exactly 1 year from the previous end.
- [ ] **Monthly → yearly switch** — while on monthly, pay yearly → fresh 1-year term (does NOT stack on the monthly remainder).
- [ ] **Decline cards** — each decline card shows a failed payment without activating the subscription.
- [ ] **Pricing Plans section** — toggle flips the four plan cards' prices (monthly Rs. 1,250/2,450/4,450 vs yearly 12,000/23,400/42,000 with "Save Rs. …" lines), no features listed, "See full plan comparison" opens the marketing `/pricing` page.
- [ ] **Marketing `/pricing` CTAs** — logged out → `/register`; logged in → `/dashboard/subscription` (not the payment page directly).
- [ ] **Admin screens** — `/admin/plans` shows both prices; `/admin/subscriptions`, `/admin/businesses/<id>`, `/admin/payments` show the billing period and yearly amounts.
- [ ] **Bank transfer yearly** — in the subscription page's "Pay by Bank Transfer" dialog pick Yearly → amount shown = yearly price; admin approval in `/admin/payments` activates a 1-year term.

---

## 5. Deployment checklist

### Staging → production

1. **Merge/review the diff** — migration `052`, `src/types/database.ts`, payment routes, checkout UI, dashboard page, admin screens, staging tests, this doc.
2. **Backup production** — run the migration runner's automatic logical backup
   (`npm run migrate` writes `backups/bizravana-pre-migration-*.sql`). If the
   production `DATABASE_URL` password is still stale, supply the current
   session-pooler URL as before (see `PRODUCTION_MIGRATION_READINESS.md`).
3. **Apply migration** — `npm run migrate:dry-run` first, then
   `npm run migrate` against production (`--env .env.local`). Verify the
   output shows exactly `052_add_annual_subscriptions.sql` applied and the
   backup file was written.
4. **Verify DB** — yearly prices present (Basic 12000 / Standard 23400 /
   Premium 42000), `billing_period` columns exist, only the new function
   signatures remain (`pg_get_function_identity_arguments`), active paid
   businesses backfilled to `'monthly'`.
5. **Deploy code** — ship the branch to the production host (build + restart
   the Next.js service). There is no separate service to restart for the DB
   functions — they live in the database.
6. **Post-deploy smoke checks (production, ideally a real user):**
   - [ ] `/pricing` still renders with the Monthly/Yearly toggle; clicking a plan CTA routes logged-in users to `/dashboard/subscription` and guests to `/register`.
   - [ ] `/dashboard/subscription` Pricing Plans section shows the four plan cards (no features), the billing toggle, and "See full plan comparison" → `/pricing`.
   - [ ] Picking Monthly + a plan opens checkout with a Monthly billing line; order summary is unchanged (Rs. 1,250 / 2,450 / 4,450, "30-day subscription").
   - [ ] Picking Yearly + a plan opens checkout with a Yearly billing line and shows 12,000 / 23,400 / 42,000 and "1-year subscription".
   - [ ] Checkout itself has no Monthly/Yearly toggle (period comes from the URL).
   - [ ] Admin `/admin/plans` shows yearly prices; a subscription row shows the billing period.
   - [ ] Payment history for an old monthly payment still renders.

### Rollback plan

- **Database** — the migration is a single reversible-ish transaction:
  restore `backups/bizravana-pre-migration-<timestamp>.sql` via
  `psql "$DATABASE_URL" -f <file>` if a functional regression appears.
  Alternatively, and safer while keeping data: `ALTER TABLE … DROP COLUMN
  yearly_price / billing_period` and `DROP FUNCTION plan_subscription_term`
  + re-`CREATE OR REPLACE` the pre-052 functions from git history (migration
  028 / 032) — monthly flows only touch the dropped columns' defaults, so the
  old code paths remain compatible.
- **Code** — revert to the previous release commit and restart the service.
  Because monthly checkouts continue to store `billing_period='monthly'`, a
  code rollback does not break existing data; any yearly rows created before
  rollback simply remain yearly until reconciled.

---

## 6. New UI components (internal reference)

### Pricing Plans section (`subscription/page.tsx`)

- Four plan cards (Basic / Standard / Premium / Enterprise) with icon, name,
  price for the selected period, "Most Popular" / "Current" badges and a CTA.
  No feature lists — the full comparison lives on the marketing `/pricing` page.
- Monthly/Yearly segmented toggle at the section top ("Save 20%" pill on
  Yearly); the selected period is sent to checkout as `?billing=monthly|yearly`.
- "See full plan comparison" button links to the marketing `/pricing` page.

### Checkout billing summary (`payment-page-client.tsx` → `OrderSummary`)

- No toggle anymore: the billing period arrives via the URL query param and
  is shown as a read-only "Billing period" line.
- Period-aware plan dropdown (re-filtered to plans that have the chosen
  period's price), total, term label (`30-day subscription` vs
  `1-year subscription`) and a green "Save Rs. X" line when yearly.

### Dashboard bank-transfer period selector (`subscription/page.tsx`)

- Monthly / Yearly card buttons in the "Pay by Bank Transfer" dialog; the
  plan dropdown and "Amount to transfer" block follow the selected period
  ("30 days" vs "1 year").
- Submitted as `billingPeriod` in the multipart form to
  `/api/payments/bank-transfer`.

### Hero billing pill (`subscription/page.tsx`)

- "Monthly plan" / "Yearly plan" pill next to the status badge for active
  subscriptions; the price line uses the matching period's price and suffix.

### Admin plan pricing (`admin/plans/page.tsx`)

- Yearly price field (`yearly_price`, 0 = not offered) in the plan dialog;
  table and mobile cards list `Rs. X/mo · Rs. Y/yr`.
