"use client"

import { useState } from "react"
import { CompanySelector } from "@/components/dashboard/company-selector"
import { KPICard } from "@/components/dashboard/kpi-card"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentsList } from "@/components/documents/documents-list"
import { AIChat } from "@/components/chat/ai-chat"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { useKPIs } from "@/lib/hooks/useKPIs"
import { formatCurrency } from "@/lib/utils/currency"
import {
  Upload,
  MessageSquare,
  FileText,
  DollarSign,
  TrendingUp,
  Wallet,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState("all")
  const { summary, loading } = useKPIs(selectedCompany)

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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Subir Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Subir Documento</DialogTitle>
                    <DialogDescription>
                      Sube PDFs, Excel, CSV o imágenes. La IA los analizará automáticamente.
                    </DialogDescription>
                  </DialogHeader>
                  <DocumentUpload companyId={selectedCompany} />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-premium">
                    <MessageSquare className="h-4 w-4" />
                    Chat IA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Chat con IA</DialogTitle>
                    <DialogDescription>
                      Pregunta sobre tus datos financieros, métricas y KPIs.
                    </DialogDescription>
                  </DialogHeader>
                  <AIChat companyId={selectedCompany} userId="demo-user" />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KPIs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
              <div className="grid gap-6 lg:grid-cols-2 mb-8">
                <LineChart
                  title="Evolución de Liquidez"
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
                  description="Extraído de documentos"
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
              <div className="mb-8">
                <BarChart
                  title="Gastos por Categoría"
                  description="Extraído de documentos"
                  data={summary.expensesByCategory}
                  xDataKey="category"
                  bars={[
                    { dataKey: "amount", fill: "#f59e0b", name: "Gastos" },
                  ]}
                  valueFormatter={(value) => formatCurrency(value, "EUR", "es-ES")}
                  height={350}
                />
              </div>
            )}

            {/* Empty State */}
            {summary.liquidez === 0 && summary.revenue === 0 && (
              <div className="text-center py-12 glass rounded-lg">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No hay KPIs disponibles</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sube documentos financieros (estados financieros, P&L, balance sheets, etc.) y la IA extraerá automáticamente los KPIs y métricas importantes.
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
                        Sube PDFs, Excel, CSV o imágenes. La IA los analizará automáticamente.
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
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6" />
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
      </main>
    </div>
  )
}
