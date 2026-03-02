import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Submission, SubmissionStatus, SUBMISSION_STATUS_CONFIG } from '../../models/submission.model';
import { SubmissionService } from '../../services/submission.service';

@Component({
    selector: 'app-submission-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [
        RouterModule, FormsModule,
        ButtonModule, TagModule, TextareaModule, ToastModule, TooltipModule,
    ],
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
            <!-- Back + actions bar -->
            <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
                <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" [outlined]="true"
                    size="small" routerLink="/admin/submissions" />
                <div class="flex items-center gap-2">
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
                </div>
            </div>

            <!-- Header card -->
            <div class="bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 overflow-hidden mb-6 shadow-sm">
                <div class="h-1.5 bg-gradient-to-r from-violet-500 to-violet-600"></div>
                <div class="p-6">
                    <div class="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                        <div class="flex items-start gap-4">
                            <div class="bg-violet-100 dark:bg-violet-950 p-3 rounded-full shrink-0">
                                <i class="pi pi-user text-violet-600 text-xl"></i>
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                                    {{ submission()!.submittedBy }}
                                </h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {{ formatDate(submission()!.submittedAt) }} a las {{ formatTime(submission()!.submittedAt) }}
                                </p>
                            </div>
                        </div>
                        <p-tag
                            [value]="statusConfig[submission()!.status].label"
                            [severity]="statusConfig[submission()!.status].severity" />
                    </div>

                    <!-- Meta info -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-surface-700">
                        <div>
                            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Formulario</p>
                            <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ submission()!.formName }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Workspace</p>
                            <span class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-surface-700 px-2.5 py-1 rounded-full">
                                <i class="pi pi-th-large text-xs"></i>
                                {{ submission()!.workspaceName }}
                            </span>
                        </div>
                        <div>
                            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">ID Respuesta</p>
                            <code class="text-sm bg-gray-100 dark:bg-surface-700 px-2.5 py-1 rounded text-gray-600 dark:text-gray-400">
                                {{ submission()!.id }}
                            </code>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Respuestas -->
            <div class="bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 shadow-sm mb-6">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-surface-700">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-list text-violet-600"></i>
                        <h3 class="text-base font-semibold text-gray-800 dark:text-white">
                            Respuestas ({{ submission()!.answers.length }})
                        </h3>
                    </div>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-surface-700">
                    @for (answer of submission()!.answers; track answer.questionId; let i = $index) {
                        <div class="px-6 py-4 flex items-start gap-4"
                            [class.bg-violet-50]="i % 2 === 0"
                            [class.dark:bg-surface-800]="i % 2 === 0">
                            <!-- Número -->
                            <div class="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0 mt-0.5">
                                <span class="text-xs font-bold text-violet-600">{{ i + 1 }}</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    {{ answer.questionLabel }}
                                    <span class="ml-2 text-xs font-normal text-gray-400 bg-gray-100 dark:bg-surface-700 px-1.5 py-0.5 rounded">
                                        {{ getTypeLabel(answer.questionType) }}
                                    </span>
                                </p>
                                <div class="text-sm text-gray-900 dark:text-white">
                                    {{ formatAnswer(answer) }}
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>

            <!-- Notas internas -->
            <div class="bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 shadow-sm">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-surface-700">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-pencil text-amber-500"></i>
                        <h3 class="text-base font-semibold text-gray-800 dark:text-white">Notas internas</h3>
                    </div>
                </div>
                <div class="p-6">
                    <textarea pTextarea
                        [(ngModel)]="notesValue"
                        placeholder="Agregar notas internas sobre esta respuesta..."
                        rows="3"
                        class="w-full text-sm mb-3">
                    </textarea>
                    <div class="flex justify-end">
                        <p-button label="Guardar nota" icon="pi pi-check" severity="warn" size="small"
                            (onClick)="saveNotes()" />
                    </div>
                </div>
            </div>
        }

        <p-toast />
    `
})
export class SubmissionDetailComponent implements OnInit {
    private readonly submissionSvc = inject(SubmissionService);
    private readonly messageService = inject(MessageService);
    private readonly router = inject(Router);

    // Route param via withComponentInputBinding
    readonly submissionId = input<string>('');

    readonly submission = this.submissionSvc.selected;
    readonly isLoading = signal(true);

    readonly statusConfig = SUBMISSION_STATUS_CONFIG;
    notesValue = '';

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
        });
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
        const map: Record<string, string> = {
            text: 'Texto', number: 'Número', date: 'Fecha', boolean: 'Sí/No',
            select: 'Opción', 'multi-select': 'Múltiple', file: 'Archivo',
            rating: 'Valoración', scale: 'Escala', matrix: 'Matriz'
        };
        return map[type] ?? type;
    }
}
