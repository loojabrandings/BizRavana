# Bizravana — Component Documentation

> Last updated: 2026-07-19

---

## shadcn/ui Base Components

The following shadcn/ui components are installed and available for use. These are unstyled primitives that use Tailwind CSS variables for theming. All belong to `src/components/ui/`.

| Component | Installed | Notes |
|-----------|-----------|-------|
| Button | ✅ | With icon, loading, gradient variants |
| Input | ✅ | Base input control |
| Label | ✅ | Label component for form fields |
| Card | ✅ | Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription |
| Badge | ✅ | Inline status badges with variants (default, secondary, destructive, outline) |
| Avatar | ✅ | User/logo avatars with fallback |
| Dialog | ✅ | Modal dialogs with close-button control |
| Sheet | ✅ | Slide-out panels (used for mobile sidebar, settings drawers) |
| Popover | ✅ | Contextual popovers for filters, sorting, quick settings |
| Select | ✅ | Dropdown selects |
| Command | ✅ | Command palette / search menu (kbd shortcut) |
| Table | ✅ | TanStack Table-ready table primitives |
| Tabs | ✅ | Tabbed navigation |
| DropdownMenu | ✅ | Context menus, row actions, "More" menu |
| Skeleton | ✅ | Loading skeleton placeholders |
| Tooltip | ✅ | Hover tooltips |
| Separator | ✅ | Visual dividers |
| ScrollArea | ✅ | Custom scrollable areas |
| Switch | ✅ | Toggle switches (settings) |
| Progress | ✅ | Progress bars (with indeterminate mode) |
| Checkbox | ✅ | Multi-select, form checkboxes |
| RadioGroup | ✅ | Radio button groups |
| Textarea | ✅ | Multi-line text input |
| Breadcrumb | ✅ | Breadcrumb navigation trails |
| Sonner | ✅ | Toast notifications |
| Pagination | ✅ | Custom pagination with page navigation + rows-per-page dropdown |
| InputGroup | ✅ | Composable input groups with addons, buttons, text |
| Dropdown | ✅ | Base UI Select-based dropdown with icons, labels, scroll indicators |
| SearchableSelect | ✅ | Searchable dropdown using Popover + Command (cmdk) for long option lists |

---

## Custom Application Components

### Layout Components (`src/components/layout/`)

#### `Sidebar`
- **Purpose**: Desktop collapsible sidebar with grouped navigation
- **Props**: None (self-contained, uses sidebar-store)
- **Features**:
  - Collapsible: icons-only or icons+titles
  - Grouped navigation (Main Menu, System)
  - Expandable sub-menus (Reports, Settings)
  - Quick action button (New Order)
  - Active route highlighting
  - Collapse toggle at bottom
  - Zustand-powered collapse state
- **States**: Expanded (default), collapsed (icons-only)

#### `BottomNav`
- **Purpose**: Mobile persistent bottom navigation bar
- **Props**: None (self-contained)
- **Features**:
  - Home, Orders, Expenses quick access
  - Center floating + button for quick actions (New Order, Add Expense)
  - "More" dropdown for Delivery, Reports, Settings
- **States**: Visible on mobile (< lg breakpoint), hidden on desktop

#### `DashboardLayout`
- **Purpose**: Main dashboard layout wrapper combining Sidebar, header, content, BottomNav
- **Props**: `children: React.ReactNode`
- **Features**:
  - Desktop: Sidebar + header + main content
  - Mobile: Sheet drawer (mobile sidebar) + BottomNav
  - Sticky header with search bell and settings icons
- **States**: Desktop mode, Mobile mode

#### `NavItemIndicator`
- **Purpose**: Animated active route indicator for navigation items
- **Props**: Uses Framer Motion layoutId for smooth transitions

### Dashboard Components (`src/components/dashboard/`)

#### `HeroStatCard`
- **Purpose**: Prominent, styled metric card for hero sections
- **Props**: `{ label: string; value: string | number; icon: LucideIcon; trendBadge?: HeroStatTrendBadge; secondary?: ReactNode; href?: string }`
- **Features**: Glassy backdrop, trend indicators (up/down/neutral arrows), secondary content
- **States**: With/without trend badge, with/without link

#### `StatsCard`
- **Purpose**: Compact stat card for the stats strip
- **Props**: `{ label: string; value: number; icon: LucideIcon; iconColor: string; compact?: boolean }`
- **Features**: Compact variant for grid display

