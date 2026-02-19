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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Music } from "lucide-react"
import { type Project } from "@/src/actions/projects"
import { createBooking, updateBooking, type Booking } from "@/src/actions/bookings"

type BookingStatus = "negotiating" | "confirmed" | "contracted" | "completed" | "cancelled"

interface BookingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  booking?: Booking | null
  onSuccess?: () => void
}

const currencies = ["EUR", "USD", "GBP", "AED", "CHF"]

export function BookingForm({ open, onOpenChange, projects, booking, onSuccess }: BookingFormProps) {
  const isEditing = !!booking

  const [projectId, setProjectId] = useState(booking?.project_id || "")
  const [venue, setVenue] = useState(booking?.venue || "")
  const [city, setCity] = useState(booking?.city || "")
  const [country, setCountry] = useState(booking?.country || "")
  const [fee, setFee] = useState(booking?.fee || "")
  const [feeCurrency, setFeeCurrency] = useState(booking?.fee_currency || "EUR")
  const [status, setStatus] = useState<BookingStatus>(booking?.status || "negotiating")
  const [showDate, setShowDate] = useState(booking?.show_date || "")
  const [notes, setNotes] = useState(booking?.notes || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!projectId || !venue.trim() || !city.trim() || !country.trim()) {
      setError("Artista, venue, ciudad y pais son obligatorios")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (isEditing && booking) {
        const updated = await updateBooking(booking.id, {
          project_id: projectId,
          venue: venue.trim(),
          city: city.trim(),
          country: country.trim(),
          fee: fee || null,
          fee_currency: feeCurrency,
          status,
          show_date: showDate || null,
          notes: notes || null,
        })
        if (!updated) {
          setError("Error al actualizar el booking")
          return
        }
      } else {
        const created = await createBooking({
          project_id: projectId,
          venue: venue.trim(),
          city: city.trim(),
          country: country.trim(),
          fee: fee || null,
          fee_currency: feeCurrency,
          status,
          show_date: showDate || null,
          notes: notes || null,
          contract_id: null,
          region: null,
          fee_usd: null,
          artist_name: null,
          event_name: null,
        })
        if (!created) {
          setError("Error al crear el booking")
          return
        }
      }

      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (err) {
      console.error("Error saving booking:", err)
      setError("Error al guardar. Verifica la conexion.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    if (!isEditing) {
      setProjectId("")
      setVenue("")
      setCity("")
      setCountry("")
      setFee("")
      setFeeCurrency("EUR")
      setStatus("negotiating")
      setShowDate("")
      setNotes("")
    }
    setError(null)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && booking) {
      setProjectId(booking.project_id)
      setVenue(booking.venue)
      setCity(booking.city)
      setCountry(booking.country)
      setFee(booking.fee || "")
      setFeeCurrency(booking.fee_currency || "EUR")
      setStatus(booking.status)
      setShowDate(booking.show_date || "")
      setNotes(booking.notes || "")
    } else if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  // Filter only artist projects
  const artistProjects = projects.filter((p) => p.type === "artist")

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Booking" : "Nuevo Booking"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del booking"
              : "Registra un nuevo show o evento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="project">Artista</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar artista" />
              </SelectTrigger>
              <SelectContent>
                {artistProjects.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No hay artistas. Crea uno en Contabilidad.
                  </div>
                ) : (
                  artistProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-primary" />
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              placeholder="Ej: Pacha Ibiza"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                placeholder="Ej: Ibiza"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pais</Label>
              <Input
                id="country"
                placeholder="Ej: Spain"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fee">Fee</Label>
              <Input
                id="fee"
                type="number"
                placeholder="10000"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={feeCurrency} onValueChange={setFeeCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as BookingStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negotiating">Negociando</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="contracted">Contratado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="showDate">Fecha del Show</Label>
              <Input
                id="showDate"
                type="date"
                value={showDate}
                onChange={(e) => setShowDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !projectId || !venue.trim() || !city.trim() || !country.trim()}
          >
            {isSubmitting ? "Guardando..." : isEditing ? "Guardar" : "Crear Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
