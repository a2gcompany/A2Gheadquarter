"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Check,
  ArrowLeft,
  Music,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getProjects, type Project } from "@/src/actions/projects"
import { createManyBookings, type NewBooking } from "@/src/actions/bookings"
import { toUSD } from "@/src/lib/currency"
import Link from "next/link"

// Column keys we expect in the Excel file
const EXPECTED_COLUMNS = [
  "date",
  "contract_id",
  "venue",
  "city",
  "country",
  "fee",
  "currency",
  "region",
  "notes",
] as const

type ColumnKey = (typeof EXPECTED_COLUMNS)[number]

// Auto-detect column by matching header text
function detectColumn(header: string): ColumnKey | null {
  const h = header.toLowerCase().trim()
  if (h.includes("date") || h.includes("fecha")) return "date"
  if (h.includes("contract") || h.includes("contrato")) return "contract_id"
  if (h.includes("venue") || h.includes("event") || h.includes("lugar"))
    return "venue"
  if (h.includes("city") || h.includes("ciudad")) return "city"
  if (h.includes("country") || h.includes("pais") || h.includes("país"))
    return "country"
  if (h.includes("fee") || h.includes("price") || h.includes("precio"))
    return "fee"
  if (h.includes("currency") || h.includes("moneda") || h.includes("curr"))
    return "currency"
  if (h.includes("region") || h.includes("región") || h.includes("area"))
    return "region"
  if (h.includes("note") || h.includes("nota") || h.includes("comment"))
    return "notes"
  return null
}

type ParsedRow = Record<ColumnKey, string>

