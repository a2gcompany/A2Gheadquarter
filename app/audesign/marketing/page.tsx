"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, TrendingUp, BarChart3, ArrowRight } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  PeriodSelector,
  periodToDates,
  type Period,
} from "@/components/ads/period-selector"
import { CampaignsTable, type CampaignRow } from "@/components/ads/campaigns-table"
import {
  getAdPlatformSummary,
  getCampaignPerformance,
} from "@/src/actions/ad-campaigns"
import { cn } from "@/lib/utils"

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

const PIE_COLORS = ["#3b82f6", "#f59e0b"]

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
}

function formatUSD(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function MarketingOverviewPage() {
  const [period, setPeriod] = useState<Period>("90d")
  const [loading, setLoading] = useState(true)
  const [metaSummary, setMetaSummary] = useState<PlatformSummary | null>(null)
  const [googleSummary, setGoogleSummary] = useState<PlatformSummary | null>(null)
  const [topCampaigns, setTopCampaigns] = useState<CampaignRow[]>([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const { from, to } = periodToDates(period)
        const [metaSum, googleSum, metaCampaigns, googleCampaigns] =
          await Promise.all([
            getAdPlatformSummary("meta", from, to),
            getAdPlatformSummary("google", from, to),
            getCampaignPerformance("meta", from, to),
            getCampaignPerformance("google", from, to),
          ])

        setMetaSummary(metaSum)
        setGoogleSummary(googleSum)

        // Merge campaigns from both platforms, sort by spend, take top 10
        const allCampaigns: CampaignRow[] = [
          ...(metaCampaigns || []),
          ...(googleCampaigns || []),
        ]
          .map((c) => ({
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
          .sort((a, b) => b.spend7d - a.spend7d)
          .slice(0, 10)

        setTopCampaigns(allCampaigns)
      } catch (error) {
        console.error("Error loading marketing overview data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [period])

  const { from, to } = periodToDates(period)

  const metaSpend = metaSummary?.totalSpend ?? 0
  const metaRevenue = metaSummary?.totalRevenue ?? 0
  const metaRoas = metaSummary?.globalRoas ?? 0

  const googleSpend = googleSummary?.totalSpend ?? 0
  const googleRevenue = googleSummary?.totalRevenue ?? 0
  const googleRoas = googleSummary?.globalRoas ?? 0

  const totalSpend = metaSpend + googleSpend
  const totalRevenue = metaRevenue + googleRevenue
  const combinedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0

  const pieData = [
    { name: "Meta Ads", value: metaSpend },
    { name: "Google Ads", value: googleSpend },
  ].filter((d) => d.value > 0)

  if (loading) {
    return (
      <AppLayout title="Marketing Overview">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Marketing Overview">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Marketing Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Vista agregada de todas las plataformas — {from} → {to}
            </p>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Combined KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Spend */}
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-red-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Gasto Total
                  </p>
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {formatUSD(totalSpend)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta {formatUSD(metaSpend)} + Google {formatUSD(googleSpend)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ingresos Totales
                  </p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {formatUSD(totalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margen: {formatUSD(totalRevenue - totalSpend)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combined ROAS */}
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "p-2.5 rounded-lg",
                    combinedRoas >= 1.0 ? "bg-cyan-500/10" : "bg-red-500/10"
                  )}
                >
                  <BarChart3
                    className={cn(
                      "h-5 w-5",
                      combinedRoas >= 1.0 ? "text-cyan-400" : "text-red-400"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ROAS Combinado
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold mt-1",
                      combinedRoas >= 1.0 ? "text-cyan-400" : "text-red-400"
                    )}
                  >
                    {combinedRoas.toFixed(2)}x
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    breakeven = 1.0x
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Meta Card */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Meta Ads
                </CardTitle>
                <Link
                  href="/audesign/marketing/metaads"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Ver detalle <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gasto</span>
                  <span className="text-sm font-medium">{formatUSD(metaSpend)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ingresos</span>
                  <span className="text-sm font-medium text-emerald-400">
                    {formatUSD(metaRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ROAS</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      metaRoas >= 1.0 ? "text-cyan-400" : "text-red-400"
                    )}
                  >
                    {metaRoas.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Campanas activas
                  </span>
                  <span className="text-sm font-medium">
                    {metaSummary ? metaSummary.days > 0 ? "Activo" : "Sin datos" : "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Card */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Google Ads
                </CardTitle>
                <Link
                  href="/audesign/marketing/googleads"
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Ver detalle <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gasto</span>
                  <span className="text-sm font-medium">{formatUSD(googleSpend)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ingresos</span>
                  <span className="text-sm font-medium text-emerald-400">
                    {formatUSD(googleRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ROAS</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      googleRoas >= 1.0 ? "text-cyan-400" : "text-red-400"
                    )}
                  >
                    {googleRoas.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Campanas activas
                  </span>
                  <span className="text-sm font-medium">
                    {googleSummary ? googleSummary.days > 0 ? "Activo" : "Sin datos" : "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spend Distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              Distribucion de Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No hay datos de gasto
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => formatUSD(v)}
                      contentStyle={tooltipStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {pieData.map((item, i) => {
                    const pct =
                      totalSpend > 0
                        ? ((item.value / totalSpend) * 100).toFixed(1)
                        : "0.0"
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-muted-foreground">
                            {formatUSD(item.value)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <div>
          <h3 className="text-base font-semibold mb-3">
            Top 10 Campanas (todas las plataformas)
          </h3>
          <CampaignsTable campaigns={topCampaigns} />
        </div>
      </div>
    </AppLayout>
  )
}
