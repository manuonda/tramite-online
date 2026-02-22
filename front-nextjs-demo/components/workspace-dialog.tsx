"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Workspace } from "@/lib/types"

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
const ICONS = ["FolderOpen", "Users", "ClipboardCheck", "Headphones", "FileText"]

interface WorkspaceDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; description?: string; color: string; icon: string }) => void
  workspace?: Workspace | null
}

export function WorkspaceDialog({ open, onClose, onSave, workspace }: WorkspaceDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState(ICONS[0])

  useEffect(() => {
    if (workspace) {
      setName(workspace.name)
      setDescription(workspace.description || "")
      setColor(workspace.color)
      setIcon(workspace.icon)
    } else {
      setName("")
      setDescription("")
      setColor(COLORS[0])
      setIcon(ICONS[0])
    }
  }, [workspace, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim() || undefined, color, icon })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{workspace ? "Editar Espacio de Trabajo" : "Nuevo Espacio de Trabajo"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Nombre</Label>
              <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Recursos Humanos" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-desc">Descripcion (opcional)</Label>
              <Textarea id="ws-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el proposito de este espacio..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: color === c ? "var(--foreground)" : "transparent" }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((ic) => (
                  <Button
                    key={ic}
                    type="button"
                    variant={icon === ic ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIcon(ic)}
                    className="text-xs"
                  >
                    {ic === "FolderOpen" ? "Carpeta" : ic === "Users" ? "Usuarios" : ic === "ClipboardCheck" ? "Checklist" : ic === "Headphones" ? "Soporte" : "Documento"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!name.trim()}>
              {workspace ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
