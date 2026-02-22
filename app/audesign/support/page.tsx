"use client"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Headphones } from "lucide-react"

export default function AudesignSupportPage() {
  return (
    <AppLayout title="Audesign — Soporte">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-border/50">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto p-4 bg-amber-500/10 rounded-full w-fit">
              <Headphones className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold">Soporte</h2>
            <p className="text-muted-foreground text-sm">
              Tickets, tiempos de respuesta y satisfaccion del cliente.
              Este panel estara disponible proximamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
