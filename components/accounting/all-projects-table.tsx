"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Music } from "lucide-react"
import { type Project } from "@/src/actions/projects"
import { cn } from "@/lib/utils"

interface ProjectWithPL extends Project {
  income: number
  expense: number
  balance: number
}

interface AllProjectsTableProps {
  projects: ProjectWithPL[]
  onSelectProject: (projectId: string) => void
}

export function AllProjectsTable({ projects, onSelectProject }: AllProjectsTableProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Calculate totals
  const totals = projects.reduce(
    (acc, p) => ({
      income: acc.income + p.income,
      expense: acc.expense + p.expense,
      balance: acc.balance + p.balance,
    }),
    { income: 0, expense: 0, balance: 0 }
  )

  if (projects.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No hay proyectos registrados</p>
          <p className="text-sm mt-1">Crea un proyecto para comenzar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Resumen por Proyecto</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead className="text-right">Gastos</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectProject(project.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {project.type === "artist" ? (
                      <Music className="h-4 w-4 text-primary" />
                    ) : (
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{project.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-emerald-500 font-mono text-sm">
                    +{formatCurrency(project.income)} €
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-rose-500 font-mono text-sm">
                    -{formatCurrency(project.expense)} €
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-mono text-sm font-medium",
                    project.balance >= 0 ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {project.balance >= 0 ? "+" : ""}{formatCurrency(project.balance)} €
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {/* Totals row */}
            <TableRow className="bg-muted/30 font-medium">
              <TableCell>TOTAL</TableCell>
              <TableCell className="text-right">
                <span className="text-emerald-500 font-mono">
                  +{formatCurrency(totals.income)} €
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-rose-500 font-mono">
                  -{formatCurrency(totals.expense)} €
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  "font-mono",
                  totals.balance >= 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {totals.balance >= 0 ? "+" : ""}{formatCurrency(totals.balance)} €
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
