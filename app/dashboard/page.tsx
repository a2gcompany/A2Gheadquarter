"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { KPICard } from "@/components/dashboard/kpi-card"
import { DocumentsList } from "@/components/documents/documents-list"
import { DocumentUpload } from "@/components/documents/document-upload"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { useKPIs } from "@/lib/hooks/useKPIs"
import { formatCurrency } from "@/lib/utils/currency"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Calendar,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
} from "lucide-react"

export default function DashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState("all")
  const { summary, loading, error } = useKPIs(selectedCompany)

  return (
    <DashboardLayout>
      <DashboardHeader
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KPIs Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Liquidez Total"
                value={summary.liquidez > 0 ? formatCurrency(summary.liquidez, "EUR") : "Sin datos"}
                icon={<DollarSign className="h-4 w-4" />}
                trend="up"
              />
              <KPICard
                title="Runway"
                value={summary.runway > 0 ? `${summary.runway.toFixed(1)} meses` : "Sin datos"}
                icon={<Calendar className="h-4 w-4" />}
                trend="down"
              />
              <KPICard
                title="Revenue Total"
                value={summary.revenue > 0 ? formatCurrency(summary.revenue, "EUR") : "Sin datos"}
                icon={<TrendingUp className="h-4 w-4" />}
                trend="up"
              />
              <KPICard
                title="Profit Total"
                value={summary.profit !== 0 ? formatCurrency(summary.profit, "EUR") : "Sin datos"}
                icon={<Wallet className="h-4 w-4" />}
                trend={summary.profit > 0 ? "up" : "down"}
              />
            </div>

            {/* Charts Grid */}
            {(summary.liquidityData.length > 0 || summary.revenueByCompany.length > 0) && (
              <div className="grid gap-6 lg:grid-cols-2">
                <LineChart
                  title="Evolucion de Liquidez"
                  description="Basado en documentos analizados"
                  data={summary.liquidityData}
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
                  description="Extraido de documentos"
                  data={summary.revenueByCompany}
                  xDataKey="company"
                  bars={[
                    { dataKey: "revenue", fill: "#3b82f6", name: "Revenue" },
                  ]}
                  valueFormatter={(value) => formatCurrency(value, "EUR", "es-ES")}
                  height={350}
                />
              </div>
            )}

            {summary.expensesByCategory.length > 0 && (
              <BarChart
                title="Gastos por Categoria"
                description="Extraido de documentos"
                data={summary.expensesByCategory}
                xDataKey="category"
                bars={[
                  { dataKey: "amount", fill: "#f59e0b", name: "Gastos" },
                ]}
                valueFormatter={(value) => formatCurrency(value, "EUR", "es-ES")}
                height={350}
              />
            )}

            {/* Empty State */}
            {summary.liquidez === 0 && summary.revenue === 0 && (
              <div className="text-center py-12 bg-card border border-border/50 rounded-lg">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay KPIs disponibles</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Sube documentos financieros (estados financieros, P&L, balance sheets, etc.) y la IA extraera automaticamente los KPIs y metricas importantes.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Upload className="h-4 w-4" />
                      Subir Primer Documento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Subir Documento</DialogTitle>
                      <DialogDescription>
                        Sube PDFs, Excel, CSV o imagenes. La IA los analizara automaticamente.
                      </DialogDescription>
                    </DialogHeader>
                    <DocumentUpload companyId={selectedCompany} />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Documents Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentos
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gestiona y analiza tus documentos empresariales
                  </p>
                </div>
              </div>

              <DocumentsList companyId={selectedCompany} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
