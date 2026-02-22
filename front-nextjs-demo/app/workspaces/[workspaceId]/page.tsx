"use client"

import { useState } from "react"
import { use } from "react"
import { useFormBuilder } from "@/lib/form-builder-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { FormCard } from "@/components/form-card"
import { FormDialog } from "@/components/form-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { notFound } from "next/navigation"
import type { Form } from "@/lib/types"

export default function WorkspacePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = use(params)
  const { state, dispatch, getWorkspace } = useFormBuilder()
  const workspace = getWorkspace(workspaceId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all")

  if (!workspace) return notFound()

  const filteredForms = workspace.forms.filter((f) => {
    if (filter === "all") return true
    return f.status === filter
  })

  const handleCreate = (data: { name: string; description?: string }) => {
    dispatch({ type: "ADD_FORM", payload: { workspaceId, ...data } })
    toast.success("Formulario creado")
  }

  const handleEdit = (data: { name: string; description?: string }) => {
    if (!editingForm) return
    dispatch({ type: "UPDATE_FORM", payload: { workspaceId, formId: editingForm.id, ...data } })
    toast.success("Formulario actualizado")
    setEditingForm(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbs={[
          { label: "Espacios", href: "/" },
          { label: workspace.name },
        ]}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: workspace.color }}
              />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{workspace.name}</h1>
            </div>
            {workspace.description && (
              <p className="mt-1 text-sm text-muted-foreground">{workspace.description}</p>
            )}
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Formulario
          </Button>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Todos ({workspace.forms.length})</TabsTrigger>
            <TabsTrigger value="draft">Borradores ({workspace.forms.filter((f) => f.status === "draft").length})</TabsTrigger>
            <TabsTrigger value="published">Publicados ({workspace.forms.filter((f) => f.status === "published").length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              workspaceId={workspaceId}
              onEdit={() => setEditingForm(form)}
              onDelete={() => {
                dispatch({ type: "DELETE_FORM", payload: { workspaceId, formId: form.id } })
                toast.success("Formulario eliminado")
              }}
              onDuplicate={() => {
                dispatch({ type: "DUPLICATE_FORM", payload: { workspaceId, formId: form.id } })
                toast.success("Formulario duplicado")
              }}
            />
          ))}
        </div>

        {filteredForms.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="mb-2 text-lg font-medium text-foreground">
              {filter === "all" ? "Sin formularios" : `Sin formularios ${filter === "draft" ? "en borrador" : "publicados"}`}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              {filter === "all" ? "Crea tu primer formulario en este espacio" : "Cambia el filtro o crea un nuevo formulario"}
            </p>
            {filter === "all" && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Crear Formulario
              </Button>
            )}
          </div>
        )}
      </main>

      <FormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleCreate} />
      <FormDialog open={!!editingForm} onClose={() => setEditingForm(null)} onSave={handleEdit} form={editingForm} />
    </div>
  )
}
