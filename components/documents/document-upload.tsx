"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
  companyId: string
  onUploadComplete?: (document: any) => void
}

interface UploadingFile {
  file: File
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
  documentId?: string
}

export function DocumentUpload({ companyId, onUploadComplete }: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  // Validar que hay una empresa seleccionada
  if (companyId === "all") {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
        <p className="text-lg font-semibold mb-2">Selecciona una empresa específica</p>
        <p className="text-sm text-muted-foreground">
          Para subir documentos, primero selecciona una empresa en el selector de arriba
          (A2G, Roger Sanchez, Audesign, etc.)
        </p>
      </div>
    )
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        // Add file to uploading list
        setUploadingFiles((prev) => [
          ...prev,
          { file, status: "uploading", progress: 0 },
        ])

        try {
          // Create FormData
          const formData = new FormData()
          formData.append("file", file)
          formData.append("companyId", companyId)

          // Upload file
          const response = await fetch("/api/documents/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          const result = await response.json()

          // Update status to processing
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? {
                    ...f,
                    status: "processing",
                    progress: 50,
                    documentId: result.document.id,
                  }
                : f
            )
          )

          // Poll for completion (in real app, use websockets or SSE)
          let completed = false
          let attempts = 0
          const maxAttempts = 30

          while (!completed && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            attempts++

            // Check document status
            // In a real app, you'd query the database here
            // For now, simulate completion after a few attempts
            if (attempts > 3) {
              completed = true
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.file === file
                    ? { ...f, status: "completed", progress: 100 }
                    : f
                )
              )

              if (onUploadComplete) {
                onUploadComplete(result.document)
              }
            }
          }

          if (!completed) {
            throw new Error("Processing timeout")
          }
        } catch (error) {
          console.error("Upload error:", error)
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? {
                    ...f,
                    status: "error",
                    error: error instanceof Error ? error.message : "Upload failed",
                  }
                : f
            )
          )
        }
      }
    },
    [companyId, onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxSize: 10485760, // 10MB
  })

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file))
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Subir Documentos</CardTitle>
        <CardDescription>
          Arrastra archivos o haz clic para seleccionar. La IA los analizará automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm">Suelta los archivos aquí...</p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, Excel, CSV, Imágenes (máx. 10MB)
              </p>
            </>
          )}
        </div>

        {uploadingFiles.length > 0 && (
          <div className="space-y-3">
            {uploadingFiles.map((uploadingFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {uploadingFile.status === "uploading" && (
                      <>
                        <Progress value={uploadingFile.progress} className="flex-1" />
                        <span className="text-xs text-muted-foreground">
                          Subiendo...
                        </span>
                      </>
                    )}
                    {uploadingFile.status === "processing" && (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs text-muted-foreground">
                          Procesando con IA...
                        </span>
                      </>
                    )}
                    {uploadingFile.status === "completed" && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-500">Completado</span>
                      </>
                    )}
                    {uploadingFile.status === "error" && (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-500">
                          {uploadingFile.error || "Error"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {(uploadingFile.status === "completed" ||
                  uploadingFile.status === "error") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(uploadingFile.file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
