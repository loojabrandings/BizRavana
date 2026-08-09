# BizRavana API Routes

> Last reviewed: 2026-08-03
> Framework: Next.js 16 Route Handlers  
> Authentication: Supabase session unless explicitly noted

The browser uses the Supabase client directly for most business-scoped CRUD protected by RLS. Login is intentionally routed through the server so every hydrated and native-form attempt shares the same distributed limiter. Route Handlers are also used where a server secret, Supabase Auth Admin API, signed Storage access, payment verification, or cross-tenant Super Admin operation is required.

## Authentication

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/login` | Sign in and route the session to the correct dashboard |

Hydrated and native-form login both use this route. It enforces a 16 KB request
limit plus atomic 15-minute budgets of 10 attempts per normalized account and
30 attempts per client address. JSON clients receive `429` with `Retry-After`;
the native fallback uses stable error codes and a `303 See Other` redirect.

## Payments

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/payments/bank-transfer` | Validate the plan and create a secure bank-transfer submission |
| POST | `/api/payments/payhere/initiate` | Validate customer/plan data and create a signed PayHere checkout request |
| POST | `/api/payments/payhere/notify` | Public PayHere callback; verify signature and complete payment idempotently |
| POST | `/api/payments/payhere/client-event` | Record browser-side checkout outcomes without treating them as authoritative confirmation |
| GET | `/api/payments/payhere/status` | Reconcile and return checkout/subscription status |
| GET | `/api/admin/payments/[id]/receipt` | Return authorized receipt access for Super Admin review |
| POST | `/api/admin/payments/[id]/review` | Approve/reject a bank transfer and write audit/notification state |

`PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, `PAYHERE_SANDBOX`, and `APP_URL` are server-only. The notify callback is the authoritative PayHere success path.

The public PayHere notify callback rejects oversized bodies and performs no
database or audit mutation unless merchant, order amount, currency, and
signature validation all succeed. It also enforces a distributed limit of 120
requests per client address per minute and returns `429` with `Retry-After`
before parsing an over-limit payload.

## Super Admin

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin/user-emails` | Resolve business owner emails from `auth.users` |
| POST | `/api/admin/deliver-broadcast` | Deliver an admin notification broadcast |
| DELETE | `/api/admin/businesses/[id]/permanent-delete` | Clean Storage, purge business data, delete Auth user, and record activity |

All Super Admin routes verify the user with `auth.getUser()` and then require
the JWT `is_super_admin` app-metadata claim before reading or mutating admin
data. Broadcast delivery validates its audience, prevents normal re-delivery,
and records the authenticated Super Admin as the audit actor.

## Team Invitations

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/invitations` | List invitations |
| POST | `/api/invitations` | Create an invitation |
| DELETE | `/api/invitations` | Revoke an invitation |
| POST | `/api/invitations/accept` | Accept a pending invitation |
| PATCH | `/api/invitations/member-role` | Change a member role |
| DELETE | `/api/invitations/member-role` | Remove a team member |

Invitation listing, creation, revocation, role changes, and member removal
require an authenticated business owner or Business Manager (stored as the
`admin` database role). The server derives the actor
and `business_id` from the authenticated profile; request-supplied identity or
tenant IDs are not trusted. Invitation list responses do not expose tokens.
Acceptance requires a signed-in user, and migration 040 binds both invitation
discovery and acceptance to that user's verified Auth email and `auth.uid()`.

## Message Templates

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/message-templates` | List business templates |
| POST | `/api/message-templates` | Create a template |
| PATCH | `/api/message-templates` | Update a template |
| DELETE | `/api/message-templates` | Delete a template |
| PUT | `/api/message-templates` | Set a template as the context default |

Every Message Template method verifies the user with `auth.getUser()`, derives
the business from the authenticated profile, and runs through the user's RLS
session. Browser-supplied business and user IDs are not accepted. Default
changes first resolve the target inside the authenticated business and derive
the applicable context group from that owned record.
Deletion uses the authenticated-only `soft_delete_message_template` RPC from
migration 047. The RPC derives the tenant from `auth.uid()` and keeps
soft-deleted rows hidden by the normal SELECT policy.

## Bug Reports

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/bug-reports` | List the authenticated user's full submitted reports and admin responses |
| POST | `/api/bug-reports` | Create a report with optional private JPG/PNG/WEBP screenshot up to 5 MB |
| GET | `/api/bug-reports/[id]/screenshot` | Return a short-lived signed URL to the owner or Super Admin |

## Dashboard Ads

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/ads/current` | Select the highest-priority campaign matching business, plan, website, schedule, and dismissals |
| POST | `/api/ads/current` | Hide a campaign for the authenticated user for seven days |

Campaign CRUD is performed from `/admin/ads` through RLS. Only Super Admin can
manage campaigns; artwork writes use the authenticated upload route below.

## File uploads

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/uploads` | Validate and store profile avatars, business logos, order images, Super Admin avatars, and dashboard-ad artwork |
| DELETE | `/api/uploads` | Remove an authorized file from a server-derived user/business folder |

The server detects file type from magic bytes and requires it to match the
claimed MIME type. It derives Storage paths from the authenticated user and
profile instead of accepting a client-provided tenant folder. Business branding
requires Owner or Business Manager access; dashboard-ad and Super Admin avatar
purposes require the verified Super Admin claim. Bank-transfer receipts and bug
screenshots use the same signature validator in their dedicated routes.

## Security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` or the PayHere merchant secret to client components.
- User routes derive ownership from the authenticated session instead of trusting client-supplied IDs.
- Super Admin mutations require authentication and the Super Admin metadata claim.
- Every state-changing `/api/*` request must carry an allowed same-origin
  `Origin` header. The signed PayHere notify callback is the sole exemption
  because it is sent by the external payment gateway.
- User-supplied files are signature-checked on the server; browser roles cannot
  bypass this boundary with direct writes to profile, order, or ad buckets.
- Private receipts and bug screenshots use authorized routes or short-lived signed URLs.
- Payment callbacks are idempotent because gateways may retry notifications.
- Login and PayHere callback counters are atomically shared through the
  service-role-only `consume_request_rate_limit` RPC. Raw email/IP values are
  SHA-256 hashed before persistence.
- Database-backed limits protect application work across instances. A
  hosting-provider/WAF limit is still required for volumetric traffic that
  should be rejected before reaching the application or database.
