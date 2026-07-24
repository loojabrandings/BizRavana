# Bizravana — Changelog

All user-visible changes to Bizravana are documented here.

---

## Version 0.12.3 (2026-07-24)

### Changed

- **WhatsApp Templates Settings Layout** — Desktop layout restructured: Saved Templates section and Placeholders section now span full width as stacked rows instead of a side-by-side grid (260px sidebar + remaining width). Template list items have more room for titles. Editor + Preview remain as two columns below.

---

## Version 0.12.2 (2026-07-23)

### Added

- **BizRavana Default Branding** — When no user-submitted business name, tagline, or logo exists, the sidebar now shows:
  - **Business Name**: "BizRavana" (was already the default)
  - **Tagline**: "Manage Smarter. Grow Faster" (changed from "Business OS")
  - **Logo**: `darkmode-logo.png` theme-aware PNG with proportional scaling (`w-28 h-auto`)
- **Theme-Aware Logos** — Two PNG logo files at `/darkmode-logo.png` and `/lightmode-logo.png` replace the old SVG component
- **Favicon** — Browser tab icon set to `/darkmode-logo.png` (consistent across all themes)
- **Migration 026** — Added `DELETE` RLS policy for `profiles` table (required for data reset)

### Changed

- **Data Reset (Danger Zone)** — "Reset All Data" now also deletes:
  - **Categories** — Product categories table (`categories`) added to the products entity in `DATA_ENTITIES` (also included in export/import)
  - **Profiles** — `profiles` table added to `RESET_TABLES` (only on reset, not exported/imported). Current user's own profile is preserved (`neq("user_id", userId)` guard), preventing app breakage after reset
- **Sidebar Logo** — Replaced the inline SVG logo component with theme-aware PNG images (`darkmode-logo.png` / `lightmode-logo.png`). Logo now uses `w-* h-auto` sizing for proportional scaling instead of fixed square dimensions
- **Logo Color** — Removed theme-primary-colored SVG in favor of hardcoded black (light mode) / white (dark mode) via CSS class

### Fixed

- **Hydration Mismatch** — Removed `useTheme().resolvedTheme` conditional from sidebar logo rendering. The sidebar now always uses `/darkmode-logo.png`, eliminating the SSR-vs-client hydration error

### Removed

- **SVG Logo Component** — Deleted `src/components/shared/bizravana-logo.tsx` (replaced by theme-aware PNGs)
- **Old Favicon** — Deleted `public/bizravana-favicon.svg` (replaced by `/darkmode-logo.png`)
- **`logo-fill` CSS class** — Removed from `globals.css` (no longer needed)
- **`ThemeFavicon` Component** — Deleted `src/components/shared/theme-favicon.tsx` (favicon now hardcoded to a single image)
- **`useTheme` Import** — Removed from sidebar (no longer needed after removing theme-aware branching)

### Other

- **All Markdown docs updated** to reflect latest changes

---

## Version 0.12.1 (2026-07-23)

### Fixed

- **Royal Express waybill fix** — `shipViaRoyalExpress` now uses the order's pre-assigned `waybill_id` instead of generating a synthetic `"CM" + order_number` waybill. Fixes 422 error: "waybill number has already been taken."
- **Auto waybill flow restored** — When `waybill_id` is null (auto mode), `waybill_number` is now omitted from the API payload, letting Royal Express auto-generate one. The previous validation threw an error blocking auto waybills entirely.

### Removed

- **Shipping Label Feature** — Complete removal of the A5 PDF shipping label system:
  - Deleted `src/lib/shipping-label/` (types, validate, fetch-data, generate-pdf — 4 files)
  - Deleted `src/components/orders/shipping-label-dialog.tsx`
  - Removed Print Label buttons from orders page, order preview, and bulk actions
  - Removed Shipping Label Defaults settings from courier-settings.tsx
  - Removed `jsbarcode` and `svg2pdf.js` from package.json
  - No other features affected

### Other

- **Identified 3 orphaned Supabase tables** with no migration coverage — `courier_cities`, `courier_districts`, `courier_waybills` — not referenced by any application code
- **All Markdown docs updated** to reflect shipping label removal and latest changes

---

## Version 0.12.0 (2026-07-23)

### Added

