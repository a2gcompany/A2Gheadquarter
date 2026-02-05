"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  UserMinus,
  DollarSign,
  Percent,
  Loader2,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { getAudesignKPIs, getAudesignGrowthMetrics, type AudesignKPI } from "@/src/actions/audesign-kpis"

export default function AudesignDashboard() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<AudesignKPI[]>([])
  const [metrics, setMetrics] = useState<{
    current: AudesignKPI | null
    previous: AudesignKPI | null
    mrrGrowth: number | null
    userGrowth: number | null
    revenueGrowth: number | null
  }>({
    current: null,
    previous: null,
    mrrGrowth: null,
    userGrowth: null,
    revenueGrowth: null,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [kpisData, metricsData] = await Promise.all([
          getAudesignKPIs(6),
          getAudesignGrowthMetrics(),
        ])
        setKpis(kpisData)
        setMetrics(metricsData)
      } catch (error) {
        console.error("Error loading Audesign data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const current = metrics.current

  const formatGrowth = (value: number | null) => {
    if (value === null) return null
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <AppLayout title="Audesign">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  if (!current) {
    return (
      <AppLayout title="Audesign">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No hay datos de KPIs disponibles</p>
          <p className="text-sm text-muted-foreground">Ejecuta la migracion SQL para cargar datos de ejemplo</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Audesign">
      <div className="space-y-6">
        {/* Main KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">{Number(current.mrr).toLocaleString()}</p>
                  {metrics.mrrGrowth !== null && (
                    <p className={`text-xs ${metrics.mrrGrowth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {formatGrowth(metrics.mrrGrowth)} vs mes anterior
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                  <p className="text-2xl font-bold">{current.active_users}</p>
                  {metrics.userGrowth !== null && (
                    <p className={`text-xs ${metrics.userGrowth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {formatGrowth(metrics.userGrowth)} vs mes anterior
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <UserPlus className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nuevos</p>
                  <p className="text-2xl font-bold text-green-500">+{current.new_users}</p>
                  <p className="text-xs text-muted-foreground">Este mes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <UserMinus className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Churn</p>
                  <p className="text-2xl font-bold text-red-500">-{current.churned_users}</p>
                  <p className="text-xs text-muted-foreground">Este mes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <span>Stripe</span>
                  </div>
                  <span className="font-semibold">
                    {Number(current.stripe_revenue).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span>PayPal</span>
                  </div>
                  <span className="font-semibold">
                    {Number(current.paypal_revenue).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 font-semibold">
                  <span>Total</span>
                  <span className="text-emerald-500">
                    {(Number(current.stripe_revenue) + Number(current.paypal_revenue)).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metricas Clave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>Conversion Rate</span>
                  </div>
                  <span className="font-semibold">{current.conversion_rate}%</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>ARPU</span>
                  </div>
                  <span className="font-semibold">{Number(current.arpu).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>LTV Estimado</span>
                  </div>
                  <span className="font-semibold">
                    {(Number(current.arpu) * 12).toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <UserMinus className="h-4 w-4 text-muted-foreground" />
                    <span>Churn Rate</span>
                  </div>
                  <span className="font-semibold">
                    {((current.churned_users / (current.active_users + current.churned_users)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MRR Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tendencia MRR (6 meses)</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/audesign/accounting">
                  Ver Contabilidad <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.map((kpi, index) => {
                const prevKpi = kpis[index + 1]
                const growth = prevKpi
                  ? ((Number(kpi.mrr) - Number(prevKpi.mrr)) / Number(prevKpi.mrr)) * 100
                  : null

                return (
                  <div key={kpi.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium w-20">{kpi.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{kpi.active_users} usuarios</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {growth !== null && (
                        <span className={`text-xs ${growth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                        </span>
                      )}
                      <span className="font-semibold">{Number(kpi.mrr).toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
