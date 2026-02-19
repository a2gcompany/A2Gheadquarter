"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionsTable } from "@/components/accounting/transactions-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  DollarSign,
  BarChart3,
  Percent,
  Trophy,
  Download,
  ShoppingCart,
} from "lucide-react"
import { getPaymentSources, type PaymentSource } from "@/src/actions/payment-sources"
import { getBusinessUnitBySlug } from "@/src/actions/business-units"
import {
  getTransactionsByProject,
  type Transaction,
} from "@/src/actions/transactions"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// ─── Constants ───────────────────────────────────────────────
const AUDESIGN_PROJECT_ID = "e232f7c0-3a86-4086-9567-8114d046c3ec"

type SourceFilter = "all" | "stripe" | "shopify" | "paypal"
type PeriodFilter = "all" | "this-month" | "last-month" | "quarter" | "year"

// ─── Helpers ─────────────────────────────────────────────────
function getSource(t: Transaction): string {
  const sf = t.source_file || ""
  if (sf.startsWith("stripe:")) return "stripe"
  if (sf.startsWith("shopify:")) return "shopify"
  if (sf.startsWith("paypal:")) return "paypal"
  return "other"
}

function categorizeExpense(desc: string): string {
  const d = desc.toLowerCase()
  if (d.includes("refund")) return "refund"
  if (d.includes("fee") || d.includes("commission")) return "platform-fee"
  if (d.includes("payout") || d.includes("transfer")) return "payout"
  if (d.includes("dispute") || d.includes("chargeback")) return "chargeback"
  return "other"
}

function getMonthLabel(ym: string): string {
  const [y, m] = ym.split("-")
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return `${months[parseInt(m) - 1]} ${y.slice(2)}`
}

function getPeriodRange(period: PeriodFilter): { from: string; to: string } | null {
  if (period === "all") return null
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  switch (period) {
    case "this-month": {
      const from = `${y}-${String(m + 1).padStart(2, "0")}-01`
      return { from, to: "9999-12-31" }
    }
    case "last-month": {
      const lm = m === 0 ? 11 : m - 1
      const ly = m === 0 ? y - 1 : y
      const from = `${ly}-${String(lm + 1).padStart(2, "0")}-01`
      const to = `${y}-${String(m + 1).padStart(2, "0")}-01`
      return { from, to }
    }
    case "quarter": {
      const d = new Date(y, m - 2, 1)
      const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
      return { from, to: "9999-12-31" }
    }
    case "year": {
      return { from: `${y}-01-01`, to: "9999-12-31" }
    }
  }
}

