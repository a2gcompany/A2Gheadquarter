"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Music,
  CalendarDays,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { getProjects, Project } from "@/src/actions/projects"
import { getAllReleases } from "@/src/actions/releases"
import { getUpcomingBookings } from "@/src/actions/bookings"

type Release = {
  id: string
  project_id: string
  track_name: string
  status: string
}

type Booking = {
  id: string
  project_id: string
  venue: string
  city: string
  country: string
  show_date: string | null
  fee: number | null
  fee_currency: string
}

export default function TalentsDashboard() {
  const [loading, setLoading] = useState(true)
  const [artists, setArtists] = useState<Project[]>([])
  const [releases, setReleases] = useState<Release[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsData, releasesData, bookingsData] = await Promise.all([
          getProjects(),
          getAllReleases(),
          getUpcomingBookings(5),
        ])

        setArtists(projectsData.filter(p => p.type === "artist"))
        setReleases(releasesData)
        setUpcomingBookings(bookingsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const shoppingReleases = releases.filter(r => r.status === "shopping")
  const totalBookingRevenue = upcomingBookings.reduce((sum, b) => sum + (Number(b.fee) || 0), 0)

  const getArtistName = (projectId: string) => {
    return artists.find(a => a.id === projectId)?.name || "Unknown"
  }

  const getArtistStats = (artistId: string) => {
    const artistReleases = releases.filter(r => r.project_id === artistId)
    const artistBookings = upcomingBookings.filter(b => b.project_id === artistId)
    return {
      releases: artistReleases.length,
      bookings: artistBookings.length,
    }
  }

  if (loading) {
    return (
      <AppLayout title="A2G Talents">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="A2G Talents">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Artistas</p>
                  <p className="text-2xl font-bold">{artists.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Music className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Releases</p>
                  <p className="text-2xl font-bold">{releases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Shows</p>
                  <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booking Revenue</p>
                  <p className="text-2xl font-bold">{totalBookingRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Artists Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Artistas</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/talents/artists">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {artists.map(artist => {
              const stats = getArtistStats(artist.id)
              return (
                <Card key={artist.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{artist.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                      <span>{stats.releases} releases</span>
                      <span>{stats.bookings} bookings</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/talents/artists/${artist.id}`}>
                        Gestionar
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Shows */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Proximos Shows</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/talents/bookings">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay shows programados</p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{booking.venue}</p>
                        <p className="text-xs text-muted-foreground">
                          {getArtistName(booking.project_id)} - {booking.city}, {booking.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {booking.fee ? `${booking.fee_currency} ${Number(booking.fee).toLocaleString()}` : "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.show_date ? new Date(booking.show_date).toLocaleDateString() : "TBD"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Releases in Shopping */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Releases en Shopping</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/talents/releases">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {shoppingReleases.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay releases en shopping</p>
              ) : (
                <div className="space-y-3">
                  {shoppingReleases.slice(0, 5).map(release => (
                    <div key={release.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{release.track_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getArtistName(release.project_id)}
                        </p>
                      </div>
                      <Badge variant="secondary">Shopping</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
