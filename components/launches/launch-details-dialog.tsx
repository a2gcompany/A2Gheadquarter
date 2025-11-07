"use client"

import { Launch } from "@/lib/types/launches"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, MapPinIcon, RocketIcon, GlobeIcon, InfoIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Image from "next/image"

interface LaunchDetailsDialogProps {
  launch: Launch | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LaunchDetailsDialog({ launch, open, onOpenChange }: LaunchDetailsDialogProps) {
  if (!launch) return null

  const launchDate = new Date(launch.net)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{launch.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {launch.rocket.configuration.full_name}
              </DialogDescription>
            </div>
            <Badge className="bg-blue-500">{launch.status.name}</Badge>
          </div>
        </DialogHeader>

        {launch.image && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={launch.image}
              alt={launch.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="mission">Misión</TabsTrigger>
            <TabsTrigger value="rocket">Cohete</TabsTrigger>
            <TabsTrigger value="updates">Actualizaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha de Lanzamiento</p>
                  <p className="text-sm text-muted-foreground">
                    {format(launchDate, "PPP 'a las' p", { locale: es })}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <MapPinIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ubicación</p>
                  <p className="text-sm text-muted-foreground">{launch.pad.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {launch.pad.location.name}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <RocketIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Proveedor</p>
                  <p className="text-sm text-muted-foreground">
                    {launch.launch_service_provider.name}
                  </p>
                </div>
              </div>

              {launch.probability !== null && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <InfoIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Probabilidad de Éxito</p>
                      <p className="text-sm text-muted-foreground">{launch.probability}%</p>
                    </div>
                  </div>
                </>
              )}

              {launch.webcast_live && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <GlobeIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Transmisión en Vivo</p>
                      <p className="text-sm text-green-600">Disponible</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mission" className="space-y-4">
            {launch.mission ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{launch.mission.name}</h3>
                  <Badge variant="outline" className="mt-2">
                    {launch.mission.type}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Descripción</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {launch.mission.description}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Órbita</p>
                  <p className="text-sm text-muted-foreground">
                    {launch.mission.orbit.name} ({launch.mission.orbit.abbrev})
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay información de misión disponible.
              </p>
            )}
          </TabsContent>

          <TabsContent value="rocket" className="space-y-4">
            <div className="space-y-4">
              {launch.rocket.configuration.image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={launch.rocket.configuration.image_url}
                    alt={launch.rocket.configuration.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">
                  {launch.rocket.configuration.full_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Familia: {launch.rocket.configuration.family}
                </p>
                {launch.rocket.configuration.variant && (
                  <p className="text-sm text-muted-foreground">
                    Variante: {launch.rocket.configuration.variant}
                  </p>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Descripción</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {launch.rocket.configuration.description}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            {launch.updates && launch.updates.length > 0 ? (
              <div className="space-y-4">
                {launch.updates.map((update) => (
                  <div key={update.id} className="space-y-2">
                    <p className="text-sm font-medium">
                      {format(new Date(update.created_on), "PPP", { locale: es })}
                    </p>
                    <p className="text-sm text-muted-foreground">{update.comment}</p>
                    <Separator />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay actualizaciones disponibles.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
