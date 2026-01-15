'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  Bitcoin,
  BarChart3,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock investments data
const mockInvestments = {
  stocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', value: 12500, change: 3.2, quantity: 45 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', value: 8900, change: -1.5, quantity: 12 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', value: 15200, change: 2.8, quantity: 28 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', value: 22000, change: 8.5, quantity: 15 },
  ],
  crypto: [
    { symbol: 'BTC', name: 'Bitcoin', value: 45000, change: 5.2, quantity: 1.2 },
    { symbol: 'ETH', name: 'Ethereum', value: 12500, change: 3.8, quantity: 8.5 },
    { symbol: 'SOL', name: 'Solana', value: 3200, change: -2.1, quantity: 45 },
  ],
  etfs: [
    { symbol: 'SPY', name: 'S&P 500 ETF', value: 28000, change: 1.2, quantity: 50 },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', value: 18500, change: 2.5, quantity: 35 },
  ],
}

const totalValue =
  mockInvestments.stocks.reduce((sum, i) => sum + i.value, 0) +
  mockInvestments.crypto.reduce((sum, i) => sum + i.value, 0) +
  mockInvestments.etfs.reduce((sum, i) => sum + i.value, 0)

const monthlyChange = 4.2 // percentage

export function InvestmentsTracker() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto' | 'etfs'>('stocks')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getActiveData = () => {
    switch (activeTab) {
      case 'stocks':
        return mockInvestments.stocks
      case 'crypto':
        return mockInvestments.crypto
      case 'etfs':
        return mockInvestments.etfs
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <p className="text-sm text-slate-400">Portfolio Total</p>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">+{monthlyChange}%</span>
              <span className="text-slate-500 text-sm">este mes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-sm text-slate-400">Stocks & ETFs</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(
                mockInvestments.stocks.reduce((sum, i) => sum + i.value, 0) +
                  mockInvestments.etfs.reduce((sum, i) => sum + i.value, 0)
              )}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {mockInvestments.stocks.length + mockInvestments.etfs.length} posiciones
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Bitcoin className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-slate-400">Crypto</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(mockInvestments.crypto.reduce((sum, i) => sum + i.value, 0))}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {mockInvestments.crypto.length} activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Holdings</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-400">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Anadir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg w-fit mb-6">
            <button
              onClick={() => setActiveTab('stocks')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'stocks'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Stocks
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'crypto'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Crypto
            </button>
            <button
              onClick={() => setActiveTab('etfs')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'etfs'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              ETFs
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Activo</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Cantidad</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Valor</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Cambio</th>
                </tr>
              </thead>
              <tbody>
                {getActiveData().map((asset) => (
                  <tr
                    key={asset.symbol}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-white">{asset.symbol}</p>
                        <p className="text-sm text-slate-400">{asset.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-slate-300">
                      {asset.quantity}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-white">
                      {formatCurrency(asset.value)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm',
                          asset.change >= 0
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        )}
                      >
                        {asset.change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {asset.change >= 0 ? '+' : ''}
                        {asset.change}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            * Datos de ejemplo. Entrada mensual manual de valores.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
