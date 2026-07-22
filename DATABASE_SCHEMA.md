# Bizravana — Database Schema

> Last updated: 2026-07-19
> Database: PostgreSQL (Supabase)
> RLS: Enabled on all business-scoped tables
> Migrations: 16 total (001 through 016)

---

## Migration History

| # | Name | Purpose |
|---|------|---------|
| 001 | `schema.sql` | Initial schema — 20 tables, seed data, indexes, RLS |
| 002 | `fix_rls_policies.sql` | Add INSERT policies for profiles & businesses (needed for registration) |
| 003 | `fix_rls_recursion.sql` | Fix recursive RLS — make `get_user_business_id()` SECURITY DEFINER, move super_admin check to JWT `app_metadata` |
| 004 | `add_waybill_to_orders.sql` | Add `waybill_id` column + index to orders |
| 005 | `add_delete_policies.sql` | Add DELETE RLS policies for all business-scoped tables |
| 006 | `add_order_source.sql` | Add `order_source` column to orders |
| 007 | `add_categories_table.sql` | Create `categories` table (product categories) |
| 008 | `fix_update_rls_policies.sql` | Add explicit WITH CHECK clauses to all UPDATE policies |
| 009 | `add_soft_delete_rpc.sql` | Create `soft_delete_products` and `soft_delete_inventory_items` SECURITY DEFINER RPCs |
| 010 | `add_inventory_expense_categories.sql` | Create `inventory_categories` and `expense_categories` tables |
| 011 | `remove_expense_category_check.sql` | Remove restrictive CHECK constraints on expenses |
| 012 | `add_profile_images_storage.sql` | Create `profile-images` storage bucket + RLS policies |
| 013 | `fix_storage_logos_rls.sql` | Extend storage RLS to allow `logos/` path |
| 014 | `add_order_images_bucket.sql` | Create `order-images` storage bucket + RLS policies |
| 015 | `add_message_templates.sql` | Create `message_templates` table with soft delete, unique constraints, indexes |
| 016 | `add_courier_shipment_metadata.sql` | Add `courier_shipment_metadata JSONB` column to orders for shipping label snapshot |

---

## Table Overview

| # | Table | Purpose | RLS |
|---|-------|---------|-----|
| 1 | `subscription_plans` | SaaS plan definitions | Public read |
| 2 | `businesses` | Multi-tenant business accounts | Owner + Admin |
| 3 | `profiles` | User profiles extending auth.users | Self + Business |
| 4 | `payment_proofs` | Manual payment uploads | Business-scoped |
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
| 17 | `notifications` | In-app notifications | Business-scoped |
| 18 | `business_settings` | Key-value settings per business | Business-scoped |
| 19 | `tasks` | Action items tied to records | Business-scoped |
| 20 | `admin_activity_log` | Super Admin audit log | Admin only |
| 21 | `categories` | Product categories (migration 007) | Business-scoped |
| 22 | `inventory_categories` | Inventory categories (migration 010) | Business-scoped |
| 23 | `expense_categories` | Expense categories (migration 010) | Business-scoped |
| 24 | `message_templates` | WhatsApp message templates per context (migration 015) | Business-scoped |

---

## Table Definitions

### 1. subscription_plans
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| name | TEXT | NOT NULL |
| monthly_price | DECIMAL(10,2) | NOT NULL |
| order_limit | INT | NOT NULL |
| expense_limit | INT | NOT NULL |
| product_limit | INT | NOT NULL |
| storage_limit_mb | INT | default 500 |
| features | JSONB | default '[]' |
| is_active | BOOLEAN | default true |
| sort_order | INT | default 0 |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |

### 2. businesses
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| owner_id | UUID | FK → auth.users(id), ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| type | TEXT | nullable |
| phone | TEXT | nullable |
| district | TEXT | nullable |
| address | TEXT | nullable |
| logo_url | TEXT | nullable |
| theme_prefs | JSONB | default '{"mode":"system","accent":"blue"}' |
| plan_id | UUID | FK → subscription_plans(id), nullable |
| account_status | TEXT | CHECK (trial, trial_expired, pending_payment, active, expired, suspended, archived, deleted) |
| trial_started_at | TIMESTAMPTZ | nullable |
| trial_ends_at | TIMESTAMPTZ | nullable |
| subscription_started_at | TIMESTAMPTZ | nullable |
| subscription_ends_at | TIMESTAMPTZ | nullable |
| data_delete_after | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |
| deleted_at | TIMESTAMPTZ | nullable (soft delete) |

