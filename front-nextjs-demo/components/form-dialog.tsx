"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Form } from "@/lib/types"

interface FormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; description?: string }) => void
  form?: Form | null
}

export function FormDialog({ open, onClose, onSave, form }: FormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (form) {
      setName(form.name)
      setDescription(form.description || "")
    } else {
      setName("")
      setDescription("")
    }
  }, [form, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim() || undefined })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{form ? "Editar Formulario" : "Nuevo Formulario"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-name">Nombre</Label>
              <Input id="form-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Evaluacion de Desempeno" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-desc">Descripcion (opcional)</Label>
              <Textarea id="form-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el proposito del formulario..." rows={3} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!name.trim()}>
              {form ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
