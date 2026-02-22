import { Injectable, signal, computed } from '@angular/core';
import {
    Domain, DomainValue, Form, FormBuilderState,
    FormStatus, Question, QuestionType, Section,
    getDefaultConfig
} from '../models/form-builder.models';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DOMAINS: Domain[] = [
    {
        id: 'd1',
        name: 'Nivel de Satisfaccion',
        description: 'Escala de satisfacción del usuario',
        values: [
            { id: 'dv1', domainId: 'd1', label: 'Muy malo',   value: '1' },
            { id: 'dv2', domainId: 'd1', label: 'Malo',        value: '2' },
            { id: 'dv3', domainId: 'd1', label: 'Regular',     value: '3' },
            { id: 'dv4', domainId: 'd1', label: 'Bueno',       value: '4' },
            { id: 'dv5', domainId: 'd1', label: 'Muy bueno',   value: '5' },
        ]
    },
    {
        id: 'd2',
        name: 'Departamentos',
        description: 'Áreas de la organización',
        values: [
            { id: 'dv6',  domainId: 'd2', label: 'Administración', value: 'admin' },
            { id: 'dv7',  domainId: 'd2', label: 'Obras',          value: 'obras' },
            { id: 'dv8',  domainId: 'd2', label: 'Legales',        value: 'legales' },
            { id: 'dv9',  domainId: 'd2', label: 'Sistemas',       value: 'sistemas' },
            { id: 'dv10', domainId: 'd2', label: 'RRHH',           value: 'rrhh' },
        ]
    },
    {
        id: 'd3',
        name: 'Prioridad',
        description: 'Niveles de prioridad',
        values: [
            { id: 'dv11', domainId: 'd3', label: 'Baja',    value: 'low' },
            { id: 'dv12', domainId: 'd3', label: 'Media',   value: 'medium' },
            { id: 'dv13', domainId: 'd3', label: 'Alta',    value: 'high' },
            { id: 'dv14', domainId: 'd3', label: 'Crítica', value: 'critical' },
        ]
    }
];

