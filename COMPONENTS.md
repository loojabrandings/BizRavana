# Bizravana — Component Documentation

> Last updated: 2026-07-22

---

## shadcn/ui Base Components

The following shadcn/ui components are installed and available for use. These are unstyled primitives that use Tailwind CSS variables for theming. All belong to `src/components/ui/`.

| Component | Installed | Notes |
|-----------|-----------|-------|
| Button | ✅ | With icon, loading, gradient variants |
| Input | ✅ | Base input control |
| Label | ✅ | Label component for form fields |
| Card | ✅ | Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription |
| Badge | ✅ | Inline status badges with variants |
| Avatar | ✅ | User/logo avatars with fallback |
| Dialog | ✅ | Modal dialogs with close-button control |
| Sheet | ✅ | Slide-out panels (mobile sidebar, settings drawers) |
| Popover | ✅ | Contextual popovers for filters, sorting, quick settings |
| Select | ✅ | Dropdown selects (Base UI) |
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
| Pagination | ✅ | Custom pagination with page navigation + rows-per-page |
| InputGroup | ✅ | Composable input groups with addons, buttons, text |
| Dropdown | ✅ | Base UI Select-based dropdown with icons, labels |
| SearchableSelect | ✅ | Searchable dropdown using Popover + Command |

---

## Custom Application Components

### Layout Components (`src/components/layout/`)

| Component | Purpose |
|-----------|---------|
| `Sidebar` | Desktop collapsible sidebar with grouped navigation, Zustand-powered collapse |
| `BottomNav` | Mobile persistent bottom navigation bar with floating + button |
| `DashboardLayout` | Main layout wrapper — Sidebar + header + BottomNav + NotificationProvider + ReadOnlyModeProvider |
| `MobileRightDrawer` | Mobile slide-out drawer for navigation |
| `QuickActionSheet` | Bottom sheet for quick actions (New Order, Add Expense) |
| `NavItemIndicator` | Animated active route indicator |

### Dashboard Components (`src/components/dashboard/`)

| Component | Purpose |
|-----------|---------|
| `HeroStatCard` | Prominent metric card with trend badges and secondary content |
| `StatsCard` | Compact stat card for stats strip |
| `StatusListCard` | Card wrapper for listing operational statuses |
| `DashboardSkeleton` | Full-page loading placeholder |
| `OnboardingEmpty` | Onboarding welcome screen for new businesses |

### Chart Components (`src/components/charts/`)

| Component | Purpose |
|-----------|---------|
| `MiniBarChart` | Stacked micro-bars comparing two metrics |
| `RankedBarList` | Animated ranked list with progress bars |
| `DonutChart` | Donut/ring chart for distribution visualization |

### Shared Components (`src/components/shared/`)

| Component | Purpose |
|-----------|---------|
| `PageHeader` | Consistent page title bar with optional action button |
| `EmptyState` | Placeholder for empty tables/lists |
| `DataTable` | Full-featured data table with selection, sorting, pagination, bulk actions |
| `FilterBar` | Reusable filter bar with tabs and date range |
| `PageForm` | In-page form container for create/edit workflows |
| `ConfirmDialog` | Destructive action confirmation dialog |
| `EditableStatusBadge` | Inline status badge with dropdown for quick changes |
| `SettingsSection` | Section wrapper for settings page groups |
| `ThemeToggle` | Light/Dark/System mode + accent color switcher |
| `ImageCropDialog` | Profile/logo image cropping (react-easy-crop) |
| `GlobalSearchDialog` | Cmd+K search dialog with recent searches |
| `GlobalSearchPopover` | Lightweight search popover |
| `KeyboardShortcutsDialog` | Shows available keyboard shortcuts |
| `NetworkStatusIndicator` | Online/offline connection status |
| `HoverPopover` | Hover-triggered popover for item lists |
| `ReadOnlyBanner` | Animated upgrade banner when account is in read-only mode |

### Admin Components (`src/components/admin/`) — Reusable

| Component | Purpose |
|-----------|---------|
| `AdminPageHeader` | Responsive page header with title, subtitle, and action buttons |
| `AdminResponsiveTable` | Core responsive table — desktop table (>=1024px) + mobile cards (<1024px) |
| `AdminMobileRecordCard` | Base card structure for mobile record display |
| `AdminActionSheet` | Mobile bottom sheet for context actions |
| `AdminMobileTabs` | Horizontally scrollable tab bar |
| `AdminSearchBar` | Full-width search on mobile, compact on desktop |

### Notification Components (`src/components/notifications/`)

