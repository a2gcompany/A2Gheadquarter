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
  Building2,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getProjects, type Project } from "@/src/actions/projects"
import {
  createManyTransactionsDedup,
  type NewTransaction,
} from "@/src/actions/transactions"
import { getActivePaymentSources, type PaymentSource } from "@/src/actions/payment-sources"
import Link from "next/link"

// Column keys we recognise from bank statements
const BANK_COLUMNS = [
  "date",
  "description",
  "amount",
  "debit",
  "credit",
  "balance",
  "category",
  "reference",
] as const

type ColumnKey = (typeof BANK_COLUMNS)[number]

const COLUMN_LABELS: Record<ColumnKey, string> = {
  date: "Fecha",
  description: "Descripcion",
  amount: "Importe (+/-)",
  debit: "Cargo (gasto)",
  credit: "Abono (ingreso)",
  balance: "Saldo (ignorar)",
  category: "Categoria",
  reference: "Referencia",
}

// Auto-detect column by matching header text
function detectColumn(header: string): ColumnKey | null {
  const h = header.toLowerCase().trim()
  if (
    h.includes("date") ||
    h.includes("fecha") ||
    h.includes("booking date") ||
    h.includes("value date")
  )
    return "date"
  if (
    h.includes("description") ||
    h.includes("concept") ||
    h.includes("concepto") ||
    h.includes("details") ||
    h.includes("detalle")
  )
    return "description"
  if (h === "amount" || h === "importe" || h === "monto") return "amount"
  if (
    h.includes("debit") ||
    h.includes("cargo") ||
    h.includes("withdrawal") ||
    h.includes("debe")
  )
    return "debit"
  if (
    h.includes("credit") ||
    h.includes("abono") ||
    h.includes("deposit") ||
    h.includes("haber")
  )
    return "credit"
  if (h.includes("balance") || h.includes("saldo")) return "balance"
  if (
    h.includes("category") ||
    h.includes("categoria") ||
    h.includes("type") ||
    h.includes("tipo")
  )
    return "category"
  if (h.includes("reference") || h.includes("referencia") || h.includes("ref"))
    return "reference"
  return null
}

type ParsedRow = Record<ColumnKey, string>

// Normalize various date formats to YYYY-MM-DD
function normalizeDate(raw: string): string | null {
  if (!raw) return null
  const trimmed = raw.trim()

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.substring(0, 10)

  // DD/MM/YYYY or DD-MM-YYYY
  const euMatch = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (euMatch) {
    const [, d, m, y] = euMatch
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }

  // Try JS Date parse as last resort
  const d = new Date(trimmed)
  if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10)

  return null
}

function parseAmount(raw: string): number {
  if (!raw) return 0
  // Remove currency symbols, spaces, thousands separators
  const cleaned = raw
    .replace(/[€$£\s]/g, "")
    .replace(/\.(\d{3})/g, "$1") // Remove thousands dots (EU format)
    .replace(",", ".") // Replace comma decimal to dot
  return parseFloat(cleaned) || 0
}