### 3. profiles
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| user_id | UUID | UNIQUE, FK → auth.users(id), ON DELETE CASCADE |
| business_id | UUID | FK → businesses(id), ON DELETE SET NULL |
| full_name | TEXT | NOT NULL |
| phone | TEXT | nullable |
| role | TEXT | CHECK (owner, admin, member), default 'owner' |
| avatar_url | TEXT | nullable |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |

### 4. payment_proofs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| business_id | UUID | FK → businesses(id) |
| plan_id | UUID | FK → subscription_plans(id), nullable |
| amount | DECIMAL(10,2) | NOT NULL |
| payment_method | TEXT | default 'bank_transfer' |
| proof_image_url | TEXT | nullable |
| notes | TEXT | nullable |
| status | TEXT | CHECK (pending, approved, rejected) |
| admin_note | TEXT | nullable |
| approved_by | UUID | FK → auth.users(id), nullable |
| approved_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | default now() |

### 5. products
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| business_id | UUID | FK → businesses(id) |
| name | TEXT | NOT NULL |
| category | TEXT | nullable |
| size_variant | TEXT | nullable |
| selling_price | DECIMAL(10,2) | NOT NULL |
| cost_price | DECIMAL(10,2) | nullable |
| profit_margin | DECIMAL(5,2) | GENERATED (STORED) |
| image_url | TEXT | nullable |
| inventory_item_id | UUID | nullable (link to inventory) |
| is_active | BOOLEAN | default true |
| created_by | UUID | FK → auth.users(id) |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |
| deleted_at | TIMESTAMPTZ | nullable |

### 6. price_snapshots
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| business_id | UUID | FK → businesses(id) |
| product_id | UUID | FK → products(id) |
| selling_price | DECIMAL(10,2) | NOT NULL |
| cost_price | DECIMAL(10,2) | nullable |
| effective_date | DATE | NOT NULL |
| created_at | TIMESTAMPTZ | default now() |

### 7. inventory_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| business_id | UUID | FK → businesses(id) |
| name | TEXT | NOT NULL |
| category | TEXT | nullable |
| size_variant | TEXT | nullable |
| current_stock | DECIMAL(10,2) | default 0 |
| unit_cost | DECIMAL(10,2) | nullable |
| supplier | TEXT | nullable |
| reorder_level | DECIMAL(10,2) | default 0 |
| last_restocked_at | TIMESTAMPTZ | nullable |
| created_by | UUID | FK → auth.users(id) |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |
| deleted_at | TIMESTAMPTZ | nullable |

### 8. inventory_transactions
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| business_id | UUID | FK → businesses(id) |
| inventory_item_id | UUID | FK → inventory_items(id) |
| type | TEXT | CHECK (stock_in, stock_out, adjustment) |
| quantity | DECIMAL(10,2) | NOT NULL |
| unit_cost | DECIMAL(10,2) | nullable |
| reference_type | TEXT | nullable (expense, order, manual) |
| reference_id | UUID | nullable |
| notes | TEXT | nullable |
| created_by | UUID | FK → auth.users(id) |
| created_at | TIMESTAMPTZ | default now() |

### 9. customers
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| business_id | UUID | FK → businesses(id) |
| name | TEXT | NOT NULL |
| phone | TEXT | nullable |
| whatsapp | TEXT | nullable |
| email | TEXT | nullable |
| address | TEXT | nullable |
| district | TEXT | nullable |
| nearest_city | TEXT | nullable |
| lifetime_spend | DECIMAL(12,2) | default 0 |
| total_orders | INT | default 0 |
| pending_balance | DECIMAL(10,2) | default 0 |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |
| deleted_at | TIMESTAMPTZ | nullable |

