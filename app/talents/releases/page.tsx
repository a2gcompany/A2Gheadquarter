"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { ReleasesTable } from "@/components/releases/releases-table"
import { ReleasesStats } from "@/components/releases/releases-stats"
import { ReleaseForm } from "@/components/releases/release-form"
import { LabelsDialog } from "@/components/releases/labels-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { getProjects, type Project } from "@/src/actions/projects"
import { getAllReleasesWithProject, getReleasesStats, type Release } from "@/src/actions/releases"

export default function TalentsReleasesPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [releases, setReleases] = useState<(Release & { projectName: string })[]>([])
  const [stats, setStats] = useState({ total: 0, draft: 0, shopping: 0, accepted: 0, released: 0 })
  const [loading, setLoading] = useState(true)

  // Dialogs state
  const [formOpen, setFormOpen] = useState(false)
  const [editingRelease, setEditingRelease] = useState<Release | null>(null)
  const [labelsDialogOpen, setLabelsDialogOpen] = useState(false)
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [projectsData, releasesData, statsData] = await Promise.all([
        getProjects(),
        getAllReleasesWithProject(),
        getReleasesStats(),
      ])
      // Filter to only artist projects
      const artistProjects = projectsData.filter(p => p.type === "artist")
      const artistProjectIds = artistProjects.map(p => p.id)
      const artistReleases = releasesData.filter(r => artistProjectIds.includes(r.project_id))

      setProjects(artistProjects)
      setReleases(artistReleases)

      // Recalculate stats for artists only
      const artistStats = {
        total: artistReleases.length,
        draft: artistReleases.filter(r => r.status === "draft").length,
        shopping: artistReleases.filter(r => r.status === "shopping").length,
        accepted: artistReleases.filter(r => r.status === "accepted").length,
        released: artistReleases.filter(r => r.status === "released").length,
      }
      setStats(artistStats)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateNew = () => {
    setEditingRelease(null)
    setFormOpen(true)
  }

  const handleEdit = (release: Release) => {
    setEditingRelease(release)
    setFormOpen(true)
  }

  const handleViewLabels = (release: Release) => {
    setSelectedRelease(release)
    setLabelsDialogOpen(true)
  }

  const handleLabelsSuccess = async () => {
    await loadData()
    if (selectedRelease) {
      const updated = releases.find((r) => r.id === selectedRelease.id)
      if (updated) {
        setSelectedRelease(updated)
      }
    }
  }

  return (
    <AppLayout title="Releases - A2G Talents">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Releases</h1>
            <p className="text-muted-foreground">
              Lanzamientos musicales de todos los artistas
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Release
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <ReleasesStats stats={stats} />

            {/* Table */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Todos los Releases</h2>
              <ReleasesTable
                releases={releases}
                onRefresh={loadData}
                onEdit={handleEdit}
                onViewLabels={handleViewLabels}
              />
            </div>
          </>
        )}
      </div>

      {/* Form Dialog */}
      <ReleaseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        projects={projects}
        release={editingRelease}
        onSuccess={loadData}
      />

      {/* Labels Dialog */}
      <LabelsDialog
        open={labelsDialogOpen}
        onOpenChange={setLabelsDialogOpen}
        release={selectedRelease}
        onSuccess={handleLabelsSuccess}
      />
    </AppLayout>
  )
}
