# BizRavana Reusable Components & Utilities

This file serves as a reference for the extracted modular components and utilities. By reusing these components, we maintain design consistency, avoid duplication, and ensure components can be optimized centrally.

## 1. Utilities

### `src/lib/formatters.ts`
Provides common string and number formatting functions.
- `getGreeting()`: Returns a time-based greeting ("Good morning", etc.).
- `formatCurrency(amount: number)`: Formats numbers as Sri Lankan Rupees (Rs.).
- `formatCompact(amount: number)`: Formats large numbers compactly (e.g., Rs. 10.5K).
- `formatPhoneNumber(value: string | null | undefined)`: Formats Sri Lankan phone numbers for display. Local (0750350109 → 0750 350 109), International (+94750350109 → +94 750 350 109). Returns empty string for null/undefined, original value unchanged for unrecognized formats.
- `formatEnumLabel(value: string)`: Converts snake_case enum values to human-readable labels.

### `src/lib/date-utils.ts`
Common date calculations and filters for reports and data tables.
- `getMonthRange(offset: 0 | -1)`: Gets start/end Date bounds for current or previous month.
- `getDateKey(value: string)`: Returns a simple YYYY-MM-DD string key from a date.
- `getDateRange(filter, from, to)`: Utility to parse predefined "today", "this_month", "last_month" and "custom" ranges.
- `dateFilterOptions`: Shared options array for filter dropdowns.

### `src/lib/chart-utils.ts`
Helper functions for calculating array data into charting structures.
- `createRevenueFlow(orders, expenses, window)`: Processes orders and expenses to create a sequential dataset for charting revenue vs expenses.
- `summarizeBy(rows, getLabel, getValue)`: Aggregates list data by label (e.g., Top Products, Top Categories) and sorts top 5.

### `src/lib/delivery/courier-utils.ts`
Utility functions for delivery/courier operations.
- Courier location data and helpers for Sri Lankan districts.

## 2. Dashboard Components

### `src/components/dashboard/hero-stat-card.tsx`
`HeroStatCard`: A prominent, styled metric card meant to be used on main hero sections (glassy backdrop, large typography). Supports trend badges (up/down/neutral with colored indicators) and secondary content.

### `src/components/dashboard/stats-card.tsx`
`StatsCard`: A compact metric card for the stats strip. Supports an icon with custom color class and a compact layout variant.

### `src/components/dashboard/status-list-card.tsx`
`StatusListCard`: A generic card wrapper for listing operational statuses (like "Scheduled Deliveries" or "Low Stock Alerts"). Features an icon header, count badge, optional "Manage" link, and handles empty states automatically.

### `src/components/dashboard/dashboard-skeleton.tsx`
`DashboardSkeleton`: A full-page loading placeholder for the dashboard layout.

### `src/components/dashboard/dashboard-settings-drawer.tsx`
`DashboardSettingsDrawer`: A slide-out drawer for toggling dashboard section visibility (welcome message, scheduled deliveries, low stock alerts, charts).

### `src/components/dashboard/onboarding-empty.tsx`
`OnboardingEmpty`: An onboarding welcome screen shown when a new business has no data yet.

## 3. Chart Components

### `src/components/charts/mini-bar-chart.tsx`
`MiniBarChart`: Renders a set of stacked micro-bars to compare two metrics (e.g., Revenue vs Expenses) using Framer Motion animations.

### `src/components/charts/ranked-bar-list.tsx`
`RankedBarList`: A beautifully animated list of items showing relative values as progress bars. Automatically handles scaling and rank badges. Perfect for "Top Sellers" or "Top Categories".

### `src/components/charts/donut-chart.tsx`
`DonutChart`: A donut/ring chart for visualizing distribution data with segments, values, and percentages.

## 4. Shared UI Components

