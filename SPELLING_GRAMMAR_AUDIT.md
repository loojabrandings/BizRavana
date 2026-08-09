# BizRavana — Spelling & Grammar Audit

**Audit date:** 2026-08-02
**Scope:** All user-facing text in `src/**/*.tsx` and `src/**/*.ts` — marketing pages, auth pages, dashboard pages, admin pages, shared components, PDF documents, WhatsApp templates, and API error messages.
**Change policy:** Read-only. No files, styles, or behavior were changed. This document records findings only.

---

## 1. Executive summary

The project's written English is in **good overall shape**. The marketing prose (landing, about, features, contact, legal pages) is polished, dashboard and admin UI copy is clear and professional, and API error messages are consistent and well-phrased.

The audit surfaced **1 definite typo**, **1 spelling inconsistency** (US vs UK), **4 developer-facing messages that leak internal details into the UI**, and several **minor grammar/punctuation nits**. No common misspellings (e.g., "recieve", "occured", "seperate") were found anywhere in `src`.

| Severity | Count | Type |
|---|---|---|
| 🔴 High — user-visible typo | 1 | `Attch.` in Order Preview |
| 🟠 Medium — inconsistent spelling | 1 | `Canceled` (US) vs `Cancelled` (UK) |
| 🟠 Medium — dev-facing text in UI | 4 | Supabase / module-path references |
| 🟡 Low — grammar & punctuation | 4 | Missing articles, em-dash spacing, minor phrasing |

---

## 2. Findings

### 2.1 🔴 HIGH — Typo: "Attch." in Order Preview

**File:** `src/components/orders/order-preview.tsx:621`
**Text:** `Attch.` (table header for the item-attachment column, line 643 area)
**Issue:** Truncated/misspelled "Attach."
**Suggested fix:** `Attach.` (or `Attach` to match the other short headers like `Qty`, `Description`).

This is the only genuine misspelling of a word found in the entire codebase. It appears on the desktop Order Preview items table, where the column is meant to indicate attached item images.

---

### 2.2 🟠 MEDIUM — Inconsistent spelling: "Canceled" vs "Cancelled"

The project overwhelmingly uses the British/Commonwealth spelling **"Cancelled"** (correct for the Sri Lankan market), but the **PayHere payment status label uses the American spelling "Canceled"**.

**"Canceled" (US) — PayHere payment statuses:**
| File | Line | Usage |
|---|---|---|
| `src/app/admin/payments/page.tsx` | 114 | `canceled: "Canceled"` — **user-visible label** |
| `src/app/admin/payments/page.tsx` | 56 | `| "canceled"` status union |
| `src/app/(dashboard)/dashboard/subscription/page.tsx` | 381 | `"canceled"` in payment history `failed` check |
| `src/app/(dashboard)/dashboard/subscription/payment/payment-page-client.tsx` | 69, 360 | `"canceled"` status handling |
| `src/app/api/payments/payhere/client-event/route.ts` | 62 | `? "canceled"` |
| `src/app/api/payments/payhere/notify/route.ts` | 16, 22 | PayHere status parsing |

**"Cancelled" (UK) — everywhere else** (orders, quotations, notifications, invitations, team, invoices, reports, courier):
- `src/app/admin/notifications/page.tsx:160` — `cancelled: { label: "Cancelled", ... }`
- `src/app/(dashboard)/dashboard/orders/page.tsx:198` — `"cancelled"`
- `src/components/invoices/invoice-document.tsx:47` — `cancelled: "Cancelled"`
- `src/components/team/team-settings.tsx:123` — `cancelled: { label: "Cancelled", ... }`
- and many more throughout orders/reports/courier code.

**Notes:**
- The `"canceled"` values in the **PayHere API routes** are the gateway's own status strings (PayHere's callback sends `canceled`), so those comparisons should stay as-is to match the gateway.
- The **user-visible label** `Canceled` in `admin/payments/page.tsx:114` is the problem — it should display as `Cancelled` to match the rest of the product. The label map entry can render "Cancelled" while the underlying key stays `"canceled"`.
- Additionally, in the subscription page's payment history, a `canceled` PayHere payment falls through to the raw status string (`payment.status`) as the label, so a user can see the raw US spelling there too. It would be better to map it to `Cancelled`.

