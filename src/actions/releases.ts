"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { Release, NewRelease, LabelContact } from "@/src/types/database"

export type { Release, NewRelease, LabelContact }

export async function getReleasesByProject(projectId: string): Promise<Release[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("releases")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching releases:", error)
    return []
  }
}

export async function getAllReleases(): Promise<Release[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("releases")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching releases:", error)
    return []
  }
}

export async function getRelease(id: string): Promise<Release | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("releases")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching release:", error)
    return null
  }
}

export async function createRelease(data: NewRelease): Promise<Release | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("releases")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/releases")
    return result
  } catch (error) {
    console.error("Error creating release:", error)
    return null
  }
}

export async function updateRelease(
  id: string,
  data: Partial<Omit<Release, "id" | "created_at">>
): Promise<Release | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("releases")
      .update(data)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/releases")
    return result
  } catch (error) {
    console.error("Error updating release:", error)
    return null
  }
}

export async function deleteRelease(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("releases")
      .delete()
      .eq("id", id)

    if (error) throw error
    revalidatePath("/releases")
    return true
  } catch (error) {
    console.error("Error deleting release:", error)
    return false
  }
}

export async function addLabelContact(
  releaseId: string,
  contact: LabelContact
): Promise<Release | null> {
  try {
    const release = await getRelease(releaseId)
    if (!release) return null

    const currentContacts = (release.labels_contacted || []) as LabelContact[]
    const updatedContacts = [...currentContacts, contact]

    return await updateRelease(releaseId, { labels_contacted: updatedContacts })
  } catch (error) {
    console.error("Error adding label contact:", error)
    return null
  }
}

export async function updateLabelContact(
  releaseId: string,
  labelName: string,
  updates: Partial<LabelContact>
): Promise<Release | null> {
  try {
    const release = await getRelease(releaseId)
    if (!release) return null

    const currentContacts = (release.labels_contacted || []) as LabelContact[]
    const updatedContacts = currentContacts.map((c) =>
      c.label === labelName ? { ...c, ...updates } : c
    )

    return await updateRelease(releaseId, { labels_contacted: updatedContacts })
  } catch (error) {
    console.error("Error updating label contact:", error)
    return null
  }
}

export async function removeLabelContact(
  releaseId: string,
  labelName: string
): Promise<Release | null> {
  try {
    const release = await getRelease(releaseId)
    if (!release) return null

    const currentContacts = (release.labels_contacted || []) as LabelContact[]
    const updatedContacts = currentContacts.filter((c) => c.label !== labelName)

    return await updateRelease(releaseId, { labels_contacted: updatedContacts })
  } catch (error) {
    console.error("Error removing label contact:", error)
    return null
  }
}

// Get releases with project info
export async function getAllReleasesWithProject() {
  try {
    const { data, error } = await supabaseAdmin
      .from("releases")
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
    console.error("Error fetching releases with project:", error)
    return []
  }
}

// Stats for dashboard
export async function getReleasesStats() {
  try {
    const allReleases = await getAllReleases()

    const stats = {
      total: allReleases.length,
      draft: allReleases.filter((r) => r.status === "draft").length,
      shopping: allReleases.filter((r) => r.status === "shopping").length,
      accepted: allReleases.filter((r) => r.status === "accepted").length,
      released: allReleases.filter((r) => r.status === "released").length,
    }

    return stats
  } catch (error) {
    console.error("Error fetching releases stats:", error)
    return { total: 0, draft: 0, shopping: 0, accepted: 0, released: 0 }
  }
}
