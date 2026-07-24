# Bizravana — Database Schema

> Last updated: 2026-07-23
> Database: PostgreSQL (Supabase)
> RLS: Enabled on all business-scoped tables
> Migrations: 25 total (001 through 025)

---

## Migration History

| # | Name | Purpose |
|---|------|---------|
| 001 | `schema.sql` | Initial schema — 20 tables, seed data, indexes, RLS |
| 002 | `fix_rls_policies.sql` | Add INSERT policies for profiles & businesses |
| 003 | `fix_rls_recursion.sql` | Fix recursive RLS — SECURITY DEFINER + JWT app_metadata |
| 004 | `add_waybill_to_orders.sql` | Add `waybill_id` column to orders |
| 005 | `add_delete_policies.sql` | Add DELETE RLS policies |
| 006 | `add_order_source.sql` | Add `order_source` column to orders |
| 007 | `add_categories_table.sql` | Create `categories` table |
| 008 | `fix_update_rls_policies.sql` | Add WITH CHECK clauses to UPDATE policies |
| 009 | `add_soft_delete_rpc.sql` | Soft-delete SECURITY DEFINER RPCs |
| 010 | `add_inventory_expense_categories.sql` | Create inventory/expense categories tables |
| 011 | `remove_expense_category_check.sql` | Remove restrictive CHECK constraints |
| 012 | `add_profile_images_storage.sql` | Create profile-images storage bucket |
| 013 | `fix_storage_logos_rls.sql` | Extend storage RLS for logos |
| 014 | `add_order_images_bucket.sql` | Create order-images storage bucket |
| 015 | `add_message_templates.sql` | Create message_templates table |
| 016 | `add_courier_shipment_metadata.sql` | Add courier_shipment_metadata JSONB to orders |
| 017 | `add_manual_waybills.sql` | Add delivery_provider and manual_waybill columns |
| 018 | `add_subscription_plan_columns.sql` | Extended plan columns (quotation, inventory, etc.) |
| 019 | `create_payment_proofs_bucket.sql` | Create payment-proofs storage bucket |
| 020 | `add_subscription_expiry_cron.sql` | pg_cron trial/subscription expiry function |
| 021 | `fix_admin_payment_proofs_rls.sql` | Add `OR is_super_admin()` to payment_proofs policies |
| 022 | `add_admin_settings.sql` | Create admin_settings table for platform config |
| 023 | `add_get_user_emails.sql` | RPC function to fetch user emails from auth.users |
| 024 | `add_notification_broadcasts.sql` | Notification broadcast system tables + seed rules |
| 025 | `add_auto_notifications.sql` | Automated notification delivery functions + cron |

---

## Table Overview

| # | Table | Purpose | RLS |
|---|-------|---------|-----|
| 1 | `subscription_plans` | SaaS plan definitions (5 plans) | Public read |
| 2 | `businesses` | Multi-tenant business accounts | Owner + Admin |
| 3 | `profiles` | User profiles (full_name, phone, role, avatar_url) | Self + Business |
| 4 | `payment_proofs` | Manual payment uploads (pending/approved/rejected) | Business-scoped |
| 5 | `products` | Product catalog | Business-scoped |
| 6 | `price_snapshots` | Versioned product pricing | Business-scoped |
| 7 | `inventory_items` | Stock items | Business-scoped |
| 8 | `inventory_transactions` | Stock in/out/adjustment log | Business-scoped |
| 9 | `customers` | Customer directory from orders | Business-scoped |
| 10 | `orders` | Customer orders | Business-scoped |
| 11 | `order_items` | Line items per order | Business-scoped |
| 12 | `order_status_history` | Status change timeline | Business-scoped |
| 13 | `quotations` | Customer quotations | Business-scoped |
| 14 | `quotation_items` | Line items per quotation | Business-scoped |
| 15 | `expenses` | Business expenses | Business-scoped |
| 16 | `deliveries` | Delivery tracking | Business-scoped |
| 17 | `notifications` | In-app notifications (now with source, priority, category) | Business-scoped |
| 18 | `business_settings` | Key-value settings per business | Business-scoped |
| 19 | `tasks` | Action items tied to records | Business-scoped |
| 20 | `admin_activity_log` | Super Admin audit log | Admin only |
| 21 | `categories` | Product categories | Business-scoped |
| 22 | `inventory_categories` | Inventory categories | Business-scoped |
| 23 | `expense_categories` | Expense categories | Business-scoped |
| 24 | `message_templates` | WhatsApp message templates (3 contexts) | Business-scoped |
| 25 | `admin_settings` | Platform-wide admin configuration | Admin only |
| 26 | `notification_broadcasts` | Admin-created/system notification broadcasts | Admin + Business read |
| 27 | `notification_recipients` | Delivery tracking per business/user | Business-scoped |
| 28 | `notification_rules` | Configuration for automated notifications | Admin only |

