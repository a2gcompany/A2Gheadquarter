"use server"

import Stripe from "stripe"
import { createManyTransactionsDedup } from "./transactions"
import { getIntegration, updateLastSynced } from "./integrations"
import type { NewTransaction } from "@/src/types/database"

export async function testStripeConnection(
  secretKey: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const stripe = new Stripe(secretKey)
    await stripe.balance.retrieve()
    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: error.message || "Connection failed" }
  }
}

function mapCategory(type: string): string {
  switch (type) {
    case "charge":
    case "payment":
      return "revenue"
    case "stripe_fee":
    case "application_fee":
      return "bank-fee"
    case "payout":
    case "transfer":
      return "transfer"
    case "refund":
      return "refund"
    case "adjustment":
      return "adjustment"
    default:
      return "other"
  }
}

export async function syncStripe(
  integrationId: string,
  projectId: string
): Promise<{ synced: number; skipped: number; error?: string }> {
  try {
    const integration = await getIntegration(integrationId)
    if (!integration) return { synced: 0, skipped: 0, error: "Integration not found" }

    const secretKey = integration.config.secretKey as string
    if (!secretKey) return { synced: 0, skipped: 0, error: "No secret key configured" }

    const stripe = new Stripe(secretKey)

    // Determine start timestamp
    const startDate = integration.last_synced_at
      ? Math.floor(new Date(integration.last_synced_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 // 30 days ago

    // Paginate all balance transactions
    const allTransactions: NewTransaction[] = []
    let hasMore = true
    let startingAfter: string | undefined

    while (hasMore) {
      const params: Stripe.BalanceTransactionListParams = {
        limit: 100,
        created: { gte: startDate },
      }
      if (startingAfter) params.starting_after = startingAfter

      const batch = await stripe.balanceTransactions.list(params)

      for (const tx of batch.data) {
        allTransactions.push({
          project_id: projectId,
          date: new Date(tx.created * 1000).toISOString().split("T")[0],
          description: tx.description || tx.type,
          amount: String(Math.abs(tx.amount / 100)),
          type: tx.amount > 0 ? "income" : "expense",
          category: mapCategory(tx.type),
          source_file: `stripe:${tx.id}`,
        })
      }

      hasMore = batch.has_more
      if (batch.data.length > 0) {
        startingAfter = batch.data[batch.data.length - 1].id
      }
    }

    if (allTransactions.length === 0) {
      await updateLastSynced(integrationId)
      return { synced: 0, skipped: 0 }
    }

    const result = await createManyTransactionsDedup(allTransactions, projectId)
    await updateLastSynced(integrationId)

    return { synced: result.imported, skipped: result.skipped }
  } catch (error: any) {
    console.error("Error syncing Stripe:", error)
    return { synced: 0, skipped: 0, error: error.message || "Sync failed" }
  }
}
