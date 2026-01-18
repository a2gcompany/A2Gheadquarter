"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { KPICard } from "@/components/dashboard/kpi-card"
import { TopPerformers } from "@/components/dashboard/top-performers"
import { LeadManagement } from "@/components/dashboard/lead-management"
import { LineChart } from "@/components/charts/line-chart"
import { useKPIs } from "@/lib/hooks/useKPIs"
import { formatCurrency } from "@/lib/utils/currency"
import {
  DollarSign,
  Users,
  MessageSquare,
  UserCheck,
  Loader2,
} from "lucide-react"

// Sample data for the leads chart
const leadsChartData = [
  { date: "Jan 1", leads: 320, conversions: 180, opportunities: 220 },
  { date: "Jan 5", leads: 380, conversions: 200, opportunities: 250 },
  { date: "Jan 9", leads: 420, conversions: 280, opportunities: 300 },
  { date: "Jan 13", leads: 550, conversions: 350, opportunities: 400 },
  { date: "Jan 15", leads: 729, conversions: 506, opportunities: 490 },
  { date: "Jan 17", leads: 650, conversions: 480, opportunities: 520 },
  { date: "Jan 21", leads: 720, conversions: 520, opportunities: 580 },
  { date: "Jan 25", leads: 850, conversions: 600, opportunities: 650 },
  { date: "Jan 30", leads: 920, conversions: 680, opportunities: 720 },
]

export default function DashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState("all")
  const { summary, loading, error } = useKPIs(selectedCompany)

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Dashboard"
        subtitle="Let's tackle down some work"
        userName="LN"
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KPIs Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Generated Revenue"
                value={summary.revenue > 0 ? formatCurrency(summary.revenue, "EUR") : "$67,024"}
                change={12}
                trend="up"
                icon={<DollarSign className="h-4 w-4" />}
              />
              <KPICard
                title="Signed Clients"
                value={summary.liquidez > 0 ? String(Math.round(summary.liquidez / 1000)) : "227"}
                change={23}
                trend="up"
                icon={<Users className="h-4 w-4" />}
              />
              <KPICard
                title="Total Leads"
                value={summary.profit !== 0 ? String(Math.abs(Math.round(summary.profit / 100))) : "3,867"}
                change={17}
                trend="up"
                icon={<MessageSquare className="h-4 w-4" />}
              />
              <KPICard
                title="Team Members"
                value="38"
                icon={<UserCheck className="h-4 w-4" />}
              />
            </div>

            {/* Charts and Stats Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Leads Gathered Chart */}
              <div className="lg:col-span-2">
                <LineChart
                  title="Leads Gathered"
                  data={summary.liquidityData.length > 0 ? summary.liquidityData : leadsChartData}
                  xDataKey={summary.liquidityData.length > 0 ? "month" : "date"}
                  lines={
                    summary.liquidityData.length > 0
                      ? [
                          { dataKey: "liquidez", stroke: "#f97316", name: "Liquidez" },
                          { dataKey: "objetivo", stroke: "#a855f7", name: "Objetivo" },
                        ]
                      : [
                          { dataKey: "leads", stroke: "#f97316", name: "Leads" },
                          { dataKey: "conversions", stroke: "#a855f7", name: "Conversions" },
                          { dataKey: "opportunities", stroke: "#22c55e", name: "Opportunities" },
                        ]
                  }
                  valueFormatter={(value) => value.toLocaleString()}
                  height={280}
                />
              </div>

              {/* Top Performers */}
              <TopPerformers />
            </div>

            {/* Lead Management Table */}
            <LeadManagement />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
