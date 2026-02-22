"use client"

import {
  Type,
  Hash,
  CalendarDays,
  ToggleLeft,
  List,
  ListChecks,
  Upload,
  Star,
  SlidersHorizontal,
  Grid3X3,
} from "lucide-react"
import type { QuestionType } from "@/lib/types"

export const questionTypeConfig: Record<
  QuestionType,
  { label: string; icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  text: { label: "Texto", icon: Type, description: "Respuesta de texto libre" },
  number: { label: "Numero", icon: Hash, description: "Valor numerico" },
  date: { label: "Fecha", icon: CalendarDays, description: "Selector de fecha" },
  boolean: { label: "Si/No", icon: ToggleLeft, description: "Interruptor verdadero/falso" },
  select: { label: "Seleccion", icon: List, description: "Seleccion unica de una lista" },
  "multi-select": { label: "Multi-seleccion", icon: ListChecks, description: "Seleccion multiple" },
  file: { label: "Archivo", icon: Upload, description: "Carga de archivos" },
  rating: { label: "Calificacion", icon: Star, description: "Calificacion con estrellas" },
  scale: { label: "Escala", icon: SlidersHorizontal, description: "Escala numerica con slider" },
  matrix: { label: "Matriz", icon: Grid3X3, description: "Tabla de evaluacion" },
}

export function QuestionTypeIcon({ type, className }: { type: QuestionType; className?: string }) {
  const config = questionTypeConfig[type]
  const Icon = config.icon
  return <Icon className={className} />
}
