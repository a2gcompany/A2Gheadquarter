"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2 } from "lucide-react"
import { getProjects } from "@/src/actions/projects"
import { createManyTransactionsDedup } from "@/src/actions/transactions"
import { createManyBookings } from "@/src/actions/bookings"
import { createImportRecord, completeImportRecord } from "@/src/actions/import-history"
import type { NewTransaction, NewBooking, ImportSourceType } from "@/src/types/database"

type ImportType = "csv_transactions" | "bank_statement" | "excel_bookings"

type Project = {
  id: string
  name: string
  type?: string
}

type ParsedData = {
  headers: string[]
  rows: any[][]
  data: any[]
}

export function IngestionImport() {
  const [importType, setImportType] = useState<ImportType>("csv_transactions")
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    imported: number
    skipped: number
    error?: string
  } | null>(null)

  // Load projects
  useEffect(() => {
    async function loadProjects() {
      try {
        const projectsList = await getProjects()
        setProjects(projectsList)
      } catch (error) {
        console.error("Error loading projects:", error)
      }
    }
    loadProjects()
  }, [])

  // Reset state when import type changes
  useEffect(() => {
    setFile(null)
    setParsedData(null)
    setResult(null)
  }, [importType])

  // Parse CSV with auto-detect separator
  const parseCSV = (text: string): { headers: string[]; rows: any[][] } => {
    const lines = text.split("\n").filter(line => line.trim())
    if (lines.length === 0) {
      return { headers: [], rows: [] }
    }

    // Detect separator (comma or semicolon)
    const firstLine = lines[0]
    const commaCount = (firstLine.match(/,/g) || []).length
    const semicolonCount = (firstLine.match(/;/g) || []).length
    const separator = semicolonCount > commaCount ? ";" : ","

    // Parse with simple split (handle quoted fields)
    const parseRow = (line: string): string[] => {
      const result: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === separator && !inQuotes) {
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseRow(lines[0])
    const rows = lines.slice(1).map(parseRow)

    return { headers, rows }
  }

  // Parse Excel
  const parseExcel = (buffer: ArrayBuffer): { headers: string[]; rows: any[][] } => {
    const workbook = XLSX.read(buffer, { type: "array" })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][]

    if (jsonData.length === 0) {
      return { headers: [], rows: [] }
    }

    const headers = jsonData[0].map(h => String(h || ""))
    const rows = jsonData.slice(1)

    return { headers, rows }
  }

  // Map parsed data to transactions
  const mapToTransactions = (parsed: ParsedData): NewTransaction[] => {
    return parsed.data
      .filter(row => row.date && row.description)
      .map(row => ({
        project_id: selectedProject,
        date: row.date,
        description: row.description || "",
        amount: String(parseFloat(row.amount || "0")),
        type: (row.type === "income" ? "income" : "expense") as "income" | "expense",
        category: row.category || null,
        source_file: file?.name || null,
      }))
  }

  // Map parsed data to bookings
  const mapToBookings = (parsed: ParsedData): NewBooking[] => {
    return parsed.data
      .filter(row => row.date && row.venue)
      .map(row => ({
        project_id: selectedProject,
        venue: row.venue || "",
        city: row.city || "",
        country: row.country || "",
        fee: String(parseFloat(row.fee || "0")),
        fee_currency: row.currency || "EUR",
        status: "confirmed" as const,
        show_date: row.date || null,
        notes: row.notes || null,
        contract_id: row.contract_id || null,
        region: row.region || null,
        fee_usd: null,
        artist_name: null,
        event_name: null,
      }))
  }

  // Process file
  const processFile = useCallback(
    async (acceptedFile: File) => {
      setFile(acceptedFile)
      setResult(null)

      try {
        let parsed: { headers: string[]; rows: any[][] }

        if (acceptedFile.name.endsWith(".csv")) {
          const text = await acceptedFile.text()
          parsed = parseCSV(text)
        } else {
          const buffer = await acceptedFile.arrayBuffer()
          parsed = parseExcel(buffer)
        }

        // Map rows to objects based on import type
        let data: any[] = []

        if (importType === "csv_transactions") {
          data = parsed.rows.map(row => ({
            date: row[0] || "",
            description: row[1] || "",
            amount: row[2] || "",
            type: row[3] || "",
            category: row[4] || "",
          }))
        } else if (importType === "bank_statement") {
          // Try to detect columns
          const dateIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("fecha") || h.toLowerCase().includes("date")
          )
          const descIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("descripcion") || h.toLowerCase().includes("description")
          )
          const amountIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("importe") || h.toLowerCase().includes("amount")
          )
          const categoryIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("categoria") || h.toLowerCase().includes("category")
          )

          data = parsed.rows.map(row => ({
            date: row[dateIdx] || row[0] || "",
            description: row[descIdx] || row[1] || "",
            amount: row[amountIdx] || row[2] || "",
            type: "expense",
            category: row[categoryIdx] || row[3] || "other",
          }))
        } else if (importType === "excel_bookings") {
          const dateIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("fecha") || h.toLowerCase().includes("date")
          )
          const venueIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("venue") || h.toLowerCase().includes("local")
          )
          const cityIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("ciudad") || h.toLowerCase().includes("city")
          )
          const countryIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("pais") || h.toLowerCase().includes("country")
          )
          const feeIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("fee") || h.toLowerCase().includes("precio")
          )
          const currencyIdx = parsed.headers.findIndex(h =>
            h.toLowerCase().includes("currency") || h.toLowerCase().includes("moneda")
          )

          data = parsed.rows.map(row => ({
            date: row[dateIdx] || row[0] || "",
            venue: row[venueIdx] || row[1] || "",
            city: row[cityIdx] || row[2] || "",
            country: row[countryIdx] || row[3] || "",
            fee: row[feeIdx] || row[4] || "",
            currency: row[currencyIdx] || row[5] || "EUR",
            contract_id: row[6] || null,
            region: row[7] || null,
            notes: row[8] || null,
          }))
        }

        setParsedData({ headers: parsed.headers, rows: parsed.rows, data })
      } catch (error) {
        console.error("Error processing file:", error)
        setResult({
          imported: 0,
          skipped: 0,
          error: "Error al procesar el archivo",
        })
      }
    },
    [importType]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0])
      }
    },
    [processFile]
  )

  const acceptedFileTypes = {
    csv_transactions: { "text/csv": [".csv"] },
    bank_statement: { "text/csv": [".csv"], "application/vnd.ms-excel": [".xls", ".xlsx"] },
    excel_bookings: { "application/vnd.ms-excel": [".xls", ".xlsx"] },
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes[importType],
    multiple: false,
  })

  // Handle import
  const handleImport = async () => {
    if (!parsedData || !selectedProject || !file) return

    setIsProcessing(true)
    setResult(null)

    try {
      let sourceType: ImportSourceType
      let importResult: { imported: number; skipped: number }

      if (importType === "csv_transactions") {
        sourceType = "csv_manual"
        const transactions = mapToTransactions(parsedData)

        const importRecord = await createImportRecord({
          source_type: sourceType,
          source_name: file.name,
          triggered_by: "manual",
        })

        importResult = await createManyTransactionsDedup(transactions, selectedProject)

        if (importRecord) {
          await completeImportRecord(importRecord.id, {
            rows_imported: importResult.imported,
            rows_skipped: importResult.skipped,
          })
        }
      } else if (importType === "bank_statement") {
        sourceType = "bank_csv"
        const transactions = mapToTransactions(parsedData)

        const importRecord = await createImportRecord({
          source_type: sourceType,
          source_name: file.name,
          triggered_by: "manual",
        })

        importResult = await createManyTransactionsDedup(transactions, selectedProject)

        if (importRecord) {
          await completeImportRecord(importRecord.id, {
            rows_imported: importResult.imported,
            rows_skipped: importResult.skipped,
          })
        }
      } else {
        // excel_bookings
        sourceType = "excel_bookings"
        const bookings = mapToBookings(parsedData)

        const importRecord = await createImportRecord({
          source_type: sourceType,
          source_name: file.name,
          triggered_by: "manual",
        })

        importResult = await createManyBookings(bookings, true)

        if (importRecord) {
          await completeImportRecord(importRecord.id, {
            rows_imported: importResult.imported,
            rows_skipped: importResult.skipped,
          })
        }
      }

      setResult(importResult)
    } catch (error) {
      console.error("Error importing:", error)
      setResult({
        imported: 0,
        skipped: 0,
        error: error instanceof Error ? error.message : "Error al importar",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Import type selector */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de importación</CardTitle>
          <CardDescription>Selecciona el tipo de archivo a importar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={importType === "csv_transactions" ? "default" : "outline"}
              onClick={() => setImportType("csv_transactions")}
            >
              CSV Transacciones
            </Button>
            <Button
              variant={importType === "bank_statement" ? "default" : "outline"}
              onClick={() => setImportType("bank_statement")}
            >
              Extracto Bancario
            </Button>
            <Button
              variant={importType === "excel_bookings" ? "default" : "outline"}
              onClick={() => setImportType("excel_bookings")}
            >
              Excel Bookings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Project selector */}
      <Card>
        <CardHeader>
          <CardTitle>Proyecto</CardTitle>
          <CardDescription>Selecciona el proyecto al que importar</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar proyecto..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                  {project.type && (
                    <Badge variant="outline" className="ml-2">
                      {project.type}
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* File upload */}
      <Card>
        <CardHeader>
          <CardTitle>Archivo</CardTitle>
          <CardDescription>
            {importType === "csv_transactions" && "Sube un archivo CSV con transacciones"}
            {importType === "bank_statement" && "Sube un extracto bancario (CSV o Excel)"}
            {importType === "excel_bookings" && "Sube un archivo Excel con bookings"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary"
            }`}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg">Suelta el archivo aquí...</p>
            ) : (
              <>
                <p className="text-lg mb-2">Arrastra un archivo o haz clic para seleccionar</p>
                <p className="text-sm text-gray-500">
                  {importType === "csv_transactions" && "Archivos CSV"}
                  {importType === "bank_statement" && "Archivos CSV o Excel"}
                  {importType === "excel_bookings" && "Archivos Excel"}
                </p>
              </>
            )}
          </div>
          {file && (
            <div className="mt-4 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="text-sm font-medium">{file.name}</span>
              <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {parsedData && parsedData.rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vista previa</CardTitle>
            <CardDescription>
              Mostrando {Math.min(20, parsedData.rows.length)} de {parsedData.rows.length} filas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {parsedData.headers.map((header, idx) => (
                      <TableHead key={idx}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.rows.slice(0, 20).map((row, rowIdx) => (
                    <TableRow key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <TableCell key={cellIdx} className="max-w-xs truncate">
                          {String(cell || "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import button */}
      {parsedData && (
        <div className="flex justify-end gap-4">
          <Button
            onClick={handleImport}
            disabled={!selectedProject || isProcessing}
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar {parsedData.rows.length} filas
              </>
            )}
          </Button>
        </div>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardContent className="pt-6">
            {result.error ? (
              <div className="flex items-start gap-3 text-red-600">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">Error en la importación</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-green-600">
                <Check className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">Importación completada</p>
                  <p className="text-sm">
                    {result.imported} filas importadas, {result.skipped} duplicadas omitidas
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
