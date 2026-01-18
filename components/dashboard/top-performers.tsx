"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, MoreHorizontal, Star, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Performer {
  id: string
  name: string
  score: number
  avatar?: string
  color: string
}

interface TopPerformersProps {
  performers?: Performer[]
  className?: string
}

const defaultPerformers: Performer[] = [
  { id: "1", name: "Alex", score: 120, color: "bg-emerald-500" },
  { id: "2", name: "Jordan", score: 60, color: "bg-violet-500" },
  { id: "3", name: "Sam", score: 45, color: "bg-blue-500" },
  { id: "4", name: "Taylor", score: 21, color: "bg-rose-400" },
  { id: "5", name: "Casey", score: 3, color: "bg-amber-500" },
]

export function TopPerformers({ performers = defaultPerformers, className }: TopPerformersProps) {
  return (
    <Card className={cn("bg-card border-border/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Top Performers</CardTitle>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {performers.map((performer, index) => (
          <div
            key={performer.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-white",
              performer.color
            )}>
              {performer.avatar ? (
                <img
                  src={performer.avatar}
                  alt={performer.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {performer.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  )}
                  {index > 0 && (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{performer.score}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