function exportCSV(txs: Transaction[]) {
  const header = "Fecha,Descripcion,Importe,Tipo,Categoria,Fuente\n"
  const rows = txs.map((t) => {
    const source = getSource(t)
    const desc = (t.description || "").replace(/"/g, '""')
    return `${t.date},"${desc}",${t.amount},${t.type},${t.category || ""},${source}`
  }).join("\n")
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `audesign-transactions-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Chart tooltip style ─────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
}

const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#6b7280"]

// ─── Page Component ──────────────────────────────────────────
export default function AudesignAccountingPage() {
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<SourceFilter>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("all")
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const projectTransactions = await getTransactionsByProject(AUDESIGN_PROJECT_ID)
      setAllTransactions(projectTransactions)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── Filtered transactions ─────────────────────────────────
  const filtered = useMemo(() => {
    let txs = allTransactions

    // Source filter
    if (selectedSource !== "all") {
      txs = txs.filter((t) => getSource(t) === selectedSource)
    }

    // Period filter
    const range = getPeriodRange(selectedPeriod)
    if (range) {
      txs = txs.filter((t) => t.date >= range.from && t.date < range.to)
    }

    return txs
  }, [allTransactions, selectedSource, selectedPeriod])

  // ─── Monthly data ──────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const map: Record<string, {
      month: string
      revenue: number
      refunds: number
      fees: number
      payouts: number
      netRevenue: number
      stripe: number
      shopify: number
      paypal: number
    }> = {}

    for (const t of filtered) {
      const ym = t.date.substring(0, 7)
      if (!map[ym]) {
        map[ym] = { month: ym, revenue: 0, refunds: 0, fees: 0, payouts: 0, netRevenue: 0, stripe: 0, shopify: 0, paypal: 0 }
      }
      const amt = Math.abs(parseFloat(t.amount))
      const source = getSource(t)

      if (t.type === "income") {
        map[ym].revenue += amt
        if (source === "stripe") map[ym].stripe += amt
        else if (source === "shopify") map[ym].shopify += amt
        else if (source === "paypal") map[ym].paypal += amt
      } else {
        const cat = categorizeExpense(t.description)
        if (cat === "refund") map[ym].refunds += amt
        else if (cat === "platform-fee") map[ym].fees += amt
        else if (cat === "payout") map[ym].payouts += amt
        else map[ym].fees += amt
      }
    }

    // Calculate net
    for (const m of Object.values(map)) {
      m.netRevenue = m.revenue - m.refunds - m.fees
    }

    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
  }, [filtered])

  // ─── KPIs ──────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const now = new Date()
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const prevMonth = now.getMonth() === 0
      ? `${now.getFullYear() - 1}-12`
      : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`

    const currentData = monthlyData.find((m) => m.month === currentYM)
    const prevData = monthlyData.find((m) => m.month === prevMonth)

    const currentRevenue = currentData?.revenue || 0
    const prevRevenue = prevData?.revenue || 0
    const revenueMoM = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0

    const currentNet = currentData?.netRevenue || 0
    const margin = currentRevenue > 0 ? (currentNet / currentRevenue) * 100 : 0

    const incomeTransactions = filtered.filter((t) => t.type === "income")
    const totalIncome = incomeTransactions.reduce((s, t) => s + Math.abs(parseFloat(t.amount)), 0)
    const avgOrderValue = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0

    const sourceCounts = filtered.reduce((acc, t) => {
      const src = getSource(t)
      acc[src] = (acc[src] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalRefunds = filtered
      .filter((t) => t.type === "expense" && categorizeExpense(t.description) === "refund")
      .reduce((s, t) => s + Math.abs(parseFloat(t.amount)), 0)
    const refundRate = totalIncome > 0 ? (totalRefunds / totalIncome) * 100 : 0

    const bestMonth = monthlyData.reduce(
      (best, m) => (m.revenue > best.revenue ? m : best),
      { month: "-", revenue: 0 } as { month: string; revenue: number }
    )

    return {
      currentRevenue,
      revenueMoM,
      currentNet,
      margin,
      avgOrderValue,
      totalTransactions: filtered.length,
      sourceCounts,
      refundRate,
      bestMonth,
    }
  }, [filtered, monthlyData])

  // ─── Chart data: Revenue vs Expenses ───────────────────────
  const revenueVsExpenses = useMemo(() => {
    return monthlyData.map((m) => ({
      month: getMonthLabel(m.month),
      Ingresos: Math.round(m.revenue),
      Gastos: Math.round(m.refunds + m.fees + m.payouts),
      "Net Profit": Math.round(m.netRevenue),
    }))
  }, [monthlyData])

  // ─── Chart data: Revenue by source ─────────────────────────
  const revenueBySource = useMemo(() => {
    return monthlyData.map((m) => ({
      month: getMonthLabel(m.month),
      Stripe: Math.round(m.stripe),
      Shopify: Math.round(m.shopify),
      PayPal: Math.round(m.paypal),
    }))
  }, [monthlyData])

  // ─── Chart data: Expense breakdown ─────────────────────────
  const expenseBreakdown = useMemo(() => {
    const cats: Record<string, number> = {}
    for (const t of filtered) {
      if (t.type !== "expense") continue
      const cat = categorizeExpense(t.description)
      const label =
        cat === "refund" ? "Refunds"
          : cat === "platform-fee" ? "Fees"
            : cat === "payout" ? "Payouts"
              : cat === "chargeback" ? "Chargebacks"
                : "Otros"
      cats[label] = (cats[label] || 0) + Math.abs(parseFloat(t.amount))
    }
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  // ─── P&L table with MoM% ──────────────────────────────────
  const plTable = useMemo(() => {
    return monthlyData.map((m, i) => {
      const prev = i > 0 ? monthlyData[i - 1] : null
      const mom = prev && prev.revenue > 0
        ? ((m.revenue - prev.revenue) / prev.revenue) * 100
        : null
      return { ...m, mom }
    })
  }, [monthlyData])

  const plTotals = useMemo(() => {
    return plTable.reduce(
      (acc, m) => ({
        revenue: acc.revenue + m.revenue,
        refunds: acc.refunds + m.refunds,
        fees: acc.fees + m.fees,
        netRevenue: acc.netRevenue + m.netRevenue,
      }),
      { revenue: 0, refunds: 0, fees: 0, netRevenue: 0 }
    )
  }, [plTable])

  // ─── Render ────────────────────────────────────────────────
  const fmtEUR = (v: number) => formatCurrency(v)
  const fmtShort = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)

  if (loading) {
    return (
      <AppLayout title="Contabilidad - Audesign">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Contabilidad - Audesign">
      <div className="space-y-6">
        {/* ─── Header + Filters ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Audesign — Stripe + Shopify
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo</SelectItem>
                <SelectItem value="this-month">Este mes</SelectItem>
                <SelectItem value="last-month">Mes pasado</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSource} onValueChange={(v) => setSelectedSource(v as SourceFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)} className="gap-1.5">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>

        {/* ─── KPI Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Revenue (mes)</p>
                  <p className="text-lg font-bold text-emerald-500">{fmtEUR(kpis.currentRevenue)}</p>
                  {kpis.revenueMoM !== 0 && (
                    <p className={`text-xs ${kpis.revenueMoM >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {kpis.revenueMoM >= 0 ? "+" : ""}{kpis.revenueMoM.toFixed(1)}% MoM
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Net Profit (mes)</p>
                  <p className={`text-lg font-bold ${kpis.currentNet >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {fmtEUR(kpis.currentNet)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Margen: {kpis.margin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Avg Order</p>
                  <p className="text-lg font-bold">{fmtEUR(kpis.avgOrderValue)}</p>
                  <p className="text-xs text-muted-foreground">por venta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Transacciones</p>
                  <p className="text-lg font-bold">{kpis.totalTransactions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {Object.entries(kpis.sourceCounts).map(([k, v]) =>
                      `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`
                    ).join(" / ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <Percent className="h-5 w-5 text-rose-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Refund Rate</p>
                  <p className="text-lg font-bold">{kpis.refundRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">sobre revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Best Month</p>
                  <p className="text-lg font-bold">{fmtEUR(kpis.bestMonth.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {kpis.bestMonth.month !== "-" ? getMonthLabel(kpis.bestMonth.month) : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Chart: Revenue vs Expenses ───────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue vs Gastos</CardTitle>
            <CardDescription>Evolucion mensual con linea de beneficio neto</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueVsExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No hay datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={revenueVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
                  <Tooltip formatter={(v: number) => fmtEUR(v)} contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="Net Profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* ─── Charts Row: Source + Pie ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Source */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue por Fuente</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueBySource.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No hay datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueBySource}>
                    <defs>
                      <linearGradient id="gStripe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gShopify" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPaypal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
                    <Tooltip formatter={(v: number) => fmtEUR(v)} contentStyle={tooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="Stripe" stroke="#3b82f6" fill="url(#gStripe)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Shopify" stroke="#10b981" fill="url(#gShopify)" strokeWidth={2} />
                    <Area type="monotone" dataKey="PayPal" stroke="#f59e0b" fill="url(#gPaypal)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Expense Breakdown Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribucion de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseBreakdown.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No hay gastos</p>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="60%" height={280}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                      >
                        {expenseBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmtEUR(v)} contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {expenseBreakdown.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{fmtEUR(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Monthly P&L Table ────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">P&L Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mes</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Refunds</TableHead>
                      <TableHead className="text-right">Fees</TableHead>
                      <TableHead className="text-right">Net Revenue</TableHead>
                      <TableHead className="text-right">MoM %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plTable.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{getMonthLabel(row.month)}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-500">
                          {fmtEUR(row.revenue)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-rose-500">
                          {row.refunds > 0 ? `-${fmtEUR(row.refunds)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {row.fees > 0 ? `-${fmtEUR(row.fees)}` : "-"}
                        </TableCell>
                        <TableCell className={`text-right font-mono font-semibold ${row.netRevenue >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          {fmtEUR(row.netRevenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.mom !== null ? (
                            <Badge variant={row.mom >= 0 ? "default" : "destructive"} className="text-xs">
                              {row.mom >= 0 ? "+" : ""}{row.mom.toFixed(1)}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals row */}
                    <TableRow className="bg-muted/30 font-bold">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-right font-mono text-emerald-500">
                        {fmtEUR(plTotals.revenue)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-rose-500">
                        {plTotals.refunds > 0 ? `-${fmtEUR(plTotals.refunds)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {plTotals.fees > 0 ? `-${fmtEUR(plTotals.fees)}` : "-"}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${plTotals.netRevenue >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {fmtEUR(plTotals.netRevenue)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Transactions Table ───────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Transacciones ({filtered.length})
              {selectedSource !== "all" && (
                <span className="font-normal text-muted-foreground ml-2">
                  — {selectedSource.charAt(0).toUpperCase() + selectedSource.slice(1)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay transacciones para este filtro.
              </p>
            ) : (
              <TransactionsTable transactions={filtered} onRefresh={loadData} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
