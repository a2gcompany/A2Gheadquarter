"use client"

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BarConfig {
  dataKey: string
  fill: string
  name: string
}

interface BarChartProps {
  title: string
  description?: string
  data: any[]
  xDataKey: string
  bars: BarConfig[]
  valueFormatter?: (value: number) => string
  height?: number
}

export function BarChart({
  title,
  description,
  data,
  xDataKey,
  bars,
  valueFormatter = (value) => value.toString(),
  height = 300,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No hay datos disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
              tickFormatter={valueFormatter}
            />
            <Tooltip
              formatter={valueFormatter}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
