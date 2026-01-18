"use server"

import { db, projects, type Project, type NewProject } from "@/src/db"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getProjects(): Promise<Project[]> {
  try {
    const result = await db.select().from(projects).orderBy(projects.name)
    return result
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const result = await db.select().from(projects).where(eq(projects.id, id))
    return result[0] || null
  } catch (error) {
    console.error("Error fetching project:", error)
    return null
  }
}

export async function createProject(data: NewProject): Promise<Project | null> {
  try {
    const result = await db.insert(projects).values(data).returning()
    revalidatePath("/")
    revalidatePath("/accounting")
    return result[0] || null
  } catch (error) {
    console.error("Error creating project:", error)
    return null
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await db.delete(projects).where(eq(projects.id, id))
    revalidatePath("/")
    revalidatePath("/accounting")
    return true
  } catch (error) {
    console.error("Error deleting project:", error)
    return false
  }
}