- **Settings Sync to Supabase** — Operational settings now persist across devices via the `business_settings` table:
  - **Orders Settings** — Prefix, numbering start, default statuses, payment methods list, default payment method, courier charge, default landing page, barcode scanner toggle, sorting, rows per page, inventory/deduct settings
  - **Quotation Settings** — Prefix, numbering start, expiry days
  - **Expense Settings** — Payment methods list, default payment method
  - **Preferences** — Theme mode, accent color, font family/size, currency, date format, background style
  - **Automatic sync** — On dashboard mount, settings are fetched from Supabase and merged into Zustand stores (server wins). All changes are auto-saved with a 1-second debounce. Cleanup on unmount.
  - **Seamless cross-device** — Works transparently. No new buttons or UI changes. Zustand persist (localStorage) acts as the fast cache, Supabase as the cross-device source of truth.
  - **Key design** — Uses `(business_id, key)` unique constraint with 4 well-known keys (`orders_settings`, `quotation_settings`, `expense_settings`, `preferences`). Dynamic `stripFunctions()` helper auto-adapts to store changes.
- **Payment Method Selector (Dropdown)** — Replaced the 2×2 radio button grid with a proper Select dropdown in the Order Form. Dynamically lists all payment methods configured in Order Settings, with formatted labels (e.g., "Bank Transfer").

### Changed

- **Order Form Payment Section** — Removed unnecessary "COD Amount" read-only field (duplicated Remaining Balance)
- **Order Form Wizard** — Fixed pre-existing bug: `paymentMethods` prop was not being passed to the `StepContent` component, causing the Payment Section to fall back to default methods on mobile

### Fixed

- **TypeScript build errors** (blocking Vercel deployment):
  - `ConfirmDialog children` — The Change Plan dialog in `admin/businesses/[id]` passed children to `ConfirmDialog`, which doesn't support custom content. Replaced with raw `<Dialog>` component with proper body section and `DialogFooter`.
  - `nullsLast` option — The `order()` call in `admin/subscriptions` used `nullsLast: true`, which doesn't exist on the Supabase postgrest-js client. Changed to `nullsFirst: false`.
- **`order-form.tsx` type cast** — `defaultPaymentMethod` from the settings store is typed as `string`, but the form's `payment_method` field expects a union type (`"cod" | "bank_transfer" | "cash" | "other"`). Added explicit type assertion.

---

## Version 0.11.0 (2026-07-22)

### Added

- **Smart Customer Parser** — Intelligently extracts customer details from unstructured pasted text (WhatsApp messages, SMS, social media DMs):
  - **WhatsApp Header Stripping** — Automatically removes `[time, date] sender:` timestamp headers from pasted messages
  - **Name Detection** — First meaningful line after header stripping is classified as the customer name
  - **Phone Detection** — Sri Lankan mobile number extraction (`07XXXXXXXX`) from anywhere in the text, even when embedded in other words
  - **District Matching** — Case-insensitive match against all 25 Sri Lankan districts, with Sinhala transliteration normalization (handles "Rathnapura" → "Ratnapura")
  - **City Matching (Two-Phase)** — Forward match: when district is identified, checks last address line against courier-filtered city list. Reverse lookup: when no district found, checks last word(s) of last line against ALL courier cities to infer both district and city
  - **Address Preserved As-Is** — Raw pasted text is never modified; all extracted fields are additive (nothing is removed from the address)
  - **"Smart Parser" Button** — Outlined button with clipboard icon in the Customer Details section heading, labeled "Smart Parser"
  - **Paste Dialog** — Minimal dialog with dedicated "Paste from clipboard" button using `navigator.clipboard.readText()`, plus manual textarea for pasting
  - **Accuracy Warning** — Warning banner in the dialog: "Smart Parser results may occasionally be inaccurate. Please review all filled fields carefully before creating the order."
  - **Reset Button (Order Form)** — "Reset" button in the order form footer (next to Cancel) that clears all customer detail fields + remarks, with red hover indicator
  - **Smart Parser (Quotation Form)** — Same Smart Parser button, paste dialog, and parsing logic added to `QuotationCustomerSection`. Warning references "quotation" instead of "order"
  - **Reset Button (Quotation Form)** — "Reset" button in the quotation form footer (next to Cancel) that clears all customer detail fields + remarks, with red hover indicator

### Changed

- **Paste icon** moved from System Information heading to Customer Details heading as a full "Smart Parser" labeled button
- **Reset button** moved from Customer Details heading to the OrderForm footer action bar
- **Parser dialog styling** — Now uses consistent button sizes and typography matching the order form (default button sizing, `variant="outline"` for Cancel, `variant="gradient"` for Parse & Fill)

### Added (Library)

