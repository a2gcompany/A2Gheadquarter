"use server"

import { db, transactions, projects, type Transaction, type NewTransaction } from "@/src/db"
import { eq, desc, and, gte, lte, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getTransactionsByProject(projectId: string): Promise<Transaction[]> {
  try {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.projectId, projectId))
      .orderBy(desc(transactions.date))
    return result
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const result = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date))
    return result
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(data: NewTransaction): Promise<Transaction | null> {
  try {
    const result = await db.insert(transactions).values(data).returning()
    revalidatePath("/accounting")
    return result[0] || null
  } catch (error) {
    console.error("Error creating transaction:", error)
    return null
  }
}

export async function createManyTransactions(data: NewTransaction[]): Promise<number> {
  try {
    if (data.length === 0) return 0
    const result = await db.insert(transactions).values(data).returning()
    revalidatePath("/accounting")
    return result.length
  } catch (error) {
    console.error("Error creating transactions:", error)
    return 0
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    await db.delete(transactions).where(eq(transactions.id, id))
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
    const result = await db
      .select({
        type: transactions.type,
        total: sql<string>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(eq(transactions.projectId, projectId))
      .groupBy(transactions.type)

    let income = 0
    let expense = 0

    for (const row of result) {
      if (row.type === "income") {
        income = parseFloat(row.total || "0")
      } else if (row.type === "expense") {
        expense = parseFloat(row.total || "0")
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
    const result = await db
      .select({
        month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
        type: transactions.type,
        total: sql<string>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(eq(transactions.projectId, projectId))
      .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`, transactions.type)
      .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM')`)

    // Transform to chart-friendly format
    const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {}

    for (const row of result) {
      if (!monthlyMap[row.month]) {
        monthlyMap[row.month] = { month: row.month, income: 0, expense: 0 }
      }
      if (row.type === "income") {
        monthlyMap[row.month].income = parseFloat(row.total || "0")
      } else if (row.type === "expense") {
        monthlyMap[row.month].expense = parseFloat(row.total || "0")
      }
    }

    return Object.values(monthlyMap)
  } catch (error) {
    console.error("Error fetching monthly data:", error)
    return []
  }
}

// Get all projects with their P&L
export async function getAllProjectsPL() {
  try {
    const projectsList = await db.select().from(projects).orderBy(projects.name)

    const result = await db
      .select({
        projectId: transactions.projectId,
        type: transactions.type,
        total: sql<string>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .groupBy(transactions.projectId, transactions.type)

    // Build P&L map
    const plMap: Record<string, { income: number; expense: number }> = {}

    for (const row of result) {
      if (!plMap[row.projectId]) {
        plMap[row.projectId] = { income: 0, expense: 0 }
      }
      if (row.type === "income") {
        plMap[row.projectId].income = parseFloat(row.total || "0")
      } else if (row.type === "expense") {
        plMap[row.projectId].expense = parseFloat(row.total || "0")
      }
    }

    // Merge with projects
    return projectsList.map((project) => ({
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
