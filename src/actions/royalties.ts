"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { Royalty, NewRoyalty } from "@/src/types/database"

export type { Royalty, NewRoyalty }

export async function getAllRoyalties(): Promise<Royalty[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("royalties")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching royalties:", error)
    return []
  }
}

export async function getRoyaltiesByProject(projectId: string): Promise<Royalty[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("royalties")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching royalties:", error)
    return []
  }
}

export async function getAllRoyaltiesWithProject() {
  try {
    const { data, error } = await supabaseAdmin
      .from("royalties")
      .select(`
        *,
        projects (name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((r: any) => ({
      ...r,
      projectName: r.projects?.name || "Unknown",
      projects: undefined,
    }))
  } catch (error) {
    console.error("Error fetching royalties with project:", error)
    return []
  }
}

export async function createRoyalty(data: NewRoyalty): Promise<Royalty | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("royalties")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/talents/royalties")
    return result
  } catch (error) {
    console.error("Error creating royalty:", error)
    return null
  }
}

export async function updateRoyalty(
  id: string,
  data: Partial<Omit<Royalty, "id" | "created_at">>
): Promise<Royalty | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("royalties")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/talents/royalties")
    return result
  } catch (error) {
    console.error("Error updating royalty:", error)
    return null
  }
}

export async function deleteRoyalty(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("royalties")
      .delete()
      .eq("id", id)

    if (error) throw error
    revalidatePath("/talents/royalties")
    return true
  } catch (error) {
    console.error("Error deleting royalty:", error)
    return false
  }
}

export async function getRoyaltiesStats() {
  try {
    const all = await getAllRoyalties()

    const totalPending = all
      .filter((r) => r.status === "pending" || r.status === "invoiced")
      .reduce((sum, r) => sum + Number(r.amount), 0)

    const totalPaid = all
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + Number(r.amount), 0)

    const totalOverdue = all
      .filter((r) => r.status === "overdue")
      .reduce((sum, r) => sum + Number(r.amount), 0)

    return {
      total: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      invoiced: all.filter((r) => r.status === "invoiced").length,
      paid: all.filter((r) => r.status === "paid").length,
      overdue: all.filter((r) => r.status === "overdue").length,
      disputed: all.filter((r) => r.status === "disputed").length,
      totalPending,
      totalPaid,
      totalOverdue,
    }
  } catch (error) {
    console.error("Error fetching royalties stats:", error)
    return {
      total: 0, pending: 0, invoiced: 0, paid: 0, overdue: 0, disputed: 0,
      totalPending: 0, totalPaid: 0, totalOverdue: 0,
    }
  }
}