### 10. orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| business_id | UUID | FK → businesses(id) |
| order_number | TEXT | NOT NULL |
| customer_id | UUID | FK → customers(id), ON DELETE SET NULL |
| customer_name | TEXT | NOT NULL (snapshot) |
| customer_phone | TEXT | nullable (snapshot) |
| customer_address | TEXT | nullable (snapshot) |
| customer_district | TEXT | nullable (snapshot) |
| customer_city | TEXT | nullable (snapshot) |
| customer_whatsapp | TEXT | nullable (snapshot) |
| customer_email | TEXT | nullable (snapshot) |
| expected_delivery_date | DATE | nullable |
| dispatched_date | TIMESTAMPTZ | nullable |
| delivery_charge | DECIMAL(10,2) | default 0 |
| subtotal | DECIMAL(12,2) | NOT NULL |
| discount | DECIMAL(10,2) | default 0 |
| discount_type | TEXT | CHECK (percentage, fixed) |
| advance_paid | DECIMAL(10,2) | default 0 |
| balance_remaining | DECIMAL(12,2) | GENERATED (STORED) |
| total | DECIMAL(12,2) | GENERATED (STORED) |
| payment_method | TEXT | CHECK (cod, bank_transfer, cash, other) |
| payment_status | TEXT | CHECK (pending, advanced, paid), default 'pending' |
| status | TEXT | CHECK (new_order, ready, packed, dispatched, delivered, cancelled, returned), default 'new_order' |
| remarks | TEXT | nullable |
| images | JSONB | default '[]' |
| waybill_id | TEXT | nullable (added in migration 004) |
| order_source | TEXT | default 'ad' (added in migration 006) |
| created_by | UUID | FK → auth.users(id) |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |
| deleted_at | TIMESTAMPTZ | nullable |

### 11. order_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| order_id | UUID | FK → orders(id), ON DELETE CASCADE |
| business_id | UUID | FK → businesses(id) |
| product_id | UUID | FK → products(id), ON DELETE SET NULL |
| product_name | TEXT | NOT NULL (snapshot) |
| category | TEXT | nullable (snapshot) |
| unit_price | DECIMAL(10,2) | NOT NULL (snapshot) |
| quantity | DECIMAL(10,2) | NOT NULL |
| total_price | DECIMAL(12,2) | GENERATED (STORED) |
| notes | TEXT | nullable |
| sort_order | INT | default 0 |
| created_at | TIMESTAMPTZ | default now() |

### 12. order_status_history
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| order_id | UUID | FK → orders(id), ON DELETE CASCADE |
| business_id | UUID | FK → businesses(id) |
| from_status | TEXT | nullable |
| to_status | TEXT | NOT NULL |
| changed_by | UUID | FK → auth.users(id) |
| created_at | TIMESTAMPTZ | default now() |

### 13. quotations
Same structure as orders but for quotations. Includes `converted_order_id` FK and statuses: draft, sent, accepted, rejected, converted, expired.

### 14. quotation_items
Same structure as order_items but linked to quotations.

### 15. expenses
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| business_id | UUID | FK → businesses(id) |
| description | TEXT | NOT NULL |
| category | TEXT | nullable (CHECK constraint removed in migration 011) |
| total_cost | DECIMAL(12,2) | NOT NULL |
| payment_method | TEXT | nullable (CHECK constraint removed in migration 011) |
| expense_date | DATE | NOT NULL |
| add_to_inventory | BOOLEAN | default false |
| created_by | UUID | FK → auth.users(id) |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |
| deleted_at | TIMESTAMPTZ | nullable |

### 16. deliveries
Links to orders. Tracks courier, waybill, and delivery status flow: confirmed → to_dispatch → in_branch → assigned_to_rider → delivered / cancelled / returned.

### 17. notifications
Per-user in-app notifications with type, title, message, data JSON, read status.

### 18. business_settings
Key-value settings per business. Unique constraint on (business_id, key).

### 19. tasks
Action items linked to orders, expenses, inventory, quotations, or general. Has completion checkbox and assignment.

### 20. admin_activity_log
Immutable audit trail for Super Admin actions (payment approvals, plan changes, suspensions, etc.).

### 21. categories (migration 007)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| business_id | UUID | FK → businesses(id), ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |

### 22. inventory_categories (migration 010)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| business_id | UUID | FK → businesses(id), ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |

