'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  RefreshCcw,
  Target,
  BarChart3,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const metrics = {
  totalRevenue: 45200,
  totalSales: 324,
  aov: 139.51,
  conversionRate: 3.2,
  refundRate: 2.1,
  activeProducts: 12,
  adSpend: 8500,
  roas: 5.32,
  mrr: 0, // No subscription yet
  newCustomers: 156,
}

const monthlyData = [
  { month: 'Ene', revenue: 32000, sales: 210 },
  { month: 'Feb', revenue: 28500, sales: 185 },
  { month: 'Mar', revenue: 41200, sales: 278 },
  { month: 'Abr', revenue: 38900, sales: 245 },
  { month: 'May', revenue: 43500, sales: 298 },
  { month: 'Jun', revenue: 45200, sales: 324 },
]

const topProducts = [
  { name: 'Pro Bundle Pack', sales: 89, revenue: 8010, growth: 12.5 },
  { name: 'Sample Pack Vol.3', sales: 156, revenue: 7644, growth: 8.2 },
  { name: 'Synth Presets Pro', sales: 45, revenue: 4455, growth: -3.1 },
  { name: 'Drum Kit Essential', sales: 112, revenue: 3360, growth: 15.8 },
]

const channelPerformance = [
  { channel: 'Organic', revenue: 18200, percentage: 40 },
  { channel: 'Facebook Ads', revenue: 14500, percentage: 32 },
  { channel: 'Google Ads', revenue: 8200, percentage: 18 },
  { channel: 'Instagram', revenue: 2800, percentage: 6 },
  { channel: 'Referrals', revenue: 1500, percentage: 4 },
]

export default function AudesignPage() {
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
      <div>
        <h1 className="text-3xl font-bold text-white">AUDESIGN</h1>
        <p className="text-slate-400 mt-1">
          E-commerce de software para productores musicales
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <p className="text-xs text-slate-400">Revenue</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">+12.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-slate-400">Ventas</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.totalSales}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">+8.7%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-slate-400">AOV</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.aov)}</p>
            <p className="text-xs text-slate-500">Valor medio pedido</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-slate-400">ROAS</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.roas}x</p>
            <p className="text-xs text-slate-500">Return on ad spend</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCcw className="w-4 h-4 text-red-400" />
              <p className="text-xs text-slate-400">Refunds</p>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.refundRate}%</p>
            <p className="text-xs text-slate-500">Tasa de reembolso</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/50 border border-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Top Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, idx) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-500">#{idx + 1}</span>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-sm text-slate-400">{product.sales} ventas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{formatCurrency(product.revenue)}</p>
                        <p
                          className={cn(
                            'text-sm flex items-center justify-end gap-1',
                            product.growth >= 0 ? 'text-green-400' : 'text-red-400'
                          )}
                        >
                          {product.growth >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {product.growth >= 0 ? '+' : ''}
                          {product.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Revenue por Canal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelPerformance.map((channel) => (
                    <div key={channel.channel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{channel.channel}</span>
                        <span className="text-sm text-slate-400">
                          {formatCurrency(channel.revenue)} ({channel.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${channel.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Tendencia Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-4 pt-8">
                {monthlyData.map((month, idx) => {
                  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue))
                  const heightPercent = (month.revenue / maxRevenue) * 100

                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-sm text-white font-medium mb-1">
                          {formatCurrency(month.revenue)}
                        </span>
                        <div
                          className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg transition-all duration-500"
                          style={{ height: `${heightPercent * 1.5}px` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{month.month}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Catalogo de Productos</h3>
              <p className="text-slate-400">Proximamente: gestion de productos y precios</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400 mb-1">Ad Spend</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.adSpend)}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400 mb-1">ROAS</p>
                <p className="text-2xl font-bold text-green-400">{metrics.roas}x</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400 mb-1">CAC</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(metrics.adSpend / metrics.newCustomers)}
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Campanas de Marketing</h3>
              <p className="text-slate-400">Proximamente: tracking de campanas y metricas</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Analisis de Clientes</h3>
              <p className="text-slate-400">Proximamente: LTV, segmentacion, retention</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
