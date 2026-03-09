import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Form } from '../../models/form-builder.models';
import { FormBuilderService } from '../../services/form-builder.service';

type FilterTab = 'all' | 'draft' | 'published';

@Component({
    selector: 'app-form-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService],
    imports: [
        RouterModule, FormsModule, ReactiveFormsModule,
        ButtonModule, DialogModule, InputTextModule, TextareaModule,
        ToastModule, ConfirmDialogModule, TooltipModule
    ],
    styles: [`
        .form-card {
            background: var(--surface-card);
            border: 1px solid var(--surface-border);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            transition: box-shadow 0.2s, border-color 0.2s;
            display: flex;
            flex-direction: column;
            min-height: 260px;
            overflow: hidden;
        }
        .form-card:hover {
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            border-color: var(--surface-400);
        }
        .form-card-icon {
            width: 44px; height: 44px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 12px;
            flex-shrink: 0;
        }
        .form-card-icon.published {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }
        .form-card-icon.draft {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .form-card-stat {
            display: inline-flex; align-items: center; gap: 0.25rem;
            padding: 0.2rem 0.5rem; border-radius: 6px;
            font-size: 0.7rem; font-weight: 500;
            background: var(--surface-100); color: var(--text-color-secondary);
        }
        .form-card-btn {
            flex: 1;
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.8125rem; font-weight: 600;
            border-radius: 8px;
            transition: all 0.15s;
            border: none; cursor: pointer;
        }
        .form-card-btn-primary {
            background: var(--primary-color); color: var(--primary-contrast);
        }
        .form-card-btn-primary:hover { background: var(--primary-600); }
        .form-card-btn-success {
            background: #10b981; color: white;
        }
        .form-card-btn-success:hover { background: #059669; }
        .form-card-btn-warning {
            background: #f59e0b; color: white;
        }
        .form-card-btn-warning:hover { background: #d97706; }
        .menu-btn { opacity: 1; }
        .filter-tab {
            padding: 0.4rem 0.875rem;
            border-radius: 9999px;
            font-size: 0.8125rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s;
            border: 1.5px solid var(--surface-border);
            background: var(--surface-card);
            color: var(--text-color-secondary);
            white-space: nowrap;
        }
        .filter-tab:hover { background: var(--surface-hover); }
        .filter-tab.active {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: var(--primary-contrast);
        }
    `],
    template: `
        <!-- Card única: header + filtros -->
        <div class="mb-6">
            <div class="dashboard-welcome-card">
                <div class="p-4">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div class="dashboard-welcome-icon">
                                <i class="pi pi-file text-xl"></i>
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-tight mb-0">Formularios</h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0">Administrá los formularios de este workspace</p>
                            </div>
                        </div>
                        <button
                            class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all shrink-0"
                            (click)="openCreate()">
                            <i class="pi pi-plus"></i>
                            Nuevo Formulario
                        </button>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-surface-700">
                        <div class="flex items-center gap-2 flex-wrap">
                            <button class="filter-tab" [class.active]="activeTab() === 'all'"
                                (click)="activeTab.set('all')">
                                Todos ({{ allForms().length }})
                            </button>
                            <button class="filter-tab" [class.active]="activeTab() === 'draft'"
                                (click)="activeTab.set('draft')">
                                Borradores ({{ draftForms().length }})
                            </button>
                            <button class="filter-tab" [class.active]="activeTab() === 'published'"
                                (click)="activeTab.set('published')">
                                Publicados ({{ publishedForms().length }})
                            </button>
                        </div>
                        <div class="flex-1 min-w-0 sm:max-w-xs relative">
                            <span class="absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none z-10">
                                <i class="pi pi-search text-gray-400 text-sm"></i>
                            </span>
                            <input type="text" pInputText
                                class="w-full pl-10 text-sm"
                                placeholder="Buscar formularios..."
                                [ngModel]="searchQuery()"
                                (ngModelChange)="searchQuery.set($event)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Form Cards -->
        @if (filteredForms().length === 0) {
            <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-surface-700 py-16 bg-gray-50/50 dark:bg-surface-800/30">
                <div class="w-14 h-14 rounded-xl bg-gray-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                    <i class="pi pi-file text-gray-400 text-2xl"></i>
                </div>
                @if (activeTab() === 'all') {
                    <p class="text-sm font-medium text-gray-700 mb-1">Sin formularios</p>
                    <p class="text-xs text-gray-400 mb-4">Creá el primer formulario de este workspace.</p>
                    <button
                        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                        (click)="openCreate()">
                        <i class="pi pi-plus"></i> Nuevo Formulario
                    </button>
                } @else {
                    <p class="text-sm text-gray-400">No hay formularios en esta categoría.</p>
                }
            </div>
        } @else {
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                @for (form of filteredForms(); track form.id) {
                    <div class="form-card">
                        <!-- Status bar -->
                        <div class="h-1.5 flex-shrink-0"
                            [style.background]="form.status === 'published' ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #6366f1, #4f46e5)'"></div>
                        <div class="p-5 flex flex-col flex-1 min-h-0">
                            <!-- Header: título + badge -->
                            <div class="flex items-start justify-between gap-2 mb-3">
                                <div class="min-w-0 flex-1">
                                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 block mb-1 leading-snug">
                                        <button type="button"
                                            class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
                                            (click)="goToEditor(form)">
                                            {{ form.name }}
                                        </button>
                                    </h3>
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                                        [class]="form.status === 'published'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'">
                                        <span class="w-1.5 h-1.5 rounded-full"
                                            [class]="form.status === 'published' ? 'bg-emerald-500' : 'bg-indigo-500'"></span>
                                        {{ form.status === 'published' ? 'Publicado' : 'Borrador' }}
                                    </span>
                                </div>
                            </div>

                            <!-- Descripción -->
                            @if (form.description) {
                                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{{ form.description }}</p>
                            }

                            <!-- Stats row -->
                            <div class="mt-auto pt-4 flex items-center justify-between flex-wrap gap-2">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="form-card-stat">
                                        <i class="pi pi-folder text-blue-500"></i>
                                        {{ form.sections.length }} {{ form.sections.length === 1 ? 'sección' : 'secciones' }}
                                    </span>
                                    <span class="form-card-stat">
                                        <i class="pi pi-question-circle text-emerald-500"></i>
                                        {{ countQuestions(form) }} {{ countQuestions(form) === 1 ? 'pregunta' : 'preguntas' }}
                                    </span>
                                </div>
                                <span class="form-card-stat">
                                    <i class="pi pi-calendar text-amber-500"></i>
                                    {{ formatDate(form.updatedAt) }}
                                </span>
                            </div>

                            <!-- Action buttons -->
                            <div class="mt-4 pt-4 flex items-center gap-2 border-t border-gray-100 dark:border-surface-700">
                                <button class="form-card-btn form-card-btn-primary"
                                    (click)="goToEditor(form)">
                                    <i class="pi pi-pencil"></i> Editar
                                </button>
                                @if (form.status === 'published') {
                                    <button class="form-card-btn form-card-btn-warning"
                                        (click)="toggleStatus(form)">
                                        <i class="pi pi-eye-slash"></i> Despublicar
                                    </button>
                                } @else {
                                    <button class="form-card-btn form-card-btn-success"
                                        (click)="toggleStatus(form)">
                                        <i class="pi pi-send"></i> Publicar
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        }

        <!-- ── Create / Edit Dialog ───────────────────────────────────── -->
        <p-dialog
            [(visible)]="dialogVisible"
            [header]="editingForm() ? 'Editar formulario' : 'Nuevo formulario'"
            [modal]="true"
            [draggable]="false"
            [resizable]="false"
            styleClass="w-full max-w-md"
            (onHide)="resetDialog()">

            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {{ editingForm() ? 'Edita el nombre y descripción.' : 'Crea un nuevo formulario dentro de este workspace.' }}
            </p>

            <form [formGroup]="dlgForm" class="space-y-4">
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre <span class="text-red-500">*</span>
                    </label>
                    <input pInputText formControlName="name"
                        placeholder="Ej: Encuesta de Satisfacción"
                        class="w-full" autofocus />
                    @if (dlgForm.controls.name.invalid && dlgForm.controls.name.touched) {
                        <small class="text-red-500 text-xs">El nombre es requerido</small>
                    }
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción <span class="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <textarea pTextarea formControlName="description"
                        placeholder="Describe brevemente el formulario..."
                        rows="3" class="w-full text-sm"></textarea>
                </div>
            </form>

            <ng-template pTemplate="footer">
                <div class="flex gap-2 justify-end">
                    <button type="button"
                        class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-surface-600 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors"
                        (click)="dialogVisible = false">
                        Cancelar
                    </button>
                    <button type="button"
                        class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        [disabled]="dlgForm.invalid"
                        (click)="saveForm()">
                        {{ editingForm() ? 'Guardar' : 'Crear formulario' }}
                    </button>
                </div>
            </ng-template>
        </p-dialog>

        <p-toast />
        <p-confirmDialog />

    `
})
export class FormListComponent implements OnInit {
    readonly workspaceId = input<string>('');