#### `StatusListCard`
- **Purpose**: Card wrapper for listing operational statuses
- **Props**: `{ title: string; icon: LucideIcon; count: number; manageLink?: string; activeColorClass?: string; activeBgClass?: string; emptyMessage?: string; children?: ReactNode }`
- **Features**: Icon header, count badge, optional "Manage" link, handles empty states

#### `DashboardSkeleton`
- **Purpose**: Full-page loading placeholder for the dashboard

#### `OnboardingEmpty`
- **Purpose**: Onboarding welcome screen shown when the business has no data yet

### Chart Components (`src/components/charts/`)

#### `MiniBarChart`
- **Purpose**: Stacked micro-bars comparing two metrics (Revenue vs Expenses)
- **Features**: Framer Motion animations, responsive sizing

#### `RankedBarList`
- **Purpose**: Animated list of items showing relative values as progress bars
- **Features**: Auto-scaling, rank badges, Framer Motion animations

#### `DonutChart`
- **Purpose**: Donut/ring chart for distribution visualization
- **Features**: Segments with values and percentages

### Shared Components (`src/components/shared/`)

#### `PageHeader`
- **Purpose**: Consistent page title bar with optional action button
- **Props**: `{ title: string; description?: string; action?: { label: string; href?: string; onClick?: () => void } }`

#### `EmptyState`
- **Purpose**: Placeholder for empty tables/lists
- **Props**: `{ icon?: ReactNode; title: string; description?: string; action?: ReactNode; columns?: EmptyStateColumn[]; showCheckbox?: boolean }`
- **Variants**: Standalone card, table shell with column headers

#### `DataTable`
- **Purpose**: Full-featured data table with selection, sorting, pagination, bulk actions
- **Props**: `{ columns: ColumnDef<T>[]; data: T[]; keyExtractor; loading?; error?; empty?; sort?; pagination?; selection?; renderMobileCard?; deletingKeys? }`
- **Features**:
  - Sortable column headers
  - Pagination with page navigation + rows-per-page
  - Desktop: Click first column to enter selection mode
  - Mobile: Long-press to enter selection mode
  - Bulk actions toolbar (floating on desktop, bottom bar on mobile)
  - Deleting rows show indeterminate progress bar
  - Skeleton loading states
  - Built-in empty + error states
  - Keyboard support (Esc to exit selection mode)
  - Select all / deselect all checkbox

#### `FilterBar`
- **Purpose**: Reusable filter bar with tabs, date range, and action buttons
- **Features**: Status tabs, payment tabs, date range picker, custom range, export button

#### `PageForm`
- **Purpose**: In-page form container for create/edit workflows
- **Props**: `{ breadcrumb: { label: string; href?: string }[]; title: string; onSubmit; children; loading?; footer?: ReactNode; backHref? }`
- **Features**: Breadcrumb header, sticky footer, smooth transitions, loading state

#### `ConfirmDialog`
- **Purpose**: Destructive action confirmation dialog
- **Props**: `{ open; onOpenChange; title; description?; confirmLabel?; cancelLabel?; variant?: "default" | "destructive"; onConfirm; loading? }`
- **Features**: Loading spinner on confirm button, customizable labels, destructive variant

#### `EditableStatusBadge`
- **Purpose**: Inline status badge with dropdown for quick status changes
- **Props**: `{ value: string; options: { value: string; label: string }[]; colorMap: Record<string, string>; onUpdate }`
- **Features**: DropdownMenu integration, color-coded badges, hover scale animation

#### `SettingsSection`
- **Purpose**: Section wrapper for settings page groups
- **Props**: `{ title: string; children?; disabled?; badge?; className? }`
- **Features**: Disabled state, optional badge, ring-1 border

#### `ThemeToggle`
- **Purpose**: Light/Dark/System mode + accent color switcher
- **Features**: DropdownMenu with theme + accent options, hydration-safe

#### `ImageCropDialog`
- **Purpose**: Profile/logo image cropping dialog
- **Props**: `{ open; onOpenChange; imageSrc; onCropComplete; cropShape?; title? }`
- **Features**: react-easy-crop integration, zoom slider, round/rect crop shapes

#### `GlobalSearchDialog`
- **Purpose**: Searchable dialog for navigating the app
- **Features**: Keyboard shortcut (Cmd+K / Ctrl+K), recent searches, fuzzy search

