"use server"

import { createManyTransactionsDedup } from "./transactions"
import { getIntegration, updateLastSynced } from "./integrations"
import { createImportRecord, completeImportRecord } from "./import-history"
import type { NewTransaction, ImportTrigger } from "@/src/types/database"

const API_VERSION = "2024-01"

function normalizeStoreUrl(url: string): string {
  let store = url.trim().replace(/^https?:\/\//, "").replace(/\/$/, "")
  if (!store.includes(".myshopify.com")) {
    store = `${store}.myshopify.com`
  }
  return store
}

export async function testShopifyConnection(
  storeUrl: string,
  accessToken: string
): Promise<{ ok: boolean; shopName?: string; error?: string }> {
  try {
    const store = normalizeStoreUrl(storeUrl)
    const res = await fetch(
      `https://${store}/admin/api/${API_VERSION}/shop.json`,
      {
        headers: { "X-Shopify-Access-Token": accessToken },
      }
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Shopify API error: ${res.status} ${text}`)
    }

    const data = await res.json()
    return { ok: true, shopName: data.shop?.name }
  } catch (error: any) {
    return { ok: false, error: error.message || "Connection failed" }
  }
}

// Parse Link header for pagination
function getNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
  return match ? match[1] : null
}

export async function syncShopify(
  integrationId: string,
  projectId: string,
  triggeredBy: ImportTrigger = "manual"
): Promise<{ synced: number; skipped: number; error?: string }> {
  const importRecord = await createImportRecord({
    integration_id: integrationId,
    source_type: "shopify",
    source_name: "Shopify Sync",
    triggered_by: triggeredBy,
  })

  try {
    const integration = await getIntegration(integrationId)
    if (!integration) {
      if (importRecord) await completeImportRecord(importRecord.id, { rows_imported: 0, rows_skipped: 0, error_message: "Integration not found" })
      return { synced: 0, skipped: 0, error: "Integration not found" }
    }

    const storeUrl = integration.config.storeUrl as string
    const accessToken = integration.config.accessToken as string

    if (!storeUrl || !accessToken) {
      if (importRecord) await completeImportRecord(importRecord.id, { rows_imported: 0, rows_skipped: 0, error_message: "Shopify credentials not configured" })
      return { synced: 0, skipped: 0, error: "Shopify credentials not configured" }
    }

    const store = normalizeStoreUrl(storeUrl)
    const headers = { "X-Shopify-Access-Token": accessToken }

    // Determine start date
    const createdAtMin = integration.last_synced_at
      ? new Date(integration.last_synced_at).toISOString()
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()

    const allTransactions: NewTransaction[] = []

    // Fetch orders with pagination
    let url: string | null =
      `https://${store}/admin/api/${API_VERSION}/orders.json?status=any&financial_status=paid&created_at_min=${createdAtMin}&limit=250`

    while (url) {
      const res = await fetch(url, { headers })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Shopify API error: ${res.status} ${text}`)
      }

      const data = await res.json()

      for (const order of data.orders || []) {
        // Income from order
        const items = (order.line_items || [])
          .map((i: any) => i.title)
          .slice(0, 3)
          .join(", ")

        allTransactions.push({
          project_id: projectId,
          date: order.created_at
            ? order.created_at.split("T")[0]
            : new Date().toISOString().split("T")[0],
          description: `Shopify Order ${order.name}${items ? ` - ${items}` : ""}`,
          amount: String(Math.abs(parseFloat(order.total_price || "0"))),
          type: "income",
          category: "revenue",
          source_file: `shopify:${order.id}`,
          external_id: `shopify:${order.id}`,
          import_id: importRecord?.id || null,
        })

        // Expense from refunds
        for (const refund of order.refunds || []) {
          const refundAmount = (refund.refund_line_items || []).reduce(
            (sum: number, item: any) =>
              sum + parseFloat(item.subtotal || "0"),
            0
          )
          if (refundAmount > 0) {
            allTransactions.push({
              project_id: projectId,
              date: refund.created_at
                ? refund.created_at.split("T")[0]
                : order.created_at.split("T")[0],
              description: `Shopify Refund for ${order.name}`,
              amount: String(Math.abs(refundAmount)),
              type: "expense",
              category: "refund",
              source_file: `shopify:refund:${refund.id}`,
              external_id: `shopify:refund:${refund.id}`,
              import_id: importRecord?.id || null,
            })
          }
        }
      }

      url = getNextPageUrl(res.headers.get("Link"))
    }

    if (allTransactions.length === 0) {
      await updateLastSynced(integrationId)
      if (importRecord) await completeImportRecord(importRecord.id, { rows_imported: 0, rows_skipped: 0 })
      return { synced: 0, skipped: 0 }
    }

    const result = await createManyTransactionsDedup(allTransactions, projectId)
    await updateLastSynced(integrationId)

    if (importRecord) await completeImportRecord(importRecord.id, { rows_imported: result.imported, rows_skipped: result.skipped })
    return { synced: result.imported, skipped: result.skipped }
  } catch (error: any) {
    console.error("Error syncing Shopify:", error)
    if (importRecord) await completeImportRecord(importRecord.id, { rows_imported: 0, rows_skipped: 0, error_message: error.message || "Sync failed" })
    return { synced: 0, skipped: 0, error: error.message || "Sync failed" }
  }
}
