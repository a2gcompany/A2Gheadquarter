// ABOSS API types
// Based on the ABOSS public events API at https://data.a-boss.net/v1/

export interface AbossEvent {
  id?: string
  title: string
  start: string // ISO date string
  end: string // ISO date string
  status: string
  tba: boolean
  ticketLink?: string | null
  // Additional fields that the API may return
  venue?: string | null
  city?: string | null
  country?: string | null
  promoter?: string | null
  fee?: number | null
  currency?: string | null
  notes?: string | null
  [key: string]: unknown // Allow additional fields from the API
}

export interface AbossConfig {
  apiKey: string
  agencyId?: string
  projectId?: string
}

export interface AbossFetchParams {
  projectId: string
  agencyId?: string
  from?: string // YYYY-MM-DD
  to?: string // YYYY-MM-DD
}

export interface AbossScrapeResult {
  success: boolean
  events: AbossEvent[]
  totalFetched: number
  imported: number
  skipped: number
  errors: string[]
  details: string[]
}
