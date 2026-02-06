"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Download, Eye, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { getAbossConfig, previewAbossEvents, importAbossEvents, getA2GProjects } from "@/src/actions/aboss"
import type { AbossEvent } from "@/lib/types/aboss"

export default function AbossPage() {
  const [config, setConfig] = useState<{
    hasApiKey: boolean
    defaultProjectId: string
    defaultAgencyId: string
  } | null>(null)

  const [projects, setProjects] = useState<{ id: string; name: string; type: string }[]>([])
  const [events, setEvents] = useState<AbossEvent[]>([])

  // Form state
  const [abossProjectId, setAbossProjectId] = useState("")
  const [abossAgencyId, setAbossAgencyId] = useState("")
  const [selectedA2GProject, setSelectedA2GProject] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // UI state
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
    details?: { imported?: number; skipped?: number; total?: number }
  } | null>(null)

  const loadInitialData = useCallback(async () => {
    try {
      const [configData, projectsData] = await Promise.all([
        getAbossConfig(),
        getA2GProjects(),
      ])
      setConfig(configData)
      setProjects(projectsData)
      if (configData.defaultProjectId) setAbossProjectId(configData.defaultProjectId)
      if (configData.defaultAgencyId) setAbossAgencyId(configData.defaultAgencyId)
    } catch (error) {
      console.error("Error loading config:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const handlePreview = async () => {
    setFetching(true)
    setResult(null)
    setEvents([])

    try {
      const res = await previewAbossEvents({
        projectId: abossProjectId || undefined,
        agencyId: abossAgencyId || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      })

      if (res.success) {
        setEvents(res.events)
        setResult({
          type: "success",
          message: `Found ${res.totalEvents} events from ABOSS`,
        })
      } else {
        setResult({ type: "error", message: res.error })
      }
    } catch (error) {
      setResult({ type: "error", message: String(error) })
    } finally {
      setFetching(false)
    }
  }

  const handleImport = async () => {
    if (!selectedA2GProject) {
      setResult({ type: "error", message: "Please select an A2G project to import into" })
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const res = await importAbossEvents({
        projectId: abossProjectId || undefined,
        agencyId: abossAgencyId || undefined,
        a2gProjectId: selectedA2GProject,
        from: fromDate || undefined,
        to: toDate || undefined,
      })

      if (res.success) {
        setResult({
          type: "success",
          message: res.message,
          details: {
            imported: res.imported,
            skipped: res.skipped,
            total: res.total,
          },
        })
        setEvents([])
      } else {
        setResult({ type: "error", message: res.error })
      }
    } catch (error) {
      setResult({ type: "error", message: String(error) })
    } finally {
      setImporting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return ""
    }
  }

  if (loading) {
    return (
      <AppLayout title="ABOSS Import">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="ABOSS Import">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">ABOSS Data Import</h1>
          <p className="text-muted-foreground">
            Fetch and import events from ABOSS into your bookings
          </p>
        </div>

        {/* API Status */}
        {!config?.hasApiKey && (
          <Card className="p-4 border-yellow-500/50 bg-yellow-500/10">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">ABOSS API key not configured</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Add <code className="text-xs bg-muted px-1 py-0.5 rounded">ABOSS_API_KEY</code> to your environment variables.
              Get your API key from your ABOSS account under Profile Settings &gt; Authentication Token.
            </p>
          </Card>
        )}

        {/* Configuration Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">ABOSS Connection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aboss-project-id">ABOSS Project ID</Label>
              <Input
                id="aboss-project-id"
                placeholder="e.g. 12345"
                value={abossProjectId}
                onChange={(e) => setAbossProjectId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboss-agency-id">ABOSS Agency ID (optional)</Label>
              <Input
                id="aboss-agency-id"
                placeholder="e.g. 67890"
                value={abossAgencyId}
                onChange={(e) => setAbossAgencyId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a2g-project">A2G Project (for import)</Label>
              <Select value={selectedA2GProject} onValueChange={setSelectedA2GProject}>
                <SelectTrigger id="a2g-project">
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handlePreview}
              disabled={fetching || (!abossProjectId && !abossAgencyId) || !config?.hasApiKey}
              variant="outline"
            >
              {fetching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Preview Events
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || (!abossProjectId && !abossAgencyId) || !selectedA2GProject || !config?.hasApiKey}
            >
              {importing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Import to Bookings
            </Button>
          </div>
        </Card>

        {/* Result Message */}
        {result && (
          <Card
            className={`p-4 ${
              result.type === "success"
                ? "border-green-500/50 bg-green-500/10"
                : "border-red-500/50 bg-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">{result.message}</span>
            </div>
            {result.details && (
              <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <span>Total: {result.details.total}</span>
                <span>Imported: {result.details.imported}</span>
                <span>Skipped: {result.details.skipped}</span>
              </div>
            )}
          </Card>
        )}

        {/* Events Preview Table */}
        {events.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                ABOSS Events Preview ({events.length})
              </h2>
              <Button variant="ghost" size="sm" onClick={handlePreview}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tickets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(event.start)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {event.tba ? (
                          <Badge variant="outline">TBA</Badge>
                        ) : (
                          formatTime(event.start)
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{event.title}</span>
                          {event.venue && (
                            <span className="text-muted-foreground text-sm block">
                              {event.venue}
                            </span>
                          )}
                          {(event.city || event.country) && (
                            <span className="text-muted-foreground text-xs block">
                              {[event.city, event.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.status === "confirmed"
                              ? "default"
                              : event.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {event.ticketLink ? (
                          <a
                            href={event.ticketLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            Buy tickets
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
