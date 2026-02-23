"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Building2,
  Receipt,
  ArrowRight,
  TrendingUp,
  Wallet,
  CalendarDays,
  Music,
  Code2,
  Mic2,
  DollarSign,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { getProjects } from "@/src/actions/projects"
import { getAllProjectsPL } from "@/src/actions/transactions"
import { getReleasesStats } from "@/src/actions/releases"
import { getBookingsStats, getUpcomingBookings, type Booking } from "@/src/actions/bookings"
import { getLatestAudesignKPI, type AudesignKPI } from "@/src/actions/audesign-kpis"
import { getRoyaltiesStats } from "@/src/actions/royalties"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 })
  const [upcomingBookings, setUpcomingBookings] = useState<(Booking & { projectName: string })[]>([])
  const [audesignKPI, setAudesignKPI] = useState<AudesignKPI | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ success: boolean; summary: string } | null>(null)
  const [talentsStats, setTalentsStats] = useState({
    artists: 0,
    releases: 0,
    bookings: 0,
    balance: 0,
    pendingRoyalties: 0,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [
          projectsData,
          plData,
          relStats,
          bookStats,
          upcoming,
          kpi,
          royStats,
        ] = await Promise.all([
          getProjects(),
          getAllProjectsPL(),
          getReleasesStats(),
          getBookingsStats(),
          getUpcomingBookings(5),
          getLatestAudesignKPI(),
          getRoyaltiesStats(),
        ])

        // Filter artists
        const artists = projectsData.filter((p) => p.type === "artist")
        const artistIds = artists.map((a) => a.id)

        // Calculate totals from P&L data
        const calculatedTotals = plData.reduce(
          (acc, p) => ({
            income: acc.income + p.income,
            expense: acc.expense + p.expense,
            balance: acc.balance + p.balance,
          }),
          { income: 0, expense: 0, balance: 0 }
        )
        setTotals(calculatedTotals)

        // Calculate talents stats
        const talentsBalance = plData
          .filter((p) => artistIds.includes(p.id))
          .reduce((sum, p) => sum + p.balance, 0)

        setTalentsStats({
          artists: artists.length,
          releases: relStats.total,
          bookings: bookStats.total,
          balance: talentsBalance,
          pendingRoyalties: royStats.totalPending,
        })

        setUpcomingBookings(upcoming)
        setAudesignKPI(kpi)
      } catch (error) {
        console.error("Error loading dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch("/api/sync-sheets?manual=true")
      const data = await res.json()
      setSyncResult({ success: data.success, summary: data.summary || data.error })
      // Reload dashboard data after sync
      if (data.success) {
        const [relStats, bookStats] = await Promise.all([
          getReleasesStats(),
          getBookingsStats(),
        ])
        setTalentsStats(prev => ({
          ...prev,
          releases: relStats.total,
          bookings: bookStats.total,
        }))
      }
    } catch {
      setSyncResult({ success: false, summary: "Error de conexion" })
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncResult(null), 8000)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  if (loading) {
    return (
      <AppLayout title="A2G Headquarters">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="A2G Headquarters">
      <div className="space-y-8">
        {/* Sync Bar */}
        <div className="flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            {syncResult && (
              <span className={cn(
                "text-sm flex items-center gap-1.5",
                syncResult.success ? "text-emerald-500" : "text-red-500"
              )}>
                {syncResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {syncResult.summary}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Sincronizando..." : "Sync Google Sheets"}
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance Total</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    totals.balance >= 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {formatCurrency(totals.balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {formatCurrency(totals.income)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Receipt className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gastos</p>
                  <p className="text-2xl font-bold text-red-500">
                    {formatCurrency(totals.expense)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Royalties Pendientes</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    talentsStats.pendingRoyalties > 0 ? "text-yellow-500" : "text-emerald-500"
                  )}>
                    ${formatCurrency(talentsStats.pendingRoyalties)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Units */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Business Units</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* A2G Talents */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Mic2 className="h-5 w-5 text-purple-500" />
                    </div>
                    <CardTitle>A2G Talents</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/talents">
                      Ver mas <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Artistas</p>
                    <p className="text-xl font-bold">{talentsStats.artists}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bookings</p>
                    <p className="text-xl font-bold">{talentsStats.bookings}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Releases</p>
                    <p className="text-xl font-bold">{talentsStats.releases}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className={cn(
                      "text-xl font-bold",
                      talentsStats.balance >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      {formatCurrency(talentsStats.balance)}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  {talentsStats.pendingRoyalties > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-yellow-500" />
                        Royalties pendientes
                      </span>
                      <Link href="/talents/royalties" className="font-semibold text-yellow-500 hover:underline">
                        ${formatCurrency(talentsStats.pendingRoyalties)}
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Audesign */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Code2 className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardTitle>Audesign</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/audesign">
                      Ver mas <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {audesignKPI ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">MRR</p>
                        <p className="text-xl font-bold">{formatCurrency(Number(audesignKPI.mrr))}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Usuarios</p>
                        <p className="text-xl font-bold">{audesignKPI.active_users}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Conversion</p>
                        <p className="text-xl font-bold">{audesignKPI.conversion_rate}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">ARPU</p>
                        <p className="text-xl font-bold">{audesignKPI.arpu ? `$${audesignKPI.arpu}` : "—"}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Revenue {audesignKPI.period}</span>
                        <span className="font-semibold text-emerald-500">
                          {formatCurrency((Number(audesignKPI.stripe_revenue) || 0) + (Number(audesignKPI.paypal_revenue) || 0))}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ejecuta la migracion SQL para ver KPIs
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Shows */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-500" />
                  Proximos Shows
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/talents/bookings">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay shows programados
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{booking.projectName}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.venue} - {booking.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {booking.show_date ? new Date(booking.show_date).toLocaleDateString() : "TBD"}
                        </p>
                        {booking.fee && (
                          <p className="text-xs text-emerald-500">
                            {Number(booking.fee).toLocaleString()} {booking.fee_currency}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Releases Pipeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-500" />
                  Releases
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/talents/releases">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{talentsStats.releases}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                  <p className="text-2xl font-bold text-yellow-500">{talentsStats.bookings}</p>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Acceso Rapido</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/accounting">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Receipt className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="font-medium">Contabilidad</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/talents/releases">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Music className="h-5 w-5 text-purple-500" />
                    </div>
                    <span className="font-medium">Releases</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/talents/bookings">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="font-medium">Bookings</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/talents/royalties">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-yellow-500" />
                    </div>
                    <span className="font-medium">Royalties</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
