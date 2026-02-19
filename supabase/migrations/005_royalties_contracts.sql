-- =============================================
-- Migration 005: Royalties & Contracts
-- New tables for tracking royalty payments and deal contracts
-- =============================================

-- 1. ROYALTIES TABLE
CREATE TABLE IF NOT EXISTS royalties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  track_name TEXT NOT NULL,
  source TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'invoiced', 'paid', 'disputed', 'overdue')),
  invoice_number TEXT,
  invoice_date DATE,
  due_date DATE,
  paid_date DATE,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_royalties_project ON royalties(project_id);
CREATE INDEX IF NOT EXISTS idx_royalties_status ON royalties(status);
CREATE INDEX IF NOT EXISTS idx_royalties_source ON royalties(source);

-- 2. CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  counterparty TEXT NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'release'
    CHECK (contract_type IN ('release', 'management', 'publishing', 'booking', 'licensing', 'other')),
  status TEXT NOT NULL DEFAULT 'negotiating'
    CHECK (status IN ('draft', 'negotiating', 'sent', 'signing', 'active', 'completed', 'terminated')),
  value DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  key_terms TEXT,
  document_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(contract_type);
