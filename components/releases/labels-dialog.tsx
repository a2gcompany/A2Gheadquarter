"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Clock, Check, X, HelpCircle } from "lucide-react"
import { type Release, type LabelContact } from "@/src/db/schema"
import { addLabelContact, updateLabelContact, removeLabelContact } from "@/src/actions/releases"
import { cn } from "@/lib/utils"

interface LabelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  release: Release | null
  onSuccess?: () => void
}

const statusConfig = {
  pending: { label: "Pendiente", icon: Clock, color: "text-yellow-500" },
  waiting: { label: "Esperando", icon: HelpCircle, color: "text-blue-500" },
  rejected: { label: "Rechazado", icon: X, color: "text-red-500" },
  accepted: { label: "Aceptado", icon: Check, color: "text-green-500" },
}

export function LabelsDialog({ open, onOpenChange, release, onSuccess }: LabelsDialogProps) {
  const [newLabel, setNewLabel] = useState("")
  const [newStatus, setNewStatus] = useState<LabelContact["status"]>("pending")
  const [isAdding, setIsAdding] = useState(false)

  if (!release) return null

  const labels = (release.labelsContacted || []) as LabelContact[]

  const handleAddLabel = async () => {
    if (!newLabel.trim()) return

    setIsAdding(true)
    try {
      const contact: LabelContact = {
        label: newLabel.trim(),
        status: newStatus,
        date: new Date().toISOString().split("T")[0],
      }
      await addLabelContact(release.id, contact)
      setNewLabel("")
      setNewStatus("pending")
      onSuccess?.()
    } catch (err) {
      console.error("Error adding label:", err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleUpdateStatus = async (labelName: string, status: LabelContact["status"]) => {
    try {
      await updateLabelContact(release.id, labelName, { status })
      onSuccess?.()
    } catch (err) {
      console.error("Error updating label:", err)
    }
  }

  const handleRemoveLabel = async (labelName: string) => {
    if (confirm(`Eliminar ${labelName} de la lista?`)) {
      try {
        await removeLabelContact(release.id, labelName)
        onSuccess?.()
      } catch (err) {
        console.error("Error removing label:", err)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Labels Contactados</DialogTitle>
          <DialogDescription>
            Track: <span className="font-medium">{release.trackName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add new label */}
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del label..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-1"
            />
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as LabelContact["status"])}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="waiting">Esperando</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
                <SelectItem value="accepted">Aceptado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="icon"
              onClick={handleAddLabel}
              disabled={isAdding || !newLabel.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Labels list */}
          {labels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay labels contactados</p>
              <p className="text-sm mt-1">Agrega el primer label arriba</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead className="w-[100px]">Fecha</TableHead>
                    <TableHead className="w-[140px]">Estado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labels.map((contact) => {
                    const config = statusConfig[contact.status]
                    const Icon = config.icon
                    return (
                      <TableRow key={contact.label}>
                        <TableCell className="font-medium">
                          {contact.label}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {contact.date}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={contact.status}
                            onValueChange={(v) => handleUpdateStatus(contact.label, v as LabelContact["status"])}
                          >
                            <SelectTrigger className="h-8 w-[120px]">
                              <SelectValue>
                                <div className="flex items-center gap-1.5">
                                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                                  <span className="text-xs">{config.label}</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, cfg]) => {
                                const StatusIcon = cfg.icon
                                return (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-1.5">
                                      <StatusIcon className={cn("h-3.5 w-3.5", cfg.color)} />
                                      <span>{cfg.label}</span>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveLabel(contact.label)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {labels.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {Object.entries(statusConfig).map(([key, cfg]) => {
                const count = labels.filter((l) => l.status === key).length
                if (count === 0) return null
                const Icon = cfg.icon
                return (
                  <Badge key={key} variant="outline" className="gap-1">
                    <Icon className={cn("h-3 w-3", cfg.color)} />
                    {count} {cfg.label.toLowerCase()}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
