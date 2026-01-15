-- =============================================
-- A2G INTERNAL HUB - Extended Schema
-- MVP Phase 1: Auth + Roles, Dashboard, Artists, Bookings, Reports
-- =============================================

-- =============================================
-- 1. UPDATE USER ROLES SYSTEM
-- =============================================

-- Update user_profiles to include new role types
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role_type TEXT NOT NULL DEFAULT 'worker'
CHECK (role_type IN ('admin', 'cofounder', 'worker', 'provider'));

-- Add department/vertical assignment
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS vertical TEXT; -- 'a2g_company', 'audesign', 'a2g_talents'

-- Add invitation tracking
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =============================================
-- 2. VERTICALS/BUSINESS UNITS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS verticals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name for UI
  color TEXT, -- Brand color
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed verticals
INSERT INTO verticals (name, slug, description, icon, color, sort_order) VALUES
  ('A2G Company', 'a2g-company', 'Holding - Gestión financiera consolidada', 'building-2', '#6366f1', 1),
  ('AUDESIGN', 'audesign', 'E-commerce de software para productores musicales', 'music', '#8b5cf6', 2),
  ('A2G Talents', 'a2g-talents', 'Artist Management', 'users', '#ec4899', 3)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 3. USER VERTICAL PERMISSIONS (Enhanced)
-- =============================================

CREATE TABLE IF NOT EXISTS user_vertical_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vertical_id UUID NOT NULL REFERENCES verticals(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vertical_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vertical_permissions_user ON user_vertical_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vertical_permissions_vertical ON user_vertical_permissions(vertical_id);

-- =============================================
-- 4. INVITATIONS TABLE (Admin-only invites)
-- =============================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role_type TEXT NOT NULL DEFAULT 'worker' CHECK (role_type IN ('admin', 'cofounder', 'worker', 'provider')),
  vertical_ids UUID[] DEFAULT '{}',
  department TEXT,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);

-- =============================================
-- 5. A2G TALENTS - ARTISTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Basic Info
  name TEXT NOT NULL,
  stage_name TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  bio TEXT,

  -- Contract Details
  contract_start_date DATE,
  contract_end_date DATE,
  contract_type TEXT, -- 'exclusive', 'non-exclusive', 'per-project'
  contract_document_url TEXT,
  commission_percentage DECIMAL(5,2) DEFAULT 0, -- % that A2G takes

  -- Contact Info
  manager_name TEXT,
  manager_email TEXT,
  manager_phone TEXT,
  agent_name TEXT,
  agent_email TEXT,
  agent_phone TEXT,

  -- Social & Profiles
  spotify_url TEXT,
  instagram_url TEXT,
  soundcloud_url TEXT,
  youtube_url TEXT,
  website_url TEXT,

  -- Rider & Tech Info
  rider_document_url TEXT,
  tech_requirements JSONB DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'archived')),

  -- Metadata
  genres TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
CREATE INDEX IF NOT EXISTS idx_artists_status ON artists(status);
CREATE INDEX IF NOT EXISTS idx_artists_genres ON artists USING GIN(genres);

-- =============================================
-- 6. A2G TALENTS - ENHANCED BOOKINGS
-- =============================================

