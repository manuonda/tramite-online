import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Submission, SubmissionAnswer, SubmissionFilter, SubmissionStatus } from '../models/submission.model';

const MOCK_SUBMISSIONS: Submission[] = [
    // ── Workspace 1 · Form f1: Solicitud de Permiso de Obra ──────────────
    {
        id: 'sub-001',
        workspaceId: '1', workspaceName: 'Secretaría de Obras',
        formId: 'f1',     formName: 'Solicitud de Permiso de Obra',
        submittedBy: 'Carlos Mendez',
        submittedAt: '2026-02-20T09:15:00Z',
        status: 'pending',
        answers: [
            { questionId: 'q1', questionLabel: 'Nombre completo',        questionType: 'text',   value: 'Carlos Mendez'    },
            { questionId: 'q2', questionLabel: 'DNI',                    questionType: 'text',   value: '32.456.789'       },
            { questionId: 'q3', questionLabel: 'Departamento',           questionType: 'select', value: 'Obras'            },
            { questionId: 'q4', questionLabel: 'Dirección de la obra',   questionType: 'text',   value: 'Av. Corrientes 1234, CABA' },
            { questionId: 'q5', questionLabel: 'Superficie total (m²)',  questionType: 'number', value: 120                },
            { questionId: 'q6', questionLabel: 'Fecha de inicio',        questionType: 'date',   value: '2026-03-15'       },
        ]
    },
    {
        id: 'sub-002',
        workspaceId: '1', workspaceName: 'Secretaría de Obras',
        formId: 'f1',     formName: 'Solicitud de Permiso de Obra',
        submittedBy: 'Ana García',
        submittedAt: '2026-02-19T14:30:00Z',
        status: 'reviewed',
        notes: 'Documentación completa. Pendiente aprobación técnica.',
        answers: [
            { questionId: 'q1', questionLabel: 'Nombre completo',       questionType: 'text',   value: 'Ana García'       },
            { questionId: 'q2', questionLabel: 'DNI',                   questionType: 'text',   value: '28.901.234'       },
            { questionId: 'q3', questionLabel: 'Departamento',          questionType: 'select', value: 'Administración'   },
            { questionId: 'q4', questionLabel: 'Dirección de la obra',  questionType: 'text',   value: 'Calle Belgrano 567' },
            { questionId: 'q5', questionLabel: 'Superficie total (m²)', questionType: 'number', value: 85                 },
            { questionId: 'q6', questionLabel: 'Fecha de inicio',       questionType: 'date',   value: '2026-04-01'       },
        ]
    },
    {
        id: 'sub-003',
        workspaceId: '1', workspaceName: 'Secretaría de Obras',
        formId: 'f1',     formName: 'Solicitud de Permiso de Obra',
        submittedBy: 'Roberto Sosa',
        submittedAt: '2026-02-18T11:00:00Z',
        status: 'processed',
        notes: 'Permiso otorgado. Expediente N° 2026-0034.',
        answers: [
            { questionId: 'q1', questionLabel: 'Nombre completo',       questionType: 'text',   value: 'Roberto Sosa'    },
            { questionId: 'q2', questionLabel: 'DNI',                   questionType: 'text',   value: '25.123.456'      },
            { questionId: 'q3', questionLabel: 'Departamento',          questionType: 'select', value: 'Obras'           },
            { questionId: 'q4', questionLabel: 'Dirección de la obra',  questionType: 'text',   value: 'Hipólito Yrigoyen 890' },
            { questionId: 'q5', questionLabel: 'Superficie total (m²)', questionType: 'number', value: 200               },
            { questionId: 'q6', questionLabel: 'Fecha de inicio',       questionType: 'date',   value: '2026-03-01'      },
        ]
    },
    // ── Workspace 1 · Form f3: Encuesta de Satisfacción ──────────────────
    {
        id: 'sub-004',
        workspaceId: '1', workspaceName: 'Secretaría de Obras',
        formId: 'f3',     formName: 'Encuesta de Satisfacción de Trámite',
        submittedBy: 'María López',
        submittedAt: '2026-02-21T16:00:00Z',
        status: 'pending',
        answers: [
            { questionId: 'q9',  questionLabel: 'Nivel de satisfacción',      questionType: 'select',  value: 'Muy bueno'  },
            { questionId: 'q10', questionLabel: '¿Recomendaría el servicio?', questionType: 'boolean', value: true         },
            { questionId: 'q11', questionLabel: 'Comentarios adicionales',    questionType: 'text',    value: 'Excelente atención, muy rápido el proceso.' },
        ]
    },
    {
        id: 'sub-005',
        workspaceId: '1', workspaceName: 'Secretaría de Obras',
        formId: 'f3',     formName: 'Encuesta de Satisfacción de Trámite',
        submittedBy: 'Juan Pérez',
        submittedAt: '2026-02-20T10:30:00Z',
        status: 'pending',
        answers: [
            { questionId: 'q9',  questionLabel: 'Nivel de satisfacción',      questionType: 'select',  value: 'Regular'  },
            { questionId: 'q10', questionLabel: '¿Recomendaría el servicio?', questionType: 'boolean', value: false      },
            { questionId: 'q11', questionLabel: 'Comentarios adicionales',    questionType: 'text',    value: 'Los tiempos de espera son muy largos.' },
        ]
    },
    {
        id: 'sub-006',
        workspaceId: '1', workspaceName: 'Secretaría de Obras',
        formId: 'f3',     formName: 'Encuesta de Satisfacción de Trámite',
        submittedBy: 'Laura Fernández',
        submittedAt: '2026-02-19T08:45:00Z',
        status: 'reviewed',
        answers: [
            { questionId: 'q9',  questionLabel: 'Nivel de satisfacción',      questionType: 'select',  value: 'Bueno'  },
            { questionId: 'q10', questionLabel: '¿Recomendaría el servicio?', questionType: 'boolean', value: true     },
            { questionId: 'q11', questionLabel: 'Comentarios adicionales',    questionType: 'text',    value: null     },
        ]
    },
    // ── Workspace 2 · Form f4: Habilitación Comercial Nueva ──────────────
    {
        id: 'sub-007',
        workspaceId: '2', workspaceName: 'Habilitaciones Comerciales',
        formId: 'f4',     formName: 'Habilitación Comercial Nueva',
        submittedBy: 'Diego Ramírez',
        submittedAt: '2026-02-21T09:00:00Z',
        status: 'pending',
        answers: [
            { questionId: 'q12', questionLabel: 'Nombre del comercio', questionType: 'text',   value: 'Ferretería El Tornillo' },
            { questionId: 'q13', questionLabel: 'CUIT / CUIL',         questionType: 'text',   value: '20-34567890-1'          },
            { questionId: 'q14', questionLabel: 'Tipo de actividad',   questionType: 'select', value: 'Obras'                  },
        ]
    },
    {
        id: 'sub-008',
        workspaceId: '2', workspaceName: 'Habilitaciones Comerciales',
        formId: 'f4',     formName: 'Habilitación Comercial Nueva',
        submittedBy: 'Valeria Torres',
        submittedAt: '2026-02-20T15:20:00Z',
        status: 'reviewed',
        notes: 'Verificar documentación AFIP.',
        answers: [
            { questionId: 'q12', questionLabel: 'Nombre del comercio', questionType: 'text',   value: 'Librería Central' },
            { questionId: 'q13', questionLabel: 'CUIT / CUIL',         questionType: 'text',   value: '27-22345678-4'    },
            { questionId: 'q14', questionLabel: 'Tipo de actividad',   questionType: 'select', value: 'Administración'   },
        ]
    },
    {
        id: 'sub-009',
        workspaceId: '2', workspaceName: 'Habilitaciones Comerciales',
        formId: 'f4',     formName: 'Habilitación Comercial Nueva',
        submittedBy: 'Martín Acosta',
        submittedAt: '2026-02-17T13:00:00Z',
        status: 'rejected',
        notes: 'Documentación incompleta. Falta plano del local.',
        answers: [
            { questionId: 'q12', questionLabel: 'Nombre del comercio', questionType: 'text',   value: 'Taller Mecánico Sur' },
            { questionId: 'q13', questionLabel: 'CUIT / CUIL',         questionType: 'text',   value: '20-11223344-5'       },
            { questionId: 'q14', questionLabel: 'Tipo de actividad',   questionType: 'select', value: 'Obras'               },
        ]
    },
    {
        id: 'sub-010',
        workspaceId: '2', workspaceName: 'Habilitaciones Comerciales',
        formId: 'f4',     formName: 'Habilitación Comercial Nueva',
        submittedBy: 'Claudia Vega',
        submittedAt: '2026-02-16T10:10:00Z',
        status: 'processed',
        notes: 'Habilitación otorgada. Expediente N° HAB-2026-0012.',
        answers: [
            { questionId: 'q12', questionLabel: 'Nombre del comercio', questionType: 'text',   value: 'Boutique Moda' },
            { questionId: 'q13', questionLabel: 'CUIT / CUIL',         questionType: 'text',   value: '27-44556677-2' },
            { questionId: 'q14', questionLabel: 'Tipo de actividad',   questionType: 'select', value: 'RRHH'          },
        ]
    },
];

