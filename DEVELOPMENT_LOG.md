# Bizravana — Development Log & Guidelines

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **UI** | shadcn/ui + Tailwind CSS v4 |
| **Animations** | Framer Motion + Tailwind CSS transitions |
| **Backend** | Supabase |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth (email/password) |
| **Storage** | Supabase Storage |
| **Hosting** | GitHub + Vercel |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Tables** | TanStack Table |
| **Icons** | Lucide React |
| **Validation** | Zod |
| **Data Fetching** | TanStack Query (React Query) |
| **Global State** | Zustand (minimal) |
| **Theming** | next-themes + OKLCH CSS variables |
| **PDF** | jsPDF + jsPDF-AutoTable |
| **XLSX** | SheetJS (xlsx) |
| **Image Crop** | react-easy-crop |
| **Fuzzy Search** | Fuse.js |
| **UI Primitives** | Base UI (@base-ui/react) |

---

## Core Development Guidelines

### 1. General Principles
- Build as a scalable multi-tenant SaaS platform.
- Mobile-First responsive design approach.
- Maintain consistent UI/UX across all pages.
- Use reusable components whenever possible.
- Keep the interface simple, clean, and beginner-friendly.
- Optimize for performance and fast loading.
- Use lazy loading where appropriate.
- Follow clean code principles and modular architecture.

