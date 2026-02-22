import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Auth: validate API key
function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key")
  const expected = process.env.NUCLEUS_API_KEY
  if (!expected) return false
  return apiKey === expected
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 })
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized()

  try {
    const body = await req.json()
    const { action, params = {} } = body

    if (!action) return badRequest("Missing action")

    switch (action) {
      case "get_summary":
        return NextResponse.json(await getSummary())

      case "get_projects":
        return NextResponse.json(await getProjectsList())

      case "get_bookings":
        return NextResponse.json(await getBookingsList(params))

      case "create_booking":
        return NextResponse.json(await createBookingEntry(params))

      case "get_releases":
        return NextResponse.json(await getReleasesList(params))

      case "create_release":
        return NextResponse.json(await createReleaseEntry(params))

      case "get_royalties":
        return NextResponse.json(await getRoyaltiesList(params))

      case "create_royalty":
        return NextResponse.json(await createRoyaltyEntry(params))

      case "get_contracts":
        return NextResponse.json(await getContractsList(params))

      case "trigger_sync":
        return NextResponse.json(await triggerSync(params, req))

      case "sync_observability":
        return NextResponse.json(await syncObservability(params))

      case "get_observability":
        return NextResponse.json(await getObservability())

      default:
        return badRequest(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error("Nucleus API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Also support GET for simple health check
export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorized()
  return NextResponse.json({ status: "ok", service: "a2g-headquarters" })
}

// --- Action handlers ---

async function getSummary() {
  const [projects, bookingsStats, releasesStats, royaltiesStats, contractsStats, audesignKpi] =
    await Promise.all([
      supabaseAdmin.from("projects").select("*").order("name"),
      getBookingsStatsData(),
      getReleasesStatsData(),
      getRoyaltiesStatsData(),
      getContractsStatsData(),
      supabaseAdmin.from("audesign_kpis").select("*").order("period", { ascending: false }).limit(1),
    ])

  return {
    projects: {
      total: projects.data?.length || 0,
      artists: projects.data?.filter((p: any) => p.type === "artist").length || 0,
      verticals: projects.data?.filter((p: any) => p.type === "vertical").length || 0,
      list: projects.data || [],
    },
    bookings: bookingsStats,
    releases: releasesStats,
    royalties: royaltiesStats,
    contracts: contractsStats,
    audesign: audesignKpi.data?.[0] || null,
  }
}

async function getProjectsList() {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .order("name")
  if (error) throw error
  return { projects: data || [] }
}

async function getBookingsList(params: any) {
  let query = supabaseAdmin
    .from("bookings")
    .select("*, projects (name)")
    .order("show_date", { ascending: false })

  if (params.project_id) query = query.eq("project_id", params.project_id)
  if (params.status) query = query.eq("status", params.status)
  if (params.limit) query = query.limit(params.limit)

  const { data, error } = await query
  if (error) throw error

  return {
    bookings: (data || []).map((r: any) => ({
      ...r,
      projectName: r.projects?.name || "Unknown",
      projects: undefined,
    })),
  }
}

async function createBookingEntry(params: any) {
  if (!params.project_id) return { error: "project_id required" }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert(params)
    .select()
    .single()

  if (error) throw error
  return { booking: data }
}

async function getReleasesList(params: any) {
  let query = supabaseAdmin
    .from("releases")
    .select("*, projects (name)")
    .order("created_at", { ascending: false })

  if (params.project_id) query = query.eq("project_id", params.project_id)
  if (params.limit) query = query.limit(params.limit)

  const { data, error } = await query
  if (error) throw error

  return {
    releases: (data || []).map((r: any) => ({
      ...r,
      projectName: r.projects?.name || "Unknown",
      projects: undefined,
    })),
  }
}

async function createReleaseEntry(params: any) {
  if (!params.project_id) return { error: "project_id required" }

  const { data, error } = await supabaseAdmin
    .from("releases")
    .insert(params)
    .select()
    .single()

  if (error) throw error
  return { release: data }
}

async function getRoyaltiesList(params: any) {
  let query = supabaseAdmin
    .from("royalties")
    .select("*, projects (name)")
    .order("created_at", { ascending: false })

  if (params.project_id) query = query.eq("project_id", params.project_id)
  if (params.status) query = query.eq("status", params.status)
  if (params.limit) query = query.limit(params.limit)

  const { data, error } = await query
  if (error) throw error

  return {
    royalties: (data || []).map((r: any) => ({
      ...r,
      projectName: r.projects?.name || "Unknown",
      projects: undefined,
    })),
  }
}

async function createRoyaltyEntry(params: any) {
  if (!params.project_id) return { error: "project_id required" }

  const { data, error } = await supabaseAdmin
    .from("royalties")
    .insert(params)
    .select()
    .single()

  if (error) throw error
  return { royalty: data }
}

async function getContractsList(params: any) {
  let query = supabaseAdmin
    .from("contracts")
    .select("*, projects (name)")
    .order("created_at", { ascending: false })

  if (params.project_id) query = query.eq("project_id", params.project_id)
  if (params.status) query = query.eq("status", params.status)
  if (params.limit) query = query.limit(params.limit)

  const { data, error } = await query
  if (error) throw error

  return {
    contracts: (data || []).map((c: any) => ({
      ...c,
      projectName: c.projects?.name || "Unknown",
      projects: undefined,
    })),
  }
}

async function triggerSync(params: any, req: NextRequest) {
  const { type } = params
  if (!type) return { error: "type required (sheets | integrations)" }

  const baseUrl = req.nextUrl.origin
  const cronSecret = process.env.CRON_SECRET

  let url: string
  if (type === "sheets") {
    url = `${baseUrl}/api/sync-sheets?manual=true`
  } else if (type === "integrations") {
    url = `${baseUrl}/api/sync-integrations?manual=true`
  } else {
    return { error: `Unknown sync type: ${type}` }
  }

  const res = await fetch(url, {
    headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
  })

  const result = await res.json()
  return { sync: { type, status: res.ok ? "triggered" : "failed", result } }
}

// --- Stats helpers (direct DB queries, no server action imports) ---

async function getBookingsStatsData() {
  const { data } = await supabaseAdmin.from("bookings").select("status, fee, fee_currency")
  const all = data || []
  return {
    total: all.length,
    negotiating: all.filter((b: any) => b.status === "negotiating").length,
    confirmed: all.filter((b: any) => b.status === "confirmed").length,
    contracted: all.filter((b: any) => b.status === "contracted").length,
    completed: all.filter((b: any) => b.status === "completed").length,
    cancelled: all.filter((b: any) => b.status === "cancelled").length,
  }
}

async function getReleasesStatsData() {
  const { data } = await supabaseAdmin.from("releases").select("status")
  const all = data || []
  return {
    total: all.length,
    draft: all.filter((r: any) => r.status === "draft").length,
    shopping: all.filter((r: any) => r.status === "shopping").length,
    accepted: all.filter((r: any) => r.status === "accepted").length,
    released: all.filter((r: any) => r.status === "released").length,
  }
}

async function getRoyaltiesStatsData() {
  const { data } = await supabaseAdmin.from("royalties").select("status, amount")
  const all = data || []
  return {
    total: all.length,
    pending: all.filter((r: any) => r.status === "pending").length,
    invoiced: all.filter((r: any) => r.status === "invoiced").length,
    paid: all.filter((r: any) => r.status === "paid").length,
    overdue: all.filter((r: any) => r.status === "overdue").length,
    disputed: all.filter((r: any) => r.status === "disputed").length,
    totalPending: all.filter((r: any) => r.status === "pending" || r.status === "invoiced").reduce((s: number, r: any) => s + Number(r.amount), 0),
    totalPaid: all.filter((r: any) => r.status === "paid").reduce((s: number, r: any) => s + Number(r.amount), 0),
    totalOverdue: all.filter((r: any) => r.status === "overdue").reduce((s: number, r: any) => s + Number(r.amount), 0),
  }
}

async function getContractsStatsData() {
  const { data } = await supabaseAdmin.from("contracts").select("status, value")
  const all = data || []
  return {
    total: all.length,
    draft: all.filter((c: any) => c.status === "draft").length,
    negotiating: all.filter((c: any) => c.status === "negotiating").length,
    active: all.filter((c: any) => c.status === "active").length,
    completed: all.filter((c: any) => c.status === "completed").length,
    totalValue: all.filter((c: any) => c.status === "active" || c.status === "signing").reduce((s: number, c: any) => s + (Number(c.value) || 0), 0),
  }
}

// --- Observability ---

async function syncObservability(params: any) {
  const { timestamp, services, serviceUptime, cronStats, costs, stats } = params

  const { error } = await supabaseAdmin
    .from("nucleus_observability")
    .insert({
      synced_at: timestamp || new Date().toISOString(),
      services: services || {},
      service_uptime: serviceUptime || {},
      cron_stats: cronStats || {},
      costs: costs || {},
      stats: stats || {},
    })

  if (error) throw error
  return { success: true, synced_at: timestamp }
}

async function getObservability() {
  const { data, error } = await supabaseAdmin
    .from("nucleus_observability")
    .select("*")
    .order("synced_at", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return { observability: data || null }
}
