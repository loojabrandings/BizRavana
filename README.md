# BizRavana

A modern, multi-tenant business management SaaS platform for Sri Lankan small and medium enterprises. Manage orders, products, inventory, expenses, quotations, deliveries, and reports — all in one place.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **UI** | shadcn/ui + Tailwind CSS v4 |
| **Animations** | Framer Motion + Tailwind CSS transitions |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Charts** | Recharts |
| **Tables** | TanStack Table |
| **Forms** | React Hook Form + Zod |
| **State** | Zustand + TanStack Query |
| **Icons** | Lucide React |
| **Hosting** | Vercel |

## Features

- **Dashboard** — Revenue overview, order statistics, top sales, low stock alerts, scheduled deliveries
- **Orders** — Full CRUD, bulk XLSX import, filter/sort/paginate, status tracking, dispatch & shipment tracking
- **Products** — Full CRUD, category manager, bulk XLSX import, auto-calculated profit margins
- **Inventory** — Stock in/out/adjustment, transaction history, stock preview
- **Expenses** — Full CRUD, category & payment filters, optional inventory stock linking
- **Quotations** — Full CRUD, preview panel, conversion to orders
- **Reports** — Orders analytics, expense analytics, financial P&L with Recharts visualizations
- **Delivery** — Courier settings, shipment status tracking, Royal Express API integration
- **Settings** — Business profile, appearance (themes/accent/font), preferences, courier config, WhatsApp templates, shipping label defaults, data export/import/reset
- **Shipping Labels** — A5 PDF generation with Code 128 barcode, business header, handling instructions, combined multi-page PDF printing, reprint support
- **WhatsApp** — Message template management (3 contexts), template selection dialogs, live preview, one-click send via wa.me
- **Global Search** — Cmd+K search with recent searches persistence
- **Keyboard Shortcuts** — Navigation, actions, arrow key dialog navigation, Delete key bulk operations
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

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Registration, Callback
│   ├── (dashboard)/     # Dashboard, Orders, Products, etc.
│   └── admin/           # Super Admin (future)
├── components/
│   ├── charts/          # Reusable chart components
│   ├── dashboard/       # Dashboard-specific components
│   ├── delivery/        # Courier/delivery components
│   ├── inventory/       # Stock management components
│   ├── layout/          # Sidebar, BottomNav, DashboardLayout
│   ├── orders/          # Order CRUD components
│   ├── products/        # Product CRUD components
│   ├── quotations/      # Quotation CRUD components
│   ├── reports/         # Analytics components
│   ├── shared/          # DataTable, PageForm, FilterBar, etc.
│   └── ui/              # shadcn/ui primitives
├── hooks/               # Custom React hooks
├── lib/                 # Utilities, formatters, Supabase clients
├── providers/           # Theme, Query, Preferences providers
├── stores/              # Zustand stores
├── types/               # Database TypeScript types
└── constants/           # App constants (districts, etc.)
```

## Database

The project uses PostgreSQL via Supabase with 23 tables, Row Level Security, and 13 database migrations. See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full documentation.

## Development

- **TypeScript** — Strict mode, no plain JavaScript
- **Lint** — `npm run lint`
- **Build** — `npm run build`
- **Dev** — `npm run dev`
