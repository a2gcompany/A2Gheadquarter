"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { Contract, NewContract } from "@/src/types/database"

export type { Contract, NewContract }

export async function getAllContracts(): Promise<Contract[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching contracts:", error)
    return []
  }
}

export async function getContractsByProject(projectId: string): Promise<Contract[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching contracts:", error)
    return []
  }
}

export async function getAllContractsWithProject() {
  try {
    const { data, error } = await supabaseAdmin
      .from("contracts")
      .select(`
        *,
        projects (name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((c: any) => ({
      ...c,
      projectName: c.projects?.name || "Unknown",
      projects: undefined,
    }))
  } catch (error) {
    console.error("Error fetching contracts with project:", error)
    return []
  }
}

export async function createContract(data: NewContract): Promise<Contract | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("contracts")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/talents/contracts")
    return result
  } catch (error) {
    console.error("Error creating contract:", error)
    return null
  }
}

export async function updateContract(
  id: string,
  data: Partial<Omit<Contract, "id" | "created_at">>
): Promise<Contract | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("contracts")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/talents/contracts")
    return result
  } catch (error) {
    console.error("Error updating contract:", error)
    return null
  }
}

export async function deleteContract(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("contracts")
      .delete()
      .eq("id", id)

    if (error) throw error
    revalidatePath("/talents/contracts")
    return true
  } catch (error) {
    console.error("Error deleting contract:", error)
    return false
  }
}

export async function getContractsStats() {
  try {
    const all = await getAllContracts()

    const totalValue = all
      .filter((c) => c.status === "active" || c.status === "signing")
      .reduce((sum, c) => sum + (Number(c.value) || 0), 0)

    return {
      total: all.length,
      draft: all.filter((c) => c.status === "draft").length,
      negotiating: all.filter((c) => c.status === "negotiating").length,
      sent: all.filter((c) => c.status === "sent").length,
      signing: all.filter((c) => c.status === "signing").length,
      active: all.filter((c) => c.status === "active").length,
      completed: all.filter((c) => c.status === "completed").length,
      terminated: all.filter((c) => c.status === "terminated").length,
      totalValue,
    }
  } catch (error) {
    console.error("Error fetching contracts stats:", error)
    return {
      total: 0, draft: 0, negotiating: 0, sent: 0, signing: 0,
      active: 0, completed: 0, terminated: 0, totalValue: 0,
    }
  }
}
