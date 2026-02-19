"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Music,
  CalendarDays,
  TrendingUp,
  Loader2,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { getProjects, Project } from "@/src/actions/projects"
import { getAllReleases } from "@/src/actions/releases"
import { getAllBookings } from "@/src/actions/bookings"

export default function ArtistsPage() {
  const [loading, setLoading] = useState(true)
  const [artists, setArtists] = useState<Project[]>([])
  const [releases, setReleases] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsData, releasesData, bookingsData] = await Promise.all([
          getProjects(),
          getAllReleases(),
          getAllBookings(),
        ])

        setArtists(projectsData.filter(p => p.type === "artist"))
        setReleases(releasesData)
        setBookings(bookingsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getArtistStats = (artistId: string) => {
    const artistReleases = releases.filter(r => r.project_id === artistId)
    const artistBookings = bookings.filter(b => b.project_id === artistId)
    const upcomingBookings = artistBookings.filter(b =>
      b.show_date && new Date(b.show_date) >= new Date() &&
      ["confirmed", "contracted"].includes(b.status)
    )
    const totalRevenue = artistBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + (Number(b.fee) || 0), 0)

    return {
      totalReleases: artistReleases.length,
      shoppingReleases: artistReleases.filter(r => r.status === "shopping").length,
      releasedTracks: artistReleases.filter(r => r.status === "released").length,
      totalBookings: artistBookings.length,
      upcomingShows: upcomingBookings.length,
      completedShows: artistBookings.filter(b => b.status === "completed").length,
      totalRevenue,
    }
  }

  if (loading) {
    return (
      <AppLayout title="Artistas">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Artistas">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gestiona los {artists.length} artistas de A2G Talents
          </p>
        </div>

        <div className="grid gap-6">
          {artists.map(artist => {
            const stats = getArtistStats(artist.id)
            return (
              <Card key={artist.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle>{artist.name}</CardTitle>
                    <Button asChild>
                      <Link href={`/talents/artists/${artist.id}`}>
                        Gestionar <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Releases */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Music className="h-4 w-4" />
                        <span className="text-sm font-medium">Releases</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.totalReleases}</p>
                      <div className="flex gap-2">
                        {stats.shoppingReleases > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {stats.shoppingReleases} shopping
                          </Badge>
                        )}
                        {stats.releasedTracks > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {stats.releasedTracks} released
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Bookings */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-sm font-medium">Bookings</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.totalBookings}</p>
                      <div className="flex gap-2">
                        {stats.upcomingShows > 0 && (
                          <Badge className="text-xs bg-blue-500">
                            {stats.upcomingShows} upcoming
                          </Badge>
                        )}
                        {stats.completedShows > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {stats.completedShows} completed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">Revenue</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {stats.totalRevenue > 0 ? `€${stats.totalRevenue.toLocaleString()}` : "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">From completed shows</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">Acciones</span>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/talents/artists/${artist.id}?tab=releases`}>
                            Ver Releases
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/talents/artists/${artist.id}?tab=bookings`}>
                            Ver Bookings
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
