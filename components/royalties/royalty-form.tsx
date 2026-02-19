"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Music } from "lucide-react"
import { type Project } from "@/src/actions/projects"
import { createRoyalty, updateRoyalty, type Royalty } from "@/src/actions/royalties"

type RoyaltyStatus = "pending" | "invoiced" | "paid" | "disputed" | "overdue"

interface RoyaltyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  royalty?: Royalty | null
  onSuccess?: () => void
}

export function RoyaltyForm({ open, onOpenChange, projects, royalty, onSuccess }: RoyaltyFormProps) {
  const isEditing = !!royalty

  const [projectId, setProjectId] = useState(royalty?.project_id || "")
  const [trackName, setTrackName] = useState(royalty?.track_name || "")
  const [source, setSource] = useState(royalty?.source || "")
  const [amount, setAmount] = useState(royalty?.amount || "")
  const [currency, setCurrency] = useState(royalty?.currency || "USD")
  const [status, setStatus] = useState<RoyaltyStatus>((royalty?.status as RoyaltyStatus) || "pending")
  const [invoiceNumber, setInvoiceNumber] = useState(royalty?.invoice_number || "")
  const [invoiceDate, setInvoiceDate] = useState(royalty?.invoice_date || "")
  const [dueDate, setDueDate] = useState(royalty?.due_date || "")
  const [paidDate, setPaidDate] = useState(royalty?.paid_date || "")
  const [contactName, setContactName] = useState(royalty?.contact_name || "")
  const [contactEmail, setContactEmail] = useState(royalty?.contact_email || "")
  const [notes, setNotes] = useState(royalty?.notes || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!projectId || !trackName.trim() || !source.trim() || !amount) {
      setError("Artista, track, fuente y monto son obligatorios")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload = {
      project_id: projectId,
      track_name: trackName.trim(),
      source: source.trim(),
      amount,
      currency,
      status,
      invoice_number: invoiceNumber || null,
      invoice_date: invoiceDate || null,
      due_date: dueDate || null,
      paid_date: paidDate || null,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      notes: notes || null,
    }

    try {
      if (isEditing && royalty) {
        const updated = await updateRoyalty(royalty.id, payload)
        if (!updated) { setError("Error al actualizar"); return }
      } else {
        const created = await createRoyalty(payload as any)
        if (!created) { setError("Error al crear"); return }
      }
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch {
      setError("Error al guardar")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    if (!isEditing) {
      setProjectId(""); setTrackName(""); setSource(""); setAmount("")
      setCurrency("USD"); setStatus("pending"); setInvoiceNumber("")
      setInvoiceDate(""); setDueDate(""); setPaidDate("")
      setContactName(""); setContactEmail(""); setNotes("")
    }
    setError(null)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && royalty) {
      setProjectId(royalty.project_id || "")
      setTrackName(royalty.track_name)
      setSource(royalty.source)
      setAmount(royalty.amount)
      setCurrency(royalty.currency)
      setStatus(royalty.status as RoyaltyStatus)
      setInvoiceNumber(royalty.invoice_number || "")
      setInvoiceDate(royalty.invoice_date || "")
      setDueDate(royalty.due_date || "")
      setPaidDate(royalty.paid_date || "")
      setContactName(royalty.contact_name || "")
      setContactEmail(royalty.contact_email || "")
      setNotes(royalty.notes || "")
    } else if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const artistProjects = projects.filter((p) => p.type === "artist")

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Royalty" : "Nuevo Royalty"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los datos del royalty" : "Registra un nuevo royalty para seguimiento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Artista</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {artistProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-primary" />
                        <span>{p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Track</Label>
              <Input placeholder="Ej: HOLLOW" value={trackName} onChange={(e) => setTrackName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Input placeholder="Ej: Insomniac" value={source} onChange={(e) => setSource(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RoyaltyStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="invoiced">Facturado</SelectItem>
                  <SelectItem value="paid">Cobrado</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="disputed">En Disputa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nº Factura</Label>
              <Input placeholder="INV-001" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Fecha Factura</Label>
              <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Vencimiento</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Cobro</Label>
              <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contacto</Label>
              <Input placeholder="Nombre" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email Contacto</Label>
              <Input type="email" placeholder="email@..." value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea placeholder="Notas adicionales..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !projectId || !trackName.trim() || !source.trim() || !amount}>
            {isSubmitting ? "Guardando..." : isEditing ? "Guardar" : "Crear Royalty"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