| Component | Purpose |
|-----------|---------|
| `NotificationBell` | Bell icon + popover showing notifications list. Consumes from NotificationProvider. Shows category icons, priority indicators, mark as read, navigate to action URL |

---

## Admin Pages (`src/app/admin/`)

All admin pages are now mobile-responsive using shared Admin components:

| Page | Route | Purpose |
|------|-------|---------|
| **Admin Layout** | `/admin/layout.tsx` | Collapsible sidebar + top bar + JWT auth guard + 11 nav items including Notifications |
| **Admin Dashboard** | `/admin/page.tsx` | Stats overview (businesses, subs, payments, revenue) |
| **Business Management** | `/admin/businesses/page.tsx` | Business list with search, filter, activate/suspend |
| **Business Detail** | `/admin/businesses/[id]/page.tsx` | Overview, subscription, usage, payments, danger zone |
| **Pending Payments** | `/admin/payments/page.tsx` | Payment proof review with approve/reject |
| **Plans Management** | `/admin/plans/page.tsx` | Subscription plans CRUD |
| **Trials Management** | `/admin/trials/page.tsx` | Trial accounts with extend, lock, delete |
| **Subscription Management** | `/admin/subscriptions/page.tsx` | Subscription portfolio |
| **Notification Management** | `/admin/notifications/page.tsx` | Create/send/schedule/cancel broadcasts, manage automated rules |
| **Data Cleanup Queue** | `/admin/cleanup/page.tsx` | Manage expired accounts scheduled for deletion |
| **Storage Management** | `/admin/storage/page.tsx` | Storage bucket usage across businesses |
| **Activity Log** | `/admin/activity-log/page.tsx` | Audit trail of admin actions with filters |
| **Admin Settings** | `/admin/settings/page.tsx` | Platform-wide settings (company, bank, support, trial, payment) |

---

## Providers (`src/providers/`)

| Provider | Purpose |
|----------|---------|
| `ReadOnlyModeProvider` | Read-only mode detection, `guard()` function to block mutations when account is expired |
| `NotificationProvider` | Shared notification state with Realtime subscription. Single fetch on mount, WebSocket updates on INSERT/UPDATE, focus refetch fallback |
| `ThemeProvider` | next-themes integration for light/dark/system |
| `QueryProvider` | TanStack Query configuration |
| `PreferencesProvider` | User preferences context |

## Hooks

| Hook | Purpose |
|------|---------|
| `useNotifications()` | From NotificationProvider. Returns `notifications`, `unreadCount`, `loading`, `markAsRead(id)`, `markAllAsRead()`, `refetch()` |
| `useReadOnlyMode()` | From ReadOnlyModeProvider. Returns `isReadOnly`, `accountStatus`, `guard(action?)` |
| `useKeyboardShortcuts()` | Global keyboard shortcut registration |
| `useMediaQuery()` | Responsive breakpoint detection |
| `useNetworkStatus()` | Online/offline detection |
| `useCourierLocations()` | Courier delivery location lookups |

## Libraries (`src/lib/`)

| File | Purpose |
|------|---------|
| `customer-parser.ts` | Smart Customer Parser — extracts structured customer details (name, phone, address, district, city) from unstructured pasted text (WhatsApp, SMS, etc.). Supports WhatsApp header stripping, Sri Lankan phone detection, district matching with Sinhala transliteration normalization, and two-phase city matching (forward match + reverse lookup via courier city data). |

## Order Components (`src/components/orders/`)

| Component | Key Features |
|-----------|-------------|
| `CustomerDetailsSection` | Customer info form with **Smart Parser** button in the heading. Opens a paste dialog with clipboard read + manual textarea, accuracy warning, and auto-fills all fields. Also receives courier location data for district/city matching. |
| `OrderForm` | Full order creation/editing form with 3-column layout (Customer, Items, Payment). Footer has **Reset** button (clears customer details + remarks) alongside Cancel, Save & Preview, and Create Order. |

## Quotation Components (`src/components/quotations/`)

| Component | Key Features |
|-----------|-------------|
| `QuotationCustomerSection` | Customer info form with **Smart Parser** button in the heading. Opens a paste dialog with clipboard read + manual textarea, accuracy warning, and auto-fills all fields. Also receives courier location data for district/city matching. |
| `QuotationForm` | Full quotation creation/editing form with 3-column layout (Customer, Items, Financial). Footer has **Reset** button (clears customer details + remarks) alongside Cancel, Save & Preview, and Create Quotation. |

---

## Planned Components (Not Yet Built)

| Component | Purpose |
|-----------|---------|
| `StatusTimeline` | Vertical timeline for order status history |
| `ChartWrapper` | Recharts wrapper with consistent sizing |
