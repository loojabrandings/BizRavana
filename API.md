# BizRavana API Routes

> Last reviewed: 2026-07-26  
> Framework: Next.js 16 Route Handlers  
> Authentication: Supabase session unless explicitly noted

The browser uses the Supabase client directly for business-scoped CRUD protected by RLS. Route Handlers are used where a server secret, Supabase Auth Admin API, signed Storage access, payment verification, or cross-tenant Super Admin operation is required.

## Authentication

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/login` | Sign in and route the session to the correct dashboard |

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

## Super Admin

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin/user-emails` | Resolve business owner emails from `auth.users` |
| POST | `/api/admin/deliver-broadcast` | Deliver an admin notification broadcast |
| DELETE | `/api/admin/businesses/[id]/permanent-delete` | Clean Storage, purge business data, delete Auth user, and record activity |

All Super Admin routes verify the JWT `is_super_admin` app-metadata claim.

## Team Invitations

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/invitations` | List invitations |
| POST | `/api/invitations` | Create an invitation |
| DELETE | `/api/invitations` | Revoke an invitation |
| POST | `/api/invitations/accept` | Accept a pending invitation |
| PATCH | `/api/invitations/member-role` | Change a member role |
| DELETE | `/api/invitations/member-role` | Remove a team member |

## Message Templates

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/message-templates` | List business templates |
| POST | `/api/message-templates` | Create a template |
| PATCH | `/api/message-templates` | Update a template |
| DELETE | `/api/message-templates` | Delete a template |
| PUT | `/api/message-templates` | Reorder templates or update default state |

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

Campaign CRUD is performed from `/admin/ads` through RLS. Only Super Admin can manage campaigns and artwork.

## Security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` or the PayHere merchant secret to client components.
- User routes derive ownership from the authenticated session instead of trusting client-supplied IDs.
- Super Admin mutations require authentication and the Super Admin metadata claim.
- Private receipts and bug screenshots use authorized routes or short-lived signed URLs.
- Payment callbacks are idempotent because gateways may retry notifications.
