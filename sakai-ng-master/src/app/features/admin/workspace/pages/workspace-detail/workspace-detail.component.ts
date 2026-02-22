import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { Workspace, WorkspaceStatus, WORKSPACE_COLORS, WORKSPACE_ICONS } from '../../models/workspace.model';
import { WorkspaceService } from '../../services/workspace.service';
import { FormBuilderService } from '../../features/form-builder/services/form-builder.service';

interface TabItem { label: string; icon: string; route: string; }

@Component({
    selector: 'app-workspace-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [
        RouterModule, FormsModule, ReactiveFormsModule,
        DialogModule, ButtonModule, InputTextModule, TextareaModule, ToastModule, SelectModule
    ],
    styles: [`
        :host ::ng-deep a.active-tab {
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
        <!-- Back link -->
        <div class="flex items-center gap-2 mb-5">
            <a routerLink="/admin/workspaces"
                class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors no-underline">
                <i class="pi pi-arrow-left text-xs"></i>
                Workspaces
            </a>
        </div>

        @if (workspace(); as ws) {
            <!-- Workspace header -->
            <div class="bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 overflow-hidden mb-5 shadow-sm">
                <!-- Colored top bar -->
                <div class="h-1.5" [style.background-color]="ws.color || '#3b82f6'"></div>
                <div class="p-5">
                    <div class="flex items-start justify-between gap-4 flex-wrap">
                        <div class="flex items-start gap-4">
                            <!-- Icon -->
                            <div class="flex w-12 h-12 items-center justify-center rounded-xl shrink-0"
                                [style.background-color]="(ws.color || '#3b82f6') + '20'"
                                [style.color]="ws.color || '#3b82f6'">
                                <i [class]="(ws.icon || 'pi pi-th-large') + ' text-xl'"></i>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-0.5">{{ ws.name }}</h1>
                                @if (ws.description) {
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ ws.description }}</p>
                                }
                                <div class="flex items-center gap-3 mt-2 flex-wrap">
                                    <span class="inline-flex items-center gap-1 text-xs text-gray-400">
                                        <i class="pi pi-file text-xs"></i>
                                        {{ getFormCount(ws) }} formularios
                                    </span>
                                    <span class="inline-flex items-center gap-1 text-xs text-gray-400">
                                        <i class="pi pi-users text-xs"></i>
                                        {{ ws.membersCount }} miembros
                                    </span>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                        [class]="getStatusClass(ws.status)">
                                        {{ getStatusLabel(ws.status) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <!-- Edit button -->
                        <button
                            class="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-surface-600 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors shrink-0"
                            (click)="openEdit(ws)">
                            <i class="pi pi-pencil text-xs"></i>
                            Editar workspace
                        </button>
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

        <!-- Tab navigation -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-gray-100 dark:border-surface-700 mb-5 overflow-hidden shadow-sm">
            <nav class="flex overflow-x-auto">
                @for (tab of tabs; track tab.route) {
                    <a [routerLink]="tab.route" routerLinkActive="active-tab"
                        class="flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-blue-600 hover:border-blue-300 transition-all duration-150 whitespace-nowrap no-underline">
                        <i class="{{ tab.icon }} text-sm"></i>
                        {{ tab.label }}
                    </a>
                }
            </nav>
        </div>

        <!-- Tab content -->
        <router-outlet />

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
    `
})
export class WorkspaceDetailComponent implements OnInit {
    readonly workspaceId = input<string>('');

    private readonly workspaceService = inject(WorkspaceService);
    private readonly fbService = inject(FormBuilderService);
    private readonly fb = inject(FormBuilder);
    private readonly messageService = inject(MessageService);

    readonly workspace = this.workspaceService.selected;
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
        { label: 'Miembros',           icon: 'pi pi-users',    route: 'members'       },
        { label: 'Respuestas',         icon: 'pi pi-inbox',    route: 'submissions'   }
    ];

    ngOnInit(): void {
        const id = this.workspaceId();
        if (id) this.workspaceService.getById(id).subscribe();
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
