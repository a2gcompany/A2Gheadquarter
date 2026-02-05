-- A2G Headquarters - Migration v2: Multi-Business Unit Structure
-- Run this in Supabase SQL Editor after setup.sql

-- ============================================
-- 1. BUSINESS UNITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('holding', 'management', 'software', 'marketing', 'media')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert business units
INSERT INTO business_units (slug, name, type, description) VALUES
  ('holding', 'A2G Company', 'holding', 'A2G FZCO - Holding Principal'),
  ('talents', 'A2G Talents', 'management', 'Artist Management - Roger Sanchez, Prophecy, BABEL'),
  ('audesign', 'Audesign', 'software', 'Software para productores musicales')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  monthly_cost NUMERIC(12,2),
  currency TEXT DEFAULT 'EUR',
  start_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'contractor')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert sample employees (2 Talents, 3 Audesign)
DO $$
DECLARE
  talents_id UUID;
  audesign_id UUID;
BEGIN
  SELECT id INTO talents_id FROM business_units WHERE slug = 'talents' LIMIT 1;
  SELECT id INTO audesign_id FROM business_units WHERE slug = 'audesign' LIMIT 1;

  IF talents_id IS NOT NULL THEN
    INSERT INTO employees (business_unit_id, name, role, monthly_cost, currency, status) VALUES
      (talents_id, 'Employee 1', 'Artist Manager', 2500, 'EUR', 'active'),
      (talents_id, 'Employee 2', 'Booking Agent', 2200, 'EUR', 'active')
    ON CONFLICT DO NOTHING;
  END IF;

  IF audesign_id IS NOT NULL THEN
    INSERT INTO employees (business_unit_id, name, role, monthly_cost, currency, status) VALUES
      (audesign_id, 'Dev 1', 'Full Stack Developer', 3500, 'EUR', 'active'),
      (audesign_id, 'Dev 2', 'Frontend Developer', 3000, 'EUR', 'active'),
      (audesign_id, 'Dev 3', 'Backend Developer', 3200, 'EUR', 'active')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 3. PAYMENT SOURCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'stripe', 'paypal', 'wise', 'cash', 'crypto')),
  account_identifier TEXT,
  currency TEXT DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert payment sources
DO $$
DECLARE
  holding_id UUID;
  audesign_id UUID;
BEGIN
  SELECT id INTO holding_id FROM business_units WHERE slug = 'holding' LIMIT 1;
  SELECT id INTO audesign_id FROM business_units WHERE slug = 'audesign' LIMIT 1;

  IF holding_id IS NOT NULL THEN
    INSERT INTO payment_sources (business_unit_id, name, type, currency) VALUES
      (holding_id, 'BBVA A2G Company', 'bank', 'EUR'),
      (holding_id, 'Wise A2G', 'bank', 'EUR')
    ON CONFLICT DO NOTHING;
  END IF;

  IF audesign_id IS NOT NULL THEN
    INSERT INTO payment_sources (business_unit_id, name, type, currency) VALUES
      (audesign_id, 'Stripe Audesign', 'stripe', 'EUR'),
      (audesign_id, 'PayPal Audesign', 'paypal', 'EUR')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 4. AUDESIGN KPIs TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audesign_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL,
  mrr NUMERIC(12,2),
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  churned_users INTEGER DEFAULT 0,
  stripe_revenue NUMERIC(12,2),
  paypal_revenue NUMERIC(12,2),
  conversion_rate NUMERIC(5,2),
  arpu NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(period)
);

-- Insert sample KPIs for last 6 months
INSERT INTO audesign_kpis (period, mrr, active_users, new_users, churned_users, stripe_revenue, paypal_revenue, conversion_rate, arpu) VALUES
  ('2024-09', 1850, 98, 15, 5, 1650, 200, 2.1, 18.88),
  ('2024-10', 1980, 105, 12, 5, 1780, 200, 2.2, 18.86),
  ('2024-11', 2100, 112, 10, 3, 1900, 200, 2.3, 18.75),
  ('2024-12', 2200, 118, 9, 3, 2000, 200, 2.2, 18.64),
  ('2025-01', 2340, 127, 12, 3, 2140, 200, 2.3, 18.43),
  ('2025-02', 2450, 134, 10, 3, 2250, 200, 2.4, 18.28)
ON CONFLICT (period) DO NOTHING;

-- ============================================
-- 5. MODIFY EXISTING TABLES
-- ============================================

-- Add business_unit_id to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL;

-- Update existing artist projects to belong to A2G Talents
UPDATE projects
SET business_unit_id = (SELECT id FROM business_units WHERE slug = 'talents')
WHERE type = 'artist' AND business_unit_id IS NULL;

-- Add columns to transactions
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payment_source_id UUID REFERENCES payment_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS business_unit_id UUID REFERENCES business_units(id) ON DELETE SET NULL;

-- ============================================
-- 6. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_employees_business_unit ON employees(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_payment_sources_business_unit ON payment_sources(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_payment_sources_type ON payment_sources(type);
CREATE INDEX IF NOT EXISTS idx_audesign_kpis_period ON audesign_kpis(period DESC);
CREATE INDEX IF NOT EXISTS idx_projects_business_unit ON projects(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_transactions_business_unit ON transactions(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_source ON transactions(payment_source_id);

-- ============================================
-- 7. VIEWS FOR CONVENIENCE
-- ============================================

-- View: Employees with business unit name
CREATE OR REPLACE VIEW employees_with_unit AS
SELECT
  e.*,
  bu.name as business_unit_name,
  bu.slug as business_unit_slug
FROM employees e
LEFT JOIN business_units bu ON e.business_unit_id = bu.id;

-- View: Projects with business unit
CREATE OR REPLACE VIEW projects_with_unit AS
SELECT
  p.*,
  bu.name as business_unit_name,
  bu.slug as business_unit_slug
FROM projects p
LEFT JOIN business_units bu ON p.business_unit_id = bu.id;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Migration v2 complete! Multi-business unit structure created.' as message;
