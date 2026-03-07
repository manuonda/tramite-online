import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal, effect, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Workspace, WorkspaceStatus, WORKSPACE_COLORS, WORKSPACE_ICONS } from '../../models/workspace.model';
import { WorkspaceService } from '../../services/workspace.service';
import { FormBuilderService } from '../../features/form-builder/services/form-builder.service';

interface TabItem { label: string; icon: string; route: string; }

@Component({
    selector: 'app-workspace-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService],
    imports: [
        RouterModule, FormsModule, ReactiveFormsModule,
        DialogModule, ButtonModule, InputTextModule, TextareaModule, ToastModule, SelectModule,
        ConfirmDialogModule, TooltipModule, TabsModule
    ],
    styles: [`
        .workspace-header-card {
            background: var(--surface-card);
            border-radius: 16px;
            border: 1px solid var(--surface-border);
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .workspace-icon {
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 10px;
            background: linear-gradient(135deg, var(--ws-color) 0%, var(--ws-color) 100%);
            color: white;
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            flex-shrink: 0;
        }
        .ws-badge {
            display: inline-flex; align-items: center; gap: 0.25rem;
            padding: 0.2rem 0.5rem; border-radius: 9999px;
            font-size: 0.75rem; font-weight: 500;
        }
        .ws-badge-forms {
            background: #eff6ff; color: #1d4ed8;
        }
        :host-context(.dark) .ws-badge-forms { background: rgba(59,130,246,0.2); color: #93c5fd; }
        .ws-badge-members {
            background: #f5f3ff; color: #5b21b6;
        }
        :host-context(.dark) .ws-badge-members { background: rgba(139,92,246,0.2); color: #c4b5fd; }
        .ws-action-btn {
            display: inline-flex; align-items: center; gap: 0.375rem;
            padding: 0.35rem 0.75rem; border-radius: 8px;
            font-size: 0.8125rem; font-weight: 600;
            transition: all 0.15s; border: 1px solid;
        }
        .ws-action-edit {
            background: white; color: #4b5563; border-color: #e5e7eb;
        }
        .ws-action-edit:hover { background: #f9fafb; border-color: #d1d5db; color: #1f2937; }
        :host-context(.dark) .ws-action-edit { background: var(--surface-800); color: #e5e7eb; border-color: var(--surface-600); }
        :host-context(.dark) .ws-action-edit:hover { background: var(--surface-700); }
        .ws-action-disable {
            background: #fffbeb; color: #b45309; border-color: #fcd34d;
        }
        .ws-action-disable:hover { background: #fef3c7; color: #92400e; }
        :host-context(.dark) .ws-action-disable { background: rgba(245,158,11,0.15); color: #fbbf24; border-color: rgba(245,158,11,0.4); }
        .ws-action-enable {
            background: #ecfdf5; color: #047857; border-color: #6ee7b7;
        }
        .ws-action-enable:hover { background: #d1fae5; color: #065f46; }
        :host-context(.dark) .ws-action-enable { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.4); }
        .ws-action-delete {
            background: #fef2f2; color: #b91c1c; border-color: #fca5a5;
        }
        .ws-action-delete:hover { background: #fee2e2; color: #991b1b; }
        :host-context(.dark) .ws-action-delete { background: rgba(220,38,38,0.15); color: #f87171; border-color: rgba(220,38,38,0.4); }
        :host ::ng-deep .custom-tabs .p-tablist .p-tab[data-p-active="true"] {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
            font-weight: 600;
        }
        .color-swatch {
            width: 28px; height: 28px; border-radius: 50%;
            border: 2.5px solid transparent;
            cursor: pointer; transition: all 0.12s;
            display: flex; align-items: center; justify-content: center;
        }
        .color-swatch:hover { transform: scale(1.15); }
        .color-swatch.active { border-color: white; box-shadow: 0 0 0 2.5px currentColor; }
        .icon-swatch {
            width: 36px; height: 36px; border-radius: 8px;
            border: 1.5px solid #e5e7eb; background: #f9fafb;
            cursor: pointer; transition: all 0.12s;
            display: flex; align-items: center; justify-content: center;
            color: #6b7280;
        }
        .icon-swatch:hover { background: #f3f4f6; border-color: #d1d5db; color: #374151; }
        .icon-swatch.active { border-color: #3b82f6; background: #eff6ff; color: #3b82f6; }
    `],
    template: `
        @if (workspace(); as ws) {
            <!-- Header card mejorado -->
            <div class="mb-5">
                <div class="workspace-header-card">
                    <div class="p-3">
                        <div class="flex items-center gap-2 mb-2">
                            <a [routerLink]="['/admin/workspaces']"
                                class="inline-flex items-center justify-center p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all no-underline shrink-0"
                                pTooltip="Volver a espacios" tooltipPosition="bottom">
                                <i class="pi pi-arrow-left text-sm"></i>
                            </a>
                            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Espacio de Trabajo</span>
                        </div>
                        <div class="flex items-center gap-4 flex-wrap">
                            <div class="flex items-center gap-4 flex-1 min-w-0">
                                <!-- Icono principal -->
                                <div class="workspace-icon"
                                    [style.--ws-color]="ws.color || '#3b82f6'">
                                    <i [class]="(ws.icon || 'pi pi-th-large') + ' text-lg'"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h1 class="text-lg font-semibold text-gray-900 dark:text-white mb-0 tracking-tight">{{ ws.name }}</h1>
                                    @if (ws.description) {
                                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0 leading-tight">{{ ws.description }}</p>
                                    }
                                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span class="ws-badge ws-badge-forms">
                                            <i class="pi pi-file-edit"></i>
                                            {{ getFormCount(ws) }} formularios
                                        </span>
                                        <span class="ws-badge ws-badge-members">
                                            <i class="pi pi-users"></i>
                                            {{ ws.membersCount }} miembros
                                        </span>
                                        <span class="ws-badge"
                                            [class]="getStatusClass(ws.status)">
                                            {{ getStatusLabel(ws.status) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <!-- Acciones -->
                            <div class="flex items-center gap-2 shrink-0 relative z-10">
                                <button type="button" class="ws-action-btn ws-action-edit"
                                    (click)="openEdit(ws)"
                                    pTooltip="Editar nombre, descripción y configuración" tooltipPosition="top">
                                    <i class="pi pi-pencil"></i>
                                    Editar
                                </button>
                                <button type="button"
                                    [class]="ws.status === 'ACTIVE' ? 'ws-action-btn ws-action-disable' : 'ws-action-btn ws-action-enable'"
                                    (click)="ws.status === 'ACTIVE' ? confirmDisable(ws) : toggleStatus(ws)"
                                    [pTooltip]="ws.status === 'ACTIVE' ? 'Deshabilitar espacio' : 'Activar espacio'"
                                    tooltipPosition="top">
                                    <i [class]="ws.status === 'ACTIVE' ? 'pi pi-pause' : 'pi pi-play'"></i>
                                    {{ ws.status === 'ACTIVE' ? 'Deshabilitar' : 'Activar' }}
                                </button>
                                <button type="button" class="ws-action-btn ws-action-delete"
                                    (click)="confirmDelete(ws)"
                                    pTooltip="Eliminar workspace" tooltipPosition="top">
                                    <i class="pi pi-trash"></i>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        } @else if (isLoading()) {
            <div class="bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 p-5 mb-5 animate-pulse">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-gray-200 rounded-xl shrink-0"></div>
                    <div class="flex-1">
                        <div class="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div class="h-3 bg-gray-100 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        }

        <!-- Tab content -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-gray-100 dark:border-surface-700 mb-5 overflow-hidden shadow-sm">
            <p-tabs [value]="activeTabValue()" (valueChange)="onTabChange($event)" class="custom-tabs">
                <p-tablist class="border-b border-gray-200 dark:border-surface-700 px-6">
                    @for (tab of tabs; track tab.route) {
                        <p-tab [value]="tab.route" class="relative">
                            <div class="flex items-center gap-2">
                                <i [class]="tab.icon + ' text-lg'"></i>
                                <span class="font-medium">{{ tab.label }}</span>
                            </div>
                        </p-tab>
                    }
                </p-tablist>
                <p-tabpanels class="min-h-96">
                    <p-tabpanel [value]="activeTabValue()" class="p-0">
                        <div class="p-6">
                            <router-outlet />
                        </div>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>

        <!-- ── Edit Workspace Dialog ─────────────────────────────── -->
        <p-dialog
            [(visible)]="editDialogVisible"
            header="Editar Workspace"
            [modal]="true"
            [draggable]="false"
            [resizable]="false"
            styleClass="w-full max-w-lg"
            (onHide)="resetEditDialog()">

            <div class="space-y-5 py-1">
                <!-- Name -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre <span class="text-red-500">*</span>
                    </label>
                    <input pInputText [formControl]="editForm.controls.name" class="w-full"
                        placeholder="Nombre del workspace" />
                    @if (editForm.controls.name.invalid && editForm.controls.name.touched) {
                        <small class="text-red-500 flex items-center gap-1">
                            <i class="pi pi-exclamation-triangle text-xs"></i> El nombre es requerido
                        </small>
                    }
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción <span class="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <textarea pTextarea [formControl]="editForm.controls.description"
                        class="w-full" rows="2"
                        placeholder="Descripción del workspace..."></textarea>
                </div>

                <!-- Status -->
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                    <div class="flex gap-2">
                        @for (opt of statusOptions; track opt.value) {
                            <button
                                class="flex-1 py-2 px-3 rounded-lg border-1.5 text-sm font-medium transition-all"
                                [style.border-width]="'1.5px'"
                                [style.border-color]="editForm.controls.status.value === opt.value ? opt.color : '#e5e7eb'"
                                [style.background]="editForm.controls.status.value === opt.value ? opt.color + '15' : 'transparent'"
                                [style.color]="editForm.controls.status.value === opt.value ? opt.color : '#6b7280'"
                                (click)="editForm.controls.status.setValue(opt.value)">
                                {{ opt.label }}
                            </button>
                        }
                    </div>
                </div>

                <!-- Color -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                    <div class="flex gap-2 flex-wrap">
                        @for (color of workspaceColors; track color) {
                            <button class="color-swatch"
                                [style.background-color]="color"
                                [style.color]="color"
                                [class.active]="editForm.controls.color.value === color"
                                (click)="editForm.controls.color.setValue(color)"
                                [title]="color">
                                @if (editForm.controls.color.value === color) {
                                    <i class="pi pi-check text-white" style="font-size:0.6rem;"></i>
                                }
                            </button>
                        }
                    </div>
                </div>

                <!-- Icon -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Ícono</label>
                    <div class="flex gap-2 flex-wrap">
                        @for (icon of workspaceIcons; track icon) {
                            <button class="icon-swatch"
                                [class.active]="editForm.controls.icon.value === icon"
                                (click)="editForm.controls.icon.setValue(icon)"
                                [title]="icon">
                                <i [class]="icon + ' text-base'"></i>
                            </button>
                        }
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex gap-2 justify-end">
                    <p-button label="Cancelar" severity="secondary" [outlined]="true"
                        (click)="resetEditDialog()" />
                    <p-button label="Guardar cambios" icon="pi pi-check"
                        [loading]="isSaving()"
                        [disabled]="editForm.invalid"
                        (click)="saveEdit()" />
                </div>
            </ng-template>
        </p-dialog>

        <p-toast />
        <p-confirmDialog />
    `
})
export class WorkspaceDetailComponent implements OnInit {
    readonly workspaceId = input<string>('');