-- Drop and recreate bookings with better structure for A2G Talents
CREATE TABLE IF NOT EXISTS artist_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,

  -- Event Details
  event_name TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('festival', 'club', 'private', 'corporate', 'other')),
  event_date DATE NOT NULL,
  event_time TIME,
  event_end_date DATE,
  set_duration_minutes INTEGER,

  -- Venue Details
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_country TEXT,
  venue_capacity INTEGER,

  -- Financial Details
  fee_amount DECIMAL(15,2),
  fee_currency TEXT DEFAULT 'EUR',
  deposit_amount DECIMAL(15,2),
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_date DATE,
  final_payment_amount DECIMAL(15,2),
  final_payment_paid BOOLEAN DEFAULT false,
  final_payment_date DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'overdue')),

  -- Commission
  commission_percentage DECIMAL(5,2), -- Can override artist default
  commission_amount DECIMAL(15,2),

  -- Travel & Expenses
  travel_included BOOLEAN DEFAULT false,
  accommodation_included BOOLEAN DEFAULT false,
  estimated_expenses DECIMAL(15,2),
  actual_expenses DECIMAL(15,2),

  -- Promoter/Contact
  promoter_name TEXT,
  promoter_email TEXT,
  promoter_phone TEXT,
  promoter_company TEXT,

  -- Documents
  contract_url TEXT,
  invoice_url TEXT,

  -- Status
  booking_status TEXT NOT NULL DEFAULT 'inquiry' CHECK (booking_status IN ('inquiry', 'negotiation', 'confirmed', 'contract_sent', 'contract_signed', 'completed', 'cancelled')),
  cancellation_reason TEXT,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_artist_bookings_artist ON artist_bookings(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_date ON artist_bookings(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_status ON artist_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_artist_bookings_payment ON artist_bookings(payment_status);

-- =============================================
-- 7. A2G TALENTS - MUSIC RELEASES
-- =============================================

CREATE TABLE IF NOT EXISTS music_releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,

  -- Release Info
  title TEXT NOT NULL,
  release_type TEXT NOT NULL CHECK (release_type IN ('single', 'ep', 'album', 'remix', 'compilation')),
  release_date DATE,

  -- Label Info
  label_name TEXT,
  catalog_number TEXT,

  -- Platforms & Links
  spotify_url TEXT,
  apple_music_url TEXT,
  beatport_url TEXT,
  soundcloud_url TEXT,
  youtube_url TEXT,

  -- Cover Art
  cover_art_url TEXT,

  -- Status
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'announced', 'released', 'cancelled')),

  -- Metadata
  isrc TEXT,
  upc TEXT,
  genres TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_music_releases_artist ON music_releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_music_releases_date ON music_releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_music_releases_status ON music_releases(status);

-- =============================================
-- 8. A2G COMPANY - PERSONAL INVESTMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS personal_investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Investment Type
  investment_type TEXT NOT NULL CHECK (investment_type IN ('stocks', 'crypto', 'etf', 'bonds', 'real_estate', 'other')),

  -- Asset Details
  asset_name TEXT NOT NULL,
  asset_symbol TEXT, -- e.g., AAPL, BTC

  -- Position
  quantity DECIMAL(20,8),
  purchase_price DECIMAL(15,2),
  purchase_date DATE,
  current_value DECIMAL(15,2),
  currency TEXT DEFAULT 'EUR',

  -- Monthly Entry (for manual tracking)
  month_year TEXT, -- Format: '2024-01'
  month_value DECIMAL(15,2),
  month_change_percent DECIMAL(8,2),

  -- Platform
  platform TEXT, -- 'interactive_brokers', 'binance', 'degiro', etc.
  account_reference TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'transferred')),
  sold_date DATE,
  sold_price DECIMAL(15,2),

  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_investments_type ON personal_investments(investment_type);
CREATE INDEX IF NOT EXISTS idx_investments_month ON personal_investments(month_year);
CREATE INDEX IF NOT EXISTS idx_investments_asset ON personal_investments(asset_symbol);

-- =============================================
-- 9. A2G COMPANY - MEETING NOTES
-- =============================================

CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Meeting Info
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  meeting_type TEXT CHECK (meeting_type IN ('team', 'board', 'client', 'partner', 'one_on_one', 'other')),
  location TEXT, -- 'virtual', 'office', or address

  -- Vertical Association
  vertical_id UUID REFERENCES verticals(id),

  -- Participants
  attendees TEXT[], -- List of names/emails
  organized_by UUID REFERENCES auth.users(id),

  -- Content
  agenda TEXT,
  notes TEXT,
  summary TEXT, -- AI-generated or manual summary

  -- Agreements & Action Items
  agreements JSONB DEFAULT '[]', -- Array of {text, assigned_to, due_date}
  action_items JSONB DEFAULT '[]', -- Array of {task, assigned_to, due_date, completed}

  -- Attachments
  attachments JSONB DEFAULT '[]', -- Array of {name, url}

  -- Follow-up
  follow_up_date DATE,
  follow_up_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_vertical ON meetings(vertical_id);
CREATE INDEX IF NOT EXISTS idx_meetings_type ON meetings(meeting_type);

