-- Observability data from Nucleus C
CREATE TABLE IF NOT EXISTS nucleus_observability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  services JSONB DEFAULT '{}',
  service_uptime JSONB DEFAULT '{}',
  cron_stats JSONB DEFAULT '{}',
  costs JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{}'
);

CREATE INDEX idx_observability_synced ON nucleus_observability(synced_at DESC);

-- Keep only last 168 rows (7 days of hourly syncs)
CREATE OR REPLACE FUNCTION cleanup_old_observability()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM nucleus_observability
  WHERE synced_at < NOW() - INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER observability_cleanup
AFTER INSERT ON nucleus_observability
FOR EACH STATEMENT
EXECUTE FUNCTION cleanup_old_observability();
