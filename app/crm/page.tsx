"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, MoreVertical, Mail, Phone, Building2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

// Mock data
const stages = [
  { id: "prospect", name: "Prospect", color: "bg-gray-500" },
  { id: "qualified", name: "Qualified", color: "bg-blue-500" },
  { id: "proposal", name: "Proposal", color: "bg-yellow-500" },
  { id: "negotiation", name: "Negotiation", color: "bg-orange-500" },
  { id: "closed_won", name: "Closed Won", color: "bg-green-500" },
]

const leadsData = [
  {
    id: 1,
    name: "Tech Startup Inc",
    contact: "John Doe",
    email: "john@techstartup.com",
    value: 25000,
    stage: "prospect",
    score: 75,
    lastContact: "2024-03-14",
  },
  {
    id: 2,
    name: "Global Corp",
    contact: "Jane Smith",
    email: "jane@globalcorp.com",
    value: 50000,
    stage: "qualified",
    score: 85,
    lastContact: "2024-03-13",
  },
  {
    id: 3,
    name: "Marketing Agency XYZ",
    contact: "Bob Wilson",
    email: "bob@marketingxyz.com",
    value: 15000,
    stage: "proposal",
    score: 65,
    lastContact: "2024-03-15",
  },
  {
    id: 4,
    name: "E-commerce Plus",
    contact: "Alice Brown",
    email: "alice@ecommerceplus.com",
    value: 35000,
    stage: "negotiation",
    score: 90,
    lastContact: "2024-03-15",
  },
  {
    id: 5,
    name: "Fintech Solutions",
    contact: "Charlie Davis",
    email: "charlie@fintech.com",
    value: 45000,
    stage: "closed_won",
    score: 95,
    lastContact: "2024-03-10",
  },
  {
    id: 6,
    name: "Design Studio Co",
    contact: "Emma Wilson",
    email: "emma@designstudio.com",
    value: 20000,
    stage: "prospect",
    score: 60,
    lastContact: "2024-03-12",
  },
  {
    id: 7,
    name: "SaaS Platform Ltd",
    contact: "Mike Johnson",
    email: "mike@saasplatform.com",
    value: 60000,
    stage: "qualified",
    score: 80,
    lastContact: "2024-03-14",
  },
]

export default function CRMPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const getLeadsByStage = (stageId: string) => {
    return leadsData.filter((lead) => lead.stage === stageId)
  }

  const getTotalValueByStage = (stageId: string) => {
    return getLeadsByStage(stageId).reduce((sum, lead) => sum + lead.value, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CRM & Pipeline
            </h1>
            <p className="text-muted-foreground">Gestión visual de leads y oportunidades</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar contactos..."
                className="pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button className="gap-2 bg-gradient-premium">
              <Plus className="h-4 w-4" />
              Nuevo Lead
            </Button>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stages.map((stage) => {
            const leads = getLeadsByStage(stage.id)
            const totalValue = getTotalValueByStage(stage.id)
            return (
              <Card key={stage.id} className="glass">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                    <CardTitle className="text-sm">{stage.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leads.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(totalValue, "EUR")}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stages.map((stage) => {
            const leads = getLeadsByStage(stage.id)
            return (
              <div key={stage.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                    <span className="font-semibold text-sm">{stage.name}</span>
                    <span className="text-xs text-muted-foreground">({leads.length})</span>
                  </div>
                </div>

                <div className="space-y-3 min-h-[400px]">
                  {leads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="glass hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">{lead.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {lead.contact}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Valor</span>
                          <span className="text-sm font-bold text-primary">
                            {formatCurrency(lead.value, "EUR")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Score</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  lead.score >= 80 ? "bg-green-500" :
                                  lead.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{ width: `${lead.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold">{lead.score}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(lead.lastContact).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
