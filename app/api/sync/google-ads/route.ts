import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(req: NextRequest) {
  // 1. Auth check (same as Meta)
  const authHeader = req.headers.get("authorization")
  const isManual = req.nextUrl.searchParams.get("manual") === "true"
  const cronSecret = process.env.CRON_SECRET

  if (!isManual && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Check env vars
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN

  if (
    !clientId ||
    !clientSecret ||
    !refreshToken ||
    !customerId ||
    !developerToken
  ) {
    return NextResponse.json(
      {
        error: "Missing Google Ads credentials",
        status: "skipped",
      },
      { status: 200 }
    )
  }

  try {
    // 3. Get OAuth access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      return NextResponse.json(
        { error: "Failed to get Google OAuth token" },
        { status: 502 }
      )
    }

    // 4. Query campaigns via Google Ads API (GAQL)
    const since = new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .slice(0, 10)
    const until = new Date().toISOString().slice(0, 10)

    const gaqlQuery = `
      SELECT
        campaign.id, campaign.name, campaign.status,
        campaign.campaign_budget, campaign.advertising_channel_type,
        metrics.cost_micros, metrics.impressions, metrics.clicks,
        metrics.ctr, metrics.average_cpc, metrics.conversions,
        metrics.cost_per_conversion, metrics.conversions_value,
        segments.date
      FROM campaign
      WHERE segments.date BETWEEN '${since}' AND '${until}'
        AND campaign.status != 'REMOVED'
      ORDER BY segments.date DESC
    `

    const searchRes = await fetch(
      `https://googleads.googleapis.com/v17/customers/${customerId.replace(/-/g, "")}/googleAds:searchStream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": developerToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: gaqlQuery }),
      }
    )

    const searchData = await searchRes.json()

    // Get audesign business unit ID
    const { data: audesignUnit } = await supabaseAdmin
      .from("business_units")
      .select("id")
      .eq("slug", "audesign")
      .single()

    let campaignsUpserted = 0
    let metricsUpserted = 0
    const seenCampaigns = new Set<string>()

    const results = Array.isArray(searchData) ? searchData : [searchData]

    for (const batch of results) {
      for (const row of batch.results || []) {
        const campaign = row.campaign
        const metrics = row.metrics
        const date = row.segments?.date

        // Upsert campaign (once per campaign)
        if (!seenCampaigns.has(campaign.id)) {
          seenCampaigns.add(campaign.id)

          const status =
            campaign.status === "ENABLED"
              ? "active"
              : campaign.status === "PAUSED"
                ? "paused"
                : "archived"
          const channelType = (campaign.advertisingChannelType || "")
            .toLowerCase()
            .replace("_", " ")

          await supabaseAdmin
            .from("ad_campaigns")
            .upsert(
              {
                platform: "google",
                platform_campaign_id: campaign.id,
                business_unit_id: audesignUnit?.id || null,
                name: campaign.name,
                status,
                campaign_type: channelType,
                currency: "USD",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "platform,platform_campaign_id" }
            )

          campaignsUpserted++
        }

        // Upsert daily metrics
        if (date && metrics) {
          const { data: dbCampaign } = await supabaseAdmin
            .from("ad_campaigns")
            .select("id")
            .eq("platform", "google")
            .eq("platform_campaign_id", campaign.id)
            .single()

          if (dbCampaign) {
            const spend = (Number(metrics.costMicros) || 0) / 1000000
            const revenue = Number(metrics.conversionsValue) || 0
            const conversions = Number(metrics.conversions) || 0

            await supabaseAdmin
              .from("ad_daily_metrics")
              .upsert(
                {
                  campaign_id: dbCampaign.id,
                  date,
                  spend,
                  impressions: Number(metrics.impressions) || 0,
                  clicks: Number(metrics.clicks) || 0,
                  ctr: (Number(metrics.ctr) || 0) * 100, // Google returns as decimal
                  cpc: (Number(metrics.averageCpc) || 0) / 1000000,
                  conversions,
                  cpa: conversions > 0 ? spend / conversions : 0,
                  revenue,
                  roas:
                    spend > 0
                      ? Number((revenue / spend).toFixed(2))
                      : 0,
                },
                { onConflict: "campaign_id,date" }
              )

            metricsUpserted++
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: `Google Ads sync: ${campaignsUpserted} campaigns, ${metricsUpserted} daily metrics`,
      campaigns: campaignsUpserted,
      metrics: metricsUpserted,
    })
  } catch (error) {
    console.error("Google Ads sync error:", error)
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    )
  }
}
