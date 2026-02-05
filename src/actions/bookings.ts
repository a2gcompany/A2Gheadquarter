"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type Booking = {
  id: string
  project_id: string
  venue: string
  city: string
  country: string
  fee: string | null
  fee_currency: string | null
  status: "negotiating" | "confirmed" | "contracted" | "completed" | "cancelled"
  show_date: string | null
  notes: string | null
  created_at: string
}

export type NewBooking = Omit<Booking, "id" | "created_at">

export async function getBookingsByProject(projectId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("project_id", projectId)
      .order("show_date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("show_date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

export async function getBooking(id: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

export async function createBooking(data: NewBooking): Promise<Booking | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("bookings")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/bookings")
    return result
  } catch (error) {
    console.error("Error creating booking:", error)
    return null
  }
}

export async function updateBooking(
  id: string,
  data: Partial<Omit<Booking, "id" | "created_at">>
): Promise<Booking | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("bookings")
      .update(data)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/bookings")
    return result
  } catch (error) {
    console.error("Error updating booking:", error)
    return null
  }
}

export async function deleteBooking(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", id)

    if (error) throw error
    revalidatePath("/bookings")
    return true
  } catch (error) {
    console.error("Error deleting booking:", error)
    return false
  }
}

// Get bookings with project info
export async function getAllBookingsWithProject() {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        projects (name)
      `)
      .order("show_date", { ascending: false })

    if (error) throw error

    return (data || []).map((r: any) => ({
      ...r,
      projectName: r.projects?.name || "Unknown",
      projects: undefined,
    }))
  } catch (error) {
    console.error("Error fetching bookings with project:", error)
    return []
  }
}

// Get upcoming bookings (shows in the future)
export async function getUpcomingBookings(limit = 10) {
  try {
    const today = new Date().toISOString().split("T")[0]
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        projects (name)
      `)
      .gte("show_date", today)
      .in("status", ["confirmed", "contracted"])
      .order("show_date", { ascending: true })
      .limit(limit)

    if (error) throw error

    return (data || []).map((r: any) => ({
      ...r,
      projectName: r.projects?.name || "Unknown",
      projects: undefined,
    }))
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error)
    return []
  }
}

// Stats for dashboard
export async function getBookingsStats() {
  try {
    const allBookings = await getAllBookings()

    const stats = {
      total: allBookings.length,
      negotiating: allBookings.filter((b) => b.status === "negotiating").length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      contracted: allBookings.filter((b) => b.status === "contracted").length,
      completed: allBookings.filter((b) => b.status === "completed").length,
      cancelled: allBookings.filter((b) => b.status === "cancelled").length,
    }

    // Calculate total revenue from completed/contracted bookings
    const revenueBookings = allBookings.filter(
      (b) => b.status === "completed" || b.status === "contracted"
    )
    const totalRevenue = revenueBookings.reduce(
      (acc, b) => acc + parseFloat(b.fee || "0"),
      0
    )

    return { ...stats, totalRevenue }
  } catch (error) {
    console.error("Error fetching bookings stats:", error)
    return {
      total: 0,
      negotiating: 0,
      confirmed: 0,
      contracted: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0,
    }
  }
}
