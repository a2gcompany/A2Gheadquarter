import { NextRequest, NextResponse } from "next/server"
import { chatWithData } from "@/lib/services/claude-service"
import { db, projects, transactions, releases, bookings } from "@/src/db"
import { eq, desc } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { message, projectId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Fetch relevant context using Drizzle
    const context: Record<string, unknown> = {}

    if (projectId && projectId !== "all") {
      // Fetch specific project data
      const projectData = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1)

      if (projectData.length > 0) {
        context.project = projectData[0]

        // Fetch recent transactions for this project
        const projectTransactions = await db
          .select()
          .from(transactions)
          .where(eq(transactions.projectId, projectId))
          .orderBy(desc(transactions.date))
          .limit(100)

        context.transactions = projectTransactions

        // Fetch releases for this project
        const projectReleases = await db
          .select()
          .from(releases)
          .where(eq(releases.projectId, projectId))
          .orderBy(desc(releases.createdAt))
          .limit(50)

        context.releases = projectReleases

        // Fetch bookings for this project
        const projectBookings = await db
          .select()
          .from(bookings)
          .where(eq(bookings.projectId, projectId))
          .orderBy(desc(bookings.showDate))
          .limit(50)

        context.bookings = projectBookings
      }
    } else {
      // Fetch all projects with summary data
      const allProjects = await db.select().from(projects)
      context.projects = allProjects

      // Fetch recent transactions across all projects
      const recentTransactions = await db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.date))
        .limit(100)

      context.recentTransactions = recentTransactions

      // Calculate summary per project type
      const artistProjects = allProjects.filter(p => p.type === "artist")
      const verticalProjects = allProjects.filter(p => p.type === "vertical")

      context.summary = {
        totalProjects: allProjects.length,
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
