"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getLatestObservability() {
  const { data, error } = await supabaseAdmin
    .from("nucleus_observability")
    .select("*")
    .order("synced_at", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Failed to fetch observability:", error)
    return null
  }

  return data
}

export async function getObservabilityHistory(hours = 24) {
  const since = new Date(Date.now() - hours * 3600000).toISOString()

  const { data, error } = await supabaseAdmin
    .from("nucleus_observability")
    .select("synced_at, services, service_uptime, costs, stats")
    .gte("synced_at", since)
    .order("synced_at", { ascending: true })

  if (error) {
    console.error("Failed to fetch observability history:", error)
    return []
  }

  return data || []
}
