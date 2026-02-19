"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  CreditCard,
  Check,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getProjects, type Project } from "@/src/actions/projects"
import {
  getIntegrations,
  createIntegration,
  updateIntegration,
  type Integration,
} from "@/src/actions/integrations"
import { testStripeConnection } from "@/src/actions/stripe"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function StripeSettingsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [existing, setExisting] = useState<Integration | null>(null)
  const [secretKey, setSecretKey] = useState("")
  const [projectId, setProjectId] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ synced: number; skipped: number; error?: string } | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([getProjects(), getIntegrations()]).then(([p, integrations]) => {
      setProjects(p)
      const stripe = integrations.find((i) => i.type === "stripe")
      if (stripe) {
        setExisting(stripe)
        setSecretKey((stripe.config.secretKey as string) || "")
        setProjectId((stripe.config.projectId as string) || "")
      }
    })
  }, [])

  const handleTest = async () => {
    if (!secretKey.trim()) return
    setTesting(true)
    setTestResult(null)
    const result = await testStripeConnection(secretKey.trim())
    setTestResult(result)
    setTesting(false)
  }

  const handleSave = async () => {
    if (!secretKey.trim() || !projectId) return
    setSaving(true)
    setSaved(false)

    const config = { secretKey: secretKey.trim(), projectId }

    if (existing) {
      const updated = await updateIntegration(existing.id, { config })
      if (updated) setExisting(updated)
    } else {
      const created = await createIntegration({
        type: "stripe",
        name: "Stripe",
        config,
      })
      if (created) setExisting(created)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSync = async () => {
    if (!existing) return
    setSyncing(true)
    setSyncResult(null)

    try {
      const res = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId: existing.id, projectId }),
      })
      const data = await res.json()
      setSyncResult(data.results?.[0] || { synced: 0, skipped: 0, error: data.error })

      // Refresh integration data
      const integrations = await getIntegrations()
      const stripe = integrations.find((i) => i.type === "stripe")
      if (stripe) setExisting(stripe)
    } catch (err: any) {
      setSyncResult({ synced: 0, skipped: 0, error: err.message })
    }

    setSyncing(false)
  }

  return (
    <AppLayout title="Stripe">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/integrations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Integraciones
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold">Stripe</h1>
            {existing && (
              <Badge variant="default" className="text-xs">
                Conectado
              </Badge>
            )}
          </div>
        </div>

        {/* Status */}
        {existing?.last_synced_at && (
          <p className="text-sm text-muted-foreground">
            Ultima sincronizacion:{" "}
            {formatDistanceToNow(new Date(existing.last_synced_at), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        )}

        {/* Config form */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="sk_live_... o sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Encuéntrala en Stripe Dashboard → Developers → API keys
            </p>
          </div>

          <div className="space-y-2">
            <Label>Proyecto destino</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test result */}
          {testResult && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm p-3 rounded-md",
                testResult.ok
                  ? "text-emerald-500 bg-emerald-500/10"
                  : "text-destructive bg-destructive/10"
              )}
            >
              {testResult.ok ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {testResult.ok ? "Conexion exitosa" : testResult.error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 p-3 rounded-md">
              <Check className="h-4 w-4" />
              Configuracion guardada
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!secretKey.trim() || testing}
            >
              {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Test Connection
            </Button>
            <Button
              onClick={handleSave}
              disabled={!secretKey.trim() || !projectId || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {existing ? "Guardar cambios" : "Conectar Stripe"}
            </Button>
          </div>
        </div>

        {/* Sync section */}
        {existing && (
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold">Sincronizacion</h2>
            <p className="text-sm text-muted-foreground">
              Importa transacciones de Stripe a tu proyecto. Se detectan duplicados automaticamente.
            </p>

            {syncResult && (
              <div
                className={cn(
                  "flex items-center gap-2 text-sm p-3 rounded-md",
                  syncResult.error
                    ? "text-destructive bg-destructive/10"
                    : "text-emerald-500 bg-emerald-500/10"
                )}
              >
                {syncResult.error ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    {syncResult.error}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {syncResult.synced} sincronizadas, {syncResult.skipped} omitidas
                  </>
                )}
              </div>
            )}

            <Button onClick={handleSync} disabled={syncing} className="gap-2">
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Sincronizando..." : "Sync Now"}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
