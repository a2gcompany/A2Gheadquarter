"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, FileSpreadsheet, AlertCircle, Check } from "lucide-react"
import { createManyTransactions } from "@/src/actions/transactions"
import { type NewTransaction, type TransactionType } from "@/src/db/schema"
import { cn } from "@/lib/utils"

interface CSVRow {
  date: string
  description: string
  amount: string
  type: string
  category?: string
}

interface CSVImportProps {
  projectId: string
  projectName: string
  onSuccess?: () => void
}

export function CSVImport({ projectId, projectName, onSuccess }: CSVImportProps) {
  const [open, setOpen] = useState(false)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [fileName, setFileName] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) return []

    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim())
    const dateIdx = headers.findIndex((h) => h === "date" || h === "fecha")
    const descIdx = headers.findIndex((h) => h === "description" || h === "descripcion")
    const amountIdx = headers.findIndex((h) => h === "amount" || h === "cantidad" || h === "importe")
    const typeIdx = headers.findIndex((h) => h === "type" || h === "tipo")
    const categoryIdx = headers.findIndex((h) => h === "category" || h === "categoria")

    if (dateIdx === -1 || descIdx === -1 || amountIdx === -1 || typeIdx === -1) {
      throw new Error("CSV debe tener columnas: date, description, amount, type")
    }

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
      return {
        date: values[dateIdx] || "",
        description: values[descIdx] || "",
        amount: values[amountIdx] || "0",
        type: values[typeIdx]?.toLowerCase() || "expense",
        category: categoryIdx !== -1 ? values[categoryIdx] : undefined,
      }
    }).filter((row) => row.date && row.description)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setSuccess(false)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = parseCSV(text)
        if (data.length === 0) {
          setError("No se encontraron datos validos en el CSV")
          return
        }
        setCsvData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al procesar el CSV")
      }
    }
    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  })

  const handleImport = async () => {
    if (csvData.length === 0 || !projectId || projectId === "all") return

    setIsImporting(true)
    setError(null)

    try {
      const transactions: NewTransaction[] = csvData.map((row) => ({
        projectId,
        date: row.date,
        description: row.description,
        amount: row.amount.replace(/[^0-9.-]/g, ""),
        type: (row.type === "income" || row.type === "ingreso" ? "income" : "expense") as TransactionType,
        category: row.category || null,
        sourceFile: fileName,
      }))

      const count = await createManyTransactions(transactions)
      if (count > 0) {
        setSuccess(true)
        setCsvData([])
        setFileName("")
        onSuccess?.()
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
        }, 1500)
      } else {
        setError("No se pudieron importar las transacciones")
      }
    } catch (err) {
      setError("Error al importar transacciones")
    } finally {
      setIsImporting(false)
    }
  }

  const reset = () => {
    setCsvData([])
    setFileName("")
    setError(null)
    setSuccess(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={!projectId || projectId === "all"}>
          <Upload className="h-4 w-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Transacciones</DialogTitle>
          <DialogDescription>
            Importar transacciones a <strong>{projectName}</strong> desde un archivo CSV.
            Formato esperado: date, description, amount, type, category (opcional)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {csvData.length === 0 ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p>Suelta el archivo aqui...</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrastra un archivo CSV aqui o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Columnas: date, description, amount, type, category
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <strong>{csvData.length}</strong> transacciones encontradas en <strong>{fileName}</strong>
                </p>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Cambiar archivo
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[300px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Fecha</TableHead>
                        <TableHead>Descripcion</TableHead>
                        <TableHead className="w-[100px] text-right">Importe</TableHead>
                        <TableHead className="w-[80px]">Tipo</TableHead>
                        <TableHead className="w-[100px]">Categoria</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{row.date}</TableCell>
                          <TableCell className="text-sm truncate max-w-[200px]">{row.description}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {parseFloat(row.amount).toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              row.type === "income" || row.type === "ingreso"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-rose-500/10 text-rose-500"
                            )}>
                              {row.type === "income" || row.type === "ingreso" ? "Ingreso" : "Gasto"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{row.category || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {csvData.length > 50 && (
                  <p className="text-xs text-muted-foreground p-2 border-t text-center">
                    Mostrando 50 de {csvData.length} transacciones
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm mt-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-emerald-500 text-sm mt-4">
              <Check className="h-4 w-4" />
              Transacciones importadas correctamente
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={csvData.length === 0 || isImporting}
          >
            {isImporting ? "Importando..." : `Importar ${csvData.length} transacciones`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
