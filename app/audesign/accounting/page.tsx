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
import Link from "next/link"
import {
  getTransactionsByProject,
} from "@/src/actions/transactions"
import { getIntegrations } from "@/src/actions/integrations"

// AUDESIGN project ID
const AUDESIGN_PROJECT_ID = "e232f7c0-3a86-4086-9567-8114d046c3ec"

type SourceFilter = "all" | "stripe" | "shopify" | "paypal" | "other"

export default function AudesignAccountingPage() {
  const [loading, setLoading] = useState(true)
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([])
  const [selectedSource, setSelectedSource] = useState<SourceFilter>("all")
  const [transactions, setTransactions] = useState<any[]>([])
  const [allTransactions, setAllTransactions] = useState<any[]>([])
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

      // Get transactions for the AUDESIGN project
      const projectTransactions = await getTransactionsByProject(AUDESIGN_PROJECT_ID)
      setAllTransactions(projectTransactions)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter transactions by source
  useEffect(() => {
    if (selectedSource === "all") {
      setTransactions(allTransactions)
    } else {
      setTransactions(
        allTransactions.filter((t) => {
          const src = t.source_file || t.external_id || ""
          return src.startsWith(`${selectedSource}:`)
        })
      )
    }
  }, [selectedSource, allTransactions])

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
          <Select value={selectedSource} onValueChange={(v) => setSelectedSource(v as SourceFilter)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas las fuentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              <SelectItem value="stripe">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Stripe
                </div>
              </SelectItem>
              <SelectItem value="shopify">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> Shopify
                </div>
              </SelectItem>
              <SelectItem value="paypal">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> PayPal
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Source Overview */}
            {allTransactions.length > 0 && (() => {
              const counts = allTransactions.reduce((acc, t) => {
                const src = t.source_file || t.external_id || ""
                if (src.startsWith("stripe:")) acc.stripe++
                else if (src.startsWith("shopify:")) acc.shopify++
                else if (src.startsWith("paypal:")) acc.paypal++
                else acc.other++
                return acc
              }, { stripe: 0, shopify: 0, paypal: 0, other: 0 })

              const sources = [
                { key: "stripe" as SourceFilter, label: "Stripe", count: counts.stripe, icon: <CreditCard className="h-4 w-4" /> },
                { key: "shopify" as SourceFilter, label: "Shopify", count: counts.shopify, icon: <Wallet className="h-4 w-4" /> },
                { key: "paypal" as SourceFilter, label: "PayPal", count: counts.paypal, icon: <CreditCard className="h-4 w-4" /> },
              ].filter(s => s.count > 0)

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card
                    className={`cursor-pointer transition-colors ${selectedSource === "all" ? "border-primary" : ""}`}
                    onClick={() => setSelectedSource("all")}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Todas</p>
                          <p className="text-xs text-muted-foreground">{allTransactions.length} transacciones</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {sources.map((source) => (
                    <Card
                      key={source.key}
                      className={`cursor-pointer transition-colors ${selectedSource === source.key ? "border-primary" : ""}`}
                      onClick={() => setSelectedSource(source.key)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {source.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{source.label}</p>
                            <p className="text-xs text-muted-foreground">{source.count} transacciones</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            })()}

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

            {/* Quick links to integrations */}
            {transactions.length === 0 && (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Sin transacciones.</strong> Conecta tus fuentes de datos para importar automaticamente:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/integrations/stripe">
                      <Button variant="outline" size="sm" className="gap-1">
                        <CreditCard className="h-3 w-3" /> Stripe
                      </Button>
                    </Link>
                    <Link href="/integrations/paypal">
                      <Button variant="outline" size="sm" className="gap-1">
                        <CreditCard className="h-3 w-3" /> PayPal
                      </Button>
                    </Link>
                    <Link href="/integrations/bank-import">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Building2 className="h-3 w-3" /> Importar CSV
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Transacciones ({transactions.length})
                  {selectedSource !== "all" && (
                    <span className="font-normal text-muted-foreground ml-2">
                      - {selectedSource.charAt(0).toUpperCase() + selectedSource.slice(1)}
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
