'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Upload,
  FileSpreadsheet,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'
import { CsvImportModal } from '@/components/a2g-company/csv-import-modal'
import { TransactionsTable } from '@/components/a2g-company/transactions-table'
import { InvestmentsTracker } from '@/components/a2g-company/investments-tracker'

// Mock data
const financialOverview = {
  totalBalance: 342500,
  monthlyIncome: 125430,
  monthlyExpenses: 78250,
  netProfit: 47180,
  runway: 14.2, // months
}

const verticalBreakdown = [
  { name: 'AUDESIGN', revenue: 45200, expenses: 12300, profit: 32900, color: 'bg-purple-500' },
  { name: 'A2G Talents', revenue: 68400, expenses: 41200, profit: 27200, color: 'bg-pink-500' },
  { name: 'A2G Company', revenue: 11830, expenses: 24750, profit: -12920, color: 'bg-indigo-500' },
]

export default function A2GCompanyPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">A2G Company</h1>
          <p className="text-slate-400 mt-1">
            Holding - Gestion financiera consolidada
          </p>
        </div>
        <Button
          onClick={() => setIsImportModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar CSV
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/50 border border-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="investments">Inversiones</TabsTrigger>
          <TabsTrigger value="meetings">Reuniones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <PiggyBank className="w-5 h-5 text-indigo-400" />
                  <p className="text-sm text-slate-400">Balance Total</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(financialOverview.totalBalance)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-slate-400">Ingresos Mes</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(financialOverview.monthlyIncome)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                  <p className="text-sm text-slate-400">Gastos Mes</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(financialOverview.monthlyExpenses)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <p className="text-sm text-slate-400">Beneficio Neto</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(financialOverview.netProfit)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <p className="text-sm text-slate-400">Runway</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {financialOverview.runway} <span className="text-lg text-slate-400">meses</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown by Vertical */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Desglose por Vertical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Vertical</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Ingresos</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Gastos</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Beneficio</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verticalBreakdown.map((vertical) => (
                      <tr key={vertical.name} className="border-b border-slate-800/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${vertical.color}`} />
                            <span className="text-white font-medium">{vertical.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-green-400">
                          {formatCurrency(vertical.revenue)}
                        </td>
                        <td className="py-4 px-4 text-right text-red-400">
                          {formatCurrency(vertical.expenses)}
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${vertical.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(vertical.profit)}
                        </td>
                        <td className="py-4 px-4 text-right text-slate-400">
                          {((vertical.profit / vertical.revenue) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-800/30">
                      <td className="py-4 px-4 font-semibold text-white">Total</td>
                      <td className="py-4 px-4 text-right font-semibold text-green-400">
                        {formatCurrency(verticalBreakdown.reduce((sum, v) => sum + v.revenue, 0))}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-red-400">
                        {formatCurrency(verticalBreakdown.reduce((sum, v) => sum + v.expenses, 0))}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-emerald-400">
                        {formatCurrency(verticalBreakdown.reduce((sum, v) => sum + v.profit, 0))}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsTable />
        </TabsContent>

        <TabsContent value="investments" className="mt-6">
          <InvestmentsTracker />
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Registro de Reuniones</h3>
              <p className="text-slate-400 mb-4">Proximamente: notas, acuerdos y action items</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  )
}
