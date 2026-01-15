'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock transactions data
const mockTransactions = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Pago cliente - Festival XYZ',
    amount: 15000,
    type: 'income',
    category: 'Bookings',
    vertical: 'A2G Talents',
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Facebook Ads - Campana Enero',
    amount: -2340,
    type: 'expense',
    category: 'Marketing',
    vertical: 'AUDESIGN',
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'Venta - Pro Bundle Pack',
    amount: 89,
    type: 'income',
    category: 'Ventas',
    vertical: 'AUDESIGN',
  },
  {
    id: '4',
    date: '2024-01-12',
    description: 'Nomina - Enero 2024',
    amount: -12500,
    type: 'expense',
    category: 'Salarios',
    vertical: 'A2G Company',
  },
  {
    id: '5',
    date: '2024-01-11',
    description: 'Booking - Club Berlin',
    amount: 8500,
    type: 'income',
    category: 'Bookings',
    vertical: 'A2G Talents',
  },
  {
    id: '6',
    date: '2024-01-10',
    description: 'AWS - Infraestructura',
    amount: -450,
    type: 'expense',
    category: 'Software',
    vertical: 'AUDESIGN',
  },
  {
    id: '7',
    date: '2024-01-09',
    description: 'Venta - Sample Pack Vol.3',
    amount: 49,
    type: 'income',
    category: 'Ventas',
    vertical: 'AUDESIGN',
  },
  {
    id: '8',
    date: '2024-01-08',
    description: 'Viaje artista - Amsterdam',
    amount: -890,
    type: 'expense',
    category: 'Travel',
    vertical: 'A2G Talents',
  },
]

const categories = ['Todas', 'Bookings', 'Ventas', 'Marketing', 'Salarios', 'Software', 'Travel']
const verticals = ['Todas', 'A2G Company', 'AUDESIGN', 'A2G Talents']

export function TransactionsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [verticalFilter, setVerticalFilter] = useState('Todas')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')

  const filteredTransactions = mockTransactions.filter((t) => {
    if (categoryFilter !== 'Todas' && t.category !== categoryFilter) return false
    if (verticalFilter !== 'Todas' && t.vertical !== verticalFilter) return false
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(Math.abs(value))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-white">Transacciones</CardTitle>
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            <button
              onClick={() => setTypeFilter('all')}
              className={cn(
                'px-3 py-2 text-sm',
                typeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={cn(
                'px-3 py-2 text-sm',
                typeFilter === 'income' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'
              )}
            >
              Ingresos
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={cn(
                'px-3 py-2 text-sm',
                typeFilter === 'expense' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
              )}
            >
              Gastos
            </button>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-white">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Vertical Filter */}
          <Select value={verticalFilter} onValueChange={setVerticalFilter}>
            <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Vertical" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {verticals.map((v) => (
                <SelectItem key={v} value={v} className="text-white">
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Descripcion</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Categoria</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Vertical</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-4 px-4 text-sm text-slate-400">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-white">{transaction.description}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-300">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-400">
                    {transaction.vertical}
                  </td>
                  <td
                    className={cn(
                      'py-4 px-4 text-right font-medium',
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
          <p className="text-sm text-slate-400">
            Mostrando {filteredTransactions.length} transacciones
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-400"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-400"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
