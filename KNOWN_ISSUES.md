# Bizravana — Known Issues

This file tracks current limitations and technical debt.

## Current issues

- Database migration state must be verified independently in each deployed Supabase environment (25 migrations).
- Account provisioning is idempotent but client-driven. A database function should eventually make business/profile creation fully transactional.
- There is no automated test suite yet; lint and production builds are the current verification gates.
- **Read Only Mode** is enforced client-side via a React provider. Server-side enforcement (middleware or RLS) would be a more robust approach for locking down expired accounts.
- Business settings preferences (theme, accent, font, currency, etc.) are stored client-side via Zustand persist (localStorage) — not yet synced to the `business_settings` or `businesses` table in Supabase.
- Soft-deleted records are hidden from the UI but not yet purged after the retention period.
- No automated data cleanup process for deleted businesses (no permanent delete after retention expiry).
- **Courier snapshot not implemented**: Courier metadata (provider name, handling instructions, date option, optional note) is fetched live from `business_settings` at label generation time, not from a dispatch-time snapshot. Historical reprints will show current settings, not the settings that were active when the order was dispatched.
- **No per-shipment override UI**: Handling instructions and optional note defaults are saved in settings but cannot be overridden per-shipment before printing.
- **Generic handling icons**: All handling instruction types use the same △ prefix instead of distinct monochrome icons (⚠, ☂, ⬆, ◆, ⊘).
- **`svg2pdf.js` barcode rendering** uses DOM APIs (document.createElementNS) which may cause issues in SSR or testing contexts.
- **Dialog blur applies to main content area only on pages wrapped in DashboardLayout** — non-dashboard pages (auth, standalone) won't get the blur effect when a dialog opens since they lack the `[data-main-content]` target.
- **Toast per-type auto-dismiss durations** not configurable globally — default is 5000ms for all types. Success/info/warning/error/loading all share the same duration.
- **Trial auto-expiry cron** (migration 020) requires `pg_cron` to be available on the Supabase project. If not available, trials must be expired manually via SQL.
- **Automated notification cron** (migration 025) uses `pg_cron` which doesn't run in local Supabase (`supabase start`). Notifications must be triggered manually via the Admin Notifications page "Send Now" button during local development.
- **Notifications are in-app only** — No email or push notification delivery channel implemented yet.
- **No subscription to notification_recipients table** — The Realtime subscription is on `notifications` (business-scoped), but `notification_recipients` changes don't trigger UI updates. The read_at field is updated optimistically from the client.
- **Notification bell does not poll as fallback** — For environments where WebSocket connections are blocked or unstable, the bell relies solely on the focus event refetch. A polling fallback could improve reliability.
- **Smart Parser district matching limited** — The `normalizeForMatch()` only handles `th→t`, `dh→d`, `sh→s` transliterations. Other common spelling variations (e.g., "Moneragala" vs "Monaragala") are not handled.
- **Smart Parser depends on courier city data** — Reverse city lookup only works when the business has courier configured and city data synced. Without courier data, only district matching works; city must be entered manually.
- **Smart Parser does not persist parsed data** — The parsed output is directly applied to the form fields with no undo. The Reset button provides a way to clear all fields, but there's no "undo last parse" feature.
- **Clipboard API requires HTTPS/localhost** — The "Paste from clipboard" button uses `navigator.clipboard.readText()` which requires a secure context (HTTPS) or localhost. In production HTTP environments, users must paste manually.

## MVP limitations

- Manual bank-transfer subscription flow only.
- Single-user businesses only (no team/role management).
- No WhatsApp Business API integration (uses simple `wa.me` links).
- No email, PWA, or offline mode yet.
- No courier API integration beyond Royal Express (waybill tracking via API, but manual entry fallback available).
- No image upload for products yet (avatars/logos, order images, and payment proofs are implemented).
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
- **Temporal Dead Zone bug**: Fixed across all 5 table pages.
- **Admin placeholder pages**: Activity Log, Settings, Cleanup Queue are now fully built.
- **400 Bad Request on profiles query**: Removed invalid `email` column selection from profiles table across 5 admin pages. Emails now fetched from `auth.users` via secure API.
- **Admin panel mobile responsiveness**: All 11 admin pages now use responsive card-based layouts on mobile.
- **Notifications not delivered**: "Send Now" broadcasts now actually insert notification records via server-side API route.
- **Realtime notification bell**: Upgraded from polling placeholder to shared NotificationProvider with WebSocket subscription.
