"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { Project, NewProject } from "@/src/types/database"

export type { Project, NewProject }

export async function getProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching project:", error)
    return null
  }
}

export async function createProject(data: NewProject): Promise<Project | null> {
  try {
    const { data: result, error } = await supabaseAdmin
      .from("projects")
      .insert(data)
      .select()
      .single()

    if (error) throw error
    revalidatePath("/")
    revalidatePath("/accounting")
    return result
  } catch (error) {
    console.error("Error creating project:", error)
    return null
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("projects")
      .delete()
      .eq("id", id)

    if (error) throw error
    revalidatePath("/")
    revalidatePath("/accounting")
    return true
  } catch (error) {
    console.error("Error deleting project:", error)
    return false
  }
}
