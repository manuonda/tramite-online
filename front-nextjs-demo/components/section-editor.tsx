"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Trash2, Plus, ChevronRight, Layers } from "lucide-react"
import type { Section, Domain, QuestionType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { InlineEdit } from "./inline-edit"
import { QuestionEditor } from "./question-editor"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { questionTypeConfig } from "./question-type-icon"

const questionTypes: QuestionType[] = ["text", "number", "date", "boolean", "select", "multi-select", "file", "rating", "scale", "matrix"]

interface SectionEditorProps {
  section: Section
  domains: Domain[]
  isFirst: boolean
  isLast: boolean
  onUpdateTitle: (title: string) => void
  onUpdateDescription: (description?: string) => void
  onDelete: () => void
  onMove: (direction: "up" | "down") => void
  onAddQuestion: (type: QuestionType, label: string) => void
  onUpdateQuestion: (questionId: string, updates: Record<string, unknown>) => void
  onDeleteQuestion: (questionId: string) => void
  onMoveQuestion: (questionId: string, direction: "up" | "down") => void
  onDuplicateQuestion: (questionId: string) => void
}

export function SectionEditor({
  section,
  domains,
  isFirst,
  isLast,
  onUpdateTitle,
  onUpdateDescription,
  onDelete,
  onMove,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  onDuplicateQuestion,
}: SectionEditorProps) {
  const [open, setOpen] = useState(true)
  const sortedQuestions = [...section.questions].sort((a, b) => a.order - b.order)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
            <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <Layers className="h-4 w-4 shrink-0 text-primary" />
        <div className="flex-1">
          <InlineEdit
            value={section.title}
            onSave={onUpdateTitle}
            className="text-sm font-semibold"
            placeholder="Nombre de la seccion"
          />
        </div>
        <Badge variant="secondary" className="shrink-0 font-normal">
          {section.questions.length} {section.questions.length === 1 ? "pregunta" : "preguntas"}
        </Badge>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isFirst} onClick={() => onMove("up")}>
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isLast} onClick={() => onMove("down")}>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <div className="border-t border-border px-4 py-3">
          {section.description !== undefined && (
            <div className="mb-3">
              <InlineEdit
                value={section.description || ""}
                onSave={(v) => onUpdateDescription(v || undefined)}
                className="text-xs text-muted-foreground"
                placeholder="Descripcion de la seccion (opcional)"
              />
            </div>
          )}
          <div className="space-y-2">
            {sortedQuestions.map((q, idx) => (
              <QuestionEditor
                key={q.id}
                question={q}
                domains={domains}
                isFirst={idx === 0}
                isLast={idx === sortedQuestions.length - 1}
                onUpdate={(updates) => onUpdateQuestion(q.id, updates)}
                onDelete={() => onDeleteQuestion(q.id)}
                onMove={(dir) => onMoveQuestion(q.id, dir)}
                onDuplicate={() => onDuplicateQuestion(q.id)}
              />
            ))}
          </div>
          <div className="mt-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-full border-dashed text-muted-foreground">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Agregar Pregunta
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {questionTypes.map((type) => {
                  const config = questionTypeConfig[type]
                  const Icon = config.icon
                  return (
                    <DropdownMenuItem key={type} onClick={() => onAddQuestion(type, "Nueva pregunta")}>
                      <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">{config.label}</div>
                        <div className="text-xs text-muted-foreground">{config.description}</div>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
