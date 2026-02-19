"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Handshake, CheckCircle, PenLine } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContractsStatsProps {
  stats: {
    total: number
    draft: number
    negotiating: number
    sent: number
    signing: number
    active: number
    completed: number
    terminated: number
    totalValue: number
  }
}

export function ContractsStats({ stats }: ContractsStatsProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const items = [
    {
      label: "En Negociación",
      value: (stats.negotiating + stats.sent + stats.signing).toString(),
      sub: `${stats.signing} firmando`,
      icon: PenLine,
      color: "text-blue-500",
    },
    {
      label: "Activos",
      value: stats.active.toString(),
      sub: stats.totalValue > 0 ? `$${formatCurrency(stats.totalValue)} valor` : "sin valor asignado",
      icon: Handshake,
      color: "text-emerald-500",
    },
    {
      label: "Completados",
      value: stats.completed.toString(),
      sub: stats.terminated > 0 ? `${stats.terminated} terminados` : "ejecutados",
      icon: CheckCircle,
      color: "text-muted-foreground",
    },
    {
      label: "Total Contratos",
      value: stats.total.toString(),
      sub: `${stats.draft} borradores`,
      icon: FileText,
      color: "text-primary",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className={cn("text-2xl font-bold", item.color)}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
              </div>
              <item.icon className={cn("h-8 w-8", item.color)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
