"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Plus,
  Loader2,
  DollarSign,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  type EmployeeWithUnit,
} from "@/src/actions/employees"
import { getBusinessUnits, type BusinessUnit } from "@/src/actions/business-units"

export default function EmployeesPage() {
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<EmployeeWithUnit[]>([])
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([])
  const [stats, setStats] = useState({ total: 0, totalMonthlyCost: 0, byUnit: {} as Record<string, number> })
  const [filterUnit, setFilterUnit] = useState<string>("all")

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithUnit | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    monthly_cost: "",
    currency: "EUR",
    business_unit_id: "",
    status: "active" as "active" | "inactive" | "contractor",
  })
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const [employeesData, unitsData, statsData] = await Promise.all([
        getEmployees(),
        getBusinessUnits(),
        getEmployeeStats(),
      ])
      setEmployees(employeesData)
      setBusinessUnits(unitsData.filter(u => u.slug !== "holding"))
      setStats(statsData)
    } catch (error) {
      console.error("Error loading employees:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredEmployees = filterUnit === "all"
    ? employees
    : employees.filter(e => e.business_unit_slug === filterUnit)

  const handleOpenForm = (employee?: EmployeeWithUnit) => {
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        name: employee.name,
        role: employee.role,
        email: employee.email || "",
        monthly_cost: employee.monthly_cost?.toString() || "",
        currency: employee.currency,
        business_unit_id: employee.business_unit_id || "",
        status: employee.status,
      })
    } else {
      setEditingEmployee(null)
      setFormData({
        name: "",
        role: "",
        email: "",
        monthly_cost: "",
        currency: "EUR",
        business_unit_id: "",
        status: "active",
      })
    }
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name: formData.name,
        role: formData.role,
        email: formData.email || undefined,
        monthly_cost: formData.monthly_cost ? parseFloat(formData.monthly_cost) : undefined,
        currency: formData.currency,
        business_unit_id: formData.business_unit_id || undefined,
        status: formData.status,
      }

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, data)
      } else {
        await createEmployee(data)
      }

      setFormOpen(false)
      loadData()
    } catch (error) {
      console.error("Error saving employee:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Estas seguro de eliminar este empleado?")) return
    try {
      await deleteEmployee(id)
      loadData()
    } catch (error) {
      console.error("Error deleting employee:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500">Activo</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactivo</Badge>
      case "contractor":
        return <Badge variant="outline">Contractor</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <AppLayout title="Empleados">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Empleados">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Empleados</h1>
            <p className="text-muted-foreground">
              Gestion del equipo A2G
            </p>
          </div>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_cost">Coste Mensual</Label>
                    <Input
                      id="monthly_cost"
                      type="number"
                      value={formData.monthly_cost}
                      onChange={(e) => setFormData({ ...formData, monthly_cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(v) => setFormData({ ...formData, currency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_unit">Empresa</Label>
                    <Select
                      value={formData.business_unit_id}
                      onValueChange={(v) => setFormData({ ...formData, business_unit_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingEmployee ? "Guardar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Empleados</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coste Mensual</p>
                  <p className="text-2xl font-bold">{stats.totalMonthlyCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {businessUnits.slice(0, 2).map((unit) => (
            <Card key={unit.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{unit.name}</p>
                    <p className="text-2xl font-bold">{stats.byUnit[unit.slug] || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Filtrar por:</span>
          <Select value={filterUnit} onValueChange={setFilterUnit}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas las empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las empresas</SelectItem>
              {businessUnits.map((unit) => (
                <SelectItem key={unit.id} value={unit.slug}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Coste Mensual</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No hay empleados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.business_unit_name || "-"}</TableCell>
                      <TableCell>
                        {employee.monthly_cost
                          ? `${employee.currency} ${Number(employee.monthly_cost).toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenForm(employee)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
