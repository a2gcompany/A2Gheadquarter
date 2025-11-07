"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Filter, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

// Mock data
const accountsData = [
  { name: "Wio Business EUR", balance: 45230, currency: "EUR", provider: "wio", type: "checking" },
  { name: "Wise Multi-Currency", balance: 32150, currency: "USD", provider: "wise", type: "checking" },
  { name: "Amex Corporate", balance: -8450, currency: "EUR", provider: "amex", type: "credit" },
  { name: "Wise GBP", balance: 12340, currency: "GBP", provider: "wise", type: "checking" },
]

const cashflowData = [
  { month: "Ene", ingresos: 45000, gastos: 38000, neto: 7000 },
  { month: "Feb", ingresos: 52000, gastos: 41000, neto: 11000 },
  { month: "Mar", ingresos: 48000, gastos: 39000, neto: 9000 },
  { month: "Abr", ingresos: 55000, gastos: 42000, neto: 13000 },
  { month: "May", ingresos: 58000, gastos: 45000, neto: 13000 },
  { month: "Jun", ingresos: 62000, gastos: 47000, neto: 15000 },
]

const transactionsData = [
  {
    id: 1,
    date: "2024-03-15",
    description: "Marketing Campaign - Meta Ads",
    amount: -1250,
    category: "Marketing",
    merchant: "Meta",
    account: "Wio Business EUR",
  },
  {
    id: 2,
    date: "2024-03-14",
    description: "Client Payment - Project Alpha",
    amount: 5000,
    category: "Revenue",
    merchant: "Client XYZ",
    account: "Wio Business EUR",
  },
  {
    id: 3,
    date: "2024-03-14",
    description: "Hotel - Barcelona",
    amount: -320,
    category: "Travel",
    merchant: "Hotel Arts",
    account: "Amex Corporate",
  },
  {
    id: 4,
    date: "2024-03-13",
    description: "Salary - Team Member",
    amount: -3500,
    category: "Salaries",
    merchant: "Internal",
    account: "Wio Business EUR",
  },
  {
    id: 5,
    date: "2024-03-12",
    description: "Software Subscription - Adobe",
    amount: -79,
    category: "Technology",
    merchant: "Adobe",
    account: "Wio Business EUR",
  },
]

export default function FinancesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedAccount, setSelectedAccount] = useState("all")

  const totalBalance = accountsData.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Finanzas Multi-Entidad
            </h1>
            <p className="text-muted-foreground">Vista consolidada tipo Bloomberg Terminal</p>
          </div>
          <div className="flex gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mes</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="year">Este Año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Panel: Accounts */}
          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Cuentas</h2>
              <span className="text-2xl font-bold">{formatCurrency(totalBalance, "EUR")}</span>
            </div>
            <div className="space-y-3">
              {accountsData.map((account, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAccount(account.name)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{account.name}</span>
                    <span className={cn(
                      "text-sm font-bold",
                      account.balance >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {formatCurrency(account.balance, account.currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground capitalize">{account.provider}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground capitalize">{account.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Panel: Charts */}
          <div className="lg:col-span-2 space-y-6">
            <LineChart
              title="Cashflow Mensual"
              description="Ingresos vs Gastos"
              data={cashflowData}
              xDataKey="month"
              lines={[
                { dataKey: "ingresos", stroke: "#10b981", name: "Ingresos" },
                { dataKey: "gastos", stroke: "#ef4444", name: "Gastos" },
                { dataKey: "neto", stroke: "#3b82f6", name: "Neto" },
              ]}
              valueFormatter={(value) => formatCurrency(value, "EUR", "es-ES")}
              height={300}
            />

            <Tabs defaultValue="transactions" className="glass rounded-lg">
              <TabsList className="w-full">
                <TabsTrigger value="transactions" className="flex-1">Transacciones</TabsTrigger>
                <TabsTrigger value="analysis" className="flex-1">Análisis</TabsTrigger>
                <TabsTrigger value="forecast" className="flex-1">Proyecciones</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="p-4">
                <div className="space-y-3">
                  {transactionsData.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          transaction.amount > 0 ? "bg-green-500" : "bg-red-500"
                        )} />
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{transaction.date}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{transaction.category}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{transaction.account}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "font-bold",
                          transaction.amount > 0 ? "text-green-500" : "text-foreground"
                        )}>
                          {formatCurrency(Math.abs(transaction.amount), "EUR")}
                        </div>
                        {transaction.amount > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="p-4">
                <BarChart
                  data={[
                    { category: "Marketing", amount: 12500 },
                    { category: "Viajes", amount: 8200 },
                    { category: "Salarios", amount: 25000 },
                    { category: "Tecnología", amount: 5400 },
                  ]}
                  xDataKey="category"
                  bars={[{ dataKey: "amount", fill: "#3b82f6", name: "Gastos" }]}
                  valueFormatter={(value) => formatCurrency(value, "EUR", "es-ES")}
                  height={250}
                />
              </TabsContent>

              <TabsContent value="forecast" className="p-4">
                <div className="text-center text-muted-foreground py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Proyecciones de cashflow próximamente</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
