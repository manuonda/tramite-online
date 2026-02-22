"use client"

import { use } from "react"
import Link from "next/link"
import { useFormBuilder } from "@/lib/form-builder-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { InlineEdit } from "@/components/inline-edit"
import { SectionEditor } from "@/components/section-editor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Eye } from "lucide-react"
import { toast } from "sonner"
import { notFound } from "next/navigation"
import type { QuestionType } from "@/lib/types"

export default function FormEditorPage({
  params,
}: {
  params: Promise<{ workspaceId: string; formId: string }>
}) {
  const { workspaceId, formId } = use(params)
  const { state, dispatch, getWorkspace, getForm } = useFormBuilder()
  const workspace = getWorkspace(workspaceId)
  const form = getForm(workspaceId, formId)

  if (!workspace || !form) return notFound()

  const sortedSections = [...form.sections].sort((a, b) => a.order - b.order)
  const totalQuestions = form.sections.reduce((acc, s) => acc + s.questions.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbs={[
          { label: "Espacios", href: "/" },
          { label: workspace.name, href: `/workspaces/${workspaceId}` },
          { label: form.name },
        ]}
      />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Form Header */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-1">
              <InlineEdit
                value={form.name}
                onSave={(name) => dispatch({ type: "UPDATE_FORM", payload: { workspaceId, formId, name, description: form.description } })}
                className="text-xl font-semibold"
                as="h1"
              />
              <InlineEdit
                value={form.description || ""}
                onSave={(desc) => dispatch({ type: "UPDATE_FORM", payload: { workspaceId, formId, name: form.name, description: desc || undefined } })}
                className="text-sm text-muted-foreground"
                placeholder="Agregar descripcion..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className="cursor-pointer select-none"
                variant={form.status === "published" ? "default" : "secondary"}
                onClick={() => {
                  dispatch({ type: "TOGGLE_FORM_STATUS", payload: { workspaceId, formId } })
                  toast.success(form.status === "draft" ? "Formulario publicado" : "Formulario vuelto a borrador")
                }}
              >
                {form.status === "published" ? "Publicado" : "Borrador"}
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/workspaces/${workspaceId}/forms/${formId}/preview`}>
                  <Eye className="mr-1.5 h-4 w-4" />
                  Vista Previa
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{form.sections.length} {form.sections.length === 1 ? "seccion" : "secciones"}</span>
            <span className="text-border">|</span>
            <span>{totalQuestions} {totalQuestions === 1 ? "pregunta" : "preguntas"}</span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sortedSections.map((section, idx) => (
            <SectionEditor
              key={section.id}
              section={section}
              domains={state.domains}
              isFirst={idx === 0}
              isLast={idx === sortedSections.length - 1}
              onUpdateTitle={(title) =>
                dispatch({ type: "UPDATE_SECTION", payload: { workspaceId, formId, sectionId: section.id, title, description: section.description } })
              }
              onUpdateDescription={(description) =>
                dispatch({ type: "UPDATE_SECTION", payload: { workspaceId, formId, sectionId: section.id, title: section.title, description } })
              }
              onDelete={() => {
                dispatch({ type: "DELETE_SECTION", payload: { workspaceId, formId, sectionId: section.id } })
                toast.success("Seccion eliminada")
              }}
              onMove={(direction) =>
                dispatch({ type: "MOVE_SECTION", payload: { workspaceId, formId, sectionId: section.id, direction } })
              }
              onAddQuestion={(type: QuestionType, label: string) =>
                dispatch({ type: "ADD_QUESTION", payload: { workspaceId, formId, sectionId: section.id, type, label } })
              }
              onUpdateQuestion={(questionId, updates) =>
                dispatch({ type: "UPDATE_QUESTION", payload: { workspaceId, formId, sectionId: section.id, questionId, updates } })
              }
              onDeleteQuestion={(questionId) => {
                dispatch({ type: "DELETE_QUESTION", payload: { workspaceId, formId, sectionId: section.id, questionId } })
                toast.success("Pregunta eliminada")
              }}
              onMoveQuestion={(questionId, direction) =>
                dispatch({ type: "MOVE_QUESTION", payload: { workspaceId, formId, sectionId: section.id, questionId, direction } })
              }
              onDuplicateQuestion={(questionId) => {
                dispatch({ type: "DUPLICATE_QUESTION", payload: { workspaceId, formId, sectionId: section.id, questionId } })
                toast.success("Pregunta duplicada")
              }}
            />
          ))}
        </div>

        {/* Add Section Button */}
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full border-dashed py-6 text-muted-foreground"
            onClick={() => {
              dispatch({ type: "ADD_SECTION", payload: { workspaceId, formId, title: "Nueva Seccion" } })
              toast.success("Seccion agregada")
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Agregar Seccion
          </Button>
        </div>
      </main>
    </div>
  )
}