**Recommended convention:** Use UK/Commonwealth spelling everywhere (consistent with "Cancelled", "colour", "Savour" etc. — the product targets Sri Lanka). Keep `"canceled"` only where it must match the PayHere gateway's payload.

---

### 2.3 🟠 MEDIUM — Developer-facing messages leaking into the UI

Four messages reference internal implementation details (Supabase, module paths, admin-only configuration) that a normal business user should never see. These look like leftover developer diagnostics.

| File | Text | Issue |
|---|---|---|
| `src/app/(auth)/login/page.tsx:53` | "This account still needs email confirmation. If you **disabled Confirm email after creating this user, delete the old user in Supabase Authentication > Users**, then sign up again." | Raw developer instructions shown to end users on sign-in failure. |
| `src/app/(auth)/login/page.tsx:71` | "The app could not reach **Supabase**. Please check your internet connection and **Supabase project URL/key**, then try again." | Mentions Supabase by name; should just say "check your internet connection and try again." |
| `src/app/(dashboard)/dashboard/page.tsx:542` | "Refresh the page or sign in again. If this continues, check your **Supabase setup**." | Admin-facing phrasing in the dashboard error state. |
| `src/components/delivery/courier-settings.tsx:493` | "Provider module not found. Make sure the provider is imported in **providers/index.ts**." | References an internal module path; shown to a business owner configuring a courier. |

**Suggested direction:** Rewrite as user-friendly copy:
- Login email-confirmation: "This account still needs email confirmation. Please check your inbox for the confirmation link."
- Login connection: "The app could not connect. Please check your internet connection and try again."
- Dashboard error: "Refresh the page or sign in again. If this continues, please contact support."
- Courier provider: "This courier service is temporarily unavailable. Please try again or contact support."

---

### 2.4 🟡 LOW — Grammar: missing article in notifications empty state

**File:** `src/components/notifications/notification-popover.tsx:220-221`
**Text:** "You'll see notifications here when **admin sends** announcements or system events occur."
**Issue:** Missing article — "when the admin sends announcements". The second clause ("or system events occur") also makes the sentence slightly awkward.
**Suggested fix:** "You'll see notifications here when the admin sends announcements or when system events occur."

---

### 2.5 🟡 LOW — Punctuation: inconsistent em-dash spacing in marketing copy

Two lines on the landing page use **unspaced em-dashes**, while the rest of the marketing site uses **spaced em-dashes** (" — ").

**Unspaced (inconsistent):**
| File | Text |
|---|---|
| `src/app/landing/page.tsx:319` | "Create, track and manage orders from quotation to **invoice—all** in one seamless workflow." |
| `src/app/landing/page.tsx:369` | "See the numbers that matter **most—orders**, revenue, profit, payments and **deliveries—all** in one live dashboard." |

