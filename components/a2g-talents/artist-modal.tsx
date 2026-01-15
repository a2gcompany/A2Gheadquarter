'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, User, FileText, Link as LinkIcon, Settings } from 'lucide-react'

interface Artist {
  id?: string
  name: string
  stageName: string | null
  photoUrl: string | null
  status: 'active' | 'inactive' | 'pending' | 'archived'
  genres: string[]
  commissionPercentage: number
  contractType: string
  spotifyUrl?: string
  instagramUrl?: string
  email?: string
  phone?: string
  bio?: string
  managerName?: string
  managerEmail?: string
  agentName?: string
  agentEmail?: string
}

interface ArtistModalProps {
  isOpen: boolean
  onClose: () => void
  artist: Partial<Artist> | null
}

export function ArtistModal({ isOpen, onClose, artist }: ArtistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState<Partial<Artist>>({
    name: '',
    stageName: '',
    email: '',
    phone: '',
    bio: '',
    status: 'active',
    genres: [],
    commissionPercentage: 15,
    contractType: 'exclusive',
    spotifyUrl: '',
    instagramUrl: '',
    managerName: '',
    managerEmail: '',
    agentName: '',
    agentEmail: '',
  })

  useEffect(() => {
    if (artist) {
      setFormData({ ...formData, ...artist })
    } else {
      setFormData({
        name: '',
        stageName: '',
        email: '',
        phone: '',
        bio: '',
        status: 'active',
        genres: [],
        commissionPercentage: 15,
        contractType: 'exclusive',
        spotifyUrl: '',
        instagramUrl: '',
        managerName: '',
        managerEmail: '',
        agentName: '',
        agentEmail: '',
      })
    }
  }, [artist, isOpen])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    onClose()
  }

  const handleChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {artist?.id ? 'Editar Artista' : 'Nuevo Artista'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-slate-800/50 w-full justify-start">
            <TabsTrigger value="basic" className="gap-2">
              <User className="w-4 h-4" />
              Basico
            </TabsTrigger>
            <TabsTrigger value="contract" className="gap-2">
              <FileText className="w-4 h-4" />
              Contrato
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Settings className="w-4 h-4" />
              Contactos
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <LinkIcon className="w-4 h-4" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Nombre del artista"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre artistico
                </label>
                <input
                  type="text"
                  value={formData.stageName || ''}
                  onChange={(e) => handleChange('stageName', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Stage name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Generos
              </label>
              <input
                type="text"
                value={formData.genres?.join(', ') || ''}
                onChange={(e) =>
                  handleChange(
                    'genres',
                    e.target.value.split(',').map((g) => g.trim())
                  )
                }
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="House, Tech House, Techno"
              />
              <p className="text-xs text-slate-500 mt-1">Separados por comas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                placeholder="Breve descripcion del artista..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </TabsContent>

          <TabsContent value="contract" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de contrato
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) => handleChange('contractType', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="exclusive">Exclusivo</option>
                  <option value="non-exclusive">No exclusivo</option>
                  <option value="per-project">Por proyecto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Comision (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commissionPercentage}
                  onChange={(e) =>
                    handleChange('commissionPercentage', parseInt(e.target.value))
                  }
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Inicio de contrato
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Fin de contrato
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Documento de contrato
              </label>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
                <p className="text-slate-400 text-sm">
                  Arrastra un archivo PDF o haz click para subir
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6 space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg space-y-4">
              <h4 className="font-medium text-white">Manager</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.managerName || ''}
                    onChange={(e) => handleChange('managerName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.managerEmail || ''}
                    onChange={(e) => handleChange('managerEmail', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg space-y-4">
              <h4 className="font-medium text-white">Agente</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.agentName || ''}
                    onChange={(e) => handleChange('agentName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.agentEmail || ''}
                    onChange={(e) => handleChange('agentEmail', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Spotify
              </label>
              <input
                type="url"
                value={formData.spotifyUrl || ''}
                onChange={(e) => handleChange('spotifyUrl', e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                SoundCloud
              </label>
              <input
                type="url"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="https://soundcloud.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                YouTube
              </label>
              <input
                type="url"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Website
              </label>
              <input
                type="url"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="https://..."
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-700 text-slate-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name}
            className="flex-1 bg-pink-600 hover:bg-pink-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