### `src/components/shared/data-table.tsx`
`DataTable`: A fully featured data table component.
- Sortable column headers with visual indicators
- Pagination with page navigation + rows-per-page dropdown
- Desktop: click first column to enter selection mode
- Mobile: long-press to enter selection mode
- Bulk actions toolbar (floating on desktop, fixed bottom on mobile)
- Select all / deselect all checkbox
- Deleting rows show indeterminate progress bar
- Skeleton loading, empty state, and error state built-in
- Esc key to exit selection mode

### `src/components/shared/confirm-dialog.tsx`
`ConfirmDialog`: A confirmation dialog for destructive actions. Supports loading state, custom labels, and default/destructive variants.

### `src/components/shared/filter-bar.tsx`
`FilterBar`: A reusable filter bar with tab groups (status, payment, etc.), date range picker with custom range, and export button.

### `src/components/shared/page-form.tsx`
`PageForm`: An in-page form container for create/edit workflows. Features breadcrumb header, sticky footer with action buttons, smooth fade/slide transitions, and loading state.

### `src/components/shared/empty-state.tsx`
`EmptyState`: A placeholder for empty tables/lists. Supports standalone card mode and table shell mode (with column headers and optional checkbox column).

### `src/components/shared/editable-status-badge.tsx`
`EditableStatusBadge`: An interactive badge wrapped in a DropdownMenu that lets users quickly switch statuses inline (e.g. updating Order Status or Payment Status directly from a data table).

### `src/components/shared/page-header.tsx`
`PageHeader`: A consistent page title bar with optional action button (link or click handler).

### `src/components/shared/settings-section.tsx`
`SettingsSection`: A section wrapper for settings page groups with disabled state and optional badge.

### `src/components/shared/theme-toggle.tsx`
`ThemeToggle`: A dropdown for switching light/dark/system mode and accent color. Hydration-safe with mounted check.

### `src/components/shared/image-crop-dialog.tsx`
`ImageCropDialog`: An image cropping dialog using react-easy-crop. Supports round and rectangular crop shapes, zoom slider, and upload callback.

### `src/components/shared/global-search-dialog.tsx`
`GlobalSearchDialog`: A full-screen dialog for searching the app. Triggered by Cmd+K / Ctrl+K. Features recent searches (persisted to localStorage) and fuzzy search across app routes.

### `src/components/shared/keyboard-shortcuts-dialog.tsx`
`KeyboardShortcutsDialog`: A dialog that displays all available keyboard shortcuts for the application.

### `src/components/shared/network-status-indicator.tsx`
`NetworkStatusIndicator`: A visual indicator that shows the user's online/offline connection status.

### `src/components/shared/hover-popover.tsx`
`HoverPopover`: A hover-triggered popover component for displaying multi-item lists without clicking. Used in order and quotation table columns (categories, items) to show additional content on hover.

### `src/components/ui/searchable-select.tsx`
`SearchableSelect`: A searchable dropdown select using Popover + Command (cmdk). Replaces the standard Select component when options are long enough to benefit from keyboard filtering (districts, cities, etc.). Trigger styled to match SelectTrigger (h-9, border, chevron). Features search input, cmdk-based filtering, check icon on selected item, and auto-close on selection. Used in order and quotation customer forms for district and city selection.

## 6. Dialog System (UI Primitives)

Premium dialog/modal system built on `@base-ui/react/dialog` with a standardized size system, consistent layout, and polished animations.