### 23. expense_categories (migration 010)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| business_id | UUID | FK → businesses(id), ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | default now() |
| updated_at | TIMESTAMPTZ | default now() |

---

## Indexes

| Index | Table | Columns |
|-------|-------|---------|
| idx_orders_business_status | orders | business_id, status |
| idx_orders_business_date | orders | business_id, created_at DESC |
| idx_orders_customer | orders | business_id, customer_id |
| idx_orders_waybill | orders | business_id, waybill_id (migration 004) |
| idx_orders_source | orders | business_id, order_source (migration 006) |
| idx_products_business | products | business_id |
| idx_customers_business | customers | business_id |
| idx_expenses_business_date | expenses | business_id, expense_date DESC |
| idx_inventory_business | inventory_items | business_id |
| idx_quotations_business | quotations | business_id |
| idx_notifications_user | notifications | user_id, is_read |
| idx_tasks_business | tasks | business_id, reference_type |
| idx_order_items_order | order_items | order_id |
| idx_order_status_history_order | order_status_history | order_id |
| idx_deliveries_order | deliveries | order_id |
| idx_business_settings_key | business_settings | business_id, key |
| idx_payment_proofs_business | payment_proofs | business_id, status |
| idx_categories_business | categories | business_id (migration 007) |
| idx_inventory_categories_business | inventory_categories | business_id (migration 010) |
| idx_expense_categories_business | expense_categories | business_id (migration 010) |

---

## Row Level Security

### Helper Functions

```sql
get_user_business_id() → UUID  -- SECURITY DEFINER (migration 003), bypasses RLS to avoid recursion
is_super_admin() → BOOLEAN     -- Reads from JWT app_metadata (migration 003), not from profiles table
```

### Policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| businesses | Owner or admin | Owner (registration) | Owner or admin | - (soft delete) |
| profiles | Self or same business | Self (registration) | Self | - |
| subscription_plans | All auth users | - | - | - |
| products | Business-scoped | Business-scoped | Business-scoped (WITH CHECK) | Business-scoped (migration 005) |
| orders | Business-scoped | Business-scoped | Business-scoped (WITH CHECK) | Business-scoped (migration 005) |
| All business tables | `business_id = get_user_business_id()` + soft-delete filter | `business_id = get_user_business_id()` | `business_id = get_user_business_id()` (WITH CHECK in migration 008) | Business-scoped (migration 005) |
| admin_activity_log | Super admin only | Super admin only | - | - |

Business-scoped pattern:
```sql
CREATE POLICY "view_own_business" ON [table] FOR SELECT
  USING (business_id = get_user_business_id() AND deleted_at IS NULL OR is_super_admin());

CREATE POLICY "insert_own_business" ON [table] FOR INSERT
  WITH CHECK (business_id = get_user_business_id());

CREATE POLICY "update_own_business" ON [table] FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

CREATE POLICY "delete_own_business" ON [table] FOR DELETE
  USING (business_id = get_user_business_id());
```

### Soft Delete RPCs (migration 009)

```sql
soft_delete_products(p_ids UUID[]) → JSONB  -- SECURITY DEFINER, bypasses RLS
soft_delete_inventory_items(p_ids UUID[]) → JSONB  -- SECURITY DEFINER, bypasses RLS
```

These RPCs explicitly check business ownership via profiles table, bypassing RLS entirely.

### Storage Bucket (migration 012-013)

- **Bucket**: `profile-images` (public, 2MB limit, JPEG/PNG/WebP/GIF/AVIF)
- **Paths**: `avatars/{userId}/` and `logos/{businessId}/`
- **Policies**: Public read, authenticated write (user-scoped for avatars, business-scoped for logos)

---

## Seed Data

### Subscription Plans

| Name | Price | Orders | Expenses | Products | Features | Order |
|------|-------|--------|----------|----------|----------|-------|
| Basic | Rs. 450 | 90 | 90 | 10 | Core Features | 1 |
| Standard | Rs. 950 | 200 | 200 | 20 | Core Features | 2 |
| Premium | Rs. 1,950 | 500 | 500 | 999,999 | Core, Unlimited Products | 3 |
| Enterprise | Custom | 999,999 | 999,999 | 999,999 | Unlimited, Team, AI, Automations | 4 |
