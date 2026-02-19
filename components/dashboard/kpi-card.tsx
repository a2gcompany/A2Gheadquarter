"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  icon?: React.ReactNode
  trend?: "up" | "down"
  description?: string
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  description,
}: KPICardProps) {
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
          <div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend === "up"
                ? "bg-emerald-400/10 text-emerald-400"
                : "bg-rose-400/10 text-rose-400"
            )}>
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