@Injectable({ providedIn: 'root' })
export class SubmissionService {
    private readonly _submissions = signal<Submission[]>([]);
    private readonly _loading = signal(false);
    private readonly _selected = signal<Submission | null>(null);

    readonly submissions = this._submissions.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly selected = this._selected.asReadonly();

    readonly pendingCount = computed(() =>
        this._submissions().filter(s => s.status === 'pending').length
    );

    create(data: Omit<Submission, 'id'>): Observable<Submission> {
        const id = `sub-${String(MOCK_SUBMISSIONS.length + 1).padStart(3, '0')}`;
        const submission: Submission = { id, ...data };
        MOCK_SUBMISSIONS.push(submission);
        return of(submission).pipe(
            delay(700),
            tap(s => this._submissions.update(list => [...list, s]))
        );
    }

    getAll(filter?: Partial<SubmissionFilter>): Observable<Submission[]> {
        this._loading.set(true);
        let result = [...MOCK_SUBMISSIONS];

        if (filter?.workspaceId) result = result.filter(s => s.workspaceId === filter.workspaceId);
        if (filter?.formId)      result = result.filter(s => s.formId === filter.formId);
        if (filter?.status)      result = result.filter(s => s.status === filter.status);
        if (filter?.search) {
            const q = filter.search.toLowerCase();
            result = result.filter(s =>
                s.submittedBy.toLowerCase().includes(q) ||
                s.formName.toLowerCase().includes(q) ||
                s.id.toLowerCase().includes(q)
            );
        }

        return of(result).pipe(
            delay(400),
            tap(list => {
                this._submissions.set(list);
                this._loading.set(false);
            })
        );
    }

