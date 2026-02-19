"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Settings, ChevronDown } from "lucide-react"

interface LineConfig {
  dataKey: string
  stroke: string
  name: string
  strokeWidth?: number
  fill?: string
}

interface LineChartProps {
  title: string
  description?: string
  data: any[]
  xDataKey: string
  lines: LineConfig[]
  valueFormatter?: (value: number) => string
  height?: number
  showTimeFilter?: boolean
  showSettings?: boolean
}

export function LineChart({
  title,
  description,
  data,
  xDataKey,
  lines,
  valueFormatter = (value) => value.toString(),
  height = 300,
  showTimeFilter = true,
  showSettings = true,
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
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
    <Card className="bg-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          {showTimeFilter && (
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              Last Month
              <ChevronDown className="h-3 w-3" />
            </Button>
          )}
          {showSettings && (
            <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              {lines.map((line) => (
                <linearGradient
                  key={`gradient-${line.dataKey}`}
                  id={`gradient-${line.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={line.stroke} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={line.stroke} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey={xDataKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={valueFormatter}
              dx={-10}
            />
            <Tooltip
              formatter={(value: number) => [valueFormatter(value), ""]}
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
            {lines.map((line) => (
              <Area
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth || 2}
                fill={`url(#gradient-${line.dataKey})`}
                name={line.name}
                dot={{
                  r: 3,
                  fill: line.stroke,
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 5,
                  fill: line.stroke,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
