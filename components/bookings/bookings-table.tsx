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
import { Trash2, Search, MoreHorizontal, Edit, MapPin } from "lucide-react"
import { deleteBooking, type Booking } from "@/src/actions/bookings"

type BookingStatus = "negotiating" | "confirmed" | "contracted" | "completed" | "cancelled"
import { cn } from "@/lib/utils"

type BookingWithProject = Booking & { projectName: string }

interface BookingsTableProps {
  bookings: BookingWithProject[]
  onRefresh?: () => void
  onEdit?: (booking: Booking) => void
}

const statusConfig: Record<BookingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  negotiating: { label: "Negociando", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  contracted: { label: "Contratado", variant: "outline" },
  completed: { label: "Completado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
}

export function BookingsTable({ bookings, onRefresh, onEdit }: BookingsTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch = search === "" ||
        b.venue.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase()) ||
        b.country.toLowerCase().includes(search.toLowerCase()) ||
        b.projectName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, search, statusFilter])

  const handleDelete = async (id: string) => {
    if (confirm("Eliminar este booking?")) {
      await deleteBooking(id)
      onRefresh?.()
    }
  }

  const formatFee = (fee: string | null, currency: string | null) => {
    if (!fee) return "-"
    const num = parseFloat(fee)
    return `${num.toLocaleString("es-ES")} ${currency || "EUR"}`
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay bookings registrados</p>
        <p className="text-sm mt-1">Crea tu primer booking para comenzar</p>
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
            placeholder="Buscar por venue, ciudad o artista..."
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
            <SelectItem value="negotiating">Negociando</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="contracted">Contratado</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} de {bookings.length} bookings
      </p>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Fecha</TableHead>
                <TableHead>Artista</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead className="w-[150px]">Ubicacion</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="w-[100px] text-right">Fee</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((booking) => {
                const config = statusConfig[booking.status]
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">
                      {booking.show_date || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.projectName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.venue}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {booking.city}, {booking.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className={cn(
                        booking.status === "completed" && "bg-emerald-500 hover:bg-emerald-600"
                      )}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatFee(booking.fee, booking.fee_currency)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit?.(booking)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(booking.id)}
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
