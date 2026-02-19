"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Database, GitCompare, Plug, Clock, Check, AlertCircle, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale/es"
import { getImportStats } from "@/src/actions/import-history"
import { getIntegrations } from "@/src/actions/integrations"
import { getReconciliationStats } from "@/src/actions/reconciliation"

import type { ImportHistory, Integration as IntegrationType } from "@/src/types/database"

interface ImportStats {
  totalImports: number
  totalRowsImported: number
  lastImport: ImportHistory | null
  bySource: Record<string, { count: number; rows: number }>
}

const integrationIcons: Record<string, any> = {
  google_sheets: Database,
  notion: Database,
  airtable: Database,
  excel: Database,
  csv: Database,
  default: Plug,
}

export function IngestionOverview() {
  const [loading, setLoading] = useState(true)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [integrations, setIntegrations] = useState<IntegrationType[]>([])
  const [reconciliationStats, setReconciliationStats] = useState<{ pending: number; confirmed: number; rejected: number; total: number } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, integrationsData, reconData] = await Promise.all([
          getImportStats(),
          getIntegrations(),
          getReconciliationStats(),
        ])

        setImportStats(statsData)
        setIntegrations(integrationsData)
        setReconciliationStats(reconData)
      } catch (error) {
        console.error("Error fetching overview data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const activeIntegrations = integrations.filter((i) => i.is_active).length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importStats?.totalImports ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filas Importadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importStats?.totalRowsImported ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reconciliaciones Pendientes</CardTitle>
            <GitCompare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(reconciliationStats?.pending ?? 0) > 0 ? 'text-yellow-600' : ''}`}>
              {reconciliationStats?.pending ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integraciones Activas</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIntegrations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Last Activity */}
      {importStats?.lastImport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Última Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{importStats.lastImport.source_name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(importStats.lastImport.started_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Filas</p>
                  <p className="font-medium">
                    {importStats.lastImport.rows_imported} importadas, {importStats.lastImport.rows_skipped} omitidas
                  </p>
                </div>
                <Badge
                  variant={importStats.lastImport.status === "completed" ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {importStats.lastImport.status === "completed" ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {importStats.lastImport.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de Integraciones</CardTitle>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay integraciones configuradas
            </p>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => {
                const IconComponent = integrationIcons[integration.type] || integrationIcons.default
                return (
                  <div key={integration.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {integration.last_synced_at && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(integration.last_synced_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      )}
                      <Badge variant={integration.is_active ? "default" : "secondary"}>
                        {integration.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
