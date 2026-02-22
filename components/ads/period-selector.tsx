"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Period = "7d" | "30d" | "90d" | "all"

interface PeriodSelectorProps {
  value: Period
  onChange: (period: Period) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const options: { label: string; value: Period }[] = [
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "90d", value: "90d" },
    { label: "Todo", value: "all" },
  ]
  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-3 text-xs",
            value === opt.value && "bg-background shadow-sm"
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}

export function periodToDates(period: Period): { from: string; to: string } {
  const to = new Date().toISOString().slice(0, 10)
  const msPerDay = 86400000
  let from: string
  switch (period) {
    case "7d":
      from = new Date(Date.now() - 7 * msPerDay).toISOString().slice(0, 10)
      break
    case "30d":
      from = new Date(Date.now() - 30 * msPerDay).toISOString().slice(0, 10)
      break
    case "90d":
      from = new Date(Date.now() - 90 * msPerDay).toISOString().slice(0, 10)
      break
    case "all":
      from = "2020-01-01"
      break
  }
  return { from, to }
}
