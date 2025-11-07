"use client"

import { useDocuments } from "@/lib/hooks/useDocuments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { File, Trash2, Loader2, FileText, Download, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface DocumentsListProps {
  companyId: string
  onDocumentDeleted?: () => void
}

export function DocumentsList({ companyId, onDocumentDeleted }: DocumentsListProps) {
  const { documents, loading, deleteDocument } = useDocuments(companyId)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (documentId: string, filePath: string, filename: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${filename}"?`)) return

    setDeletingId(documentId)
    const result = await deleteDocument(documentId, filePath)

    if (result.success) {
      toast({
        title: "Documento eliminado",
        description: `${filename} fue eliminado correctamente.`,
      })
      onDocumentDeleted?.()
    } else {
      toast({
        title: "Error al eliminar",
        description: result.error,
        variant: "destructive",
      })
    }
    setDeletingId(null)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️"
    if (mimeType.includes("pdf")) return "📄"
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊"
    if (mimeType.includes("csv")) return "📈"
    return "📁"
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      failed: "bg-red-500/10 text-red-500 border-red-500/20",
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: "Pendiente",
      processing: "Procesando...",
      completed: "Completado",
      failed: "Error",
    }
    return texts[status as keyof typeof texts] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-semibold mb-2">No hay documentos</p>
        <p className="text-sm text-muted-foreground">
          Sube tu primer documento usando el botón "Subir Documento"
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="glass hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{getFileIcon(doc.mime_type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{doc.filename}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(doc.processing_status)}`}>
                    {getStatusText(doc.processing_status)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{doc.file_type.toUpperCase()}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(doc.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
                {doc.processing_status === "failed" && doc.processing_error && (
                  <p className="text-xs text-red-500 mt-1">Error: {doc.processing_error}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deletingId === doc.id}
                  onClick={() => handleDelete(doc.id, doc.file_path, doc.filename)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
