-- A2G Headquarters - Setup Tables
-- Run this in Supabase SQL Editor (supabase.com/dashboard > SQL Editor)

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('artist', 'vertical')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT,
  source_file TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Releases table
CREATE TABLE IF NOT EXISTS releases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  track_name TEXT NOT NULL,
  labels_contacted JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'shopping', 'accepted', 'released')),
  release_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  fee NUMERIC(12, 2),
  fee_currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'negotiating' CHECK (status IN ('negotiating', 'confirmed', 'contracted', 'completed', 'cancelled')),
  show_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  submitted_by TEXT NOT NULL,
  period TEXT NOT NULL,
  department TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_releases_project_id ON releases(project_id);
CREATE INDEX IF NOT EXISTS idx_bookings_project_id ON bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_bookings_show_date ON bookings(show_date);

-- Insert artists
INSERT INTO projects (name, type) VALUES
  ('Prophecy', 'artist'),
  ('BABEL', 'artist'),
  ('Roger Sanchez', 'artist'),
  ('AIRE', 'artist')
ON CONFLICT DO NOTHING;

-- Insert verticals (core business units only)
INSERT INTO projects (name, type) VALUES
  ('A2G Company', 'vertical'),
  ('A2G Talents', 'vertical')
ON CONFLICT DO NOTHING;

-- Insert sample releases for Prophecy
DO $$
DECLARE
  prophecy_id UUID;
BEGIN
  SELECT id INTO prophecy_id FROM projects WHERE name = 'Prophecy' LIMIT 1;

  IF prophecy_id IS NOT NULL THEN
    INSERT INTO releases (project_id, track_name, status, labels_contacted, notes) VALUES
      (prophecy_id, 'Midnight Dreams', 'shopping', '[{"label": "Afterlife", "status": "pending", "date": "2025-01-15"}, {"label": "Drumcode", "status": "waiting", "date": "2025-01-20"}]', 'Melodic techno track'),
      (prophecy_id, 'Eternal Echoes', 'draft', '[]', 'Work in progress'),
      (prophecy_id, 'Solar Flare', 'released', '[{"label": "Innervisions", "status": "accepted", "date": "2024-11-01"}]', 'Released on Innervisions'),
      (prophecy_id, 'Desert Storm', 'accepted', '[{"label": "Diynamic", "status": "accepted", "date": "2025-01-10"}]', 'Releasing March 2025')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert sample bookings
DO $$
DECLARE
  prophecy_id UUID;
  roger_id UUID;
BEGIN
  SELECT id INTO prophecy_id FROM projects WHERE name = 'Prophecy' LIMIT 1;
  SELECT id INTO roger_id FROM projects WHERE name = 'Roger Sanchez' LIMIT 1;

  IF prophecy_id IS NOT NULL THEN
    INSERT INTO bookings (project_id, venue, city, country, fee, fee_currency, status, show_date) VALUES
      (prophecy_id, 'Pacha', 'Ibiza', 'Spain', 5000, 'EUR', 'confirmed', '2025-07-15'),
      (prophecy_id, 'Fabric', 'London', 'UK', 3500, 'GBP', 'contracted', '2025-06-20'),
      (prophecy_id, 'Watergate', 'Berlin', 'Germany', 2500, 'EUR', 'negotiating', '2025-08-10')
    ON CONFLICT DO NOTHING;
  END IF;

  IF roger_id IS NOT NULL THEN
    INSERT INTO bookings (project_id, venue, city, country, fee, fee_currency, status, show_date) VALUES
      (roger_id, 'Space', 'Miami', 'USA', 15000, 'USD', 'confirmed', '2025-03-28'),
      (roger_id, 'Amnesia', 'Ibiza', 'Spain', 12000, 'EUR', 'contracted', '2025-07-22')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Success message
SELECT 'Setup complete! Tables created and sample data inserted.' as message;