    getById(id: string): Observable<Submission | undefined> {
        const found = MOCK_SUBMISSIONS.find(s => s.id === id);
        return of(found).pipe(
            delay(200),
            tap(s => this._selected.set(s ?? null))
        );
    }

    updateStatus(id: string, status: SubmissionStatus, notes?: string): Observable<Submission> {
        const idx = MOCK_SUBMISSIONS.findIndex(s => s.id === id);
        if (idx !== -1) {
            MOCK_SUBMISSIONS[idx] = { ...MOCK_SUBMISSIONS[idx], status, ...(notes !== undefined && { notes }) };
        }
        const updated = MOCK_SUBMISSIONS[idx];
        return of(updated).pipe(
            delay(300),
            tap(s => {
                this._selected.set(s);
                this._submissions.update(list => list.map(item => item.id === id ? s : item));
            })
        );
    }

    updateAnswers(id: string, answers: SubmissionAnswer[]): Observable<Submission> {
        const idx = MOCK_SUBMISSIONS.findIndex(s => s.id === id);
        if (idx === -1) return of(MOCK_SUBMISSIONS[idx] as Submission).pipe(delay(200));
        MOCK_SUBMISSIONS[idx] = { ...MOCK_SUBMISSIONS[idx], answers };
        const updated = MOCK_SUBMISSIONS[idx];
        return of(updated).pipe(
            delay(300),
            tap(s => {
                this._selected.set(s);
                this._submissions.update(list => list.map(item => item.id === id ? s : item));
            })
        );
    }

    delete(id: string): Observable<void> {
        const idx = MOCK_SUBMISSIONS.findIndex(s => s.id === id);
        if (idx !== -1) MOCK_SUBMISSIONS.splice(idx, 1);
        return of(void 0).pipe(
            delay(300),
            tap(() => this._submissions.update(list => list.filter(s => s.id !== id)))
        );
    }

    // Retorna las formas únicas de un workspace (para el filtro)
    getFormsForWorkspace(workspaceId: string): { id: string; name: string }[] {
        const forms: { id: string; name: string }[] = [];
        const seen = new Set<string>();
        MOCK_SUBMISSIONS
            .filter(s => s.workspaceId === workspaceId)
            .forEach(s => {
                if (!seen.has(s.formId)) {
                    seen.add(s.formId);
                    forms.push({ id: s.formId, name: s.formName });
                }
            });
        return forms;
    }

    // Workspaces únicos con submissions
    getWorkspaceSummary(): { id: string; name: string; count: number }[] {
        const map = new Map<string, { id: string; name: string; count: number }>();
        MOCK_SUBMISSIONS.forEach(s => {
            const existing = map.get(s.workspaceId);
            if (existing) existing.count++;
            else map.set(s.workspaceId, { id: s.workspaceId, name: s.workspaceName, count: 1 });
        });
        return Array.from(map.values());
    }
}