> **Note:** 3 additional tables exist in Supabase but have **no migration coverage** — `courier_cities`, `courier_districts`, `courier_waybills` — all defaulting to `koombiyo_delivery` provider. These are orphaned and not referenced by any application code.

---

## New Tables (Migrations 024-025)

### notification_broadcasts

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| title | TEXT | NOT NULL |
| message | TEXT | NOT NULL |
| category | TEXT | CHECK: general, announcement, subscription, payment, maintenance, usage, storage, security, account |
| priority | TEXT | CHECK: normal, important, urgent |
| source | TEXT | CHECK: admin, system |
| audience_type | TEXT | CHECK: all, active, trial, expired, suspended, basic_plan, standard_plan, premium_plan, enterprise_plan, selected |
| audience_config | JSONB | Business IDs for "selected" audience |
| action_label | TEXT | Optional button text |
| action_url | TEXT | Optional navigation URL |
| status | TEXT | CHECK: draft, scheduled, sent, cancelled, archived |
| scheduled_at | TIMESTAMPTZ | For scheduled delivery |
| sent_at | TIMESTAMPTZ | When actually sent |
| expires_at | TIMESTAMPTZ | Optional expiry |
| recipient_count | INT | Count of delivered notifications |
| read_count | INT | Count of read notifications |
| created_by | UUID | FK → auth.users |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### notification_recipients

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| broadcast_id | UUID | FK → notification_broadcasts |
| notification_id | UUID | FK → notifications |
| business_id | UUID | FK → businesses |
| user_id | UUID | FK → auth.users |
| read_at | TIMESTAMPTZ | When user read it |
| delivered_at | TIMESTAMPTZ | When delivered |
| dismissed_at | TIMESTAMPTZ | When dismissed |
| created_at | TIMESTAMPTZ | |

### notification_rules

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| rule_key | TEXT | UNIQUE identifier (e.g., trial_ending_1d) |
| name | TEXT | Human-readable name |
| description | TEXT | What the rule does |
| category | TEXT | Same category enum as broadcasts |
| priority | TEXT | normal, important, urgent |
| trigger_config | JSONB | Trigger configuration |
| template_title | TEXT | Notification title template |
| template_message | TEXT | Notification message template |
| is_enabled | BOOLEAN | Whether the rule is active |
| is_essential | BOOLEAN | Cannot be disabled (security/account rules) |
| last_executed_at | TIMESTAMPTZ | When the rule last fired |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### Existing `notifications` table — New Columns (Migration 024)

| Column | Type | Description |
|--------|------|-------------|
| source | TEXT | 'admin' or 'system' |
| priority | TEXT | 'normal', 'important', 'urgent' |
| category | TEXT | 'general', 'announcement', 'subscription', etc. |
| expires_at | TIMESTAMPTZ | Optional expiry |
| action_label | TEXT | Optional button text |
| action_url | TEXT | Optional navigation URL |
| broadcast_id | UUID | FK → notification_broadcasts |

---

## New Indexes (Migration 024)

| Index | Table | Columns |
|-------|-------|---------|
| idx_notification_broadcasts_status | notification_broadcasts | status, scheduled_at |
| idx_notification_broadcasts_created | notification_broadcasts | created_at DESC |
| idx_notification_recipients_broadcast | notification_recipients | broadcast_id |
| idx_notification_recipients_business | notification_recipients | business_id, read_at |
| idx_notification_recipients_user | notification_recipients | user_id, read_at |
| idx_notification_rules_enabled | notification_rules | is_enabled |
| idx_notifications_business_unread | notifications | business_id, is_read, created_at DESC |
| idx_notifications_expires | notifications | expires_at (partial) |

