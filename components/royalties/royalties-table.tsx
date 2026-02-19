"use client"

import { useState, useMemo } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trash2, Search, MoreHorizontal, Edit } from "lucide-react"
import { deleteRoyalty, type Royalty } from "@/src/actions/royalties"
import { cn } from "@/lib/utils"

type RoyaltyWithProject = Royalty & { projectName: string }

interface RoyaltiesTableProps {
  royalties: RoyaltyWithProject[]
  onRefresh?: () => void
  onEdit?: (royalty: Royalty) => void
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
  invoiced: { label: "Facturado", className: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
  paid: { label: "Cobrado", className: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" },
  overdue: { label: "Vencido", className: "bg-red-500/20 text-red-500 border-red-500/30" },
  disputed: { label: "En Disputa", className: "bg-orange-500/20 text-orange-500 border-orange-500/30" },
}

export function RoyaltiesTable({ royalties, onRefresh, onEdit }: RoyaltiesTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return royalties.filter((r) => {
      const matchesSearch = search === "" ||
        r.track_name.toLowerCase().includes(search.toLowerCase()) ||
        r.source.toLowerCase().includes(search.toLowerCase()) ||
        r.projectName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [royalties, search, statusFilter])

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este royalty?")) {
      await deleteRoyalty(id)
      onRefresh?.()
    }
  }

  const formatAmount = (amount: string, currency: string) => {
    const num = Number(amount)
    const symbol = currency === "EUR" ? "€" : "$"
    return `${symbol}${num.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`
  }

  if (royalties.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay royalties registrados</p>
        <p className="text-sm mt-1">Registra tu primer royalty para comenzar el seguimiento</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por track, fuente o artista..."
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
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="invoiced">Facturado</SelectItem>
            <SelectItem value="paid">Cobrado</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
            <SelectItem value="disputed">En Disputa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} de {royalties.length} royalties
      </p>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track</TableHead>
                <TableHead className="w-[120px]">Artista</TableHead>
                <TableHead className="w-[140px]">Fuente</TableHead>
                <TableHead className="w-[110px] text-right">Monto</TableHead>
                <TableHead className="w-[110px]">Estado</TableHead>
                <TableHead className="w-[100px]">Factura</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((royalty) => {
                const config = statusConfig[royalty.status] || statusConfig.pending
                return (
                  <TableRow key={royalty.id}>
                    <TableCell className="font-medium">{royalty.track_name}</TableCell>
                    <TableCell className="text-muted-foreground">{royalty.projectName}</TableCell>
                    <TableCell className="text-muted-foreground">{royalty.source}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatAmount(royalty.amount, royalty.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border", config.className)}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {royalty.invoice_number || "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(royalty)}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(royalty.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
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
