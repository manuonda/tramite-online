"use client"

import { useState } from "react"
import type { Question, Domain } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarDays, Upload, Star } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface QuestionRendererProps {
  question: Question
  domain?: Domain
}

export function QuestionRenderer({ question, domain }: QuestionRendererProps) {
  const { type, config } = question

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium">
          {question.label}
          {question.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {question.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{question.description}</p>
        )}
      </div>
      <QuestionInput type={type} config={config} domain={domain} questionId={question.id} />
    </div>
  )
}

function QuestionInput({
  type,
  config,
  domain,
  questionId,
}: {
  type: Question["type"]
  config: Question["config"]
  domain?: Domain
  questionId: string
}) {
  const [date, setDate] = useState<Date | undefined>()
  const [sliderValue, setSliderValue] = useState([config.scaleMin ?? 1])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [matrixSelections, setMatrixSelections] = useState<Record<string, string>>({})

  switch (type) {
    case "text":
      return <Input placeholder={config.placeholder || "Escribe tu respuesta..."} />

    case "number":
      return (
        <Input
          type="number"
          min={config.min}
          max={config.max}
          step={config.step}
          placeholder={`${config.min !== undefined ? `Min: ${config.min}` : ""} ${config.max !== undefined ? `Max: ${config.max}` : ""}`.trim() || "Ingresa un numero..."}
        />
      )

    case "date":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarDays className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </PopoverContent>
        </Popover>
      )

    case "boolean":
      return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <Switch id={`bool-${questionId}`} />
          <Label htmlFor={`bool-${questionId}`} className="cursor-pointer text-sm">Si</Label>
        </div>
      )

    case "select":
      return (
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una opcion..." />
          </SelectTrigger>
          <SelectContent>
            {domain?.values.map((v) => (
              <SelectItem key={v.id} value={v.value}>{v.label}</SelectItem>
            ))}
            {!domain && <SelectItem value="_empty" disabled>Sin dominio configurado</SelectItem>}
          </SelectContent>
        </Select>
      )

    case "multi-select":
      return (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
          {domain?.values.map((v) => (
            <div key={v.id} className="flex items-center gap-2">
              <Checkbox id={`ms-${questionId}-${v.id}`} />
              <Label htmlFor={`ms-${questionId}-${v.id}`} className="cursor-pointer text-sm font-normal">{v.label}</Label>
            </div>
          ))}
          {!domain && <p className="text-sm text-muted-foreground">Sin dominio configurado</p>}
        </div>
      )

    case "file":
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 text-center">
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Arrastra un archivo o haz clic para seleccionar</p>
          {config.accept && <p className="mt-1 text-xs text-muted-foreground">Tipos aceptados: {config.accept}</p>}
          <Input type="file" accept={config.accept} className="mt-3 max-w-xs" />
        </div>
      )

    case "rating": {
      const stars = config.stars || 5
      return (
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificacion">
          {Array.from({ length: stars }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} estrellas`}
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                )}
              />
            </button>
          ))}
          {rating > 0 && <span className="ml-2 text-sm text-muted-foreground">{rating}/{stars}</span>}
        </div>
      )
    }

    case "scale": {
      const min = config.scaleMin ?? 1
      const max = config.scaleMax ?? 10
      return (
        <div className="space-y-3">
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue}
            min={min}
            max={max}
            step={1}
            className="py-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{config.scaleMinLabel || min}</span>
            <span className="font-medium text-foreground text-sm">{sliderValue[0]}</span>
            <span>{config.scaleMaxLabel || max}</span>
          </div>
        </div>
      )
    }

    case "matrix": {
      const rows = config.matrixRows || []
      const columns = config.matrixColumns || []
      if (rows.length === 0 || columns.length === 0) {
        return <p className="text-sm text-muted-foreground">Matriz sin filas o columnas configuradas</p>
      }
      return (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground"></th>
                {columns.map((col, ci) => (
                  <th key={ci} className="px-3 py-2 text-center font-medium text-muted-foreground">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-t border-border">
                  <td className="px-3 py-2 font-medium text-foreground">{row}</td>
                  {columns.map((col, ci) => (
                    <td key={ci} className="px-3 py-2 text-center">
                      <RadioGroup
                        value={matrixSelections[row]}
                        onValueChange={(v) => setMatrixSelections((prev) => ({ ...prev, [row]: v }))}
                        className="flex justify-center"
                      >
                        <RadioGroupItem value={col} id={`matrix-${questionId}-${ri}-${ci}`} />
                      </RadioGroup>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    default:
      return <p className="text-sm text-muted-foreground">Tipo de pregunta no soportado</p>
  }
}
