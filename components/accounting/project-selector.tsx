"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Building2, Music, AlertCircle } from "lucide-react"
import { type Project, type ProjectType } from "@/src/db/schema"
import { createProject } from "@/src/actions/projects"

interface ProjectSelectorProps {
  projects: Project[]
  value: string
  onValueChange: (value: string) => void
  onProjectCreated?: () => void
}

export function ProjectSelector({ projects, value, onValueChange, onProjectCreated }: ProjectSelectorProps) {
  const [open, setOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectType, setNewProjectType] = useState<ProjectType>("vertical")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    setIsCreating(true)
    setError(null)
    try {
      const project = await createProject({
        name: newProjectName.trim(),
        type: newProjectType,
      })
      if (project) {
        // First refresh the projects list, then select the new project
        onProjectCreated?.()
        onValueChange(project.id)
        setNewProjectName("")
        setOpen(false)
      } else {
        setError("Error al crear el proyecto. Verifica la conexión a la base de datos.")
      }
    } catch (error) {
      console.error("Error creating project:", error)
      setError("Error al crear el proyecto. Verifica que DATABASE_URL esté configurado.")
    } finally {
      setIsCreating(false)
    }
  }

  const selectedProject = projects.find((p) => p.id === value)

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Seleccionar proyecto">
            {selectedProject && (
              <div className="flex items-center gap-2">
                {selectedProject.type === "artist" ? (
                  <Music className="h-4 w-4 text-primary" />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{selectedProject.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Todos los proyectos</span>
            </div>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center gap-2">
                {project.type === "artist" ? (
                  <Music className="h-4 w-4 text-primary" />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{project.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) setError(null)
      }}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Proyecto</DialogTitle>
            <DialogDescription>
              Crea un nuevo proyecto o artista para gestionar su contabilidad.
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
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Ej: BABEL, A2G Company, etc."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newProjectType === "artist" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setNewProjectType("artist")}
                >
                  <Music className="h-4 w-4 mr-2" />
                  Artista
                </Button>
                <Button
                  type="button"
                  variant={newProjectType === "vertical" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setNewProjectType("vertical")}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Vertical
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProject} disabled={isCreating || !newProjectName.trim()}>
              {isCreating ? "Creando..." : "Crear Proyecto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
