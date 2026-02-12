"use server"

import { createManyTransactionsDedup } from "./transactions"
import { getIntegration, updateLastSynced } from "./integrations"
import { createImportRecord, completeImportRecord } from "./import-history"
import type { NewTransaction, ImportTrigger } from "@/src/types/database"

function getBaseUrl(sandbox: boolean) {
  return sandbox
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com"
}

async function getAccessToken(
  clientId: string,
  secret: string,
  sandbox: boolean
): Promise<string> {
  const res = await fetch(`${getBaseUrl(sandbox)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal auth failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data.access_token
}

export async function testPaypalConnection(
  clientId: string,
  secret: string,
  sandbox: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    await getAccessToken(clientId, secret, sandbox)
    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: error.message || "Connection failed" }
  }
}

// PayPal event codes: T0006=payment received, T1107=refund, T0400=withdrawal, T1106=reversal
function resolveType(eventCode: string): "income" | "expense" {
  const incomeCodes = ["T0006", "T0001", "T0003", "T0007", "T0012", "T0013"]
  return incomeCodes.some((c) => eventCode.startsWith(c)) ? "income" : "expense"
}

function resolveCategory(eventCode: string): string {
  if (eventCode.startsWith("T00")) return "revenue"
  if (eventCode.startsWith("T11")) return "refund"
  if (eventCode.startsWith("T04")) return "transfer"
  if (eventCode.startsWith("T05")) return "bank-fee"
  return "other"
}

export async function syncPaypal(
  integrationId: string,
  projectId: string,
  triggeredBy: ImportTrigger = "manual"
): Promise<{ synced: number; skipped: number; error?: string }> {
  const importRecord = await createImportRecord({
    integration_id: integrationId,
    source_type: "paypal",
    source_name: "PayPal Sync",
    triggered_by: triggeredBy,
  })

  try {
    const integration = await getIntegration(integrationId)
    if (!integration) {
      if (importRecord) await completeImportRecord(importRecord.id, { rows_imported: 0, rows_skipped: 0, error_message: "Integration not found" })
      return { synced: 0, skipped: 0, error: "Integration not found" }
    }

    const clientId = integration.config.clientId as string
    const secret = integration.config.secret as string
    const sandbox = integration.config.sandbox as boolean

    if (!clientId || !secret) {
      if (importRecord) await completeImportRecord(importRecord.id, { rows_imported: 0, rows_skipped: 0, error_message: "PayPal credentials not configured" })
      return { synced: 0, skipped: 0, error: "PayPal credentials not configured" }
    }

    const accessToken = await getAccessToken(clientId, secret, sandbox)
    const baseUrl = getBaseUrl(sandbox)

    // Determine date range
    const startDate = integration.last_synced_at
      ? new Date(integration.last_synced_at).toISOString()
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = new Date().toISOString()

    // Fetch transactions
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      fields: "all",
      page_size: "100",
    })

    const allTransactions: NewTransaction[] = []
    let page = 1
    let totalPages = 1

    while (page <= totalPages) {
      params.set("page", String(page))

      const res = await fetch(
        `${baseUrl}/v1/reporting/transactions?${params}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`PayPal API error: ${res.status} ${text}`)
      }

      const data = await res.json()
      totalPages = data.total_pages || 1

      for (const detail of data.transaction_details || []) {
        const info = detail.transaction_info
        if (!info) continue

        const amount = parseFloat(info.transaction_amount?.value || "0")
        const eventCode = info.transaction_event_code || ""
        const txId = info.transaction_id

        allTransactions.push({
          project_id: projectId,
          date: info.transaction_initiation_date
            ? info.transaction_initiation_date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          description:
            info.transaction_subject ||
            detail.payer_info?.payer_name?.alternate_full_name ||
            info.transaction_event_code ||
            "PayPal transaction",
          amount: String(Math.abs(amount)),
          type: resolveType(eventCode),
          category: resolveCategory(eventCode),
          source_file: `paypal:${txId}`,
          external_id: `paypal:${txId}`,
          import_id: importRecord?.id || null,
        })
      }

      page++
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
    console.error("Error syncing PayPal:", error)
    if (importRecord) await completeImportRecord(importRecord.id, { rows_imported: 0, rows_skipped: 0, error_message: error.message || "Sync failed" })
    return { synced: 0, skipped: 0, error: error.message || "Sync failed" }
  }
}
