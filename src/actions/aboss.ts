"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { fetchAbossEvents, mapAbossEventToBooking } from "@/lib/services/aboss-service"

export async function getAbossConfig() {
  return {
    hasApiKey: !!process.env.ABOSS_API_KEY,
    defaultProjectId: process.env.ABOSS_PROJECT_ID || "",
    defaultAgencyId: process.env.ABOSS_AGENCY_ID || "",
  }
}

export async function previewAbossEvents(params: {
  projectId?: string
  agencyId?: string
  from?: string
  to?: string
}) {
  const apiKey = process.env.ABOSS_API_KEY
  if (!apiKey) {
    return { success: false as const, error: "ABOSS_API_KEY is not configured" }
  }

  const projectId = params.projectId || process.env.ABOSS_PROJECT_ID || ""
  const agencyId = params.agencyId || process.env.ABOSS_AGENCY_ID

  if (!projectId && !agencyId) {
    return { success: false as const, error: "Either projectId or agencyId is required" }
  }

  try {
    const events = await fetchAbossEvents(apiKey, {
      projectId,
      agencyId,
      from: params.from,
      to: params.to,
    })

    return { success: true as const, events, totalEvents: events.length }
  } catch (error) {
    return { success: false as const, error: String(error) }
  }
}

export async function importAbossEvents(params: {
  projectId?: string
  agencyId?: string
  a2gProjectId: string
  from?: string
  to?: string
}) {
  const apiKey = process.env.ABOSS_API_KEY
  if (!apiKey) {
    return { success: false as const, error: "ABOSS_API_KEY is not configured" }
  }

  const projectId = params.projectId || process.env.ABOSS_PROJECT_ID || ""
  const agencyId = params.agencyId || process.env.ABOSS_AGENCY_ID

  if (!projectId && !agencyId) {
    return { success: false as const, error: "Either projectId or agencyId is required" }
  }

  if (!params.a2gProjectId) {
    return { success: false as const, error: "A2G project ID is required" }
  }

  try {
    // Verify project exists
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("id, name")
      .eq("id", params.a2gProjectId)
      .single()

    if (projectError || !project) {
      return { success: false as const, error: "A2G project not found" }
    }

    const events = await fetchAbossEvents(apiKey, {
      projectId,
      agencyId,
      from: params.from,
      to: params.to,
    })

    if (events.length === 0) {
      return {
        success: true as const,
        message: "No events found in ABOSS",
        imported: 0,
        skipped: 0,
        total: 0,
      }
    }

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const event of events) {
      const bookingData = mapAbossEventToBooking(event, params.a2gProjectId)

      // Duplicate check
      if (bookingData.show_date) {
        const { data: existing } = await supabaseAdmin
          .from("bookings")
          .select("id")
          .eq("project_id", params.a2gProjectId)
          .eq("venue", bookingData.venue)
          .eq("show_date", bookingData.show_date)
          .limit(1)

        if (existing && existing.length > 0) {
          skipped++
          continue
        }
      }

      const { error: insertError } = await supabaseAdmin
        .from("bookings")
        .insert(bookingData)

      if (insertError) {
        errors.push(`"${bookingData.venue}": ${insertError.message}`)
      } else {
        imported++
      }
    }

    revalidatePath("/bookings")
    revalidatePath("/talents/bookings")
    revalidatePath("/aboss")

    return {
      success: true as const,
      message: `Imported ${imported} events from ABOSS`,
      imported,
      skipped,
      total: events.length,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    return { success: false as const, error: String(error) }
  }
}

export async function getA2GProjects() {
  try {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("id, name, type")
      .order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}
