"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InlineEditProps {
  value: string
  onSave: (value: string) => void
  className?: string
  inputClassName?: string
  placeholder?: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
}

export function InlineEdit({
  value,
  onSave,
  className,
  inputClassName,
  placeholder = "Sin titulo",
  as: Tag = "span",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setText(value)
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleSave = () => {
    const trimmed = text.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setText(value)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave()
          if (e.key === "Escape") {
            setText(value)
            setEditing(false)
          }
        }}
        className={cn("h-auto border-primary/30 bg-transparent px-1 py-0.5", inputClassName)}
        placeholder={placeholder}
      />
    )
  }

  return (
    <Tag
      className={cn("cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-accent", className)}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setEditing(true)
      }}
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
    </Tag>
  )
}
