# Bizravana — Changelog

All user-visible changes to Bizravana are documented here.

---

## Version 0.7.0 (2026-07-19)

### Added

- **Premium Toast Notification Redesign** — Complete visual overhaul inspired by Linear, Stripe, and Vercel:
  - Position: top-right (desktop), top-center (mobile), 16px offset
  - 12px rounded cards with white/dark neutral background, subtle border, soft shadow
  - Per-type colored left accent bars via CSS `::before` (green/red/amber/blue)
  - Lucide icons: CircleCheck, CircleX, TriangleAlert, Info, Loader2 with type-specific CSS colors
  - Close button: hidden on desktop → visible on hover, always visible on mobile
  - Title: 14px semibold, Description: 13px regular with 2-line clamp
  - Action/cancel button styling with hover states
  - Dark mode: dark neutral background (oklch 0.22) instead of white
  - Reduced motion support
  - No business logic or API changes

- **Premium Dialog (Modal) Redesign** — Complete visual overhaul inspired by Linear, Stripe, Notion, and Vercel:
  - Standardized size system: `sm`(480px), `md`(640px), `lg`(840px), `xl`(1080px), `full`(90vw)
  - 16px rounded corners (`rounded-2xl`), `ring-1 ring-border/50`, `shadow-xl`
  - Dark overlay: `bg-black/50` — consistently dark in both light and dark modes
  - 4px backdrop blur on overlay
  - Animations: fade + scale (95%→100%), 200ms open, 150ms close, no bounce
  - Header divider (`border-b border-border/50`), footer divider (`border-t`)
  - Title: 20px semibold, Description: 14px muted
  - 24px outer padding (`p-6`), consistent spacing throughout
  - Close button: ghost icon, absolute top-right
  - Custom thin scrollbar styling
  - Max height: 85vh with overflow-y-auto

- **Selective Dialog Blur** — When a dialog opens, the main dashboard content is blurred (2px) while the sidebar stays crisp and unblurred. Uses CSS `:has()` to detect dialog overlay state. Smooth transitions (220ms in, 180ms out).

- **Scheduled Delivery Click** — Clicking a scheduled delivery item on the dashboard navigates to `/dashboard/orders?search=ORDER_NUMBER` with the search filter pre-applied. Keyboard accessible (Enter/Space).

### Changed

- **"PDF" button → "Invoice"** — Label changed in order and quotation preview headers
- **Dialog overlay background** — Changed from `bg-foreground/50` (theme-aware, light in dark mode) to `bg-black/50` (consistently dark)
- **ConfirmDialog** — Updated layout to match new dialog design, destructive variant now shows `TriangleAlert` icon with red tint

---

## Version 0.6.0 (2026-07-19)

### Added

- **Shipping Label Redesign** — Complete layout overhaul with:
  - Business header: logo, name, address, phone, formatted date, courier name
  - Handling instruction icons (Fragile, Keep Dry, This Side Up, Glass, Do Not Bend) with horizontal auto-wrapping
  - Optional note field below COD section
  - Barcode quiet zones (margin 5) for scannability
- **Combined Bulk PDF Generation** — Generate a single multi-page PDF with one label per page when printing labels for multiple selected orders simultaneously
- **Shipping Label Defaults Settings** — New card under Settings → Courier with handling instruction toggles, optional note, and date preference (Dispatch Date vs Current Date)
- **Keyboard Delete Key** — Press `Del` key to trigger bulk delete confirmation on all 5 table pages (orders, products, expenses, inventory, quotations)
- **Arrow Key Dialog Navigation** — Up/Down arrows navigate options in DispatchDialog and TemplateSelectionDialog, Enter to select/confirm
- **Responsive Dashboard Cards** — StatusListCard heights adapt: compact (170px) when both empty, full height (340px) otherwise, CSS grid auto-matches heights when one card has content

### Changed

- **Order table quick actions** — Clustered icons collapsed to View/Edit/Delete visible + 3-dot dropdown for WhatsApp and Print Shipping Label
- **Top Sales tabs** — Changed from pill-style to line-style (underline indicator) to match settings and reports pages
- **Shipping Label Dialog** — PDF preview iframe increased from 320px to responsive `calc(60vh - 4px)` for multi-page PDFs

