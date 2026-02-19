"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { ImportHistory, NewImportHistory, ImportStatus } from "@/src/types/database"

export async function createImportRecord(data: NewImportHistory): Promise<ImportHistory | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("import_history")
      .insert({
        ...data,
        status: "running" as ImportStatus,
        metadata: data.metadata || {},
      })
      .select()
      .single()

    if (error) throw error
    return result
  } catch (error) {
    console.error("Error creating import record:", error)
    return null
  }
}

export async function completeImportRecord(
  id: string,
  result: {
    rows_imported: number
    rows_skipped: number
    rows_errored?: number
    error_message?: string
  }
): Promise<boolean> {
  try {
    const status: ImportStatus = result.error_message
      ? "failed"
      : result.rows_errored && result.rows_errored > 0
        ? "partial"
        : "completed"

    const { error } = await supabaseAdmin
      .from("import_history")
      .update({
        rows_imported: result.rows_imported,
        rows_skipped: result.rows_skipped,
        rows_errored: result.rows_errored || 0,
        error_message: result.error_message || null,
        status,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error
    revalidatePath("/ingestion")
    return true
  } catch (error) {
    console.error("Error completing import record:", error)
    return false
  }
}

export async function getImportHistory(options?: {
  source_type?: string
  limit?: number
}): Promise<ImportHistory[]> {
  try {
    let query = supabaseAdmin
      .from("import_history")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(options?.limit || 50)

    if (options?.source_type) {
      query = query.eq("source_type", options.source_type)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching import history:", error)
    return []
  }
}

export async function getImportStats(): Promise<{
  totalImports: number
  totalRowsImported: number
  lastImport: ImportHistory | null
  bySource: Record<string, { count: number; rows: number }>
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("import_history")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(200)

    if (error) throw error

    const records = data || []
    const totalRowsImported = records.reduce((s, r) => s + (r.rows_imported || 0), 0)
    const lastImport = records[0] || null

    const bySource: Record<string, { count: number; rows: number }> = {}
    for (const r of records) {
      if (!bySource[r.source_type]) {
        bySource[r.source_type] = { count: 0, rows: 0 }
      }
      bySource[r.source_type].count++
      bySource[r.source_type].rows += r.rows_imported || 0
    }

    return { totalImports: records.length, totalRowsImported, lastImport, bySource }
  } catch (error) {
    console.error("Error fetching import stats:", error)
    return { totalImports: 0, totalRowsImported: 0, lastImport: null, bySource: {} }
  }
}
