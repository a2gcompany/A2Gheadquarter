import { NextResponse } from "next/server"

export async function GET() {
  const debug = {
    DATABASE_URL: process.env.DATABASE_URL ? "SET (" + process.env.DATABASE_URL.substring(0, 30) + "...)" : "NOT SET",
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET", 
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
    timestamp: new Date().toISOString(),
  }
  
  // Test DB connection
  try {
    const { db, releases } = await import("@/src/db")
    const { desc } = await import("drizzle-orm")
    const result = await db.select().from(releases).orderBy(desc(releases.createdAt)).limit(5)
    return NextResponse.json({ ...debug, dbTest: "SUCCESS", releases: result })
  } catch (error: any) {
    return NextResponse.json({ ...debug, dbTest: "FAILED", error: error.message }, { status: 500 })
  }
}
