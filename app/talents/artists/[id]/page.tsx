"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Music,
  CalendarDays,
  TrendingUp,
  Receipt,
  Loader2,
  ArrowLeft,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { getProject, Project } from "@/src/actions/projects"
import { getReleasesByProject, type Release } from "@/src/actions/releases"
import { getBookingsByProject, type Booking } from "@/src/actions/bookings"
import { getTransactionsByProject, getProjectPL } from "@/src/actions/transactions"
import { ReleasesTable } from "@/components/releases/releases-table"
import { ReleaseForm } from "@/components/releases/release-form"
import { LabelsDialog } from "@/components/releases/labels-dialog"
import { BookingsTable } from "@/components/bookings/bookings-table"
import { BookingForm } from "@/components/bookings/booking-form"
import { TransactionsTable } from "@/components/accounting/transactions-table"

export default function ArtistDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const artistId = params.id as string
  const initialTab = searchParams.get("tab") || "dashboard"

  const [loading, setLoading] = useState(true)
  const [artist, setArtist] = useState<Project | null>(null)
  const [releases, setReleases] = useState<Release[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [pl, setPl] = useState({ income: 0, expense: 0, balance: 0 })
  const [activeTab, setActiveTab] = useState(initialTab)

  // Form dialog states
  const [releaseFormOpen, setReleaseFormOpen] = useState(false)
  const [editingRelease, setEditingRelease] = useState<Release | null>(null)
  const [labelsDialogOpen, setLabelsDialogOpen] = useState(false)
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)

  const [bookingFormOpen, setBookingFormOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  const loadData = async () => {
    try {
      const [artistData, releasesData, bookingsData, transactionsData, plData] = await Promise.all([
        getProject(artistId),
        getReleasesByProject(artistId),
        getBookingsByProject(artistId),
        getTransactionsByProject(artistId),
        getProjectPL(artistId),
      ])

      setArtist(artistData)
      setReleases(releasesData)
      setBookings(bookingsData)
      setTransactions(transactionsData)
      setPl(plData)
    } catch (error) {
      console.error("Error loading artist data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [artistId])

  // Add projectName to releases and bookings for table display
  const releasesWithProject = releases.map(r => ({
    ...r,
    projectName: artist?.name || ""
  }))

  const bookingsWithProject = bookings.map(b => ({
    ...b,
    projectName: artist?.name || ""
  }))

  const upcomingBookings = bookings.filter(b =>
    b.show_date && new Date(b.show_date) >= new Date() &&
    ["confirmed", "contracted"].includes(b.status)
  )

  const activeReleases = releases.filter(r => ["shopping", "accepted"].includes(r.status))

  // Release form handlers
  const handleCreateRelease = () => {
    setEditingRelease(null)
    setReleaseFormOpen(true)
  }

  const handleEditRelease = (release: Release) => {
    setEditingRelease(release)
    setReleaseFormOpen(true)
  }

  const handleViewLabels = (release: Release) => {
    setSelectedRelease(release)
    setLabelsDialogOpen(true)
  }

  // Booking form handlers
  const handleCreateBooking = () => {
    setEditingBooking(null)
    setBookingFormOpen(true)
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setBookingFormOpen(true)
  }

  if (loading) {
    return (
      <AppLayout title="Cargando...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  if (!artist) {
    return (
      <AppLayout title="Artista no encontrado">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No se encontro el artista</p>
          <Button asChild>
            <Link href="/talents/artists">Volver a Artistas</Link>
          </Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={artist.name}>
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/talents/artists">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Artistas
          </Link>
        </Button>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="releases">Releases</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="accounting">Contabilidad</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <p className="text-sm text-muted-foreground">Bookings</p>
                      <p className="text-2xl font-bold">{bookings.length}</p>
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
                      <p className="text-sm text-muted-foreground">Ingresos</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {pl.income.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className={`text-2xl font-bold ${pl.balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {pl.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Two columns */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upcoming Shows */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proximos Shows</CardTitle>
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
                              {booking.city}, {booking.country}
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

              {/* Active Releases */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Releases Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeReleases.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay releases activos</p>
                  ) : (
                    <div className="space-y-3">
                      {activeReleases.map(release => (
                        <div key={release.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium text-sm">{release.track_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {release.status}
                            </p>
                          </div>
                          {release.release_date && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(release.release_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Releases Tab */}
          <TabsContent value="releases" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleCreateRelease}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Release
              </Button>
            </div>
            <ReleasesTable
              releases={releasesWithProject}
              onRefresh={loadData}
              onEdit={handleEditRelease}
              onViewLabels={handleViewLabels}
            />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleCreateBooking}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Booking
              </Button>
            </div>
            <BookingsTable
              bookings={bookingsWithProject}
              onRefresh={loadData}
              onEdit={handleEditBooking}
            />
          </TabsContent>

          {/* Accounting Tab */}
          <TabsContent value="accounting" className="space-y-4">
            {/* P&L Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {pl.income.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Gastos</p>
                  <p className="text-2xl font-bold text-red-500">
                    {pl.expense.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className={`text-2xl font-bold ${pl.balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {pl.balance.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            <TransactionsTable
              transactions={transactions}
              onRefresh={loadData}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Release Form Dialog */}
      <ReleaseForm
        open={releaseFormOpen}
        onOpenChange={setReleaseFormOpen}
        projects={[artist]}
        release={editingRelease}
        onSuccess={loadData}
      />

      {/* Labels Dialog */}
      <LabelsDialog
        open={labelsDialogOpen}
        onOpenChange={setLabelsDialogOpen}
        release={selectedRelease}
        onSuccess={loadData}
      />

      {/* Booking Form Dialog */}
      <BookingForm
        open={bookingFormOpen}
        onOpenChange={setBookingFormOpen}
        projects={[artist]}
        booking={editingBooking}
        onSuccess={loadData}
      />
    </AppLayout>
  )
}
