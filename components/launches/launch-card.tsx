"use client"

import { Launch } from "@/lib/types/launches"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, RocketIcon, ClockIcon } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"

interface LaunchCardProps {
  launch: Launch
  onClick?: () => void
}

export function LaunchCard({ launch, onClick }: LaunchCardProps) {
  const launchDate = new Date(launch.net)
  const isUpcoming = launchDate > new Date()

  const getStatusColor = (statusAbbrev: string) => {
    switch (statusAbbrev) {
      case "Success":
        return "bg-green-500"
      case "Failure":
        return "bg-red-500"
      case "Go":
        return "bg-blue-500"
      case "TBD":
        return "bg-yellow-500"
      case "Hold":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {launch.image && (
        <div className="relative w-full h-48">
          <Image
            src={launch.image}
            alt={launch.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{launch.name}</CardTitle>
          <Badge className={getStatusColor(launch.status.abbrev)}>
            {launch.status.abbrev}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <RocketIcon className="w-4 h-4" />
          {launch.rocket.configuration.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span>{format(launchDate, "PPP 'a las' p", { locale: es })}</span>
        </div>

        {isUpcoming && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <ClockIcon className="w-4 h-4" />
            <span>
              {formatDistanceToNow(launchDate, {
                addSuffix: true,
                locale: es
              })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <MapPinIcon className="w-4 h-4 text-muted-foreground" />
          <span className="truncate">
            {launch.pad.location.name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{launch.launch_service_provider.name}</span>
        </div>

        {launch.mission && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {launch.mission.description}
          </p>
        )}

        {launch.probability !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Probabilidad:</span>
            <Badge variant="outline">{launch.probability}%</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
