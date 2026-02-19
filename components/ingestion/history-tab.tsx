"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, Loader2, Check, AlertCircle, Clock, AlertTriangle } from "lucide-react"
import { getImportHistory } from "@/src/actions/import-history"
import type { ImportHistory } from "@/src/types/database"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale/es"

const SOURCE_LABELS: Record<string, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  shopify: "Shopify",
  bank_csv: "Extracto Bancario",
  google_sheets: "Google Sheets",
  csv_manual: "CSV Manual",
  excel_bookings: "Excel Bookings",
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Check }> = {
  completed: { label: "Completado", variant: "default", icon: Check },
  running: { label: "En curso", variant: "secondary", icon: Clock },
  failed: { label: "Error", variant: "destructive", icon: AlertCircle },
  partial: { label: "Parcial", variant: "outline", icon: AlertTriangle },
}

function getDuration(record: ImportHistory): string {
  if (!record.completed_at) return "-"
  const start = new Date(record.started_at).getTime()
  const end = new Date(record.completed_at).getTime()
  const diffMs = end - start
  if (diffMs < 1000) return `${diffMs}ms`
  if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`
  return `${Math.round(diffMs / 60000)}min`
}

export function IngestionHistory() {
  const [records, setRecords] = useState<ImportHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    async function load() {
      const data = await getImportHistory({
        source_type: filter === "all" ? undefined : filter,
        limit: 100,
      })
      setRecords(data)
      setLoading(false)
    }
    load()
  }, [filter])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Importaciones
            </CardTitle>
            <Select value={filter} onValueChange={(v) => { setLoading(true); setFilter(v) }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fuentes</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="bank_csv">Extracto Bancario</SelectItem>
                <SelectItem value="google_sheets">Google Sheets</SelectItem>
                <SelectItem value="csv_manual">CSV Manual</SelectItem>
                <SelectItem value="excel_bookings">Excel Bookings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay registros de importacion
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead className="text-right">Importados</TableHead>
                    <TableHead className="text-right">Saltados</TableHead>
                    <TableHead className="text-right">Errores</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Duracion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(record => {
                    const statusCfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.completed
                    const StatusIcon = statusCfg.icon

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDistanceToNow(new Date(record.started_at), { addSuffix: true, locale: es })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {SOURCE_LABELS[record.source_type] || record.source_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {record.source_name}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground capitalize">
                            {record.triggered_by}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-emerald-600">
                          {record.rows_imported > 0 ? `+${record.rows_imported}` : "0"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {record.rows_skipped}
                        </TableCell>
                        <TableCell className="text-right text-sm text-rose-600">
                          {record.rows_errored > 0 ? record.rows_errored : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusCfg.variant} className="text-xs gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {getDuration(record)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