### 2. Database Design
- Design for future scalability from day one.
- Every business-related table must include: `business_id`, `created_by`, `created_at`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`
- Business account table must include: `plan_id`, `account_status`, `trial_started_at`, `trial_ends_at`, `subscription_started_at`, `subscription_ends_at`, `data_delete_after`
- Never design tables that only work for a single business.

### 3. Multi-Tenant Architecture
- Every user belongs to a Business.
- Every record must belong to a Business.
- Users should never be able to access another business's data.
- Enforce Row Level Security (RLS) in Supabase.

### 4. Historical Data Integrity
- Never update historical transaction values.
- Use Snapshot + Effective Date Versioning for: Product Prices, Courier Charges, Tax Rates, Delivery Charges, other configurable pricing.
- Every transaction must store snapshots of: Product Name, Unit Price, Customer Name, Customer Phone, Delivery Charge, Discount, Payment Method.
- Historical Orders, Expenses, Invoices, and Reports must never change when master data changes.

### 5. Inventory System
- Support two inventory modes:
  - **Simple Inventory**: Finished products only.
  - **Advanced Inventory (BOM)**: Bill of Materials for manufacturing businesses.
- Inventory deductions should occur only at the configured workflow stage.
- Inventory purchases can automatically update stock through the Expenses module.

### 6. Authentication
- Use Supabase Authentication.
- Registration should automatically create: User Account, Business Account, Owner Profile.
- Every new account starts with a 3-Day Free Trial.

### 7. Subscription System
- Account states: Trial → Trial Expired → Pending Payment → Active → Expired → Suspended → Archived → Deleted.
- After trial expiration: Lock dashboard, keep data for 14 days, Archive/Delete after retention period.
- Subscription activation managed manually by Super Admin initially.

### 8. Security
- Enable Supabase Row Level Security on all tables.
- Validate all inputs. Never trust client-side data.
- Secure all API routes.
- Prevent unauthorized access to business data.
- Log important administrative actions.
- Use server-side validation for all critical actions.

### 9. UI / UX
- Maintain consistent: Colors, Typography, Button styles, Form layouts, Table layouts, Icons, Card spacing, Modal behavior.
- Every page must include: Search, Filters, Responsive tables, Loading state, Empty state, Error state.

### 10. Forms
- Use consistent form validation.
- Features: Required field indicators, Auto calculations, Inline validation, Image uploads, Auto-save where appropriate.

### 11. Tables
- Every table must support: Search, Sorting, Filtering, Pagination, Responsive mobile layout, Bulk selection, Bulk actions.

### 12. Notifications
- Centralized notification system supporting: Low Stock, Trial Expiration, Subscription Expiration, Payment Approved, Delivery Updates, System Announcements.

### 13. File Storage
- Use Supabase Storage.
- Store: Product Images, Payment Proofs, Order Attachments, Invoices, Profile Avatars, Business Logos.
- Automatically remove files belonging to deleted businesses after the retention period.

### 14. Performance
- Optimize database queries. Use indexes where necessary.
- Avoid unnecessary API calls. Cache frequently accessed data.
- Load only required records.

### 15. Super Admin
- Keep Super Admin completely separate from Business Users.
- Responsibilities: User Management, Subscription Management, Plan Management, Payment Approval, Trial Management, Data Cleanup, System Monitoring.
- Never delete business data immediately. Always use Soft Delete: Active > Archived > Scheduled for Deletion > Permanently Deleted.

### 16. Future-Proof Architecture
- Design so these features can be added without major refactoring: AI Assistant, Team Management, WhatsApp Integration, Smart Automations, Courier API, Payment Gateway, Email Notifications, Push Notifications.

### 17. Development Standards
- Entire project must be TypeScript (no plain JavaScript).
- Follow consistent naming conventions.
- Write reusable services and utilities. Avoid duplicated logic.
- Keep business logic separate from UI components.
- Use environment variables for secrets.
- Document important functions and modules.

### 18. Animations & Micro-Interactions
- Professional, smooth, subtle animations. Fast, clean, consistent.
- Duration standards: Micro-interactions 150-250ms, Page transitions 250-400ms, Modal/Drawer 200-300ms.
- Required areas: Sidebar collapse, Mobile bottom nav, Page transitions, Modal/Drawer open/close, Dropdown menus, Button hover/press, Form validation feedback, Table row selection, Bulk action toolbar, Card hover, Toasts, Loading skeletons, Empty states, Chart reveal.
- Use Framer Motion for advanced animations. Use Tailwind transitions for simple hover/focus/state changes.
- Respect `prefers-reduced-motion`.
- **DO NOT over-animate** — this is a business tool, not a portfolio.

### 19. Advanced Table Features — Multi-Selection
- **Desktop**: Click Order Number to enter Selection Mode. Click row to select. Floating Bulk Actions Toolbar. Esc or Cancel to exit.
- **Mobile**: Long-press to enter Selection Mode. Tap to select. Bulk Actions at bottom.

### 20. Drawers vs Modals vs Popovers
- **Popover**: Quick actions, sorting, filtering, display settings, date selection, contextual menus.
- **Modal (Dialog)**: Confirmation dialogs, destructive actions, important decisions.
- **Dedicated Page**: Complex workflows, full management screens.
- **Drawer**: In-page settings.
- **In-Page Form**: Forms for create/edit workflows.
- Never use a full page for simple actions that can be completed in a popover or drawer.

### 21. Popovers & Context Menus
- Use for sorting, filters, display options, view modes, column visibility, quick settings, row actions, bulk actions, date range selection.
- Smooth animation, click-away-to-close, Esc to close, only one open at a time.
- Fully keyboard accessible, Tab/Enter/Space/Esc support, focus restored on close.

### 22. In-Page Forms (Create/Edit Workflows)
- Forms open inside the current page — not as modals.
- Affected: New/Edit Order, New/Edit Expense, New/Edit Quotation, Stock In/Out, Add/Edit Product.
- Keep previous table/filter state in memory. Return to exact same state on close.
- Use breadcrumb header: `Orders > New Order`.
- Large centered panel or split-layout. Clear close/back button.
- Sticky footer actions: Cancel, Save Draft, Save, Save & Create Another.
- Smooth fade/slide transition (200-300ms).
- Preload form components where possible.

---

## Account Status Flow

```
New Signup
    ↓
Trial Active (3 days, full access)
    ↓
Trial Expired
    ↓
Pending Payment
    ↓
Active (30 days)
    ↓
Expired
    ↓
Suspended
    ↓
Archived
    ↓