---

## Automated Notification Rules (Seed Data, Migration 024)

| Rule Key | Name | Category | Priority | Essential |
|----------|------|----------|----------|-----------|
| trial_ending_1d | Trial Ending Soon (1 day) | subscription | important | No |
| trial_expired | Trial Expired | subscription | important | Yes |
| subscription_expiring_7d | Subscription Expiring (7 days) | subscription | normal | No |
| subscription_expiring_3d | Subscription Expiring (3 days) | subscription | important | No |
| subscription_expiring_1d | Subscription Expiring (1 day) | subscription | important | Yes |
| subscription_expired | Subscription Expired | subscription | urgent | Yes |
| payment_received | Payment Proof Submitted | payment | normal | No |
| payment_approved | Payment Approved | payment | normal | No |
| payment_rejected | Payment Rejected | payment | urgent | No |
| deletion_scheduled | Account Scheduled for Deletion | account | urgent | Yes |
| usage_80_pct | Usage Limit at 80% | usage | normal | No |
| usage_100_pct | Usage Limit Reached | usage | important | No |
| storage_80_pct | Storage at 80% | storage | normal | No |
| storage_100_pct | Storage Full | storage | important | No |

---

## Automated Notification Functions (Migration 025)

### `process_auto_notifications()`
- **Purpose**: Evaluates all businesses and creates notifications for matching rules
- **Run**: Hourly via pg_cron (`process-auto-notifications`)
- **Covers**: Trial ending, trial expired, subscription expiring (7/3/1 day), subscription expired, deletion scheduled, usage 80%/100%, storage 80%/100%
- **Dedup**: Uses `notification_already_sent()` to prevent duplicate notifications within 48h

### `deliver_scheduled_broadcasts()`
- **Purpose**: Delivers scheduled admin broadcasts to targeted businesses
- **Run**: Every 15 minutes via pg_cron (`deliver-scheduled-broadcasts`)
- **Audience types**: All, active, trial, expired, suspended, by plan, or selected businesses
- **Batch**: Creates notification + notification_recipient records per business

### `create_business_notification()`
- **Purpose**: Helper function to insert notification + notification_recipient records atomically

### `notification_already_sent()`
- **Purpose**: Checks if a business has received a notification of a given type within the dedup window (default 48h)

---

## RLS Updates (Migrations 024-025)

| Table | Policies |
|-------|----------|
| notification_broadcasts | Super admin: ALL. Businesses: SELECT only for sent broadcasts matching their audience criteria |
| notification_recipients | Super admin: ALL. Businesses: SELECT + UPDATE for own business |
| notification_rules | Super admin: ALL |

---

## Seed Data Updates

### Subscription Plans (Updated in migration 018)

| Name | Price | Orders | Expenses | Products | Quotations | Inventory | Storage | Couriers | WhatsApp | Team | Sort |
|------|-------|--------|----------|----------|------------|-----------|---------|----------|-----------|------|------|
| Trial | Free | 5 | 5 | 10 | 5 | 10 | 50MB | 1 | 1 | 1 | 0 |
| Basic | Rs. 450 | 90 | 90 | 10 | 90 | 90 | 250MB | 1 | 3 | 1 | 1 |
| Standard | Rs. 950 | 200 | 200 | 20 | 200 | 200 | 500MB | 2 | 5 | 2 | 2 |
| Premium | Rs. 1,950 | 500 | 500 | 999,999 | 500 | 500 | 2GB | 3 | 10 | 3 | 3 |
| Enterprise | Custom | 999,999 | 999,999 | 999,999 | 999,999 | 999,999 | 10GB | 999,999 | 999,999 | 10 | 4 |

### Admin Settings (Migration 022)

Pre-seeded with default key `admin_settings` containing company_name, bank details, support WhatsApp, trial duration, and payment instructions.

### Notification Rules (Migration 024)

14 pre-seeded automated rules (listed above) covering subscription lifecycle, payment events, account deletion, usage/storage thresholds.