### `src/components/ui/dialog.tsx`
**Exports:** `Dialog`, `DialogTrigger`, `DialogClose`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`

Base UI primitives for all dialogs in the application. Key features:
- **Size system**: `size="sm"`(480px), `"md"`(640px), `"lg"`(840px), `"xl"`(1080px), `"full"`(90vw) via optional `size` prop on `DialogContent`
- **Overlay**: `bg-black/50` (consistently dark in both themes), `backdrop-blur-[4px]`, fade animation (200ms in, 150ms out)
- **Content**: 16px radius (`rounded-2xl`), `ring-1 ring-border/50`, `shadow-xl`, 24px padding (`p-6`), 85vh max-height with custom thin scrollbar
- **Animations**: fade + scale (95%→100%), 200ms ease-out open, 150ms ease-out close, no bounce
- **Header**: `border-b border-border/50 pb-5` visual divider, `shrink-0`
- **Footer**: `border-t border-border/50 mt-6 pt-5`, flex justify-end
- **Title**: `text-xl font-semibold tracking-tight` (20px)
- **Description**: `text-sm text-muted-foreground/70` (14px)
- **Close button**: ghost icon button, `top-4 right-4`, hidden via `showCloseButton={false}`

### `src/components/shared/confirm-dialog.tsx`
**Export:** `ConfirmDialog`
**Props:** `{ open, onOpenChange, title, description?, confirmLabel?, cancelLabel?, variant? "default" | "destructive", onConfirm, loading? }`

Reusable confirmation dialog using the premium dialog primitives. Features:
- Uses `size="sm"` for compact layout
- Default variant: standard title + description + Cancel/Confirm buttons
- Destructive variant: `TriangleAlert` icon with `bg-destructive/10` tint above the title
- Loading state: spinner on confirm button, both buttons disabled during async operations

### Selective Dialog Blur

When any dialog opens, the main dashboard content (header + pages) gets `filter: blur(2px)` while the sidebar remains crisp. Implemented via CSS `:has()` in `globals.css`:

```css
[data-main-content] { transition: filter 180ms ease; }
body:has([data-slot="dialog-overlay"][data-open]) [data-main-content] {
  filter: blur(2px);
  transition: filter 220ms ease;
  pointer-events: none;
}
```

The `[data-main-content]` attribute is set on the dashboard's main content wrapper in `DashboardLayout`.

## 7. Toast Notification System

Premium toast notification system built on `sonner` v2, inspired by Linear, Stripe, and Vercel.

### `src/components/ui/sonner.tsx`
**Export:** `Toaster`

Global toast container placed in `layout.tsx`. Configuration:
- **Position**: top-right (desktop), top-center (mobile)
- **Max visible**: 5 toasts (desktop), auto-queues overflow
- **Width**: 360px desktop, `calc(100% - 32px)` mobile
- **Duration**: 5000ms default
- **Gap**: 10px between toasts
- **Swipe**: right-to-dismiss
- **Icons**: `CircleCheckIcon`, `CircleXIcon`, `TriangleAlertIcon`, `InfoIcon`, `Loader2Icon` with CSS-colored per-type variants
- **Close button**: enabled, hidden on desktop → visible on toast hover, always visible on mobile
- **Custom CSS**: Full classNames mapping for toast, title, description, icon, close, action, cancel

### Toast Styling (globals.css)

| Element | Style |
|---|---|
| **Card** | 12px radius, white/dark neutral background, 1px subtle border, soft shadow |
| **Left accent** | 3px `::before` colored bar: green(success), red(error), amber(warning), blue(info) |
| **Hover** | Elevated shadow (`--toast-shadow-hover`) |
| **Title** | 14px, 600 weight, 1.45 line-height |
| **Description** | 13px, 400 weight, 1.5 line-height, 0.65 opacity, max 2 lines (`-webkit-line-clamp: 2`) |
| **Action button** | Small text button, primary color, solid fill on hover |
| **Cancel button** | Subtle border button, 0.55 opacity → 1 on hover |
| **Mobile** | Center-aligned, `calc(100%-32px)` width, smaller padding/text, close always visible |
| **Dark mode** | `oklch(0.22 0 0)` background, adjusted shadows and accents |

### Usage

```tsx
import { toast } from "sonner";

toast.success("Order Created", {
  description: "Order #245 has been created successfully.",
});

toast.error("Failed to Import", {
  description: "Unable to process 12 records.",
  action: { label: "Retry", onClick: () => retry() },
});

