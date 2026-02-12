import { NextResponse } from "next/server"
import { getActiveIntegrations } from "@/src/actions/integrations"
import { syncStripe } from "@/src/actions/stripe"
import { syncPaypal } from "@/src/actions/paypal"
import { syncShopify } from "@/src/actions/shopify"

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  // Verify cron auth
  const authHeader = request.headers.get("authorization")
  const url = new URL(request.url)
  const isManual = url.searchParams.get("manual") === "true"

  if (!isManual && CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const integrations = await getActiveIntegrations()
    const results: Array<{
      name: string
      type: string
      synced: number
      skipped: number
      error?: string
    }> = []

    for (const integration of integrations) {
      // Skip bank and google_sheets (handled by sync-sheets endpoint)
      if (integration.type === "bank" || integration.type === "google_sheets") continue

      const projectId = integration.config.projectId as string
      if (!projectId) {
        results.push({ name: integration.name, type: integration.type, synced: 0, skipped: 0, error: "No project ID configured" })
        continue
      }

      const triggeredBy = isManual ? "manual" as const : "cron" as const

      let res: { synced: number; skipped: number; error?: string }
      switch (integration.type) {
        case "stripe":
          res = await syncStripe(integration.id, projectId, triggeredBy)
          break
        case "paypal":
          res = await syncPaypal(integration.id, projectId, triggeredBy)
          break
        case "shopify":
          res = await syncShopify(integration.id, projectId, triggeredBy)
          break
        default:
          res = { synced: 0, skipped: 0, error: `Unsupported type: ${integration.type}` }
      }

      results.push({ name: integration.name, type: integration.type, ...res })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error("Error in sync-integrations cron:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
