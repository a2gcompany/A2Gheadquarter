"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionsTable } from "@/components/accounting/transactions-table"
import { CSVImport } from "@/components/accounting/csv-import"
import { PLSummary } from "@/components/accounting/pl-summary"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { getProjects, type Project } from "@/src/actions/projects"
import {
  getTransactionsByProject,
  getAllTransactions,
  getProjectPL,
  getAllProjectsPL,
} from "@/src/actions/transactions"

export default function TalentsAccountingPage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [transactions, setTransactions] = useState<any[]>([])
  const [pl, setPl] = useState({ income: 0, expense: 0, balance: 0 })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const projectsData = await getProjects()
      // Filter to only artist projects
      const artistProjects = projectsData.filter(p => p.type === "artist")
      setProjects(artistProjects)

      const artistProjectIds = artistProjects.map(p => p.id)

      if (selectedProject === "all") {
        // Get all transactions for artists
        const allTransactions = await getAllTransactions()
        const artistTransactions = allTransactions.filter(t =>
          artistProjectIds.includes(t.project_id)
        )
        setTransactions(artistTransactions)

        // Calculate P&L for all artist projects
        const allPL = await getAllProjectsPL()
        const artistPL = allPL.filter(p => artistProjectIds.includes(p.id))
        const totalIncome = artistPL.reduce((sum, p) => sum + p.income, 0)
        const totalExpense = artistPL.reduce((sum, p) => sum + p.expense, 0)
        setPl({
          income: totalIncome,
          expense: totalExpense,
          balance: totalIncome - totalExpense,
        })
      } else {
        const [transactionsData, plData] = await Promise.all([
          getTransactionsByProject(selectedProject),
          getProjectPL(selectedProject),
        ])
        setTransactions(transactionsData)
        setPl(plData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedProject])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <AppLayout title="Contabilidad - A2G Talents">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contabilidad</h1>
            <p className="text-muted-foreground">
              Finanzas de A2G Talents y sus artistas
            </p>
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar artista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los artistas</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* P&L Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ingresos</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {pl.income.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gastos</p>
                      <p className="text-2xl font-bold text-red-500">
                        {pl.expense.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className={`text-2xl font-bold ${pl.balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {pl.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CSV Import */}
            {selectedProject !== "all" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Importar Transacciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <CSVImport
                      projectId={selectedProject}
                      projectName={projects.find(p => p.id === selectedProject)?.name || ""}
                      onSuccess={loadData}
                    />
                </CardContent>
              </Card>
            )}

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Transacciones
                  {selectedProject !== "all" && projects.find(p => p.id === selectedProject) && (
                    <span className="font-normal text-muted-foreground ml-2">
                      - {projects.find(p => p.id === selectedProject)?.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionsTable transactions={transactions} onRefresh={loadData} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}
