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
  { id: "holding", name: "A2G FZCO", slug: "holding" },
  { id: "talents", name: "A2G Talents", slug: "talents" },
  { id: "audesign", name: "Audesign", slug: "audesign" },
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
