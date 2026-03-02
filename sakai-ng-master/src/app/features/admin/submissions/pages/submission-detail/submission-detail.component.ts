import {
    ChangeDetectionStrategy, Component, inject, input, OnInit, signal, computed
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import {
    Form, Section, Question, DomainValue, QuestionType,
    QUESTION_TYPE_CONFIG
} from '../../../workspace/features/form-builder/models/form-builder.models';
import { FormBuilderService } from '../../../workspace/features/form-builder/services/form-builder.service';
import {
    Submission, SubmissionAnswer, SubmissionStatus,
    SUBMISSION_STATUS_CONFIG
} from '../../models/submission.model';
import { SubmissionService } from '../../services/submission.service';

type AnswerValue = string | number | boolean | string[] | null;

@Component({
    selector: 'app-submission-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [
        RouterModule, FormsModule,
        ButtonModule, InputTextModule, InputNumberModule, SelectModule,
        TagModule, TextareaModule, ToastModule, TooltipModule,
    ],
    styles: [`
        .edit-input {
            width: 100%; padding: 10px 14px;
            border: 1.5px solid #e5e7eb; border-radius: 8px;
            font-size: 0.9375rem; color: #111827;
            background: white; outline: none; transition: border-color 0.15s;
            font-family: inherit;
        }
        .edit-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
        :host-context(.dark) .edit-input {
            background: var(--surface-800); border-color: var(--surface-600); color: #f1f5f9;
        }
        .edit-select {
            width: 100%; padding: 10px 14px;
            border: 1.5px solid #e5e7eb; border-radius: 8px;
            font-size: 0.9375rem; color: #111827; background: white;
            outline: none; cursor: pointer;
        }
        .edit-select:focus { border-color: #8b5cf6; outline: none; }
        .bool-btn {
            flex: 1; padding: 10px; border-radius: 8px;
            border: 1.5px solid #e5e7eb; background: white; cursor: pointer;
            font-size: 0.9375rem; font-weight: 500; color: #374151;
            transition: all 0.12s; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .bool-btn:hover { border-color: #8b5cf6; }
        .bool-btn.active-yes { border-color: #10b981; background: #ecfdf5; color: #059669; }
        .bool-btn.active-no { border-color: #ef4444; background: #fef2f2; color: #dc2626; }
        .section-card {
            border-radius: 0.75rem;
            border: 1.5px solid #e5e7eb;
            background: white;
        }
        :host-context(.dark) .section-card {
            background: var(--surface-900);
            border-color: var(--surface-700);
        }
        .action-btn {
            width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 6px; transition: all 0.12s; border: none;
            background: transparent; cursor: pointer; color: #9ca3af;
        }
        .action-btn:hover { background: #f3f4f6; color: #4b5563; }
        :host-context(.dark) .action-btn:hover { background: var(--surface-700); color: #e2e8f0; }
        .type-badge {
            display: inline-flex; align-items: center;
            padding: 0.175rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.7rem; font-weight: 500;
            background: #f1f5f9; color: #64748b;
            white-space: nowrap;
        }
        :host-context(.dark) .type-badge { background: var(--surface-800); color: #94a3b8; }
        .item-row {
            display: grid;
            grid-template-columns: minmax(180px, 0.45fr) 1fr;
            gap: 1rem;
            align-items: center;
        }
        @media (max-width: 640px) {
            .item-row { grid-template-columns: 1fr; }
        }
        .question-row {
            border-radius: 0.5rem;
            border: 1.5px solid #e5e7eb;
            background: white;
        }
        :host-context(.dark) .question-row {
            background: var(--surface-900);
            border-color: var(--surface-700);
        }
    `],
    template: `
        @if (isLoading()) {
            <div class="flex items-center justify-center py-24">
                <div class="text-center">
                    <i class="pi pi-spin pi-spinner text-violet-500 text-3xl mb-3 block"></i>
                    <p class="text-gray-500 text-sm">Cargando respuesta...</p>
                </div>
            </div>
        } @else if (!submission()) {
            <div class="flex flex-col items-center justify-center py-24 text-center">
                <div class="bg-red-100 p-5 rounded-full mb-4">
                    <i class="pi pi-exclamation-triangle text-red-500 text-3xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-1">Respuesta no encontrada</h3>
                <p class="text-gray-500 text-sm mb-5">El ID <code class="bg-gray-100 px-1.5 py-0.5 rounded">{{ submissionId() }}</code> no existe.</p>
                <p-button label="Volver al listado" icon="pi pi-arrow-left" severity="secondary"
                    routerLink="/admin/submissions" />
            </div>
        } @else {

            <!-- ── Back link (mismo estilo que form-editor) ──────────────────── -->
            <div class="flex items-center gap-2 mb-5">
                <a class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors no-underline cursor-pointer"
                    [routerLink]="['/admin/submissions']">
                    <i class="pi pi-arrow-left text-xs"></i>
                    Respuestas
                </a>
            </div>

            <!-- ── Header Card (mismo diseño que form-editor Form Header) ───── -->
            <div class="bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 p-5 mb-5 shadow-sm">
                <div class="flex items-start justify-between gap-4 flex-wrap">
                    <div class="flex-1 min-w-0">
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-0.5">
                            {{ submission()!.submittedBy }}
                        </h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ submission()!.formName }} · {{ submission()!.workspaceName }}
                        </p>
                        <div class="flex items-center gap-4 mt-2.5 text-xs text-gray-400">
                            @if (formStructure(); as form) {
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-list"></i>
                                    {{ sortedSections(form).length }} {{ sortedSections(form).length === 1 ? 'sección' : 'secciones' }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-question-circle"></i>
                                    {{ submission()!.answers.length }} respuestas
                                </span>
                            }
                            <span class="flex items-center gap-1">
                                <i class="pi pi-clock"></i>
                                Enviado {{ formatDate(submission()!.submittedAt) }} a las {{ formatTime(submission()!.submittedAt) }}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                        <p-tag
                            [value]="statusConfig[submission()!.status].label"
                            [severity]="statusConfig[submission()!.status].severity" />
                        @if (!isEditMode()) {
                            <a [routerLink]="['/admin/submissions', submission()!.id, 'edit']"
                                class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-surface-600 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors no-underline">
                                <i class="pi pi-pencil text-xs"></i>
                                Editar
                            </a>
                            @for (s of statusOptions; track s.value) {
                                <p-button
                                    [label]="s.label"
                                    [icon]="statusConfig[s.value].icon"
                                    [severity]="statusConfig[s.value].severity"
                                    [outlined]="submission()!.status !== s.value"
                                    size="small"
                                    pTooltip="Cambiar a {{ s.label }}" tooltipPosition="top"
                                    (onClick)="changeStatus(s.value)" />
                            }
                        }
                    </div>
                </div>
            </div>

            <!-- ── Secciones (mismo diseño que form-editor) ──────────────────── -->
            <div class="mb-6">
                @if (formStructure(); as form) {
                    <div class="space-y-3">
                        @for (section of sortedSections(form); track section.id; let sIdx = $index) {
                            <div class="section-card overflow-hidden">
                                <!-- Section header — title + desc (mismo layout que form-editor) -->
                                <div class="flex items-start gap-2 px-4 py-3">
                                    <button type="button" class="action-btn shrink-0 mt-0.5"
                                        (click)="toggleSection(section.id)"
                                        [title]="sectionOpen(section.id) ? 'Colapsar' : 'Expandir'">
                                        <i class="pi text-sm transition-transform duration-200"
                                            [class]="sectionOpen(section.id) ? 'pi-chevron-down text-blue-500' : 'pi-chevron-right'"></i>
                                    </button>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="text-sm font-bold text-gray-800 dark:text-white leading-snug">
                                            {{ section.title }}
                                        </h4>
                                        @if (section.description) {
                                            <p class="text-xs text-gray-400 dark:text-gray-500 italic block mt-0.5">
                                                {{ section.description }}
                                            </p>
                                        }
                                    </div>
                                    <div class="flex items-center gap-0.5 shrink-0 mt-0.5">
                                        <span class="type-badge mr-1.5">
                                            {{ section.questions.length }}
                                            {{ section.questions.length === 1 ? 'pregunta' : 'preguntas' }}
                                        </span>
                                    </div>
                                </div>
                                <!-- Preguntas (colapsable): label a la izquierda, valor/input a la derecha -->
                                @if (sectionOpen(section.id)) {
                                <div class="border-t border-gray-100 dark:border-surface-700 px-4 py-3 space-y-2">
                                    @for (question of sortedQuestions(section); track question.id) {
                                        <div class="question-row item-row px-3 py-2.5">
                                            <!-- Columna 1: etiqueta + tipo -->
                                            <div class="flex items-center gap-2 min-w-0">
                                                <div class="flex w-7 h-7 items-center justify-center rounded-md shrink-0"
                                                    [style.background-color]="getTypeColors(question.type).bg"
                                                    [style.color]="getTypeColors(question.type).icon">
                                                    <i [class]="getTypeIcon(question.type) + ' text-xs'"></i>
                                                </div>
                                                <div class="flex flex-col min-w-0">
                                                    <span class="text-sm font-medium text-gray-800 dark:text-white truncate">
                                                        {{ question.label || 'Sin título' }}
                                                    </span>
                                                    <span class="type-badge w-fit mt-0.5">{{ getTypeLabel(question.type) }}</span>
                                                </div>
                                            </div>
                                            <!-- Columna 2: respuesta -->
                                            <div class="min-w-0 w-full flex items-center">
                                                @if (isEditMode()) {
                                                    @switch (question.type) {
                                                        @case ('text') {
                                                            <input class="edit-input" type="text"
                                                                [placeholder]="question.config.placeholder || 'Escribe tu respuesta...'"
                                                                [ngModel]="getAnswerValue(question.id)"
                                                                (ngModelChange)="setAnswerValue(question.id, $event)" />
                                                        }
                                                        @case ('number') {
                                                            <input class="edit-input" type="number"
                                                                [attr.min]="question.config.min"
                                                                [attr.max]="question.config.max"
                                                                [attr.step]="question.config.step ?? 1"
                                                                [ngModel]="getAnswerValue(question.id)"
                                                                (ngModelChange)="setAnswerValue(question.id, $event !== '' ? +$event : null)" />
                                                        }
                                                        @case ('date') {
                                                            <input class="edit-input" type="date"
                                                                [ngModel]="getAnswerValue(question.id)"
                                                                (ngModelChange)="setAnswerValue(question.id, $event)" />
                                                        }
                                                        @case ('boolean') {
                                                            <div class="flex gap-3">
                                                                <button type="button" class="bool-btn"
                                                                    [class.active-yes]="getAnswerValue(question.id) === true"
                                                                    (click)="setAnswerValue(question.id, true)">
                                                                    <i class="pi pi-check text-sm"></i> Sí
                                                                </button>
                                                                <button type="button" class="bool-btn"
                                                                    [class.active-no]="getAnswerValue(question.id) === false"
                                                                    (click)="setAnswerValue(question.id, false)">
                                                                    <i class="pi pi-times text-sm"></i> No
                                                                </button>
                                                            </div>
                                                        }
                                                        @case ('select') {
                                                            @if (getDomainValues(question.config.domainId); as opts) {
                                                                <select class="edit-select"
                                                                    [ngModel]="resolveSelectValue(question.id, opts)"
                                                                    (ngModelChange)="setAnswerValue(question.id, $event)">
                                                                    <option value="">Selecciona una opción...</option>
                                                                    @for (opt of opts; track opt.id) {
                                                                        <option [value]="opt.value">{{ opt.label }}</option>
                                                                    }
                                                                </select>
                                                            } @else {
                                                                <span class="text-xs text-gray-400 italic">Sin opciones</span>
                                                            }
                                                        }
                                                        @default {
                                                            <input class="edit-input" type="text"
                                                                [ngModel]="getAnswerValue(question.id)"
                                                                (ngModelChange)="setAnswerValue(question.id, $event)" />
                                                        }
                                                    }
                                                } @else {
                                                    <span class="text-sm text-gray-900 dark:text-white">
                                                        {{ formatAnswerForQuestion(question) }}
                                                    </span>
                                                }
                                            </div>
                                        </div>
                                    }
                                </div>
                                }
                            </div>
                        }
                    </div>
                } @else {
                    <!-- Fallback: lista plana con layout horizontal -->
                    <div class="section-card overflow-hidden">
                        <div class="divide-y divide-gray-100 dark:divide-surface-700">
                            @for (answer of submission()!.answers; track answer.questionId; let i = $index) {
                                <div class="item-row px-4 py-3"
                                    [class.bg-violet-50]="i % 2 === 0"
                                    [class.dark:bg-surface-800]="i % 2 === 0">
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {{ answer.questionLabel }}
                                        </span>
                                        <span class="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-surface-700 px-1.5 py-0.5 rounded">
                                            {{ getTypeLabel(answer.questionType) }}
                                        </span>
                                    </div>
                                    <div class="text-sm text-gray-900 dark:text-white">
                                        {{ formatAnswer(answer) }}
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                }
                <!-- Observaciones / Notas (arriba de los botones) -->
                <div class="mt-4 bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 shadow-sm overflow-hidden">
                    <div class="px-4 py-3 border-b border-gray-100 dark:border-surface-700 bg-gray-50 dark:bg-surface-800">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-comment text-amber-500"></i>
                            <h3 class="text-sm font-semibold text-gray-800 dark:text-white">Observaciones</h3>
                        </div>
                    </div>
                    <div class="p-4">
                        <textarea pTextarea
                            [(ngModel)]="notesValue"
                            [readonly]="!isEditMode()"
                            placeholder="Agregar observaciones o notas sobre esta respuesta..."
                            rows="3"
                            class="w-full text-sm">
                        </textarea>
                        @if (!isEditMode()) {
                            <div class="flex justify-end mt-2">
                                <p-button label="Guardar nota" icon="pi pi-check" severity="warn" size="small"
                                    (onClick)="saveNotes()" />
                            </div>
                        }
                    </div>
                </div>
                @if (isEditMode()) {
                    <div class="mt-4 px-4 py-4 rounded-xl border border-gray-200 dark:border-surface-700 bg-gray-50/70 dark:bg-surface-800/50 flex flex-wrap gap-3 justify-end">
                        <p-button label="Cancelar" icon="pi pi-times" severity="secondary" [outlined]="true"
                            size="small" (onClick)="cancelEdit()" />
                        <p-button label="Guardar" icon="pi pi-check" severity="info" size="small"
                            [loading]="isSaving()"
                            (onClick)="saveAnswers()" />
                        <p-button label="Finalizar" icon="pi pi-check-circle" severity="success" size="small"
                            [loading]="isSaving()"
                            (onClick)="finalizeForm()" />
                    </div>
                }
            </div>
        }

        <p-toast />
    `
})
export class SubmissionDetailComponent implements OnInit {
    private readonly submissionSvc = inject(SubmissionService);
    private readonly fbService = inject(FormBuilderService);
    private readonly messageService = inject(MessageService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    readonly submissionId = input<string>('');

    readonly submission = this.submissionSvc.selected;
    readonly isLoading = signal(true);
    readonly isSaving = signal(false);

    readonly isEditMode = computed(() => this.route.snapshot.data['edit'] === true);

    readonly formStructure = computed<Form | null>(() => {
        const sub = this.submission();
        if (!sub) return null;
        return this.fbService.getForm(sub.workspaceId, sub.formId) ?? null;
    });

    readonly statusConfig = SUBMISSION_STATUS_CONFIG;
    notesValue = '';

    /** Mapa de respuestas editables: questionId -> value */
    readonly editAnswers = signal<Record<string, AnswerValue>>({});

    /** Secciones expandidas (acordeón, como form-editor) */
    readonly openSections = signal<Set<string>>(new Set());

    readonly statusOptions: { value: SubmissionStatus; label: string }[] = [
        { value: 'reviewed',  label: 'Revisada'  },
        { value: 'processed', label: 'Procesada' },
        { value: 'rejected',  label: 'Rechazada' },
    ];

    ngOnInit(): void {
        const id = this.submissionId();
        if (!id) { this.isLoading.set(false); return; }

        this.submissionSvc.getById(id).subscribe(sub => {
            this.isLoading.set(false);
            if (sub?.notes) this.notesValue = sub.notes;
            if (sub?.answers) {
                const map: Record<string, AnswerValue> = {};
                sub.answers.forEach(a => {
                    map[a.questionId] = a.value;
                });
                this.editAnswers.set(map);
            }
            if (sub) {
                const form = this.fbService.getForm(sub.workspaceId, sub.formId);
                if (form?.sections?.length) {
                    this.openSections.set(new Set(form.sections.map(s => s.id)));
                }
            }
        });
    }

    sectionOpen(id: string): boolean {
        return this.openSections().has(id);
    }

    toggleSection(id: string): void {
        this.openSections.update(s => {
            const next = new Set(s);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    sortedSections(form: Form): Section[] {
        return [...(form.sections ?? [])].sort((a, b) => a.order - b.order);
    }

    sortedQuestions(section: Section): Question[] {
        return [...(section.questions ?? [])].sort((a, b) => a.order - b.order);
    }

    getAnswerValue(questionId: string): AnswerValue {
        return this.editAnswers()[questionId] ?? null;
    }

    setAnswerValue(questionId: string, value: AnswerValue): void {
        this.editAnswers.update(m => ({ ...m, [questionId]: value }));
    }

    getDomainValues(domainId: string | undefined): DomainValue[] {
        if (!domainId) return [];
        return this.fbService.getDomain(domainId)?.values ?? [];
    }

    /** Para select: el submission puede tener label o value; resolvemos al value del dominio */
    resolveSelectValue(questionId: string, opts: DomainValue[]): string {
        const val = this.editAnswers()[questionId];
        if (val === null || val === undefined || val === '') return '';
        const str = String(val);
        const byValue = opts.find(o => o.value === str);
        if (byValue) return byValue.value;
        const byLabel = opts.find(o => o.label === str);
        return byLabel?.value ?? str;
    }

    formatAnswerForQuestion(question: Question): string {
        const answer = this.submission()?.answers.find(a => a.questionId === question.id);
        if (!answer || answer.value === null || answer.value === undefined || answer.value === '') {
            return '— sin respuesta —';
        }
        if (question.type === 'select' && question.config.domainId) {
            const opts = this.getDomainValues(question.config.domainId);
            const val = String(answer.value);
            const byValue = opts.find(o => o.value === val);
            if (byValue) return byValue.label;
            const byLabel = opts.find(o => o.label === val);
            if (byLabel) return byLabel.label;
        }
        return this.formatAnswer(answer);
    }

    private buildAnswersFromEdit(): SubmissionAnswer[] {
        const sub = this.submission();
        if (!sub) return [];
        const form = this.formStructure();
        const editMap = this.editAnswers();
        if (form) {
            const result: SubmissionAnswer[] = [];
            for (const section of this.sortedSections(form)) {
                for (const q of this.sortedQuestions(section)) {
                    const existing = sub.answers.find(a => a.questionId === q.id);
                    const value = editMap[q.id] ?? existing?.value ?? null;
                    result.push({
                        questionId: q.id,
                        questionLabel: q.label,
                        questionType: q.type,
                        value
                    });
                }
            }
            return result;
        }
        return sub.answers.map(a => ({
            ...a,
            value: editMap[a.questionId] ?? a.value
        }));
    }

    saveAnswers(): void {
        const sub = this.submission();
        if (!sub) return;
        const answers = this.buildAnswersFromEdit();
        this.isSaving.set(true);
        this.submissionSvc.updateAnswers(sub.id, answers).subscribe({
            next: () => {
                this.submissionSvc.updateStatus(sub.id, sub.status, this.notesValue).subscribe({
                    next: () => {
                        this.isSaving.set(false);
                        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Las respuestas y observaciones se guardaron correctamente.' });
                    },
                    error: () => this.isSaving.set(false)
                });
            },
            error: () => this.isSaving.set(false)
        });
    }

    finalizeForm(): void {
        const sub = this.submission();
        if (!sub) return;
        const answers = this.buildAnswersFromEdit();
        this.isSaving.set(true);
        this.submissionSvc.updateAnswers(sub.id, answers).subscribe({
            next: () => {
                this.submissionSvc.updateStatus(sub.id, 'processed', this.notesValue).subscribe({
                    next: () => {
                        this.isSaving.set(false);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Finalizado',
                            detail: 'Respuestas, observaciones guardadas y trámite marcado como procesado.'
                        });
                        this.router.navigate(['/admin/submissions', sub.id]);
                    },
                    error: () => this.isSaving.set(false)
                });
            },
            error: () => this.isSaving.set(false)
        });
    }

    cancelEdit(): void {
        this.router.navigate(['/admin/submissions', this.submission()!.id]);
    }

    changeStatus(status: SubmissionStatus): void {
        const sub = this.submission();
        if (!sub || sub.status === status) return;
        this.submissionSvc.updateStatus(sub.id, status).subscribe(() => {
            this.messageService.add({
                severity: 'success',
                summary: 'Estado actualizado',
                detail: `Respuesta marcada como ${this.statusConfig[status].label}.`
            });
        });
    }

    saveNotes(): void {
        const sub = this.submission();
        if (!sub) return;
        this.submissionSvc.updateStatus(sub.id, sub.status, this.notesValue).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Nota guardada', detail: 'La nota fue guardada correctamente.' });
        });
    }

    formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    formatTime(iso: string): string {
        return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    formatAnswer(answer: { questionType: string; value: string | number | boolean | string[] | null }): string {
        if (answer.value === null || answer.value === undefined || answer.value === '') return '— sin respuesta —';
        if (answer.questionType === 'boolean') return answer.value ? 'Sí' : 'No';
        if (Array.isArray(answer.value)) return answer.value.join(', ');
        return String(answer.value);
    }

    getTypeLabel(type: string): string {
        return QUESTION_TYPE_CONFIG[type as QuestionType]?.label ?? type;
    }

    getTypeIcon(type: string): string {
        return QUESTION_TYPE_CONFIG[type as QuestionType]?.icon ?? 'pi pi-question';
    }

    getTypeColors(type: string): { icon: string; bg: string } {
        const colors: Record<string, { icon: string; bg: string }> = {
            'text':         { icon: '#3b82f6', bg: '#eff6ff' },
            'number':       { icon: '#10b981', bg: '#ecfdf5' },
            'date':         { icon: '#8b5cf6', bg: '#f5f3ff' },
            'boolean':      { icon: '#f59e0b', bg: '#fffbeb' },
            'select':       { icon: '#6366f1', bg: '#eef2ff' },
            'multi-select': { icon: '#6366f1', bg: '#eef2ff' },
            'file':         { icon: '#6b7280', bg: '#f9fafb' },
            'rating':       { icon: '#eab308', bg: '#fefce8' },
            'scale':        { icon: '#14b8a6', bg: '#f0fdfa' },
            'matrix':       { icon: '#ec4899', bg: '#fdf2f8' },
        };
        return colors[type] ?? { icon: '#6b7280', bg: '#f9fafb' };
    }
}
