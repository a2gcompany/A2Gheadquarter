-- A2G Headquarters - Migration v3: Accurate Foundation Data
-- This replaces all fake/placeholder data with real information
-- Run in Supabase SQL Editor after migration-v2.sql

-- ============================================
-- 1. CLEAN UP PROJECTS: Remove S-CORE, keep micro investments as expense categories
-- ============================================

-- Remove S-CORE (no longer active)
DELETE FROM projects WHERE name = 'S-CORE' AND type = 'vertical';

-- Remove PAIDDADS as standalone project (tracked as holding expense instead)
DELETE FROM projects WHERE name = 'PAIDDADS' AND type = 'vertical';

-- Ensure AIRE exists as artist under A2G Talents
INSERT INTO projects (name, type, business_unit_id)
SELECT 'AIRE', 'artist', (SELECT id FROM business_units WHERE slug = 'talents')
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'AIRE');

-- Make sure all artists belong to A2G Talents
UPDATE projects
SET business_unit_id = (SELECT id FROM business_units WHERE slug = 'talents')
WHERE type = 'artist' AND business_unit_id IS NULL;

-- Make sure A2G Company vertical belongs to holding
UPDATE projects
SET business_unit_id = (SELECT id FROM business_units WHERE slug = 'holding')
WHERE name = 'A2G Company' AND type = 'vertical' AND business_unit_id IS NULL;

-- Make sure A2G Talents vertical belongs to talents
UPDATE projects
SET business_unit_id = (SELECT id FROM business_units WHERE slug = 'talents')
WHERE name = 'A2G Talents' AND type = 'vertical' AND business_unit_id IS NULL;

-- ============================================
-- 2. REPLACE FAKE EMPLOYEES WITH REAL TEAM
-- ============================================

-- Clear all fake employees
DELETE FROM employees;

-- Insert real team
DO $$
DECLARE
  talents_id UUID;
  audesign_id UUID;
BEGIN
  SELECT id INTO talents_id FROM business_units WHERE slug = 'talents' LIMIT 1;
  SELECT id INTO audesign_id FROM business_units WHERE slug = 'audesign' LIMIT 1;

  -- A2G Talents team
  IF talents_id IS NOT NULL THEN
    INSERT INTO employees (business_unit_id, name, role, status) VALUES
      (talents_id, 'Mario', 'A&R', 'active'),
      (talents_id, 'Ivan', 'Agent', 'active');
  END IF;

  -- Audesign team
  IF audesign_id IS NOT NULL THEN
    INSERT INTO employees (business_unit_id, name, role, status) VALUES
      (audesign_id, 'Alvaro', 'Product & Partner', 'active'),
      (audesign_id, 'Cristian', 'Marketing', 'active'),
      (audesign_id, 'Marius', 'Meta Ads', 'active'),
      (audesign_id, 'Salva', 'Google Ads', 'active');
  END IF;
END $$;

-- Note: Cristian also does marketing for Roger Sanchez (cross-business unit)
-- We track him under Audesign as primary, with a note
UPDATE employees SET notes = 'Also handles marketing for Roger Sanchez (A2G Talents)'
WHERE name = 'Cristian';

-- ============================================
-- 3. REPLACE FAKE PAYMENT SOURCES WITH REAL ONES
-- ============================================

-- Clear all fake payment sources
DELETE FROM payment_sources;

-- Insert real payment sources
DO $$
DECLARE
  holding_id UUID;
  audesign_id UUID;
BEGIN
  SELECT id INTO holding_id FROM business_units WHERE slug = 'holding' LIMIT 1;
  SELECT id INTO audesign_id FROM business_units WHERE slug = 'audesign' LIMIT 1;

  -- Business accounts (under holding)
  IF holding_id IS NOT NULL THEN
    INSERT INTO payment_sources (business_unit_id, name, type, currency) VALUES
      (holding_id, 'Wio Business', 'bank', 'AED'),
      (holding_id, 'Wise Personal', 'wise', 'EUR');
  END IF;

  -- Audesign revenue sources
  IF audesign_id IS NOT NULL THEN
    INSERT INTO payment_sources (business_unit_id, name, type, currency) VALUES
      (audesign_id, 'Shopify', 'stripe', 'EUR'),
      (audesign_id, 'Stripe', 'stripe', 'EUR'),
      (audesign_id, 'PayPal', 'paypal', 'EUR');
  END IF;

  -- Personal accounts (under holding)
  IF holding_id IS NOT NULL THEN
    INSERT INTO payment_sources (business_unit_id, name, type, currency) VALUES
      (holding_id, 'Wio Personal', 'bank', 'AED'),
      (holding_id, 'Amex Personal', 'bank', 'EUR');
  END IF;
END $$;

-- ============================================
-- 4. CLEAR FAKE AUDESIGN KPIs
-- ============================================

-- Remove invented KPI data - real data should come from Shopify/Stripe/PayPal/Meta/Google
DELETE FROM audesign_kpis;

-- ============================================
-- 5. ADD EXPENSE CATEGORIES FOR MICRO INVESTMENTS
-- ============================================

-- Add a categories reference so micro investments can be tracked as holding expenses
-- These are used as transaction categories, not as business units
-- Categories: EMVI, piedras.tirar, MMM, PAIDDADS

-- No new table needed - just use the 'category' field in transactions
-- When adding expenses for micro investments, use category values like:
-- 'investment:emvi', 'investment:piedras', 'investment:mmm', 'investment:paiddads'

-- ============================================
-- 6. VERIFY FINAL STATE
-- ============================================

-- Show business units
SELECT '--- BUSINESS UNITS ---' as section;
SELECT slug, name, type FROM business_units ORDER BY slug;

-- Show projects
SELECT '--- PROJECTS ---' as section;
SELECT p.name, p.type, bu.name as business_unit
FROM projects p
LEFT JOIN business_units bu ON p.business_unit_id = bu.id
ORDER BY p.type, p.name;

-- Show employees
SELECT '--- EMPLOYEES ---' as section;
SELECT e.name, e.role, e.status, bu.name as business_unit, e.notes
FROM employees e
LEFT JOIN business_units bu ON e.business_unit_id = bu.id
ORDER BY bu.name, e.name;

-- Show payment sources
SELECT '--- PAYMENT SOURCES ---' as section;
SELECT ps.name, ps.type, ps.currency, bu.name as business_unit
FROM payment_sources ps
LEFT JOIN business_units bu ON ps.business_unit_id = bu.id
ORDER BY bu.name, ps.name;

SELECT 'Migration v3 complete! Foundation data is now accurate.' as message;