toast.loading("Generating PDF...");
```

No business logic or API changes were made — the `sonner` API is unchanged.

## 8. WhatsApp Templates System

A full-featured WhatsApp message template management system with three independent template contexts, multi-template support, and seamless WhatsApp integration.

### Architecture Overview

```
Settings Tab (whatsapp-templates)
  └─ WhatsAppTemplatesSettings (main component)
       ├─ ContextPill (context selector)
       ├─ TemplateListItem (template row with 3-dots menu)
       ├─ PlaceholderChips (clickable placeholder insertion)
       ├─ WhatsAppPreview (live preview)
       ├─ ConfirmDialog (delete confirmation)
       └─ Rename Dialog (inline rename)

WhatsApp Button Integration
  └─ useWhatsAppAction (hook for any WhatsApp button)
       ├─ TemplateSelectionDialog (>1 template → picker)
       ├─ NoTemplateDialog (0 templates → create prompt)
       └─ sendWhatsAppTemplate (opens WhatsApp)

Data Layer
  └─ message-templates.ts (API-fetch CRUD)
       └─ /api/message-templates/route.ts (Next.js API route with service_role bypass)
            └─ admin.ts (Supabase admin client)
                 └─ message_templates (DB table, migration 015)

Rendering
  └─ template-engine.ts (reusable placeholder engine)
       ├─ renderTemplate() — core renderer with date formatting
       └─ renderMessageTemplate() — API-friendly wrapper

Data Mapping
  └─ whatsapp-actions.ts
       ├─ orderRowToTemplateData()
       ├─ orderPreviewToTemplateData()
       └─ quotationPreviewToTemplateData()
