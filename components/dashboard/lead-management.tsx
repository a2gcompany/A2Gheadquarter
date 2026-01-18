"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Flame,
  Snowflake,
  Mail,
  Clock,
  Globe,
  Zap,
  Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"

type LeadStatus = "closed" | "lost" | "warm" | "cold" | "hot"
type LeadType = "warm" | "cold" | "hot"

interface Lead {
  id: string
  name: string
  type: LeadType
  email: string
  followUp: string
  status: LeadStatus
  score: number
  source: string
  website?: string
}

interface LeadManagementProps {
  leads?: Lead[]
  className?: string
}

const defaultLeads: Lead[] = [
  {
    id: "1",
    name: "Harper",
    type: "warm",
    email: "harper@stellartech.io",
    followUp: "In 2 days",
    status: "closed",
    score: 77,
    source: "Referral",
    website: "stellartech.io",
  },
  {
    id: "2",
    name: "Henry",
    type: "cold",
    email: "henry@outlook.com",
    followUp: "In 6 days",
    status: "lost",
    score: 26,
    source: "Cold Call",
    website: undefined,
  },
  {
    id: "3",
    name: "Isabella",
    type: "hot",
    email: "isabella@innovate.co",
    followUp: "Tomorrow",
    status: "warm",
    score: 92,
    source: "Website",
    website: "innovate.co",
  },
  {
    id: "4",
    name: "Jack",
    type: "warm",
    email: "jack@techstart.io",
    followUp: "In 3 days",
    status: "warm",
    score: 65,
    source: "LinkedIn",
    website: "techstart.io",
  },
  {
    id: "5",
    name: "Lily",
    type: "cold",
    email: "lily@gmail.com",
    followUp: "In 1 week",
    status: "cold",
    score: 34,
    source: "Cold Email",
    website: undefined,
  },
]

const typeConfig: Record<LeadType, { icon: React.ReactNode; color: string; bgColor: string }> = {
  warm: {
    icon: <Zap className="h-3 w-3" />,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  cold: {
    icon: <Snowflake className="h-3 w-3" />,
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
  },
  hot: {
    icon: <Flame className="h-3 w-3" />,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
  },
}

const statusConfig: Record<LeadStatus, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  closed: {
    icon: <Check className="h-3 w-3" />,
    label: "Closed",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  lost: {
    icon: <X className="h-3 w-3" />,
    label: "Lost",
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
  },
  warm: {
    icon: <Zap className="h-3 w-3" />,
    label: "Warm",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  cold: {
    icon: <Snowflake className="h-3 w-3" />,
    label: "Cold",
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
  },
  hot: {
    icon: <Flame className="h-3 w-3" />,
    label: "Hot",
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
  },
}

const sourceConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  Referral: { icon: <Zap className="h-3 w-3" />, color: "text-purple-400" },
  "Cold Call": { icon: <Phone className="h-3 w-3" />, color: "text-sky-400" },
  Website: { icon: <Globe className="h-3 w-3" />, color: "text-emerald-400" },
  LinkedIn: { icon: <Zap className="h-3 w-3" />, color: "text-blue-400" },
  "Cold Email": { icon: <Mail className="h-3 w-3" />, color: "text-sky-400" },
}

export function LeadManagement({ leads = defaultLeads, className }: LeadManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string | null>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (!sortField) return 0
    const aValue = a[sortField as keyof Lead]
    const bValue = b[sortField as keyof Lead]
    if (aValue === undefined || bValue === undefined) return 0
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    return sortDirection === "asc"
      ? <ChevronUp className="h-3 w-3 ml-1" />
      : <ChevronDown className="h-3 w-3 ml-1" />
  }

  return (
    <Card className={cn("bg-card border-border/50", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Lead Management</CardTitle>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-48 pl-9 pr-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {/* Filter button */}
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            {/* Sort button */}
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
            {/* Export/Import button */}
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Upload className="h-4 w-4" />
              Export/Import
            </Button>
            {/* Refresh button */}
            <button className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-border" />
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center hover:text-foreground"
                    >
                      Name
                      <SortIcon field="name" />
                    </button>
                  </label>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center hover:text-foreground"
                  >
                    Type
                    <SortIcon field="type" />
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center hover:text-foreground"
                  >
                    Email
                    <SortIcon field="email" />
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  <button
                    onClick={() => handleSort("followUp")}
                    className="flex items-center hover:text-foreground"
                  >
                    Follow-up
                    <SortIcon field="followUp" />
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center hover:text-foreground"
                  >
                    Status
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  <button
                    onClick={() => handleSort("score")}
                    className="flex items-center hover:text-foreground"
                  >
                    Score
                    <SortIcon field="score" />
                  </button>
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Source
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Website
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map((lead) => {
                const typeStyle = typeConfig[lead.type]
                const statusStyle = statusConfig[lead.status]
                const sourceStyle = sourceConfig[lead.source] || { icon: <Zap className="h-3 w-3" />, color: "text-muted-foreground" }

                return (
                  <tr
                    key={lead.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded border-border" />
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                            {lead.name.charAt(0)}
                          </div>
                          <span className="font-medium">{lead.name}</span>
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        typeStyle.bgColor,
                        typeStyle.color
                      )}>
                        {typeStyle.icon}
                        {lead.type.charAt(0).toUpperCase() + lead.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{lead.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {lead.followUp}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        statusStyle.bgColor,
                        statusStyle.color
                      )}>
                        {statusStyle.icon}
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              lead.score >= 70 ? "bg-emerald-500" :
                              lead.score >= 40 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={cn("flex items-center gap-1 text-sm", sourceStyle.color)}>
                        {sourceStyle.icon}
                        {lead.source}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.website ? (
                        <a
                          href={`https://${lead.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {lead.website}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