- **`src/lib/customer-parser.ts`** — Pure parsing utility with exported functions:
  - `stripWhatsAppHeaders(text)` — Strips WhatsApp timestamp headers
  - `isPhone(text)` / `extractPhone(text)` — Sri Lankan phone detection
  - `matchDistrict(line, districts?)` — District matching with transliteration normalization
  - `matchCityInLine(line, cityNames)` — Multi-strategy city matching (full line, last 2 words, last word)
  - `lookupCityInAllCities(cityName, cities, states)` — Reverse city-to-district lookup
  - `parseCustomerText(text, options?)` — Main parse function orchestrating the full pipeline

---

## Version 0.10.0 (2026-07-22)

### Added

- **Notification Management System** — Complete admin broadcast and automated notification platform:
  - **Admin Notifications Page** at `/admin/notifications` with 5 sections: Overview stats, Create (Send Now/Schedule/Draft), Sent list, Scheduled list, Automated Rules with enable/disable toggle
  - **Create Broadcast Dialog** — Title, message, category, priority, audience selection (All/Active/Trial/Expired/Suspended/by Plan), action label/URL, send timing (now/schedule/draft), recipient count preview, live preview card
  - **14 Seed Automated Rules** — Trial ending (1 day), trial expired, subscription expiring (7/3/1 day), subscription expired, payment received/approved/rejected, deletion scheduled, usage 80%/100%, storage 80%/100%
  - **Automated Rule Management** — Enable/disable per rule with Switch toggle, essential rule protection (cannot disable), category+priority badges, last executed tracking
- **Database Migrations** — 024 (notification_broadcasts, notification_recipients, notification_rules tables + RLS + indexes + new columns on existing notifications), 025 (automated notification delivery functions + cron scheduling)
- **Server-Side Delivery API** — `/api/admin/deliver-broadcast` using service role admin client to bypass RLS, handles all audience types, creates notification records for each business owner, tracks delivery stats, logs to activity log
- **Shared NotificationProvider** — Global React context with:
  - Single initial fetch on auth load
  - Single Supabase Realtime channel scoped to business_id
  - Real-time INSERT/UPDATE event handling (new notifications appear instantly)
  - Window focus refetch as fallback
  - Proper cleanup on unmount (removes channel)
  - Optimistic markAsRead/markAllAsRead with no double-decrement
- **Enhanced Notification Bell** — Upgraded from simple count badge to full popover with:
  - Category icons (Info/Megaphone/Calendar/Wallet/AlertTriangle/BarChart3/HardDrive/Shield/CreditCard)
  - Priority indicators (urgent=red dot, important=amber dot)
  - Time-ago formatting, admin source badge, action URL navigation
  - Mark as Read (per-item), Mark All as Read, empty state
  - All state shared via single NotificationProvider, no redundant fetches
- **User Email Display in Admin** — All admin pages now fetch real emails from `auth.users` via secure API route + RPC function (migration 023), instead of querying non-existent `email` column on `profiles` table
- **Mobile Responsive Admin System** — All 11 admin pages converted to responsive design:
  - Desktop tables at >=1024px, mobile cards below 1024px
  - Reusable components: AdminPageHeader, AdminResponsiveTable, AdminMobileTabs, AdminSearchBar, AdminActionSheet, AdminMobileRecordCard
  - Touch targets 44px minimum, no full-page horizontal scroll
  - Bottom sheets for mobile actions, horizontally scrollable tabs

### Changed

- **Admin Layout** — Added "Notifications" nav item (Bell icon) to sidebar
- **Notification Bell** — Now consumes from shared NotificationProvider instead of managing local state
- **Dashboard Layout** — Wrapped with `<NotificationProvider>` for shared notification state
- **Migration 023** — Added `get_user_emails_by_ids` RPC function for secure email lookups from auth.users

### Fixed

- **400 Bad Request on Admin Pages** — Removed invalid `email` column selection from `profiles` table in 4 admin pages (businesses, subscriptions, trials, cleanup) + business detail page. Now fetches real emails from `auth.users` via secure API route
- **Notifications Not Delivered** — "Send Now" broadcasts now actually insert notification records for all targeted businesses via the new deliver-broadcast API route
- **Realtime Double-Decrement** — Removed unreadCount decrement from Realtime UPDATE handler to prevent conflicts with optimistic markAsRead

---

## Version 0.9.0 (2026-07-22)

### Added

- **Read Only Mode** — When `account_status` is `trial_expired` or `expired`, all create/edit/delete operations are blocked across the dashboard:
  - Animated upgrade banner at the top of every page with retention countdown
  - `guard()` function on all mutation actions (create, edit, delete, dispatch, status changes, payments, waybills, bulk operations, imports)
  - Dispatch, shipping label reprint, and form submissions also guarded
  - Context-specific toast messages explaining why the action is blocked
