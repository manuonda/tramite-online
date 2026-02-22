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
            transition: box-shadow 0.2s, transform 0.15s;
        }
        .form-card:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.09);
            transform: translateY(-1px);
        }
        .form-card:hover .menu-btn { opacity: 1; }
        .menu-btn { opacity: 0; transition: opacity 0.15s; }
        .filter-tab {
            padding: 0.4rem 0.875rem;
            border-radius: 9999px;
            font-size: 0.8125rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s;
            border: 1.5px solid #e5e7eb;
            background: white;
            color: #6b7280;
            white-space: nowrap;
        }
        .filter-tab:hover { background: #f9fafb; }
        .filter-tab.active {
            background: #1d4ed8;
            border-color: #1d4ed8;
            color: white;
        }
    `],
    template: `
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
            <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Formularios</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Administrá los formularios de este workspace
                </p>
            </div>
            <button
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                (click)="openCreate()">
                <i class="pi pi-plus text-xs"></i>
                Nuevo Formulario
            </button>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-2 flex-wrap mb-6">
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

        <!-- Form Cards -->
        @if (filteredForms().length === 0) {
            <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <i class="pi pi-file text-gray-400 text-xl"></i>
                </div>
                @if (activeTab() === 'all') {
                    <p class="text-sm font-medium text-gray-700 mb-1">Sin formularios</p>
                    <p class="text-xs text-gray-400 mb-4">Creá el primer formulario de este workspace.</p>
                    <button
                        class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        (click)="openCreate()">
                        <i class="pi pi-plus text-xs"></i> Nuevo Formulario
                    </button>
                } @else {
                    <p class="text-sm text-gray-400">No hay formularios en esta categoría.</p>
                }
            </div>
        } @else {
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                @for (form of filteredForms(); track form.id) {
                    <div class="form-card bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 overflow-hidden">
                        <!-- Status color bar -->
                        <div class="h-1"
                            [style.background]="form.status === 'published' ? '#10b981' : '#d1d5db'"></div>
                        <div class="p-5">
                            <div class="flex items-start justify-between gap-2">
                                <!-- Icon + info -->
                                <div class="flex items-start gap-3">
                                    <div class="flex w-9 h-9 shrink-0 items-center justify-center rounded-lg"
                                        [class]="form.status === 'published'
                                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                                            : 'bg-gray-100 dark:bg-surface-800 text-gray-400'">
                                        <i class="pi pi-file text-sm"></i>
                                    </div>
                                    <div class="min-w-0">
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <button
                                                class="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate text-left"
                                                (click)="goToEditor(form)">
                                                {{ form.name }}
                                            </button>
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                                                [class]="form.status === 'published'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-surface-800 dark:text-gray-400'">
                                                {{ form.status === 'published' ? 'Publicado' : 'Borrador' }}
                                            </span>
                                        </div>
                                        @if (form.description) {
                                            <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ form.description }}</p>
                                        }
                                    </div>
                                </div>

                                <!-- Three-dot menu -->
                                <div class="menu-btn relative shrink-0">
                                    <button
                                        class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-surface-700 text-gray-400 hover:text-gray-600"
                                        (click)="toggleMenu(form)">
                                        <i class="pi pi-ellipsis-h text-sm"></i>
                                    </button>
                                    @if (menuOpenFor() === form.id) {
                                        <div class="absolute right-0 top-8 z-50 bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-700 rounded-lg shadow-lg py-1 min-w-[160px]">
                                            <button class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-800"
                                                (click)="goToEditor(form); closeMenu()">
                                                <i class="pi pi-pencil text-xs"></i> Editar
                                            </button>
                                            <button class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-800"
                                                (click)="openEdit(form); closeMenu()">
                                                <i class="pi pi-tag text-xs"></i> Renombrar
                                            </button>
                                            <button class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-800"
                                                (click)="duplicate(form); closeMenu()">
                                                <i class="pi pi-copy text-xs"></i> Duplicar
                                            </button>
                                            <hr class="my-1 border-gray-100 dark:border-surface-700">
                                            <button class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                (click)="confirmDelete(form); closeMenu()">
                                                <i class="pi pi-trash text-xs"></i> Eliminar
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>

                            <!-- Stats row -->
                            <div class="mt-4 flex items-center justify-between text-xs text-gray-400">
                                <div class="flex items-center gap-3">
                                    <span class="flex items-center gap-1">
                                        <i class="pi pi-list text-xs"></i>
                                        {{ form.sections.length }} {{ form.sections.length === 1 ? 'sección' : 'secciones' }}
                                    </span>
                                    <span class="text-gray-200">|</span>
                                    <span class="flex items-center gap-1">
                                        <i class="pi pi-question-circle text-xs"></i>
                                        {{ countQuestions(form) }} {{ countQuestions(form) === 1 ? 'pregunta' : 'preguntas' }}
                                    </span>
                                </div>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-calendar text-xs"></i>
                                    {{ formatDate(form.updatedAt) }}
                                </span>
                            </div>

                            <!-- Action buttons -->
                            <div class="mt-3 pt-3 border-t border-gray-100 dark:border-surface-700 flex items-center gap-2">
                                <button
                                    class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                                    (click)="goToEditor(form)">
                                    <i class="pi pi-pencil text-xs"></i> Editar
                                </button>
                                <button
                                    class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-surface-800 rounded-lg transition-colors"
                                    (click)="toggleStatus(form)">
                                    @if (form.status === 'published') {
                                        <i class="pi pi-eye-slash text-xs"></i> Despublicar
                                    } @else {
                                        <i class="pi pi-send text-xs"></i> Publicar
                                    }
                                </button>
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

        @if (menuOpenFor()) {
            <div class="fixed inset-0 z-40" (click)="closeMenu()"></div>
        }
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
    readonly menuOpenFor = signal<string | null>(null);
    readonly editingForm = signal<Form | null>(null);
    dialogVisible = false;
    readonly isSaving = signal(false);

    readonly allForms = computed(() => this.fbService.getFormsForWorkspace(this.workspaceId()));
    readonly draftForms = computed(() => this.allForms().filter(f => f.status === 'draft'));
    readonly publishedForms = computed(() => this.allForms().filter(f => f.status === 'published'));
    readonly filteredForms = computed(() => {
        switch (this.activeTab()) {
            case 'draft':     return this.draftForms();
            case 'published': return this.publishedForms();
            default:          return this.allForms();
        }
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

    toggleMenu(form: Form): void {
        this.menuOpenFor.set(this.menuOpenFor() === form.id ? null : form.id);
    }

    closeMenu(): void {
        this.menuOpenFor.set(null);
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
            message: `¿Eliminar el formulario <strong>${form.name}</strong>?`,
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
