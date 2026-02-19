"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { RoyaltiesTable } from "@/components/royalties/royalties-table"
import { RoyaltiesStats } from "@/components/royalties/royalties-stats"
import { RoyaltyForm } from "@/components/royalties/royalty-form"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { getProjects, type Project } from "@/src/actions/projects"
import { getAllRoyaltiesWithProject, getRoyaltiesStats, type Royalty } from "@/src/actions/royalties"

export default function TalentsRoyaltiesPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [royalties, setRoyalties] = useState<(Royalty & { projectName: string })[]>([])
  const [stats, setStats] = useState({
    total: 0, pending: 0, invoiced: 0, paid: 0, overdue: 0, disputed: 0,
    totalPending: 0, totalPaid: 0, totalOverdue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingRoyalty, setEditingRoyalty] = useState<Royalty | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [projectsData, royaltiesData, statsData] = await Promise.all([
        getProjects(),
        getAllRoyaltiesWithProject(),
        getRoyaltiesStats(),
      ])
      const artistProjects = projectsData.filter(p => p.type === "artist")
      const artistProjectIds = artistProjects.map(p => p.id)
      const artistRoyalties = royaltiesData.filter((r: any) => artistProjectIds.includes(r.project_id))

      setProjects(artistProjects)
      setRoyalties(artistRoyalties)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleEdit = (royalty: Royalty) => {
    setEditingRoyalty(royalty)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingRoyalty(null)
  }

  if (loading) {
    return (
      <AppLayout title="Royalties">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Royalties">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Seguimiento de Royalties</h2>
            <p className="text-sm text-muted-foreground">Control de pagos por royalties y licencias</p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo Royalty
          </Button>
        </div>

        <RoyaltiesStats stats={stats} />

        <RoyaltiesTable
          royalties={royalties}
          onRefresh={loadData}
          onEdit={handleEdit}
        />

        <RoyaltyForm
          open={formOpen}
          onOpenChange={handleFormClose}
          projects={projects}
          royalty={editingRoyalty}
          onSuccess={loadData}
        />
      </div>
    </AppLayout>
  )
}