```

### Core Components

#### `WhatsAppTemplatesSettings` — `src/components/whatsapp/whatsapp-templates-settings.tsx`
**Export:** `WhatsAppTemplatesSettings`

Tab content for Settings → WhatsApp Templates. Features:
- Three-context segmented control (Order Table, Order Preview, Quotation Preview) with per-context template counts
- **Desktop layout**: Saved Templates (full-width row) + Placeholders (full-width row) stacked above Editor + Live Preview (two-column row)
- **Mobile layout**: Sequential sections — Saved Templates card → Editor (with inline searchable placeholder chips) → Live Preview
- Saved template list with selection indicator dot, title, Default badge, relative timestamp, and vertical 3-dots action menu (Duplicate, Set as Default, Rename, Delete with confirmation)
- Template Title input (max 80 chars, duplicate title validation, minimum 2 chars)
- Large message content textarea with character count
- Live WhatsApp-style preview with placeholder substitution and simulated date formatting
- Clickable placeholder chips grouped by category, filtered by context, with search
- Placeholder validation warnings (unknown, malformed, unsupported formatting) displayed below editor
- Delete confirmation dialog via `ConfirmDialog`
- Rename dialog with Enter/Escape keyboard shortcuts
- Save/Create button with loading state
- Unsaved changes indicator (badge + Reset button)

#### `useWhatsAppAction` — `src/components/whatsapp/use-whatsapp-action.tsx`
**Export:** `useWhatsAppAction() → { handleAction, renderDialogs, loading }`

A React hook that manages WhatsApp template selection flow:
- **0 templates**: Shows `NoTemplateDialog` → "Create Template" navigates to settings with context preselected
- **1 template**: Sends WhatsApp immediately (no dialog)
- **>1 templates**: Shows `TemplateSelectionDialog` sorted with default first

Call `handleAction(context, data, phone, businessId?)` and render `renderDialogs()` once in the parent.

#### `TemplateSelectionDialog` — `src/components/whatsapp/template-selection-dialog.tsx`
**Export:** `TemplateSelectionDialog`

Compact dialog for selecting a WhatsApp template when multiple exist:
- Sorted list with default template first
- Radio-style selection with animated ring
- Template title, Default badge, and truncated message preview
- "Manage Templates" button → navigates to settings
- "Cancel" and "Send" buttons

#### `NoTemplateDialog` — `src/components/whatsapp/no-template-dialog.tsx`
**Export:** `NoTemplateDialog`

Empty-state dialog shown when no template exists for a context:
- Warning icon with descriptive message
- "Create Template" → navigates to Settings → WhatsApp Templates with context preselected
- "Cancel" button

### Services & Utilities

#### `src/lib/template-engine.ts`
**Exports:** `renderTemplate`, `renderMessageTemplate`, `renderItemDetailsGrouped`, `TemplateData`, `TemplateLineItem`, `TemplateContext`, `ALL_PLACEHOLDERS`, `getPlaceholdersForContext`, `DEFAULT_TEMPLATES`

Reusable placeholder engine for message templates:
- `renderTemplate(template, data, options?)` — Replaces `{{placeholders}}` with data values. Supports:
  - All order and quotation fields (customer, payment, delivery, items)
  - `{{item_details}}` — auto-generates grouped, formatted item list by category
  - Financial fields formatted as "Rs. X,XXX"
  - Date fields formatted per business dateFormat preference (YYYY-MM-DD, DD/MM/YYYY, etc.)
  - Unknown placeholders remain unchanged in output
  - WhatsApp formatting (`*bold*`, `_italic_`, `~strikethrough~`) passed through
- `renderMessageTemplate({ content, context?, data, businessSettings? })` — API-friendly wrapper
- `ALL_PLACEHOLDERS` — maps each context to its placeholder groups
- `DEFAULT_TEMPLATES` — preset default content for each context

#### `src/lib/supabase/message-templates.ts`
**Exports:** `MessageTemplate`, `TemplateContext`, `toDbContext`, `toUiContext`, `fetchTemplates`, `fetchAllTemplates`, `createTemplate`, `updateTemplate`, `setDefaultTemplate`, `deleteTemplate`, `duplicateTemplate`, `getUserBusinessId`, `getCurrentUserId`

Client-side CRUD operations via API routes (`/api/message-templates`):
- All operations use fetch() to Next.js API routes (bypasses RLS via service_role key)
- `fetchTemplates(businessId, context?)` — optionally filter by template context
- `fetchAllTemplates(businessId)` — returns templates across all contexts
- Auto-handles `TemplateContext` enum conversion via `toDbContext`/`toUiContext`

#### `src/components/whatsapp/whatsapp-actions.ts`
**Exports:** `orderRowToTemplateData`, `orderPreviewToTemplateData`, `quotationPreviewToTemplateData`, `sendWhatsAppTemplate`, `openWhatsAppWithMessage`, `OrderTableRow`, `OrderPreviewData`, `QuotationPreviewData`

Pure data mappers and WhatsApp URL generator:
- Maps Order table rows, OrderPreview form data, and QuotationPreview form data to the unified `TemplateData` type
- `sendWhatsAppTemplate(template, data, phone)` — renders template and opens WhatsApp
- `openWhatsAppWithMessage(phone, message)` — opens `wa.me` URL with encoded message

### Database

**Table:** `message_templates` (migration 015)
- Supports soft delete (`deleted_at`, `deleted_by`)
- Unique constraint on active title per (business_id, template_context)
- Unique constraint on single default per (business_id, template_context)
- Indexes on business_id, template_context, is_active, is_default
- RLS enforced via existing `get_user_business_id()` function
- API routes bypass RLS using service_role key for reliable CRUD

### Integration Points

| Location | Context | Mapper |
|---|---|---|
| Orders table (WhatsApp icon in row) | `order_table_whatsapp` | `orderRowToTemplateData` |
| Order Preview (WhatsApp button) | `order_preview_whatsapp` | `orderPreviewToTemplateData` |
| Quotation Preview (WhatsApp button) | `quotation_preview_whatsapp` | `quotationPreviewToTemplateData` |

Each integration uses `useWhatsAppAction` hook and renders `renderDialogs()` in the parent component.
