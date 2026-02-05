import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const debug = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
    SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
    SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET",
    timestamp: new Date().toISOString(),
  }

  // Test DB connection
  try {
    const { data, error } = await supabaseAdmin
      .from("releases")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) throw error
    return NextResponse.json({ ...debug, dbTest: "SUCCESS", releases: data })
  } catch (error: any) {
    return NextResponse.json({ ...debug, dbTest: "FAILED", error: error.message }, { status: 500 })
  }
}
