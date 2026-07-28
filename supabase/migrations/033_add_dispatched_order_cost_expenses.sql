-- Automatically record cost of goods sold when an order is dispatched.
-- One active auto-generated expense is allowed per order.

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS source_order_id UUID
    REFERENCES public.orders(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS expenses_active_source_order_unique
  ON public.expenses (source_order_id)
  WHERE source_order_id IS NOT NULL
    AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS expenses_source_order_idx
  ON public.expenses (source_order_id)
  WHERE source_order_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_dispatched_order_cost_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total_cost NUMERIC(12, 2);
BEGIN
  IF NEW.status <> 'dispatched'
    OR OLD.status IS NOT DISTINCT FROM NEW.status
  THEN
    RETURN NEW;
  END IF;

  SELECT ROUND(
    COALESCE(
      SUM(
        order_item.quantity
        * COALESCE(product.cost_price, matched_product.cost_price)
      ),
      0
    ),
    2
  )
  INTO v_total_cost
  FROM public.order_items AS order_item
  LEFT JOIN public.products AS product
    ON product.id = order_item.product_id
   AND product.business_id = NEW.business_id
  LEFT JOIN LATERAL (
    SELECT MIN(candidate.cost_price) AS cost_price
    FROM public.products AS candidate
    WHERE order_item.product_id IS NULL
      AND candidate.business_id = NEW.business_id
      AND candidate.deleted_at IS NULL
      AND lower(trim(candidate.name)) = lower(trim(order_item.product_name))
      AND candidate.category IS NOT DISTINCT FROM order_item.category
      AND candidate.cost_price IS NOT NULL
      AND candidate.cost_price > 0
    HAVING COUNT(*) = 1
  ) AS matched_product ON TRUE
  WHERE order_item.order_id = NEW.id
    AND order_item.business_id = NEW.business_id
    AND COALESCE(product.cost_price, matched_product.cost_price) > 0;

  IF v_total_cost <= 0 THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.expenses (
    business_id,
    expense_number,
    expense_date,
    category,
    supplier,
    item_name,
    quantity,
    unit_cost,
    payment_method,
    payment_status,
    add_to_inventory,
    inventory_item_id,
    remarks,
    created_by,
    source_order_id
  )
  VALUES (
    NEW.business_id,
    'AUTO-COGS-' || NEW.order_number,
    COALESCE(NEW.dispatched_date::DATE, CURRENT_DATE),
    'inventory',
    NULL,
    'Product cost - Order ' || NEW.order_number,
    1,
    v_total_cost,
    NULL,
    'paid',
    FALSE,
    NULL,
    'Automatically added when order ' || NEW.order_number || ' was dispatched.',
    COALESCE(auth.uid(), NEW.created_by),
    NEW.id
  )
  ON CONFLICT (source_order_id)
    WHERE source_order_id IS NOT NULL
      AND deleted_at IS NULL
  DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_dispatched_order_cost_expense
  ON public.orders;

CREATE TRIGGER create_dispatched_order_cost_expense
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_dispatched_order_cost_expense();

REVOKE ALL ON FUNCTION public.create_dispatched_order_cost_expense()
  FROM PUBLIC;
