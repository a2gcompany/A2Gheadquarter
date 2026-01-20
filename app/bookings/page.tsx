"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { BookingsTable } from "@/components/bookings/bookings-table"
import { BookingsStats } from "@/components/bookings/bookings-stats"
import { BookingForm } from "@/components/bookings/booking-form"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { type Project, type Booking } from "@/src/db/schema"
import { getProjects } from "@/src/actions/projects"
import { getAllBookingsWithProject, getBookingsStats } from "@/src/actions/bookings"

export default function BookingsPage() {
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
      const [projectsData, bookingsData, statsData] = await Promise.all([
        getProjects(),
        getAllBookingsWithProject(),
        getBookingsStats(),
      ])
      setProjects(projectsData)
      setBookings(bookingsData)
      setStats(statsData)
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
    <AppLayout title="Bookings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bookings</h1>
            <p className="text-muted-foreground">
              Gestiona los shows y eventos de tus artistas
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
