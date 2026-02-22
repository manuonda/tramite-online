"use client"

import { useState } from "react"
import { useFormBuilder } from "@/lib/form-builder-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Database, X, Save } from "lucide-react"
import { toast } from "sonner"
import type { Domain } from "@/lib/types"

export default function DomainsPage() {
  const { state, dispatch } = useFormBuilder()
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(state.domains[0]?.id || null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [domainName, setDomainName] = useState("")
  const [domainDesc, setDomainDesc] = useState("")

  // Inline value editing
  const [editingValueId, setEditingValueId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editValue, setEditValue] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [newValue, setNewValue] = useState("")

  const selectedDomain = state.domains.find((d) => d.id === selectedDomainId)

  const openCreateDialog = () => {
    setEditingDomain(null)
    setDomainName("")
    setDomainDesc("")
    setDialogOpen(true)
  }

  const openEditDialog = (domain: Domain) => {
    setEditingDomain(domain)
    setDomainName(domain.name)
    setDomainDesc(domain.description || "")
    setDialogOpen(true)
  }

  const handleSaveDomain = () => {
    if (!domainName.trim()) return
    if (editingDomain) {
      dispatch({ type: "UPDATE_DOMAIN", payload: { id: editingDomain.id, name: domainName.trim(), description: domainDesc.trim() || undefined } })
      toast.success("Dominio actualizado")
    } else {
      dispatch({ type: "ADD_DOMAIN", payload: { name: domainName.trim(), description: domainDesc.trim() || undefined } })
      toast.success("Dominio creado")
    }
    setDialogOpen(false)
  }

  const handleAddValue = () => {
    if (!selectedDomainId || !newLabel.trim() || !newValue.trim()) return
    dispatch({ type: "ADD_DOMAIN_VALUE", payload: { domainId: selectedDomainId, label: newLabel.trim(), value: newValue.trim() } })
    setNewLabel("")
    setNewValue("")
    toast.success("Valor agregado")
  }

  const handleSaveValueEdit = (valueId: string) => {
    if (!selectedDomainId || !editLabel.trim() || !editValue.trim()) return
    dispatch({ type: "UPDATE_DOMAIN_VALUE", payload: { domainId: selectedDomainId, valueId, label: editLabel.trim(), value: editValue.trim() } })
    setEditingValueId(null)
    toast.success("Valor actualizado")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader breadcrumbs={[{ label: "Espacios", href: "/" }, { label: "Dominios" }]} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dominios</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestiona los conjuntos de valores reutilizables para tus formularios
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo Dominio
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Domain List */}
          <div className="space-y-2">
            {state.domains.map((domain) => (
              <Card
                key={domain.id}
                className={`cursor-pointer transition-all hover:shadow-sm ${selectedDomainId === domain.id ? "border-primary ring-1 ring-primary/20" : ""}`}
                onClick={() => setSelectedDomainId(domain.id)}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{domain.name}</p>
                      <p className="text-xs text-muted-foreground">{domain.values.length} valores</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDialog(domain) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: "DELETE_DOMAIN", payload: domain.id })
                        if (selectedDomainId === domain.id) setSelectedDomainId(null)
                        toast.success("Dominio eliminado")
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {state.domains.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-10 text-center">
                <p className="text-sm text-muted-foreground">No hay dominios creados</p>
              </div>
            )}
          </div>

          {/* Domain Values */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {selectedDomain ? `Valores de "${selectedDomain.name}"` : "Selecciona un dominio"}
              </CardTitle>
              {selectedDomain && (
                <Badge variant="secondary">{selectedDomain.values.length} valores</Badge>
              )}
            </CardHeader>
            <CardContent>
              {selectedDomain ? (
                <div className="space-y-4">
                  {selectedDomain.description && (
                    <p className="text-sm text-muted-foreground">{selectedDomain.description}</p>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Etiqueta</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDomain.values.map((val) => (
                        <TableRow key={val.id}>
                          {editingValueId === val.id ? (
                            <>
                              <TableCell>
                                <Input
                                  value={editLabel}
                                  onChange={(e) => setEditLabel(e.target.value)}
                                  className="h-8 text-sm"
                                  autoFocus
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSaveValueEdit(val.id)}>
                                    <Save className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingValueId(null)}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="text-sm">{val.label}</TableCell>
                              <TableCell>
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{val.value}</code>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      setEditingValueId(val.id)
                                      setEditLabel(val.label)
                                      setEditValue(val.value)
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      dispatch({ type: "DELETE_DOMAIN_VALUE", payload: { domainId: selectedDomain.id, valueId: val.id } })
                                      toast.success("Valor eliminado")
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                      {/* Add new value row */}
                      <TableRow>
                        <TableCell>
                          <Input
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="Nueva etiqueta..."
                            className="h-8 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            placeholder="Nuevo valor..."
                            className="h-8 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddValue} disabled={!newLabel.trim() || !newValue.trim()}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                  Selecciona un dominio de la lista para ver y editar sus valores
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create/Edit Domain Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDomain ? "Editar Dominio" : "Nuevo Dominio"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={domainName} onChange={(e) => setDomainName(e.target.value)} placeholder="Ej: Nivel de Satisfaccion" />
            </div>
            <div className="space-y-2">
              <Label>Descripcion (opcional)</Label>
              <Textarea value={domainDesc} onChange={(e) => setDomainDesc(e.target.value)} placeholder="Describe el uso del dominio..." rows={2} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveDomain} disabled={!domainName.trim()}>
              {editingDomain ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
