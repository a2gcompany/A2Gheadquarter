"use client"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"

export default function AudesignProductPage() {
  return (
    <AppLayout title="Audesign — Producto">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-border/50">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto p-4 bg-blue-500/10 rounded-full w-fit">
              <Package className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold">Producto</h2>
            <p className="text-muted-foreground text-sm">
              Features, roadmap, bugs y metricas de producto.
              Este panel estara disponible proximamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
