-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Companies/Entities Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'holding', 'agency', 'talent', 'studio', etc.
  logo_url TEXT,
  primary_color TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_type ON companies(type);

-- Users Table (extends Supabase Auth)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'user', 'viewer'
  default_company_id UUID REFERENCES companies(id),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- User Company Permissions
CREATE TABLE user_company_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'read', -- 'admin', 'write', 'read'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

CREATE INDEX idx_user_company_permissions_user ON user_company_permissions(user_id);
CREATE INDEX idx_user_company_permissions_company ON user_company_permissions(company_id);

-- Bank Accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Wio Business', 'Wise EUR', 'Amex', etc.
  account_type TEXT NOT NULL, -- 'checking', 'savings', 'credit', 'investment'
  provider TEXT NOT NULL, -- 'wio', 'wise', 'amex', etc.
  currency TEXT NOT NULL DEFAULT 'USD',
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  account_number_encrypted TEXT, -- encrypted account number
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_company ON accounts(company_id);
CREATE INDEX idx_accounts_currency ON accounts(currency);
CREATE INDEX idx_accounts_active ON accounts(is_active) WHERE is_active = true;

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  transaction_date TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT, -- 'travel', 'marketing', 'salary', etc.
  subcategory TEXT,
  type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
  merchant_name TEXT,
  location_country TEXT,
  location_city TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  ai_categorized BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3, 2), -- 0.00 to 1.00
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_merchant ON transactions(merchant_name);
CREATE INDEX idx_transactions_country ON transactions(location_country);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES user_profiles(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'excel', 'image', 'csv'
  mime_type TEXT NOT NULL,
  document_type TEXT, -- 'invoice', 'contract', 'financial_statement', 'receipt', etc.
  processing_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processing_error TEXT,
  ai_extracted_data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(processing_status);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created ON documents(created_at DESC);

-- KPIs Extracted (from documents or manual entry)
CREATE TABLE kpis_extracted (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  kpi_type TEXT NOT NULL, -- 'revenue', 'profit', 'cashflow', 'burn_rate', etc.
  kpi_name TEXT NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  period_start DATE,
  period_end DATE,
  period_type TEXT, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  source TEXT NOT NULL, -- 'ai_extraction', 'manual', 'api_integration'
  confidence DECIMAL(3, 2), -- AI confidence score
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpis_company ON kpis_extracted(company_id);
CREATE INDEX idx_kpis_type ON kpis_extracted(kpi_type);
CREATE INDEX idx_kpis_period ON kpis_extracted(period_start, period_end);
CREATE INDEX idx_kpis_document ON kpis_extracted(document_id);

-- Contacts (CRM)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  job_title TEXT,
  contact_type TEXT NOT NULL DEFAULT 'lead', -- 'lead', 'client', 'partner', 'vendor'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'archived'
  lead_stage TEXT, -- 'prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  lead_score INTEGER DEFAULT 0,
  deal_value DECIMAL(15, 2),
  deal_currency TEXT DEFAULT 'USD',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  social_links JSONB DEFAULT '{}',
  last_contact_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_stage ON contacts(lead_stage);
CREATE INDEX idx_contacts_status ON contacts(status);

-- Bookings (for Roger Sanchez - talent management)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_type TEXT, -- 'festival', 'club', 'private', 'corporate'
  venue_name TEXT,
  venue_country TEXT,
  venue_city TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  booking_status TEXT NOT NULL DEFAULT 'pending', -- 'inquiry', 'pending', 'confirmed', 'completed', 'cancelled'
  fee_amount DECIMAL(15, 2),
  fee_currency TEXT DEFAULT 'USD',
  commission_rate DECIMAL(5, 2), -- percentage
  commission_amount DECIMAL(15, 2),
  expenses DECIMAL(15, 2) DEFAULT 0,
  contact_id UUID REFERENCES contacts(id),
  contract_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_company ON bookings(company_id);
CREATE INDEX idx_bookings_artist ON bookings(artist_name);
CREATE INDEX idx_bookings_date ON bookings(event_date DESC);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_venue_country ON bookings(venue_country);

-- Tasks & Projects
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES user_profiles(id),
  assigned_to UUID REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  project_name TEXT,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_project ON tasks(project_name);

-- Marketing Campaigns (for Audesign)
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'facebook', 'google', 'instagram', 'linkedin', etc.
  campaign_type TEXT, -- 'awareness', 'conversion', 'engagement', etc.
  status TEXT NOT NULL DEFAULT 'active', -- 'draft', 'active', 'paused', 'completed'
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(15, 2),
  spend DECIMAL(15, 2) DEFAULT 0,
  revenue DECIMAL(15, 2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  target_audience JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_company ON marketing_campaigns(company_id);
CREATE INDEX idx_campaigns_platform ON marketing_campaigns(platform);
CREATE INDEX idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_campaigns_dates ON marketing_campaigns(start_date, end_date);

-- AI Chat History
CREATE TABLE ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL, -- 'user', 'assistant'
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}', -- relevant data/documents referenced
  tokens_used INTEGER,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_user ON ai_chat_history(user_id);
CREATE INDEX idx_chat_company ON ai_chat_history(company_id);
CREATE INDEX idx_chat_created ON ai_chat_history(created_at DESC);

-- Materialized View: Company Financial Summary
CREATE MATERIALIZED VIEW company_financial_summary AS
SELECT
  c.id as company_id,
  c.name as company_name,
  SUM(CASE WHEN a.is_active THEN a.balance ELSE 0 END) as total_balance,
  COUNT(DISTINCT a.id) FILTER (WHERE a.is_active) as active_accounts,
  SUM(CASE WHEN t.type = 'income' AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
    THEN t.amount ELSE 0 END) as monthly_income,
  SUM(CASE WHEN t.type = 'expense' AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
    THEN t.amount ELSE 0 END) as monthly_expenses,
  CURRENT_TIMESTAMP as last_updated
FROM companies c
LEFT JOIN accounts a ON c.id = a.company_id
LEFT JOIN transactions t ON a.id = t.account_id
GROUP BY c.id, c.name;

CREATE UNIQUE INDEX idx_company_financial_summary_company ON company_financial_summary(company_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_company_financial_summary()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY company_financial_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-refresh materialized view
CREATE TRIGGER refresh_summary_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_company_financial_summary();

CREATE TRIGGER refresh_summary_on_account
AFTER INSERT OR UPDATE OR DELETE ON accounts
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_company_financial_summary();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpis_updated_at BEFORE UPDATE ON kpis_extracted
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_company_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis_extracted ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Companies: Users can see companies they have permission to
CREATE POLICY "Users can view companies they have access to" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid()
    )
  );

-- User Profiles: Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Accounts: Users can view accounts for companies they have access to
CREATE POLICY "Users can view accounts for their companies" ON accounts
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid()
    )
  );

-- Transactions: Users can view transactions for companies they have access to
CREATE POLICY "Users can view transactions for their companies" ON transactions
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid()
    )
  );

-- Documents: Users can view and manage documents for their companies
CREATE POLICY "Users can view documents for their companies" ON documents
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for their companies" ON documents
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid() AND permission_level IN ('write', 'admin')
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view KPIs for their companies" ON kpis_extracted
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view contacts for their companies" ON contacts
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view bookings for their companies" ON bookings
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view tasks for their companies" ON tasks
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view campaigns for their companies" ON marketing_campaigns
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_company_permissions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own chat history" ON ai_chat_history
  FOR SELECT USING (auth.uid() = user_id);

-- Insert seed data for companies
-- NOTE: This migration is legacy. Current system uses business_units table (see migration-v2.sql)
INSERT INTO companies (name, slug, type, description) VALUES
  ('A2G FZCO', 'holding', 'holding', 'A2G FZCO - Holding Principal (Dubai)'),
  ('A2G Talents', 'talents', 'talent', 'Artist Management'),
  ('Audesign', 'audesign', 'agency', 'Software para productores musicales');
