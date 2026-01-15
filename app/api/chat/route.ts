import { NextRequest, NextResponse } from "next/server"
import { chatWithData } from "@/lib/services/claude-service"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { message, companyId, userId } = await request.json()

    if (!message || !userId) {
      return NextResponse.json(
        { error: "Message and userId are required" },
        { status: 400 }
      )
    }

    // Fetch relevant context
    const context: any = {}

    if (companyId && companyId !== "all") {
      // Fetch company data
      const { data: company } = await supabaseAdmin
        .from("companies")
        .select("*")
        .eq("slug", companyId)
        .single()

      context.company = company

      // Fetch recent transactions
      const { data: transactions } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("company_id", company?.id)
        .order("transaction_date", { ascending: false })
        .limit(100)

      context.transactions = transactions

      // Fetch KPIs
      const { data: kpis } = await supabaseAdmin
        .from("kpis_extracted")
        .select("*")
        .eq("company_id", company?.id)
        .order("created_at", { ascending: false })
        .limit(50)

      context.kpis = kpis
    } else {
      // Fetch all companies
      const { data: companies } = await supabaseAdmin
        .from("companies")
        .select("*")

      context.companies = companies

      // Fetch financial summary
      const { data: summary } = await supabaseAdmin
        .from("company_financial_summary")
        .select("*")

      context.financialSummary = summary
    }

    // Get AI response
    const response = await chatWithData(message, context)

    // Save chat history
    await supabaseAdmin.from("ai_chat_history").insert([
      {
        user_id: userId,
        company_id: companyId !== "all" ? companyId : null,
        message_type: "user",
        message,
      },
      {
        user_id: userId,
        company_id: companyId !== "all" ? companyId : null,
        message_type: "assistant",
        message: response,
      },
    ])

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    )
  }
}