### Fixed

- **TemplateSelectionDialog** — Arrow key navigation now syncs `selectedId` with `focusedIndex` so "Send" button reflects the highlighted template
- **Temporal Dead Zone** — Fixed `useEffect` accessing `setShowBulkDelete` before `useState` declaration (all 5 table pages)
- **CourierSettings nesting** — Fixed JSX structure for new Shipping Label Defaults card
- **Orphan expression** — Removed dead `codBoxY + codBoxHeight` line in PDF generator

---

## Version 0.5.0 (2026-07-19)

### Added

- **A5 Shipping Label PDF Generation** — BizRavana-generated shipping labels with:
  - Code 128 barcode from waybill ID (jsbarcode + svg2pdf.js)
  - Waybill section: barcode + large bold waybill ID
  - From section: sender business name and phone
  - Deliver To section: receiver name, address, contact, COD value highlighted
  - Print-friendly A5 portrait (148×210mm) with safe 9mm margins
  - Neutral black-and-white design
- **Shipping Label Preview Dialog** — Modal with PDF preview (iframe), Print Label button (A5-optimized CSS), Download PDF, generating/error/ready states, light/dark/system theme support
- **Auto Label Generation** — After courier dispatch automatically generates shipping label and opens preview dialog. Non-blocking: failure doesn't prevent dispatch success
- **Reprint Support** — "Print Shipping Label" from three entry points:
  - Order Preview header (when waybill exists)
  - Shipment Status Panel header
  - Orders table row actions (Truck icon when waybill exists)
- **Courier Shipment Metadata** — New `courier_shipment_metadata JSONB` column on orders table (migration 016)

### Fixed

- **Package mismatch** — Replaced wrong `svg2pdf` package (Node.js Inkscape tool) with correct `svg2pdf.js` (browser jsPDF plugin). Resolves `Module not found: Can't resolve 'child_process'` and `Can't resolve 'fs'` errors.

---

## Version 0.4.0 (2026-07-19)

### Added

- **WhatsApp Message Templates System** — Full template management under Settings → WhatsApp Templates with:
  - Three independent template contexts: Order Table, Order Preview, Quotation Preview
  - Multiple templates per context with default template support
  - Three-column layout: placeholders (left) | editor (middle) | live preview (right)
  - Clickable placeholder chips with cursor-position insertion, grouped by category (Customer, Order, Items, Payment, Delivery, Quotation)
  - Live WhatsApp-style preview with real-time placeholder substitution and date formatting
  - Saved template list with selection indicator, Default badge, relative timestamp, and vertical 3-dots action menu (Duplicate, Set as Default, Rename, Delete)
  - Template Title validation (required, min 2, max 80 chars, duplicate prevention per context)
  - Placeholder validation warnings for unknown, malformed, and unsupported formatting patterns
  - Delete confirmation dialog (prevents accidental deletion)
  - Rename dialog with inline input and Enter/Escape shortcuts
  - Context pill selector with accurate per-context template counts
- **Reusable Placeholder Engine** — `src/lib/template-engine.ts` with:
  - `renderTemplate()` — replaces all `{{placeholders}}` with data values
  - `{{item_details}}` — auto-generates grouped, formatted item list by category
  - Date formatting per business `dateFormat` preference (DD/MM/YYYY, etc.)
  - Currency formatting as "Rs. X,XXX"
  - WhatsApp formatting pass-through (`*bold*`, `_italic_`, `~strikethrough~`)
- **WhatsApp Button Integration** — Three integration points using `useWhatsAppAction` hook:
  - Orders table row WhatsApp icon → context `order_table_whatsapp`
  - Order Preview WhatsApp button → context `order_preview_whatsapp`
  - Quotation Preview WhatsApp button → context `quotation_preview_whatsapp`
  - Automatic flow: 0 templates → "Create Template" dialog | 1 template → sends immediately | >1 templates → selection dialog
