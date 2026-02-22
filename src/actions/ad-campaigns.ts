"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import type { AdPlatform, AdCampaign } from "@/src/types/database"

export type { AdCampaign, AdPlatform }

// ---------------------------------------------------------------------------
// 1. getAdCampaigns — List campaigns filtered by platform and/or status
// ---------------------------------------------------------------------------
export async function getAdCampaigns(
  platform?: AdPlatform,
  status?: string
): Promise<AdCampaign[]> {
  let query = supabaseAdmin
    .from("ad_campaigns")
    .select("*")
    .order("updated_at", { ascending: false })

  if (platform) {
    query = query.eq("platform", platform)
  }
  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching ad campaigns:", error)
    return []
  }

  return data || []
}

// ---------------------------------------------------------------------------
// 2. getAdPlatformSummary — Aggregated KPIs for a platform & date range
// ---------------------------------------------------------------------------
export async function getAdPlatformSummary(
  platform: AdPlatform,
  dateFrom: string,
  dateTo: string
) {
  const { data, error } = await supabaseAdmin
    .from("ad_daily_metrics")
    .select(
      "spend, impressions, clicks, conversions, purchases, revenue, ctr, cpc, cpa, landing_views, add_to_cart, checkouts, campaign_id, date"
    )
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .in(
      "campaign_id",
      (
        await supabaseAdmin
          .from("ad_campaigns")
          .select("id")
          .eq("platform", platform)
      ).data?.map((c) => c.id) || []
    )

  if (error) {
    console.error("Error fetching ad platform summary:", error)
    return null
  }

  const rows = data || []

  const totalSpend = rows.reduce((s, r) => s + Number(r.spend), 0)
  const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0)
  const totalImpressions = rows.reduce((s, r) => s + Number(r.impressions), 0)
  const totalClicks = rows.reduce((s, r) => s + Number(r.clicks), 0)
  const totalConversions = rows.reduce((s, r) => s + Number(r.conversions), 0)
  const totalPurchases = rows.reduce((s, r) => s + Number(r.purchases), 0)
  const totalLandingViews = rows.reduce(
    (s, r) => s + Number(r.landing_views),
    0
  )
  const totalAddToCart = rows.reduce((s, r) => s + Number(r.add_to_cart), 0)
  const totalCheckouts = rows.reduce((s, r) => s + Number(r.checkouts), 0)

  const uniqueDates = new Set(rows.map((r) => r.date))
  const days = uniqueDates.size

  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0
  const globalRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0

  return {
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalImpressions,
    totalClicks,
    totalConversions,
    totalPurchases,
    avgCtr: Math.round(avgCtr * 100) / 100,
    avgCpc: Math.round(avgCpc * 100) / 100,
    avgCpa: Math.round(avgCpa * 100) / 100,
    globalRoas: Math.round(globalRoas * 100) / 100,
    totalLandingViews,
    totalAddToCart,
    totalCheckouts,
    days,
  }
}

// ---------------------------------------------------------------------------
// 3. getAdROASTrend — ROAS trend grouped by ISO week
// ---------------------------------------------------------------------------
export async function getAdROASTrend(
  platform: AdPlatform,
  dateFrom: string,
  dateTo: string
): Promise<{ period: string; spend: number; revenue: number; roas: number }[]> {
  const campaignIds =
    (
      await supabaseAdmin
        .from("ad_campaigns")
        .select("id")
        .eq("platform", platform)
    ).data?.map((c) => c.id) || []

  if (campaignIds.length === 0) return []

  const { data, error } = await supabaseAdmin
    .from("ad_daily_metrics")
    .select("date, spend, revenue")
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .in("campaign_id", campaignIds)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching ad ROAS trend:", error)
    return []
  }

  const rows = data || []

  // Group by ISO week (YYYY-Www)
  const weekMap = new Map<string, { spend: number; revenue: number }>()

  for (const row of rows) {
    const d = new Date(row.date + "T00:00:00Z")
    const isoWeek = getISOWeekString(d)

    const entry = weekMap.get(isoWeek) || { spend: 0, revenue: 0 }
    entry.spend += Number(row.spend)
    entry.revenue += Number(row.revenue)
    weekMap.set(isoWeek, entry)
  }

  return Array.from(weekMap.entries()).map(([period, v]) => ({
    period,
    spend: Math.round(v.spend * 100) / 100,
    revenue: Math.round(v.revenue * 100) / 100,
    roas: v.spend > 0 ? Math.round((v.revenue / v.spend) * 100) / 100 : 0,
  }))
}

