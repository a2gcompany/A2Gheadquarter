import { NextRequest, NextResponse } from "next/server"
import { chatWithData } from "@/lib/services/claude-service"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { message, projectId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Fetch relevant context using Supabase
    const context: Record<string, unknown> = {}

    if (projectId && projectId !== "all") {
      // Fetch specific project data
      const { data: projectData } = await supabaseAdmin
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (projectData) {
        context.project = projectData

        // Fetch recent transactions for this project
        const { data: projectTransactions } = await supabaseAdmin
          .from("transactions")
          .select("*")
          .eq("project_id", projectId)
          .order("date", { ascending: false })
          .limit(100)

        context.transactions = projectTransactions

        // Fetch releases for this project
        const { data: projectReleases } = await supabaseAdmin
          .from("releases")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(50)

        context.releases = projectReleases

        // Fetch bookings for this project
        const { data: projectBookings } = await supabaseAdmin
          .from("bookings")
          .select("*")
          .eq("project_id", projectId)
          .order("show_date", { ascending: false })
          .limit(50)

        context.bookings = projectBookings
      }
    } else {
      // Fetch all projects with summary data
      const { data: allProjects } = await supabaseAdmin
        .from("projects")
        .select("*")

      context.projects = allProjects || []

      // Fetch recent transactions across all projects
      const { data: recentTransactions } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .limit(100)

      context.recentTransactions = recentTransactions || []

      // Calculate summary per project type
      const projects = allProjects || []
      const artistProjects = projects.filter((p: any) => p.type === "artist")
      const verticalProjects = projects.filter((p: any) => p.type === "vertical")

      context.summary = {
        totalProjects: projects.length,
        artistProjects: artistProjects.length,
        verticalProjects: verticalProjects.length,
      }
    }

    // Get AI response
    const response = await chatWithData(message, context)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    )
  }
}
