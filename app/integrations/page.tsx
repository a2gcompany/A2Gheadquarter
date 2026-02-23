"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plug,
  RefreshCw,
  Landmark,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
  Clock,
  Settings,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getIntegrations,
  updateIntegration,
  type Integration,
} from "@/src/actions/integrations"
import { getMonthlyStats } from "@/src/actions/transactions"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; actionHref?: string; comingSoon?: boolean }
> = {
  bank: {
    icon: <Landmark className="h-5 w-5" />,
    color: "text-blue-500",
  },
  stripe: {
    icon: <CreditCard className="h-5 w-5" />,
    color: "text-purple-500",
    actionHref: "/integrations/stripe",
  },
  paypal: {
    icon: <Wallet className="h-5 w-5" />,
    color: "text-blue-400",
    actionHref: "/integrations/paypal",
  },
  shopify: {
    icon: <ShoppingCart className="h-5 w-5" />,
    color: "text-green-500",
    actionHref: "/integrations/shopify",
  },
}

function formatCurrencyES(value: number) {
  return value.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    month: "",
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<{ synced: number; skipped: number; errors: number } | null>(null)

  const loadData = async () => {
    const [intData, stats] = await Promise.all([
      getIntegrations(),
      getMonthlyStats(),
    ])
    setIntegrations(intData)
    setMonthlyStats(stats)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSyncAll = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
      const data = await res.json()
      setSyncResult({ synced: data.synced || 0, skipped: data.skipped || 0, errors: data.errors || 0 })
      await loadData()
    } catch {
      setSyncResult({ synced: 0, skipped: 0, errors: 1 })
    }
    setSyncing(false)
  }

  const handleSyncOne = async (integrationId: string, projectId?: string) => {
    setSyncingId(integrationId)
    try {
      await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId, projectId }),
      })
      await loadData()
    } catch {}
    setSyncingId(null)
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await updateIntegration(id, { is_active: !currentActive })
    loadData()
  }

  const lastSync = integrations
    .filter((i) => i.last_synced_at)
    .sort(
      (a, b) =>
        new Date(b.last_synced_at!).getTime() -
        new Date(a.last_synced_at!).getTime()
    )[0]

  const monthLabel = monthlyStats.month
    ? new Date(monthlyStats.month + "-01").toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      })
    : "Este mes"

  if (loading) {
    return (
      <AppLayout title="Integraciones">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Integraciones">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Plug className="h-6 w-6" />
              Integraciones
            </h1>
            {lastSync?.last_synced_at && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                Ultima sync:{" "}
                {formatDistanceToNow(new Date(lastSync.last_synced_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            )}
          </div>
          <Button
            onClick={handleSyncAll}
            disabled={syncing}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", syncing && "animate-spin")}
            />
            {syncing ? "Sincronizando..." : "Sync All"}
          </Button>
        </div>

        {syncResult && (
          <div
            className={cn(
              "flex items-center gap-2 text-sm p-3 rounded-md",
              syncResult.errors
                ? "text-amber-500 bg-amber-500/10"
                : "text-emerald-500 bg-emerald-500/10"
            )}
          >
            <RefreshCw className="h-4 w-4" />
            {syncResult.synced} sincronizadas, {syncResult.skipped} omitidas
            {syncResult.errors > 0 && `, ${syncResult.errors} errores`}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Ingresos ({monthLabel})
            </div>
            <p className="text-2xl font-bold text-emerald-500">
              {formatCurrencyES(monthlyStats.income)} EUR
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingDown className="h-4 w-4 text-rose-500" />
              Gastos ({monthLabel})
            </div>
            <p className="text-2xl font-bold text-rose-500">
              {formatCurrencyES(monthlyStats.expense)} EUR
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Wallet className="h-4 w-4" />
              Balance ({monthLabel})
            </div>
            <p
              className={cn(
                "text-2xl font-bold",
                monthlyStats.balance >= 0
                  ? "text-emerald-500"
                  : "text-rose-500"
              )}
            >
              {formatCurrencyES(monthlyStats.balance)} EUR
            </p>
          </div>
        </div>

        {/* Integrations List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fuentes de datos</h2>
          </div>

          {integrations.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <Plug className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                No hay integraciones configuradas todavia
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/integrations/bank-import">
                  <Button variant="outline" className="gap-2">
                    <Landmark className="h-4 w-4" />
                    Importar extracto bancario
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {integrations.map((integration) => {
                const config = TYPE_CONFIG[integration.type] || TYPE_CONFIG.bank
                return (
                  <div
                    key={integration.id}
                    className="border rounded-lg p-4 flex items-center gap-4"
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center bg-muted",
                        config.color
                      )}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{integration.name}</p>
                        <Badge
                          variant={
                            integration.is_active ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {integration.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                        {!integration.last_synced_at && integration.type !== "bank" && (
                          <Badge variant="outline" className="text-[10px]">
                            Sin configurar
                          </Badge>
                        )}
                      </div>
                      {integration.last_synced_at && (
                        <p className="text-xs text-muted-foreground">
                          Ultima sync:{" "}
                          {formatDistanceToNow(
                            new Date(integration.last_synced_at),
                            { addSuffix: true, locale: es }
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.type !== "bank" && integration.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={syncingId === integration.id}
                          onClick={() =>
                            handleSyncOne(
                              integration.id,
                              integration.config.projectId as string
                            )
                          }
                        >
                          {syncingId === integration.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Sync
                        </Button>
                      )}
                      {config.actionHref && (
                        <Link href={config.actionHref}>
                          <Button variant="outline" size="sm" className="gap-1">
                            {integration.type === "bank" ? "Importar" : "Settings"}
                            {integration.type === "bank" ? (
                              <ArrowRight className="h-3 w-3" />
                            ) : (
                              <Settings className="h-3 w-3" />
                            )}
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleToggleActive(
                            integration.id,
                            integration.is_active
                          )
                        }
                      >
                        {integration.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Acciones rapidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/integrations/bank-import">
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-3">
                <Landmark className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">
                    Importar extracto bancario
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV o Excel de tu banco
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/integrations/stripe">
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Conectar Stripe</p>
                  <p className="text-xs text-muted-foreground">
                    Sincroniza pagos y fees
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/integrations/paypal">
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-3">
                <Wallet className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium">Conectar PayPal</p>
                  <p className="text-xs text-muted-foreground">
                    Importa transacciones
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/integrations/shopify">
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Conectar Shopify</p>
                  <p className="text-xs text-muted-foreground">
                    Pedidos y refunds
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
