"use client"

import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/utils"

interface LineChartProps {
  title?: string
  description?: string
  data: any[]
  xDataKey: string
  lines: {
    dataKey: string
    stroke: string
    name: string
    strokeWidth?: number
  }[]
  valueFormatter?: (value: number) => string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
}

export function LineChart({
  title,
  description,
  data,
  xDataKey,
  lines,
  valueFormatter,
  height = 300,
  showLegend = true,
  showGrid = true,
}: LineChartProps) {
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
          <RechartsLineChart data={data}>
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
                            style={{ backgroundColor: item.stroke }}
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
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth || 2}
                name={line.name}
                dot={false}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
