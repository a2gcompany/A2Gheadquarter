"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { ReleasesTable } from "@/components/releases/releases-table"
import { ReleasesStats } from "@/components/releases/releases-stats"
import { LabelsDialog } from "@/components/releases/labels-dialog"
import { Loader2 } from "lucide-react"
import { getProjects } from "@/src/actions/projects"
import { getAllReleasesWithProject, type Release } from "@/src/actions/releases"

export default function TalentsReleasesPage() {
  const [releases, setReleases] = useState<(Release & { projectName: string })[]>([])
  const [stats, setStats] = useState({ total: 0, draft: 0, shopping: 0, accepted: 0, released: 0 })
  const [loading, setLoading] = useState(true)
  const [labelsDialogOpen, setLabelsDialogOpen] = useState(false)
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [projectsData, releasesData] = await Promise.all([
        getProjects(),
        getAllReleasesWithProject(),
      ])
      const artistProjects = projectsData.filter(p => p.type === "artist")
      const artistProjectIds = artistProjects.map(p => p.id)
      const artistReleases = releasesData.filter(r => artistProjectIds.includes(r.project_id))

      setReleases(artistReleases)
      setStats({
        total: artistReleases.length,
        draft: artistReleases.filter(r => r.status === "draft").length,
        shopping: artistReleases.filter(r => r.status === "shopping").length,
        accepted: artistReleases.filter(r => r.status === "accepted").length,
        released: artistReleases.filter(r => r.status === "released").length,
      })
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleViewLabels = (release: Release) => {
    setSelectedRelease(release)
    setLabelsDialogOpen(true)
  }

  return (
    <AppLayout title="Releases - A2G Talents">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Releases</h1>
          <p className="text-muted-foreground">
            Lanzamientos musicales — synced desde Google Sheets
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ReleasesStats stats={stats} />
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Todos los Releases</h2>
              <ReleasesTable
                releases={releases}
                onRefresh={loadData}
                onViewLabels={handleViewLabels}
              />
            </div>
          </>
        )}
      </div>

      <LabelsDialog
        open={labelsDialogOpen}
        onOpenChange={setLabelsDialogOpen}
        release={selectedRelease}
        onSuccess={loadData}
      />
    </AppLayout>
  )
}
