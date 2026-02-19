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
  Wallet,
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
import { testPaypalConnection } from "@/src/actions/paypal"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function PaypalSettingsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [existing, setExisting] = useState<Integration | null>(null)
  const [clientId, setClientId] = useState("")
  const [secret, setSecret] = useState("")
  const [sandbox, setSandbox] = useState(false)
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
      const paypal = integrations.find((i) => i.type === "paypal")
      if (paypal) {
        setExisting(paypal)
        setClientId((paypal.config.clientId as string) || "")
        setSecret((paypal.config.secret as string) || "")
        setSandbox((paypal.config.sandbox as boolean) || false)
        setProjectId((paypal.config.projectId as string) || "")
      }
    })
  }, [])

  const handleTest = async () => {
    if (!clientId.trim() || !secret.trim()) return
    setTesting(true)
    setTestResult(null)
    const result = await testPaypalConnection(clientId.trim(), secret.trim(), sandbox)
    setTestResult(result)
    setTesting(false)
  }

  const handleSave = async () => {
    if (!clientId.trim() || !secret.trim() || !projectId) return
    setSaving(true)
    setSaved(false)

    const config = { clientId: clientId.trim(), secret: secret.trim(), sandbox, projectId }

    if (existing) {
      const updated = await updateIntegration(existing.id, { config })
      if (updated) setExisting(updated)
    } else {
      const created = await createIntegration({
        type: "paypal",
        name: "PayPal",
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

      const integrations = await getIntegrations()
      const paypal = integrations.find((i) => i.type === "paypal")
      if (paypal) setExisting(paypal)
    } catch (err: any) {
      setSyncResult({ synced: 0, skipped: 0, error: err.message })
    }

    setSyncing(false)
  }

  return (
    <AppLayout title="PayPal">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/integrations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Integraciones
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold">PayPal</h1>
            {existing && (
              <Badge variant="default" className="text-xs">
                Conectado
              </Badge>
            )}
          </div>
        </div>

        {existing?.last_synced_at && (
          <p className="text-sm text-muted-foreground">
            Ultima sincronizacion:{" "}
            {formatDistanceToNow(new Date(existing.last_synced_at), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        )}

        <div className="border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              placeholder="Client ID de tu app PayPal"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Secret</Label>
            <Input
              id="secret"
              type="password"
              placeholder="Secret de tu app PayPal"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              developer.paypal.com → Dashboard → Apps → tu app → Client ID &amp; Secret
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Label>Entorno</Label>
            <div className="flex gap-2">
              <Button
                variant={sandbox ? "outline" : "default"}
                size="sm"
                onClick={() => setSandbox(false)}
              >
                Live
              </Button>
              <Button
                variant={sandbox ? "default" : "outline"}
                size="sm"
                onClick={() => setSandbox(true)}
              >
                Sandbox
              </Button>
            </div>
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
              disabled={!clientId.trim() || !secret.trim() || testing}
            >
              {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Test Connection
            </Button>
            <Button
              onClick={handleSave}
              disabled={!clientId.trim() || !secret.trim() || !projectId || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {existing ? "Guardar cambios" : "Conectar PayPal"}
            </Button>
          </div>
        </div>

        {existing && (
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold">Sincronizacion</h2>
            <p className="text-sm text-muted-foreground">
              Importa transacciones de PayPal. Se detectan duplicados automaticamente.
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
