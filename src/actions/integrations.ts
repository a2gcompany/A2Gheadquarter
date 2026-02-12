"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { Integration, IntegrationType } from "@/src/types/database"

export type { Integration, IntegrationType }

export async function getIntegrations(): Promise<Integration[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("integrations")
      .select("*")
      .order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching integrations:", error)
    return []
  }
}

export async function getActiveIntegrations(): Promise<Integration[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("integrations")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching active integrations:", error)
    return []
  }
}

export async function getIntegration(id: string): Promise<Integration | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("integrations")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching integration:", error)
    return null
  }
}

export async function createIntegration(data: {
  business_unit_id?: string | null
  type: IntegrationType
  name: string
  config?: Record<string, unknown>
  is_active?: boolean
}): Promise<Integration | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("integrations")
      .insert({
        ...data,
        config: data.config || {},
        is_active: data.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath("/integrations")
    return result
  } catch (error) {
    console.error("Error creating integration:", error)
    return null
  }
}

export async function updateIntegration(
  id: string,
  data: Partial<Omit<Integration, "id" | "created_at">>
): Promise<Integration | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("integrations")
      .update(data)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/integrations")
    return result
  } catch (error) {
    console.error("Error updating integration:", error)
    return null
  }
}

export async function deleteIntegration(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("integrations")
      .delete()
      .eq("id", id)

    if (error) throw error
    revalidatePath("/integrations")
    return true
  } catch (error) {
    console.error("Error deleting integration:", error)
    return false
  }
}

export async function updateLastSynced(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("integrations")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error
    revalidatePath("/integrations")
    return true
  } catch (error) {
    console.error("Error updating last synced:", error)
    return false
  }
}

export async function getGoogleSheetsConfig(): Promise<{
  releasesSheetId: string | null
  pitchingsSheetId: string | null
  integrationId: string | null
}> {
  try {
    const { data } = await supabaseAdmin
      .from("integrations")
      .select("id, config")
      .eq("type", "google_sheets")
      .eq("is_active", true)
      .limit(1)

    const cfg = data?.[0]
    return {
      releasesSheetId: (cfg?.config?.releasesSheetId as string) || null,
      pitchingsSheetId: (cfg?.config?.pitchingsSheetId as string) || null,
      integrationId: cfg?.id || null,
    }
  } catch (error) {
    console.error("Error fetching Google Sheets config:", error)
    return { releasesSheetId: null, pitchingsSheetId: null, integrationId: null }
  }
}

export async function getIntegrationStats() {
  try {
    const integrations = await getIntegrations()
    const active = integrations.filter((i) => i.is_active)
    const lastSynced = integrations
      .filter((i) => i.last_synced_at)
      .sort((a, b) =>
        new Date(b.last_synced_at!).getTime() -
        new Date(a.last_synced_at!).getTime()
      )[0]

    return {
      total: integrations.length,
      active: active.length,
      lastSyncedAt: lastSynced?.last_synced_at || null,
    }
  } catch (error) {
    console.error("Error fetching integration stats:", error)
    return { total: 0, active: 0, lastSyncedAt: null }
  }
}
