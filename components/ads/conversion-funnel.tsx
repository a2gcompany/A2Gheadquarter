"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ConversionFunnelProps {
  impressions: number
  clicks: number
  landingViews: number
  addToCart: number
  checkouts: number
  purchases: number
}

interface FunnelStep {
  label: string
  value: number
  color: string
  bgColor: string
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString("en-US")
}

export function ConversionFunnel({
  impressions,
  clicks,
  landingViews,
  addToCart,
  checkouts,
  purchases,
}: ConversionFunnelProps) {
  const steps: FunnelStep[] = [
    { label: "Impresiones", value: impressions, color: "bg-blue-500", bgColor: "bg-blue-500/15" },
    { label: "Clicks", value: clicks, color: "bg-sky-500", bgColor: "bg-sky-500/15" },
    { label: "Landing Views", value: landingViews, color: "bg-cyan-500", bgColor: "bg-cyan-500/15" },
    { label: "Add to Cart", value: addToCart, color: "bg-amber-500", bgColor: "bg-amber-500/15" },
    { label: "Checkout", value: checkouts, color: "bg-orange-500", bgColor: "bg-orange-500/15" },
    { label: "Compras", value: purchases, color: "bg-emerald-500", bgColor: "bg-emerald-500/15" },
  ]

  const maxValue = Math.max(...steps.map((s) => s.value), 1)

  // Calculate drop percentages and find biggest drop
  const drops: { rate: number; index: number }[] = []
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1].value
    const dropRate = prev > 0 ? ((prev - steps[i].value) / prev) * 100 : 0
    drops.push({ rate: dropRate, index: i })
  }

  const biggestDropIdx =
    drops.length > 0
      ? drops.reduce((max, d) => (d.rate > max.rate ? d : max), drops[0]).index
      : -1

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          Funnel de Conversion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, i) => {
            const widthPct = maxValue > 0 ? (step.value / maxValue) * 100 : 0
            const prevValue = i > 0 ? steps[i - 1].value : null
            const conversionFromPrev =
              prevValue && prevValue > 0
                ? ((step.value / prevValue) * 100).toFixed(1)
                : null
            const isBiggestDrop = i === biggestDropIdx

            return (
              <div key={step.label} className="group">
                <div className="flex items-center gap-3">
                  {/* Label */}
                  <div className="w-28 shrink-0 text-right">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isBiggestDrop
                          ? "text-red-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 relative">
                    <div className={cn("h-8 rounded-md", step.bgColor)}>
                      <div
                        className={cn(
                          "h-full rounded-md transition-all duration-500",
                          step.color,
                          isBiggestDrop && "ring-1 ring-red-400/50"
                        )}
                        style={{ width: `${Math.max(widthPct, 2)}%` }}
                      />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="w-16 shrink-0 text-right">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatNum(step.value)}
                    </span>
                  </div>

                  {/* Percentage */}
                  <div className="w-16 shrink-0 text-right">
                    {conversionFromPrev ? (
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isBiggestDrop
                            ? "text-red-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {conversionFromPrev}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        base
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Overall conversion */}
        <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Conversion total (Impresiones → Compras)
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {impressions > 0
              ? ((purchases / impressions) * 100).toFixed(3)
              : "0.000"}
            %
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
