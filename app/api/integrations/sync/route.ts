import { NextRequest, NextResponse } from "next/server"
import { getIntegration, getActiveIntegrations } from "@/src/actions/integrations"
import { syncStripe } from "@/src/actions/stripe"
import { syncPaypal } from "@/src/actions/paypal"
import { syncShopify } from "@/src/actions/shopify"

type SyncResult = {
  integrationId: string
  type: string
  name: string
  synced: number
  skipped: number
  error?: string
}

async function syncByType(
  integrationId: string,
  type: string,
  projectId: string
): Promise<{ synced: number; skipped: number; error?: string }> {
  switch (type) {
    case "stripe":
      return syncStripe(integrationId, projectId)
    case "paypal":
      return syncPaypal(integrationId, projectId)
    case "shopify":
      return syncShopify(integrationId, projectId)
    default:
      return { synced: 0, skipped: 0, error: `Unsupported type: ${type}` }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const results: SyncResult[] = []

    if (body.all) {
      // Sync all active integrations
      const integrations = await getActiveIntegrations()

      await Promise.all(
        integrations
          .filter((i) => i.type !== "bank") // bank is manual import only
          .map(async (integration) => {
            const projectId =
              (integration.config.projectId as string) || body.projectId
            if (!projectId) {
              results.push({
                integrationId: integration.id,
                type: integration.type,
                name: integration.name,
                synced: 0,
                skipped: 0,
                error: "No project ID configured",
              })
              return
            }

            const res = await syncByType(
              integration.id,
              integration.type,
              projectId
            )
            results.push({
              integrationId: integration.id,
              type: integration.type,
              name: integration.name,
              ...res,
            })
          })
      )
    } else if (body.integrationId) {
      // Sync single integration
      const integration = await getIntegration(body.integrationId)
      if (!integration) {
        return NextResponse.json(
          { error: "Integration not found" },
          { status: 404 }
        )
      }

      const projectId =
        (integration.config.projectId as string) || body.projectId
      if (!projectId) {
        return NextResponse.json(
          { error: "No project ID provided" },
          { status: 400 }
        )
      }

      const res = await syncByType(
        integration.id,
        integration.type,
        projectId
      )
      results.push({
        integrationId: integration.id,
        type: integration.type,
        name: integration.name,
        ...res,
      })
    } else {
      return NextResponse.json(
        { error: "Provide integrationId or all:true" },
        { status: 400 }
      )
    }

    const totalSynced = results.reduce((s, r) => s + r.synced, 0)
    const totalSkipped = results.reduce((s, r) => s + r.skipped, 0)
    const errors = results.filter((r) => r.error).length

    return NextResponse.json({
      success: true,
      synced: totalSynced,
      skipped: totalSkipped,
      errors,
      results,
    })
  } catch (error: any) {
    console.error("Sync API error:", error)
    return NextResponse.json(
      { error: error.message || "Sync failed" },
      { status: 500 }
    )
  }
}
