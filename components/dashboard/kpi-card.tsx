"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  description?: string
  className?: string
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  description,
  className,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!change) return null
    if (change > 0) return <ArrowUp className="h-4 w-4" />
    if (change < 0) return <ArrowDown className="h-4 w-4" />
    return null
  }

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground"
    if (trend === "up" || (change > 0 && !trend)) return "text-green-500"
    if (trend === "down" || (change < 0 && !trend)) return "text-red-500"
    return "text-muted-foreground"
  }

  return (
    <Card className={cn("glass premium-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm mt-1", getTrendColor())}>
            {getTrendIcon()}
            <span className="font-semibold">
              {change > 0 ? "+" : ""}
              {change}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground ml-1">{changeLabel}</span>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
