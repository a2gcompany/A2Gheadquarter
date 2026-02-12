"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { ReconciliationMatch, Transaction } from "@/src/types/database"

function getSourceGroup(tx: Transaction): string {
  const eid = tx.external_id || tx.source_file || ""
  if (eid.startsWith("stripe:")) return "stripe"
  if (eid.startsWith("paypal:")) return "paypal"
  if (eid.startsWith("shopify:")) return "shopify"
  return tx.source_file || "manual"
}

export async function findReconciliationCandidates(
  projectId: string
): Promise<Array<{
  transactionA: Transaction
  transactionB: Transaction
  confidence: number
  dateDiffDays: number
}>> {
  try {
    const { data: transactions } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("project_id", projectId)
      .order("date", { ascending: false })

    if (!transactions || transactions.length < 2) return []

    // Get existing confirmed/pending reconciliation IDs to exclude
    const { data: existingMatches } = await supabaseAdmin
      .from("reconciliation_matches")
      .select("transaction_a_id, transaction_b_id")
      .in("status", ["pending", "confirmed"])

    const reconciledIds = new Set<string>()
    for (const m of existingMatches || []) {
      reconciledIds.add(m.transaction_a_id)
      reconciledIds.add(m.transaction_b_id)
    }

    const unreconciled = transactions.filter(t => !reconciledIds.has(t.id))
    const candidates: Array<{
      transactionA: Transaction
      transactionB: Transaction
      confidence: number
      dateDiffDays: number
    }> = []

    // Compare each pair from DIFFERENT sources
    for (let i = 0; i < unreconciled.length && candidates.length < 100; i++) {
      for (let j = i + 1; j < unreconciled.length && candidates.length < 100; j++) {
        const a = unreconciled[i]
        const b = unreconciled[j]

        // Must be from different sources
        if (getSourceGroup(a) === getSourceGroup(b)) continue

        // Amounts must match (absolute values, tolerance 0.01)
        const amountA = Math.abs(parseFloat(a.amount))
        const amountB = Math.abs(parseFloat(b.amount))
        if (Math.abs(amountA - amountB) > 0.01) continue

        // Dates must be within 3 days
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        const diffMs = Math.abs(dateA.getTime() - dateB.getTime())
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        if (diffDays > 3) continue

        // Confidence: exact date = 1.0, 1 day = 0.9, 2 days = 0.8, 3 days = 0.7
        const confidence = Math.round(Math.max(0.7, 1.0 - diffDays * 0.1) * 100) / 100

        candidates.push({
          transactionA: a,
          transactionB: b,
          confidence,
          dateDiffDays: Math.round(diffDays),
        })
      }
    }

    return candidates.sort((a, b) => b.confidence - a.confidence)
  } catch (error) {
    console.error("Error finding reconciliation candidates:", error)
    return []
  }
}

export async function createAutoMatches(
  matches: Array<{
    transaction_a_id: string
    transaction_b_id: string
    confidence: number
    matched_on: Record<string, unknown>
  }>
): Promise<number> {
  try {
    if (matches.length === 0) return 0

    const rows = matches.map(m => ({
      transaction_a_id: m.transaction_a_id,
      transaction_b_id: m.transaction_b_id,
      match_type: "auto" as const,
      match_confidence: m.confidence,
      status: "pending" as const,
      matched_on: m.matched_on,
    }))

    const { data, error } = await supabaseAdmin
      .from("reconciliation_matches")
      .insert(rows)
      .select()

    if (error) throw error
    revalidatePath("/ingestion")
    return data?.length || 0
  } catch (error) {
    console.error("Error creating auto matches:", error)
    return 0
  }
}

export async function updateMatchStatus(
  matchId: string,
  status: "confirmed" | "rejected"
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("reconciliation_matches")
      .update({
        status,
        confirmed_by: "user",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", matchId)

    if (error) throw error
    revalidatePath("/ingestion")
    return true
  } catch (error) {
    console.error("Error updating match status:", error)
    return false
  }
}

export async function getPendingMatches(): Promise<Array<
  ReconciliationMatch & {
    transaction_a: Transaction
    transaction_b: Transaction
  }
>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("reconciliation_matches")
      .select(`
        *,
        transaction_a:transactions!reconciliation_matches_transaction_a_id_fkey(*),
        transaction_b:transactions!reconciliation_matches_transaction_b_id_fkey(*)
      `)
      .eq("status", "pending")
      .order("match_confidence", { ascending: false })

    if (error) throw error
    return (data || []) as any
  } catch (error) {
    console.error("Error fetching pending matches:", error)
    return []
  }
}

export async function getReconciliationStats(): Promise<{
  pending: number
  confirmed: number
  rejected: number
  total: number
}> {
  try {
    const { data } = await supabaseAdmin
      .from("reconciliation_matches")
      .select("status")

    const records = data || []
    const pending = records.filter(r => r.status === "pending").length
    const confirmed = records.filter(r => r.status === "confirmed").length
    const rejected = records.filter(r => r.status === "rejected").length

    return { pending, confirmed, rejected, total: records.length }
  } catch (error) {
    console.error("Error fetching reconciliation stats:", error)
    return { pending: 0, confirmed: 0, rejected: 0, total: 0 }
  }
}