    private readonly workspaceService = inject(WorkspaceService);
    private readonly fbService = inject(FormBuilderService);
    private readonly fb = inject(FormBuilder);
    private readonly messageService = inject(MessageService);
    private readonly breadcrumbSvc = inject(BreadcrumbService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly _routeUrl = signal(this.router.url);

    readonly workspace = this.workspaceService.selected;
    readonly activeTabValue = computed(() => {
        const url = this._routeUrl();
        const id = this.workspaceId();
        if (!id) return 'forms';
        const base = `/admin/workspaces/${id}/`;
        if (!url.startsWith(base)) return 'forms';
        const rest = url.slice(base.length).split('/')[0] || '';
        return ['forms', 'domain-values', 'members'].includes(rest) ? rest : 'forms';
    });
    readonly isLoading = this.workspaceService.loading;
    readonly isSaving = signal(false);
    editDialogVisible = false;

    readonly workspaceColors = [...WORKSPACE_COLORS];
    readonly workspaceIcons = [...WORKSPACE_ICONS];

    readonly statusOptions = [
        { value: 'ACTIVE' as WorkspaceStatus,   label: 'Activo',    color: '#10b981' },
        { value: 'INACTIVE' as WorkspaceStatus, label: 'Inactivo',  color: '#6b7280' },
        { value: 'ARCHIVED' as WorkspaceStatus, label: 'Archivado', color: '#f59e0b' },
    ];

    readonly editForm = this.fb.nonNullable.group({
        name:        ['', Validators.required],
        description: [''],
        status:      ['ACTIVE' as WorkspaceStatus],
        color:       ['#0ea5e9'],
        icon:        ['pi pi-folder-open'],
    });

    readonly tabs: TabItem[] = [
        { label: 'Formularios',        icon: 'pi pi-file',     route: 'forms'         },
        { label: 'Valores de Dominio', icon: 'pi pi-database', route: 'domain-values' },
        { label: 'Miembros',           icon: 'pi pi-users',    route: 'members'       }
    ];

    onTabChange(route: string | number | undefined): void {
        const id = this.workspaceId();
        const path = typeof route === 'string' ? route : 'forms';
        if (id && path) this.router.navigate(['/admin/workspaces', id, path]);
    }

    constructor() {
        effect(() => {
            const ws = this.workspace();
            const id = this.workspaceId();
            if (ws && id) {
                this.breadcrumbSvc.setCustomLabel(ws.name, ['/admin/workspaces', id]);
            }
        });
    }

    ngOnInit(): void {
        const id = this.workspaceId();
        if (id) this.workspaceService.getById(id).subscribe();

        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => this._routeUrl.set(this.router.url));
    }

