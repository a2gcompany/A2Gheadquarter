'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  DollarSign,
  User,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock bookings data
const mockBookings = [
  {
    id: '1',
    artistName: 'Roger Sanchez',
    eventName: 'Tomorrowland 2024',
    eventType: 'festival',
    date: '2024-07-26',
    venue: 'Boom, Belgium',
    fee: 45000,
    status: 'confirmed',
  },
  {
    id: '2',
    artistName: 'DJ Snake',
    eventName: 'Ushuaia Ibiza',
    eventType: 'club',
    date: '2024-07-28',
    venue: 'Ibiza, Spain',
    fee: 75000,
    status: 'confirmed',
  },
  {
    id: '3',
    artistName: 'Charlotte de Witte',
    eventName: 'Awakenings',
    eventType: 'festival',
    date: '2024-07-30',
    venue: 'Amsterdam, Netherlands',
    fee: 35000,
    status: 'contract_sent',
  },
  {
    id: '4',
    artistName: 'Roger Sanchez',
    eventName: 'Private Event',
    eventType: 'private',
    date: '2024-08-03',
    venue: 'Monaco',
    fee: 60000,
    status: 'negotiation',
  },
  {
    id: '5',
    artistName: 'DJ Snake',
    eventName: 'Ultra Miami 2024',
    eventType: 'festival',
    date: '2024-08-15',
    venue: 'Miami, USA',
    fee: 120000,
    status: 'confirmed',
  },
]

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function BookingsCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 6, 1)) // July 2024
  const [view, setView] = useState<'calendar' | 'list'>('list')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'contract_sent':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'negotiation':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'inquiry':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'contract_sent':
        return 'Contrato enviado'
      case 'negotiation':
        return 'En negociacion'
      case 'inquiry':
        return 'Consulta'
      default:
        return status
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'festival':
        return '🎪'
      case 'club':
        return '🎵'
      case 'private':
        return '🏠'
      case 'corporate':
        return '🏢'
      default:
        return '🎤'
    }
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              className="border-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="w-40 text-center">
              <span className="text-lg font-semibold text-white">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="border-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            <button
              onClick={() => setView('list')}
              className={cn(
                'px-3 py-2 text-sm',
                view === 'list' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              )}
            >
              Lista
            </button>
            <button
              onClick={() => setView('calendar')}
              className={cn(
                'px-3 py-2 text-sm',
                view === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              )}
            >
              Calendario
            </button>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Booking
          </Button>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {mockBookings.map((booking) => (
            <Card
              key={booking.id}
              className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Date */}
                  <div className="flex items-center gap-3 md:w-32">
                    <div className="text-2xl">{getEventTypeIcon(booking.eventType)}</div>
                    <div>
                      <p className="text-sm font-medium text-white">{formatDate(booking.date)}</p>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{booking.eventName}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {booking.artistName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {booking.venue}
                      </span>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-400">
                      {formatCurrency(booking.fee)}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full border',
                        getStatusStyles(booking.status)
                      )}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Calendar View Placeholder */}
      {view === 'calendar' && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">
              Vista de calendario proximamente
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{mockBookings.length}</p>
            <p className="text-sm text-slate-400">Total Bookings</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {mockBookings.filter((b) => b.status === 'confirmed').length}
            </p>
            <p className="text-sm text-slate-400">Confirmados</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {mockBookings.filter((b) => b.status !== 'confirmed').length}
            </p>
            <p className="text-sm text-slate-400">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {formatCurrency(mockBookings.reduce((sum, b) => sum + b.fee, 0))}
            </p>
            <p className="text-sm text-slate-400">Revenue Total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