export default function BankImportPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([])
  const [projectId, setProjectId] = useState("")
  const [paymentSourceId, setPaymentSourceId] = useState("")
  const [fileName, setFileName] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMap, setColumnMap] = useState<Record<number, ColumnKey | "">>({})
  const [rawRows, setRawRows] = useState<string[][]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    imported: number
    skipped: number
  } | null>(null)

  useEffect(() => {
    Promise.all([getProjects(), getActivePaymentSources()]).then(
      ([p, ps]) => {
        setProjects(p)
        setPaymentSources(ps)
      }
    )
  }, [])

  const parseFile = (buffer: ArrayBuffer, name: string) => {
    const isCSV = name.toLowerCase().endsWith(".csv")

    if (isCSV) {
      const text = new TextDecoder().decode(buffer)
      const lines = text.trim().split("\n")
      if (lines.length < 2) throw new Error("El archivo debe tener al menos headers y una fila de datos")

      // Detect separator: semicolon or comma
      const firstLine = lines[0]
      const sep = firstLine.includes(";") ? ";" : ","

      const hdrs = firstLine.split(sep).map((h) => h.trim().replace(/^"|"$/g, ""))
      const rows = lines.slice(1)
        .map((line) => line.split(sep).map((c) => c.trim().replace(/^"|"$/g, "")))
        .filter((row) => row.some((cell) => cell))

      return { hdrs, rows }
    }

    // Excel
    const wb = XLSX.read(buffer, { type: "array" })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const json: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    })

    if (json.length < 2) throw new Error("El archivo debe tener al menos headers y una fila de datos")

    const hdrs = json[0].map((h) => String(h).trim())
    const rows = json.slice(1).filter((row) => row.some((cell) => String(cell).trim()))

    return { hdrs, rows: rows.map((r) => r.map((c) => String(c))) }
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
        const { hdrs, rows } = parseFile(buffer, file.name)
        setHeaders(hdrs)
        setRawRows(rows)

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
        setColumnMap(autoMap)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al procesar el archivo")
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  })

  // Build parsed rows from raw data + column mapping
  const parsedRows: ParsedRow[] = rawRows.map((row) => {
    const parsed: any = {}
    BANK_COLUMNS.forEach((key) => (parsed[key] = ""))
    Object.entries(columnMap).forEach(([colIdx, key]) => {
      if (key) parsed[key] = String(row[parseInt(colIdx)] || "").trim()
    })
    return parsed
  })

  // Resolve amount: handle combined amount OR separate debit/credit
  const resolveAmount = (row: ParsedRow): { amount: number; type: "income" | "expense" } => {
    if (row.amount) {
      const val = parseAmount(row.amount)
      return { amount: Math.abs(val), type: val >= 0 ? "income" : "expense" }
    }
    if (row.debit && parseAmount(row.debit) !== 0) {
      return { amount: Math.abs(parseAmount(row.debit)), type: "expense" }
    }
    if (row.credit && parseAmount(row.credit) !== 0) {
      return { amount: Math.abs(parseAmount(row.credit)), type: "income" }
    }
    return { amount: 0, type: "expense" }
  }

  const mappedCols = Object.values(columnMap).filter(Boolean)
  const hasDate = mappedCols.includes("date")
  const hasAmount =
    mappedCols.includes("amount") ||
    (mappedCols.includes("debit") || mappedCols.includes("credit"))
  const hasDescription = mappedCols.includes("description") || mappedCols.includes("reference")

  const handleImport = async () => {
    if (!projectId || parsedRows.length === 0) return

    setIsImporting(true)
    setError(null)
    setResult(null)

    try {
      const transactions: NewTransaction[] = parsedRows
        .filter((r) => r.date || r.description || r.amount || r.debit || r.credit)
        .map((r) => {
          const { amount, type } = resolveAmount(r)
          return {
            project_id: projectId,
            date: normalizeDate(r.date) || new Date().toISOString().substring(0, 10),
            description: r.description || r.reference || "Bank transaction",
            amount: String(amount),
            type,
            category: r.category || null,
            source_file: fileName,
            payment_source_id: paymentSourceId || null,
          }
        })
        .filter((t) => parseFloat(t.amount) > 0)

      const res = await createManyTransactionsDedup(transactions, projectId)
      setResult(res)

      if (res.imported > 0) {
        setRawRows([])
        setHeaders([])
        setColumnMap({})
        setFileName("")
      }
    } catch (err) {
      setError("Error al importar transacciones")
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

  return (
    <AppLayout title="Importar Extracto Bancario">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/integrations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Integraciones
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Importar Extracto Bancario</h1>
            <p className="text-sm text-muted-foreground">
              Sube un CSV o Excel (.xlsx) con el extracto de tu banco
            </p>
          </div>
        </div>

        {/* Selectors row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Proyecto / Empresa</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      {p.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fuente de pago (opcional)</Label>
            <Select value={paymentSourceId} onValueChange={setPaymentSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar banco / cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted-foreground">Sin especificar</span>
                </SelectItem>
                {paymentSources.map((ps) => (
                  <SelectItem key={ps.id} value={ps.id}>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      {ps.name} ({ps.currency})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                  Arrastra un archivo CSV o Excel (.xlsx) aqui o haz clic para
                  seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Soporta: extractos bancarios con columnas de fecha, concepto,
                  importe (o debe/haber por separado)
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
                  {mappedCols.length} columnas mapeadas
                </span>
              </p>
              <Button variant="ghost" size="sm" onClick={reset}>
                Cambiar archivo
              </Button>
            </div>

            {/* Column mapping */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium">Mapeo de columnas</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {headers.map((h, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs text-muted-foreground truncate" title={h}>
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
                          <span className="text-muted-foreground">Ignorar</span>
                        </SelectItem>
                        {BANK_COLUMNS.map((col) => (
                          <SelectItem key={col} value={col}>
                            {COLUMN_LABELS[col]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              {!hasDate && rawRows.length > 0 && (
                <p className="text-xs text-yellow-500">
                  No se ha mapeado la columna de fecha
                </p>
              )}
              {!hasAmount && rawRows.length > 0 && (
                <p className="text-xs text-yellow-500">
                  No se ha mapeado importe ni debe/haber
                </p>
              )}
            </div>

            {/* Preview table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[350px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[90px]">Fecha</TableHead>
                      <TableHead>Descripcion</TableHead>
                      <TableHead className="text-right w-[110px]">Importe</TableHead>
                      <TableHead className="w-[80px]">Tipo</TableHead>
                      <TableHead className="w-[100px]">Categoria</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.slice(0, 50).map((row, i) => {
                      const { amount, type } = resolveAmount(row)
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">
                            {row.date}
                          </TableCell>
                          <TableCell className="text-sm truncate max-w-[250px]">
                            {row.description || row.reference || "-"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-mono text-sm",
                              type === "income"
                                ? "text-emerald-500"
                                : "text-rose-500"
                            )}
                          >
                            {type === "income" ? "+" : "-"}
                            {amount.toLocaleString("es-ES", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                type === "income"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-rose-500/10 text-rose-500"
                              )}
                            >
                              {type === "income" ? "Ingreso" : "Gasto"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.category || "-"}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {rawRows.length > 50 && (
                <p className="text-xs text-muted-foreground p-2 border-t text-center">
                  Mostrando 50 de {rawRows.length} transacciones
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
              <strong>{result.imported}</strong> transacciones importadas
              {result.skipped > 0 && (
                <>
                  , <strong>{result.skipped}</strong> omitidas (duplicados)
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
                !projectId ||
                parsedRows.length === 0 ||
                isImporting ||
                !hasDate ||
                !hasAmount
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting
                ? "Importando..."
                : `Importar ${parsedRows.filter((r) => r.date || r.amount || r.debit || r.credit).length} transacciones`}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
