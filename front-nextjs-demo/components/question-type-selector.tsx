"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QuestionType } from "@/lib/types"
import { questionTypeConfig, QuestionTypeIcon } from "./question-type-icon"

const allTypes: QuestionType[] = ["text", "number", "date", "boolean", "select", "multi-select", "file", "rating", "scale", "matrix"]

interface QuestionTypeSelectorProps {
  value: QuestionType
  onChange: (value: QuestionType) => void
}

export function QuestionTypeSelector({ value, onChange }: QuestionTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as QuestionType)}>
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allTypes.map((type) => (
          <SelectItem key={type} value={type}>
            <div className="flex items-center gap-2">
              <QuestionTypeIcon type={type} className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{questionTypeConfig[type].label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