export default function BookingsImportPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState("")
  const [fileName, setFileName] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMap, setColumnMap] = useState<Record<number, ColumnKey | "">>(
    {}
  )
  const [rawRows, setRawRows] = useState<string[][]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    imported: number
    skipped: number
  } | null>(null)

  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  const parseExcel = (buffer: ArrayBuffer) => {
    const wb = XLSX.read(buffer, { type: "array" })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const json: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    })

    if (json.length < 2) {
      throw new Error("El archivo debe tener al menos una fila de headers y una de datos")
    }

    const hdrs = json[0].map((h) => String(h).trim())
    const rows = json.slice(1).filter((row) => row.some((cell) => String(cell).trim()))

    // Auto-detect column mapping
    const autoMap: Record<number, ColumnKey | ""> = {}
    const usedKeys = new Set<ColumnKey>()
    hdrs.forEach((h, i) => {
      const detected = detectColumn(h)
      if (detected && !usedKeys.has(detected)) {
        autoMap[i] = detected
        usedKeys.add(detected)
      } else {
        autoMap[i] = ""
      }
    })

    return { hdrs, rows, autoMap }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setResult(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const { hdrs, rows, autoMap } = parseExcel(buffer)
        setHeaders(hdrs)
        setRawRows(rows)
        setColumnMap(autoMap)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al procesar el archivo"
        )
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  })

  // Build parsed rows from raw data + column mapping
  const parsedRows: ParsedRow[] = rawRows.map((row) => {
    const parsed: any = {}
    EXPECTED_COLUMNS.forEach((key) => (parsed[key] = ""))
    Object.entries(columnMap).forEach(([colIdx, key]) => {
      if (key) {
        parsed[key] = String(row[parseInt(colIdx)] || "").trim()
      }
    })
    return parsed
  })

  const mappedCount = Object.values(columnMap).filter(Boolean).length
  const hasVenue = Object.values(columnMap).includes("venue")
  const hasDate = Object.values(columnMap).includes("date")

  const handleImport = async () => {
    if (!projectId || parsedRows.length === 0) return

    setIsImporting(true)
    setError(null)
    setResult(null)

    try {
      const bookings: NewBooking[] = parsedRows
        .filter((r) => r.venue || r.date)
        .map((r) => {
          const fee = r.fee ? r.fee.replace(/[^0-9.-]/g, "") : null
          const currency = r.currency?.toUpperCase() || "USD"
          const feeUsd = fee ? String(toUSD(parseFloat(fee), currency)) : null

          return {
            project_id: projectId,
            venue: r.venue || "TBD",
            city: r.city || "",
            country: r.country || "",
            fee: fee,
            fee_currency: currency,
            fee_usd: feeUsd,
            status: "confirmed" as const,
            show_date: normalizeDate(r.date) || null,
            notes: r.notes || null,
            contract_id: r.contract_id || null,
            region: r.region || null,
            artist_name: null,
            event_name: r.venue || null,
          }
        })

      const res = await createManyBookings(bookings)
      setResult(res)

      if (res.imported > 0) {
        setRawRows([])
        setHeaders([])
        setColumnMap({})
        setFileName("")
      }
    } catch (err) {
      setError("Error al importar bookings")
    } finally {
      setIsImporting(false)
    }
  }

  const reset = () => {
    setRawRows([])
    setHeaders([])
    setColumnMap({})
    setFileName("")
    setError(null)
    setResult(null)
  }

  const artistProjects = projects.filter((p) => p.type === "artist")

  return (
    <AppLayout title="Importar Bookings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/bookings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Bookings
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Importar desde Excel</h1>
            <p className="text-sm text-muted-foreground">
              Sube un archivo .xlsx con los bookings para importar en lote
            </p>
          </div>
        </div>

        {/* Project selector */}
        <div className="space-y-2">
          <Label>Artista</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Seleccionar artista" />
            </SelectTrigger>
            <SelectContent>
              {artistProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dropzone or Preview */}
        {rawRows.length === 0 ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p>Suelta el archivo aqui...</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastra un archivo Excel (.xlsx) aqui o haz clic para
                  seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Columnas esperadas: Date, Contract ID, Venue, City, Country,
                  Fee, Currency, Region, Notes
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <strong>{rawRows.length}</strong> filas en{" "}
                <strong>{fileName}</strong> &middot;{" "}
                <span className="text-muted-foreground">
                  {mappedCount} columnas mapeadas
                </span>
              </p>
              <Button variant="ghost" size="sm" onClick={reset}>
                Cambiar archivo
              </Button>
            </div>

            {/* Column mapping */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium">Mapeo de columnas</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {headers.map((h, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {h}
                    </p>
                    <Select
                      value={columnMap[i] || "_skip"}
                      onValueChange={(v) =>
                        setColumnMap((prev) => ({
                          ...prev,
                          [i]: v === "_skip" ? "" : (v as ColumnKey),
                        }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_skip">
                          <span className="text-muted-foreground">
                            Ignorar
                          </span>
                        </SelectItem>
                        {EXPECTED_COLUMNS.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[350px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[90px]">Date</TableHead>
                      <TableHead className="w-[100px]">Contract</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right w-[90px]">
                        Fee
                      </TableHead>
                      <TableHead className="w-[60px]">Curr</TableHead>
                      <TableHead className="w-[80px]">Region</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.slice(0, 50).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">
                          {row.date}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.contract_id}
                        </TableCell>
                        <TableCell className="text-sm truncate max-w-[200px]">
                          {row.venue}
                        </TableCell>
                        <TableCell className="text-xs">{row.city}</TableCell>
                        <TableCell className="text-xs">
                          {row.country}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {row.fee}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.currency}
                        </TableCell>
                        <TableCell className="text-xs">
                          {row.region}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {rawRows.length > 50 && (
                <p className="text-xs text-muted-foreground p-2 border-t text-center">
                  Mostrando 50 de {rawRows.length} filas
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="flex items-center gap-2 text-emerald-500 text-sm bg-emerald-500/10 p-3 rounded-md">
            <Check className="h-4 w-4" />
            <span>
              <strong>{result.imported}</strong> bookings importados
              {result.skipped > 0 && (
                <>
                  , <strong>{result.skipped}</strong> omitidos (duplicados)
                </>
              )}
            </span>
          </div>
        )}

        {/* Actions */}
        {rawRows.length > 0 && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={reset}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={
                !projectId || parsedRows.length === 0 || isImporting || !hasVenue
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting
                ? "Importando..."
                : `Importar ${parsedRows.length} bookings`}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

// Normalize various date formats to YYYY-MM-DD
function normalizeDate(raw: string): string | null {
  if (!raw) return null
  const trimmed = raw.trim()

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.substring(0, 10)
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const euMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (euMatch) {
    const [, d, m, y] = euMatch
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }

  // MM/DD/YYYY
  const usMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (usMatch) {
    const [, m, d, y] = usMatch
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }

  // Try JS Date parse as last resort
  const d = new Date(trimmed)
  if (!isNaN(d.getTime())) {
    return d.toISOString().substring(0, 10)
  }

  return null
}
