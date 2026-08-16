-- Migration 053: Auto-sync customers from orders
-- Creates a trigger that keeps the customers table in sync with order lifecycle events.

-- ─── Helper: normalize phone for matching ──────────────────────────
CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone text)
RETURNS text
LANGUAGE sql IMMUTABLE STRICT
AS $$
  SELECT regexp_replace(regexp_replace(trim(p_phone), '[\s\-\(\)]', '', 'g'), '^0', '', '');
$$;

-- ─── Core: upsert customer from order data ─────────────────────────
CREATE OR REPLACE FUNCTION public.sync_customer_from_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_phone text;
  v_existing_customer record;
  v_customer_id uuid;
  v_order_total numeric := COALESCE(NEW.total, 0);
  v_order_advance numeric := COALESCE(NEW.advance_paid, 0);
  v_order_balance numeric := GREATEST(v_order_total - v_order_advance, 0);
  v_is_effective boolean;  -- order counts toward aggregates
  v_was_effective boolean;
BEGIN
  -- Skip orders without a phone number (can't match to a customer)
  IF NEW.customer_phone IS NULL OR trim(NEW.customer_phone) = '' THEN
    RETURN NEW;
  END IF;

  v_normalized_phone := public.normalize_phone(NEW.customer_phone);
  IF length(v_normalized_phone) < 5 THEN
    RETURN NEW;  -- too short to be a real phone number
  END IF;

  -- Determine if this order is "effective" (counts toward aggregates)
  v_is_effective := NEW.status NOT IN ('cancelled', 'returned');

  -- ── Handle UPDATE (status change or field edit) ──────────────
  IF TG_OP = 'UPDATE' THEN
    v_was_effective := OLD.status NOT IN ('cancelled', 'returned');

    -- Find existing customer by old phone
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE business_id = NEW.business_id
      AND deleted_at IS NULL
      AND public.normalize_phone(COALESCE(phone, '')) = public.normalize_phone(COALESCE(OLD.customer_phone, ''))
    LIMIT 1;

    IF v_customer_id IS NULL THEN
      -- Customer may not exist yet; fall through to INSERT logic below
      -- by treating this as a new customer creation
      NULL;
    ELSE
      -- Recalculate aggregates from scratch for accuracy
      UPDATE public.customers c SET
        total_orders = sub.cnt,
        lifetime_spend = sub.spend,
        pending_balance = sub.balance,
        name = CASE
          WHEN NEW.customer_name IS NOT NULL AND trim(NEW.customer_name) != ''
          THEN NEW.customer_name
          ELSE c.name
        END,
        phone = COALESCE(NEW.customer_phone, c.phone),
        whatsapp = COALESCE(
          NULLIF(NEW.customer_whatsapp, ''),
          c.whatsapp
        ),
        email = COALESCE(
          NULLIF(NEW.customer_email, ''),
          c.email
        ),
        address = COALESCE(
          NULLIF(NEW.customer_address, ''),
          c.address
        ),
        district = COALESCE(
          NULLIF(NEW.customer_district, ''),
          c.district
        ),
        nearest_city = COALESCE(
          NULLIF(NEW.customer_city, ''),
          c.nearest_city
        ),
        updated_at = now()
      FROM (
        SELECT
          COUNT(*)::int AS cnt,
          COALESCE(SUM(o.total), 0) AS spend,
          COALESCE(SUM(GREATEST(o.total - o.advance_paid, 0))
            FILTER (WHERE o.payment_status != 'paid'), 0) AS balance
        FROM public.orders o
        WHERE o.business_id = NEW.business_id
          AND o.deleted_at IS NULL
          AND public.normalize_phone(COALESCE(o.customer_phone, '')) = v_normalized_phone
      ) sub
      WHERE c.id = v_customer_id;

      -- Update the order's customer_id FK if not set
      IF NEW.customer_id IS NULL THEN
        NEW.customer_id := v_customer_id;
      END IF;

      RETURN NEW;
    END IF;
  END IF;

  -- ── INSERT or customer not yet found on UPDATE ───────────────
  -- Look for existing customer
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE business_id = NEW.business_id
    AND deleted_at IS NULL
    AND public.normalize_phone(COALESCE(phone, '')) = v_normalized_phone
  LIMIT 1;

  IF v_customer_id IS NOT NULL THEN
    -- Recalculate aggregates from all orders for this phone
    UPDATE public.customers c SET
      total_orders = sub.cnt,
      lifetime_spend = sub.spend,
      pending_balance = sub.balance,
      name = CASE
        WHEN NEW.customer_name IS NOT NULL AND trim(NEW.customer_name) != ''
        THEN NEW.customer_name
        ELSE c.name
      END,
      whatsapp = COALESCE(NULLIF(NEW.customer_whatsapp, ''), c.whatsapp),
      email = COALESCE(NULLIF(NEW.customer_email, ''), c.email),
      address = COALESCE(NULLIF(NEW.customer_address, ''), c.address),
      district = COALESCE(NULLIF(NEW.customer_district, ''), c.district),
      nearest_city = COALESCE(NULLIF(NEW.customer_city, ''), c.nearest_city),
      updated_at = now()
    FROM (
      SELECT
        COUNT(*)::int AS cnt,
        COALESCE(SUM(o.total), 0) AS spend,
        COALESCE(SUM(GREATEST(o.total - o.advance_paid, 0))
          FILTER (WHERE o.payment_status != 'paid'), 0) AS balance
      FROM public.orders o
      WHERE o.business_id = NEW.business_id
        AND o.deleted_at IS NULL
        AND public.normalize_phone(COALESCE(o.customer_phone, '')) = v_normalized_phone
    ) sub
    WHERE c.id = v_customer_id;

    NEW.customer_id := v_customer_id;
    RETURN NEW;
  END IF;

  -- ── Create new customer ──────────────────────────────────────
  INSERT INTO public.customers (
    business_id, name, phone, whatsapp, email,
    address, district, nearest_city,
    lifetime_spend, total_orders, pending_balance
  ) VALUES (
    NEW.business_id,
    COALESCE(NULLIF(trim(NEW.customer_name), ''), 'Walk-in customer'),
    NEW.customer_phone,
    NULLIF(NEW.customer_whatsapp, ''),
    NULLIF(NEW.customer_email, ''),
    NULLIF(NEW.customer_address, ''),
    NULLIF(NEW.customer_district, ''),
    NULLIF(NEW.customer_city, ''),
    v_order_total,
    1,
    CASE WHEN NEW.payment_status != 'paid' THEN v_order_balance ELSE 0 END
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_customer_id;

  -- If ON CONFLICT DO NOTHING didn't return an id (race condition), find it
  IF v_customer_id IS NULL THEN
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE business_id = NEW.business_id
      AND deleted_at IS NULL
      AND public.normalize_phone(COALESCE(phone, '')) = v_normalized_phone
    LIMIT 1;
  END IF;

  IF v_customer_id IS NOT NULL THEN
    NEW.customer_id := v_customer_id;
  END IF;

  RETURN NEW;
END;
$$;

-- ─── Core: sync on order DELETE ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_customer_on_order_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_phone text;
  v_customer_id uuid;
BEGIN
  IF OLD.customer_phone IS NULL OR trim(OLD.customer_phone) = '' THEN
    RETURN OLD;
  END IF;

  v_normalized_phone := public.normalize_phone(OLD.customer_phone);
  IF length(v_normalized_phone) < 5 THEN
    RETURN OLD;
  END IF;

  -- Find customer
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE business_id = OLD.business_id
    AND deleted_at IS NULL
    AND public.normalize_phone(COALESCE(phone, '')) = v_normalized_phone
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    RETURN OLD;
  END IF;

  -- Recalculate aggregates from remaining orders
  UPDATE public.customers c SET
    total_orders = sub.cnt,
    lifetime_spend = sub.spend,
    pending_balance = sub.balance,
    updated_at = now()
  FROM (
    SELECT
      COUNT(*)::int AS cnt,
      COALESCE(SUM(o.total), 0) AS spend,
      COALESCE(SUM(GREATEST(o.total - o.advance_paid, 0))
        FILTER (WHERE o.payment_status != 'paid'), 0) AS balance
    FROM public.orders o
    WHERE o.business_id = OLD.business_id
      AND o.id != OLD.id
      AND o.deleted_at IS NULL
      AND public.normalize_phone(COALESCE(o.customer_phone, '')) = v_normalized_phone
  ) sub
  WHERE c.id = v_customer_id;

  -- Soft-delete customer if no orders remain
  IF NOT EXISTS (
    SELECT 1 FROM public.orders
    WHERE business_id = OLD.business_id
      AND id != OLD.id
      AND deleted_at IS NULL
      AND public.normalize_phone(COALESCE(customer_phone, '')) = v_normalized_phone
  ) THEN
    UPDATE public.customers SET deleted_at = now(), updated_at = now()
    WHERE id = v_customer_id;
  END IF;

  RETURN OLD;
END;
$$;

-- ─── Attach triggers ──────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_sync_customer_on_order_insert ON public.orders;
CREATE TRIGGER trg_sync_customer_on_order_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_customer_from_order();

DROP TRIGGER IF EXISTS trg_sync_customer_on_order_update ON public.orders;
CREATE TRIGGER trg_sync_customer_on_order_update
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_customer_from_order();

DROP TRIGGER IF EXISTS trg_sync_customer_on_order_delete ON public.orders;
CREATE TRIGGER trg_sync_customer_on_order_delete
  AFTER DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_customer_on_order_delete();

-- ─── Backfill: populate customers from existing orders ─────────────
WITH customer_stats AS (
  SELECT
    o.business_id,
    public.normalize_phone(COALESCE(o.customer_phone, '')) AS norm_phone,
    COUNT(*)::int AS total_orders,
    COALESCE(SUM(o.total), 0) AS lifetime_spend,
    COALESCE(SUM(GREATEST(o.total - o.advance_paid, 0))
      FILTER (WHERE o.payment_status != 'paid'), 0) AS pending_balance,
    MIN(o.created_at) AS created_at,
    -- Pick the latest non-empty values for customer fields
    (ARRAY_REMOVE(ARRAY_AGG(NULLIF(trim(o.customer_name), '') ORDER BY o.created_at DESC), NULL))[1] AS name,
    (ARRAY_REMOVE(ARRAY_AGG(o.customer_phone ORDER BY o.created_at DESC), NULL))[1] AS phone,
    (ARRAY_REMOVE(ARRAY_AGG(NULLIF(o.customer_whatsapp, '') ORDER BY o.created_at DESC), NULL))[1] AS whatsapp,
    (ARRAY_REMOVE(ARRAY_AGG(NULLIF(o.customer_email, '') ORDER BY o.created_at DESC), NULL))[1] AS email,
    (ARRAY_REMOVE(ARRAY_AGG(NULLIF(o.customer_address, '') ORDER BY o.created_at DESC), NULL))[1] AS address,
    (ARRAY_REMOVE(ARRAY_AGG(NULLIF(o.customer_district, '') ORDER BY o.created_at DESC), NULL))[1] AS district,
    (ARRAY_REMOVE(ARRAY_AGG(NULLIF(o.customer_city, '') ORDER BY o.created_at DESC), NULL))[1] AS nearest_city
  FROM public.orders o
  WHERE o.deleted_at IS NULL
    AND o.customer_phone IS NOT NULL
    AND length(public.normalize_phone(o.customer_phone)) >= 5
  GROUP BY o.business_id, public.normalize_phone(COALESCE(o.customer_phone, ''))
)
INSERT INTO public.customers (
  business_id, name, phone, whatsapp, email,
  address, district, nearest_city,
  lifetime_spend, total_orders, pending_balance, created_at
)
SELECT
  cs.business_id,
  COALESCE(NULLIF(cs.name, ''), 'Walk-in customer'),
  cs.phone,
  cs.whatsapp,
  cs.email,
  cs.address,
  cs.district,
  cs.nearest_city,
  cs.lifetime_spend,
  cs.total_orders,
  cs.pending_balance,
  cs.created_at
FROM customer_stats cs
LEFT JOIN public.customers c
  ON c.business_id = cs.business_id
  AND public.normalize_phone(COALESCE(c.phone, '')) = cs.norm_phone
  AND c.deleted_at IS NULL
WHERE c.id IS NULL
ON CONFLICT DO NOTHING;

-- Fix pending_balance for backfilled customers: only count non-paid orders
UPDATE public.customers c SET
  pending_balance = sub.balance
FROM (
  SELECT
    cu.id AS customer_id,
    COALESCE(SUM(GREATEST(o.total - o.advance_paid, 0))
      FILTER (WHERE o.payment_status != 'paid'), 0) AS balance
  FROM public.customers cu
  JOIN public.orders o
    ON o.business_id = cu.business_id
    AND public.normalize_phone(COALESCE(o.customer_phone, '')) = public.normalize_phone(COALESCE(cu.phone, ''))
    AND o.deleted_at IS NULL
  WHERE cu.deleted_at IS NULL
  GROUP BY cu.id
) sub
WHERE c.id = sub.customer_id;
