# Bizravana — Core Development Guidelines

> Last updated: 2026-07-16

---

## 1. General Principles

- Build the application as a scalable multi-tenant SaaS platform.
- Follow a Mobile-First responsive design approach.
- Maintain consistent UI/UX across all pages.
- Use reusable components whenever possible.
- Keep the interface simple, clean, and beginner-friendly.
- Optimize for performance and fast loading.
- Use lazy loading where appropriate.
- Follow clean code principles and modular architecture.

---

## 2. Database Design

- Design the database for future scalability from day one.
- Every business-related table must include:
  - `business_id`
  - `created_by`
  - `created_at`
  - `updated_at`
  - `updated_by`
  - `deleted_at`
  - `deleted_by`
- Business account table must include:
  - `plan_id`
  - `account_status`
  - `trial_started_at`
  - `trial_ends_at`
  - `subscription_started_at`
  - `subscription_ends_at`
  - `data_delete_after`
- Never design tables that only work for a single business.

---

## 3. Multi-Tenant Architecture

- Every user belongs to a Business.
- Every record must belong to a Business.
- Users should never be able to access another business's data.
- Enforce Row Level Security (RLS) in Supabase.

---

## 4. Historical Data Integrity

- Never update historical transaction values.
- Use Snapshot + Effective Date Versioning for:
  - Product Prices
  - Courier Charges
  - Tax Rates
  - Delivery Charges
  - Other configurable pricing
- Every transaction must store snapshots of:
  - Product Name
  - Unit Price
  - Customer Name
  - Customer Phone
  - Delivery Charge
  - Discount
  - Payment Method
- Historical Orders, Expenses, Invoices, and Reports must never change when master data changes.

---

## 5. Inventory System

- Support two inventory modes:
  - **Simple Inventory** — Finished products only.
  - **Advanced Inventory (BOM)** — Bill of Materials for manufacturing businesses.
- Inventory deductions should occur only at the configured workflow stage.
- Inventory purchases can automatically update stock through the Expenses module.

---

## 6. Authentication

- Use Supabase Authentication.
- Registration should automatically create:
  - User Account
  - Business Account
  - Owner Profile
- Every new account starts with a 3-Day Free Trial.

---

## 7. Subscription System

- Support the following account states:

```
Trial → Trial Expired → Pending Payment → Active → Expired → Suspended → Archived → Deleted
```

- After trial expiration:
  - Lock dashboard
  - Keep data for 14 days
  - Archive/Delete after retention period
- Subscription activation will initially be managed manually by Super Admin.

---

## 8. Security

- Enable Supabase Row Level Security on all business tables.
- Validate all inputs. Never trust client-side data.
- Secure all API routes.
- Prevent unauthorized access to business data.
- Log important administrative actions.
- Use server-side validation for all critical actions.

---

## 9. UI / UX

- Maintain consistent:
  - Colors (OKLCH semantic tokens only — never hardcoded)
  - Typography
  - Button styles
  - Form layouts
  - Table layouts
  - Icons
  - Card spacing
  - Modal behavior
- Every page must include:
  - Search
  - Filters
  - Responsive tables
  - Loading state
  - Empty state
  - Error state

---

## 10. Forms

- Use consistent form validation (React Hook Form + Zod).
- Features:
  - Required field indicators
  - Auto calculations
  - Inline validation
  - Image uploads
  - Auto-save where appropriate

---

## 11. Tables

- Every table must support:
  - Search
  - Sorting
  - Filtering
  - Pagination
  - Responsive mobile layout
  - Bulk selection
  - Bulk actions

---

## 12. Notifications

- Create a centralized notification system.
- Support:
  - Low Stock Alerts
  - Trial Expiration
  - Subscription Expiration
  - Payment Approved
  - Delivery Updates
  - System Announcements

---

## 13. File Storage

- Use Supabase Storage.
- Store:
  - Product Images
  - Payment Proofs
  - Order Attachments
  - Invoices
  - Profile Avatars
  - Business Logos
- Automatically remove files belonging to deleted businesses after the retention period.

---

## 14. Performance

- Optimize database queries.
- Use indexes where necessary.
- Avoid unnecessary API calls.
- Cache frequently accessed data.
- Load only required records.

---

## 15. Super Admin

- Keep Super Admin completely separate from Business Users.
- Super Admin responsibilities:
  - User Management
  - Subscription Management
  - Plan Management
  - Payment Approval
  - Trial Management
  - Data Cleanup
  - System Monitoring
- Never delete business data immediately. Always use Soft Delete:

```
Active → Archived → Scheduled for Deletion → Permanently Deleted
```

- This makes recovery possible if a user accidentally deletes data or renews their subscription before the retention period ends.

---

## 16. Future-Proof Architecture

The system should be designed so these features can be added without major refactoring:

- AI Assistant
- Team Management
- WhatsApp Integration
- Smart Automations
- Courier API
- Payment Gateway
- Email Notifications
- Push Notifications

---

## 17. Development Standards

- The entire project must be developed using TypeScript. No plain JavaScript.
- Follow consistent naming conventions.
- Write reusable services and utilities.
- Avoid duplicated logic.
- Keep business logic separate from UI components.
- Use environment variables for secrets.
- Document important functions and modules.

---

## 18. Animations & Micro-Interactions

- Use professional, smooth, and subtle animations throughout.
- Animations must improve usability, not distract.
- Keep all animations fast, clean, and consistent.
- Use animation mainly for feedback, transitions, and visual hierarchy.
- Avoid excessive bouncing, flashy effects, or slow decorative animations.

