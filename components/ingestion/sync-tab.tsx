"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale/es"
import {
  CreditCard,
  Wallet,
  ShoppingCart,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  Check,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getIntegrations, updateIntegration } from "@/src/actions/integrations"
import type { Integration } from "@/src/types/database"

const INTEGRATION_ICONS = {
  stripe: CreditCard,
  paypal: Wallet,
  shopify: ShoppingCart,
  google_sheets: FileSpreadsheet,
}

interface SyncResult {
  success: boolean
  synced?: number
  skipped?: number
  errors?: string[]
}

export function IngestionSync() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set())
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({})
  const [allSyncResult, setAllSyncResult] = useState<SyncResult | null>(null)

  // Google Sheets config state
  const [sheetsConfig, setSheetsConfig] = useState<Record<string, { releasesSheetId: string; pitchingsSheetId: string }>>({})
  const [savingSheets, setSavingSheets] = useState(false)

  useEffect(() => {
    loadIntegrations()
  }, [])

  async function loadIntegrations() {
    try {
      setLoading(true)
      const data = await getIntegrations()
      setIntegrations(data)

      // Initialize Google Sheets config
      const sheetsIntegration = data.find(i => i.type === "google_sheets")
      if (sheetsIntegration?.config) {
        setSheetsConfig({
          [sheetsIntegration.id]: {
            releasesSheetId: (sheetsIntegration.config.releasesSheetId as string) || "",
            pitchingsSheetId: (sheetsIntegration.config.pitchingsSheetId as string) || "",
          }
        })
      }
    } catch (error) {
      console.error("Error loading integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSyncAll() {
    try {
      setSyncingAll(true)
      setAllSyncResult(null)

      const response = await fetch("/api/sync-integrations?manual=true")

      const result = await response.json()
      setAllSyncResult(result)

      // Reload integrations to update last synced times
      await loadIntegrations()
    } catch (error) {
      console.error("Error syncing all:", error)
      setAllSyncResult({
        success: false,
        errors: ["Error al sincronizar todas las integraciones"],
      })
    } finally {
      setSyncingAll(false)
    }
  }

  async function handleSyncIntegration(integration: Integration) {
    try {
      setSyncingIds(prev => new Set(prev).add(integration.id))
      setSyncResults(prev => ({ ...prev, [integration.id]: { success: false } }))

      let response: Response

      if (integration.type === "google_sheets") {
        response = await fetch("/api/sync-sheets?manual=true", {
          method: "GET",
        })
      } else {
        response = await fetch("/api/integrations/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            integrationId: integration.id,
            projectId: integration.config?.projectId,
          }),
        })
      }

      const result = await response.json()
      setSyncResults(prev => ({ ...prev, [integration.id]: result }))

      // Reload integrations to update last synced time
      await loadIntegrations()
    } catch (error) {
      console.error(`Error syncing ${integration.type}:`, error)
      setSyncResults(prev => ({
        ...prev,
        [integration.id]: {
          success: false,
          errors: ["Error al sincronizar"],
        },
      }))
    } finally {
      setSyncingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(integration.id)
        return newSet
      })
    }
  }

  async function handleSaveSheetsConfig(integrationId: string) {
    try {
      setSavingSheets(true)
      const config = sheetsConfig[integrationId]

      await updateIntegration(integrationId, {
        config: {
          releasesSheetId: config.releasesSheetId,
          pitchingsSheetId: config.pitchingsSheetId,
        },
      })

      await loadIntegrations()
    } catch (error) {
      console.error("Error saving sheets config:", error)
    } finally {
      setSavingSheets(false)
    }
  }

  function getIntegrationIcon(type: string) {
    const Icon = INTEGRATION_ICONS[type as keyof typeof INTEGRATION_ICONS]
    return Icon || FileSpreadsheet
  }

  function getConfigUrl(type: string) {
    if (type === "google_sheets") return null
    return `/integrations/${type}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Sync All button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sincronización de Datos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona la sincronización manual y automática de tus integraciones
          </p>
        </div>
        <Button
          onClick={handleSyncAll}
          disabled={syncingAll || integrations.every(i => !i.is_active)}
          size="lg"
        >
          {syncingAll ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Todo
            </>
          )}
        </Button>
      </div>

      {/* All Sync Result */}
      {allSyncResult && (
        <Card className={allSyncResult.success ? "border-green-500" : "border-red-500"}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {allSyncResult.success ? (
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {allSyncResult.success ? "Sincronización completada" : "Error en la sincronización"}
                </p>
                {allSyncResult.synced !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    {allSyncResult.synced} registros sincronizados
                    {allSyncResult.skipped !== undefined && `, ${allSyncResult.skipped} omitidos`}
                  </p>
                )}
                {allSyncResult.errors && allSyncResult.errors.length > 0 && (
                  <ul className="text-sm text-red-500 mt-1 space-y-1">
                    {allSyncResult.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sincronización Automática
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Integraciones de Pago</span>
            <span className="font-medium">Diario a las 6:00 UTC</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Google Sheets</span>
            <span className="font-medium">Cada 6 horas</span>
          </div>
        </CardContent>
      </Card>

      {/* Integration Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = getIntegrationIcon(integration.type)
          const isSyncing = syncingIds.has(integration.id)
          const syncResult = syncResults[integration.id]
          const configUrl = getConfigUrl(integration.type)
          const isGoogleSheets = integration.type === "google_sheets"

          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="capitalize">{integration.type.replace("_", " ")}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={integration.is_active ? "default" : "secondary"}>
                    {integration.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Last Synced */}
                {integration.last_synced_at && (
                  <div className="text-sm text-muted-foreground">
                    Última sincronización: hace{" "}
                    {formatDistanceToNow(new Date(integration.last_synced_at), { locale: es })}
                  </div>
                )}

                {/* Google Sheets Config */}
                {isGoogleSheets && sheetsConfig[integration.id] && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <div className="space-y-2">
                      <Label htmlFor={`releases-${integration.id}`}>ID de Sheet de Releases</Label>
                      <Input
                        id={`releases-${integration.id}`}
                        value={sheetsConfig[integration.id].releasesSheetId}
                        onChange={(e) =>
                          setSheetsConfig(prev => ({
                            ...prev,
                            [integration.id]: {
                              ...prev[integration.id],
                              releasesSheetId: e.target.value,
                            },
                          }))
                        }
                        placeholder="1A2B3C..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`pitchings-${integration.id}`}>ID de Sheet de Pitchings</Label>
                      <Input
                        id={`pitchings-${integration.id}`}
                        value={sheetsConfig[integration.id].pitchingsSheetId}
                        onChange={(e) =>
                          setSheetsConfig(prev => ({
                            ...prev,
                            [integration.id]: {
                              ...prev[integration.id],
                              pitchingsSheetId: e.target.value,
                            },
                          }))
                        }
                        placeholder="1A2B3C..."
                      />
                    </div>
                    <Button
                      onClick={() => handleSaveSheetsConfig(integration.id)}
                      disabled={savingSheets}
                      size="sm"
                      className="w-full"
                    >
                      {savingSheets ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar Configuración"
                      )}
                    </Button>
                  </div>
                )}

                {/* Sync Result */}
                {syncResult && (
                  <div className={`rounded-lg p-3 ${syncResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    <div className="flex items-start gap-2">
                      {syncResult.success ? (
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1 text-sm">
                        <p className={syncResult.success ? "text-green-700" : "text-red-700"}>
                          {syncResult.success ? "Sincronizado correctamente" : "Error en la sincronización"}
                        </p>
                        {syncResult.synced !== undefined && (
                          <p className="text-muted-foreground text-xs mt-1">
                            {syncResult.synced} registros
                            {syncResult.skipped !== undefined && `, ${syncResult.skipped} omitidos`}
                          </p>
                        )}
                        {syncResult.errors && syncResult.errors.length > 0 && (
                          <ul className="text-xs text-red-600 mt-1 space-y-0.5">
                            {syncResult.errors.map((error, i) => (
                              <li key={i}>• {error}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSyncIntegration(integration)}
                    disabled={!integration.is_active || isSyncing}
                    className="flex-1"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sincronizar
                      </>
                    )}
                  </Button>
                  {configUrl && (
                    <Button variant="outline" asChild>
                      <Link href={configUrl}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {integrations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hay integraciones configuradas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
