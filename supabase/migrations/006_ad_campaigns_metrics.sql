-- =============================================
-- Migration 006: Ad Campaigns & Daily Metrics
-- Unified table for Meta Ads + Google Ads data
-- =============================================

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  platform_campaign_id TEXT NOT NULL,
  business_unit_id UUID REFERENCES business_units(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  product TEXT,
  campaign_type TEXT,
  daily_budget DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  geo_targeting TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, platform_campaign_id)
);

CREATE TABLE IF NOT EXISTS ad_daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  spend DECIMAL(10,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cpa DECIMAL(10,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  roas DECIMAL(6,2) DEFAULT 0,
  landing_views INTEGER DEFAULT 0,
  add_to_cart INTEGER DEFAULT 0,
  checkouts INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  search_impression_share DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_platform ON ad_campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_daily_metrics_date ON ad_daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_ad_daily_metrics_campaign_date ON ad_daily_metrics(campaign_id, date);
