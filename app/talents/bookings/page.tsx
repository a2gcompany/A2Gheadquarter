"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { BookingsTable } from "@/components/bookings/bookings-table"
import { BookingsStats } from "@/components/bookings/bookings-stats"
import { BookingForm } from "@/components/bookings/booking-form"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { getProjects, type Project } from "@/src/actions/projects"
import { getAllBookingsWithProject, type Booking } from "@/src/actions/bookings"

export default function TalentsBookingsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [bookings, setBookings] = useState<(Booking & { projectName: string })[]>([])
  const [stats, setStats] = useState({
    total: 0,
    negotiating: 0,
    confirmed: 0,
    contracted: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [projectsData, bookingsData] = await Promise.all([
        getProjects(),
        getAllBookingsWithProject(),
      ])
      // Filter to only artist projects
      const artistProjects = projectsData.filter(p => p.type === "artist")
      const artistProjectIds = artistProjects.map(p => p.id)
      const artistBookings = bookingsData.filter(b => artistProjectIds.includes(b.project_id))

      setProjects(artistProjects)
      setBookings(artistBookings)

      // Calculate stats for artists only
      const artistStats = {
        total: artistBookings.length,
        negotiating: artistBookings.filter(b => b.status === "negotiating").length,
        confirmed: artistBookings.filter(b => b.status === "confirmed").length,
        contracted: artistBookings.filter(b => b.status === "contracted").length,
        completed: artistBookings.filter(b => b.status === "completed").length,
        cancelled: artistBookings.filter(b => b.status === "cancelled").length,
        totalRevenue: artistBookings
          .filter(b => b.status === "completed" || b.status === "contracted")
          .reduce((sum, b) => sum + (Number(b.fee) || 0), 0),
      }
      setStats(artistStats)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateNew = () => {
    setEditingBooking(null)
    setFormOpen(true)
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setFormOpen(true)
  }

  return (
    <AppLayout title="Bookings - A2G Talents">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bookings</h1>
            <p className="text-muted-foreground">
              Shows y eventos de todos los artistas
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Booking
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <BookingsStats stats={stats} />

            {/* Table */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Todos los Bookings</h2>
              <BookingsTable
                bookings={bookings}
                onRefresh={loadData}
                onEdit={handleEdit}
              />
            </div>
          </>
        )}
      </div>

      {/* Form Dialog */}
      <BookingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        projects={projects}
        booking={editingBooking}
        onSuccess={loadData}
      />
    </AppLayout>
  )
}
