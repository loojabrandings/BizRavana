# BizRavana

A modern, multi-tenant business management SaaS platform for Sri Lankan small and medium enterprises. Manage orders, products, inventory, expenses, quotations, deliveries, reports, and notifications — all in one place.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **UI** | shadcn/ui + Tailwind CSS v4 |
| **Animations** | Framer Motion + Tailwind CSS transitions |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Charts** | Recharts |
| **Tables** | TanStack Table |
| **Forms** | React Hook Form + Zod |
| **State** | Zustand + TanStack Query |
| **Icons** | Lucide React |
| **PDF** | jsPDF + jsPDF-AutoTable |
| **Hosting** | Vercel |

## Features

- **Smart Customer Parser** — Paste WhatsApp messages or any text to auto-extract customer name, phone, address, district, and city. Handles Sri Lankan phone formats, Sinhala transliteration variations ("Rathnapura" → "Ratnapura"), and reverse city lookup via courier data.
- **Dashboard** — Revenue overview, order statistics, top sales, low stock alerts, scheduled deliveries
- **Orders** — Full CRUD, bulk XLSX import, filter/sort/paginate, status tracking, dispatch & shipment tracking
- **Products** — Full CRUD, category manager, bulk XLSX import, auto-calculated profit margins
- **Inventory** — Stock in/out/adjustment, transaction history, stock preview
- **Expenses** — Full CRUD, category & payment filters, optional inventory stock linking
- **Quotations** — Full CRUD, preview panel, conversion to orders
- **Reports** — Orders analytics, expense analytics, financial P&L with Recharts visualizations
- **Delivery** — Courier settings, shipment status tracking, Royal Express API integration
- **Subscription** — Pricing comparison table, usage meters, payment proof upload, payment history
- **Settings** — Business profile, appearance (themes/accent/font), preferences, courier config, WhatsApp templates, data export/import/reset (deletes orders, products, categories, inventory, expenses, customers, quotations, deliveries, and user profiles)
- **WhatsApp** — Message template management (3 contexts), template selection dialogs, one-click send via wa.me
- **Global Search** — Cmd+K search with recent searches persistence
- **Keyboard Shortcuts** — Navigation, actions, arrow key dialog navigation, Delete key bulk operations
- **Cross-Device Settings Sync** — All operational settings (orders, quotations, expenses, preferences) are automatically synced to Supabase. Changes made on one device appear on another without any manual export/import. localStorage acts as fast local cache; Supabase is the cross-device source of truth.
- **Notifications** — Shared NotificationProvider with Supabase Realtime WebSocket. Bell icon with live unread count, popover with notification list, mark-as-read. Powered by:
  - **Admin broadcasts** — Create/send/schedule/cancel platform-wide notifications
  - **Automated rules** — 14 seed rules for trial, subscription, payment, usage, storage events
  - **Real-time delivery** — New notifications appear instantly via WebSocket
- **Admin Panel** — Full Super Admin dashboard at `/admin` with:
  - Dashboard overview (businesses, active subs, trials, pending payments, revenue)
  - Business management (list, detail with subscription + usage + payment history + danger zone)
  - Pending payments approval (receipt preview, admin notes, approve/reject workflows)
  - Plans management (CRUD, disable, duplicate)
  - Trials management (extend, lock, delete)
  - Subscription management (extend, change plan, suspend, cancel)
  - **Notification Management** (create/send/schedule/cancel broadcasts, manage automated rules)
  - Data Cleanup Queue, Storage Management, Activity Log, Admin Settings
  - JWT-based `is_super_admin` auth guard
  - Fully mobile-responsive with card layouts on small screens
- **Read Only Mode** — When subscription expires, dashboard enters read-only mode with upgrade banner
- **Trial Auto-Expiry** — Daily cron job automatically expires trial/subscription accounts
- **Authentication** — Email/password with Supabase Auth, 3-step registration wizard, forgot password flow
- **Multi-Tenant** — Row Level Security, business-scoped data isolation

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase project credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin-only routes) |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Registration, Callback
│   ├── (dashboard)/     # Dashboard, Orders, Products, etc.
│   ├── admin/           # Super Admin (13 pages)
│   └── api/             # API routes (user-emails, deliver-broadcast, message-templates)
├── components/
│   ├── admin/           # Mobile-responsive admin components
│   ├── charts/          # Rechart wrapper components
│   ├── dashboard/       # Dashboard-specific components
│   ├── delivery/        # Courier/delivery components
│   ├── inventory/       # Stock management components
│   ├── layout/          # Sidebar, BottomNav, DashboardLayout
│   ├── notifications/   # NotificationBell popover
│   ├── orders/          # Order CRUD components (includes CustomerDetailsSection with Smart Parser)
│   ├── products/        # Product CRUD components
│   ├── quotations/      # Quotation CRUD components
│   ├── reports/         # Analytics components
│   ├── shared/          # DataTable, PageForm, FilterBar, etc.
│   └── ui/              # shadcn/ui primitives
├── hooks/               # Custom React hooks
├── lib/                 # Utilities, formatters, Supabase clients, customer-parser
├── providers/           # Theme, Query, Preferences, ReadOnlyMode, Notification
├── stores/              # Zustand stores
├── types/               # Database TypeScript types
└── constants/           # App constants (districts, etc.)

supabase/
└── migrations/          # 26 SQL migrations (001–026)

> **Note:** 3 orphaned tables (`courier_cities`, `courier_districts`, `courier_waybills`) exist in Supabase with no migration coverage. See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).
```

## Database

The project uses PostgreSQL via Supabase with 28 tables, Row Level Security, and 26 database migrations. See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full documentation.

## Development

- **TypeScript** — Strict mode, no plain JavaScript
- **Lint** — `npm run lint`
- **Build** — `npm run build`
- **Dev** — `npm run dev`
