"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TrendDataPoint {
  period: string
  spend: number
  revenue: number
  roas: number
}

interface ROASTrendChartProps {
  trendData: TrendDataPoint[]
  periodRoas: number
  period7dRoas: number
  todayRoas: number
  periodMargin: number
  margin7d: number
  marginToday: number
}

function formatMargin(margin: number): string {
  const sign = margin >= 0 ? "+" : ""
  return `${sign}$${Math.abs(margin).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function RoasStatBox({
  label,
  roas,
  margin,
}: {
  label: string
  roas: number
  margin: number
}) {
  const isPositive = margin >= 0
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-bold mt-1",
          roas >= 1.0 ? "text-emerald-400" : "text-red-400"
        )}
      >
        {roas.toFixed(2)}x
      </p>
      <p
        className={cn(
          "text-xs mt-1 font-medium",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}
      >
        {isPositive ? "Margen" : "Perdida"}: {formatMargin(margin)}
      </p>
    </div>
  )
}

export function ROASTrendChart({
  trendData,
  periodRoas,
  period7dRoas,
  todayRoas,
  periodMargin,
  margin7d,
  marginToday,
}: ROASTrendChartProps) {
  if (trendData.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Tendencia ROAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[280px] text-muted-foreground">
            <p>No hay datos disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          Tendencia ROAS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="roasGradientGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="roasGradientRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                  tickFormatter={(v: number) => `${v.toFixed(1)}x`}
                />
                <ReferenceLine
                  y={1}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="6 4"
                  strokeOpacity={0.7}
                  label={{
                    value: "Breakeven",
                    position: "right",
                    fontSize: 10,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)}x`, "ROAS"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: 500,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="roas"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#roasGradientGreen)"
                  dot={{
                    r: 3,
                    fill: "#10b981",
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 5,
                    fill: "#10b981",
                    strokeWidth: 2,
                    stroke: "hsl(var(--background))",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stat boxes */}
          <div className="flex flex-col gap-3 justify-center">
            <RoasStatBox
              label="ROAS · Periodo"
              roas={periodRoas}
              margin={periodMargin}
            />
            <RoasStatBox
              label="ROAS · 7 Dias"
              roas={period7dRoas}
              margin={margin7d}
            />
            <RoasStatBox
              label="ROAS · Hoy"
              roas={todayRoas}
              margin={marginToday}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
