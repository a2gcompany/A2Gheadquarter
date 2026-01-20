"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trash2, Search, MoreHorizontal, Eye, Edit } from "lucide-react"
import { type Release, type ReleaseStatus } from "@/src/db/schema"
import { deleteRelease } from "@/src/actions/releases"
import { cn } from "@/lib/utils"

type ReleaseWithProject = Release & { projectName: string }

interface ReleasesTableProps {
  releases: ReleaseWithProject[]
  onRefresh?: () => void
  onEdit?: (release: Release) => void
  onViewLabels?: (release: Release) => void
}

const statusConfig: Record<ReleaseStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Borrador", variant: "secondary" },
  shopping: { label: "Buscando Label", variant: "default" },
  accepted: { label: "Aceptado", variant: "outline" },
  released: { label: "Lanzado", variant: "default" },
}

export function ReleasesTable({ releases, onRefresh, onEdit, onViewLabels }: ReleasesTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return releases.filter((r) => {
      const matchesSearch = search === "" ||
        r.trackName.toLowerCase().includes(search.toLowerCase()) ||
        r.projectName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [releases, search, statusFilter])

  const handleDelete = async (id: string) => {
    if (confirm("Eliminar este release?")) {
      await deleteRelease(id)
      onRefresh?.()
    }
  }

  if (releases.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay releases registrados</p>
        <p className="text-sm mt-1">Crea tu primer release para comenzar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por track o artista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="shopping">Buscando Label</SelectItem>
            <SelectItem value="accepted">Aceptado</SelectItem>
            <SelectItem value="released">Lanzado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} de {releases.length} releases
      </p>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track</TableHead>
                <TableHead className="w-[150px]">Artista</TableHead>
                <TableHead className="w-[140px]">Estado</TableHead>
                <TableHead className="w-[100px]">Labels</TableHead>
                <TableHead className="w-[110px]">Fecha Release</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((release) => {
                const labelsCount = (release.labelsContacted || []).length
                const config = statusConfig[release.status]
                return (
                  <TableRow key={release.id}>
                    <TableCell className="font-medium">
                      {release.trackName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {release.projectName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className={cn(
                        release.status === "released" && "bg-emerald-500 hover:bg-emerald-600"
                      )}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {labelsCount > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => onViewLabels?.(release)}
                        >
                          {labelsCount} label{labelsCount > 1 ? "s" : ""}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {release.releaseDate || "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(release)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewLabels?.(release)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Labels
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(release.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
