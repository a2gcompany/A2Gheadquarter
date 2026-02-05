"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type AudesignKPI = {
  id: string
  period: string
  mrr: number | null
  active_users: number
  new_users: number
  churned_users: number
  stripe_revenue: number | null
  paypal_revenue: number | null
  conversion_rate: number | null
  arpu: number | null
  notes: string | null
  created_at: string
}

export async function getAudesignKPIs(limit?: number): Promise<AudesignKPI[]> {
  let query = supabaseAdmin
    .from("audesign_kpis")
    .select("*")
    .order("period", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching Audesign KPIs:", error)
    return []
  }

  return data || []
}

export async function getLatestAudesignKPI(): Promise<AudesignKPI | null> {
  const { data, error } = await supabaseAdmin
    .from("audesign_kpis")
    .select("*")
    .order("period", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("Error fetching latest Audesign KPI:", error)
    return null
  }

  return data
}

export async function getAudesignKPIByPeriod(period: string): Promise<AudesignKPI | null> {
  const { data, error } = await supabaseAdmin
    .from("audesign_kpis")
    .select("*")
    .eq("period", period)
    .single()

  if (error) {
    console.error("Error fetching Audesign KPI by period:", error)
    return null
  }

  return data
}

export async function createAudesignKPI(data: {
  period: string
  mrr?: number
  active_users?: number
  new_users?: number
  churned_users?: number
  stripe_revenue?: number
  paypal_revenue?: number
  conversion_rate?: number
  arpu?: number
  notes?: string
}): Promise<AudesignKPI | null> {
  const { data: newKPI, error } = await supabaseAdmin
    .from("audesign_kpis")
    .insert({
      ...data,
      active_users: data.active_users || 0,
      new_users: data.new_users || 0,
      churned_users: data.churned_users || 0
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating Audesign KPI:", error)
    return null
  }

  revalidatePath("/audesign")
  return newKPI
}

export async function updateAudesignKPI(
  id: string,
  data: Partial<Omit<AudesignKPI, "id" | "created_at">>
): Promise<AudesignKPI | null> {
  const { data: updated, error } = await supabaseAdmin
    .from("audesign_kpis")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating Audesign KPI:", error)
    return null
  }

  revalidatePath("/audesign")
  return updated
}

export async function deleteAudesignKPI(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("audesign_kpis")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting Audesign KPI:", error)
    return false
  }

  revalidatePath("/audesign")
  return true
}

// Calculate growth metrics
export async function getAudesignGrowthMetrics() {
  const kpis = await getAudesignKPIs(2)

  if (kpis.length < 2) {
    const latest = kpis[0]
    return {
      current: latest,
      previous: null,
      mrrGrowth: null,
      userGrowth: null,
      revenueGrowth: null
    }
  }

  const [current, previous] = kpis

  const mrrGrowth = previous.mrr
    ? ((Number(current.mrr) - Number(previous.mrr)) / Number(previous.mrr)) * 100
    : null

  const userGrowth = previous.active_users
    ? ((current.active_users - previous.active_users) / previous.active_users) * 100
    : null

  const currentRevenue = (Number(current.stripe_revenue) || 0) + (Number(current.paypal_revenue) || 0)
  const previousRevenue = (Number(previous.stripe_revenue) || 0) + (Number(previous.paypal_revenue) || 0)
  const revenueGrowth = previousRevenue
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
    : null

  return {
    current,
    previous,
    mrrGrowth,
    userGrowth,
    revenueGrowth
  }
}

// Get chart data for MRR trend
export async function getAudesignMRRTrend(months: number = 6): Promise<{ period: string; mrr: number }[]> {
  const kpis = await getAudesignKPIs(months)

  return kpis
    .reverse()
    .map(k => ({
      period: k.period,
      mrr: Number(k.mrr) || 0
    }))
}
