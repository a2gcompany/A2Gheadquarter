"use client"

import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"

interface BarChartProps {
  title?: string
  description?: string
  data: any[]
  xDataKey: string
  bars: {
    dataKey: string
    fill: string
    name: string
  }[]
  valueFormatter?: (value: number) => string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  stacked?: boolean
}

export function BarChart({
  title,
  description,
  data,
  xDataKey,
  bars,
  valueFormatter,
  height = 300,
  showLegend = true,
  showGrid = true,
  stacked = false,
}: BarChartProps) {
  const defaultFormatter = (value: number) => formatNumber(value)

  return (
    <Card className="glass">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />}
            <XAxis
              dataKey={xDataKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={valueFormatter || defaultFormatter}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {payload[0].payload[xDataKey]}
                        </span>
                      </div>
                      {payload.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="text-sm font-semibold">
                            {item.name}: {valueFormatter ? valueFormatter(item.value) : defaultFormatter(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }}
            />
            {showLegend && <Legend />}
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
                stackId={stacked ? "stack" : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
