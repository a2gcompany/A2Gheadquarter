"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Music } from "lucide-react"
import { type Project, type Release, type ReleaseStatus } from "@/src/db/schema"
import { createRelease, updateRelease } from "@/src/actions/releases"

interface ReleaseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  release?: Release | null
  onSuccess?: () => void
}

export function ReleaseForm({ open, onOpenChange, projects, release, onSuccess }: ReleaseFormProps) {
  const isEditing = !!release

  const [projectId, setProjectId] = useState(release?.projectId || "")
  const [trackName, setTrackName] = useState(release?.trackName || "")
  const [status, setStatus] = useState<ReleaseStatus>(release?.status || "draft")
  const [releaseDate, setReleaseDate] = useState(release?.releaseDate || "")
  const [notes, setNotes] = useState(release?.notes || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!projectId || !trackName.trim()) {
      setError("Artista y nombre del track son obligatorios")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (isEditing && release) {
        const updated = await updateRelease(release.id, {
          projectId,
          trackName: trackName.trim(),
          status,
          releaseDate: releaseDate || null,
          notes: notes || null,
        })
        if (!updated) {
          setError("Error al actualizar el release")
          return
        }
      } else {
        const created = await createRelease({
          projectId,
          trackName: trackName.trim(),
          status,
          releaseDate: releaseDate || null,
          notes: notes || null,
        })
        if (!created) {
          setError("Error al crear el release")
          return
        }
      }

      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (err) {
      console.error("Error saving release:", err)
      setError("Error al guardar. Verifica la conexión.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    if (!isEditing) {
      setProjectId("")
      setTrackName("")
      setStatus("draft")
      setReleaseDate("")
      setNotes("")
    }
    setError(null)
  }

  // Update form when release changes (for editing)
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && release) {
      setProjectId(release.projectId)
      setTrackName(release.trackName)
      setStatus(release.status)
      setReleaseDate(release.releaseDate || "")
      setNotes(release.notes || "")
    } else if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  // Filter only artist projects
  const artistProjects = projects.filter((p) => p.type === "artist")

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Release" : "Nuevo Release"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del release"
              : "Registra un nuevo track para gestionar su lanzamiento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="project">Artista</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar artista" />
              </SelectTrigger>
              <SelectContent>
                {artistProjects.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No hay artistas. Crea uno en Contabilidad.
                  </div>
                ) : (
                  artistProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-primary" />
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackName">Nombre del Track</Label>
            <Input
              id="trackName"
              placeholder="Ej: Midnight Dreams"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ReleaseStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="shopping">Buscando Label</SelectItem>
                <SelectItem value="accepted">Aceptado</SelectItem>
                <SelectItem value="released">Lanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="releaseDate">Fecha de Lanzamiento</Label>
            <Input
              id="releaseDate"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !projectId || !trackName.trim()}
          >
            {isSubmitting ? "Guardando..." : isEditing ? "Guardar" : "Crear Release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
