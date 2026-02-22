"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useFormBuilder } from "@/lib/form-builder-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { WorkspaceCard } from "@/components/workspace-card"
import { WorkspaceDialog } from "@/components/workspace-dialog"
import { Button } from "@/components/ui/button"
import type { Workspace } from "@/lib/types"
import { toast } from "sonner"

export default function DashboardPage() {
  const { state, dispatch } = useFormBuilder()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null)

  const handleCreate = (data: { name: string; description?: string; color: string; icon: string }) => {
    dispatch({ type: "ADD_WORKSPACE", payload: data })
    toast.success("Espacio de trabajo creado")
  }

  const handleEdit = (data: { name: string; description?: string; color: string; icon: string }) => {
    if (!editingWorkspace) return
    dispatch({ type: "UPDATE_WORKSPACE", payload: { id: editingWorkspace.id, ...data } })
    toast.success("Espacio de trabajo actualizado")
    setEditingWorkspace(null)
  }

  const handleDelete = (ws: Workspace) => {
    dispatch({ type: "DELETE_WORKSPACE", payload: ws.id })
    toast.success("Espacio de trabajo eliminado")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Espacios de Trabajo</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona un espacio de trabajo para gestionar sus formularios
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Espacio
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.workspaces.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
              onEdit={() => {
                setEditingWorkspace(ws)
              }}
              onDelete={() => handleDelete(ws)}
            />
          ))}
        </div>
        {state.workspaces.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="mb-2 text-lg font-medium text-foreground">Sin espacios de trabajo</p>
            <p className="mb-4 text-sm text-muted-foreground">Crea tu primer espacio de trabajo para empezar</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Crear Espacio de Trabajo
            </Button>
          </div>
        )}
      </main>

      <WorkspaceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleCreate}
      />
      <WorkspaceDialog
        open={!!editingWorkspace}
        onClose={() => setEditingWorkspace(null)}
        onSave={handleEdit}
        workspace={editingWorkspace}
      />
    </div>
  )
}
