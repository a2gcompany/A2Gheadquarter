"use server"

import { db, releases, projects, type Release, type NewRelease, type LabelContact } from "@/src/db"
import { eq, desc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getReleasesByProject(projectId: string): Promise<Release[]> {
  try {
    const result = await db
      .select()
      .from(releases)
      .where(eq(releases.projectId, projectId))
      .orderBy(desc(releases.createdAt))
    return result
  } catch (error) {
    console.error("Error fetching releases:", error)
    return []
  }
}

export async function getAllReleases(): Promise<Release[]> {
  try {
    const result = await db
      .select()
      .from(releases)
      .orderBy(desc(releases.createdAt))
    return result
  } catch (error) {
    console.error("Error fetching releases:", error)
    return []
  }
}

export async function getRelease(id: string): Promise<Release | null> {
  try {
    const result = await db.select().from(releases).where(eq(releases.id, id))
    return result[0] || null
  } catch (error) {
    console.error("Error fetching release:", error)
    return null
  }
}

export async function createRelease(data: NewRelease): Promise<Release | null> {
  try {
    const result = await db.insert(releases).values(data).returning()
    revalidatePath("/releases")
    return result[0] || null
  } catch (error) {
    console.error("Error creating release:", error)
    return null
  }
}

export async function updateRelease(
  id: string,
  data: Partial<Omit<Release, "id" | "createdAt">>
): Promise<Release | null> {
  try {
    const result = await db
      .update(releases)
      .set(data)
      .where(eq(releases.id, id))
      .returning()
    revalidatePath("/releases")
    return result[0] || null
  } catch (error) {
    console.error("Error updating release:", error)
    return null
  }
}

export async function deleteRelease(id: string): Promise<boolean> {
  try {
    await db.delete(releases).where(eq(releases.id, id))
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

    const currentContacts = (release.labelsContacted || []) as LabelContact[]
    const updatedContacts = [...currentContacts, contact]

    return await updateRelease(releaseId, { labelsContacted: updatedContacts })
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

    const currentContacts = (release.labelsContacted || []) as LabelContact[]
    const updatedContacts = currentContacts.map((c) =>
      c.label === labelName ? { ...c, ...updates } : c
    )

    return await updateRelease(releaseId, { labelsContacted: updatedContacts })
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

    const currentContacts = (release.labelsContacted || []) as LabelContact[]
    const updatedContacts = currentContacts.filter((c) => c.label !== labelName)

    return await updateRelease(releaseId, { labelsContacted: updatedContacts })
  } catch (error) {
    console.error("Error removing label contact:", error)
    return null
  }
}

// Get releases with project info
export async function getAllReleasesWithProject() {
  try {
    const result = await db
      .select({
        release: releases,
        projectName: projects.name,
      })
      .from(releases)
      .leftJoin(projects, eq(releases.projectId, projects.id))
      .orderBy(desc(releases.createdAt))

    return result.map((r) => ({
      ...r.release,
      projectName: r.projectName || "Unknown",
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
