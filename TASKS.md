# Bizravana — Task Management

## Todo

- **1H-2** — Subscription Page (current plan, usage meters, plan comparison, upgrade flow, payment proof upload)
- **2D** — Delivery Management Page (dedicated delivery tracking/list page beyond the courier settings already in Settings)
- **1H-4** — Notifications Module (in-app notification center, notification preferences)
- **Phase 3** — Smart Customer Parser (parse WhatsApp/pasted customer data)
- **Phase 4** — Subscription & Admin (Lock logic, Super Admin dashboard, data cleanup)
- **Phase 5** — Advanced Features (AI Assistant, WhatsApp, Automations, Courier API, Team, PWA)
- **Documentation** — Create API.md for any API endpoints
- **Courier Snapshot** — Store courier metadata (provider, handling instructions, date option, note) on order at dispatch time for historical label accuracy
- **Per-Shipment Override UI** — Allow adjusting handling instructions and optional note in the Shipping Label Dialog before printing
- **Distinct Handling Icons** — Use per-type monochrome icons (⚠, ☂, ⬆, ◆, ⊘) instead of generic △ prefix

## In Progress

*(None)*

## Completed

- **Premium Toast Redesign** (2026-07-19): Complete visual overhaul of sonner toast system with Linear/Stripe-inspired design, per-type accent bars, premium animations, dark mode support
- **Premium Dialog Redesign** (2026-07-19): Complete visual overhaul with standardized size system, dark overlay, fade+scale animations, selective content blur (sidebar stays crisp), 24px padding, border dividers
- **Dark Overlay Fix** (2026-07-19): Changed dialog overlay from `bg-foreground/50` to `bg-black/50` for consistent dark appearance in both themes
- **Scheduled Delivery Click** (2026-07-19): Clicking dashboard delivery items navigates to orders page with search pre-applied
- **"PDF" → "Invoice" Button** (2026-07-19): Changed label in order and quotation preview headers

- **Shipping Label Feature** (2026-07-19): A5 PDF generation with Code 128 barcode, integrated into dispatch flow, three reprint entry points. Combined bulk multi-page PDF generation. Label redesign with handling instructions, business header, and settings UI.
- **Dashboard Card Height Responsiveness** (2026-07-19): StatusListCard heights adapt dynamically based on content
- **Bulk Delete Keyboard Shortcut** (2026-07-19): Del key triggers bulk delete on all table pages
- **Arrow Key Dialog Navigation** (2026-07-19): DispatchDialog and TemplateSelectionDialog support keyboard navigation
- **Order Table Quick Actions** (2026-07-19): Clustered icons collapsed into 3-dot dropdown

- **Order/Quotation Table Enhancements** (2026-07-17): Multi-category/multi-item hover popovers, repeat customer badges, quick action hover colors, WhatsApp icons, sequential order numbering on convert, paperclip with attachment count
- **Searchable District/City Dropdowns** (2026-07-17): Created SearchableSelect component, applied to order and quotation forms
- **Phone Number Formatting** (2026-07-17): Created formatPhoneNumber() utility for Sri Lankan phone format, applied to order/quotation previews
- **Quotation Settings** (2026-07-17): Quotation numbering + expiry days in operational settings
- **Expense Settings — Payment Methods** (2026-07-17): Custom payment methods with default, linked to expense form
- **Forgot Password Flow** (2026-07-17): Recovery link lands on reset-password page, fixed PKCE code verifier
- **Per-Item Image Upload** (2026-07-17): Images per order item in Supabase Storage, previews in table rows

- **1B — Theme System** (2026-07-09): OKLCH semantic tokens, light/dark/system, 5 accent presets (Blue/Green/Purple/Rose/Amber) + custom color picker, ThemeProvider, ThemeToggle, background styles, font family/size options
- **1C — Supabase Schema + RLS** (2026-07-09): 20+ tables, 15+ indexes, RLS on all tables, helper functions, 4 subscription plans seeded. 13 total migration files (001-013) including storage buckets, soft-delete RPCs, categories, inventory/expense categories
- **1D — Supabase Client Utilities** (2026-07-09): Browser, server, middleware clients, database types, Next.js middleware with proxy convention
- **1E — Core Providers + Stores + Hooks** (2026-07-09): QueryProvider, ThemeProvider, PreferencesProvider, Zustand stores (sidebar, ui, dashboard-settings, orders-settings, global-search, preferences), hooks (media-query, keyboard-shortcuts, network-status, courier-locations), constants (districts)
- **1F — Layout Shell** (2026-07-09): Sidebar (collapsible), BottomNav (mobile), DashboardLayout (responsive), NavItemIndicator
- **1G — Auth Pages** (2026-07-09): Login, 3-step Registration wizard, auth callback
- **1H — Dashboard Page** (2026-07-14): Hero stat cards with trends, compact stats strip, revenue charts, top sales (category/item tabs), scheduled deliveries, low stock alerts, dashboard settings drawer, all with Framer Motion animations
- **2A — Orders Module** (2026-07-14): Full CRUD, in-page form, bulk import, filter bar, data table with selection mode, editable badges, preview panel, dispatch/shipment tracking dialogs
- **2B — Products Module** (2026-07-14): Full CRUD, category manager (add/rename/delete), bulk import, active/inactive toggle
- **2C — Inventory Module** (2026-07-14): Stock in/out/adjustment, transaction history, stock preview
- **2D — Expenses Module** (2026-07-14): Full CRUD, category filter, inventory link, payment method
- **2E — Quotations Module** (2026-07-14): Full CRUD, customer/items/financial sections, preview, conversion to orders
- **2F — Reports Module** (2026-07-14): Orders/Expenses/Financial analytics with Recharts visualizations
- **2G — Settings Page** (2026-07-14): Full tabbed settings (Business Profile, Appearance, Preferences, Delivery/Courier, Subscription, Danger Zone), image crop dialog, social media links
- **2H — Delivery Components** (2026-07-14): CourierSettings component in Settings, courier utils/hooks, shipment tracking in orders
- **Dashboard Enhancements** (2026-07-14): Trend badges, secondary content, compact stats strip, dashboard settings drawer, low stock + scheduled deliveries cards
- **Global Search & UX** (2026-07-14): Global search dialog (Cmd+K), keyboard shortcuts dialog, network status indicator, UI store
- **Database Migrations 002-013** (2026-07-14): RLS fixes, waybill, order source, categories table, UPDATE WITH CHECK policies, soft-delete RPCs, inventory/expense categories, expense constraint removal, profile images storage + RLS
- **Documentation Audit** (2026-07-16): Updated all 12 markdown files to match actual project state after discovering significant discrepancies
