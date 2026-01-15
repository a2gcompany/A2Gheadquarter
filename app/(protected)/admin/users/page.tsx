'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Loader2,
  Send,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'admin@a2gcompany.com',
    fullName: 'Admin User',
    roleType: 'admin',
    department: null,
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    email: 'carlos@a2gcompany.com',
    fullName: 'Carlos Garcia',
    roleType: 'cofounder',
    department: null,
    isActive: true,
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    email: 'maria@a2gcompany.com',
    fullName: 'Maria Lopez',
    roleType: 'worker',
    department: 'Diseno Grafico',
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    email: 'proveedor@external.com',
    fullName: 'Proveedor Externo',
    roleType: 'provider',
    department: 'Paid Media',
    isActive: true,
    createdAt: '2024-01-15',
  },
]

const mockPendingInvites = [
  {
    id: '1',
    email: 'nuevo@a2gcompany.com',
    roleType: 'worker',
    expiresAt: '2024-02-01',
    createdAt: '2024-01-25',
  },
]

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  cofounder: 'Cofundador',
  worker: 'Trabajador',
  provider: 'Proveedor',
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400',
  cofounder: 'bg-purple-500/20 text-purple-400',
  worker: 'bg-blue-500/20 text-blue-400',
  provider: 'bg-amber-500/20 text-amber-400',
}

export default function UsersPage() {
  const { isAdmin } = useAuth()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    roleType: 'worker',
    department: '',
  })

  const handleInvite = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsInviteModalOpen(false)
    setInviteForm({ email: '', roleType: 'worker', department: '' })
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="bg-slate-900/50 border-slate-800 max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Acceso restringido</h2>
            <p className="text-slate-400">
              Solo los administradores pueden acceder a esta seccion.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion de Usuarios</h1>
          <p className="text-slate-400 mt-1">
            Invita y gestiona usuarios de la plataforma
          </p>
        </div>
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invitar Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockUsers.length}</p>
                <p className="text-sm text-slate-400">Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {mockUsers.filter((u) => u.isActive).length}
                </p>
                <p className="text-sm text-slate-400">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockPendingInvites.length}</p>
                <p className="text-sm text-slate-400">Invitaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {mockUsers.filter((u) => u.roleType === 'admin').length}
                </p>
                <p className="text-sm text-slate-400">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {mockPendingInvites.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Invitaciones pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{invite.email}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs', roleColors[invite.roleType])}>
                      {roleLabels[invite.roleType]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                      Expira: {new Date(invite.expiresAt).toLocaleDateString('es-ES')}
                    </span>
                    <Button variant="outline" size="sm" className="border-slate-700">
                      Reenviar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Rol</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Departamento</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.fullName?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.fullName}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn('px-2 py-1 rounded-full text-xs', roleColors[user.roleType])}>
                        {roleLabels[user.roleType]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {user.department || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs',
                          user.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-500/20 text-slate-400'
                        )}
                      >
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Invitar nuevo usuario</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="usuario@ejemplo.com"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rol *
              </label>
              <Select
                value={inviteForm.roleType}
                onValueChange={(value) => setInviteForm({ ...inviteForm, roleType: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="worker" className="text-white">Trabajador</SelectItem>
                  <SelectItem value="provider" className="text-white">Proveedor</SelectItem>
                  <SelectItem value="cofounder" className="text-white">Cofundador</SelectItem>
                  <SelectItem value="admin" className="text-white">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Departamento
              </label>
              <Select
                value={inviteForm.department}
                onValueChange={(value) => setInviteForm({ ...inviteForm, department: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="paid-media" className="text-white">Paid Media</SelectItem>
                  <SelectItem value="diseno" className="text-white">Diseno Grafico</SelectItem>
                  <SelectItem value="community" className="text-white">Community Management</SelectItem>
                  <SelectItem value="ops" className="text-white">Asistente/Ops</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsInviteModalOpen(false)}
                className="flex-1 border-slate-700 text-slate-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInvite}
                disabled={isSubmitting || !inviteForm.email}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar invitacion
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
