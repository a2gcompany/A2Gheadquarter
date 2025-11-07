"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RocketIcon } from "lucide-react"

interface LaunchCountdownProps {
  launchDate: Date
  launchName: string
  rocketName: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function LaunchCountdown({ launchDate, launchName, rocketName }: LaunchCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now

      if (distance < 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        }
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      }
    }

    setTimeRemaining(calculateTimeRemaining())

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(interval)
  }, [launchDate])

  const isLaunched = timeRemaining.days === 0 &&
                     timeRemaining.hours === 0 &&
                     timeRemaining.minutes === 0 &&
                     timeRemaining.seconds === 0

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RocketIcon className="w-5 h-5" />
            Próximo Lanzamiento
          </CardTitle>
          {!isLaunched && (
            <Badge className="bg-green-500">En Cuenta Regresiva</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold text-lg">{launchName}</p>
          <p className="text-sm text-muted-foreground">{rocketName}</p>
        </div>

        {isLaunched ? (
          <div className="text-center py-4">
            <Badge className="bg-yellow-500 text-lg px-4 py-2">
              ¡Lanzamiento en Curso!
            </Badge>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {timeRemaining.days}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Días</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {String(timeRemaining.hours).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Horas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Min</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground uppercase">Seg</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