    private readonly fbService = inject(FormBuilderService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    readonly activeTab = signal<FilterTab>('all');
    readonly searchQuery = signal('');
    readonly editingForm = signal<Form | null>(null);
    dialogVisible = false;
    readonly isSaving = signal(false);

    readonly allForms = computed(() => this.fbService.getFormsForWorkspace(this.workspaceId()));
    readonly draftForms = computed(() => this.allForms().filter(f => f.status === 'draft'));
    readonly publishedForms = computed(() => this.allForms().filter(f => f.status === 'published'));
    readonly filteredForms = computed(() => {
        let list: Form[];
        switch (this.activeTab()) {
            case 'draft':     list = this.draftForms(); break;
            case 'published': list = this.publishedForms(); break;
            default:          list = this.allForms(); break;
        }
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return list;
        return list.filter(f =>
            f.name.toLowerCase().includes(q) ||
            (f.description ?? '').toLowerCase().includes(q)
        );
    });

    readonly dlgForm = this.fb.nonNullable.group({
        name:        ['', Validators.required],
        description: ['']
    });

    ngOnInit(): void {}

    countQuestions(form: Form): number {
        return form.sections.reduce((acc, s) => acc + s.questions.length, 0);
    }

    formatDate(iso: string): string {
        const d = new Date(iso);
        return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    goToEditor(form: Form): void {
        this.router.navigate(['/admin/workspaces', this.workspaceId(), 'forms', form.id]);
    }

    openCreate(): void {
        this.editingForm.set(null);
        this.dlgForm.reset({ name: '', description: '' });
        this.dialogVisible = true;
    }

    openEdit(form: Form): void {
        this.editingForm.set(form);
        this.dlgForm.reset({ name: form.name, description: form.description ?? '' });
        this.dialogVisible = true;
    }

    resetDialog(): void {
        this.editingForm.set(null);
    }

    saveForm(): void {
        if (this.dlgForm.invalid) { this.dlgForm.markAllAsTouched(); return; }
        const { name, description } = this.dlgForm.getRawValue();
        const editing = this.editingForm();

        if (editing) {
            this.fbService.updateForm(this.workspaceId(), editing.id, { name, description });
            this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: `"${name}" actualizado.` });
        } else {
            const id = this.fbService.addForm(this.workspaceId(), name, description);
            this.messageService.add({ severity: 'success', summary: 'Creado', detail: `Formulario "${name}" creado.` });
            this.dialogVisible = false;
            // Navigate directly to editor
            setTimeout(() => this.router.navigate(['/admin/workspaces', this.workspaceId(), 'forms', id]), 200);
            return;
        }
        this.dialogVisible = false;
    }

    toggleStatus(form: Form): void {
        this.fbService.toggleFormStatus(this.workspaceId(), form.id);
        const newStatus = form.status === 'published' ? 'Borrador' : 'Publicado';
        this.messageService.add({ severity: 'success', summary: newStatus, detail: `"${form.name}" cambiado a ${newStatus}.` });
    }

    duplicate(form: Form): void {
        this.fbService.duplicateForm(this.workspaceId(), form.id);
        this.messageService.add({ severity: 'success', summary: 'Duplicado', detail: `"${form.name}" duplicado.` });
    }

    confirmDelete(form: Form): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar el formulario "${form.name}"? Esta acción no se puede deshacer.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.fbService.deleteForm(this.workspaceId(), form.id);
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: `"${form.name}" eliminado.` });
            }
        });
    }
}
