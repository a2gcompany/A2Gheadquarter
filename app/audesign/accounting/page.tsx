"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/components/accounting/transactions-table"
import { CSVImport } from "@/components/accounting/csv-import"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, TrendingUp, TrendingDown, Wallet, CreditCard, Building2 } from "lucide-react"
import { getProjects, type Project } from "@/src/actions/projects"
import { getPaymentSources, type PaymentSource } from "@/src/actions/payment-sources"
import { getBusinessUnitBySlug } from "@/src/actions/business-units"
import {
  getAllTransactions,
} from "@/src/actions/transactions"

export default function AudesignAccountingPage() {
  const [loading, setLoading] = useState(true)
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([])
  const [selectedSource, setSelectedSource] = useState<string>("all")
  const [transactions, setTransactions] = useState<any[]>([])
  const [audesignUnitId, setAudesignUnitId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Get Audesign business unit
      const audesignUnit = await getBusinessUnitBySlug("audesign")
      if (audesignUnit) {
        setAudesignUnitId(audesignUnit.id)
      }

      // Get payment sources (filter for Audesign ones)
      const allSources = await getPaymentSources()
      const audesignSources = allSources.filter(s =>
        s.business_unit_id === audesignUnit?.id ||
        s.name.toLowerCase().includes("audesign")
      )
      setPaymentSources(audesignSources)

      // Get all transactions - in a real app, we'd filter by payment_source_id or business_unit_id
      // For now, we'll show all and let the user understand the structure
      const allTransactions = await getAllTransactions()

      // In production, filter by audesign business unit
      // For demo, show all transactions or filter by source if selected
      if (selectedSource !== "all") {
        setTransactions(allTransactions.filter(t => t.payment_source_id === selectedSource))
      } else {
        // Show transactions that would belong to Audesign
        // This is demo data - in production you'd filter by business_unit_id
        setTransactions(allTransactions.slice(0, 20))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedSource])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calculate P&L from transactions
  const pl = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount)
      if (t.type === "income") {
        acc.income += amount
      } else {
        acc.expense += amount
      }
      acc.balance = acc.income - acc.expense
      return acc
    },
    { income: 0, expense: 0, balance: 0 }
  )

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "stripe":
        return <CreditCard className="h-4 w-4" />
      case "paypal":
        return <CreditCard className="h-4 w-4" />
      case "bank":
        return <Building2 className="h-4 w-4" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  return (
    <AppLayout title="Contabilidad - Audesign">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contabilidad Audesign</h1>
            <p className="text-muted-foreground">
              Finanzas de Audesign (Stripe, PayPal, Banco)
            </p>
          </div>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas las fuentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              {paymentSources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center gap-2">
                    {getSourceIcon(source.type)}
                    {source.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Payment Sources Overview */}
            {paymentSources.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentSources.map((source) => (
                  <Card
                    key={source.id}
                    className={`cursor-pointer transition-colors ${selectedSource === source.id ? "border-primary" : ""}`}
                    onClick={() => setSelectedSource(source.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getSourceIcon(source.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{source.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{source.type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* P&L Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ingresos</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {pl.income.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gastos</p>
                      <p className="text-2xl font-bold text-red-500">
                        {pl.expense.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className={`text-2xl font-bold ${pl.balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {pl.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Note about data structure */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Para ver transacciones de Audesign, primero ejecuta la migracion SQL
                  que crea las fuentes de pago (Stripe, PayPal). Luego podras importar extractos CSV
                  asignados a cada fuente.
                </p>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Transacciones
                  {selectedSource !== "all" && paymentSources.find(s => s.id === selectedSource) && (
                    <span className="font-normal text-muted-foreground ml-2">
                      - {paymentSources.find(s => s.id === selectedSource)?.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay transacciones. Importa un CSV para comenzar.
                  </p>
                ) : (
                  <TransactionsTable transactions={transactions} onRefresh={loadData} />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}
