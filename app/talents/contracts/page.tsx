"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { ContractsTable } from "@/components/contracts/contracts-table"
import { ContractsStats } from "@/components/contracts/contracts-stats"
import { ContractForm } from "@/components/contracts/contract-form"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { getProjects, type Project } from "@/src/actions/projects"
import { getAllContractsWithProject, getContractsStats, type Contract } from "@/src/actions/contracts"

export default function TalentsContractsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [contracts, setContracts] = useState<(Contract & { projectName: string })[]>([])
  const [stats, setStats] = useState({
    total: 0, draft: 0, negotiating: 0, sent: 0, signing: 0,
    active: 0, completed: 0, terminated: 0, totalValue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [projectsData, contractsData, statsData] = await Promise.all([
        getProjects(),
        getAllContractsWithProject(),
        getContractsStats(),
      ])
      const artistProjects = projectsData.filter(p => p.type === "artist")
      const artistProjectIds = artistProjects.map(p => p.id)
      const artistContracts = contractsData.filter((c: any) => artistProjectIds.includes(c.project_id))

      setProjects(artistProjects)
      setContracts(artistContracts)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingContract(null)
  }

  if (loading) {
    return (
      <AppLayout title="Contratos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Contratos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Gestión de Contratos</h2>
            <p className="text-sm text-muted-foreground">Contratos de releases, management, publishing y más</p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo Contrato
          </Button>
        </div>

        <ContractsStats stats={stats} />

        <ContractsTable
          contracts={contracts}
          onRefresh={loadData}
          onEdit={handleEdit}
        />

        <ContractForm
          open={formOpen}
          onOpenChange={handleFormClose}
          projects={projects}
          contract={editingContract}
          onSuccess={loadData}
        />
      </div>
    </AppLayout>
  )
}
