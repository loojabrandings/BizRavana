-- =============================================
-- Migration 011: Remove restrictive CHECK constraints on expenses
-- 1. category: was limited to 'inventory'/'other', but we now use
--    the expense_categories table for custom categories.
-- 2. payment_status: was limited to 'pending'/'paid', but the app
--    also supports 'advanced'.
-- =============================================

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_payment_status_check;