const MOCK_FORMS: Record<string, Form[]> = {
    '1': [
        {
            id: 'f1',
            workspaceId: '1',
            name: 'Solicitud de Permiso de Obra',
            description: 'Formulario para solicitar permiso de construcción o remodelación.',
            status: 'published',
            createdAt: '2026-01-15T10:00:00Z',
            updatedAt: '2026-02-01T14:30:00Z',
            sections: [
                {
                    id: 's1', formId: 'f1', title: 'Datos del Solicitante',
                    description: 'Información personal del titular del trámite',
                    order: 0,
                    questions: [
                        { id: 'q1', sectionId: 's1', type: 'text',   label: 'Nombre completo',  required: true,  order: 0, config: { placeholder: 'Ingrese su nombre completo...' } },
                        { id: 'q2', sectionId: 's1', type: 'text',   label: 'DNI',              required: true,  order: 1, config: { placeholder: 'Número de documento...' } },
                        { id: 'q3', sectionId: 's1', type: 'select', label: 'Departamento',     required: false, order: 2, config: { domainId: 'd2' } },
                    ]
                },
                {
                    id: 's2', formId: 'f1', title: 'Datos de la Obra',
                    description: 'Información sobre el proyecto de construcción',
                    order: 1,
                    questions: [
                        { id: 'q4', sectionId: 's2', type: 'text',   label: 'Dirección de la obra',        required: true,  order: 0, config: {} },
                        { id: 'q5', sectionId: 's2', type: 'number', label: 'Superficie total (m²)',       required: true,  order: 1, config: { min: 0, step: 1 } },
                        { id: 'q6', sectionId: 's2', type: 'date',   label: 'Fecha de inicio estimada',   required: false, order: 2, config: {} },
                    ]
                }
            ]
        },
        {
            id: 'f2',
            workspaceId: '1',
            name: 'Inspección de Obra Final',
            description: 'Registro de la inspección final de obras terminadas.',
            status: 'draft',
            createdAt: '2026-01-20T09:00:00Z',
            updatedAt: '2026-02-10T11:00:00Z',
            sections: [
                {
                    id: 's3', formId: 'f2', title: 'Resultado de Inspección', order: 0,
                    questions: [
                        { id: 'q7', sectionId: 's3', type: 'rating', label: 'Calidad de la construcción', required: true,  order: 0, config: { stars: 5 } },
                        { id: 'q8', sectionId: 's3', type: 'text',   label: 'Observaciones',              required: false, order: 1, config: { placeholder: 'Detalle observaciones...' } },
                    ]
                }
            ]
        },
        {
            id: 'f3',
            workspaceId: '1',
            name: 'Encuesta de Satisfacción de Trámite',
            description: 'Formulario de evaluación de la experiencia del ciudadano.',
            status: 'published',
            createdAt: '2026-02-01T08:00:00Z',
            updatedAt: '2026-02-15T16:00:00Z',
            sections: [
                {
                    id: 's4', formId: 'f3', title: 'Experiencia General', order: 0,
                    questions: [
                        { id: 'q9',  sectionId: 's4', type: 'select',  label: 'Nivel de satisfacción',    required: true,  order: 0, config: { domainId: 'd1' } },
                        { id: 'q10', sectionId: 's4', type: 'boolean', label: '¿Recomendaría el servicio?', required: false, order: 1, config: {} },
                        { id: 'q11', sectionId: 's4', type: 'text',    label: 'Comentarios adicionales',  required: false, order: 2, config: { placeholder: 'Sus comentarios...' } },
                    ]
                }
            ]
        }
    ],
    '2': [
        {
            id: 'f4',
            workspaceId: '2',
            name: 'Habilitación Comercial Nueva',
            description: 'Solicitud de habilitación para nuevos locales comerciales.',
            status: 'published',
            createdAt: '2026-01-16T10:00:00Z',
            updatedAt: '2026-02-05T14:30:00Z',
            sections: [
                {
                    id: 's5', formId: 'f4', title: 'Datos del Comercio', order: 0,
                    questions: [
                        { id: 'q12', sectionId: 's5', type: 'text',   label: 'Nombre del comercio', required: true,  order: 0, config: {} },
                        { id: 'q13', sectionId: 's5', type: 'text',   label: 'CUIT / CUIL',         required: true,  order: 1, config: {} },
                        { id: 'q14', sectionId: 's5', type: 'select', label: 'Tipo de actividad',   required: true,  order: 2, config: { domainId: 'd2' } },
                    ]
                }
            ]
        }
    ],
    '3': []
};

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FormBuilderService {

    private readonly _state = signal<FormBuilderState>({
        forms: { ...MOCK_FORMS },
        domains: [...MOCK_DOMAINS]
    });

    readonly domains = computed(() => this._state().domains);

    getFormsForWorkspace(workspaceId: string): Form[] {
        return this._state().forms[workspaceId] ?? [];
    }

    getForm(workspaceId: string, formId: string): Form | undefined {
        return this.getFormsForWorkspace(workspaceId).find(f => f.id === formId);
    }

    getDomain(id: string): Domain | undefined {
        return this._state().domains.find(d => d.id === id);
    }

    // ── Forms ──────────────────────────────────────────────────────────────────

    addForm(workspaceId: string, name: string, description?: string): string {
        const id = generateId();
        const now = new Date().toISOString();
        const newForm: Form = {
            id, workspaceId, name, description,
            status: 'draft', sections: [],
            createdAt: now, updatedAt: now
        };
        this._state.update(s => ({
            ...s,
            forms: {
                ...s.forms,
                [workspaceId]: [...(s.forms[workspaceId] ?? []), newForm]
            }
        }));
        return id;
    }

    updateForm(workspaceId: string, formId: string, payload: Partial<Pick<Form, 'name' | 'description' | 'status'>>): void {
        this._updateForm(workspaceId, formId, f => ({ ...f, ...payload, updatedAt: new Date().toISOString() }));
    }

    toggleFormStatus(workspaceId: string, formId: string): void {
        this._updateForm(workspaceId, formId, f => ({
            ...f,
            status: f.status === 'published' ? 'draft' : 'published' as FormStatus,
            updatedAt: new Date().toISOString()
        }));
    }

    deleteForm(workspaceId: string, formId: string): void {
        this._state.update(s => ({
            ...s,
            forms: {
                ...s.forms,
                [workspaceId]: (s.forms[workspaceId] ?? []).filter(f => f.id !== formId)
            }
        }));
    }

    duplicateForm(workspaceId: string, formId: string): string {
        const orig = this.getForm(workspaceId, formId);
        if (!orig) return '';
        const newId = generateId();
        const now = new Date().toISOString();
        const copy: Form = {
            ...orig,
            id: newId,
            name: orig.name + ' (copia)',
            status: 'draft',
            createdAt: now, updatedAt: now,
            sections: orig.sections.map(sec => ({
                ...sec,
                id: generateId(),
                formId: newId,
                questions: sec.questions.map(q => ({ ...q, id: generateId(), sectionId: sec.id }))
            }))
        };
        this._state.update(s => ({
            ...s,
            forms: {
                ...s.forms,
                [workspaceId]: [...(s.forms[workspaceId] ?? []), copy]
            }
        }));
        return newId;
    }

    // ── Sections ───────────────────────────────────────────────────────────────

    addSection(workspaceId: string, formId: string): string {
        const form = this.getForm(workspaceId, formId);
        if (!form) return '';
        const id = generateId();
        const order = form.sections.length;
        const section: Section = { id, formId, title: `Sección ${order + 1}`, order, questions: [] };
        this._updateForm(workspaceId, formId, f => ({
            ...f,
            sections: [...f.sections, section],
            updatedAt: new Date().toISOString()
        }));
        return id;
    }

    updateSection(workspaceId: string, formId: string, sectionId: string,
        payload: Partial<Pick<Section, 'title' | 'description'>>): void {
        this._updateSection(workspaceId, formId, sectionId, s => ({ ...s, ...payload }));
    }

    deleteSection(workspaceId: string, formId: string, sectionId: string): void {
        this._updateForm(workspaceId, formId, f => ({
            ...f,
            sections: f.sections.filter(s => s.id !== sectionId)
                .map((s, i) => ({ ...s, order: i })),
            updatedAt: new Date().toISOString()
        }));
    }

    moveSection(workspaceId: string, formId: string, sectionId: string, direction: 'up' | 'down'): void {
        this._updateForm(workspaceId, formId, f => {
            const sorted = [...f.sections].sort((a, b) => a.order - b.order);
            const idx = sorted.findIndex(s => s.id === sectionId);
            const target = direction === 'up' ? idx - 1 : idx + 1;
            if (target < 0 || target >= sorted.length) return f;
            [sorted[idx], sorted[target]] = [sorted[target], sorted[idx]];
            return { ...f, sections: sorted.map((s, i) => ({ ...s, order: i })), updatedAt: new Date().toISOString() };
        });
    }

    // ── Questions ──────────────────────────────────────────────────────────────

    addQuestion(workspaceId: string, formId: string, sectionId: string, type: QuestionType): string {
        const form = this.getForm(workspaceId, formId);
        const section = form?.sections.find(s => s.id === sectionId);
        if (!section) return '';
        const id = generateId();
        const question: Question = {
            id, sectionId, type,
            label: 'Nueva pregunta',
            required: false,
            order: section.questions.length,
            config: getDefaultConfig(type)
        };
        this._updateSection(workspaceId, formId, sectionId, s => ({
            ...s, questions: [...s.questions, question]
        }));
        return id;
    }

    updateQuestion(workspaceId: string, formId: string, sectionId: string,
        questionId: string, payload: Partial<Omit<Question, 'id' | 'sectionId'>>): void {
        this._updateSection(workspaceId, formId, sectionId, s => ({
            ...s,
            questions: s.questions.map(q => q.id === questionId ? { ...q, ...payload } : q)
        }));
    }

    deleteQuestion(workspaceId: string, formId: string, sectionId: string, questionId: string): void {
        this._updateSection(workspaceId, formId, sectionId, s => ({
            ...s,
            questions: s.questions.filter(q => q.id !== questionId).map((q, i) => ({ ...q, order: i }))
        }));
    }

    moveQuestion(workspaceId: string, formId: string, sectionId: string,
        questionId: string, direction: 'up' | 'down'): void {
        this._updateSection(workspaceId, formId, sectionId, s => {
            const sorted = [...s.questions].sort((a, b) => a.order - b.order);
            const idx = sorted.findIndex(q => q.id === questionId);
            const target = direction === 'up' ? idx - 1 : idx + 1;
            if (target < 0 || target >= sorted.length) return s;
            [sorted[idx], sorted[target]] = [sorted[target], sorted[idx]];
            return { ...s, questions: sorted.map((q, i) => ({ ...q, order: i })) };
        });
    }

    duplicateQuestion(workspaceId: string, formId: string, sectionId: string, questionId: string): string {
        const form = this.getForm(workspaceId, formId);
        const section = form?.sections.find(s => s.id === sectionId);
        const question = section?.questions.find(q => q.id === questionId);
        if (!question) return '';
        const newId = generateId();
        const copy: Question = { ...question, id: newId, label: question.label + ' (copia)', order: section!.questions.length };
        this._updateSection(workspaceId, formId, sectionId, s => ({
            ...s, questions: [...s.questions, copy]
        }));
        return newId;
    }

    // ── Domains ────────────────────────────────────────────────────────────────

    addDomain(name: string, description?: string): string {
        const id = generateId();
        const domain: Domain = { id, name, description, values: [] };
        this._state.update(s => ({ ...s, domains: [...s.domains, domain] }));
        return id;
    }

    updateDomain(id: string, payload: Partial<Pick<Domain, 'name' | 'description'>>): void {
        this._state.update(s => ({
            ...s,
            domains: s.domains.map(d => d.id === id ? { ...d, ...payload } : d)
        }));
    }

    deleteDomain(id: string): void {
        this._state.update(s => ({ ...s, domains: s.domains.filter(d => d.id !== id) }));
    }

    addDomainValue(domainId: string, label: string, value: string): string {
        const id = generateId();
        const dv: DomainValue = { id, domainId, label, value };
        this._state.update(s => ({
            ...s,
            domains: s.domains.map(d => d.id === domainId ? { ...d, values: [...d.values, dv] } : d)
        }));
        return id;
    }

    updateDomainValue(domainId: string, valueId: string, payload: Partial<Pick<DomainValue, 'label' | 'value'>>): void {
        this._state.update(s => ({
            ...s,
            domains: s.domains.map(d =>
                d.id === domainId
                    ? { ...d, values: d.values.map(v => v.id === valueId ? { ...v, ...payload } : v) }
                    : d
            )
        }));
    }

    deleteDomainValue(domainId: string, valueId: string): void {
        this._state.update(s => ({
            ...s,
            domains: s.domains.map(d =>
                d.id === domainId
                    ? { ...d, values: d.values.filter(v => v.id !== valueId) }
                    : d
            )
        }));
    }

    // ── Private Helpers ────────────────────────────────────────────────────────

    private _updateForm(workspaceId: string, formId: string, updater: (f: Form) => Form): void {
        this._state.update(s => ({
            ...s,
            forms: {
                ...s.forms,
                [workspaceId]: (s.forms[workspaceId] ?? []).map(f => f.id === formId ? updater(f) : f)
            }
        }));
    }

    private _updateSection(workspaceId: string, formId: string, sectionId: string,
        updater: (s: Section) => Section): void {
        this._updateForm(workspaceId, formId, f => ({
            ...f,
            sections: f.sections.map(s => s.id === sectionId ? updater(s) : s),
            updatedAt: new Date().toISOString()
        }));
    }
}