// ---------------------------------------------------------------------------
// 4. getAdFunnelData — Funnel metrics for a platform & date range
// ---------------------------------------------------------------------------
export async function getAdFunnelData(
  platform: AdPlatform,
  dateFrom: string,
  dateTo: string
) {
  const campaignIds =
    (
      await supabaseAdmin
        .from("ad_campaigns")
        .select("id")
        .eq("platform", platform)
    ).data?.map((c) => c.id) || []

  if (campaignIds.length === 0) {
    return {
      impressions: 0,
      clicks: 0,
      landingViews: 0,
      addToCart: 0,
      checkouts: 0,
      purchases: 0,
    }
  }

  const { data, error } = await supabaseAdmin
    .from("ad_daily_metrics")
    .select(
      "impressions, clicks, landing_views, add_to_cart, checkouts, purchases"
    )
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .in("campaign_id", campaignIds)

  if (error) {
    console.error("Error fetching ad funnel data:", error)
    return {
      impressions: 0,
      clicks: 0,
      landingViews: 0,
      addToCart: 0,
      checkouts: 0,
      purchases: 0,
    }
  }

  const rows = data || []

  return {
    impressions: rows.reduce((s, r) => s + Number(r.impressions), 0),
    clicks: rows.reduce((s, r) => s + Number(r.clicks), 0),
    landingViews: rows.reduce((s, r) => s + Number(r.landing_views), 0),
    addToCart: rows.reduce((s, r) => s + Number(r.add_to_cart), 0),
    checkouts: rows.reduce((s, r) => s + Number(r.checkouts), 0),
    purchases: rows.reduce((s, r) => s + Number(r.purchases), 0),
  }
}

// ---------------------------------------------------------------------------
// 5. getCampaignPerformance — Per-campaign aggregated metrics for a period
// ---------------------------------------------------------------------------
export async function getCampaignPerformance(
  platform: AdPlatform,
  dateFrom: string,
  dateTo: string
) {
  const { data: campaigns, error: campError } = await supabaseAdmin
    .from("ad_campaigns")
    .select("id, name, status, product, campaign_type, daily_budget, currency")
    .eq("platform", platform)

  if (campError) {
    console.error("Error fetching campaigns for performance:", campError)
    return []
  }

  if (!campaigns || campaigns.length === 0) return []

  const campaignIds = campaigns.map((c) => c.id)

  const { data: metrics, error: metricsError } = await supabaseAdmin
    .from("ad_daily_metrics")
    .select(
      "campaign_id, spend, impressions, clicks, conversions, revenue, ctr"
    )
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .in("campaign_id", campaignIds)

  if (metricsError) {
    console.error("Error fetching campaign performance metrics:", metricsError)
    return []
  }

  const rows = metrics || []

  // Aggregate metrics per campaign
  const aggMap = new Map<
    string,
    {
      spend: number
      impressions: number
      clicks: number
      conversions: number
      revenue: number
    }
  >()

  for (const row of rows) {
    const entry = aggMap.get(row.campaign_id) || {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    }
    entry.spend += Number(row.spend)
    entry.impressions += Number(row.impressions)
    entry.clicks += Number(row.clicks)
    entry.conversions += Number(row.conversions)
    entry.revenue += Number(row.revenue)
    aggMap.set(row.campaign_id, entry)
  }

  const result = campaigns.map((c) => {
    const agg = aggMap.get(c.id) || {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    }
    return {
      ...c,
      spend7d: Math.round(agg.spend * 100) / 100,
      impressions7d: agg.impressions,
      clicks7d: agg.clicks,
      conversions7d: agg.conversions,
      ctr7d:
        agg.impressions > 0
          ? Math.round((agg.clicks / agg.impressions) * 100 * 100) / 100
          : 0,
      roas7d:
        agg.spend > 0
          ? Math.round((agg.revenue / agg.spend) * 100) / 100
          : 0,
    }
  })

  // Sort by spend descending
  result.sort((a, b) => b.spend7d - a.spend7d)

  return result
}

// ---------------------------------------------------------------------------
// 6. getAdRecentSummary — Helper that calls getAdPlatformSummary with N days
// ---------------------------------------------------------------------------
export async function getAdRecentSummary(
  platform: AdPlatform,
  days: number = 7
) {
  const dateTo = new Date().toISOString().slice(0, 10)
  const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  return getAdPlatformSummary(platform, dateFrom, dateTo)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getISOWeekString(date: Date): string {
  // Calculate ISO week number
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`
}
