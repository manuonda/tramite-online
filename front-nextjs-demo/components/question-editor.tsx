"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Copy, Trash2, GripVertical, ChevronRight } from "lucide-react"
import type { Question, Domain, QuestionType, QuestionConfig } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { QuestionTypeIcon, questionTypeConfig } from "./question-type-icon"
import { QuestionTypeSelector } from "./question-type-selector"
import { QuestionConfigPanel } from "./question-config-panel"

interface QuestionEditorProps {
  question: Question
  domains: Domain[]
  isFirst: boolean
  isLast: boolean
  onUpdate: (updates: Partial<Omit<Question, "id" | "sectionId">>) => void
  onDelete: () => void
  onMove: (direction: "up" | "down") => void
  onDuplicate: () => void
}

export function QuestionEditor({
  question,
  domains,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
}: QuestionEditorProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="rounded-lg border border-border bg-card transition-shadow hover:shadow-sm">
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center gap-2 px-3 py-2.5">
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
              <QuestionTypeIcon type={question.type} className="h-3.5 w-3.5 text-secondary-foreground" />
            </div>
            <span className="flex-1 truncate text-sm font-medium text-foreground">
              {question.label || "Sin titulo"}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {questionTypeConfig[question.type].label}
            </span>
            {question.required && (
              <span className="text-xs font-medium text-primary">Requerido</span>
            )}
            <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border px-3 py-3 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Etiqueta</Label>
                <Input
                  value={question.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="Escribe la pregunta..."
                  className="h-9"
                />
              </div>
              <QuestionTypeSelector
                value={question.type}
                onChange={(type: QuestionType) => onUpdate({ type, config: type === "rating" ? { stars: 5 } : type === "scale" ? { scaleMin: 1, scaleMax: 10 } : {} })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Descripcion (opcional)</Label>
              <Input
                value={question.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value || undefined })}
                placeholder="Instrucciones adicionales..."
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`req-${question.id}`}
                checked={question.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
              <Label htmlFor={`req-${question.id}`} className="text-sm cursor-pointer">Requerido</Label>
            </div>
            <QuestionConfigPanel
              question={question}
              domains={domains}
              onUpdateConfig={(config: QuestionConfig) => onUpdate({ config })}
              onUpdateDomain={(domainId: string | undefined) => onUpdate({ domainId })}
            />
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isFirst} onClick={() => onMove("up")}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isLast} onClick={() => onMove("down")}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onDuplicate}>
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  Duplicar
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={onDelete}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
