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
import { Trash2, Search, MoreHorizontal, Edit, ExternalLink } from "lucide-react"
import { deleteContract, type Contract } from "@/src/actions/contracts"
import { cn } from "@/lib/utils"

type ContractWithProject = Contract & { projectName: string }

interface ContractsTableProps {
  contracts: ContractWithProject[]
  onRefresh?: () => void
  onEdit?: (contract: Contract) => void
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  negotiating: { label: "Negociando", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
  sent: { label: "Enviado", className: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
  signing: { label: "Firmando", className: "bg-purple-500/20 text-purple-500 border-purple-500/30" },
  active: { label: "Activo", className: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" },
  completed: { label: "Completado", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  terminated: { label: "Terminado", className: "bg-red-500/20 text-red-500 border-red-500/30" },
}

const typeLabels: Record<string, string> = {
  release: "Release",
  management: "Management",
  publishing: "Publishing",
  booking: "Booking",
  licensing: "Licensing",
  other: "Otro",
}

export function ContractsTable({ contracts, onRefresh, onEdit }: ContractsTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      const matchesSearch = search === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.counterparty.toLowerCase().includes(search.toLowerCase()) ||
        c.projectName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [contracts, search, statusFilter])

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este contrato?")) {
      await deleteContract(id)
      onRefresh?.()
    }
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay contratos registrados</p>
        <p className="text-sm mt-1">Registra tu primer contrato para comenzar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, contraparte o artista..."
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
            <SelectItem value="negotiating">Negociando</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="signing">Firmando</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="terminated">Terminado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} de {contracts.length} contratos
      </p>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="w-[120px]">Artista</TableHead>
                <TableHead className="w-[140px]">Contraparte</TableHead>
                <TableHead className="w-[90px]">Tipo</TableHead>
                <TableHead className="w-[110px]">Estado</TableHead>
                <TableHead className="w-[100px] text-right">Valor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((contract) => {
                const config = statusConfig[contract.status] || statusConfig.draft
                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {contract.title}
                        {contract.document_url && (
                          <a href={contract.document_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{contract.projectName}</TableCell>
                    <TableCell className="text-muted-foreground">{contract.counterparty}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {typeLabels[contract.contract_type] || contract.contract_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border", config.className)}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {contract.value ? `$${Number(contract.value).toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(contract)}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(contract.id)}
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
