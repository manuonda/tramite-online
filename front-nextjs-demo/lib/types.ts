export type QuestionType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "multi-select"
  | "file"
  | "rating"
  | "scale"
  | "matrix"

export interface QuestionConfig {
  min?: number
  max?: number
  step?: number
  stars?: number
  scaleMin?: number
  scaleMax?: number
  scaleMinLabel?: string
  scaleMaxLabel?: string
  matrixRows?: string[]
  matrixColumns?: string[]
  accept?: string
  placeholder?: string
}

export interface DomainValue {
  id: string
  domainId: string
  label: string
  value: string
}

export interface Domain {
  id: string
  name: string
  description?: string
  values: DomainValue[]
}

export interface Question {
  id: string
  sectionId: string
  type: QuestionType
  label: string
  description?: string
  required: boolean
  order: number
  domainId?: string
  config: QuestionConfig
}

export interface Section {
  id: string
  formId: string
  title: string
  description?: string
  order: number
  questions: Question[]
}

export type FormStatus = "draft" | "published"

export interface Form {
  id: string
  workspaceId: string
  name: string
  description?: string
  status: FormStatus
  sections: Section[]
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  forms: Form[]
}
