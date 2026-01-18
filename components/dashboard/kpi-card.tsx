"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Bookmark, MessageSquare, Users, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  trend?: "up" | "down"
  variant?: "default" | "revenue" | "clients" | "leads" | "team"
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  variant = "default"
}: KPICardProps) {
  const trendColor = trend === "up"
    ? "text-emerald-400"
    : trend === "down"
      ? "text-rose-400"
      : "text-muted-foreground"

  const trendBgColor = trend === "up"
    ? "bg-emerald-400/10"
    : trend === "down"
      ? "bg-rose-400/10"
      : "bg-muted"

  return (
    <Card className="bg-card border-border/50 hover:border-border transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="text-muted-foreground/60">
          {icon || <Bookmark className="h-4 w-4" />}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trendBgColor,
              trendColor
            )}>
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              <span>{change > 0 ? "+" : ""}{change}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