- **Template Selection Dialog** — Radio-style picker with Default badge, message preview, and Manage Templates navigation
- **No Template Dialog** — Empty-state dialog with "Create Template" → settings with context preselected
- **Data Mappers** — `orderRowToTemplateData`, `orderPreviewToTemplateData`, `quotationPreviewToTemplateData` in `whatsapp-actions.ts`
- **Database** — `message_templates` table (migration 015) with soft delete, unique constraints, indexes, and RLS
- **API Routes** — `/api/message-templates` with service-role bypass for reliable CRUD
- **WhatsApp Templates Settings Tab** — Registered in settings page at `tab=whatsapp-templates` with MessageCircle icon
- **Date-based placeholder formatting** — Dates in preview respect user's dateFormat preference from settings

### Changed

- **Template list items redesigned** — Always-visible vertical 3-dots menu, selection indicator dot, relative timestamps, two-line layout
- **Context pill counts** — Now shows accurate counts across all contexts by fetching all templates at once

### Fixed

- **Context pill count bug** — Non-active contexts no longer show 0 when templates exist in them
- **Template list header** — Added FileText icon, improved spacing and visual hierarchy

---

## Version 0.3.0 (2026-07-17)

### Added

- **Searchable District & City dropdowns** — New `SearchableSelect` component using Popover + cmdk Command for keyboard-filtered dropdowns in order and quotation forms
- **Format Phone Numbers** — New `formatPhoneNumber()` utility formats Sri Lankan phone numbers for display (0750350109 → 0750 350 109), applied to order and quotation previews
- **Order Table — Multi-category/multi-item popovers** — Category and Item columns now show secondary lines (`+X Categories`, `+X More Items`) with hover popovers listing all items
- **Quotation Table — Multi-category/multi-item popovers** — Same popover behavior as orders table
- **Order Table — Repeat Customer badges** — Gold star badge with order count on repeat customers (identified by WhatsApp number)
- **Order Table — Quick action hover colors** — WhatsApp (green), View (sky), Edit (amber), Delete (red) hover effects with per-row isolation
- **Quotation Table — Quick action hover colors** — Same hover colors as orders table
- **Order & Quotation Tables — WhatsApp icon** in quick actions (always visible)
- **Order Table — Item count label** in order form header ("Order Items (3)")
- **Order & Quotation Tables — Paperclip icon** with attachment count inline after order/quotation number
- **Quotation Settings** — Quotation numbering (prefix, start number, padding) + expiry days in operational settings
- **Expense Settings — Payment Methods** — Add/remove custom payment methods, set default, linked to expense form dropdown
- **Per-item image upload** in order forms with Supabase Storage, image previews in order table rows
- **Forgot Password flow** — Recovery link now lands on password reset page (fixed PKCE code verifier + auth callback routing)
- **Numbering Preview** — Live preview of order and quotation number format in settings

### Changed

- **Order table columns** — Reduced status and payment column widths by ~20%, quick actions always visible
- **Order numbering** — Converted quotations now use sequential order numbering (follows last created order)
- **Order form** — Order number stays unchanged on update (only set on create)
- **Reset System Data** card redesigned with collapsible layout
- **Repeat Customer badge** redesigned to gold star with order count

### Fixed

- **Order numbering** — no longer skips numbers or changes on update
- **Order form** — shows correct next number when form opens without creating an order first
- **Numbering inputs** — allow leading zeros (e.g., "001")
- **Forgot Password** — email link no longer logs in directly to dashboard; now shows password reset page
- **Auth callback** — PKCE code verifier not found in storage error resolved
- **Logout** — avatar menu logout now works
- **Image upload** — images now upload and save correctly to Supabase Storage
- **Image cleanup** — related images deleted from storage when order is deleted or image is removed
- **Backup Import — Generated columns**: The import handler no longer tries to write to PostgreSQL `GENERATED ALWAYS AS` columns (`profit_margin`, `balance_remaining`, `total`, `total_price`, `grand_total`, `total_cost`). These are now stripped before insert.
- **Backup Import — Schema drift**: The import no longer adds `updated_at` to tables that don't have that column (`order_items`, `order_status_history`, `inventory_transactions`, `quotation_items`, `price_snapshots`).
- **Backup Import — Primary key conflicts**: Changed from `insert()` to `upsert()` for all tables, so importing into a database with existing records (same UUIDs) updates them gracefully instead of throwing duplicate key errors.

---

## Version 0.2.0 (2026-07-16)

