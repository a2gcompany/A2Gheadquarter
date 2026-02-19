-- Add new fields to bookings for talent management
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contract_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fee_usd NUMERIC(12,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS artist_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_name TEXT;