-- =============================================
-- 10. AUDESIGN - PRODUCTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Product Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  product_type TEXT CHECK (product_type IN ('plugin', 'sample_pack', 'preset_pack', 'course', 'bundle', 'subscription', 'other')),

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  compare_at_price DECIMAL(10,2), -- Original/strikethrough price

  -- Platform
  platform TEXT, -- 'gumroad', 'shopify', 'lemonsqueezy', etc.
  external_product_id TEXT,
  product_url TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),

  -- Images
  cover_image_url TEXT,
  images JSONB DEFAULT '[]',

  -- Categories & Tags
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- =============================================
-- 11. AUDESIGN - SALES/ORDERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS product_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Order Info
  order_id TEXT, -- External order ID
  order_date TIMESTAMPTZ NOT NULL,

  -- Customer (anonymized)
  customer_email_hash TEXT, -- Hashed for privacy
  customer_country TEXT,

  -- Financial
  sale_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  platform_fees DECIMAL(10,2) DEFAULT 0,
  net_revenue DECIMAL(10,2),

  -- Refund
  refunded BOOLEAN DEFAULT false,
  refund_date TIMESTAMPTZ,
  refund_reason TEXT,

  -- Attribution
  source TEXT, -- 'organic', 'facebook_ads', 'google_ads', etc.
  campaign_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_sales_product ON product_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_date ON product_sales(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_product_sales_source ON product_sales(source);

-- =============================================
-- 12. AUDESIGN - MONTHLY METRICS
-- =============================================

CREATE TABLE IF NOT EXISTS audesign_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month_year TEXT NOT NULL UNIQUE, -- Format: '2024-01'

  -- Revenue Metrics
  total_revenue DECIMAL(15,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  aov DECIMAL(10,2) DEFAULT 0, -- Average Order Value

  -- Refunds
  refund_count INTEGER DEFAULT 0,
  refund_amount DECIMAL(15,2) DEFAULT 0,
  refund_rate DECIMAL(5,2) DEFAULT 0, -- Percentage

  -- Subscription Metrics (if applicable)
  mrr DECIMAL(15,2) DEFAULT 0, -- Monthly Recurring Revenue
  new_subscribers INTEGER DEFAULT 0,
  churned_subscribers INTEGER DEFAULT 0,
  churn_rate DECIMAL(5,2) DEFAULT 0,
  ltv DECIMAL(15,2) DEFAULT 0, -- Lifetime Value

  -- Marketing Metrics
  ad_spend DECIMAL(15,2) DEFAULT 0,
  roas DECIMAL(8,2) DEFAULT 0, -- Return on Ad Spend
  cac DECIMAL(10,2) DEFAULT 0, -- Customer Acquisition Cost

  -- Traffic Metrics
  website_visits INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,

  -- Breakdown by Product (JSON)
  revenue_by_product JSONB DEFAULT '{}',
  sales_by_product JSONB DEFAULT '{}',

  -- Breakdown by Channel
  revenue_by_channel JSONB DEFAULT '{}',

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audesign_metrics_month ON audesign_metrics(month_year DESC);

-- =============================================
-- 13. MONTHLY REPORTS SYSTEM
-- =============================================

-- Department definitions
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  vertical_id UUID REFERENCES verticals(id),
  report_fields JSONB NOT NULL DEFAULT '[]', -- Array of field definitions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed departments with their report fields
INSERT INTO departments (name, slug, report_fields) VALUES
  ('Paid Media', 'paid-media', '[
    {"name": "spend_total", "label": "Gasto Total", "type": "currency", "required": true},
    {"name": "roas", "label": "ROAS", "type": "number", "required": true},
    {"name": "cpc", "label": "CPC Promedio", "type": "currency", "required": true},
    {"name": "active_campaigns", "label": "Campanas Activas", "type": "number", "required": true},
    {"name": "impressions", "label": "Impresiones", "type": "number", "required": false},
    {"name": "clicks", "label": "Clicks", "type": "number", "required": false},
    {"name": "conversions", "label": "Conversiones", "type": "number", "required": false},
    {"name": "highlights", "label": "Highlights del mes", "type": "textarea", "required": true},
    {"name": "blockers", "label": "Blockers/Problemas", "type": "textarea", "required": false}
  ]'::jsonb),
  ('Diseno Grafico', 'diseno-grafico', '[
    {"name": "pieces_delivered", "label": "Piezas Entregadas", "type": "number", "required": true},
    {"name": "projects_in_progress", "label": "Proyectos en Curso", "type": "number", "required": true},
    {"name": "projects_completed", "label": "Proyectos Completados", "type": "number", "required": true},
    {"name": "revision_rounds_avg", "label": "Rondas de Revision (Promedio)", "type": "number", "required": false},
    {"name": "highlights", "label": "Highlights del mes", "type": "textarea", "required": true},
    {"name": "blockers", "label": "Blockers/Problemas", "type": "textarea", "required": false}
  ]'::jsonb),
  ('Community Management', 'community-management', '[
    {"name": "followers_gained", "label": "Nuevos Seguidores", "type": "number", "required": true},
    {"name": "total_followers", "label": "Seguidores Totales", "type": "number", "required": true},
    {"name": "engagement_rate", "label": "Engagement Rate (%)", "type": "number", "required": true},
    {"name": "posts_published", "label": "Contenido Publicado", "type": "number", "required": true},
    {"name": "stories_published", "label": "Stories Publicadas", "type": "number", "required": false},
    {"name": "reels_published", "label": "Reels Publicados", "type": "number", "required": false},
    {"name": "top_performing_post", "label": "Post con Mejor Performance", "type": "text", "required": false},
    {"name": "highlights", "label": "Highlights del mes", "type": "textarea", "required": true},
    {"name": "blockers", "label": "Blockers/Problemas", "type": "textarea", "required": false}
  ]'::jsonb),
  ('Asistente/Ops', 'asistente-ops', '[
    {"name": "tasks_completed", "label": "Tareas Completadas", "type": "number", "required": true},
    {"name": "tasks_pending", "label": "Tareas Pendientes", "type": "number", "required": true},
    {"name": "incidents", "label": "Incidencias Reportadas", "type": "number", "required": true},
    {"name": "incidents_resolved", "label": "Incidencias Resueltas", "type": "number", "required": true},
    {"name": "hours_logged", "label": "Horas Registradas", "type": "number", "required": false},
    {"name": "highlights", "label": "Highlights del mes", "type": "textarea", "required": true},
    {"name": "blockers", "label": "Blockers/Problemas", "type": "textarea", "required": false}
  ]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Monthly Reports Table
CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Report Metadata
  month_year TEXT NOT NULL, -- Format: '2024-01'
  department_id UUID NOT NULL REFERENCES departments(id),
  vertical_id UUID REFERENCES verticals(id),

  -- Submitter
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Report Data (matches department report_fields)
  report_data JSONB NOT NULL DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(month_year, department_id, vertical_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_reports_month ON monthly_reports(month_year DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_department ON monthly_reports(department_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_submitted_by ON monthly_reports(submitted_by);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_status ON monthly_reports(status);

-- =============================================
-- 14. CSV IMPORT LOG
-- =============================================

CREATE TABLE IF NOT EXISTS csv_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- File Info
  filename TEXT NOT NULL,
  file_size BIGINT,

  -- Import Details
  import_type TEXT NOT NULL, -- 'transactions', 'products', 'sales', etc.
  vertical_id UUID REFERENCES verticals(id),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  rows_total INTEGER DEFAULT 0,
  rows_imported INTEGER DEFAULT 0,
  rows_failed INTEGER DEFAULT 0,

  -- Errors
  errors JSONB DEFAULT '[]',

  -- User
  imported_by UUID NOT NULL REFERENCES auth.users(id),

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csv_imports_status ON csv_imports(status);
CREATE INDEX IF NOT EXISTS idx_csv_imports_user ON csv_imports(imported_by);

-- =============================================
-- 15. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vertical_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE audesign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_imports ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
  SELECT role_type FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role_type = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin or cofounder
CREATE OR REPLACE FUNCTION auth.is_admin_or_cofounder() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role_type IN ('admin', 'cofounder')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check vertical access
CREATE OR REPLACE FUNCTION auth.has_vertical_access(v_id UUID) RETURNS BOOLEAN AS $$
  SELECT
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM user_vertical_permissions
      WHERE user_id = auth.uid() AND vertical_id = v_id AND can_view = true
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- VERTICALS: Everyone can view, only admin can modify
CREATE POLICY "Anyone can view verticals" ON verticals
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage verticals" ON verticals
  FOR ALL USING (auth.is_admin());

-- USER VERTICAL PERMISSIONS
CREATE POLICY "Users can view their own permissions" ON user_vertical_permissions
  FOR SELECT USING (user_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Only admins can manage permissions" ON user_vertical_permissions
  FOR ALL USING (auth.is_admin());

-- INVITATIONS: Only admins can manage
CREATE POLICY "Only admins can view invitations" ON invitations
  FOR SELECT USING (auth.is_admin());

CREATE POLICY "Only admins can create invitations" ON invitations
  FOR INSERT WITH CHECK (auth.is_admin());

-- ARTISTS: Based on A2G Talents vertical access
CREATE POLICY "Users with access can view artists" ON artists
  FOR SELECT USING (
    auth.is_admin_or_cofounder() OR
    EXISTS (
      SELECT 1 FROM user_vertical_permissions uvp
      JOIN verticals v ON uvp.vertical_id = v.id
      WHERE uvp.user_id = auth.uid() AND v.slug = 'a2g-talents' AND uvp.can_view = true
    )
  );

CREATE POLICY "Users with edit access can manage artists" ON artists
  FOR ALL USING (
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM user_vertical_permissions uvp
      JOIN verticals v ON uvp.vertical_id = v.id
      WHERE uvp.user_id = auth.uid() AND v.slug = 'a2g-talents' AND uvp.can_edit = true
    )
  );

-- ARTIST BOOKINGS
CREATE POLICY "Users with access can view bookings" ON artist_bookings
  FOR SELECT USING (
    auth.is_admin_or_cofounder() OR
    EXISTS (
      SELECT 1 FROM user_vertical_permissions uvp
      JOIN verticals v ON uvp.vertical_id = v.id
      WHERE uvp.user_id = auth.uid() AND v.slug = 'a2g-talents' AND uvp.can_view = true
    )
  );

CREATE POLICY "Users with edit access can manage bookings" ON artist_bookings
  FOR ALL USING (
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM user_vertical_permissions uvp
      JOIN verticals v ON uvp.vertical_id = v.id
      WHERE uvp.user_id = auth.uid() AND v.slug = 'a2g-talents' AND uvp.can_edit = true
    )
  );

-- MUSIC RELEASES
CREATE POLICY "Users with access can view releases" ON music_releases
  FOR SELECT USING (
    auth.is_admin_or_cofounder() OR
    EXISTS (
      SELECT 1 FROM user_vertical_permissions uvp
      JOIN verticals v ON uvp.vertical_id = v.id
      WHERE uvp.user_id = auth.uid() AND v.slug = 'a2g-talents' AND uvp.can_view = true
    )
  );

-- PERSONAL INVESTMENTS: Only admin and cofounders
CREATE POLICY "Only admin and cofounders can view investments" ON personal_investments
  FOR SELECT USING (auth.is_admin_or_cofounder());

CREATE POLICY "Only admin can manage investments" ON personal_investments
  FOR ALL USING (auth.is_admin());

-- MEETINGS: Based on vertical access
CREATE POLICY "Users can view meetings in their verticals" ON meetings
  FOR SELECT USING (
    auth.is_admin_or_cofounder() OR
    vertical_id IS NULL OR
    auth.has_vertical_access(vertical_id)
  );

-- PRODUCTS (AUDESIGN)
CREATE POLICY "Users with AUDESIGN access can view products" ON products
  FOR SELECT USING (
    auth.is_admin_or_cofounder() OR
    EXISTS (
      SELECT 1 FROM user_vertical_permissions uvp
      JOIN verticals v ON uvp.vertical_id = v.id
      WHERE uvp.user_id = auth.uid() AND v.slug = 'audesign' AND uvp.can_view = true
    )
  );

-- PRODUCT SALES
CREATE POLICY "Users with AUDESIGN access can view sales" ON product_sales
  FOR SELECT USING (
    auth.is_admin_or_cofounder() OR
    EXISTS (
      SELECT 1 FROM user_vertical_permissions uvp
      JOIN verticals v ON uvp.vertical_id = v.id
      WHERE uvp.user_id = auth.uid() AND v.slug = 'audesign' AND uvp.can_view = true
    )
  );

-- AUDESIGN METRICS
CREATE POLICY "Users with AUDESIGN access can view metrics" ON audesign_metrics
  FOR SELECT USING (
    auth.is_admin_or_cofounder() OR
    EXISTS (
      SELECT 1 FROM user_vertical_permissions uvp
      JOIN verticals v ON uvp.vertical_id = v.id
      WHERE uvp.user_id = auth.uid() AND v.slug = 'audesign' AND uvp.can_view = true
    )
  );

-- DEPARTMENTS
CREATE POLICY "Anyone can view departments" ON departments
  FOR SELECT USING (true);

-- MONTHLY REPORTS
CREATE POLICY "Users can view reports in their vertical/department" ON monthly_reports
  FOR SELECT USING (
    auth.is_admin_or_cofounder() OR
    submitted_by = auth.uid() OR
    (vertical_id IS NOT NULL AND auth.has_vertical_access(vertical_id))
  );

CREATE POLICY "Users can submit reports" ON monthly_reports
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Users can update their draft reports" ON monthly_reports
  FOR UPDATE USING (submitted_by = auth.uid() AND status = 'draft');

-- CSV IMPORTS
CREATE POLICY "Users can view their own imports" ON csv_imports
  FOR SELECT USING (imported_by = auth.uid() OR auth.is_admin());

CREATE POLICY "Users can create imports" ON csv_imports
  FOR INSERT WITH CHECK (imported_by = auth.uid());

-- =============================================
-- 16. TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_verticals_updated_at BEFORE UPDATE ON verticals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vertical_permissions_updated_at BEFORE UPDATE ON user_vertical_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_bookings_updated_at BEFORE UPDATE ON artist_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_releases_updated_at BEFORE UPDATE ON music_releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_investments_updated_at BEFORE UPDATE ON personal_investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audesign_metrics_updated_at BEFORE UPDATE ON audesign_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_reports_updated_at BEFORE UPDATE ON monthly_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 17. VIEWS FOR DASHBOARD
-- =============================================

-- A2G Talents Financial Summary
CREATE OR REPLACE VIEW a2g_talents_summary AS
SELECT
  a.id as artist_id,
  a.name as artist_name,
  a.commission_percentage,
  COUNT(ab.id) as total_bookings,
  COUNT(ab.id) FILTER (WHERE ab.booking_status = 'confirmed') as confirmed_bookings,
  COUNT(ab.id) FILTER (WHERE ab.booking_status = 'completed') as completed_bookings,
  SUM(ab.fee_amount) FILTER (WHERE ab.booking_status IN ('confirmed', 'completed')) as total_fees,
  SUM(ab.commission_amount) FILTER (WHERE ab.booking_status IN ('confirmed', 'completed')) as total_commissions,
  SUM(ab.actual_expenses) FILTER (WHERE ab.booking_status = 'completed') as total_expenses
FROM artists a
LEFT JOIN artist_bookings ab ON a.id = ab.artist_id
GROUP BY a.id, a.name, a.commission_percentage;

-- AUDESIGN Monthly Summary
CREATE OR REPLACE VIEW audesign_monthly_summary AS
SELECT
  TO_CHAR(ps.order_date, 'YYYY-MM') as month_year,
  COUNT(*) as total_orders,
  SUM(ps.sale_price) as gross_revenue,
  SUM(ps.net_revenue) as net_revenue,
  AVG(ps.sale_price) as aov,
  COUNT(*) FILTER (WHERE ps.refunded = true) as refunds,
  SUM(ps.sale_price) FILTER (WHERE ps.refunded = true) as refund_amount
FROM product_sales ps
GROUP BY TO_CHAR(ps.order_date, 'YYYY-MM')
ORDER BY month_year DESC;
