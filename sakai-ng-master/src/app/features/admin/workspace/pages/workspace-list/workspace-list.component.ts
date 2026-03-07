import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
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
import { Workspace, WORKSPACE_COLORS, WORKSPACE_ICONS } from '../../models/workspace.model';
import { WorkspaceService } from '../../services/workspace.service';
import { FormBuilderService } from '../../features/form-builder/services/form-builder.service';

@Component({
    selector: 'app-workspace-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService],
    imports: [
        RouterModule, FormsModule, ReactiveFormsModule,
        ButtonModule, DialogModule, InputTextModule, TextareaModule,
        ToastModule, ConfirmDialogModule, TooltipModule
    ],
    styles: [`
        .menu-btn { opacity: 1; }
        .color-dot {
            width: 2rem; height: 2rem;
            border-radius: 50%;
            border: 3px solid transparent;
            cursor: pointer;
            transition: transform 0.15s, border-color 0.15s;
        }
        .color-dot:hover { transform: scale(1.15); }
        .color-dot.selected { border-color: #1e293b; }
        .icon-btn {
            border: 2px solid transparent;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            cursor: pointer;
            transition: all 0.15s;
            background: #f1f5f9;
            font-size: 0.8rem;
            font-weight: 500;
            color: #64748b;
            white-space: nowrap;
        }
        .icon-btn:hover { background: #e2e8f0; }
        .icon-btn.selected { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; }
    `],
    template: `
        <!-- Header (Apollo-style, igual que dashboard) -->
        <div class="mb-8">
            <div class="dashboard-welcome-card">
                <div class="p-6">
                    <div class="flex items-center gap-5">
                        <div class="dashboard-welcome-icon">
                            <i class="pi pi-th-large text-2xl"></i>
                        </div>
                        <div class="flex-1">
                            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">
                                Espacios de Trabajo
                            </h1>
                            <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                Gestiona tus workspaces y organiza tus formularios.
                            </p>
                        </div>
                        <button type="button" class="dashboard-welcome-badge flex items-center gap-2"
                            (click)="openCreate()">
                            <i class="pi pi-plus text-sm"></i>
                            <span class="text-sm font-semibold">Nuevo Workspace</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats (Apollo-style) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="dashboard-stat-card">
                <div class="flex items-center justify-between mb-4">
                    <div class="p-3 rounded-xl bg-blue-100 dark:bg-blue-950">
                        <i class="pi pi-th-large text-lg text-blue-600"></i>
                    </div>
                    <span class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ workspaces().length }}</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Espacios creados</p>
            </div>
            <div class="dashboard-stat-card">
                <div class="flex items-center justify-between mb-4">
                    <div class="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950">
                        <i class="pi pi-file text-lg text-emerald-600"></i>
                    </div>
                    <span class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ totalForms() }}</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Formularios totales</p>
            </div>
            <div class="dashboard-stat-card">
                <div class="flex items-center justify-between mb-4">
                    <div class="p-3 rounded-xl bg-amber-100 dark:bg-amber-950">
                        <i class="pi pi-check-circle text-lg text-amber-600"></i>
                    </div>
                    <span class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ totalPublished() }}</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Formularios publicados</p>
            </div>
            <div class="dashboard-stat-card">
                <div class="flex items-center justify-between mb-4">
                    <div class="p-3 rounded-xl bg-violet-100 dark:bg-violet-950">
                        <i class="pi pi-users text-lg text-violet-600"></i>
                    </div>
                    <span class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ totalMembers() }}</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Miembros</p>
            </div>
        </div>

        <!-- Sección Espacios -->
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-5">
                <div class="dashboard-section-icon">
                    <i class="pi pi-folder-open text-sm"></i>
                </div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Espacios</h2>
            </div>

        <!-- Workspace Grid -->
        @if (isLoading()) {
            <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                @for (i of [1,2,3]; track i) {
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                        <div class="h-1 bg-gray-200"></div>
                        <div class="p-5">
                            <div class="flex items-start gap-3">
                                <div class="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                                <div class="flex-1">
                                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div class="h-3 bg-gray-100 rounded w-full mb-1"></div>
                                    <div class="h-3 bg-gray-100 rounded w-2/3"></div>
                                </div>
                            </div>
                            <div class="mt-4 flex gap-2">
                                <div class="h-5 bg-gray-100 rounded-full w-24"></div>
                                <div class="h-5 bg-gray-100 rounded-full w-20"></div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        } @else if (workspaces().length === 0) {
            <!-- Empty state -->
            <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20">
                <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i class="pi pi-th-large text-gray-400 text-2xl"></i>
                </div>
                <p class="text-base font-medium text-gray-700 mb-1">Sin espacios de trabajo</p>
                <p class="text-sm text-gray-400 mb-5">Crea tu primer workspace para comenzar.</p>
                <button
                    class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    (click)="openCreate()">
                    <i class="pi pi-plus text-xs"></i> Crear Workspace
                </button>
            </div>
        } @else {
            <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                @for (ws of workspaces(); track ws.id) {
                    <div class="workspace-card relative"
                        (click)="goTo(ws)">

                        <!-- Colored top border -->
                        <div class="h-1 shrink-0" [style.background-color]="ws.color"></div>

                        <div class="p-5 flex flex-col flex-1 min-h-0">
                            <div class="flex items-start justify-between gap-2 flex-1">
                                <!-- Icon + info -->
                                <div class="flex items-start gap-3 min-w-0">
                                    <div class="flex w-10 h-10 shrink-0 items-center justify-center rounded-lg"
                                        [style.background-color]="ws.color + '20'"
                                        [style.color]="ws.color">
                                        <i [class]="ws.icon + ' text-lg'"></i>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                                            {{ ws.name }}
                                        </h3>
                                        @if (ws.description) {
                                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                {{ ws.description }}
                                            </p>
                                        }
                                    </div>
                                </div>

                                <!-- Three-dot menu - siempre visible -->
                                <div class="menu-btn relative shrink-0 z-10">
                                    <button
                                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-surface-700 hover:bg-gray-200 dark:hover:bg-surface-600 text-gray-600 dark:text-gray-300 transition-colors"
                                        (click)="$event.stopPropagation(); toggleMenu(ws)"
                                        pTooltip="Opciones" tooltipPosition="top">
                                        <i class="pi pi-ellipsis-v text-sm"></i>
                                    </button>
                                    @if (menuOpenFor() === ws.id) {
                                        <div class="absolute right-0 top-full mt-1 z-[100] bg-white dark:bg-surface-900 border border-gray-200 dark:border-surface-700 rounded-lg shadow-xl py-1 min-w-[140px]"
                                            (click)="$event.stopPropagation()">
                                            <button
                                                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-800 text-left"
                                                (click)="openEdit(ws); closeMenu()">
                                                <i class="pi pi-pencil text-xs"></i> Editar
                                            </button>
                                            <button
                                                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 text-left"
                                                (click)="confirmDelete(ws); closeMenu()">
                                                <i class="pi pi-trash text-xs"></i> Eliminar
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>

                            <!-- Stats - pegados al footer de la card -->
                            <div class="mt-auto pt-4 flex items-center gap-2 flex-wrap">
                                <span class="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-surface-800 px-2.5 py-1 rounded-full">
                                    <i class="pi pi-file text-xs"></i>
                                    {{ getFormCount(ws) }} {{ getFormCount(ws) === 1 ? 'formulario' : 'formularios' }}
                                </span>
                                @if (getPublishedCount(ws) > 0) {
                                    <span class="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                                        <i class="pi pi-check-circle text-xs"></i>
                                        {{ getPublishedCount(ws) }} {{ getPublishedCount(ws) === 1 ? 'publicado' : 'publicados' }}
                                    </span>
                                }
                                <span class="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-100 dark:bg-violet-950 dark:text-violet-300 px-2.5 py-1 rounded-full">
                                    <i class="pi pi-users text-xs"></i>
                                    {{ ws.membersCount }}
                                </span>
                            </div>
                        </div>
                    </div>
                }
            </div>
        }
        </div>

        <!-- ── Workspace Dialog (Create / Edit) ───────────────────────── -->
        <p-dialog
            [(visible)]="dialogVisible"
            [header]="editingWs() ? 'Editar Workspace' : 'Nuevo Workspace'"
            [modal]="true"
            [draggable]="false"
            [resizable]="false"
            styleClass="w-full max-w-md"
            (onHide)="resetDialog()">

            <form [formGroup]="form" (ngSubmit)="saveWorkspace()" class="space-y-4 mt-2">

                <!-- Nombre -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre <span class="text-red-500">*</span>
                    </label>
                    <input pInputText formControlName="name"
                        placeholder="Ej: Recursos Humanos"
                        (input)="autoSlug()"
                        class="w-full" />
                    @if (form.controls.name.invalid && form.controls.name.touched) {
                        <small class="text-red-500 text-xs">El nombre es requerido</small>
                    }
                </div>

                <!-- Descripción -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción <span class="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <textarea pTextarea formControlName="description"
                        placeholder="Describe el propósito de este workspace..."
                        rows="2" class="w-full text-sm"></textarea>
                </div>

                <!-- Color -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                    <div class="flex flex-wrap gap-2">
                        @for (c of colors; track c) {
                            <button type="button"
                                class="color-dot"
                                [class.selected]="selectedColor() === c"
                                [style.background-color]="c"
                                (click)="selectedColor.set(c)">
                            </button>
                        }
                    </div>
                </div>

                <!-- Icono -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Icono</label>
                    <div class="flex flex-wrap gap-2">
                        @for (ic of icons; track ic.value) {
                            <button type="button"
                                class="icon-btn"
                                [class.selected]="selectedIcon() === ic.value"
                                (click)="selectedIcon.set(ic.value)">
                                <i [class]="ic.value + ' mr-1'"></i>{{ ic.label }}
                            </button>
                        }
                    </div>
                </div>

                <!-- Preview -->
                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-surface-800 rounded-lg border border-gray-200 dark:border-surface-700">
                    <div class="flex w-10 h-10 items-center justify-center rounded-lg"
                        [style.background-color]="selectedColor() + '20'"
                        [style.color]="selectedColor()">
                        <i [class]="selectedIcon() + ' text-lg'"></i>
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-gray-800 dark:text-white truncate">
                            {{ form.controls.name.value || 'Nombre del workspace' }}
                        </p>
                        <p class="text-xs text-gray-400 truncate">{{ form.controls.description.value || 'Sin descripción' }}</p>
                    </div>
                    <div class="ml-auto shrink-0 h-5 w-1.5 rounded-full" [style.background-color]="selectedColor()"></div>
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
                        class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        [disabled]="form.invalid || isSaving()"
                        (click)="saveWorkspace()">
                        @if (isSaving()) { <i class="pi pi-spin pi-spinner mr-1"></i> }
                        {{ editingWs() ? 'Guardar cambios' : 'Crear workspace' }}
                    </button>
                </div>
            </ng-template>
        </p-dialog>

        <p-toast />
        <p-confirmDialog />

        <!-- Overlay para cerrar menú al hacer clic fuera (z-index menor que el dropdown) -->
        @if (menuOpenFor()) {
            <div class="fixed inset-0 z-[99]" (click)="closeMenu()" aria-hidden="true"></div>
        }
    `
})
export class WorkspaceListComponent implements OnInit {
    private readonly workspaceService = inject(WorkspaceService);
    private readonly fbService = inject(FormBuilderService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    readonly workspaces = this.workspaceService.workspaces;
    readonly isLoading = this.workspaceService.loading;

    readonly totalForms = computed(() =>
        this.workspaces().reduce((sum, ws) => sum + this.getFormCount(ws), 0)
    );
    readonly totalPublished = computed(() =>
        this.workspaces().reduce((sum, ws) => sum + this.getPublishedCount(ws), 0)
    );
    readonly totalMembers = computed(() =>
        this.workspaces().reduce((sum, ws) => sum + (ws.membersCount ?? 0), 0)
    );

    dialogVisible = false;
    readonly editingWs = signal<Workspace | null>(null);
    readonly isSaving = signal(false);
    readonly menuOpenFor = signal<string | null>(null);
    readonly selectedColor = signal<string>('#0ea5e9');
    readonly selectedIcon = signal<string>('pi pi-folder-open');

    readonly colors = [...WORKSPACE_COLORS];
    readonly icons = [
        { value: 'pi pi-folder-open', label: 'Carpeta' },
        { value: 'pi pi-users',       label: 'Usuarios' },
        { value: 'pi pi-clipboard',   label: 'Tareas' },
        { value: 'pi pi-phone',       label: 'Soporte' },
        { value: 'pi pi-file',        label: 'Docs' },
    ];

    readonly form = this.fb.nonNullable.group({
        name:        ['', Validators.required],
        slug:        [''],
        description: ['']
    });

    ngOnInit(): void {
        this.workspaceService.getAll().subscribe();
    }

    goTo(ws: Workspace): void {
        this.router.navigate(['/admin/workspaces', ws.id]);
    }

    toggleMenu(ws: Workspace): void {
        this.menuOpenFor.set(this.menuOpenFor() === ws.id ? null : ws.id);
    }

    closeMenu(): void {
        this.menuOpenFor.set(null);
    }

    openCreate(): void {
        this.editingWs.set(null);
        this.form.reset({ name: '', slug: '', description: '' });
        this.selectedColor.set('#0ea5e9');
        this.selectedIcon.set('pi pi-folder-open');
        this.dialogVisible = true;
    }

    openEdit(ws: Workspace): void {
        this.editingWs.set(ws);
        this.form.reset({ name: ws.name, slug: ws.slug, description: ws.description ?? '' });
        this.selectedColor.set(ws.color);
        this.selectedIcon.set(ws.icon);
        this.dialogVisible = true;
    }

    resetDialog(): void {
        this.editingWs.set(null);
        this.isSaving.set(false);
    }

    autoSlug(): void {
        const name = this.form.controls.name.value;
        const slug = name
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim().replace(/\s+/g, '-');
        this.form.controls.slug.setValue(slug, { emitEvent: false });
    }

    saveWorkspace(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        const { name, slug, description } = this.form.getRawValue();
        const color = this.selectedColor();
        const icon = this.selectedIcon();
        this.isSaving.set(true);

        const editing = this.editingWs();
        if (editing) {
            this.workspaceService.update(editing.id, { name, description, status: editing.status }).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Workspace "${name}" actualizado.` });
                    this.dialogVisible = false;
                    this.isSaving.set(false);
                }
            });
        } else {
            this.workspaceService.create({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), description, color, icon }).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Creado', detail: `Workspace "${name}" creado.` });
                    this.dialogVisible = false;
                    this.isSaving.set(false);
                }
            });
        }
    }

    getFormCount(ws: Workspace): number {
        return this.fbService.getFormsForWorkspace(ws.id).length || ws.formsCount;
    }

    getPublishedCount(ws: Workspace): number {
        return this.fbService.getFormsForWorkspace(ws.id).filter(f => f.status === 'published').length;
    }

    confirmDelete(ws: Workspace): void {
        this.confirmationService.confirm({
            message: `¿Eliminar el workspace <strong>${ws.name}</strong>? Esta acción es irreversible.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.workspaceService.delete(ws.id).subscribe({
                    next: () => this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: `"${ws.name}" eliminado.` })
                });
            }
        });
    }
}
