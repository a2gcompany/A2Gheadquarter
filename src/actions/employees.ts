"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type Employee = {
  id: string
  business_unit_id: string | null
  name: string
  role: string
  email: string | null
  monthly_cost: number | null
  currency: string
  start_date: string | null
  status: "active" | "inactive" | "contractor"
  notes: string | null
  created_at: string
}

export type EmployeeWithUnit = Employee & {
  business_unit_name: string | null
  business_unit_slug: string | null
}

export async function getEmployees(): Promise<EmployeeWithUnit[]> {
  const { data, error } = await supabaseAdmin
    .from("employees_with_unit")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error fetching employees:", error)
    // Fallback to regular query if view doesn't exist
    const { data: fallback } = await supabaseAdmin
      .from("employees")
      .select("*")
      .order("name")
    return (fallback || []).map(e => ({
      ...e,
      business_unit_name: null,
      business_unit_slug: null
    }))
  }

  return data || []
}

export async function getEmployeesByBusinessUnit(businessUnitId: string): Promise<Employee[]> {
  const { data, error } = await supabaseAdmin
    .from("employees")
    .select("*")
    .eq("business_unit_id", businessUnitId)
    .order("name")

  if (error) {
    console.error("Error fetching employees by business unit:", error)
    return []
  }

  return data || []
}

export async function getActiveEmployees(): Promise<EmployeeWithUnit[]> {
  const { data, error } = await supabaseAdmin
    .from("employees_with_unit")
    .select("*")
    .eq("status", "active")
    .order("name")

  if (error) {
    console.error("Error fetching active employees:", error)
    const { data: fallback } = await supabaseAdmin
      .from("employees")
      .select("*")
      .eq("status", "active")
      .order("name")
    return (fallback || []).map(e => ({
      ...e,
      business_unit_name: null,
      business_unit_slug: null
    }))
  }

  return data || []
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabaseAdmin
    .from("employees")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching employee:", error)
    return null
  }

  return data
}

export async function createEmployee(data: {
  business_unit_id?: string
  name: string
  role: string
  email?: string
  monthly_cost?: number
  currency?: string
  start_date?: string
  status?: Employee["status"]
  notes?: string
}): Promise<Employee | null> {
  const { data: newEmployee, error } = await supabaseAdmin
    .from("employees")
    .insert({
      ...data,
      currency: data.currency || "EUR",
      status: data.status || "active"
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating employee:", error)
    return null
  }

  revalidatePath("/employees")
  revalidatePath("/")
  return newEmployee
}

export async function updateEmployee(
  id: string,
  data: Partial<Omit<Employee, "id" | "created_at">>
): Promise<Employee | null> {
  const { data: updated, error } = await supabaseAdmin
    .from("employees")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating employee:", error)
    return null
  }

  revalidatePath("/employees")
  revalidatePath("/")
  return updated
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("employees")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting employee:", error)
    return false
  }

  revalidatePath("/employees")
  revalidatePath("/")
  return true
}

// Get employee stats
export async function getEmployeeStats() {
  const { data: employees } = await supabaseAdmin
    .from("employees")
    .select("status, monthly_cost, currency")
    .eq("status", "active")

  const total = employees?.length || 0
  const totalMonthlyCost = employees?.reduce((sum, e) => sum + (Number(e.monthly_cost) || 0), 0) || 0

  // Group by business unit
  const { data: byUnit } = await supabaseAdmin
    .from("employees_with_unit")
    .select("business_unit_slug, status")
    .eq("status", "active")

  const unitCounts: Record<string, number> = {}
  byUnit?.forEach(e => {
    const slug = e.business_unit_slug || "unassigned"
    unitCounts[slug] = (unitCounts[slug] || 0) + 1
  })

  return {
    total,
    totalMonthlyCost,
    byUnit: unitCounts
  }
}
