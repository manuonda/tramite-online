"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import type { Question, QuestionConfig, Domain } from "@/lib/types"

interface QuestionConfigPanelProps {
  question: Question
  domains: Domain[]
  onUpdateConfig: (config: QuestionConfig) => void
  onUpdateDomain: (domainId: string | undefined) => void
}

export function QuestionConfigPanel({ question, domains, onUpdateConfig, onUpdateDomain }: QuestionConfigPanelProps) {
  const { type, config, domainId } = question

  if (type === "text") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Placeholder</Label>
          <Input
            value={config.placeholder || ""}
            onChange={(e) => onUpdateConfig({ ...config, placeholder: e.target.value })}
            placeholder="Texto de ayuda..."
            className="h-8 text-sm"
          />
        </div>
      </div>
    )
  }

  if (type === "number") {
    return (
      <div className="flex items-center gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Min</Label>
          <Input
            type="number"
            value={config.min ?? ""}
            onChange={(e) => onUpdateConfig({ ...config, min: e.target.value ? Number(e.target.value) : undefined })}
            className="h-8 w-24 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Max</Label>
          <Input
            type="number"
            value={config.max ?? ""}
            onChange={(e) => onUpdateConfig({ ...config, max: e.target.value ? Number(e.target.value) : undefined })}
            className="h-8 w-24 text-sm"
          />
        </div>
      </div>
    )
  }

  if (type === "rating") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Numero de estrellas</Label>
        <Select value={String(config.stars || 5)} onValueChange={(v) => onUpdateConfig({ ...config, stars: Number(v) })}>
          <SelectTrigger className="h-8 w-24 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[3, 4, 5, 7, 10].map((n) => (
              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (type === "scale") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Valor min</Label>
            <Input
              type="number"
              value={config.scaleMin ?? 1}
              onChange={(e) => onUpdateConfig({ ...config, scaleMin: Number(e.target.value) })}
              className="h-8 w-20 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Valor max</Label>
            <Input
              type="number"
              value={config.scaleMax ?? 10}
              onChange={(e) => onUpdateConfig({ ...config, scaleMax: Number(e.target.value) })}
              className="h-8 w-20 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Etiqueta min</Label>
            <Input
              value={config.scaleMinLabel || ""}
              onChange={(e) => onUpdateConfig({ ...config, scaleMinLabel: e.target.value })}
              className="h-8 text-sm"
              placeholder="Ej: Deficiente"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Etiqueta max</Label>
            <Input
              value={config.scaleMaxLabel || ""}
              onChange={(e) => onUpdateConfig({ ...config, scaleMaxLabel: e.target.value })}
              className="h-8 text-sm"
              placeholder="Ej: Excelente"
            />
          </div>
        </div>
      </div>
    )
  }

  if (type === "file") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Tipos aceptados</Label>
        <Input
          value={config.accept || ""}
          onChange={(e) => onUpdateConfig({ ...config, accept: e.target.value })}
          className="h-8 text-sm"
          placeholder="Ej: image/*, .pdf"
        />
      </div>
    )
  }

  if (type === "select" || type === "multi-select") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Dominio de valores</Label>
        <Select value={domainId || "none"} onValueChange={(v) => onUpdateDomain(v === "none" ? undefined : v)}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Seleccionar dominio..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin dominio</SelectItem>
            {domains.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name} ({d.values.length} valores)</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (type === "matrix") {
    const rows = config.matrixRows || []
    const columns = config.matrixColumns || []

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Filas</Label>
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={row}
                onChange={(e) => {
                  const newRows = [...rows]
                  newRows[i] = e.target.value
                  onUpdateConfig({ ...config, matrixRows: newRows })
                }}
                className="h-8 text-sm"
                placeholder={`Fila ${i + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onUpdateConfig({ ...config, matrixRows: rows.filter((_, j) => j !== i) })}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onUpdateConfig({ ...config, matrixRows: [...rows, ""] })}
          >
            <Plus className="mr-1 h-3 w-3" />
            Agregar fila
          </Button>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Columnas</Label>
          {columns.map((col, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={col}
                onChange={(e) => {
                  const newCols = [...columns]
                  newCols[i] = e.target.value
                  onUpdateConfig({ ...config, matrixColumns: newCols })
                }}
                className="h-8 text-sm"
                placeholder={`Columna ${i + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onUpdateConfig({ ...config, matrixColumns: columns.filter((_, j) => j !== i) })}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onUpdateConfig({ ...config, matrixColumns: [...columns, ""] })}
          >
            <Plus className="mr-1 h-3 w-3" />
            Agregar columna
          </Button>
        </div>
      </div>
    )
  }

  return null
}
