"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitCompare, Search, Check, X, Loader2, AlertCircle } from "lucide-react"
import {
  findReconciliationCandidates,
  createAutoMatches,
  getPendingMatches,
  updateMatchStatus,
  getReconciliationStats,
} from "@/src/actions/reconciliation"
import { getProjects } from "@/src/actions/projects"
import type { Transaction, ReconciliationMatch } from "@/src/types/database"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale/es"

type MatchWithTx = ReconciliationMatch & {
  transaction_a: Transaction
  transaction_b: Transaction
}

function sourceLabel(tx: Transaction): string {
  const eid = tx.external_id || tx.source_file || ""
  if (eid.startsWith("stripe:")) return "Stripe"
  if (eid.startsWith("paypal:")) return "PayPal"
  if (eid.startsWith("shopify:")) return "Shopify"
  if (tx.source_file) return tx.source_file.split("/").pop() || "Archivo"
  return "Manual"
}

function sourceBadgeColor(tx: Transaction): string {
  const eid = tx.external_id || tx.source_file || ""
  if (eid.startsWith("stripe:")) return "bg-purple-100 text-purple-700"
  if (eid.startsWith("paypal:")) return "bg-blue-100 text-blue-700"
  if (eid.startsWith("shopify:")) return "bg-green-100 text-green-700"
  return "bg-gray-100 text-gray-700"
}

export function IngestionReconciliation() {
  const [projects, setProjects] = useState<Array<{ id: string; name: string; type: string }>>([])
  const [selectedProject, setSelectedProject] = useState("")
  const [pendingMatches, setPendingMatches] = useState<MatchWithTx[]>([])
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, rejected: 0, total: 0 })
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ found: number } | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [projectsData, matches, statsData] = await Promise.all([
        getProjects(),
        getPendingMatches(),
        getReconciliationStats(),
      ])
      setProjects(projectsData)
      setPendingMatches(matches)
      setStats(statsData)
      setLoading(false)
    }
    load()
  }, [])

  async function handleScan() {
    if (!selectedProject) return
    setScanning(true)
    setScanResult(null)

    const candidates = await findReconciliationCandidates(selectedProject)

    if (candidates.length > 0) {
      const matchesToCreate = candidates.map(c => ({
        transaction_a_id: c.transactionA.id,
        transaction_b_id: c.transactionB.id,
        confidence: c.confidence,
        matched_on: {
          amount: true,
          date_diff_days: c.dateDiffDays,
        },
      }))

      const created = await createAutoMatches(matchesToCreate)
      setScanResult({ found: created })

      // Refresh
      const [matches, statsData] = await Promise.all([
        getPendingMatches(),
        getReconciliationStats(),
      ])
      setPendingMatches(matches)
      setStats(statsData)
    } else {
      setScanResult({ found: 0 })
    }

    setScanning(false)
  }

  async function handleMatchAction(matchId: string, action: "confirmed" | "rejected") {
    setUpdatingId(matchId)
    await updateMatchStatus(matchId, action)

    setPendingMatches(prev => prev.filter(m => m.id !== matchId))
    setStats(prev => ({
      ...prev,
      pending: prev.pending - 1,
      [action]: (prev as any)[action] + 1,
    }))
    setUpdatingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">{stats.confirmed}</div>
            <p className="text-sm text-muted-foreground">Confirmados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-500">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rechazados</p>
          </CardContent>
        </Card>
      </div>

      {/* Scan controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Coincidencias
          </CardTitle>
          <CardDescription>
            Busca transacciones de distintas fuentes con el mismo monto y fecha similar (+-3 dias)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Proyecto</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScan} disabled={!selectedProject || scanning}>
              {scanning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <GitCompare className="h-4 w-4 mr-2" />
              )}
              {scanning ? "Buscando..." : "Buscar Matches"}
            </Button>
          </div>
          {scanResult !== null && (
            <div className={`mt-4 flex items-center gap-2 text-sm ${scanResult.found > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
              {scanResult.found > 0 ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {scanResult.found > 0
                ? `Se encontraron ${scanResult.found} coincidencias nuevas`
                : "No se encontraron coincidencias nuevas"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending matches */}
      <Card>
        <CardHeader>
          <CardTitle>Matches Pendientes ({pendingMatches.length})</CardTitle>
          <CardDescription>
            Revisa y confirma o rechaza cada coincidencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingMatches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay matches pendientes de revision
            </p>
          ) : (
            <div className="space-y-4">
              {pendingMatches.map(match => (
                <div key={match.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      Confianza: {Math.round((match.match_confidence || 0) * 100)}%
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-600 hover:bg-emerald-50"
                        disabled={updatingId === match.id}
                        onClick={() => handleMatchAction(match.id, "confirmed")}
                      >
                        {updatingId === match.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 hover:bg-rose-50"
                        disabled={updatingId === match.id}
                        onClick={() => handleMatchAction(match.id, "rejected")}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Transaction A */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceBadgeColor(match.transaction_a)}`}>
                          {sourceLabel(match.transaction_a)}
                        </span>
                        <Badge variant={match.transaction_a.type === "income" ? "default" : "destructive"} className="text-xs">
                          {match.transaction_a.type === "income" ? "Ingreso" : "Gasto"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">${parseFloat(match.transaction_a.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{match.transaction_a.date}</p>
                      <p className="text-xs text-muted-foreground truncate">{match.transaction_a.description}</p>
                    </div>

                    {/* Transaction B */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceBadgeColor(match.transaction_b)}`}>
                          {sourceLabel(match.transaction_b)}
                        </span>
                        <Badge variant={match.transaction_b.type === "income" ? "default" : "destructive"} className="text-xs">
                          {match.transaction_b.type === "income" ? "Ingreso" : "Gasto"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">${parseFloat(match.transaction_b.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{match.transaction_b.date}</p>
                      <p className="text-xs text-muted-foreground truncate">{match.transaction_b.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
