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
import { createContract, updateContract, type Contract } from "@/src/actions/contracts"

type ContractStatus = "draft" | "negotiating" | "sent" | "signing" | "active" | "completed" | "terminated"
type ContractType = "release" | "management" | "publishing" | "booking" | "licensing" | "other"

interface ContractFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  contract?: Contract | null
  onSuccess?: () => void
}

export function ContractForm({ open, onOpenChange, projects, contract, onSuccess }: ContractFormProps) {
  const isEditing = !!contract

  const [projectId, setProjectId] = useState(contract?.project_id || "")
  const [title, setTitle] = useState(contract?.title || "")
  const [counterparty, setCounterparty] = useState(contract?.counterparty || "")
  const [contractType, setContractType] = useState<ContractType>((contract?.contract_type as ContractType) || "release")
  const [status, setStatus] = useState<ContractStatus>((contract?.status as ContractStatus) || "negotiating")
  const [value, setValue] = useState(contract?.value || "")
  const [currency, setCurrency] = useState(contract?.currency || "USD")
  const [startDate, setStartDate] = useState(contract?.start_date || "")
  const [endDate, setEndDate] = useState(contract?.end_date || "")
  const [keyTerms, setKeyTerms] = useState(contract?.key_terms || "")
  const [documentUrl, setDocumentUrl] = useState(contract?.document_url || "")
  const [contactName, setContactName] = useState(contract?.contact_name || "")
  const [contactEmail, setContactEmail] = useState(contract?.contact_email || "")
  const [notes, setNotes] = useState(contract?.notes || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!projectId || !title.trim() || !counterparty.trim()) {
      setError("Artista, título y contraparte son obligatorios")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload = {
      project_id: projectId,
      title: title.trim(),
      counterparty: counterparty.trim(),
      contract_type: contractType,
      status,
      value: value || null,
      currency,
      start_date: startDate || null,
      end_date: endDate || null,
      key_terms: keyTerms || null,
      document_url: documentUrl || null,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      notes: notes || null,
    }

    try {
      if (isEditing && contract) {
        const updated = await updateContract(contract.id, payload)
        if (!updated) { setError("Error al actualizar"); return }
      } else {
        const created = await createContract(payload as any)
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
      setProjectId(""); setTitle(""); setCounterparty("")
      setContractType("release"); setStatus("negotiating")
      setValue(""); setCurrency("USD"); setStartDate("")
      setEndDate(""); setKeyTerms(""); setDocumentUrl("")
      setContactName(""); setContactEmail(""); setNotes("")
    }
    setError(null)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && contract) {
      setProjectId(contract.project_id || "")
      setTitle(contract.title)
      setCounterparty(contract.counterparty)
      setContractType(contract.contract_type as ContractType)
      setStatus(contract.status as ContractStatus)
      setValue(contract.value || "")
      setCurrency(contract.currency)
      setStartDate(contract.start_date || "")
      setEndDate(contract.end_date || "")
      setKeyTerms(contract.key_terms || "")
      setDocumentUrl(contract.document_url || "")
      setContactName(contract.contact_name || "")
      setContactEmail(contract.contact_email || "")
      setNotes(contract.notes || "")
    } else if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const artistProjects = projects.filter((p) => p.type === "artist")

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Contrato" : "Nuevo Contrato"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los datos del contrato" : "Registra un nuevo contrato o acuerdo"}
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
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
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
              <Label>Contraparte</Label>
              <Input placeholder="Ej: Lush Records" value={counterparty} onChange={(e) => setCounterparty(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input placeholder="Ej: Dreams - Master License Agreement" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={contractType} onValueChange={(v) => setContractType(v as ContractType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="release">Release</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="publishing">Publishing</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="licensing">Licensing</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ContractStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="negotiating">Negociando</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="signing">Firmando</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="terminated">Terminado</SelectItem>
                </SelectContent>
              </Select>
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL Documento</Label>
            <Input placeholder="https://..." value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contacto</Label>
              <Input placeholder="Nombre" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@..." value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Términos Clave</Label>
            <Textarea placeholder="Resumen de términos importantes..." value={keyTerms} onChange={(e) => setKeyTerms(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea placeholder="Notas adicionales..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !projectId || !title.trim() || !counterparty.trim()}>
            {isSubmitting ? "Guardando..." : isEditing ? "Guardar" : "Crear Contrato"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
