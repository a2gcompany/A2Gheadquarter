'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2,
  Music,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Mock data for demonstration
const kpiData = {
  totalRevenue: 125430,
  totalExpenses: 78250,
  activeArtists: 12,
  upcomingBookings: 8,
  pendingReports: 3,
}

const verticalCards = [
  {
    name: 'A2G Company',
    slug: 'a2g-company',
    description: 'Holding - Finanzas consolidadas',
    icon: Building2,
    href: '/a2g-company',
    color: 'from-indigo-500 to-blue-600',
    stats: [
      { label: 'Ingresos', value: '€125,430' },
      { label: 'Gastos', value: '€78,250' },
    ],
  },
  {
    name: 'AUDESIGN',
    slug: 'audesign',
    description: 'E-commerce para productores',
    icon: Music,
    href: '/audesign',
    color: 'from-purple-500 to-pink-600',
    stats: [
      { label: 'Revenue', value: '€45,200' },
      { label: 'Ventas', value: '324' },
    ],
  },
  {
    name: 'A2G Talents',
    slug: 'a2g-talents',
    description: 'Artist Management',
    icon: Users,
    href: '/a2g-talents',
    color: 'from-pink-500 to-rose-600',
    stats: [
      { label: 'Artistas', value: '12' },
      { label: 'Bookings', value: '8' },
    ],
  },
]

const quickActions = [
  {
    name: 'Nuevo Reporte',
    description: 'Crear reporte mensual',
    href: '/reports/new',
    icon: FileText,
  },
  {
    name: 'Ver Calendario',
    description: 'Bookings y eventos',
    href: '/a2g-talents/bookings',
    icon: Calendar,
  },
]

export default function DashboardPage() {
  const { profile, hasVerticalAccess, isAdmin, isCofounder } = useAuth()

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
        <h1 className="text-3xl font-bold text-white">
          Bienvenido, {profile?.full_name?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-slate-400 mt-1">
          Aqui tienes un resumen de la actividad de A2G
        </p>
      </div>

      {/* KPI Cards */}
      {(isAdmin || isCofounder) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(kpiData.totalRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400">+12.5%</span>
                <span className="text-slate-500">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Gastos Totales</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(kpiData.totalExpenses)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-red-400">+5.2%</span>
                <span className="text-slate-500">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Artistas Activos</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {kpiData.activeArtists}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <span className="text-slate-400">{kpiData.upcomingBookings} bookings proximos</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Reportes Pendientes</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {kpiData.pendingReports}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <Link
                href="/reports"
                className="flex items-center gap-1 mt-3 text-sm text-indigo-400 hover:text-indigo-300"
              >
                Ver reportes <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vertical Cards */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Verticales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verticalCards.map((vertical) => {
            if (!hasVerticalAccess(vertical.slug)) return null

            const Icon = vertical.icon

            return (
              <Link key={vertical.slug} href={vertical.href}>
                <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                        vertical.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {vertical.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      {vertical.description}
                    </p>
                    <div className="flex gap-6">
                      {vertical.stats.map((stat, idx) => (
                        <div key={idx}>
                          <p className="text-xs text-slate-500">{stat.label}</p>
                          <p className="text-lg font-semibold text-white">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Acciones rapidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Card className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all duration-300">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{action.name}</p>
                      <p className="text-xs text-slate-400">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
