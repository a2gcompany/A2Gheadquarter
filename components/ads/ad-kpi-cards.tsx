"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DollarSign, TrendingUp, BarChart3, ShoppingCart } from "lucide-react"

interface AdKPICardsProps {
  spend: number
  revenue: number
  roas: number
  cpp: number
  avgSpendPerDay: number
  purchases: number
  aov: number
  impressions: number
  ctr: number
  days: number
}

function formatNum(n: number, decimals = 2): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toFixed(decimals)
}

function formatUSD(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function AdKPICards({
  spend,
  revenue,
  roas,
  cpp,
  avgSpendPerDay,
  purchases,
  aov,
  impressions,
  ctr,
  days,
}: AdKPICardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* GASTO TOTAL */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Gasto Total
              </p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {formatUSD(spend)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatUSD(avgSpendPerDay)}/dia promedio
                {days > 0 && ` · ${days}d`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* INGRESOS */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ingresos
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {formatUSD(revenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {purchases} compras · AOV {formatUSD(aov)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROAS GLOBAL */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "p-2.5 rounded-lg",
                roas >= 1.0 ? "bg-cyan-500/10" : "bg-red-500/10"
              )}
            >
              <BarChart3
                className={cn(
                  "h-5 w-5",
                  roas >= 1.0 ? "text-cyan-400" : "text-red-400"
                )}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ROAS Global
              </p>
              <p
                className={cn(
                  "text-2xl font-bold mt-1",
                  roas >= 1.0 ? "text-cyan-400" : "text-red-400"
                )}
              >
                {roas.toFixed(2)}x
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                breakeven = 1.0x
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CPP */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-violet-500/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                CPP
              </p>
              <p className="text-2xl font-bold text-violet-400 mt-1">
                {formatUSD(cpp)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNum(impressions, 0)} impresiones · CTR {ctr.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