### Added

- **Orders Module** — Full CRUD with Supabase, in-page form, bulk XLSX import, filter bar (status/payment/date), data table with sorting/pagination/selection mode, editable status badges, order preview panel, dispatch & shipment tracking dialogs
- **Products Module** — Full CRUD, category manager (add/rename/delete), bulk XLSX import, active/inactive toggle, auto-calculated profit margin
- **Inventory (Stock) Module** — Stock in/out/adjustment forms, transaction history, stock preview
- **Expenses Module** — Full CRUD, category selection, optional inventory stock linking, filter bar (category/payment method/date), bulk XLSX export
- **Quotations Module** — Full CRUD, customer/items/financial sections, preview panel, conversion workflow to orders
- **Reports Module** — Orders, Expenses, and Financial Performance analytics with Recharts (revenue flow, top products, status distribution donut, expense breakdown, P&L)
- **Settings Page** — Full tabbed settings with collapsible section cards:
  - Business Profile (name, phone, address, district, social media links with brand icons, logo upload with crop dialog)
  - Appearance (light/dark/system theme, 5 accent colors + custom color picker, font family/size, background style)
  - Preferences (timezone, date format, currency, order defaults)
  - Delivery / Courier (courier configuration)
  - Subscription (plan info, usage meters placeholder)
  - Danger Zone (data export, account deletion)
- **Delivery Components** — Courier settings in Settings, courier utility functions and hooks, shipment tracking in orders
- **Dashboard Enhancements** — Trend badges with month-over-month comparison, secondary content on stat cards, compact stats strip (to dispatch/be delivered/rescheduled/returned), revenue overview chart, top sales tabs (category/item), dashboard settings drawer, low stock alerts card, scheduled deliveries card
- **Global Search** — Cmd+K search dialog with recent searches persistence, keyboard shortcuts dialog, network status indicator
- **New UI Components** — InputGroup, Dropdown (Base UI), Pagination (page navigation + rows-per-page), ImageCropDialog (react-easy-crop)

### Changed

- **Settings page** migrated from placeholders to fully functional tabs with sub-routes (profile/, preferences/)
- **Dashboard** enhanced from basic stats to full business overview with charts and operational status cards

### Fixed

- RLS UPDATE policies — added explicit WITH CHECK clauses (migrations 008)
- Storage RLS — extended to allow both avatars/{userId} and logos/{businessId} paths (migration 013)
- Expense constraints — removed restrictive CHECK to support custom categories (migration 011)
- Soft delete — added SECURITY DEFINER RPCs for products and inventory (migration 009)

### Database

- 13 total migration files (001 through 013)
- New tables: categories, inventory_categories, expense_categories
- New storage bucket: profile-images (avatars + logos)
- New RPCs: soft_delete_products, soft_delete_inventory_items
- All existing indexes and RLS policies maintained

---

## Version 0.1.0 (2026-07-09)

### Added

- Next.js 16 project scaffold with TypeScript, App Router, Tailwind v4
- shadcn/ui integration with 25 base UI components (later expanded to 28)
- Core dependency setup (Supabase, TanStack Query, Zustand, Zod, React Hook Form, Framer Motion, Recharts, Lucide)
- Project folder structure for all modules (auth, dashboard, admin, components, lib, hooks, stores, types, constants, providers)
- Environment configuration (.env.local, .env.example)
- Theme System — OKLCH semantic tokens, 5 accent presets (Ocean/Forest/Twilight/Blush/Sunset) + custom color, light/dark/system, font family/size options
- Supabase schema + RLS — 20+ tables, seed data for 4 subscription plans
- Supabase client utilities (browser, server, middleware) + database types
- Auth pages (Login, 3-step Registration, callback)
- Layout shell (Sidebar, BottomNav, DashboardLayout)
- Development documentation framework:
  - DEVELOPMENT_LOG.md — tracks all completed work
  - AI_DEVELOPMENT_WORKFLOW.md — defines AI agent workflow rules
  - TASKS.md — task management board
  - CHANGELOG.md — user-visible changes
  - KNOWN_ISSUES.md — bugs and limitations
  - DATABASE_SCHEMA.md — database documentation
  - COMPONENTS.md — reusable component documentation
