-- Integrations table for tracking external data sources
CREATE TABLE IF NOT EXISTS integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_unit_id UUID REFERENCES business_units(id),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure category column exists on transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category TEXT;
