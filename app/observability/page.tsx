"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Activity,
  Server,
  DollarSign,
  Phone,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLatestObservability } from "@/src/actions/observability"
import { cn } from "@/lib/utils"

interface ServiceInfo {
  status: string
  detail: string
}

interface UptimeInfo {
  ok: number
  total: number
  uptime: number
}

interface CronStat {
  runs: number
  successes: number
  failures: number
  empties: number
  totalCost: number
  avgCost: number
  avgSeconds: number
  lastRun: string
  lastStatus: string
  successRate?: number
  history?: Array<{ ts: string; status: string; cost: number; seconds: number }>
}

interface ObservabilityData {
  id: string
  synced_at: string
  services: Record<string, ServiceInfo>
  service_uptime: Record<string, UptimeInfo>
  cron_stats: Record<string, CronStat>
  costs: { today: { total: number; calls: number }; total7d: number }
  stats: { today: { calls: number; errors: number } }
}

export default function ObservabilityPage() {
  const [data, setData] = useState<ObservabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const result = await getLatestObservability()
      setData(result as ObservabilityData | null)
    } catch (error) {
      console.error("Error loading observability:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  if (loading) {
    return (
      <AppLayout title="Observabilidad">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout title="Observabilidad">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Activity className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            No hay datos de observabilidad. Esperando primer sync desde Nucleus.
          </p>
        </div>
      </AppLayout>
    )
  }

  const services = data.services || {}
  const serviceUptime = data.service_uptime || {}
  const cronStats = data.cron_stats || {}
  const costs = data.costs || { today: { total: 0, calls: 0 }, total7d: 0 }
  const stats = data.stats || { today: { calls: 0, errors: 0 } }

  // KPI calculations
  const serviceCount = Object.keys(services).length
  const avgUptime =
    Object.keys(serviceUptime).length > 0
      ? Object.values(serviceUptime).reduce((sum, s) => sum + (s.uptime || 0), 0) /
        Object.keys(serviceUptime).length
      : 0

  // Sort crons by success rate ascending (worst first)
  const sortedCrons = Object.entries(cronStats).sort(([, a], [, b]) => {
    const rateA = a.successRate ?? (a.runs > 0 ? (a.successes / a.runs) * 100 : 100)
    const rateB = b.successRate ?? (b.runs > 0 ? (b.successes / b.runs) * 100 : 100)
    return rateA - rateB
  })

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "ok":
      case "running":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "degraded":
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "down":
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "ok":
      case "running":
      case "success":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "degraded":
      case "warning":
      case "empty":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "down":
      case "error":
      case "fail":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getRateColor = (rate: number) => {
    if (rate >= 95) return "text-emerald-500"
    if (rate >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const formatTimeAgo = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "ahora"
    if (mins < 60) return `hace ${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `hace ${days}d`
  }

  return (
    <AppLayout title="Observabilidad">
      <div className="space-y-6">
        {/* Header with sync info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Ultimo sync: {formatTimeAgo(data.synced_at)}{" "}
            <span className="text-muted-foreground/60">
              ({new Date(data.synced_at).toLocaleString("es-ES")})
            </span>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            {refreshing ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Server className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Servicios</p>
                  <p className="text-2xl font-bold">{serviceCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <Activity className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className={cn("text-2xl font-bold", getRateColor(avgUptime))}>
                    {avgUptime.toFixed(1)}%
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
                  <p className="text-sm text-muted-foreground">Coste Hoy</p>
                  <p className="text-2xl font-bold">
                    ${costs.today?.total?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Phone className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calls Hoy</p>
                  <p className="text-2xl font-bold">
                    {stats.today?.calls || costs.today?.calls || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Health */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Servicios</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(services).map(([name, info]) => {
              const uptime = serviceUptime[name]
              return (
                <Card key={name}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(info.status)}
                        <span className="font-medium text-sm">{name}</span>
                      </div>
                      <Badge className={cn("text-[10px]", getStatusBadgeClass(info.status))}>
                        {info.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {info.detail}
                    </p>
                    {uptime && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Uptime 24h</span>
                        <span className={cn("text-xs font-semibold", getRateColor(uptime.uptime))}>
                          {uptime.uptime.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {Object.keys(services).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay datos de servicios disponibles
            </p>
          )}
        </div>

        {/* Cron Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Crons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedCrons.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cron</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Tasa Exito</TableHead>
                    <TableHead className="text-right">Ejecuciones</TableHead>
                    <TableHead className="text-right">Coste Medio</TableHead>
                    <TableHead className="text-right">Duracion Media</TableHead>
                    <TableHead className="text-right">Ultima Ejecucion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCrons.map(([name, stat]) => {
                    const rate =
                      stat.successRate ??
                      (stat.runs > 0 ? (stat.successes / stat.runs) * 100 : 100)
                    return (
                      <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-[10px]",
                              getStatusBadgeClass(stat.lastStatus)
                            )}
                          >
                            {stat.lastStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn("text-right font-semibold", getRateColor(rate))}>
                          {rate.toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-muted-foreground">
                            {stat.runs}
                            {stat.failures > 0 && (
                              <span className="text-red-500 ml-1">({stat.failures} err)</span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ${stat.avgCost?.toFixed(3) || "0.000"}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatDuration(stat.avgSeconds || 0)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs">
                          {stat.lastRun ? formatTimeAgo(stat.lastRun) : "-"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay datos de crons disponibles
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              Costes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Hoy</p>
                <p className="text-xl font-bold">
                  ${costs.today?.total?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {costs.today?.calls || 0} llamadas
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ultimos 7 dias</p>
                <p className="text-xl font-bold">
                  ${(costs.total7d || 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Errores Hoy</p>
                <p className={cn(
                  "text-xl font-bold",
                  (stats.today?.errors || 0) > 0 ? "text-red-500" : "text-emerald-500"
                )}>
                  {stats.today?.errors || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
