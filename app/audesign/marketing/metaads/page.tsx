"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertTriangle } from "lucide-react"
import {
  PeriodSelector,
  periodToDates,
  type Period,
} from "@/components/ads/period-selector"
import { AdKPICards } from "@/components/ads/ad-kpi-cards"
import { ROASTrendChart } from "@/components/ads/roas-trend-chart"
import { ConversionFunnel } from "@/components/ads/conversion-funnel"
import { CampaignsTable, type CampaignRow } from "@/components/ads/campaigns-table"
import {
  getAdPlatformSummary,
  getAdROASTrend,
  getAdFunnelData,
  getCampaignPerformance,
  getAdRecentSummary,
} from "@/src/actions/ad-campaigns"

type PlatformSummary = {
  totalSpend: number
  totalRevenue: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  totalPurchases: number
  avgCtr: number
  avgCpc: number
  avgCpa: number
  globalRoas: number
  totalLandingViews: number
  totalAddToCart: number
  totalCheckouts: number
  days: number
}

type TrendPoint = {
  period: string
  spend: number
  revenue: number
  roas: number
}

type FunnelData = {
  impressions: number
  clicks: number
  landingViews: number
  addToCart: number
  checkouts: number
  purchases: number
}

export default function MetaAdsPage() {
  const [period, setPeriod] = useState<Period>("90d")
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<PlatformSummary | null>(null)
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [funnel, setFunnel] = useState<FunnelData>({
    impressions: 0,
    clicks: 0,
    landingViews: 0,
    addToCart: 0,
    checkouts: 0,
    purchases: 0,
  })
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [recent7d, setRecent7d] = useState<PlatformSummary | null>(null)
  const [recentToday, setRecentToday] = useState<PlatformSummary | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const { from, to } = periodToDates(period)
        const [
          summaryData,
          trendData,
          funnelData,
          campaignData,
          recent7dData,
          todayData,
        ] = await Promise.all([
          getAdPlatformSummary("meta", from, to),
          getAdROASTrend("meta", from, to),
          getAdFunnelData("meta", from, to),
          getCampaignPerformance("meta", from, to),
          getAdRecentSummary("meta", 7),
          getAdRecentSummary("meta", 1),
        ])

        setSummary(summaryData)
        setTrend(trendData)
        setFunnel(
          funnelData || {
            impressions: 0,
            clicks: 0,
            landingViews: 0,
            addToCart: 0,
            checkouts: 0,
            purchases: 0,
          }
        )
        setCampaigns(
          (campaignData || []).map((c) => ({
            id: c.id,
            name: c.name,
            status: c.status,
            product: c.product,
            daily_budget: c.daily_budget,
            currency: c.currency,
            spend7d: c.spend7d,
            ctr7d: c.ctr7d,
            roas7d: c.roas7d,
          }))
        )
        setRecent7d(recent7dData)
        setRecentToday(todayData)
      } catch (error) {
        console.error("Error loading Meta Ads data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [period])

  const { from, to } = periodToDates(period)
  const roas7d = recent7d?.globalRoas ?? 0

  if (loading) {
    return (
      <AppLayout title="Meta Ads Intelligence">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Meta Ads Intelligence">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Meta Ads Intelligence</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {from} → {to}
            </p>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Alert banner: ROAS 7d < 1.0 */}
        {roas7d > 0 && roas7d < 1.0 && (
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    ROAS 7 dias por debajo de breakeven
                  </p>
                  <p className="text-xs text-red-400/70 mt-0.5">
                    ROAS actual: {roas7d.toFixed(2)}x — Estas perdiendo{" "}
                    ${recent7d
                      ? Math.abs(
                          recent7d.totalRevenue - recent7d.totalSpend
                        ).toFixed(2)
                      : "0.00"}{" "}
                    en los ultimos 7 dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        {summary && (
          <AdKPICards
            spend={summary.totalSpend}
            revenue={summary.totalRevenue}
            roas={summary.globalRoas}
            cpp={
              summary.totalPurchases > 0
                ? summary.totalSpend / summary.totalPurchases
                : 0
            }
            avgSpendPerDay={
              summary.days > 0 ? summary.totalSpend / summary.days : 0
            }
            purchases={summary.totalPurchases}
            aov={
              summary.totalPurchases > 0
                ? summary.totalRevenue / summary.totalPurchases
                : 0
            }
            impressions={summary.totalImpressions}
            ctr={summary.avgCtr}
            days={summary.days}
          />
        )}

        {/* ROAS Trend */}
        <ROASTrendChart
          trendData={trend}
          periodRoas={summary?.globalRoas ?? 0}
          period7dRoas={recent7d?.globalRoas ?? 0}
          todayRoas={recentToday?.globalRoas ?? 0}
          periodMargin={
            summary ? summary.totalRevenue - summary.totalSpend : 0
          }
          margin7d={
            recent7d ? recent7d.totalRevenue - recent7d.totalSpend : 0
          }
          marginToday={
            recentToday
              ? recentToday.totalRevenue - recentToday.totalSpend
              : 0
          }
        />

        {/* Conversion Funnel */}
        <ConversionFunnel
          impressions={funnel.impressions}
          clicks={funnel.clicks}
          landingViews={funnel.landingViews}
          addToCart={funnel.addToCart}
          checkouts={funnel.checkouts}
          purchases={funnel.purchases}
        />

        {/* Campaigns Table */}
        <CampaignsTable campaigns={campaigns} />
      </div>
    </AppLayout>
  )
}