#### `GlobalSearchPopover`
- **Purpose**: Lightweight search popover for quick navigation

#### `KeyboardShortcutsDialog`
- **Purpose**: Displays available keyboard shortcuts
- **Features**: Lists all app keyboard shortcuts

#### `NetworkStatusIndicator`
- **Purpose**: Shows online/offline connection status
- **Features**: Visual indicator when offline, auto-reconnect detection

### Orders Components (`src/components/orders/`)

| Component | Purpose |
|-----------|---------|
| `OrderForm` | In-page order create/edit form |
| `OrderPreview` | Order summary preview panel |
| `OrderItemsSection` | Line items management section |
| `OrderItemCard` | Single order item display card |
| `CustomerDetailsSection` | Customer info section for order/quotation forms |
| `PaymentSection` | Payment method, advance, discount inputs |
| `ProductSearchPopover` | Quick product search + add to order |
| `BulkOrderImportForm` | XLSX bulk order import |
| `DispatchDialog` | Dispatch confirmation dialog |
| `ShipmentStatusPanel` | Shipment tracking status panel |
| `TrackShipmentDialog` | Track shipment dialog |
| `OrderManagementSection` | Order management panel |

### Shared Components (`src/components/shared/`)

#### `HoverPopover`
- **Purpose**: Hover-triggered popover that displays a list of items on hover (not click)
- **Props**: `{ title: string; items: string[]; children: ReactNode }`
- **Features**:
  - Opens on hover with 80ms close delay to prevent flickering
  - Glass background, rounded corners, soft shadow
  - Auto-width with sensible maximum (280px)
  - Fade/scale animation (150ms)
  - `pointer-events-none` on trigger to prevent click interference
  - Bulleted list of items with title header
- **Used in**: Order table (categories + items columns), Quotation table (categories + items columns)

### Products Components (`src/components/products/`)

| Component | Purpose |
|-----------|---------|
| `ProductForm` | Product create/edit form |
| `BulkImportForm` | XLSX bulk product import |
| `CategoryManager` | Add/rename/delete categories |

### Inventory Components (`src/components/inventory/`)

| Component | Purpose |
|-----------|---------|
| `StockForm` | Stock in/out/adjustment form |
| `StockPreview` | Stock item detail with transaction history |

### Quotations Components (`src/components/quotations/`)

| Component | Purpose |
|-----------|---------|
| `QuotationForm` | Quotation create/edit form |
| `QuotationPreview` | Quotation preview panel |
| `QuotationCustomerSection` | Customer section for quotation |
| `QuotationItemsSection` | Items section for quotation |
| `QuotationFinancialSection` | Financial section for quotation |

### Reports Components (`src/components/reports/`)

| Component | Purpose |
|-----------|---------|
| `OrdersAnalyticsContent` | Orders analytics charts |
| `ExpensesAnalyticsContent` | Expenses analytics charts |
| `FinancialPerformanceContent` | Financial P&L charts |
| `SectionCard` | Generic card layout for report sections |

### UI Components (`src/components/ui/`)

#### `SearchableSelect`
- **Purpose**: Searchable dropdown select for filtering long option lists by typing
- **Props**: `{ value: string; onValueChange: (value: string) => void; options: readonly string[]; placeholder?: string; className?: string; emptyMessage?: string; searchPlaceholder?: string }`
- **Features**:
  - Uses Popover + Command (cmdk) pattern
  - Trigger styled to match existing SelectTrigger (h-9, border, rounded-lg, chevron)
  - Search input auto-focuses when popover opens
  - cmdk filters options as user types
  - Check icon on selected item
  - Closes on selection
- **Used in**: Order and Quotation customer forms (District + City dropdowns)

### Delivery Components (`src/components/delivery/`)

| Component | Purpose |
|-----------|---------|
| `CourierSettings` | Courier configuration in settings |

---

## Planned Components (Not Yet Built)

These components are planned but not yet implemented:

| Component | Purpose |
|-----------|---------|
| `StatusTimeline` | Vertical timeline for order status history |
| `UsageMeter` | Subscription usage progress bars |
| `QuickActionMenu` | + button for mobile quick actions |
| `BulkActionBar` | (superseded by DataTable's built-in bulk actions) |
| `ChartWrapper` | Recharts wrapper with consistent sizing |
| `SmartPaste` | Customer data parser modal/sheet |
