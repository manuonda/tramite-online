"use client"

import { useState } from "react"
import { use } from "react"
import Link from "next/link"
import { useFormBuilder } from "@/lib/form-builder-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { QuestionRenderer } from "@/components/form-preview/preview-renderer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, Pencil, Send } from "lucide-react"
import { notFound } from "next/navigation"
import { toast } from "sonner"

export default function FormPreviewPage({
  params,
}: {
  params: Promise<{ workspaceId: string; formId: string }>
}) {
  const { workspaceId, formId } = use(params)
  const { getWorkspace, getForm, getDomain } = useFormBuilder()
  const workspace = getWorkspace(workspaceId)
  const form = getForm(workspaceId, formId)

  const [currentSectionIdx, setCurrentSectionIdx] = useState(0)

  if (!workspace || !form) return notFound()

  const sortedSections = [...form.sections].sort((a, b) => a.order - b.order)
  const currentSection = sortedSections[currentSectionIdx]
  const isFirst = currentSectionIdx === 0
  const isLast = currentSectionIdx === sortedSections.length - 1
  const sortedQuestions = currentSection ? [...currentSection.questions].sort((a, b) => a.order - b.order) : []

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        breadcrumbs={[
          { label: "Espacios", href: "/" },
          { label: workspace.name, href: `/workspaces/${workspaceId}` },
          { label: form.name, href: `/workspaces/${workspaceId}/forms/${formId}` },
          { label: "Vista Previa" },
        ]}
      />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Form Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{form.name}</h1>
          {form.description && (
            <p className="mt-2 text-sm text-muted-foreground">{form.description}</p>
          )}
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant={form.status === "published" ? "default" : "secondary"}>
              {form.status === "published" ? "Publicado" : "Borrador"}
            </Badge>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href={`/workspaces/${workspaceId}/forms/${formId}`}>
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Volver al Editor
              </Link>
            </Button>
          </div>
        </div>

        {/* Section Progress */}
        {sortedSections.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Seccion {currentSectionIdx + 1} de {sortedSections.length}</span>
              <span>{Math.round(((currentSectionIdx + 1) / sortedSections.length) * 100)}%</span>
            </div>
            <div className="flex gap-1.5">
              {sortedSections.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${idx <= currentSectionIdx ? "bg-primary" : "bg-muted"}`}
                  onClick={() => setCurrentSectionIdx(idx)}
                  aria-label={`Ir a seccion ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current Section */}
        {currentSection ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{currentSection.title}</CardTitle>
              {currentSection.description && (
                <CardDescription>{currentSection.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {sortedQuestions.map((question) => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  domain={question.domainId ? getDomain(question.domainId) : undefined}
                />
              ))}
              {sortedQuestions.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Esta seccion no tiene preguntas
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-lg font-medium text-foreground">Formulario vacio</p>
              <p className="mt-1 text-sm text-muted-foreground">Este formulario no tiene secciones</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href={`/workspaces/${workspaceId}/forms/${formId}`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Ir al Editor
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {sortedSections.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={isFirst}
              onClick={() => setCurrentSectionIdx((prev) => Math.max(0, prev - 1))}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Anterior
            </Button>
            {isLast ? (
              <Button onClick={() => toast.success("Formulario enviado correctamente (simulado)")}>
                <Send className="mr-1.5 h-4 w-4" />
                Enviar
              </Button>
            ) : (
              <Button onClick={() => setCurrentSectionIdx((prev) => Math.min(sortedSections.length - 1, prev + 1))}>
                Siguiente
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
