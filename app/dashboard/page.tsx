"use client"

import { useState } from "react"
import { CompanySelector } from "@/components/dashboard/company-selector"
import { KPICard } from "@/components/dashboard/kpi-card"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Calendar,
  AlertCircle,
  Upload,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

// Mock data
const liquidityData = [
  { month: "Ene", liquidez: 145000, objetivo: 150000 },
  { month: "Feb", liquidez: 152000, objetivo: 150000 },
  { month: "Mar", liquidez: 148000, objetivo: 150000 },
  { month: "Abr", liquidez: 155000, objetivo: 150000 },
  { month: "May", liquidez: 162000, objetivo: 150000 },
  { month: "Jun", liquidez: 158000, objetivo: 150000 },
  { month: "Jul", liquidez: 165000, objetivo: 150000 },
  { month: "Ago", liquidez: 171000, objetivo: 150000 },
  { month: "Sep", liquidez: 168000, objetivo: 150000 },
  { month: "Oct", liquidez: 175000, objetivo: 150000 },
  { month: "Nov", liquidez: 182000, objetivo: 150000 },
  { month: "Dic", liquidez: 189000, objetivo: 150000 },
]

const expensesByCategory = [
  { category: "Marketing", amount: 45000 },
  { category: "Viajes", amount: 32000 },
  { category: "Salarios", amount: 78000 },
  { category: "Tecnología", amount: 21000 },
  { category: "Oficina", amount: 15000 },
  { category: "Legal", amount: 12000 },
]

const revenueByCompany = [
  { company: "A2G", revenue: 125000 },
  { company: "Roger Sanchez", revenue: 89000 },
  { company: "Audesign", revenue: 67000 },
  { company: "S-CORE", revenue: 45000 },
  { company: "TWINYARDS", revenue: 34000 },
  { company: "BÂBEL", revenue: 28000 },
]

export default function DashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState("all")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Command Center
              </h1>
              <p className="text-sm text-muted-foreground">
                Enterprise Business Intelligence Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <CompanySelector
                value={selectedCompany}
                onValueChange={setSelectedCompany}
              />
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Subir Documento
              </Button>
              <Button className="gap-2 bg-gradient-premium">
                <MessageSquare className="h-4 w-4" />
                Chat IA
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* KPIs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <KPICard
            title="Liquidez Total"
            value={formatCurrency(189000, "EUR")}
            change={12.5}
            changeLabel="vs mes anterior"
            icon={<DollarSign className="h-4 w-4" />}
            trend="up"
          />
          <KPICard
            title="Runway"
            value="14.2 meses"
            change={-5.3}
            changeLabel="burn rate actual"
            icon={<Calendar className="h-4 w-4" />}
            trend="down"
          />
          <KPICard
            title="Revenue Mensual"
            value={formatCurrency(45000, "EUR")}
            change={8.2}
            changeLabel="vs objetivo"
            icon={<TrendingUp className="h-4 w-4" />}
            trend="up"
          />
          <KPICard
            title="P&L Mes Actual"
            value={formatCurrency(12500, "EUR")}
            change={15.8}
            changeLabel="margen 28%"
            icon={<Wallet className="h-4 w-4" />}
            trend="up"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <LineChart
            title="Evolución de Liquidez"
            description="Últimos 12 meses"
            data={liquidityData}
            xDataKey="month"
            lines={[
              { dataKey: "liquidez", stroke: "#3b82f6", name: "Liquidez" },
              { dataKey: "objetivo", stroke: "#94a3b8", name: "Objetivo", strokeWidth: 1 },
            ]}
            valueFormatter={(value) => formatCurrency(value, "EUR", "es-ES")}
            height={350}
          />
          <BarChart
            title="Revenue por Empresa"
            description="Mes actual"
            data={revenueByCompany}
            xDataKey="company"
            bars={[
              { dataKey: "revenue", fill: "#3b82f6", name: "Revenue" },
            ]}
            valueFormatter={(value) => formatCurrency(value, "EUR", "es-ES")}
            height={350}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <BarChart
              title="Gastos por Categoría"
              description="Mes actual"
              data={expensesByCategory}
              xDataKey="category"
              bars={[
                { dataKey: "amount", fill: "#f59e0b", name: "Gastos" },
              ]}
              valueFormatter={(value) => formatCurrency(value, "EUR", "es-ES")}
              height={350}
            />
          </div>

          {/* Alerts Sidebar */}
          <div className="glass rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold">Alertas Críticas</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm font-semibold text-orange-500">Pago Pendiente</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Factura #1234 vence en 3 días - €12,500
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm font-semibold text-red-500">Bajo Cashflow</p>
                <p className="text-xs text-muted-foreground mt-1">
                  S-CORE: Proyección negativa en Q4
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-semibold text-blue-500">Revisión Necesaria</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Audesign: ROAS bajó 40% este mes
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm font-semibold text-yellow-500">Documento Procesado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Estado financiero Q3 analizado - Ver insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-lg p-6">
          <h3 className="font-semibold mb-4">Acciones Rápidas</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="justify-start gap-2">
              <Upload className="h-4 w-4" />
              Subir Estado Financiero
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <DollarSign className="h-4 w-4" />
              Registrar Transacción
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <TrendingUp className="h-4 w-4" />
              Ver Proyecciones
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              Consultar IA
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