- **Trial Auto-Expiry Cron** — New migration (020) with `pg_cron` scheduling a daily SECURITY DEFINER function that transitions `trial → trial_expired` and `active → expired`, setting 14-day data retention window
- **Super Admin Panel** — Complete admin interface at `/admin` with:
  - **Layout** — Collapsible sidebar with 10 nav items, top bar with theme toggle + user menu, JWT-based `is_super_admin` auth guard
  - **Dashboard** — 7 stat cards (total businesses, active subs, trials, pending payments, expired, revenue, scheduled deletions) + quick action links
  - **Business Management** — Table with search/filter, status badges, activate/suspend actions, batch profile & plan name fetching
  - **Business Detail** — Full detail page at `/admin/businesses/[id]` with:
    - Overview (owner info, business details grid with contact/date info)
    - Subscription (current plan, trial/subscription dates, data retention warning, extend trial + activate buttons, change plan dialog)
    - Usage (6 progress meters: Orders, Expenses, Products, Quotations, Inventory, Storage with actual storage bucket estimation)
    - Payment History (list of payment records with status badges, receipt view links)
    - Danger Zone (suspend/reactivate, archive, delete with confirm dialogs)
  - **Pending Payments** — Full approval workflow at `/admin/payments` with:
    - Stats summary (pending, approved, rejected, total revenue)
    - Tabbed filtering (All/Pending/Approved/Rejected) + search
    - Receipt preview dialog (full image viewer with download)
    - Review dialog with payment summary, customer notes, admin note textarea
    - Approve (activates subscription: 30-day period, clears data retention) and Reject workflows
    - Admin activity logging for all payment actions
  - **Plans Management** — Full CRUD at `/admin/plans` with:
    - Plan list table (icon, name, price, limits, feature tags, businesses count, status)
    - Add/Edit dialog with all plan fields (identity, usage limits, integrations, advanced features, display settings)
    - Disable/enable toggle with confirm dialog
    - Duplicate plan with "(Copy)" suffix
    - Delete with FK constraint handling
  - **Trial Management** — Trial accounts at `/admin/trials` with:
    - Stats (active, expired, expiring soon, total)
    - Tabbed filtering (Active/Expired/All) + search
    - Table with days remaining (color-coded), order counts, status
    - Extend trial dialog (presets 3/7/14/30 days + custom)
    - Lock (suspend) and soft-delete actions
  - **Subscription Management** — Subscription portfolio at `/admin/subscriptions` with:
    - Stats (active, expiring in 7 days, expired, total approved payments)
    - Tabbed filtering (Active/Expiring Soon/Expired/All) + search
    - Table with plan, dates, days left (color-coded), last payment
    - Extend dialog (presets 7/14/30/90 days + custom)
    - Change plan dialog with active plan selector
    - Suspend and Cancel (14-day retention) actions
- **Database Migrations** — 020 (trial auto-expiry with pg_cron), 021 (admin payment_proofs RLS fix to allow super admin approve/reject)

### Changed

- **Admin nav item** added to sidebar (CreditCard icon)
- **Migration 021** — `payment_proofs` UPDATE and DELETE policies now include `OR is_super_admin()` to allow admin approve/reject workflow
- **Shipping label reprint** now auto-downloads PDF instead of opening preview dialog (order preview + orders page)

### Fixed

- **Read Only race condition** — `guard()` now also blocks when `isLoading` is true (info toast) to prevent race condition during initial auth fetch
- **Form submission bypass** — `handleOrderSubmit` and URL param `?action=new` now both check `guard()` before proceeding
- **RLS blocking super admin updates** — Migration 021 adds super admin bypass to payment_proofs update/delete policies

---

## Version 0.8.0 (2026-07-22)

### Added

- **Subscription Page Redesign** — Complete UI/UX overhaul for a premium SaaS pricing experience:
  - **Current Plan Hero** — Prominent hero section showing plan name, status badge, pricing, subscription dates, trial progress bar with remaining days
  - **Usage Overview** — Visual progress meters for Orders, Expenses, Products, Quotations, Inventory, and File Storage with percentage-used indicators
  - **Desktop Pricing Comparison Table** — Organized into feature groups (Usage Limits, Integrations, Collaboration, Advanced) with sticky column headers, sticky CTA row, Standard plan highlighted with inset ring accent, "Most Popular" badge on Standard
  - **Mobile Swipeable Pricing Cards** — Horizontally scrollable cards with snap scrolling, dot indicators, and "Compare Plans" bottom sheet with full feature grid
  - **Payment & Billing** — Two-column layout with bank transfer details (copy number, download instructions) and payment proof upload with status tracking
  - **Payment History** — Desktop table and mobile card list with plan, amount, status, and receipt view
  - **Standard Column Highlighting** — Theme accent color with inset ring on headers, background tint on all rows in the Standard column
  - **Fixed Pricing Table Height** — Scrollable feature rows fill remaining viewport height while header and CTA row stay visible