Deleted
```

---

## Subscription Plans

| Plan | Price | Orders | Expenses | Products | Features |
|------|-------|--------|----------|----------|----------|
| Basic | Rs. 450 | 90 | 90 | 10 | Core |
| Standard | Rs. 950 | 200 | 200 | 20 | Core |
| Premium | Rs. 1,950 | 500 | 500 | Unlimited | Core |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited | Team, AI, Automations, Log |

---

## Development Phases

### Phase 1 — Foundation
| Sub-Phase | Description |
|-----------|-------------|
| 1A | Project Scaffold — Next.js, deps, shadcn/ui, components, folder structure, env |
| 1B | Theme System — OKLCH tokens, 3 accents, Light/Dark/System, ThemeProvider |
| 1C | Supabase Schema + RLS — All migrations, policies, seed data |
| 1D | Supabase Clients + Database Types — browser, server, middleware clients |
| 1E | Core Providers + Stores + Hooks + Constants — QueryProvider, Zustand stores, hooks, districts |
| 1F | Layout Shell — Sidebar, BottomNav, DashboardLayout, root/auth/dashboard layouts |
| 1G | Auth Pages — Login, 3-step Registration wizard, callback |
| 1H | Dashboard + Subscription + Placeholders — Home page, subscription page, settings, all module placeholders |

### Phase 2 — Core Modules (COMPLETE)
Orders, Products, Inventory, Expenses, Customers, Quotations, Delivery, Reports, Settings

### Phase 3 — Analytics & Communication
Smart Customer Parser, Notifications, Smart Parser

### Phase 4 — Subscription & Admin
Subscription lock logic, Super Admin dashboard, data cleanup queue

### Phase 5 — Advanced Features
AI Assistant, WhatsApp, Automations, Courier API, Team Management, PWA

---

# Development Progress Log

> Update this log after every major task. Add new entries at the top.

---

## Entry: Premium Toast & Dialog UX Redesign
**Date:** 2026-07-19

**Summary:**
Complete visual overhaul of the toast notification system and dialog (modal) system. Both now feature premium Linear/Stripe/Vercel-inspired designs with zero business logic changes.

### Toast Redesign
- **sonner.tsx**: Complete component rewrite with:
  - Position: top-right, visibleToasts: 5, gap: 10, offset: 16
  - Custom icons: CircleCheckIcon, CircleXIcon, TriangleAlertIcon, InfoIcon, Loader2Icon
  - Full CSS classNames mapping for all toast elements
  - CSS variables for full theming via OKLCH tokens
  - Default duration: 5000ms

- **globals.css**: ~250 lines of new toast CSS:
  - CSS variables in `:root` and `.dark` for all toast colors/shadows
  - 12px radius, white/dark card, subtle border, soft shadow
  - Left accent bar: 3px colored `::before` per type (green/red/amber/blue)
  - Hover: elevated shadow
  - Title: 14px semibold, Description: 13px regular with 2-line clamp
  - Close button: opacity 0 → 0.5 on hover (desktop), always visible (mobile)
  - Action button: primary-colored text with solid hover fill
  - Mobile: center-aligned, calc(100%-32px) width
  - Reduced motion: disables all transitions

### Dialog Redesign
- **dialog.tsx**: Complete component rewrite with:
  - Size system: sm(480px), md(640px), lg(840px), xl(1080px), full(90vw)
  - 16px radius (`rounded-2xl`), `ring-1 ring-border/50`, `shadow-xl`
  - Dark overlay: `bg-black/50` (consistently dark both modes)
  - Fade + scale animations (200ms open, 150ms close, ease-out)
  - Header: `border-b border-border/50 pb-5`, Footer: `mt-6 pt-5 border-t`
  - Title: `text-xl font-semibold`, Description: `text-sm text-muted-foreground/70`
  - 24px padding (`p-6`), 85vh max-height with custom scrollbar
  - Close button: ghost icon, top-4 right-4

- **confirm-dialog.tsx**: Updated to use new `size="sm"` prop, destructive variant shows TriangleAlert icon
- **Selective dialog blur**: CSS `:has()` rule blurs main content (2px) when dialog is open, sidebar stays crisp

**Files Modified:**
- `src/components/ui/sonner.tsx` — complete redesign
- `src/app/globals.css` — added toast CSS + dialog blur CSS
- `src/components/ui/dialog.tsx` — complete redesign + dark overlay
- `src/components/shared/confirm-dialog.tsx` — updated to match new design
- `src/components/layout/dashboard-layout.tsx` — added `data-main-content` attribute

**Next Steps:**
- Apply blur to Sheet overlay for consistency
- Extend blur to non-dashboard pages
- Make blur intensity configurable

---

## Entry: Shipping Label Redesign + Bulk Combined PDF + Dashboard Enhancements
**Date:** 2026-07-19

**Summary:**
Major redesign of the A5 shipping label with business header, handling instructions, settings UI, combined bulk PDF generation, and dashboard responsive card heights.

**Key Changes:**

### Shipping Label Redesign
- **New Header Layout**: Business logo, name, address, phone, formatted date, courier name with blue accent
- **Barcode quiet zones**: Increased JsBarcode margin from 0 to 5 for proper scannability
- **Handling Instructions Icons**: Configurable per-label (Fragile, Keep Dry, This Side Up, Glass, Do Not Bend) displayed horizontally with auto-wrapping
- **Optional Note**: Text field below COD section
- **COD Box**: Redesigned with "COD TO COLLECT" label and highlighted border
- **Courier Name**: Displayed in blue below the date
- **Configurable Date**: Dispatch date or current date, set in Settings → Courier → Shipping Label Defaults

### Shipping Label Settings UI
- **Shipping Label Defaults Card** in Settings → Courier with:
  - Handling instruction toggle buttons (checkbox-style chips)
  - Optional note text input
  - Date on label preference (Dispatch Date vs Current Date)
- Saves to `business_settings` with key `shipping_label_handling`, `shipping_label_optional_note`, `shipping_label_date_option`

### Bulk Combined PDF Generation
- **Combined multi-label PDF**: When generating labels for multiple selected orders, produces a single PDF with one label per A5 page
- **Dialog fix**: Iframe height increased from fixed 320px to `calc(60vh - 4px)` with `minHeight: 300px` to show multi-page PDFs
- **Generic header**: Combined PDF dialog shows generic "Shipping Label" title (not misleading single-order info)

### Dashboard Responsive Card Heights
- **StatusListCard**: Added `containerClassName` prop, changed from fixed `h-[340px]` to dynamic min-height
- **Dashboard page**: Computes `min-h-[170px]` when both Scheduled Deliveries and Low Stock Alerts are empty (50% lower), `min-h-[340px]` otherwise
- CSS grid `align-items: stretch` automatically matches heights when one card has content

### Top Sales Tabs Fix
- Changed TabsList from default pill-style to `variant="line"` with `justify-start gap-3` to match settings and reports pages

### UI Polish
- **Order table actions**: Clustered row icons (WhatsApp, Shipping Label, View, Edit, Delete) collapsed into View/Edit/Delete visible + 3-dot `MoreHorizontal` dropdown containing WhatsApp and Print Shipping Label
- **Delete key support**: `Del` key triggers bulk delete confirmation on all 5 table pages (orders, products, expenses, inventory, quotations)
- **Arrow key dialog navigation**: DispatchDialog (↑↓/←→ between local/courier, Enter/Space to select) and TemplateSelectionDialog (↑↓ between templates, Enter to confirm)

### Bug Fixes
- TemplateSelectionDialog: Fixed `useCallback` import and state desync (arrow keys now sync `selectedId` with `focusedIndex`)
- Fixed Temporal Dead Zone bug where `useEffect` referenced `setShowBulkDelete` before its `useState` declaration (moved effect after state across all 5 pages)
- CouriersSettings: Fixed JSX nesting with new Shipping Label Defaults card
- Removed orphan expression `codBoxY + codBoxHeight` in generate-pdf.ts

**Files Modified:**
- `src/lib/shipping-label/types.ts` — new fields, HandlingInstruction type, removed HANDLING_INSTRUCTION_ICONS
- `src/lib/shipping-label/fetch-data.ts` — fetches logo, address, courier name, handling instructions, date option
- `src/lib/shipping-label/validate.ts` — added business address validation
- `src/lib/shipping-label/generate-pdf.ts` — complete layout redesign with header, waybill, receiver, COD, handling icons
- `src/components/delivery/courier-settings.tsx` — added Shipping Label Defaults card
- `src/components/dashboard/status-list-card.tsx` — added containerClassName prop
- `src/app/(dashboard)/dashboard/page.tsx` — responsive card heights, tabs variant fix
- `src/components/orders/dispatch-dialog.tsx` — arrow key navigation
- `src/components/whatsapp/template-selection-dialog.tsx` — arrow key navigation
- `src/components/orders/shipping-label-dialog.tsx` — iframe height fix for multi-page PDFs
- `src/app/(dashboard)/dashboard/orders/page.tsx` — bulk combined label generation, Delete key handler
- `src/app/(dashboard)/dashboard/products/page.tsx` — Delete key handler
- `src/app/(dashboard)/dashboard/expenses/page.tsx` — Delete key handler
- `src/app/(dashboard)/dashboard/inventory/page.tsx` — Delete key handler
- `src/app/(dashboard)/dashboard/quotations/page.tsx` — Delete key handler

**Files Created:**
- None (all changes within existing files)

**Next Steps:**
- Coupler snapshot: store courier metadata on order at dispatch time for historical label accuracy
- Per-shipment override UI: allow adjusting handling instructions before printing
- Distinct handling icons per type (⚠ FRAGILE vs ☂ KEEP DRY, etc.)

---

## Entry: Phase 2 Enhancements — Phone Formatting, Searchable Selects, Order/Quotation Table Upgrades
**Date:** 2026-07-17

**Summary:**
Multiple enhancements across order and quotation tables, new reusable components, and a phone formatting utility.

**Key Changes:**

### New Components & Utilities
- **`formatPhoneNumber()`** (`src/lib/formatters.ts`) — Formats Sri Lankan phone numbers for display (0750350109 → 0750 350 109). Supports local (0XX) and international (+94) formats. Does NOT modify stored values or API payloads.
- **`SearchableSelect`** (`src/components/ui/searchable-select.tsx`) — Searchable dropdown using Popover + Command (cmdk) for filtering long option lists by typing. Replaced district and city Select dropdowns in both order and quotation customer forms.
- **`HoverPopover`** (`src/components/shared/hover-popover.tsx`) — Hover-triggered popover for showing multiple items. Used in order and quotation tables for multi-category/multi-item display.

### Order Table Enhancements
- Multi-category/multi-item popovers: `+X Categories` and `+X More Items` with hover popovers
- Repeat customer badges: gold star with order count, identified by WhatsApp number
- Quick action hover colors: WhatsApp (green #22c55e), View (sky #0ea5e9), Edit (amber #f59e0b), Delete (red #ef4444)
- WhatsApp icon in quick actions (always visible, no opacity-0 transition)
- Paperclip icon with attachment count inline after order number
- Per-row hover state isolation (compound keys: `${order.id}-0`, `${order.id}-wa`)

### Quotation Table Enhancements
- Same multi-category/multi-item popovers as orders table
- Same quick action hover colors and visibility
- Convert-to-order now uses proper sequential order numbering (`initializeOrderSequence` + `generateOrderNumber`)
- Removed unused `useOrdersSettings` import

### Settings Page
- Quotation Settings: quotation numbering (prefix, start, padding) + expiry days in operational settings
- Numbering preview: live preview of order/quotation number format in settings
- Expense Settings: custom payment methods (add/remove, set default), linked to expense form
- Removed order defaults (default status, payment status, advance, workflow, default category, partial payments)
- Redesigned Reset System Data card with collapsible layout

### Forgot Password Flow
- Added `/auth/callback/recovery` route for password reset link handling
- Recovery link now lands on `/reset-password` page with proper password change form
- Fixed PKCE code verifier issue (code exchange now works in the callback route)
- Removed all debug console.log statements from the flow

### Per-Item Image Upload
- Images stored in Supabase Storage (`order-images` bucket) with per-item mapping
- Image preview thumbnails in order form (item card) and order table rows
- Click thumbnail to open lightbox
- Images deleted from storage when order is deleted or image is removed
- Attachment column in order items table with thumbnail or placeholder icon

**Files Created:**
- `src/components/shared/hover-popover.tsx`
- `src/components/ui/searchable-select.tsx`

**Files Modified:**
- `src/lib/formatters.ts` — added `formatPhoneNumber()`
- `src/components/orders/order-preview.tsx` — formatted phone/whatsapp display
- `src/components/quotations/quotation-preview.tsx` — formatted phone/whatsapp display
- `src/components/orders/customer-details-section.tsx` — replaced Select with SearchableSelect
- `src/components/quotations/quotation-customer-section.tsx` — replaced Select with SearchableSelect
- `src/app/(dashboard)/dashboard/orders/page.tsx` — multi-category popovers, hover colors, repeat badges, WhatsApp icon, paperclip
- `src/app/(dashboard)/dashboard/quotations/page.tsx` — same table enhancements + sequential order numbering on convert
- `src/app/(dashboard)/dashboard/settings/page.tsx` — quotation settings, payment methods, numbering preview, removed defaults, reset system data card redesign
- `src/components/orders/order-form.tsx` — item count label, image upload
- `src/components/orders/order-item-card.tsx` — image upload per item
- `src/app/(auth)/login/page.tsx` — forgot password link
- `src/app/(auth)/auth/callback/page.tsx` — recovery code exchange fix
- `src/app/(auth)/auth/callback/recovery/page.tsx` — (attempted, file may not be present)
- `src/app/(dashboard)/dashboard/expenses/page.tsx` — (assumed, payment methods changes)

**Database Changes:**
- Storage bucket `order-images` (created via app, not migration)

**Next Steps:**
- Subscription Page (current plan, usage meters, upgrade flow)
- Delivery Management Page
- Notifications Module

---

## Entry: Backup Import — Fix Generated Columns, Schema Drift & PK Conflicts
**Date:** 2026-07-17

**Summary:**
Fixed three categories of errors in the backup import flow (`handleImportAfterFile`):

1. **Generated columns** — Strip 6 generated columns (profit_margin, balance_remaining, total, total_price, grand_total, total_cost) from INSERT data since PostgreSQL rejects writes to GENERATED ALWAYS AS columns.
2. **Schema drift** — Only add `updated_at` to tables that actually have the column. Tables like order_items, inventory_transactions, quotation_items, order_status_history, and price_snapshots don't have `updated_at` in the schema.
3. **Primary key conflicts** — Changed from `insert()` to `upsert()` for ALL tables so importing into a database with existing records (same UUIDs) updates them instead of throwing duplicate key errors.

**Files Modified:**
- `src/app/(dashboard)/dashboard/settings/page.tsx` — Added GENERATED_COLUMNS map, TABLES_WITHOUT_UPDATED_AT set, upsert for all tables

**Next Steps:**
- Consider stripping generated columns from exports too (to keep backup files clean)
- Consider adding updated_at columns to tables that are missing them

---

## Entry: Documentation Audit & MD File Updates
**Date:** 2026-07-16

**Summary:**
Audited all 135 source files to verify the actual project state against documentation. Found and fixed significant discrepancies across all markdown files.

**Key Discrepancies Fixed:**
- COMPONENTS.md: Added 12+ undocumented components (StatsCard, DashboardSettingsDrawer, OnboardingEmpty, PageForm, FilterBar, GlobalSearchDialog/Popover, KeyboardShortcutsDialog, NetworkStatusIndicator, Dropdown, InputGroup, Pagination)
- CORE_DEVELOPMENT_GUIDELINES.md: Fixed Next.js version from 15 to 16
- DEVELOPMENT_LOG.md: Added entries for all work done since last Phase 2 entry
- TASKS.md: Corrected Delivery Module status (courier-settings.tsx exists), added new tasks
- CHANGELOG.md: Added Phase 2 entries (orders, products, inventory, expenses, quotations, reports, settings, dashboard enhancements, database migrations 002-013)
- KNOWN_ISSUES.md: Removed resolved issues (routes were implemented), updated MVP limitations
- REUSABLE_COMPONENTS.md: Added StatsCard, DataTable, FilterBar, PageForm, ConfirmDialog, GlobalSearch components
- DATABASE_SCHEMA.md: Added 7 new tables (categories, inventory_categories, expense_categories) and storage bucket

**Files Modified:**
- All 12 markdown files in the project root

**Database Changes:**
- None (documentation only)

**Next Steps:**
- Fix backup import errors (generated columns, schema drift, PK conflicts)
- Proceed with pending feature work (Subscription Page, Notifications)

---

## Entry: Phase 2 — Core Modules (Orders, Products, Inventory, Expenses, Quotations, Reports, Settings, Delivery)
**Date:** 2026-07-14

**Summary:**
All Phase 2 core business modules have been fully implemented.

### Orders Module
- Full CRUD with Supabase data fetching, in-page order form (create/edit with preview flow)
- In-Page Form Experience: breadcrumb header, sticky footer (Cancel, Save & Preview), smooth transitions
- Bulk order import via XLSX file parsing
- Filter bar: status tabs (new/ready/packed/dispatched/delivered/cancelled/returned), payment tabs (pending/advanced/paid), date filter with custom range, scheduled delivery pill
- Data table with sorting, pagination (25/50/100), column visibility, mobile card view
- Selection mode with floating bulk actions toolbar: Select by status/payment, Bulk status change, Bulk payment change, Bulk delete, XLSX export
- Editable status badges inline in table
- Order preview panel with status/payment quick-update
- Confirm dialogs for single and bulk delete with progress bars
- 11 component files in `src/components/orders/`

### Products Module
- Full CRUD with Supabase, product form with auto-calculated profit margin
- Category manager: add, rename, delete categories with category-specific options (size variants)
- Bulk import via XLSX file parsing
- Data table with active/inactive toggle, date filter, status tabs, XLSX export
- 3 component files in `src/components/products/`

### Inventory (Stock) Module
- Stock tracking with stock-in, stock-out, and adjustment forms
- Stock preview with transaction history
- Data table with search, filter, sort, pagination
- 4 files in `src/components/inventory/`

### Expenses Module
- Full CRUD with Supabase, expense form with category selection (inventory, other)
- Optional inventory stock linking (auto-update stock on expense save)
- Filter bar: category tabs, payment method, date range
- Data table with bulk actions, XLSX export

### Quotations Module
- Full CRUD with separate customer, items, and financial sections
- Quotation preview panel
- Data table with status management (draft/sent/accepted/rejected/converted/expired)
- Conversion workflow to orders
- 7 component files in `src/components/quotations/`

### Reports Module
- Three analytics tabs: Orders Analytics, Expenses Analytics, Financial Performance
- Orders: Revenue flow chart, top products ranked bar, status distribution donut
- Expenses: Expense trends mini bar, category breakdown donut, payment method breakdown
- Financial: P&L summary cards, revenue vs expenses comparison chart
- Section card layout with Recharts visualizations
- 4 component files in `src/components/reports/`

### Settings Page
- Full tabbed settings interface with collapsible section cards
- Business Profile: name, phone, address, district, social media links, logo upload with crop dialog
- Appearance: theme mode (light/dark/system), 5 accent colors (Ocean/Forest/Twilight/Blush/Sunset) + custom color picker, font family (Poppins/Lora/Caveat), font size (small/medium/large), background style (blobs/solid)
- Delivery Settings: Courier settings integration
- Preferences sub-page: timezone, date format, currency, order defaults (default status, payment status, payment method)
- Subscription: plan details, usage meters (coming soon)
- Danger Zone: data export, account deletion with confirmation
- ImageCropDialog component (react-easy-crop integration)
- Social media profile links (Facebook, Instagram, TikTok, LinkedIn with brand icons)

### Delivery Components
- CourierSettings component built and integrated into Settings page
- Courier locations hook and utility functions in `src/lib/delivery/`
- Shipment status tracking in orders module

### Additional Infrastructure
- Global Search dialog (Cmd+K) with recent searches persistence (Zustand + localStorage)
- Keyboard Shortcuts dialog listing all app shortcuts
- Network Status Indicator (online/offline detection)
- UI Store (command palette, notifications state)
- Dashboard Settings Drawer (toggle welcome message, deliveries, low stock, charts)
- 3 new UI components: InputGroup, Dropdown (Base UI), Pagination

### Database Migration Updates (beyond schema.sql)
- 002-008: RLS policy fixes (user policies, recursion fix, waybill, delete policies, source, categories, UPDATE WITH CHECK)
- 009: Soft delete RPC functions (SECURITY DEFINER) for products and inventory
- 010: inventory_categories + expense_categories tables
- 011: Remove restrictive CHECK constraints on expenses
- 012: Profile images storage bucket + RLS
- 013: Extended storage RLS to allow logos/ path

**Files Created:**
- src/app/(dashboard)/dashboard/orders/page.tsx
- src/app/(dashboard)/dashboard/products/page.tsx
- src/app/(dashboard)/dashboard/inventory/page.tsx
- src/app/(dashboard)/dashboard/expenses/page.tsx
- src/app/(dashboard)/dashboard/quotations/page.tsx
- src/app/(dashboard)/dashboard/reports/page.tsx
- src/app/(dashboard)/dashboard/reports/orders/page.tsx
- src/app/(dashboard)/dashboard/reports/expenses/page.tsx
- src/app/(dashboard)/dashboard/reports/financial/page.tsx
- src/app/(dashboard)/dashboard/settings/page.tsx
- src/app/(dashboard)/dashboard/settings/preferences/page.tsx
- src/app/(dashboard)/dashboard/settings/profile/page.tsx
- src/components/orders/ (11 files)
- src/components/products/ (3 files)
- src/components/inventory/ (4 files)
- src/components/quotations/ (7 files)
- src/components/reports/ (4 files)
- src/components/delivery/courier-settings.tsx
- src/components/shared/ (data-table, page-form, filter-bar, confirm-dialog, editable-status-badge, settings-section, image-crop-dialog, network-status-indicator, empty-state, global-search-dialog, global-search-popover, keyboard-shortcuts-dialog, page-header, theme-toggle)
- src/components/dashboard/ (stats-card, dashboard-settings-drawer, onboarding-empty)
- src/components/ui/ (input-group, dropdown, pagination)
- src/components/charts/ (3 files)
- src/lib/chart-utils.ts
- src/lib/date-utils.ts
- src/lib/delivery/courier-utils.ts
- src/stores/ (orders-settings-store, preferences-store, dashboard-settings-store, global-search-store, ui-store, sidebar-store)
- src/providers/preferences-provider.tsx
- src/hooks/ (use-courier-locations, use-keyboard-shortcuts, use-media-query, use-network-status)

**Database Changes:**
- 13 total migration files (001 through 013)

**Next Steps:**
- 1H-2 — Subscription Page (current plan, usage meters, plan comparison, upgrade flow, payment proof upload)
- 2D — Delivery Page (dedicated delivery management page beyond courier settings)
- Phase 3 — Notifications & Smart Customer Parser

---

## Entry: Dashboard Hero Cards — Enhanced Metrics
**Date:** 2026-07-14

**Summary:**
- Enhanced HeroStatCard to support trend indicators (up/down/neutral arrows with colored badges) and secondary content
- Updated dashboard data fetching to compute this-month and last-month order counts for month-over-month comparison
- Updated dashboard data fetching to compute open invoices count (orders not fully paid)
- Total Orders card now shows % change vs last month with trend arrow
- New Orders card shows the actual count
- Net Profit card shows "Sales: Rs. X | Expenses: Rs. Y" breakdown
- Pending Payments card now shows open invoice count with outstanding amount as secondary
- Removed unused `formatCompact` import
- Added DashboardSettingsDrawer for toggling visibility of dashboard sections
- Added StatsCard component for compact stats strip
- Added compact stats strip (to dispatch, to be delivered, rescheduled, to be returned)

**Files Modified:**
- src/components/dashboard/hero-stat-card.tsx (enhanced with trend + secondary props)
- src/app/(dashboard)/dashboard/page.tsx (updated hero metrics computation + data fetching)

**Next Steps:**
- 1H-2 — Subscription Page
- 2D — Delivery Page

---

## Entry: 1A — Project Scaffold
**Date:** 2026-07-09

**Summary:**
- Initialized Next.js 16.2.10 with TypeScript, App Router, Tailwind v4
- Installed all core dependencies (Supabase, TanStack Query, Zustand, Zod, RHF, Framer Motion, Recharts, Lucide, next-themes, date-fns, clsx, tailwind-merge, cva)
- Initialized shadcn/ui with base-nova style
- Installed 25 shadcn components (button, card, table, dialog, sheet, popover, select, command, tabs, dropdown-menu, breadcrumb, sonner, skeleton, progress, switch, checkbox, radio-group, input, label, badge, avatar, separator, scroll-area, textarea, tooltip)
- Created full folder structure: route groups, components, lib, hooks, stores, types, constants, providers, supabase/migrations
- Created .env.local and .env.example
- Build validated — compiles successfully

**Next Steps:**
- 1B — Theme System

---

## Entry: 1D — Supabase Client Utilities + Database Types
**Date:** 2026-07-09

**Summary:**
- Created Supabase browser, server, and middleware clients
- Created Next.js middleware protecting /dashboard and /admin
- Created comprehensive TypeScript types for all 20+ tables
- Build validated

---

## Entry: 1B — Theme System
**Date:** 2026-07-09

**Summary:**
- Replaced default globals.css with full OKLCH semantic color token system
- 5 accent presets via `data-accent` attribute: Ocean (blue), Forest (green), Twilight (purple), Blush (rose), Sunset (amber)
- Custom color picker support
- Created ThemeProvider, ThemeToggle, background style (blobs/solid)
- Multiple font families: Poppins, Lora, Caveat
- Font size options: small (14px), medium (16px), large (18px)
