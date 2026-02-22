"use client"

import React, { createContext, useContext, useReducer, type ReactNode } from "react"
import type { Workspace, Form, Section, Question, Domain, DomainValue, FormStatus, QuestionType, QuestionConfig } from "./types"
import { initialWorkspaces, initialDomains } from "./mock-data"

interface State {
  workspaces: Workspace[]
  domains: Domain[]
}

type Action =
  | { type: "ADD_WORKSPACE"; payload: { name: string; description?: string; color: string; icon: string } }
  | { type: "UPDATE_WORKSPACE"; payload: { id: string; name: string; description?: string; color: string; icon: string } }
  | { type: "DELETE_WORKSPACE"; payload: string }
  | { type: "ADD_FORM"; payload: { workspaceId: string; name: string; description?: string } }
  | { type: "UPDATE_FORM"; payload: { workspaceId: string; formId: string; name: string; description?: string } }
  | { type: "TOGGLE_FORM_STATUS"; payload: { workspaceId: string; formId: string } }
  | { type: "DELETE_FORM"; payload: { workspaceId: string; formId: string } }
  | { type: "DUPLICATE_FORM"; payload: { workspaceId: string; formId: string } }
  | { type: "ADD_SECTION"; payload: { workspaceId: string; formId: string; title: string; description?: string } }
  | { type: "UPDATE_SECTION"; payload: { workspaceId: string; formId: string; sectionId: string; title: string; description?: string } }
  | { type: "DELETE_SECTION"; payload: { workspaceId: string; formId: string; sectionId: string } }
  | { type: "MOVE_SECTION"; payload: { workspaceId: string; formId: string; sectionId: string; direction: "up" | "down" } }
  | { type: "ADD_QUESTION"; payload: { workspaceId: string; formId: string; sectionId: string; type: QuestionType; label: string } }
  | { type: "UPDATE_QUESTION"; payload: { workspaceId: string; formId: string; sectionId: string; questionId: string; updates: Partial<Omit<Question, "id" | "sectionId">> } }
  | { type: "DELETE_QUESTION"; payload: { workspaceId: string; formId: string; sectionId: string; questionId: string } }
  | { type: "MOVE_QUESTION"; payload: { workspaceId: string; formId: string; sectionId: string; questionId: string; direction: "up" | "down" } }
  | { type: "DUPLICATE_QUESTION"; payload: { workspaceId: string; formId: string; sectionId: string; questionId: string } }
  | { type: "ADD_DOMAIN"; payload: { name: string; description?: string } }
  | { type: "UPDATE_DOMAIN"; payload: { id: string; name: string; description?: string } }
  | { type: "DELETE_DOMAIN"; payload: string }
  | { type: "ADD_DOMAIN_VALUE"; payload: { domainId: string; label: string; value: string } }
  | { type: "UPDATE_DOMAIN_VALUE"; payload: { domainId: string; valueId: string; label: string; value: string } }
  | { type: "DELETE_DOMAIN_VALUE"; payload: { domainId: string; valueId: string } }

function generateId() {
  return crypto.randomUUID()
}

