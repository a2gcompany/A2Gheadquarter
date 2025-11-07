"use client"

import { Building2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const companies = [
  { id: "all", name: "TODAS LAS EMPRESAS", slug: "all" },
  { id: "a2g", name: "A2G", slug: "a2g" },
  { id: "roger-sanchez", name: "Roger Sanchez", slug: "roger-sanchez" },
  { id: "audesign", name: "Audesign", slug: "audesign" },
  { id: "s-core", name: "S-CORE", slug: "s-core" },
  { id: "twinyards", name: "TWINYARDS", slug: "twinyards" },
  { id: "babel", name: "BÂBEL", slug: "babel" },
]

interface CompanySelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function CompanySelector({ value, onValueChange }: CompanySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[280px] glass border-primary/20">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder="Selecciona una entidad" />
        </div>
      </SelectTrigger>
      <SelectContent className="glass">
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.slug}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
