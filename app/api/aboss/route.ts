import { NextRequest, NextResponse } from "next/server"
import { fetchAbossEvents, mapAbossEventToBooking } from "@/lib/services/aboss-service"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * GET /api/aboss?projectId=X&agencyId=Y&from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Preview ABOSS events without importing them.
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ABOSS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "ABOSS_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId") || process.env.ABOSS_PROJECT_ID
    const agencyId = searchParams.get("agencyId") || process.env.ABOSS_AGENCY_ID
    const from = searchParams.get("from") || undefined
    const to = searchParams.get("to") || undefined

    if (!projectId && !agencyId) {
      return NextResponse.json(
        { success: false, error: "Either projectId or agencyId is required" },
        { status: 400 }
      )
    }

    const events = await fetchAbossEvents(apiKey, {
      projectId: projectId || "",
      agencyId: agencyId || undefined,
      from,
      to,
    })

    return NextResponse.json({
      success: true,
      totalEvents: events.length,
      events,
    })
  } catch (error) {
    console.error("ABOSS fetch error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/aboss
 *
 * Fetch ABOSS events and import them as bookings into the database.
 *
 * Body: {
 *   projectId?: string,    // ABOSS project ID
 *   agencyId?: string,     // ABOSS agency ID
 *   a2gProjectId: string,  // A2G internal project ID to associate bookings with
 *   from?: string,         // Start date (YYYY-MM-DD)
 *   to?: string,           // End date (YYYY-MM-DD)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ABOSS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "ABOSS_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      projectId: abossProjectId,
      agencyId: abossAgencyId,
      a2gProjectId,
      from,
      to,
    } = body

    const projectId = abossProjectId || process.env.ABOSS_PROJECT_ID
    const agencyId = abossAgencyId || process.env.ABOSS_AGENCY_ID

    if (!projectId && !agencyId) {
      return NextResponse.json(
        { success: false, error: "Either projectId or agencyId is required" },
        { status: 400 }
      )
    }

    if (!a2gProjectId) {
      return NextResponse.json(
        { success: false, error: "a2gProjectId is required to map bookings" },
        { status: 400 }
      )
    }

    // Verify the A2G project exists
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("id, name")
      .eq("id", a2gProjectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: `A2G project not found: ${a2gProjectId}` },
        { status: 404 }
      )
    }

    const details: string[] = []
    details.push(`Fetching events from ABOSS for project "${project.name}"...`)

    // Fetch events from ABOSS
    const events = await fetchAbossEvents(apiKey, {
      projectId: projectId || "",
      agencyId: agencyId || undefined,
      from,
      to,
    })

    details.push(`Found ${events.length} events from ABOSS`)

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No events found in ABOSS for the given parameters",
        totalFetched: 0,
        imported: 0,
        skipped: 0,
        errors: [],
        details,
      })
    }

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const event of events) {
      const bookingData = mapAbossEventToBooking(event, a2gProjectId)

      // Check for duplicates by matching venue + show_date + project
      if (bookingData.show_date) {
        const { data: existing } = await supabaseAdmin
          .from("bookings")
          .select("id")
          .eq("project_id", a2gProjectId)
          .eq("venue", bookingData.venue)
          .eq("show_date", bookingData.show_date)
          .limit(1)

        if (existing && existing.length > 0) {
          skipped++
          details.push(`  Skipped (duplicate): "${bookingData.venue}" on ${bookingData.show_date}`)
          continue
        }
      }

      const { error: insertError } = await supabaseAdmin
        .from("bookings")
        .insert(bookingData)

      if (insertError) {
        errors.push(`Failed to import "${bookingData.venue}": ${insertError.message}`)
        details.push(`  Error: "${bookingData.venue}" - ${insertError.message}`)
      } else {
        imported++
        details.push(`  Imported: "${bookingData.venue}" on ${bookingData.show_date || "TBD"}`)
      }
    }

    details.push("")
    details.push(`Import complete: ${imported} imported, ${skipped} skipped, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${imported} events from ABOSS`,
      totalFetched: events.length,
      imported,
      skipped,
      errors,
      details,
    })
  } catch (error) {
    console.error("ABOSS import error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