- **Database Migrations** — 018 (subscription plan columns: quotation_limit, inventory_limit, courier_accounts, whatsapp_templates, team_members, bulk_import, activity_log, smart_automation, ai_assistant), 019 (payment-proofs storage bucket)

### Changed

- **Subscription nav item** added to sidebar
- **Shipping label reprint** now auto-downloads PDF instead of opening preview dialog
- **Standard plan** designated as "Most Popular" with theme accent column highlighting

### Fixed

- **Button nesting error** — Resolved `<button>` inside `<button>` hydration error in subscription pricing cards

---

## Version 0.7.0 (2026-07-19)

### Added

- **Premium Toast Notification Redesign** — Complete visual overhaul inspired by Linear, Stripe, and Vercel
- **Premium Dialog (Modal) Redesign** — Complete visual overhaul with standardized size system, dark overlay, fade+scale animations
- **Selective Dialog Blur** — Main content blurs when dialog opens, sidebar stays crisp
- **Scheduled Delivery Click** — Clicking dashboard delivery items navigates to orders with search pre-applied

### Changed

- **"PDF" button → "Invoice"** — Label changed in order and quotation preview headers
- **Dialog overlay** — Changed to `bg-black/50` for consistent dark appearance in both themes

---

## Version 0.6.0 (2026-07-19)

### Added

- **Shipping Label Redesign** — A5 PDF with Code 128 barcode, handling instructions, business header
- **Combined Bulk PDF Generation** — Multi-page PDF for selected orders
- **Shipping Label Defaults Settings** — Handling instruction toggles, optional note, date preference
- **Keyboard Delete Key** — Del key triggers bulk delete on all 5 table pages
- **Arrow Key Dialog Navigation** — Up/Down arrows navigate DispatchDialog and TemplateSelectionDialog

### Changed

- **Order table quick actions** — Clustered icons collapsed to View/Edit/Delete + 3-dot dropdown

---

## Version 0.5.0 (2026-07-19)

### Added

- **A5 Shipping Label PDF Generation** — Code 128 barcode, waybill section, From/Deliver To sections, print-friendly design
- **Shipping Label Preview Dialog** — PDF preview, Print Label, Download PDF, generating/error/ready states
- **Auto Label Generation** — After courier dispatch, non-blocking label generation
- **Reprint Support** — Three entry points: Order Preview, Shipment Status Panel, Orders table
- **Courier Shipment Metadata** — New JSONB column on orders (migration 016)

---

## Version 0.4.0 (2026-07-19)

### Added

- **WhatsApp Message Templates System** — Full template management with 3 contexts, placeholder engine, live preview
- **Reusable Placeholder Engine** — `src/lib/template-engine.ts` with item_details grouping, date/currency formatting
- **WhatsApp Button Integration** — Orders table, Order Preview, Quotation Preview with auto-flow
- **Template Selection Dialog** — Radio-style picker with Default badge, message preview
- **No Template Dialog** — Empty-state dialog with create navigation
- **Data Mappers** — `orderRowToTemplateData`, `orderPreviewToTemplateData`, `quotationPreviewToTemplateData`
- **API Routes** — `/api/message-templates` with service-role bypass

---

## Version 0.3.0 (2026-07-17)

- Searchable District/City dropdowns, Phone number formatting
- Multi-category/item popovers, Repeat customer badges
- Quick action hover colors, WhatsApp icons
- Quotation Settings (numbering, expiry days)
- Expense Settings (custom payment methods)
- Forgot Password flow fix, Per-item image upload
- Backup Import fixes (generated columns, schema drift, PK conflicts)

---

## Version 0.2.0 (2026-07-16)

- Orders, Products, Inventory, Expenses, Quotations, Reports full CRUD modules
- Settings page with 8 functional tabs
- Dashboard enhancements with charts and operational cards
- Global Search, Keyboard Shortcuts, Network Status
- 13 database migrations (001-013)

---

## Version 0.1.0 (2026-07-09)

- Next.js 16 scaffold, shadcn/ui, Tailwind v4
- Theme System, Supabase schema + RLS
- Auth pages, Layout shell
- Development documentation framework
