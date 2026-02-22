import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

const META_API_VERSION = "v21.0"
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

export async function GET(req: NextRequest) {
  // 1. Check for cron secret or manual trigger
  const authHeader = req.headers.get("authorization")
  const isManual = req.nextUrl.searchParams.get("manual") === "true"
  const cronSecret = process.env.CRON_SECRET

  if (!isManual && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Check required env vars
  const accessToken = process.env.META_ADS_ACCESS_TOKEN
  const accountId = process.env.META_ADS_ACCOUNT_ID

  if (!accessToken || !accountId) {
    return NextResponse.json(
      {
        error: "Missing META_ADS_ACCESS_TOKEN or META_ADS_ACCOUNT_ID",
        status: "skipped",
      },
      { status: 200 }
    ) // 200 so cron doesn't retry
  }

  try {
    // 3. Fetch campaigns
    const campaignsUrl = `${META_BASE_URL}/act_${accountId}/campaigns?fields=id,name,status,daily_budget,objective&access_token=${accessToken}&limit=100`
    const campaignsRes = await fetch(campaignsUrl)
    const campaignsData = await campaignsRes.json()

    if (campaignsData.error) {
      return NextResponse.json(
        { error: "Meta API error", details: campaignsData.error },
        { status: 502 }
      )
    }

    // Get audesign business unit ID
    const { data: audesignUnit } = await supabaseAdmin
      .from("business_units")
      .select("id")
      .eq("slug", "audesign")
      .single()

    const campaigns = campaignsData.data || []
    let campaignsUpserted = 0
    let metricsUpserted = 0

    // 4. Upsert campaigns
    for (const c of campaigns) {
      const status =
        c.status === "ACTIVE"
          ? "active"
          : c.status === "PAUSED"
            ? "paused"
            : "archived"

      const { error } = await supabaseAdmin
        .from("ad_campaigns")
        .upsert(
          {
            platform: "meta",
            platform_campaign_id: c.id,
            business_unit_id: audesignUnit?.id || null,
            name: c.name,
            status,
            campaign_type: c.objective || null,
            daily_budget: c.daily_budget
              ? Number(c.daily_budget) / 100
              : null, // Meta returns in cents
            currency: "USD",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "platform,platform_campaign_id" }
        )

      if (!error) campaignsUpserted++
    }

    // 5. Fetch insights for last 7 days (daily breakdown)
    const since = new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .slice(0, 10)
    const until = new Date().toISOString().slice(0, 10)

    const insightsUrl = `${META_BASE_URL}/act_${accountId}/insights?fields=campaign_id,spend,impressions,clicks,ctr,cpc,actions,action_values,cost_per_action_type&time_range={"since":"${since}","until":"${until}"}&level=campaign&time_increment=1&access_token=${accessToken}&limit=500`
    const insightsRes = await fetch(insightsUrl)
    const insightsData = await insightsRes.json()

    if (insightsData.data) {
      for (const insight of insightsData.data) {
        // Look up our campaign ID
        const { data: campaign } = await supabaseAdmin
          .from("ad_campaigns")
          .select("id")
          .eq("platform", "meta")
          .eq("platform_campaign_id", insight.campaign_id)
          .single()

        if (!campaign) continue

        // Extract action values
        const actions = insight.actions || []
        const actionValues = insight.action_values || []

        const purchases =
          actions.find(
            (a: { action_type: string; value: string }) =>
              a.action_type === "purchase"
          )?.value || 0
        const revenue =
          actionValues.find(
            (a: { action_type: string; value: string }) =>
              a.action_type === "purchase"
          )?.value || 0
        const landingViews =
          actions.find(
            (a: { action_type: string; value: string }) =>
              a.action_type === "landing_page_view"
          )?.value || 0
        const addToCart =
          actions.find(
            (a: { action_type: string; value: string }) =>
              a.action_type === "add_to_cart"
          )?.value || 0
        const checkouts =
          actions.find(
            (a: { action_type: string; value: string }) =>
              a.action_type === "initiate_checkout"
          )?.value || 0
        const conversions =
          actions.find(
            (a: { action_type: string; value: string }) =>
              a.action_type === "offsite_conversion.fb_pixel_purchase"
          )?.value || purchases

        const spend = Number(insight.spend) || 0
        const roas = spend > 0 ? Number(revenue) / spend : 0

        const { error } = await supabaseAdmin
          .from("ad_daily_metrics")
          .upsert(
            {
              campaign_id: campaign.id,
              date: insight.date_start,
              spend,
              impressions: Number(insight.impressions) || 0,
              clicks: Number(insight.clicks) || 0,
              ctr: Number(insight.ctr) || 0,
              cpc: Number(insight.cpc) || 0,
              conversions: Number(conversions),
              cpa:
                Number(conversions) > 0 ? spend / Number(conversions) : 0,
              revenue: Number(revenue),
              roas: Number(roas.toFixed(2)),
              landing_views: Number(landingViews),
              add_to_cart: Number(addToCart),
              checkouts: Number(checkouts),
              purchases: Number(purchases),
            },
            { onConflict: "campaign_id,date" }
          )

        if (!error) metricsUpserted++
      }
    }

    return NextResponse.json({
      success: true,
      summary: `Meta Ads sync: ${campaignsUpserted} campaigns, ${metricsUpserted} daily metrics`,
      campaigns: campaignsUpserted,
      metrics: metricsUpserted,
    })
  } catch (error) {
    console.error("Meta Ads sync error:", error)
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    )
  }
}
