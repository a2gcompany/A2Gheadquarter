"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { Transaction, NewTransaction } from "@/src/types/database"

export type { Transaction, NewTransaction }

const PAGE_SIZE = 1000

// Paginates through all rows to bypass PostgREST max_rows=1000 server limit
async function fetchAllTransactionPages(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryFn: (from: number, to: number) => any
): Promise<Transaction[]> {
  const all: Transaction[] = []
  let from = 0
  while (true) {
    const { data, error } = await queryFn(from, from + PAGE_SIZE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return all
}

export async function getTransactionsByProject(projectId: string): Promise<Transaction[]> {
  try {
    return await fetchAllTransactionPages((from, to) =>
      supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("project_id", projectId)
        .order("date", { ascending: false })
        .range(from, to)
    )
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    return await fetchAllTransactionPages((from, to) =>
      supabaseAdmin
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .range(from, to)
    )
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

export async function createManyTransactionsDedup(
  data: NewTransaction[],
  projectId: string
): Promise<{ imported: number; skipped: number }> {
  try {
    if (data.length === 0) return { imported: 0, skipped: 0 }

    let skipped = 0
    const toInsert: NewTransaction[] = []

    // Strategy 1: Dedup by external_id (Stripe, PayPal, Shopify - uses unique index)
    const withExternalId = data.filter(d => d.external_id)
    const withoutExternalId = data.filter(d => !d.external_id)

    if (withExternalId.length > 0) {
      const externalIds = withExternalId.map(d => d.external_id!)

      // Query in chunks of 200 to avoid query size limits
      const existingExternalIds = new Set<string>()
      for (let i = 0; i < externalIds.length; i += 200) {
        const chunk = externalIds.slice(i, i + 200)
        const { data: existing } = await supabaseAdmin
          .from("transactions")
          .select("external_id")
          .in("external_id", chunk)

        for (const e of existing || []) {
          if (e.external_id) existingExternalIds.add(e.external_id)
        }
      }

      for (const tx of withExternalId) {
        if (existingExternalIds.has(tx.external_id!)) {
          skipped++
        } else {
          toInsert.push(tx)
        }
      }
    }

    // Strategy 2: Fallback dedup for CSV/manual imports (date+amount+description+source_file)
    if (withoutExternalId.length > 0) {
      const { data: existing } = await supabaseAdmin
        .from("transactions")
        .select("date, amount, description, source_file")
        .eq("project_id", projectId)

      const existingKeys = new Set(
        (existing || []).map(
          (e: any) =>
            `${e.date}|${e.amount}|${String(e.description || "").substring(0, 50)}|${e.source_file || ""}`
        )
      )

      for (const tx of withoutExternalId) {
        const key = `${tx.date}|${tx.amount}|${String(tx.description || "").substring(0, 50)}|${tx.source_file || ""}`
        if (existingKeys.has(key)) {
          skipped++
        } else {
          toInsert.push(tx)
        }
      }
    }

    if (toInsert.length === 0) return { imported: 0, skipped }

    const { data: result, error } = await supabaseAdmin
      .from("transactions")
      .insert(toInsert)
      .select()

    if (error) throw error
    revalidatePath("/accounting")
    revalidatePath("/integrations")
    revalidatePath("/ingestion")
    return { imported: result?.length || 0, skipped }
  } catch (error) {
    console.error("Error creating transactions with dedup:", error)
    return { imported: 0, skipped: 0 }
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
    const rows = await fetchAllTransactionPages((from, to) =>
      supabaseAdmin
        .from("transactions")
        .select("type, amount")
        .eq("project_id", projectId)
        .range(from, to)
    )

    let income = 0
    let expense = 0

    for (const row of rows) {
      const amount = parseFloat((row as any).amount || "0")
      if ((row as any).type === "income") {
        income += amount
      } else if ((row as any).type === "expense") {
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
    const data = await fetchAllTransactionPages((from, to) =>
      supabaseAdmin
        .from("transactions")
        .select("date, type, amount")
        .eq("project_id", projectId)
        .order("date")
        .range(from, to)
    )

    // Transform to chart-friendly format
    const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {}

    for (const row of data) {
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

    const transactions = await fetchAllTransactionPages((from, to) =>
      supabaseAdmin
        .from("transactions")
        .select("project_id, type, amount")
        .range(from, to)
    )

    // Build P&L map
    const plMap: Record<string, { income: number; expense: number }> = {}

    for (const row of transactions) {
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

// Get monthly breakdown for a business unit
export async function getBusinessUnitMonthlyData(slug: string) {
  try {
    const { data: unit } = await supabaseAdmin
      .from("business_units")
      .select("id")
      .eq("slug", slug)
      .single()

    if (!unit) return []

    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("business_unit_id", unit.id)

    const projectIds = projects?.map(p => p.id) || []
    if (projectIds.length === 0) return []

    const data = await fetchAllTransactionPages((from, to) =>
      supabaseAdmin
        .from("transactions")
        .select("date, type, amount")
        .in("project_id", projectIds)
        .order("date")
        .range(from, to)
    )

    const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {}

    for (const row of data) {
      const month = (row as any).date.substring(0, 7)
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
    console.error("Error fetching business unit monthly data:", error)
    return []
  }
}

// Get current month stats across all projects
export async function getMonthlyStats() {
  try {
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`

    const data = await fetchAllTransactionPages((from, to) =>
      supabaseAdmin
        .from("transactions")
        .select("type, amount")
        .gte("date", monthStart)
        .range(from, to)
    )

    let income = 0
    let expense = 0

    for (const row of data) {
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
      month: monthStart.substring(0, 7),
    }
  } catch (error) {
    console.error("Error fetching monthly stats:", error)
    return { income: 0, expense: 0, balance: 0, month: "" }
  }
}