function updateFormTimestamp(form: Form): Form {
  return { ...form, updatedAt: new Date().toISOString() }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_WORKSPACE": {
      const newWorkspace: Workspace = {
        id: generateId(),
        name: action.payload.name,
        description: action.payload.description,
        color: action.payload.color,
        icon: action.payload.icon,
        forms: [],
      }
      return { ...state, workspaces: [...state.workspaces, newWorkspace] }
    }

    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.id
            ? { ...ws, name: action.payload.name, description: action.payload.description, color: action.payload.color, icon: action.payload.icon }
            : ws
        ),
      }

    case "DELETE_WORKSPACE":
      return { ...state, workspaces: state.workspaces.filter((ws) => ws.id !== action.payload) }

    case "ADD_FORM": {
      const now = new Date().toISOString()
      const newForm: Form = {
        id: generateId(),
        workspaceId: action.payload.workspaceId,
        name: action.payload.name,
        description: action.payload.description,
        status: "draft",
        sections: [],
        createdAt: now,
        updatedAt: now,
      }
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId ? { ...ws, forms: [...ws.forms, newForm] } : ws
        ),
      }
    }

    case "UPDATE_FORM":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? {
                ...ws,
                forms: ws.forms.map((f) =>
                  f.id === action.payload.formId
                    ? updateFormTimestamp({ ...f, name: action.payload.name, description: action.payload.description })
                    : f
                ),
              }
            : ws
        ),
      }

    case "TOGGLE_FORM_STATUS":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? {
                ...ws,
                forms: ws.forms.map((f) =>
                  f.id === action.payload.formId
                    ? updateFormTimestamp({ ...f, status: (f.status === "draft" ? "published" : "draft") as FormStatus })
                    : f
                ),
              }
            : ws
        ),
      }

    case "DELETE_FORM":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? { ...ws, forms: ws.forms.filter((f) => f.id !== action.payload.formId) }
            : ws
        ),
      }

    case "DUPLICATE_FORM": {
      const now = new Date().toISOString()
      return {
        ...state,
        workspaces: state.workspaces.map((ws) => {
          if (ws.id !== action.payload.workspaceId) return ws
          const original = ws.forms.find((f) => f.id === action.payload.formId)
          if (!original) return ws
          const duplicated: Form = {
            ...JSON.parse(JSON.stringify(original)),
            id: generateId(),
            name: `${original.name} (copia)`,
            status: "draft" as FormStatus,
            createdAt: now,
            updatedAt: now,
          }
          // Regenerate IDs for sections and questions
          duplicated.sections = duplicated.sections.map((sec: Section) => ({
            ...sec,
            id: generateId(),
            formId: duplicated.id,
            questions: sec.questions.map((q: Question) => ({
              ...q,
              id: generateId(),
              sectionId: sec.id,
            })),
          }))
          return { ...ws, forms: [...ws.forms, duplicated] }
        }),
      }
    }

    case "ADD_SECTION": {
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? {
                ...ws,
                forms: ws.forms.map((f) => {
                  if (f.id !== action.payload.formId) return f
                  const newSection: Section = {
                    id: generateId(),
                    formId: f.id,
                    title: action.payload.title,
                    description: action.payload.description,
                    order: f.sections.length,
                    questions: [],
                  }
                  return updateFormTimestamp({ ...f, sections: [...f.sections, newSection] })
                }),
              }
            : ws
        ),
      }
    }

    case "UPDATE_SECTION":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? {
                ...ws,
                forms: ws.forms.map((f) =>
                  f.id === action.payload.formId
                    ? updateFormTimestamp({
                        ...f,
                        sections: f.sections.map((s) =>
                          s.id === action.payload.sectionId
                            ? { ...s, title: action.payload.title, description: action.payload.description }
                            : s
                        ),
                      })
                    : f
                ),
              }
            : ws
        ),
      }

    case "DELETE_SECTION":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? {
                ...ws,
                forms: ws.forms.map((f) =>
                  f.id === action.payload.formId
                    ? updateFormTimestamp({
                        ...f,
                        sections: f.sections
                          .filter((s) => s.id !== action.payload.sectionId)
                          .map((s, i) => ({ ...s, order: i })),
                      })
                    : f
                ),
              }
            : ws
        ),
      }

    case "MOVE_SECTION": {
      return {
        ...state,
        workspaces: state.workspaces.map((ws) => {
          if (ws.id !== action.payload.workspaceId) return ws
          return {
            ...ws,
            forms: ws.forms.map((f) => {
              if (f.id !== action.payload.formId) return f
              const sections = [...f.sections].sort((a, b) => a.order - b.order)
              const idx = sections.findIndex((s) => s.id === action.payload.sectionId)
              if (idx === -1) return f
              const newIdx = action.payload.direction === "up" ? idx - 1 : idx + 1
              if (newIdx < 0 || newIdx >= sections.length) return f
              ;[sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]]
              return updateFormTimestamp({ ...f, sections: sections.map((s, i) => ({ ...s, order: i })) })
            }),
          }
        }),
      }
    }

    case "ADD_QUESTION": {
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? {
                ...ws,
                forms: ws.forms.map((f) =>
                  f.id === action.payload.formId
                    ? updateFormTimestamp({
                        ...f,
                        sections: f.sections.map((s) => {
                          if (s.id !== action.payload.sectionId) return s
                          const newQuestion: Question = {
                            id: generateId(),
                            sectionId: s.id,
                            type: action.payload.type,
                            label: action.payload.label,
                            required: false,
                            order: s.questions.length,
                            config: action.payload.type === "rating" ? { stars: 5 } : action.payload.type === "scale" ? { scaleMin: 1, scaleMax: 10, scaleMinLabel: "Minimo", scaleMaxLabel: "Maximo" } : {},
                          }
                          return { ...s, questions: [...s.questions, newQuestion] }
                        }),
                      })
                    : f
                ),
              }
            : ws
        ),
      }
    }

    case "UPDATE_QUESTION":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? {
                ...ws,
                forms: ws.forms.map((f) =>
                  f.id === action.payload.formId
                    ? updateFormTimestamp({
                        ...f,
                        sections: f.sections.map((s) =>
                          s.id === action.payload.sectionId
                            ? {
                                ...s,
                                questions: s.questions.map((q) =>
                                  q.id === action.payload.questionId ? { ...q, ...action.payload.updates } : q
                                ),
                              }
                            : s
                        ),
                      })
                    : f
                ),
              }
            : ws
        ),
      }

    case "DELETE_QUESTION":
      return {
        ...state,
        workspaces: state.workspaces.map((ws) =>
          ws.id === action.payload.workspaceId
            ? {
                ...ws,
                forms: ws.forms.map((f) =>
                  f.id === action.payload.formId
                    ? updateFormTimestamp({
                        ...f,
                        sections: f.sections.map((s) =>
                          s.id === action.payload.sectionId
                            ? {
                                ...s,
                                questions: s.questions
                                  .filter((q) => q.id !== action.payload.questionId)
                                  .map((q, i) => ({ ...q, order: i })),
                              }
                            : s
                        ),
                      })
                    : f
                ),
              }
            : ws
        ),
      }

    case "MOVE_QUESTION": {
      return {
        ...state,
        workspaces: state.workspaces.map((ws) => {
          if (ws.id !== action.payload.workspaceId) return ws
          return {
            ...ws,
            forms: ws.forms.map((f) => {
              if (f.id !== action.payload.formId) return f
              return updateFormTimestamp({
                ...f,
                sections: f.sections.map((s) => {
                  if (s.id !== action.payload.sectionId) return s
                  const questions = [...s.questions].sort((a, b) => a.order - b.order)
                  const idx = questions.findIndex((q) => q.id === action.payload.questionId)
                  if (idx === -1) return s
                  const newIdx = action.payload.direction === "up" ? idx - 1 : idx + 1
                  if (newIdx < 0 || newIdx >= questions.length) return s
                  ;[questions[idx], questions[newIdx]] = [questions[newIdx], questions[idx]]
                  return { ...s, questions: questions.map((q, i) => ({ ...q, order: i })) }
                }),
              })
            }),
          }
        }),
      }
    }

    case "DUPLICATE_QUESTION": {
      return {
        ...state,
        workspaces: state.workspaces.map((ws) => {
          if (ws.id !== action.payload.workspaceId) return ws
          return {
            ...ws,
            forms: ws.forms.map((f) => {
              if (f.id !== action.payload.formId) return f
              return updateFormTimestamp({
                ...f,
                sections: f.sections.map((s) => {
                  if (s.id !== action.payload.sectionId) return s
                  const original = s.questions.find((q) => q.id === action.payload.questionId)
                  if (!original) return s
                  const dup: Question = {
                    ...JSON.parse(JSON.stringify(original)),
                    id: generateId(),
                    label: `${original.label} (copia)`,
                    order: s.questions.length,
                  }
                  return { ...s, questions: [...s.questions, dup] }
                }),
              })
            }),
          }
        }),
      }
    }

    case "ADD_DOMAIN": {
      const newDomain: Domain = {
        id: generateId(),
        name: action.payload.name,
        description: action.payload.description,
        values: [],
      }
      return { ...state, domains: [...state.domains, newDomain] }
    }

    case "UPDATE_DOMAIN":
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.id === action.payload.id ? { ...d, name: action.payload.name, description: action.payload.description } : d
        ),
      }

    case "DELETE_DOMAIN":
      return { ...state, domains: state.domains.filter((d) => d.id !== action.payload) }

    case "ADD_DOMAIN_VALUE": {
      const newValue: DomainValue = {
        id: generateId(),
        domainId: action.payload.domainId,
        label: action.payload.label,
        value: action.payload.value,
      }
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.id === action.payload.domainId ? { ...d, values: [...d.values, newValue] } : d
        ),
      }
    }

    case "UPDATE_DOMAIN_VALUE":
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.id === action.payload.domainId
            ? {
                ...d,
                values: d.values.map((v) =>
                  v.id === action.payload.valueId
                    ? { ...v, label: action.payload.label, value: action.payload.value }
                    : v
                ),
              }
            : d
        ),
      }

    case "DELETE_DOMAIN_VALUE":
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.id === action.payload.domainId
            ? { ...d, values: d.values.filter((v) => v.id !== action.payload.valueId) }
            : d
        ),
      }

    default:
      return state
  }
}

interface FormBuilderContextType {
  state: State
  dispatch: React.Dispatch<Action>
  getWorkspace: (id: string) => Workspace | undefined
  getForm: (workspaceId: string, formId: string) => Form | undefined
  getDomain: (id: string) => Domain | undefined
}

const FormBuilderContext = createContext<FormBuilderContextType | null>(null)

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    workspaces: initialWorkspaces,
    domains: initialDomains,
  })

  const getWorkspace = (id: string) => state.workspaces.find((ws) => ws.id === id)
  const getForm = (workspaceId: string, formId: string) => {
    const ws = state.workspaces.find((w) => w.id === workspaceId)
    return ws?.forms.find((f) => f.id === formId)
  }
  const getDomain = (id: string) => state.domains.find((d) => d.id === id)

  return (
    <FormBuilderContext.Provider value={{ state, dispatch, getWorkspace, getForm, getDomain }}>
      {children}
    </FormBuilderContext.Provider>
  )
}

export function useFormBuilder() {
  const ctx = useContext(FormBuilderContext)
  if (!ctx) throw new Error("useFormBuilder must be used within FormBuilderProvider")
  return ctx
}
