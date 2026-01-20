"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Clock, CheckCircle, DollarSign } from "lucide-react"

interface BookingsStatsProps {
  stats: {
    total: number
    negotiating: number
    confirmed: number
    contracted: number
    completed: number
    cancelled: number
    totalRevenue: number
  }
}

export function BookingsStats({ stats }: BookingsStatsProps) {
  const formatRevenue = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return amount.toLocaleString("es-ES")
  }

  const items = [
    {
      label: "Total Bookings",
      value: stats.total.toString(),
      icon: CalendarDays,
      color: "text-primary",
    },
    {
      label: "En Negociacion",
      value: stats.negotiating.toString(),
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "Confirmados",
      value: (stats.confirmed + stats.contracted).toString(),
      icon: CheckCircle,
      color: "text-blue-500",
    },
    {
      label: "Revenue Total",
      value: `${formatRevenue(stats.totalRevenue)} EUR`,
      icon: DollarSign,
      color: "text-emerald-500",
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
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
              <item.icon className={`h-8 w-8 ${item.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
