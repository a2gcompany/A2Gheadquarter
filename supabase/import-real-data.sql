-- A2G Headquarters - Import Real Data
-- Run this in Supabase SQL Editor to replace sample data with real releases and pitchings

-- ============================================
-- 1. CLEAR EXISTING SAMPLE RELEASES
-- ============================================
DELETE FROM releases;

-- ============================================
-- 2. GET PROJECT IDs
-- ============================================
-- We'll use DO blocks to handle the inserts with proper project_id lookups

-- ============================================
-- 3. INSERT REAL RELEASES
-- ============================================
DO $$
DECLARE
  prophecy_id UUID;
  roger_id UUID;
  babel_id UUID;
BEGIN
  -- Get project IDs
  SELECT id INTO prophecy_id FROM projects WHERE name = 'Prophecy' LIMIT 1;
  SELECT id INTO roger_id FROM projects WHERE name = 'Roger Sanchez' LIMIT 1;
  SELECT id INTO babel_id FROM projects WHERE name = 'BABEL' LIMIT 1;

  -- PROPHECY RELEASES
  IF prophecy_id IS NOT NULL THEN
    -- Alive - Released
    INSERT INTO releases (project_id, track_name, status, release_date, labels_contacted, notes) VALUES
    (prophecy_id, 'Alive', 'released', '2026-01-09',
     '[{"label": "Persona", "status": "accepted", "date": "2026-01-09"}]'::jsonb,
     'Single - 15,000 Spotify plays');

    -- Again and Again - Shopping
    INSERT INTO releases (project_id, track_name, status, labels_contacted, notes) VALUES
    (prophecy_id, 'Again and Again', 'shopping',
     '[{"label": "KREAM", "status": "pending", "sender": "Mike"}, {"label": "Morten", "status": "interested", "date": "2025-12-16", "sender": "Sergi", "notes": "Quiere subirle 2 bpm mas para ir a unos 132 o asi"}]'::jsonb,
     'En negociacion con Morten');

    -- IWYN - Shopping
    INSERT INTO releases (project_id, track_name, status, labels_contacted, notes) VALUES
    (prophecy_id, 'IWYN', 'shopping',
     '[{"label": "Spinnin Records (Deep/Aftr:hrs)", "status": "rejected", "date": "2026-01-02", "sender": "Mike", "email": "Marco.Cobussen@spinninrecords.nl"}, {"label": "Armada", "status": "rejected", "date": "2026-02-02", "sender": "m.bravo", "notes": "Doesnt fit"}, {"label": "Insomniac", "status": "pending", "sender": "m.bravo"}, {"label": "REALM", "status": "sent", "sender": "Mike"}, {"label": "DIYNAMIC", "status": "rejected", "sender": "Mike"}, {"label": "VINTAGE CULTURE", "status": "sent", "sender": "Mike"}, {"label": "HIGHER GROUND", "status": "pending", "sender": "Mike"}, {"label": "CR2", "status": "sent", "sender": "Mike"}, {"label": "Camelphat", "status": "pending", "sender": "Mike"}]'::jsonb,
     'Multiple labels contacted');

    -- Less hate - Shopping
    INSERT INTO releases (project_id, track_name, status, labels_contacted, notes) VALUES
    (prophecy_id, 'Less hate', 'shopping',
     '[{"label": "Guesstimate", "status": "interested", "date": "2025-12-16", "sender": "m.bravo", "notes": "Need changes. Sergi on it"}, {"label": "Armada", "status": "rejected", "date": "2025-12-16", "sender": "m.bravo", "notes": "Doesnt fit"}]'::jsonb,
     'Guesstimate interested - needs changes');

    -- Nana - Shopping
    INSERT INTO releases (project_id, track_name, status, labels_contacted, notes) VALUES
    (prophecy_id, 'Nana', 'shopping',
     '[{"label": "Tomorrowland", "status": "sent", "date": "2026-01-02", "sender": "Mike", "email": "manu.vanaalst@tomorrowland.com", "notes": "Demo sent 1/30/2026"}, {"label": "Morten", "status": "rejected", "date": "2026-01-01", "sender": "Mike"}, {"label": "Artbat", "status": "pending", "sender": "Mike"}, {"label": "Now (then)", "status": "sent", "sender": "Mike"}, {"label": "Kevin de vries", "status": "rejected", "date": "2026-01-01", "sender": "Mike"}]'::jsonb,
     'Sent to Tomorrowland');

    -- ALIVE (EA Sports pitch)
    INSERT INTO releases (project_id, track_name, status, labels_contacted, notes) VALUES
    (prophecy_id, 'ALIVE (Sync)', 'shopping',
     '[{"label": "EA Sports", "status": "pending", "date": "2026-02-05", "sender": "m.bravo", "notes": "Esperando a que el equipo musical escuche el track - Para conseguir licencia"}]'::jsonb,
     'Sync licensing - EA Sports');
  END IF;

  -- ROGER SANCHEZ RELEASES
  IF roger_id IS NOT NULL THEN
    INSERT INTO releases (project_id, track_name, status, release_date, labels_contacted, notes) VALUES
    (roger_id, 'Come my way', 'accepted', '2026-02-06',
     '[{"label": "Stealth", "status": "accepted", "date": "2026-02-06"}]'::jsonb,
     'Single - Confirmed for Feb 6'),
    (roger_id, 'Temptation', 'accepted', '2026-04-10',
     '[{"label": "Stealth", "status": "accepted"}]'::jsonb,
     'Collab with Low Steppa ft. Ragdoll'),
    (roger_id, 'How do we say Goodbye', 'accepted', '2026-06-05',
     '[{"label": "Stealth", "status": "accepted"}]'::jsonb,
     'Collab with Karen Harding'),
    (roger_id, 'Album Release', 'accepted', '2026-06-05',
     '[{"label": "Stealth", "status": "accepted"}]'::jsonb,
     'Full album release');
  END IF;

  -- BABEL RELEASES
  IF babel_id IS NOT NULL THEN
    INSERT INTO releases (project_id, track_name, status, release_date, labels_contacted, notes) VALUES
    (babel_id, 'La joya', 'accepted', '2026-02-13',
     '[{"label": "Satellite Records", "status": "accepted"}]'::jsonb,
     'Collab with Alex Galvan'),
    (babel_id, 'La pieza', 'accepted', '2026-02-13',
     '[{"label": "Satellite Records", "status": "accepted"}]'::jsonb,
     'Collab with Alex Galvan'),
    (babel_id, 'Tundra', 'accepted', NULL,
     '[{"label": "Future Cuts (Uprise Records)", "status": "accepted", "sender": "m.bravo"}]'::jsonb,
     'Single - Date TBC'),
    (babel_id, 'Atraviesa remix', 'draft', NULL,
     '[{"label": "Wayu Records", "status": "pending"}]'::jsonb,
     'Collab with Alex Galvan, Moncaya - Date TBC'),
    (babel_id, 'Andando', 'draft', NULL,
     '[]'::jsonb,
     'Collab with Laureando and Sam - Label TBC');
  END IF;
