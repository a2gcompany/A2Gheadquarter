'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Department field definitions
const departmentFields: Record<string, Array<{
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'currency'
  required: boolean
  placeholder?: string
}>> = {
  'paid-media': [
    { name: 'spend_total', label: 'Gasto Total (EUR)', type: 'currency', required: true, placeholder: '0.00' },
    { name: 'roas', label: 'ROAS', type: 'number', required: true, placeholder: '0.00' },
    { name: 'cpc', label: 'CPC Promedio (EUR)', type: 'currency', required: true, placeholder: '0.00' },
    { name: 'active_campaigns', label: 'Campanas Activas', type: 'number', required: true, placeholder: '0' },
    { name: 'impressions', label: 'Impresiones', type: 'number', required: false, placeholder: '0' },
    { name: 'clicks', label: 'Clicks', type: 'number', required: false, placeholder: '0' },
    { name: 'conversions', label: 'Conversiones', type: 'number', required: false, placeholder: '0' },
    { name: 'highlights', label: 'Highlights del mes', type: 'textarea', required: true, placeholder: 'Describe los logros principales del mes...' },
    { name: 'blockers', label: 'Blockers/Problemas', type: 'textarea', required: false, placeholder: 'Describe cualquier problema o bloqueo encontrado...' },
  ],
  'diseno-grafico': [
    { name: 'pieces_delivered', label: 'Piezas Entregadas', type: 'number', required: true, placeholder: '0' },
    { name: 'projects_in_progress', label: 'Proyectos en Curso', type: 'number', required: true, placeholder: '0' },
    { name: 'projects_completed', label: 'Proyectos Completados', type: 'number', required: true, placeholder: '0' },
    { name: 'revision_rounds_avg', label: 'Rondas de Revision (Promedio)', type: 'number', required: false, placeholder: '0' },
    { name: 'highlights', label: 'Highlights del mes', type: 'textarea', required: true, placeholder: 'Describe los logros principales del mes...' },
    { name: 'blockers', label: 'Blockers/Problemas', type: 'textarea', required: false, placeholder: 'Describe cualquier problema o bloqueo encontrado...' },
  ],
  'community-management': [
    { name: 'followers_gained', label: 'Nuevos Seguidores', type: 'number', required: true, placeholder: '0' },
    { name: 'total_followers', label: 'Seguidores Totales', type: 'number', required: true, placeholder: '0' },
    { name: 'engagement_rate', label: 'Engagement Rate (%)', type: 'number', required: true, placeholder: '0.00' },
    { name: 'posts_published', label: 'Posts Publicados', type: 'number', required: true, placeholder: '0' },
    { name: 'stories_published', label: 'Stories Publicadas', type: 'number', required: false, placeholder: '0' },
    { name: 'reels_published', label: 'Reels Publicados', type: 'number', required: false, placeholder: '0' },
    { name: 'top_performing_post', label: 'Post con Mejor Performance', type: 'text', required: false, placeholder: 'URL o descripcion del post' },
    { name: 'highlights', label: 'Highlights del mes', type: 'textarea', required: true, placeholder: 'Describe los logros principales del mes...' },
    { name: 'blockers', label: 'Blockers/Problemas', type: 'textarea', required: false, placeholder: 'Describe cualquier problema o bloqueo encontrado...' },
  ],
  'asistente-ops': [
    { name: 'tasks_completed', label: 'Tareas Completadas', type: 'number', required: true, placeholder: '0' },
    { name: 'tasks_pending', label: 'Tareas Pendientes', type: 'number', required: true, placeholder: '0' },
    { name: 'incidents', label: 'Incidencias Reportadas', type: 'number', required: true, placeholder: '0' },
    { name: 'incidents_resolved', label: 'Incidencias Resueltas', type: 'number', required: true, placeholder: '0' },
    { name: 'hours_logged', label: 'Horas Registradas', type: 'number', required: false, placeholder: '0' },
    { name: 'highlights', label: 'Highlights del mes', type: 'textarea', required: true, placeholder: 'Describe los logros principales del mes...' },
    { name: 'blockers', label: 'Blockers/Problemas', type: 'textarea', required: false, placeholder: 'Describe cualquier problema o bloqueo encontrado...' },
  ],
}

const departments = [
  { id: 'paid-media', name: 'Paid Media' },
  { id: 'diseno-grafico', name: 'Diseno Grafico' },
  { id: 'community-management', name: 'Community Management' },
  { id: 'asistente-ops', name: 'Asistente/Ops' },
]

const months = [
  { value: '2024-01', label: 'Enero 2024' },
  { value: '2024-02', label: 'Febrero 2024' },
  { value: '2023-12', label: 'Diciembre 2023' },
]

export default function NewReportPage() {
  const router = useRouter()
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitType, setSubmitType] = useState<'draft' | 'submit'>('draft')

  const fields = selectedDepartment ? departmentFields[selectedDepartment] : []

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (type: 'draft' | 'submit') => {
    setSubmitType(type)
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    router.push('/reports')
  }

  const renderField = (field: typeof fields[0]) => {
    const value = formData[field.name] || ''

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={4}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        )
      case 'number':
      case 'currency':
        return (
          <input
            type="number"
            step={field.type === 'currency' ? '0.01' : '1'}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="outline" size="icon" className="border-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Nuevo Reporte</h1>
          <p className="text-slate-400 mt-1">Crea un nuevo reporte mensual</p>
        </div>
      </div>

      {/* Selection */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Selecciona el periodo y departamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mes del reporte *
              </label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Selecciona un mes" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value} className="text-white">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Departamento *
              </label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="text-white">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      {selectedDepartment && selectedMonth && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">
              {departments.find((d) => d.id === selectedDepartment)?.name} - {months.find((m) => m.value === selectedMonth)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {field.label} {field.required && '*'}
                </label>
                {renderField(field)}
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="flex-1 border-slate-700 text-slate-300"
              >
                {isSubmitting && submitType === 'draft' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar borrador
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSubmit('submit')}
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting && submitType === 'submit' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar reporte
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
