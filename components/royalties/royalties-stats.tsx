"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoyaltiesStatsProps {
  stats: {
    total: number
    pending: number
    invoiced: number
    paid: number
    overdue: number
    disputed: number
    totalPending: number
    totalPaid: number
    totalOverdue: number
  }
}

export function RoyaltiesStats({ stats }: RoyaltiesStatsProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const items = [
    {
      label: "Pendiente de Cobro",
      value: `$${formatCurrency(stats.totalPending)}`,
      sub: `${stats.pending + stats.invoiced} royalties`,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "Cobrado",
      value: `$${formatCurrency(stats.totalPaid)}`,
      sub: `${stats.paid} royalties`,
      icon: CheckCircle,
      color: "text-emerald-500",
    },
    {
      label: "Vencido",
      value: `$${formatCurrency(stats.totalOverdue)}`,
      sub: `${stats.overdue} royalties`,
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      label: "Total Royalties",
      value: stats.total.toString(),
      sub: stats.disputed > 0 ? `${stats.disputed} en disputa` : "registrados",
      icon: DollarSign,
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
