'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Bell, Shield, Palette, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: '',
    notifications: {
      email: true,
      browser: false,
      reports: true,
    },
  })

  const handleSave = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
  ]

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Configuracion</h1>
        <p className="text-slate-400 mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Informacion del perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <Button variant="outline" className="border-slate-700 text-slate-300">
                      Cambiar foto
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+34 600 000 000"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <Button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Preferencias de notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { id: 'email', label: 'Notificaciones por email', description: 'Recibe actualizaciones en tu email' },
                    { id: 'browser', label: 'Notificaciones del navegador', description: 'Notificaciones push en el navegador' },
                    { id: 'reports', label: 'Recordatorios de reportes', description: 'Recordatorios para enviar reportes mensuales' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{item.label}</p>
                        <p className="text-sm text-slate-400">{item.description}</p>
                      </div>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            notifications: {
                              ...formData.notifications,
                              [item.id]: !formData.notifications[item.id as keyof typeof formData.notifications],
                            },
                          })
                        }
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          formData.notifications[item.id as keyof typeof formData.notifications]
                            ? 'bg-indigo-600'
                            : 'bg-slate-700'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                            formData.notifications[item.id as keyof typeof formData.notifications]
                              ? 'translate-x-7'
                              : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="font-medium text-white mb-2">Autenticacion</p>
                  <p className="text-sm text-slate-400 mb-4">
                    Usas Magic Links para iniciar sesion. No se requiere contrasena.
                  </p>
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Shield className="w-4 h-4" />
                    Metodo de autenticacion seguro activo
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="font-medium text-white mb-2">Sesiones activas</p>
                  <p className="text-sm text-slate-400">
                    Solo tienes una sesion activa en este momento.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Apariencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-4">
                    Tema
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'dark', label: 'Oscuro', active: true },
                      { id: 'light', label: 'Claro', active: false },
                      { id: 'system', label: 'Sistema', active: false },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        className={cn(
                          'p-4 rounded-lg border-2 text-center transition-colors',
                          theme.active
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        )}
                      >
                        <div
                          className={cn(
                            'w-full h-12 rounded mb-2',
                            theme.id === 'dark' ? 'bg-slate-900' : theme.id === 'light' ? 'bg-white' : 'bg-gradient-to-r from-slate-900 to-white'
                          )}
                        />
                        <span className="text-sm text-white">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
