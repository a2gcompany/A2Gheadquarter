"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { AdCampaignStatus } from "@/src/types/database"

export interface CampaignRow {
  id: string
  name: string
  status: AdCampaignStatus
  product: string | null
  daily_budget: number | null
  currency: string
  spend7d: number
  ctr7d: number
  roas7d: number
}

interface CampaignsTableProps {
  campaigns: CampaignRow[]
}

function StatusBadge({ status }: { status: AdCampaignStatus }) {
  const config: Record<
    AdCampaignStatus,
    { label: string; dotColor: string; textColor: string }
  > = {
    active: {
      label: "ACTIVA",
      dotColor: "bg-emerald-400",
      textColor: "text-emerald-400",
    },
    paused: {
      label: "PAUSADA",
      dotColor: "bg-amber-400",
      textColor: "text-amber-400",
    },
    archived: {
      label: "ARCHIVADA",
      dotColor: "bg-zinc-500",
      textColor: "text-zinc-400",
    },
  }

  const c = config[status] || config.archived

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", c.textColor)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dotColor)} />
      {c.label}
    </span>
  )
}

function formatUSD(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const maxSpend = Math.max(...campaigns.map((c) => c.spend7d), 1)

  if (campaigns.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Campanas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No hay campanas disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Campanas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Campana</TableHead>
              <TableHead className="text-xs text-right">Budget/dia</TableHead>
              <TableHead className="text-xs">Gasto periodo</TableHead>
              <TableHead className="text-xs text-right">CTR</TableHead>
              <TableHead className="text-xs text-right">ROAS</TableHead>
              <TableHead className="text-xs">Producto</TableHead>
              <TableHead className="text-xs text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => {
              const spendBarWidth =
                maxSpend > 0 ? (campaign.spend7d / maxSpend) * 100 : 0

              return (
                <TableRow key={campaign.id}>
                  {/* Campaign name */}
                  <TableCell className="font-medium text-sm max-w-[200px] truncate">
                    {campaign.name}
                  </TableCell>

                  {/* Daily budget */}
                  <TableCell className="text-right text-sm tabular-nums">
                    {campaign.daily_budget
                      ? formatUSD(campaign.daily_budget)
                      : "-"}
                  </TableCell>

                  {/* Spend with visual bar */}
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{
                            width: `${Math.max(spendBarWidth, 1)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                        {formatUSD(campaign.spend7d)}
                      </span>
                    </div>
                  </TableCell>

                  {/* CTR */}
                  <TableCell className="text-right text-sm tabular-nums">
                    {campaign.ctr7d.toFixed(2)}%
                  </TableCell>

                  {/* ROAS */}
                  <TableCell
                    className={cn(
                      "text-right text-sm tabular-nums font-medium",
                      campaign.roas7d >= 1.0
                        ? "text-emerald-400"
                        : "text-red-400"
                    )}
                  >
                    {campaign.roas7d.toFixed(2)}x
                  </TableCell>

                  {/* Product */}
                  <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                    {campaign.product || "-"}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-right">
                    <StatusBadge status={campaign.status} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
