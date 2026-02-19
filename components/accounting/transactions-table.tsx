"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search, Filter } from "lucide-react"
import { deleteTransaction, type Transaction } from "@/src/actions/transactions"
import { cn } from "@/lib/utils"

function getSourceBadge(sourceFile: string | null) {
  const sf = sourceFile || ""
  if (sf.startsWith("stripe:")) return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-500">Stripe</Badge>
  if (sf.startsWith("shopify:")) return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-500">Shopify</Badge>
  if (sf.startsWith("paypal:")) return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-500">PayPal</Badge>
  return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Other</Badge>
}

interface TransactionsTableProps {
  transactions: Transaction[]
  onRefresh?: () => void
}

export function TransactionsTable({ transactions, onRefresh }: TransactionsTableProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    transactions.forEach((t) => {
      if (t.category) cats.add(t.category)
    })
    return Array.from(cats).sort()
  }, [transactions])

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = search === "" ||
        t.description.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || t.type === typeFilter
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter
      return matchesSearch && matchesType && matchesCategory
    })
  }, [transactions, search, typeFilter, categoryFilter])

  const handleDelete = async (id: string) => {
    if (confirm("Eliminar esta transaccion?")) {
      await deleteTransaction(id)
      onRefresh?.()
    }
  }

  const formatAmount = (amount: string, type: string) => {
    const num = parseFloat(amount)
    const formatted = Math.abs(num).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return type === "income" ? `+${formatted}` : `-${formatted}`
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay transacciones registradas</p>
        <p className="text-sm mt-1">Importa un CSV para comenzar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripcion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Ingresos</SelectItem>
            <SelectItem value="expense">Gastos</SelectItem>
          </SelectContent>
        </Select>
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} de {transactions.length} transacciones
      </p>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Fecha</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead className="w-[80px]">Fuente</TableHead>
                <TableHead className="w-[100px]">Categoria</TableHead>
                <TableHead className="w-[120px] text-right">Importe</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    {getSourceBadge(transaction.source_file)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {transaction.category || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono text-sm",
                      transaction.type === "income" ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {formatAmount(transaction.amount, transaction.type)} €
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
