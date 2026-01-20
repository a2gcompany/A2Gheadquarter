"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileMusic, Radio, CheckCircle, Disc } from "lucide-react"

interface ReleasesStatsProps {
  stats: {
    total: number
    draft: number
    shopping: number
    accepted: number
    released: number
  }
}

export function ReleasesStats({ stats }: ReleasesStatsProps) {
  const items = [
    {
      label: "Total Releases",
      value: stats.total,
      icon: Disc,
      color: "text-primary",
    },
    {
      label: "En Borrador",
      value: stats.draft,
      icon: FileMusic,
      color: "text-muted-foreground",
    },
    {
      label: "Buscando Label",
      value: stats.shopping,
      icon: Radio,
      color: "text-blue-500",
    },
    {
      label: "Lanzados",
      value: stats.released,
      icon: CheckCircle,
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
