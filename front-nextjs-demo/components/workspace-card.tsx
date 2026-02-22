"use client"

import Link from "next/link"
import { Users, ClipboardCheck, Headphones, FileText, MoreHorizontal, Pencil, Trash2, FolderOpen } from "lucide-react"
import type { Workspace } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  ClipboardCheck,
  Headphones,
  FileText,
  FolderOpen,
}

interface WorkspaceCardProps {
  workspace: Workspace
  onEdit: () => void
  onDelete: () => void
}

export function WorkspaceCard({ workspace, onEdit, onDelete }: WorkspaceCardProps) {
  const IconComponent = iconMap[workspace.icon] || FolderOpen
  const publishedCount = workspace.forms.filter((f) => f.status === "published").length
  const totalForms = workspace.forms.length

  return (
    <Link href={`/workspaces/${workspace.id}`} className="group block">
      <Card className="relative h-full transition-all duration-200 hover:shadow-md hover:border-border/80 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-lg" style={{ backgroundColor: workspace.color }} />
        <CardHeader className="flex flex-row items-start justify-between gap-2 pt-5">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${workspace.color}15`, color: workspace.color }}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base leading-tight">{workspace.name}</CardTitle>
              {workspace.description && (
                <CardDescription className="line-clamp-2 text-sm">{workspace.description}</CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); onEdit() }}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.preventDefault(); onDelete() }}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {totalForms} {totalForms === 1 ? "formulario" : "formularios"}
            </Badge>
            {publishedCount > 0 && (
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 font-normal text-emerald-700">
                {publishedCount} {publishedCount === 1 ? "publicado" : "publicados"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
