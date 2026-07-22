# Bizravana — Known Issues

This file tracks current limitations and technical debt.

## Current issues

- Database migration state must be verified independently in each deployed Supabase environment (16 migrations).
- Account provisioning is idempotent but client-driven. A database function should eventually make business/profile creation fully transactional.
- There is no automated test suite yet; lint and production builds are the current verification gates.
- The subscription lock logic is not yet implemented — trial expiry does not actually lock the dashboard.
- The Super Admin dashboard and payment approval workflow are not yet built.
- Business settings preferences (theme, accent, font, currency, etc.) are stored client-side via Zustand persist (localStorage) — not yet synced to the `business_settings` or `businesses` table in Supabase.
- Soft-deleted records are hidden from the UI but not yet purged after the retention period.
- No automated data cleanup process for deleted businesses or expired trials.
- **Courier snapshot not implemented**: Courier metadata (provider name, handling instructions, date option, optional note) is fetched live from `business_settings` at label generation time, not from a dispatch-time snapshot. Historical reprints will show current settings, not the settings that were active when the order was dispatched.
- **No per-shipment override UI**: Handling instructions and optional note defaults are saved in settings but cannot be overridden per-shipment before printing.
- **Generic handling icons**: All handling instruction types use the same △ prefix instead of distinct monochrome icons (⚠, ☂, ⬆, ◆, ⊘).
- **`svg2pdf.js` barcode rendering** uses DOM APIs (document.createElementNS) which may cause issues in SSR or testing contexts.
- **Dialog blur applies to main content area only on pages wrapped in DashboardLayout** — non-dashboard pages (auth, standalone) won't get the blur effect when a dialog opens since they lack the `[data-main-content]` target.
- **Toast per-type auto-dismiss durations** not configurable globally — default is 5000ms for all types. Success/info/warning/error/loading all share the same duration. Per-type durations would require modifying call sites.

## MVP limitations

- Manual bank-transfer subscription flow only.
- Single-user businesses only (no team/role management).
- No WhatsApp Business API integration (uses simple `wa.me` links).
- No email, PWA, or offline mode yet.
- No courier API integration beyond Royal Express (waybill tracking via API, but manual entry fallback available).
- No notifications system (in-app, email, or push).
- No image upload for products or payment proofs yet (avatars/logos and order images only).
- The delivery module has settings in the Settings page but no dedicated delivery management page.
- Reports are limited to 500 records per query (optimization needed for larger datasets).
- The "Preferences" page is at a separate sub-route (`/dashboard/settings/preferences`) which may confuse users navigating from the main settings page.

## Resolved

- Order numbering no longer skips numbers or changes when an order is updated.
- Forgot password flow now lands on the password reset page instead of logging in directly.
- Auth callback PKCE code verifier error resolved.
- Image upload for orders now works with Supabase Storage per-item mapping.
- Backup import no longer fails on generated columns, schema drift, or primary key conflicts.
- Dashboard and auth callback routes now match the URLs used by navigation.
- Email-confirmed users now finish business/profile provisioning on callback.
- Next.js middleware was migrated to the Next.js 16 proxy convention.
- Dashboard revenue now aggregates all matching orders instead of only the five displayed orders.
- Orders, products, inventory, expenses, customers, quotations, delivery, reports, notifications, subscription, and settings routes are now implemented.
- Storage RLS now supports both avatar and logo upload paths.
- Soft delete works via SECURITY DEFINER RPC functions.
- **Temporal Dead Zone bug**: Fixed across all 5 table pages where `useEffect` accessed `setShowBulkDelete` before its `useState` declaration.
- **TemplateSelectionDialog state desync**: Arrow key navigation now correctly syncs `selectedId` with `focusedIndex`.
- **Bulk shipping label PDF**: Multi-page PDF now displays correctly with responsive iframe height.
