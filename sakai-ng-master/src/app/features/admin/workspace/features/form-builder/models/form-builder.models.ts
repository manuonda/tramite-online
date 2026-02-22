// ─── Question Types ───────────────────────────────────────────────────────────

export type QuestionType =
    | 'text'
    | 'number'
    | 'date'
    | 'boolean'
    | 'select'
    | 'multi-select'
    | 'file'
    | 'rating'
    | 'scale'
    | 'matrix';

export interface QuestionTypeConfig {
    label: string;
    description: string;
    icon: string; // PrimeNG pi class
}

export const QUESTION_TYPE_CONFIG: Record<QuestionType, QuestionTypeConfig> = {
    'text':         { label: 'Texto',              description: 'Respuesta de texto libre',       icon: 'pi pi-pen-to-square' },
    'number':       { label: 'Número',             description: 'Valor numérico',                 icon: 'pi pi-hashtag' },
    'date':         { label: 'Fecha',              description: 'Selección de fecha',             icon: 'pi pi-calendar' },
    'boolean':      { label: 'Sí / No',            description: 'Respuesta booleana',             icon: 'pi pi-check-circle' },
    'select':       { label: 'Selección simple',   description: 'Elige una opción de una lista',  icon: 'pi pi-list' },
    'multi-select': { label: 'Selección múltiple', description: 'Elige varias opciones',          icon: 'pi pi-list-check' },
    'file':         { label: 'Archivo',            description: 'Subida de archivos',             icon: 'pi pi-upload' },
    'rating':       { label: 'Calificación',       description: 'Valoración con estrellas',       icon: 'pi pi-star' },
    'scale':        { label: 'Escala lineal',      description: 'Escala numérica continua',       icon: 'pi pi-sliders-h' },
    'matrix':       { label: 'Matriz',             description: 'Tabla de filas y columnas',      icon: 'pi pi-table' },
};

// ─── Question Config ──────────────────────────────────────────────────────────

export interface QuestionConfig {
    min?: number;
    max?: number;
    step?: number;
    stars?: number;
    scaleMin?: number;
    scaleMax?: number;
    scaleMinLabel?: string;
    scaleMaxLabel?: string;
    matrixRows?: string[];
    matrixColumns?: string[];
    accept?: string;
    placeholder?: string;
    domainId?: string;
}

export function getDefaultConfig(type: QuestionType): QuestionConfig {
    switch (type) {
        case 'text':         return { placeholder: '' };
        case 'number':       return { step: 1 };
        case 'rating':       return { stars: 5 };
        case 'scale':        return { scaleMin: 1, scaleMax: 10, scaleMinLabel: '', scaleMaxLabel: '' };
        case 'file':         return { accept: 'image/*' };
        case 'select':
        case 'multi-select': return { domainId: undefined };
        case 'matrix':       return { matrixRows: [], matrixColumns: [] };
        default:             return {};
    }
}

// ─── Domain ───────────────────────────────────────────────────────────────────

export interface DomainValue {
    id: string;
    domainId: string;
    label: string;
    value: string;
}

export interface Domain {
    id: string;
    name: string;
    description?: string;
    values: DomainValue[];
}

// ─── Question ─────────────────────────────────────────────────────────────────

export interface Question {
    id: string;
    sectionId: string;
    type: QuestionType;
    label: string;
    description?: string;
    required: boolean;
    order: number;
    config: QuestionConfig;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface Section {
    id: string;
    formId: string;
    title: string;
    description?: string;
    order: number;
    questions: Question[];
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export type FormStatus = 'draft' | 'published';

export interface Form {
    id: string;
    workspaceId: string;
    name: string;
    description?: string;
    status: FormStatus;
    sections: Section[];
    createdAt: string;
    updatedAt: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface FormBuilderState {
    forms: Record<string, Form[]>; // keyed by workspaceId
    domains: Domain[];
}