END $$;

-- ============================================
-- 4. CREATE AIRE PROJECT (new artist mentioned in pitchings)
-- ============================================
INSERT INTO projects (name, type, business_unit_id)
SELECT 'AIRE', 'artist', (SELECT id FROM business_units WHERE slug = 'talents')
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'AIRE');

-- Insert AIRE releases
DO $$
DECLARE
  aire_id UUID;
BEGIN
  SELECT id INTO aire_id FROM projects WHERE name = 'AIRE' LIMIT 1;

  IF aire_id IS NOT NULL THEN
    INSERT INTO releases (project_id, track_name, status, labels_contacted, notes) VALUES
    (aire_id, 'Lista completa', 'shopping',
     '[{"label": "On The Way Records", "status": "rejected", "date": "2026-02-02", "sender": "m.bravo", "email": "Yam Schvartz", "notes": "Doesnt fit"}]'::jsonb,
     'Rejected by On The Way Records'),
    (aire_id, 'Dreams', 'accepted', NULL,
     '[{"label": "Uprise Records (Lush Records)", "status": "accepted", "sender": "m.bravo"}]'::jsonb,
     'Accepted by Uprise Records');
  END IF;
END $$;

-- ============================================
-- 5. VERIFY DATA
-- ============================================
SELECT
  p.name as artist,
  r.track_name,
  r.status,
  r.release_date,
  jsonb_array_length(r.labels_contacted) as labels_count
FROM releases r
JOIN projects p ON r.project_id = p.id
ORDER BY p.name, r.status, r.release_date;
