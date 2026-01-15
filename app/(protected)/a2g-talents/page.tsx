'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Calendar,
  Music,
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  MapPin,
  Clock,
} from 'lucide-react'
import { ArtistCard } from '@/components/a2g-talents/artist-card'
import { ArtistModal } from '@/components/a2g-talents/artist-modal'
import { BookingsCalendar } from '@/components/a2g-talents/bookings-calendar'
import { cn } from '@/lib/utils'

// Mock data
const mockArtists = [
  {
    id: '1',
    name: 'Roger Sanchez',
    stageName: 'Roger Sanchez',
    photoUrl: null,
    status: 'active' as const,
    genres: ['House', 'Tech House'],
    commissionPercentage: 15,
    upcomingBookings: 5,
    totalEarnings: 125000,
    contractType: 'exclusive',
    spotifyUrl: 'https://open.spotify.com/artist/xxx',
    instagramUrl: 'https://instagram.com/rogersanchez',
  },
  {
    id: '2',
    name: 'DJ Snake',
    stageName: 'DJ Snake',
    photoUrl: null,
    status: 'active' as const,
    genres: ['EDM', 'Trap'],
    commissionPercentage: 12,
    upcomingBookings: 8,
    totalEarnings: 280000,
    contractType: 'non-exclusive',
    spotifyUrl: 'https://open.spotify.com/artist/yyy',
    instagramUrl: 'https://instagram.com/djsnake',
  },
  {
    id: '3',
    name: 'Charlotte de Witte',
    stageName: 'Charlotte de Witte',
    photoUrl: null,
    status: 'active' as const,
    genres: ['Techno'],
    commissionPercentage: 15,
    upcomingBookings: 3,
    totalEarnings: 95000,
    contractType: 'exclusive',
    spotifyUrl: 'https://open.spotify.com/artist/zzz',
    instagramUrl: 'https://instagram.com/charlottedewitte',
  },
]

const stats = {
  totalArtists: 12,
  activeArtists: 10,
  upcomingBookings: 24,
  totalRevenue: 485000,
  totalCommissions: 62500,
}

export default function A2GTalentsPage() {
  const [activeTab, setActiveTab] = useState('roster')
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<typeof mockArtists[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const filteredArtists = mockArtists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.stageName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditArtist = (artist: typeof mockArtists[0]) => {
    setSelectedArtist(artist)
    setIsArtistModalOpen(true)
  }

  const handleNewArtist = () => {
    setSelectedArtist(null)
    setIsArtistModalOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">A2G Talents</h1>
          <p className="text-slate-400 mt-1">
            Artist Management - Roster, Bookings & Releases
          </p>
        </div>
        <Button onClick={handleNewArtist} className="bg-pink-600 hover:bg-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Artista
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-pink-400" />
              <p className="text-xs text-slate-400">Artistas</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalArtists}</p>
            <p className="text-xs text-slate-500">{stats.activeArtists} activos</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-slate-400">Bookings</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.upcomingBookings}</p>
            <p className="text-xs text-slate-500">proximos</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <p className="text-xs text-slate-400">Revenue</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-slate-500">este ano</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-slate-400">Comisiones</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalCommissions)}</p>
            <p className="text-xs text-slate-500">este ano</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 hidden lg:block">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-slate-400">Releases</p>
            </div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-xs text-slate-500">proximos 3 meses</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/50 border border-slate-800">
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="releases">Releases</TabsTrigger>
          <TabsTrigger value="accounting">Contabilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="mt-6 space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar artista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <Button variant="outline" className="border-slate-700 text-slate-400">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Artist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onEdit={() => handleEditArtist(artist)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <BookingsCalendar />
        </TabsContent>

        <TabsContent value="releases" className="mt-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <Music className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Music Releases</h3>
              <p className="text-slate-400 mb-4">Proximamente: calendario de lanzamientos</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="mt-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Contabilidad por Artista</h3>
              <p className="text-slate-400 mb-4">Proximamente: ingresos vs comisiones</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Artist Modal */}
      <ArtistModal
        isOpen={isArtistModalOpen}
        onClose={() => {
          setIsArtistModalOpen(false)
          setSelectedArtist(null)
        }}
        artist={selectedArtist}
      />
    </div>
  )
}
