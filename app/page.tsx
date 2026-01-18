"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Building2,
  Receipt,
  Music,
  CalendarDays,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react"
import { getProjects } from "@/src/actions/projects"
import { getAllProjectsPL } from "@/src/actions/transactions"
import { type Project } from "@/src/db/schema"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [projectsData, plData] = await Promise.all([
        getProjects(),
        getAllProjectsPL(),
      ])
      setProjects(projectsData)

      const calculatedTotals = plData.reduce(
        (acc, p) => ({
          income: acc.income + p.income,
          expense: acc.expense + p.expense,
          balance: acc.balance + p.balance,
        }),
        { income: 0, expense: 0, balance: 0 }
      )
      setTotals(calculatedTotals)
      setLoading(false)
    }
    loadData()
  }, [])

  const formatCurrency = (value: number) => {
    return value.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const modules = [
    {
      name: "Contabilidad",
      description: "Gestiona ingresos, gastos y P&L por proyecto",
      icon: <Receipt className="h-6 w-6" />,
      href: "/accounting",
      available: true,
    },
    {
      name: "Releases",
      description: "Gestiona lanzamientos musicales y contactos con sellos",
      icon: <Music className="h-6 w-6" />,
      href: "/releases",
      available: false,
    },
    {
      name: "Bookings",
      description: "Gestiona shows, venues y fees de artistas",
      icon: <CalendarDays className="h-6 w-6" />,
      href: "/bookings",
      available: false,
    },
    {
      name: "Reports",
      description: "Reportes mensuales del equipo por departamento",
      icon: <FileText className="h-6 w-6" />,
      href: "/reports",
      available: false,
    },
  ]

  const artists = projects.filter((p) => p.type === "artist")
  const verticals = projects.filter((p) => p.type === "vertical")

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Proyectos
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {artists.length} artistas, {verticals.length} verticales
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos Totales
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {loading ? "..." : `+${formatCurrency(totals.income)} €`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gastos Totales
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500">
                {loading ? "..." : `-${formatCurrency(totals.expense)} €`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance Total
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                totals.balance >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {loading ? "..." : `${totals.balance >= 0 ? "+" : ""}${formatCurrency(totals.balance)} €`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Modulos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((module) => (
              <Card
                key={module.name}
                className={cn(
                  "bg-card border-border/50 transition-colors",
                  module.available && "hover:border-primary/50 cursor-pointer"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "p-2 rounded-lg",
                      module.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {module.icon}
                    </div>
                    {!module.available && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Proximamente
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{module.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {module.description}
                  </p>
                  {module.available ? (
                    <Link href={module.href}>
                      <Button className="w-full gap-2" size="sm">
                        Acceder
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full" size="sm" variant="outline" disabled>
                      No disponible
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Projects List */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Proyectos Recientes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {projects.slice(0, 6).map((project) => (
                <Link key={project.id} href="/accounting">
                  <Card className="bg-card border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        {project.type === "artist" ? (
                          <Music className="h-4 w-4 text-primary" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm truncate">{project.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
