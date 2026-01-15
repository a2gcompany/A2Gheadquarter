'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'

interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
}

type ImportStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

interface ImportResult {
  rowsTotal: number
  rowsImported: number
  rowsFailed: number
  errors: string[]
}

export function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importType, setImportType] = useState<'transactions' | 'balances'>('transactions')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setStatus('idle')
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  })

  const handleImport = async () => {
    if (!file) return

    setStatus('uploading')

    // Simulate upload and processing
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setStatus('processing')

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate result
    setResult({
      rowsTotal: 145,
      rowsImported: 142,
      rowsFailed: 3,
      errors: [
        'Fila 23: Formato de fecha invalido',
        'Fila 67: Monto no numerico',
        'Fila 89: Categoria desconocida',
      ],
    })
    setStatus('success')
  }

  const handleClose = () => {
    setFile(null)
    setStatus('idle')
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Importar CSV</DialogTitle>
          <DialogDescription className="text-slate-400">
            Importa transacciones o balances desde un archivo CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Import Type Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setImportType('transactions')}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                importType === 'transactions'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              )}
            >
              Transacciones
            </button>
            <button
              onClick={() => setImportType('balances')}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                importType === 'balances'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              )}
            >
              Balances
            </button>
          </div>

          {/* Dropzone */}
          {status === 'idle' && (
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              )}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-green-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">
                    Arrastra tu archivo CSV aqui
                  </p>
                  <p className="text-sm text-slate-400">
                    o haz click para seleccionar
                  </p>
                </>
              )}
            </div>
          )}

          {/* Processing Status */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="text-center py-8">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">
                {status === 'uploading' ? 'Subiendo archivo...' : 'Procesando datos...'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Esto puede tardar unos segundos
              </p>
            </div>
          )}

          {/* Success Result */}
          {status === 'success' && result && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-white font-medium text-lg">Importacion completada</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-white">{result.rowsTotal}</p>
                  <p className="text-xs text-slate-400">Total filas</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-400">{result.rowsImported}</p>
                  <p className="text-xs text-slate-400">Importadas</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-2xl font-bold text-red-400">{result.rowsFailed}</p>
                  <p className="text-xs text-slate-400">Errores</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-sm font-medium text-red-400">Errores encontrados</p>
                  </div>
                  <ul className="text-sm text-slate-400 space-y-1">
                    {result.errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {status === 'success' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {status === 'idle' && (
              <Button
                onClick={handleImport}
                disabled={!file}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Importar
              </Button>
            )}
            {status === 'success' && (
              <Button
                onClick={() => {
                  setFile(null)
                  setStatus('idle')
                  setResult(null)
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Importar otro
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
