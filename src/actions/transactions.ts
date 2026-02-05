"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type Transaction = {
  id: string
  project_id: string
  date: string
  description: string
  amount: string
  type: "income" | "expense"
  category: string | null
  source_file: string | null
  payment_source_id: string | null
  business_unit_id: string | null
  created_at: string
}

export type NewTransaction = Omit<Transaction, "id" | "created_at" | "payment_source_id" | "business_unit_id"> & {
  payment_source_id?: string | null
  business_unit_id?: string | null
}

export async function getTransactionsByProject(projectId: string): Promise<Transaction[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("project_id", projectId)
      .order("date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(data: NewTransaction): Promise<Transaction | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("transactions")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/accounting")
    return result
  } catch (error) {
    console.error("Error creating transaction:", error)
    return null
  }
}

export async function createManyTransactions(data: NewTransaction[]): Promise<number> {
  try {
    if (data.length === 0) return 0
    const { data: result, error } = await supabaseAdmin
      .from("transactions")
      .insert(data)
      .select()

    if (error) throw error
    revalidatePath("/accounting")
    return result?.length || 0
  } catch (error) {
    console.error("Error creating transactions:", error)
    return 0
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("id", id)

    if (error) throw error
    revalidatePath("/accounting")
    return true
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return false
  }
}

// Get P&L summary for a project
export async function getProjectPL(projectId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("type, amount")
      .eq("project_id", projectId)

    if (error) throw error

    let income = 0
    let expense = 0

    for (const row of data || []) {
      const amount = parseFloat(row.amount || "0")
      if (row.type === "income") {
        income += amount
      } else if (row.type === "expense") {
        expense += amount
      }
    }

    return {
      income,
      expense,
      balance: income - expense,
    }
  } catch (error) {
    console.error("Error fetching project P&L:", error)
    return { income: 0, expense: 0, balance: 0 }
  }
}

// Get monthly breakdown for a project
export async function getProjectMonthlyData(projectId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("date, type, amount")
      .eq("project_id", projectId)
      .order("date")

    if (error) throw error

    // Transform to chart-friendly format
    const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {}

    for (const row of data || []) {
      const month = row.date.substring(0, 7) // YYYY-MM
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, income: 0, expense: 0 }
      }
      const amount = parseFloat(row.amount || "0")
      if (row.type === "income") {
        monthlyMap[month].income += amount
      } else if (row.type === "expense") {
        monthlyMap[month].expense += amount
      }
    }

    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))
  } catch (error) {
    console.error("Error fetching monthly data:", error)
    return []
  }
}

// Get all projects with their P&L
export async function getAllProjectsPL() {
  try {
    const { data: projectsList, error: projectsError } = await supabaseAdmin
      .from("projects")
      .select("*")
      .order("name")

    if (projectsError) throw projectsError

    const { data: transactions, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("project_id, type, amount")

    if (txError) throw txError

    // Build P&L map
    const plMap: Record<string, { income: number; expense: number }> = {}

    for (const row of transactions || []) {
      if (!plMap[row.project_id]) {
        plMap[row.project_id] = { income: 0, expense: 0 }
      }
      const amount = parseFloat(row.amount || "0")
      if (row.type === "income") {
        plMap[row.project_id].income += amount
      } else if (row.type === "expense") {
        plMap[row.project_id].expense += amount
      }
    }

    // Merge with projects
    return (projectsList || []).map((project) => ({
      ...project,
      income: plMap[project.id]?.income || 0,
      expense: plMap[project.id]?.expense || 0,
      balance: (plMap[project.id]?.income || 0) - (plMap[project.id]?.expense || 0),
    }))
  } catch (error) {
    console.error("Error fetching all projects P&L:", error)
    return []
  }
}