**Spaced (the site's convention — examples):**
- `about/page.tsx`: "spreadsheets and WhatsApp — and we knew there had to be a better way."
- `features/page.tsx`: "expenses to deliveries — BizRavana brings everything together"
- `landing/page.tsx`: "no more juggling between notebooks, spreadsheets and WhatsApp." / "from quotation to invoice — all in one seamless workflow" style used elsewhere

**Suggested fix:** Add spaces around the em-dashes in the two landing descriptions (`invoice — all`, `most — orders`, `deliveries — all`) so the marketing voice is consistent.

---

### 2.6 🟡 LOW — Minor copy inconsistencies

| # | File | Issue |
|---|---|---|
| 1 | `src/app/(auth)/register/page.tsx:747` | "Passwords do not match" (no period) vs `reset-password/page.tsx:43` "Passwords do not match." (with period) vs `admin/profile/page.tsx:244` "The passwords do not match." (with article). Same error, three phrasings. |
| 2 | `src/components/orders/bulk-order-import-form.tsx:364` | The bulk-import instructions sheet exposes the raw enum value `walkin` ("Order Source: ad / whatsapp / ... / **walkin** / referral / ..."). Users should see "walk-in". (The enum values themselves in the file are fine — this is only about the visible instruction text.) |
| 3 | `src/app/(dashboard)/dashboard/subscription/payment/payment-page-client.tsx:1182-1188` | Order-summary feature rows list "Orders / Expenses / Products / Storage" with hardcoded English labels and no trailing "…" or unit hints — minor, acceptable. |
| 4 | `src/app/(dashboard)/dashboard/subscription/page.tsx` (payment history) | A PayHere payment with status `canceled` displays the raw lowercase/English-US status string as its label (fall-through in the `statusLabel` mapping). Should map to "Cancelled" for display. |

---

### 2.7 ✅ Checked and clean (no action needed)

These areas were reviewed in full and found to be correctly spelled and grammatically sound:

- **Marketing pages** — landing, about, features, contact, terms, privacy policy, refund policy: professional, consistent voice; correct use of "COD", "WhatsApp", "PayHere", "Royal Express", "Koombiyo".
- **Auth pages** — login, register, forgot/reset password: clean, friendly copy (aside from the dev-facing strings in §2.3).
- **Dashboard pages** — orders, quotations, products, inventory, expenses, courier, reports, subscription, settings: clear labels, consistent empty states ("No orders yet", "No expenses with this category yet", etc.).
- **Admin pages** — businesses, payments, subscriptions, trials, plans, notifications, ads, bug reports, cleanup, storage, activity log, settings: consistent professional copy; emoji-confetti empty states are intentional.
- **API error messages** — all routes reviewed; phrasing is consistent and user-appropriate (with the exception of nothing here — these are actually the cleanest part of the app).
- **PDF documents** — invoice & quotation documents: "This invoice was generated electronically. No signature is required." etc. — clean.
- **WhatsApp template engine** — default templates (order confirmation, quotation) read well in both Sinhala-market English and template syntax.
- **Brand names throughout** — "WhatsApp" (never "Whatsapp"), "PayHere" (never "Payhere"), "Royal Express", "Koombiyo" — all consistently capitalized.
- **Districts list** (`constants/districts.ts`) — all 25 Sri Lankan districts spelled correctly. (`customer-parser.ts` additionally accepts "Rathnapura" as an input alias for "Ratnapura", which is intentional tolerant parsing, not an error.)
- **No common misspellings** anywhere in `src` (searched: recieve, occured, seperate, adress, sucess, definately, accross, calender, neccessary, priviledge, recomend, garantee, maintance, reciept, sufficent, tommorow, truely, etc. — zero hits).

---

## 3. Suggested remediation order

1. **Fix the typo** — `Attch.` → `Attach.` in `order-preview.tsx` (§2.1). One-line change, immediate win.
2. **Decide the cancel spelling convention** — UK "Cancelled" everywhere in the UI; keep `"canceled"` only in PayHere gateway comparisons and map it to "Cancelled" for display (§2.2).
3. **Rewrite the 4 dev-facing messages** as user-friendly copy (§2.3).
4. **Tidy the low-severity items** — notification article (§2.4), em-dash spacing on the landing page (§2.5), and the three minor inconsistencies (§2.6).

---

## 4. Verification checkpoints (grep)

Run these to confirm status before/after any remediation:

```bash
# The typo
grep -rn "Attch" src

# Cancel spelling split
grep -rn '"Canceled\|canceled:' src --include='*.tsx'
grep -rn '"Cancelled\|cancelled:' src --include='*.tsx' | head

# Dev-facing strings
grep -rn "Supabase" src --include='*.tsx' | grep -iv 'import\|@/lib\|@supabase\|createClient'
grep -rn "providers/index.ts" src --include='*.tsx'

# Em-dash spacing on landing
grep -rn '—[A-Za-z]\|[A-Za-z]—' src/app/landing/page.tsx
```

---

*This audit is informational only. No application code was changed.*