### Animation Duration Standards

| Type | Duration |
|------|----------|
| Micro-interactions | 150ms–250ms |
| Page transitions | 250ms–400ms |
| Modal / Drawer transitions | 200ms–300ms |

### Required Animation Areas

- Sidebar collapse / expand
- Mobile bottom menu interactions
- Page transitions
- Modal open / close
- Drawer open / close
- Dropdown menus
- Button hover / press states
- Form validation feedback
- Table row selection
- Bulk action toolbar appearance
- Card hover states
- Notification toast messages
- Loading skeletons
- Empty states
- Chart loading / reveal animations

### Animation Library

- Use **Framer Motion** for advanced UI animations.
- Use **Tailwind CSS transitions** for simple hover, focus, and state changes.

### Motion Accessibility

- Respect `prefers-reduced-motion`.
- If the user has reduced motion enabled, minimize or disable non-essential animations.

### Animation Style

The animation style should feel:
- Modern ✓
- Premium ✓
- Smooth ✓
- Fast ✓
- Minimal ✓
- Professional ✓

### Important Rule

> Do not over-animate the dashboard. This is a business tool, not a portfolio website. Animations should make the app feel polished and responsive, not playful or distracting.

---

## 19. Advanced Table Features — Multi-Selection

### Desktop

- Click the Order Number to enter Selection Mode.
- Once Selection Mode is active, clicking anywhere on a row will select or deselect that row.
- Display a floating Bulk Actions Toolbar when one or more rows are selected.
- Press `Esc` or click Cancel to exit Selection Mode.

### Mobile

- Long-press any row to enter Selection Mode.
- Once Selection Mode is active, tap anywhere on a row to select or deselect it.
- Display the Bulk Actions Toolbar at the bottom of the screen.

---

## 20. Drawers vs Modals vs Popovers

Use the appropriate UI component based on the complexity of the interaction:

| Component | Use For |
|-----------|---------|
| **Popover** | Quick actions, sorting, filtering, display settings, date selection, contextual menus |
| **Modal (Dialog)** | Confirmation dialogs, destructive actions, important user decisions |
| **Dedicated Page** | Complex workflows and full management screens |
| **Drawer (Sheet)** | In-page settings |
| **In-Page Form** | Forms for create/edit workflows |

> Never use a full page for simple actions that can be completed within a popover or drawer.

---

## 21. Popovers & Context Menus

Use popovers instead of navigating to separate pages for quick settings, filters, sorting, display options, and other contextual actions.

### Use Popovers For

- Sorting
- Filters
- Display Options
- View Modes (List / Cards)
- Column Visibility
- Quick Settings
- Row Actions
- Bulk Actions
- Date Range Selection
- Contextual Menus

### Interaction Guidelines

- Popovers should open with a smooth animation.
- Close automatically when the user clicks or taps outside (Click Away to Close).
- Pressing `Esc` should close the popover.
- Only one popover should be open at a time.
- The trigger button should indicate the active state while the popover is open.
- Preserve the user's selected options until they are changed.

### User Experience

- Keep popovers lightweight and responsive.
- Avoid full-page navigation for simple actions.
- Group related controls together.
- Display the current selection inside the trigger button whenever possible.
- Position popovers close to the triggering element.
- Ensure popovers are fully responsive on desktop, tablet, and mobile.

### Accessibility

- Fully keyboard accessible
- Support Tab navigation
- Support Enter and Space to activate controls
- Support Esc to close
- Restore focus to the trigger element when closed

---

## 22. In-Page Form Experience (Create/Edit Workflows)

Forms should not open as traditional modals for major create/edit workflows.

### Use In-Page Form Panels For

- New Order
- Edit Order
- New Expense
- Edit Expense
- New Quotation
- Edit Quotation
- Stock In / Stock Out
- Add Product
- Edit Product

### Behavior

- The form must open inside the current page without navigating to a separate route.
- The page URL may optionally update using shallow routing, but the user should feel like they are still on the same page.
- Opening the form should be instant with no visible waiting.
- Keep previous table/filter state in memory.
- When the user closes the form, return to the previous list/table exactly as it was.
- Use a breadcrumb-style header:

```
Orders > New Order
Expenses > New Expense
Quotations > New Quotation
Inventory > Stock In
```

### Layout

- Use a large centered panel or split-layout form area.
- Do not use small pop-up modals for complex forms.
- Keep the form visually connected to the current page.
- Include a clear close/back button.
- Use sticky footer actions:

```
[Cancel] [Save Draft] [Save] [Save & Create Another]
```

### Animation

- Smooth fade/slide transition.
- Duration: 200ms–300ms.
- No full-page loading screen.
- Show skeleton only if required data is not ready.
- Preload form components where possible.

### Important Rule

| Component | Use For |
|-----------|---------|
| **Popovers** | Simple actions |
| **Drawers** | Medium quick actions |
| **In-Page Form Panels** | Large forms |
| **Modals** | Confirmations and destructive actions only |

---

## Recommended Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **UI** | shadcn/ui + Tailwind CSS v4 |
| **Animations** | Framer Motion + Tailwind CSS |
| **Backend** | Supabase |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Hosting** | GitHub + Vercel |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Tables** | TanStack Table |
| **Icons** | Lucide React |
| **Validation** | Zod |
| **Data Fetching** | TanStack Query (React Query) |
| **Global State** | Zustand (only when necessary) |
