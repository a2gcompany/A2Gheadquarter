"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchIcon, FilterIcon } from "lucide-react"

interface LaunchFiltersProps {
  onSearchChange: (search: string) => void
  onStatusChange: (status: string) => void
  searchValue: string
  statusValue: string
}

export function LaunchFilters({
  onSearchChange,
  onStatusChange,
  searchValue,
  statusValue
}: LaunchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar lanzamientos..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={statusValue} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <FilterIcon className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="1">Go para Lanzamiento</SelectItem>
          <SelectItem value="2">En Espera (TBD)</SelectItem>
          <SelectItem value="3">Exitosos</SelectItem>
          <SelectItem value="4">Fallidos</SelectItem>
          <SelectItem value="6">En Vuelo</SelectItem>
          <SelectItem value="7">Parcialmente Exitosos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
