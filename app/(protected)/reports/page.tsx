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
  FileText,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Mock data
const departments = [
  { id: '1', name: 'Paid Media', slug: 'paid-media' },
  { id: '2', name: 'Diseno Grafico', slug: 'diseno-grafico' },
  { id: '3', name: 'Community Management', slug: 'community-management' },
  { id: '4', name: 'Asistente/Ops', slug: 'asistente-ops' },
]

const mockReports = [
  {
    id: '1',
    monthYear: '2024-01',
    department: 'Paid Media',
    submittedBy: 'Carlos Garcia',
    submittedAt: '2024-01-28',
    status: 'approved',
  },
  {
    id: '2',
    monthYear: '2024-01',
    department: 'Diseno Grafico',
    submittedBy: 'Maria Lopez',
    submittedAt: '2024-01-29',
    status: 'submitted',
  },
  {
    id: '3',
    monthYear: '2024-01',
    department: 'Community Management',
    submittedBy: 'Ana Martinez',
    submittedAt: null,
    status: 'pending',
  },
  {
    id: '4',
    monthYear: '2024-01',
    department: 'Asistente/Ops',
    submittedBy: 'Juan Rodriguez',
    submittedAt: '2024-01-27',
    status: 'reviewed',
  },
]

const months = [
  { value: '2024-01', label: 'Enero 2024' },
  { value: '2024-02', label: 'Febrero 2024' },
  { value: '2023-12', label: 'Diciembre 2023' },
  { value: '2023-11', label: 'Noviembre 2023' },
]

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2024-01')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400'
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-400'
      case 'submitted':
        return 'bg-amber-500/20 text-amber-400'
      case 'pending':
        return 'bg-slate-500/20 text-slate-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado'
      case 'reviewed':
        return 'Revisado'
      case 'submitted':
        return 'Enviado'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'reviewed':
        return <CheckCircle className="w-4 h-4" />
      case 'submitted':
        return <Clock className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const filteredReports = mockReports.filter(
    (report) =>
      (selectedDepartment === 'all' || report.department === selectedDepartment) &&
      report.monthYear === selectedMonth
  )

  const pendingCount = mockReports.filter((r) => r.status === 'pending').length
  const submittedCount = mockReports.filter((r) => r.status === 'submitted').length
  const approvedCount = mockReports.filter((r) => r.status === 'approved').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Reportes Mensuales</h1>
          <p className="text-slate-400 mt-1">
            Formularios estructurados por departamento
          </p>
        </div>
        <Link href="/reports/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Reporte
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
              <p className="text-sm text-slate-400">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{submittedCount}</p>
              <p className="text-sm text-slate-400">Enviados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{approvedCount}</p>
              <p className="text-sm text-slate-400">Aprobados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value} className="text-white">
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[200px] bg-slate-900 border-slate-800">
            <User className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">
              Todos los departamentos
            </SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name} className="text-white">
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Link key={report.id} href={`/reports/${report.id}`}>
            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{report.department}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {report.submittedBy}
                        </span>
                        {report.submittedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(report.submittedAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                        getStatusStyles(report.status)
                      )}
                    >
                      {getStatusIcon(report.status)}
                      {getStatusLabel(report.status)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredReports.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No hay reportes</h3>
              <p className="text-slate-400 mb-4">
                No se encontraron reportes para los filtros seleccionados
              </p>
              <Link href="/reports/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Reporte
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
