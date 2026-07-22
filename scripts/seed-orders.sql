-- =============================================
-- Bizravana — Orders Seed Data
-- Paste this into your Supabase SQL Editor.
-- =============================================
-- 🛠️  BEFORE YOU RUN:
--   1. Make sure you have at least one business in your `businesses` table.
--   2. Replace `YOUR_BUSINESS_ID` below with your actual business UUID.
--   3. Make sure you have at least one user in `auth.users` for `created_by`.
--   4. Optionally, replace `YOUR_USER_ID` with your auth user UUID.
-- =============================================

-- ─── 1. SET YOUR IDs HERE ─────────────────────────────────────────
-- Replace these with actual UUIDs from your database.
-- If you don't know your business ID, run: SELECT id, name FROM businesses;
-- If you don't know your user ID,  run: SELECT id, email FROM auth.users;

DO $$
DECLARE
  -- !!! CHANGE THESE VALUES !!!
  v_business_id UUID := 'YOUR_BUSINESS_ID';  -- <-- REPLACE THIS
  v_user_id     UUID := 'YOUR_USER_ID';       -- <-- REPLACE THIS (or NULL)

  -- Internal variables (do not change)
  v_order_id       UUID;
  v_ord            INT;
  v_created_at     TIMESTAMPTZ;
  v_delivery_date  DATE;
  v_customer_name  TEXT;
  v_customer_phone TEXT;
  v_customer_dist  TEXT;
  v_customer_city  TEXT;
  v_subtotal       DECIMAL(12,2);
  v_discount       DECIMAL(10,2);
  v_delivery_charge DECIMAL(10,2);
  v_advance        DECIMAL(10,2);
  v_payment_method TEXT;
  v_payment_status TEXT;
  v_order_status   TEXT;
  v_remarks        TEXT;
