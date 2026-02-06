import type { AbossEvent, AbossFetchParams } from "@/lib/types/aboss"

const ABOSS_API_BASE = "https://data.a-boss.net/v1"

/**
 * Fetches public events from the ABOSS API.
 *
 * Endpoints:
 *   - /artist/{projectId}/public_events
 *   - /agency/{agencyId}/{projectId}/public_events
 *   - /agency/{agencyId}/public_events (all projects)
 */
export async function fetchAbossEvents(
  apiKey: string,
  params: AbossFetchParams
): Promise<AbossEvent[]> {
  const { projectId, agencyId, from, to } = params

  const fromDate = from || new Date().toISOString().split("T")[0]
  const toDate =
    to ||
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  let url: string
  if (agencyId) {
    if (projectId) {
      url = `${ABOSS_API_BASE}/agency/${agencyId}/${projectId}/public_events`
    } else {
      url = `${ABOSS_API_BASE}/agency/${agencyId}/public_events`
    }
  } else {
    url = `${ABOSS_API_BASE}/artist/${projectId}/public_events`
  }

  url += `?from=${fromDate}&to=${toDate}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error")
    throw new Error(
      `ABOSS API error (${response.status}): ${text}`
    )
  }

  const data = await response.json()

  if (!Array.isArray(data)) {
    return []
  }

  return data as AbossEvent[]
}

/**
 * Maps an ABOSS event to the booking fields used in the A2G system.
 */
export function mapAbossEventToBooking(
  event: AbossEvent,
  projectId: string
) {
  const startDate = event.start
    ? new Date(event.start).toISOString().split("T")[0]
    : null

  const statusMap: Record<string, string> = {
    confirmed: "confirmed",
    contracted: "contracted",
    cancelled: "cancelled",
    completed: "completed",
    option: "negotiating",
    pencil: "negotiating",
  }

  const bookingStatus =
    statusMap[event.status?.toLowerCase()] || "confirmed"

  return {
    project_id: projectId,
    venue: event.title || event.venue || "Unknown Venue",
    city: event.city || "TBD",
    country: event.country || "TBD",
    fee: event.fee ? String(event.fee) : null,
    fee_currency: event.currency || "EUR",
    status: bookingStatus as
      | "negotiating"
      | "confirmed"
      | "contracted"
      | "completed"
      | "cancelled",
    show_date: startDate,
    notes: [
      event.ticketLink ? `Tickets: ${event.ticketLink}` : "",
      event.tba ? "TBA" : "",
      event.notes || "",
      `Imported from ABOSS on ${new Date().toISOString().split("T")[0]}`,
    ]
      .filter(Boolean)
      .join(" | "),
  }
}
