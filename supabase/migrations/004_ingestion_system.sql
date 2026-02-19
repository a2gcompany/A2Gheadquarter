-- =============================================
-- Migration 004: Ingestion System Overhaul
-- Features: import_history, reconciliation, better dedup, google_sheets config
-- =============================================

-- 1. IMPORT HISTORY TABLE
CREATE TABLE IF NOT EXISTS import_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  triggered_by TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  rows_imported INTEGER DEFAULT 0,
  rows_skipped INTEGER DEFAULT 0,
  rows_errored INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_history_source ON import_history(source_type);
CREATE INDEX IF NOT EXISTS idx_import_history_status ON import_history(status);
CREATE INDEX IF NOT EXISTS idx_import_history_started ON import_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_history_integration ON import_history(integration_id);

-- 2. ADD external_id AND import_id TO TRANSACTIONS
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS import_id UUID REFERENCES import_history(id) ON DELETE SET NULL;

-- Unique index on external_id for fast dedup (partial - only non-null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_external_id
  ON transactions(external_id) WHERE external_id IS NOT NULL;

-- Backfill external_id from source_file for existing integration records
UPDATE transactions
SET external_id = source_file
WHERE source_file IS NOT NULL
  AND source_file LIKE '%:%'
  AND external_id IS NULL;

-- 3. RECONCILIATION MATCHES TABLE
CREATE TABLE IF NOT EXISTS reconciliation_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_a_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  transaction_b_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL DEFAULT 'auto'
    CHECK (match_type IN ('auto', 'manual')),
  match_confidence DECIMAL(3, 2),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'rejected')),
  matched_on JSONB DEFAULT '{}',
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_tx_a ON reconciliation_matches(transaction_a_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_tx_b ON reconciliation_matches(transaction_b_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON reconciliation_matches(status);

-- Prevent duplicate match pairs
CREATE UNIQUE INDEX IF NOT EXISTS idx_reconciliation_pair
  ON reconciliation_matches(
    LEAST(transaction_a_id, transaction_b_id),
    GREATEST(transaction_a_id, transaction_b_id)
  );

-- 4. SEED GOOGLE SHEETS INTEGRATION (move hardcoded IDs to DB)
INSERT INTO integrations (type, name, config, is_active)
SELECT 'google_sheets',
       'Google Sheets - Releases & Pitchings',
       '{"releasesSheetId": "1bzMHgX-XgxxhPcEjx0IRL2FJ3TiZIuP09qSYQ9QAu_A", "pitchingsSheetId": "1IY8tLs9rMwmmgAohlOV4h7djpmYSIZ-3R1e67Q0uyiU"}'::jsonb,
       true
WHERE NOT EXISTS (
  SELECT 1 FROM integrations WHERE type = 'google_sheets'
);