BEGIN
  -- Validate that the business exists
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE id = v_business_id) THEN
    RAISE EXCEPTION 'Business ID % not found. Please check your businesses table.', v_business_id;
  END IF;

  -- ─── 2. ORDER DATA ──────────────────────────────────────────────
  -- Each entry: (customer, phone, district, city, status, payment_status,
  --              payment_method, subtotal, discount, delivery, advance, remarks)

  -- Order 1: New Order — Pending
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city, expected_delivery_date,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0001', 'Saman Perera', '077-123-4567',
    'Colombo', 'Colombo 05', CURRENT_DATE + INTERVAL '5 days',
    350.00, 12500.00, 500.00, 'fixed', 0,
    'cod', 'pending', 'new_order', 'New curtains for living room. Rush delivery requested.',
    v_user_id, NOW() - INTERVAL '2 hours',
    NULL
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Premium Velvet Curtains', 'Curtains', 8500.00, 1, 1),
    (v_order_id, v_business_id, 'Sheer Curtains - White', 'Curtains', 4000.00, 1, 2);

  -- Order 2: New Order — Advanced Payment
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city, expected_delivery_date,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0002', 'Nimal Fernando', '071-987-6543',
    'Gampaha', 'Gampaha', CURRENT_DATE + INTERVAL '7 days',
    500.00, 22300.00, 0, NULL, 10000.00,
    'bank_transfer', 'advanced', 'new_order', 'Office blinds for 3 windows. Customer paid advance via bank.',
    v_user_id, NOW() - INTERVAL '5 hours',
    NULL
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Vertical Blinds - Grey', 'Blinds', 8500.00, 2, 1),
    (v_order_id, v_business_id, 'Curtain Rod - 6ft', 'Accessories', 1800.00, 3, 2);

  -- Order 3: Ready
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city, expected_delivery_date,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0003', 'Kumari Rathnayake', '076-555-1234',
    'Kandy', 'Kandy', CURRENT_DATE + INTERVAL '2 days',
    0, 8750.00, 750.00, 'fixed', 8750.00,
    'cash', 'paid', 'ready', 'Cushion covers — fully paid. Ready for pickup.',
    v_user_id, NOW() - INTERVAL '1 day',
    NULL
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Cotton Cushion Covers - Set of 4', 'Cushions', 4750.00, 1, 1),
    (v_order_id, v_business_id, 'Lace Trim Pillow Cases', 'Bedding', 4000.00, 1, 2);

  -- Order 4: Packed
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0004', 'Priya Jayawardena', '072-333-7890',
    'Colombo', 'Colombo 07',
    450.00, 31000.00, 2000.00, 'fixed', 15000.00,
    'cod', 'advanced', 'packed', 'Full bedroom set. Packed and ready for dispatch.',
    v_user_id, NOW() - INTERVAL '2 days',
    NULL
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'King Size Bed Sheet Set', 'Bedding', 12000.00, 1, 1),
    (v_order_id, v_business_id, 'Blackout Curtains - Navy', 'Curtains', 9500.00, 2, 2);

  -- Order 5: Dispatched
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city, expected_delivery_date, dispatched_date,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0005', 'Rohan Silva', '077-777-1111',
    'Kurunegala', 'Kurunegala', CURRENT_DATE + 1, NOW() - INTERVAL '3 hours',
    650.00, 5600.00, 0, NULL, 5600.00,
    'bank_transfer', 'paid', 'dispatched', 'Custom table cloth — dispatched via Lanka Courier. Tracking: LK-TRK-8842.',
    v_user_id, NOW() - INTERVAL '3 days',
    'LK-TRK-8842'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Embroidered Table Cloth - 6 Seater', 'Table Linens', 5600.00, 1, 1);

  -- Order 6: Delivered
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city, expected_delivery_date, dispatched_date,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0006', 'Dinesh Wickramasinghe', '078-444-5678',
    'Galle', 'Galle', CURRENT_DATE - 2, NOW() - INTERVAL '4 days',
    0, 16450.00, 500.00, 'percentage', 16450.00,
    'cash', 'paid', 'delivered', 'Delivered and customer confirmed satisfaction.',
    v_user_id, NOW() - INTERVAL '5 days',
    'LK-TRK-6692'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Roman Blinds - Beige', 'Blinds', 7200.00, 2, 1),
    (v_order_id, v_business_id, 'Tiebacks - Gold', 'Accessories', 750.00, 2, 2),
    (v_order_id, v_business_id, 'Curtain Hooks - Pack of 10', 'Accessories', 800.00, 1, 3);

  -- Order 7: Cancelled
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0007', 'Chaminda Bandara', '070-888-9999',
    'Anuradhapura', 'Anuradhapura',
    0, 9500.00, 0, NULL, 0,
    'cod', 'pending', 'cancelled', 'Customer cancelled — decided not to renovate.',
    v_user_id, NOW() - INTERVAL '6 days',
    NULL
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Custom Size Curtains - Burgundy', 'Curtains', 9500.00, 1, 1);

  -- Order 8: Returned
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city, expected_delivery_date, dispatched_date,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0008', 'Shirani Ekanayake', '075-666-4321',
    'Matara', 'Matara', CURRENT_DATE - 5, NOW() - INTERVAL '8 days',
    300.00, 7800.00, 0, NULL, 7800.00,
    'bank_transfer', 'paid', 'returned', 'Customer returned — size mismatch. Refund processed.',
    v_user_id, NOW() - INTERVAL '8 days',
    'LK-TRK-4415'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Woven Curtains - Natural Linen', 'Curtains', 7800.00, 1, 1);

  -- Order 9: Dispatched — Another one for more table data
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city, expected_delivery_date, dispatched_date,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0009', 'Lakmal de Silva', '077-222-3344',
    'Colombo', 'Colombo 03', CURRENT_DATE + 3, NOW() - INTERVAL '1 day',
    250.00, 27500.00, 2500.00, 'fixed', 10000.00,
    'cod', 'advanced', 'dispatched', 'Motorized blinds — dispatched with installation team.',
    v_user_id, NOW() - INTERVAL '3 days',
    'LK-TRK-3321'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Motorized Roller Blinds - White', 'Blinds', 18500.00, 1, 1),
    (v_order_id, v_business_id, 'Remote Control Unit', 'Accessories', 4500.00, 2, 2);

  -- Order 10: Delivered — Another one
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city, expected_delivery_date, dispatched_date,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0010', 'Anusha Fernando', '071-111-2233',
    'Negombo', 'Negombo', CURRENT_DATE - 3, NOW() - INTERVAL '5 days',
    400.00, 4200.00, 0, NULL, 4200.00,
    'cash', 'paid', 'delivered', 'Ready-made curtains — delivered to doorstep.',
    v_user_id, NOW() - INTERVAL '6 days',
    'LK-TRK-7788'
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Ready-Made Curtains - Ivory', 'Curtains', 3200.00, 1, 1),
    (v_order_id, v_business_id, 'Magnetic Curtain Holders', 'Accessories', 1000.00, 1, 2);

  -- Order 11: Packed — Another one
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0011', 'Thilini Gunawardena', '072-555-7788',
    'Colombo', 'Colombo 08',
    0, 15000.00, 1500.00, 'fixed', 0,
    'cod', 'pending', 'packed', 'Custom cushion sets — packed, awaiting delivery schedule.',
    v_user_id, NOW() - INTERVAL '1 day',
    NULL
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Boho Cushion Set - 6 pcs', 'Cushions', 15000.00, 1, 1);

  -- Order 12: New Order — Another one (so "All" tab shows 12)
  INSERT INTO orders (
    business_id, order_number, customer_name, customer_phone,
    customer_district, customer_city, expected_delivery_date,
    delivery_charge, subtotal, discount, discount_type, advance_paid,
    payment_method, payment_status, status, remarks, created_by, created_at,
    waybill_id
  ) VALUES (
    v_business_id, 'ORD-2026-0012', 'Ruwan Jayasinghe', '076-999-0011',
    'Kalutara', 'Kalutara', CURRENT_DATE + INTERVAL '10 days',
    550.00, 19200.00, 1200.00, 'percentage', 5000.00,
    'bank_transfer', 'advanced', 'new_order', 'Full upholstery for restaurant. 15% discount applied on fabric.',
    v_user_id, NOW() - INTERVAL '30 minutes',
    NULL
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, business_id, product_name, category, unit_price, quantity, sort_order) VALUES
    (v_order_id, v_business_id, 'Vinyl Upholstery Fabric - Maroon', 'Upholstery', 7200.00, 2, 1),
    (v_order_id, v_business_id, 'Foam Padding - 2 inch', 'Upholstery', 4800.00, 1, 2);

  RAISE NOTICE '✅ Inserted 12 orders with order_items for business %.', v_business_id;
END $$;
