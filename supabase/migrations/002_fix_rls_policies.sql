-- =============================================
-- Fix: Missing INSERT RLS Policies for Auth Flow
-- Migration 002: Needed for registration to work
-- =============================================

-- Profiles: allow inserting own profile during registration
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Businesses: allow inserting own business during registration
CREATE POLICY "users_insert_own_business" ON businesses
  FOR INSERT WITH CHECK (owner_id = auth.uid());