    openEdit(ws: Workspace): void {
        this.editForm.reset({
            name:        ws.name,
            description: ws.description ?? '',
            status:      ws.status,
            color:       ws.color || '#0ea5e9',
            icon:        ws.icon || 'pi pi-folder-open',
        });
        this.editDialogVisible = true;
    }

    saveEdit(): void {
        if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
        const ws = this.workspace();
        if (!ws) return;

        this.isSaving.set(true);
        const { name, description, status, color, icon } = this.editForm.getRawValue();

        this.workspaceService.update(ws.id, { name, description: description || undefined, status, color, icon })
            .subscribe({
                next: () => {
                    this.isSaving.set(false);
                    this.editDialogVisible = false;
                    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Workspace actualizado.' });
                },
                error: () => {
                    this.isSaving.set(false);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar.' });
                }
            });
    }

    resetEditDialog(): void {
        this.editDialogVisible = false;
        this.editForm.reset();
    }

    toggleStatus(ws: Workspace): void {
        const newStatus: WorkspaceStatus = ws.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        this.workspaceService.update(ws.id, { status: newStatus }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: newStatus === 'ACTIVE' ? 'Espacio activado.' : 'Espacio deshabilitado.'
                });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado.' });
            }
        });
    }

    confirmDisable(ws: Workspace): void {
        this.confirmationService.confirm({
            message: `¿Deshabilitar "${ws.name}"? No se mostrará a los usuarios. Los datos se conservan y podés reactivarlo en cualquier momento.`,
            header: 'Deshabilitar Espacio de Trabajo',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-warning',
            acceptLabel: 'Deshabilitar',
            rejectLabel: 'Cancelar',
            accept: () => this.toggleStatus(ws)
        });
    }

    confirmDelete(ws: Workspace): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar el workspace "${ws.name}"? Esta acción no se puede deshacer.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteWorkspace(ws.id)
        });
    }

    deleteWorkspace(id: string): void {
        this.workspaceService.delete(id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Workspace eliminado.' });
                this.router.navigate(['/admin/workspaces']);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar.' });
            }
        });
    }

    getFormCount(ws: Workspace): number {
        return this.fbService.getFormsForWorkspace(ws.id).length || ws.formsCount;
    }

    getStatusLabel(status: WorkspaceStatus): string {
        return { ACTIVE: 'Activo', INACTIVE: 'Inactivo', ARCHIVED: 'Archivado' }[status];
    }

    getStatusClass(status: WorkspaceStatus): string {
        return {
            ACTIVE:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
            INACTIVE: 'bg-gray-100 text-gray-500 dark:bg-surface-800 dark:text-gray-400',
            ARCHIVED: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
        }[status];
    }
}
