"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { BusinessUnit } from "@/src/types/database"

export type { BusinessUnit }

export async function getBusinessUnits(): Promise<BusinessUnit[]> {
  const { data, error } = await supabaseAdmin
    .from("business_units")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error fetching business units:", error)
    return []
  }

  return data || []
}

export async function getBusinessUnit(id: string): Promise<BusinessUnit | null> {
  const { data, error } = await supabaseAdmin
    .from("business_units")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching business unit:", error)
    return null
  }

  return data
}

export async function getBusinessUnitBySlug(slug: string): Promise<BusinessUnit | null> {
  const { data, error } = await supabaseAdmin
    .from("business_units")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("Error fetching business unit by slug:", error)
    return null
  }

  return data
}

export async function createBusinessUnit(data: {
  slug: string
  name: string
  type: BusinessUnit["type"]
  description?: string
}): Promise<BusinessUnit | null> {
  const { data: newUnit, error } = await supabaseAdmin
    .from("business_units")
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error("Error creating business unit:", error)
    return null
  }

  revalidatePath("/")
  return newUnit
}

export async function updateBusinessUnit(
  id: string,
  data: Partial<Omit<BusinessUnit, "id" | "created_at">>
): Promise<BusinessUnit | null> {
  const { data: updated, error } = await supabaseAdmin
    .from("business_units")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating business unit:", error)
    return null
  }

  revalidatePath("/")
  return updated
}

export async function deleteBusinessUnit(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("business_units")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting business unit:", error)
    return false
  }

  revalidatePath("/")
  return true
}

// Get business unit stats for dashboard
export async function getBusinessUnitStats(slug: string) {
  const unit = await getBusinessUnitBySlug(slug)
  if (!unit) return null

  // Get employee count
  const { count: employeeCount } = await supabaseAdmin
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("business_unit_id", unit.id)
    .eq("status", "active")

  // Get projects for this unit
  const { data: projects } = await supabaseAdmin
    .from("projects")
    .select("id")
    .eq("business_unit_id", unit.id)

  const projectIds = projects?.map(p => p.id) || []

  // Get transaction totals
  let income = 0
  let expense = 0

  if (projectIds.length > 0) {
    const { data: transactions } = await supabaseAdmin
      .from("transactions")
      .select("amount, type")
      .in("project_id", projectIds)

    transactions?.forEach(t => {
      if (t.type === "income") income += Number(t.amount)
      else expense += Number(t.amount)
    })
  }

  return {
    unit,
    employeeCount: employeeCount || 0,
    projectCount: projectIds.length,
    income,
    expense,
    balance: income - expense
  }
}
