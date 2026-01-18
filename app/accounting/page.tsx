"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { ProjectSelector } from "@/components/accounting/project-selector"
import { CSVImport } from "@/components/accounting/csv-import"
import { TransactionsTable } from "@/components/accounting/transactions-table"
import { PLSummary } from "@/components/accounting/pl-summary"
import { AllProjectsTable } from "@/components/accounting/all-projects-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { type Project, type Transaction } from "@/src/db/schema"
import { getProjects } from "@/src/actions/projects"
import {
  getTransactionsByProject,
  getProjectPL,
  getProjectMonthlyData,
  getAllProjectsPL,
} from "@/src/actions/transactions"

export default function AccountingPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pl, setPL] = useState({ income: 0, expense: 0, balance: 0 })
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([])
  const [allProjectsPL, setAllProjectsPL] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("transactions")

  // Load projects
  useEffect(() => {
    loadProjects()
  }, [])

  // Load data when project changes
  useEffect(() => {
    loadProjectData()
  }, [selectedProjectId])

  const loadProjects = async () => {
    const data = await getProjects()
    setProjects(data)
    setLoading(false)
  }

  const loadProjectData = useCallback(async () => {
    if (selectedProjectId === "all") {
      // Load all projects overview
      const data = await getAllProjectsPL()
      setAllProjectsPL(data)
      setTransactions([])
      setPL({ income: 0, expense: 0, balance: 0 })
      setMonthlyData([])

      // Calculate totals
      const totals = data.reduce(
        (acc, p) => ({
          income: acc.income + p.income,
          expense: acc.expense + p.expense,
          balance: acc.balance + p.balance,
        }),
        { income: 0, expense: 0, balance: 0 }
      )
      setPL(totals)
    } else {
      // Load single project data
      const [txs, plData, monthly] = await Promise.all([
        getTransactionsByProject(selectedProjectId),
        getProjectPL(selectedProjectId),
        getProjectMonthlyData(selectedProjectId),
      ])
      setTransactions(txs)
      setPL(plData)
      setMonthlyData(monthly)
      setAllProjectsPL([])
    }
  }, [selectedProjectId])

  const handleRefresh = () => {
    loadProjectData()
    loadProjects()
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const projectName = selectedProject?.name || "Todos los proyectos"

  return (
    <AppLayout title="Contabilidad">
      <div className="space-y-6">
        {/* Header with project selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <ProjectSelector
            projects={projects}
            value={selectedProjectId}
            onValueChange={(value) => {
              setSelectedProjectId(value)
              if (value !== "all") {
                setTab("transactions")
              }
            }}
            onProjectCreated={loadProjects}
          />

          {selectedProjectId !== "all" && (
            <CSVImport
              projectId={selectedProjectId}
              projectName={projectName}
              onSuccess={handleRefresh}
            />
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* P&L Summary */}
            <PLSummary
              income={pl.income}
              expense={pl.expense}
              balance={pl.balance}
              monthlyData={selectedProjectId !== "all" ? monthlyData : undefined}
            />

            {/* Content based on selection */}
            {selectedProjectId === "all" ? (
              <AllProjectsTable
                projects={allProjectsPL}
                onSelectProject={setSelectedProjectId}
              />
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  Transacciones de {projectName}
                </h2>
                <TransactionsTable
                  transactions={transactions}
                  onRefresh={handleRefresh}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
