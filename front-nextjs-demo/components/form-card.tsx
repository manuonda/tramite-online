"use client"

import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, Copy, Eye, FileText, Calendar } from "lucide-react"
import type { Form } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface FormCardProps {
  form: Form
  workspaceId: string
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
}

export function FormCard({ form, workspaceId, onEdit, onDelete, onDuplicate }: FormCardProps) {
  const totalQuestions = form.sections.reduce((acc, s) => acc + s.questions.length, 0)

  return (
    <Card className="group relative h-full transition-all duration-200 hover:shadow-md hover:border-border/80">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base leading-tight">
                <Link href={`/workspaces/${workspaceId}/forms/${form.id}`} className="hover:underline">
                  {form.name}
                </Link>
              </CardTitle>
              <Badge
                variant={form.status === "published" ? "default" : "secondary"}
                className={form.status === "published" ? "bg-emerald-600 text-emerald-50 hover:bg-emerald-600" : ""}
              >
                {form.status === "published" ? "Publicado" : "Borrador"}
              </Badge>
            </div>
            {form.description && (
              <CardDescription className="line-clamp-2">{form.description}</CardDescription>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Opciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/workspaces/${workspaceId}/forms/${form.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/workspaces/${workspaceId}/forms/${form.id}/preview`}>
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{form.sections.length} {form.sections.length === 1 ? "seccion" : "secciones"}</span>
            <span className="text-border">|</span>
            <span>{totalQuestions} {totalQuestions === 1 ? "pregunta" : "preguntas"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(form.updatedAt), "d MMM yyyy", { locale: es })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
