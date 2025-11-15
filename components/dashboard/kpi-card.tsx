"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  trend?: "up" | "down"
}

export function KPICard({ title, value, change, changeLabel, icon, trend }: KPICardProps) {
  return (
    <Card className="glass hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {trend === "up" && <ArrowUp className="h-3 w-3 text-green-500" />}
            {trend === "down" && <ArrowDown className="h-3 w-3 text-red-500" />}
            <span className={cn(
              trend === "up" && "text-green-500",
              trend === "down" && "text-red-500"
            )}>
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
            </span>
            {changeLabel && <span>{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
