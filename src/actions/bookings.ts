"use server"

import { db, bookings, projects, type Booking, type NewBooking } from "@/src/db"
import { eq, desc, sql, gte, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getBookingsByProject(projectId: string): Promise<Booking[]> {
  try {
    const result = await db
      .select()
      .from(bookings)
      .where(eq(bookings.projectId, projectId))
      .orderBy(desc(bookings.showDate))
    return result
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const result = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.showDate))
    return result
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

export async function getBooking(id: string): Promise<Booking | null> {
  try {
    const result = await db.select().from(bookings).where(eq(bookings.id, id))
    return result[0] || null
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

export async function createBooking(data: NewBooking): Promise<Booking | null> {
  try {
    const result = await db.insert(bookings).values(data).returning()
    revalidatePath("/bookings")
    return result[0] || null
  } catch (error) {
    console.error("Error creating booking:", error)
    return null
  }
}

export async function updateBooking(
  id: string,
  data: Partial<Omit<Booking, "id" | "createdAt">>
): Promise<Booking | null> {
  try {
    const result = await db
      .update(bookings)
      .set(data)
      .where(eq(bookings.id, id))
      .returning()
    revalidatePath("/bookings")
    return result[0] || null
  } catch (error) {
    console.error("Error updating booking:", error)
    return null
  }
}

export async function deleteBooking(id: string): Promise<boolean> {
  try {
    await db.delete(bookings).where(eq(bookings.id, id))
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
    const result = await db
      .select({
        booking: bookings,
        projectName: projects.name,
      })
      .from(bookings)
      .leftJoin(projects, eq(bookings.projectId, projects.id))
      .orderBy(desc(bookings.showDate))

    return result.map((r) => ({
      ...r.booking,
      projectName: r.projectName || "Unknown",
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
    const result = await db
      .select({
        booking: bookings,
        projectName: projects.name,
      })
      .from(bookings)
      .leftJoin(projects, eq(bookings.projectId, projects.id))
      .where(
        and(
          gte(bookings.showDate, today),
          eq(bookings.status, "confirmed")
        )
      )
      .orderBy(bookings.showDate)
      .limit(limit)

    return result.map((r) => ({
      ...r.booking,
      projectName: r.projectName || "Unknown",
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
