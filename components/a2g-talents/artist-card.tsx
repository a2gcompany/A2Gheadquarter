'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Calendar,
  DollarSign,
  Edit,
  ExternalLink,
  Instagram,
  MoreVertical,
  Music,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Artist {
  id: string
  name: string
  stageName: string | null
  photoUrl: string | null
  status: 'active' | 'inactive' | 'pending' | 'archived'
  genres: string[]
  commissionPercentage: number
  upcomingBookings: number
  totalEarnings: number
  contractType: string
  spotifyUrl?: string
  instagramUrl?: string
}

interface ArtistCardProps {
  artist: Artist
  onEdit: () => void
}

export function ArtistCard({ artist, onEdit }: ArtistCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 group overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-pink-600/30 via-purple-600/30 to-indigo-600/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),transparent)]" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full border',
                getStatusColor(artist.status)
              )}
            >
              {artist.status === 'active' ? 'Activo' : artist.status}
            </span>
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 rounded-lg bg-slate-900/50 backdrop-blur-sm text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuItem onClick={onEdit} className="text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Bookings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-10 left-6">
            {artist.photoUrl ? (
              <img
                src={artist.photoUrl}
                alt={artist.name}
                className="w-20 h-20 rounded-xl border-4 border-slate-900 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl border-4 border-slate-900 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {getInitials(artist.stageName || artist.name)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-14">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {artist.stageName || artist.name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {artist.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {artist.spotifyUrl && (
                <a
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800 text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <Music className="w-4 h-4" />
                </a>
              )}
              {artist.instagramUrl && (
                <a
                  href={artist.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800 text-pink-400 hover:bg-pink-500/20 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-xs text-slate-500">Bookings</p>
              <p className="text-lg font-semibold text-white">{artist.upcomingBookings}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Comision</p>
              <p className="text-lg font-semibold text-white">{artist.commissionPercentage}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Earnings</p>
              <p className="text-lg font-semibold text-green-400">
                {formatCurrency(artist.totalEarnings)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
