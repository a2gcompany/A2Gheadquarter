"use client"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { GitBranch } from "lucide-react"

export default function AudesignDevelopmentPage() {
  return (
    <AppLayout title="Audesign — Desarrollo">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-border/50">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto p-4 bg-emerald-500/10 rounded-full w-fit">
              <GitBranch className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold">Desarrollo</h2>
            <p className="text-muted-foreground text-sm">
              Sprints, velocidad del equipo, bugs y deployments.
              Este panel estara disponible proximamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
