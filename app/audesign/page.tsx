"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { formatCurrency } from "@/lib/utils"
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
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { getAudesignKPIs, getAudesignGrowthMetrics, getAudesignMRRTrend, type AudesignKPI } from "@/src/actions/audesign-kpis"
import { getBusinessUnitMonthlyData } from "@/src/actions/transactions"
import { getBusinessUnitStats } from "@/src/actions/business-units"

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
  const [mrrTrend, setMrrTrend] = useState<{ period: string; mrr: number }[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([])
  const [plStats, setPlStats] = useState<{ income: number; expense: number; balance: number }>({ income: 0, expense: 0, balance: 0 })

  useEffect(() => {
    async function loadData() {
      try {
        const [kpisData, metricsData, trendData, monthlyTransactions, unitStats] = await Promise.all([
          getAudesignKPIs(12),
          getAudesignGrowthMetrics(),
          getAudesignMRRTrend(12),
          getBusinessUnitMonthlyData("audesign"),
          getBusinessUnitStats("audesign"),
        ])
        setKpis(kpisData)
        setMetrics(metricsData)
        setMrrTrend(trendData)
        setMonthlyData(monthlyTransactions)
        if (unitStats) {
          setPlStats({ income: unitStats.income, expense: unitStats.expense, balance: unitStats.balance })
        }
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
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">{formatCurrency(Number(current.mrr))}</p>
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

        {/* Charts Row 1: MRR Trend + Revenue por Canal */}
        <div className="grid md:grid-cols-2 gap-6">
          <LineChart
            title="Tendencia MRR"
            description="Ingresos recurrentes mensuales"
            data={mrrTrend}
            xDataKey="period"
            lines={[
              { dataKey: "mrr", stroke: "#10b981", name: "MRR" },
            ]}
            valueFormatter={(value) => formatCurrency(value)}
            height={280}
            showTimeFilter={false}
            showSettings={false}
          />

          <BarChart
            title="Revenue por Canal"
            description="Stripe vs PayPal por mes"
            data={kpis.slice(0, 6).reverse().map(k => ({
              period: k.period,
              stripe: Number(k.stripe_revenue) || 0,
              paypal: Number(k.paypal_revenue) || 0,
            }))}
            xDataKey="period"
            bars={[
              { dataKey: "stripe", fill: "#8b5cf6", name: "Stripe" },
              { dataKey: "paypal", fill: "#3b82f6", name: "PayPal" },
            ]}
            valueFormatter={(value) => formatCurrency(value)}
            height={280}
          />
        </div>

        {/* Charts Row 2: Key Metrics + User Growth */}
        <div className="grid md:grid-cols-2 gap-6">
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
                  <span className="font-semibold">{formatCurrency(Number(current.arpu))}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>LTV Estimado</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(Number(current.arpu) * 12)}
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

          <LineChart
            title="Crecimiento de Usuarios"
            description="Activos, nuevos y churn por mes"
            data={kpis.slice(0, 6).reverse().map(k => ({
              period: k.period,
              activos: k.active_users,
              nuevos: k.new_users,
              churn: k.churned_users,
            }))}
            xDataKey="period"
            lines={[
              { dataKey: "activos", stroke: "#3b82f6", name: "Activos" },
              { dataKey: "nuevos", stroke: "#10b981", name: "Nuevos" },
              { dataKey: "churn", stroke: "#ef4444", name: "Churn" },
            ]}
            valueFormatter={(value) => value.toLocaleString()}
            height={280}
            showTimeFilter={false}
            showSettings={false}
          />
        </div>

        {/* P&L Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      {formatCurrency(plStats.income)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gastos Totales</p>
                    <p className="text-2xl font-bold text-red-500">
                      {formatCurrency(plStats.expense)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Wallet className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className={`text-2xl font-bold ${plStats.balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {formatCurrency(plStats.balance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <BarChart
            title="Ingresos vs Gastos"
            description="Desglose mensual de transacciones"
            data={monthlyData}
            xDataKey="month"
            bars={[
              { dataKey: "income", fill: "#10b981", name: "Ingresos" },
              { dataKey: "expense", fill: "#ef4444", name: "Gastos" },
            ]}
            valueFormatter={(value) => formatCurrency(value)}
            height={300}
          />
        </div>

        {/* Footer link */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/audesign/accounting">
              Ver Contabilidad <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
