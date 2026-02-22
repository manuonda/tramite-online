import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Workspace, WorkspaceFilter, WorkspaceStatus } from '../../models/workspace.model';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
    selector: 'app-workspace-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService],
    imports: [
        RouterModule, FormsModule,
        BreadcrumbModule, ButtonModule, TableModule, TagModule,
        PanelModule, InputTextModule, IconFieldModule, InputIconModule,
        ToastModule, ConfirmDialogModule, TooltipModule
    ],
    styles: [`
        ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: 1rem 1.25rem;
        }

        ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            padding: 0.875rem 1.25rem;
        }

        ::ng-deep .breadcrumb-custom {
            .p-breadcrumb {
                background: transparent !important;
                border: none !important;
                padding: 0 !important;

                .p-breadcrumb-list {
                    margin: 0;
                    padding: 0;

                    .p-breadcrumb-item {
                        .p-breadcrumb-item-link {
                            color: #6b7280 !important;
                            text-decoration: none;
                            font-weight: 500;
                            padding: 0.5rem 0.75rem;
                            border-radius: 6px;
                            transition: all 0.3s ease;

                            &:hover {
                                color: #374151 !important;
                                background-color: rgba(59, 130, 246, 0.1);
                                transform: translateY(-1px);
                                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
                            }

                            .p-breadcrumb-item-icon {
                                color: #3b82f6 !important;
                                margin-right: 0.5rem;
                                transition: all 0.3s ease;
                            }
                        }

                        .p-breadcrumb-item-separator {
                            color: #9ca3af !important;
                            margin: 0 0.5rem;
                        }

                        &:last-child .p-breadcrumb-item-link {
                            color: #3b82f6 !important;
                            font-weight: 600;
                            background-color: rgba(59, 130, 246, 0.1);
                            cursor: default;

                            &:hover {
                                transform: none;
                                box-shadow: none;
                            }
                        }

                        &:first-child .p-breadcrumb-item-link {
                            &:hover .p-breadcrumb-item-icon {
                                color: #1d4ed8 !important;
                                transform: scale(1.1);
                            }
                        }
                    }
                }
            }
        }
    `],
    template: `
        <!-- Breadcrumb -->
        <div class="mb-6">
            <div class="bg-gray-50 dark:bg-surface-800 rounded-lg p-3 border border-gray-200 dark:border-surface-700 shadow-sm">
                <p-breadcrumb
                    class="breadcrumb-custom"
                    [model]="breadcrumbItems"
                    [home]="home"
                    [style]="{'background': 'transparent', 'border': 'none', 'padding': '0'}" />
            </div>
        </div>

        <!-- Header principal -->
        <div class="mb-8">
            <div class="flex items-center gap-4">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full text-white shadow-lg">
                    <i class="pi pi-th-large text-lg"></i>
                </div>
                <div>
                    <span class="text-xl font-bold text-gray-800 dark:text-white">Gestión de Workspaces</span>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Espacios de trabajo y sus formularios</p>
                </div>
            </div>
        </div>

        <!-- Filtros de búsqueda -->
        <p-panel
            [collapsed]="panelCollapsed()"
            [toggleable]="true"
            class="mb-4"
            (collapsedChange)="onPanelToggle($event)">
            <ng-template pTemplate="header">
                <div
                    class="flex items-center gap-2 cursor-pointer hover:text-blue-700 transition-colors duration-200 w-full"
                    tabindex="0"
                    (click)="togglePanel()"
                    (keydown.enter)="togglePanel()"
                    (keydown.space)="togglePanel()">
                    <i class="pi pi-filter text-blue-600"></i>
                    <span class="font-medium text-gray-800 dark:text-white">Filtros de Búsqueda</span>
                </div>
            </ng-template>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                <div class="field">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                    <input pInputText type="text" [(ngModel)]="filter.name"
                        placeholder="Filtrar por nombre..." class="w-full" />
                </div>
                <div class="field">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select [(ngModel)]="filter.status" class="p-inputtext w-full">
                        <option value="">Todos</option>
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        <option value="ARCHIVED">Archivado</option>
                    </select>
                </div>
                <div class="field flex items-end gap-2">
                    <p-button label="Buscar" icon="pi pi-search" size="small" (onClick)="buscar()" />
                    <p-button label="Limpiar" icon="pi pi-filter-slash" severity="secondary"
                        [outlined]="true" size="small" (onClick)="limpiar()" />
                </div>
            </div>
        </p-panel>

        <!-- Tabla -->
        <div class="card border-l-4 border-blue-500 shadow-lg overflow-hidden">
            <p-table
                [value]="workspaces()"
                [tableStyle]="{'min-width': '60rem'}"
                styleClass="p-datatable-striped"
                [loading]="isLoading()"
                [paginator]="true" [rows]="10"
                [rowsPerPageOptions]="[10, 20, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} workspaces"
                [globalFilterFields]="['name', 'slug', 'status']" #dt>

                <ng-template pTemplate="caption">
                    <div class="p-4 border-b border-gray-200 dark:border-surface-700 shadow-sm">
                        <div class="flex items-center justify-between flex-wrap gap-4">
                            <div class="flex items-center gap-3">
                                <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-full text-white shadow-lg">
                                    <i class="pi pi-table text-lg"></i>
                                </div>
                                <div>
                                    <h4 class="text-xl font-semibold text-gray-800 dark:text-white m-0">
                                        Listado de Workspaces
                                    </h4>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <p-button
                                    label="Nuevo Workspace"
                                    icon="pi pi-plus"
                                    severity="success"
                                    class="font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                    size="small"
                                    routerLink="/admin/workspaces/create" />
                                <p-iconfield>
                                    <p-inputicon styleClass="pi pi-search" />
                                    <input pInputText type="text"
                                        (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                                        placeholder="Buscar en tabla..."
                                        class="text-sm shadow-sm border-2 border-gray-200 focus:border-blue-500 transition-all duration-200" />
                                </p-iconfield>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr class="bg-gray-50 dark:bg-surface-800">
                        <th class="font-semibold text-gray-700 dark:text-gray-300" style="min-width:4rem">ID</th>
                        <th pSortableColumn="name" class="font-semibold text-gray-700 dark:text-gray-300" style="min-width:16rem">
                            Nombre <p-sortIcon field="name" />
                        </th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300" style="min-width:12rem">Slug</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300 text-center" style="min-width:8rem">Formularios</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300 text-center" style="min-width:8rem">Miembros</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300 text-center" style="min-width:10rem">Estado</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300 text-center" style="min-width:12rem">
                            <div class="flex items-center justify-center gap-2">
                                <i class="pi pi-cog text-gray-500"></i> Acciones
                            </div>
                        </th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-ws let-rowIndex="rowIndex">
                    <tr class="hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors duration-200"
                        [class.bg-blue-50]="rowIndex % 2 === 0">
                        <td class="font-mono text-sm text-gray-600 dark:text-gray-400">
                            <span class="bg-gray-100 dark:bg-surface-700 px-2 py-1 rounded text-xs">#{{ ws.id }}</span>
                        </td>
                        <td class="font-medium text-gray-800 dark:text-white">
                            <div class="flex items-center gap-2">
                                <div class="bg-blue-100 dark:bg-blue-950 p-2 rounded-full">
                                    <i class="pi pi-th-large text-blue-600 text-sm"></i>
                                </div>
                                <div>
                                    <span class="block font-semibold">{{ ws.name }}</span>
                                    @if (ws.description) {
                                        <span class="text-xs text-gray-400 line-clamp-1">{{ ws.description }}</span>
                                    }
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="bg-gray-100 dark:bg-surface-700 px-2 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
                                {{ ws.slug }}
                            </span>
                        </td>
                        <td class="text-center">
                            <span class="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-semibold">
                                <i class="pi pi-file text-xs"></i> {{ ws.formsCount }}
                            </span>
                        </td>
                        <td class="text-center">
                            <span class="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full font-semibold">
                                <i class="pi pi-users text-xs"></i> {{ ws.membersCount }}
                            </span>
                        </td>
                        <td class="text-center">
                            <p-tag [value]="getStatusLabel(ws.status)"
                                [severity]="getStatusSeverity(ws.status)" />
                        </td>
                        <td class="text-center">
                            <div class="flex gap-2 justify-center">
                                <p-button icon="pi pi-eye" severity="info" [rounded]="true" [outlined]="true"
                                    size="small"
                                    pTooltip="Ver workspace" tooltipPosition="top"
                                    [routerLink]="['/admin/workspaces', ws.id]" />
                                <p-button icon="pi pi-pencil" severity="success" [rounded]="true" [outlined]="true"
                                    size="small"
                                    pTooltip="Editar workspace" tooltipPosition="top" />
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                    size="small"
                                    pTooltip="Eliminar workspace" tooltipPosition="top"
                                    (onClick)="confirmDelete(ws)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="7" class="text-center py-8">
                            <div class="flex flex-col items-center gap-4">
                                <div class="bg-gray-100 dark:bg-surface-700 p-4 rounded-full">
                                    <i class="pi pi-th-large text-gray-400 text-3xl"></i>
                                </div>
                                <div>
                                    <h5 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        No hay workspaces registrados
                                    </h5>
                                    <p class="text-gray-500 dark:text-gray-400 mb-4">
                                        Creá el primer workspace para comenzar.
                                    </p>
                                    <p-button label="Nuevo Workspace" icon="pi pi-plus" severity="success"
                                        routerLink="/admin/workspaces/create" />
                                </div>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-toast />
        <p-confirmDialog />
    `
})
export class WorkspaceListComponent implements OnInit {
    private readonly workspaceService = inject(WorkspaceService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly router = inject(Router);

    readonly workspaces = this.workspaceService.workspaces;
    readonly isLoading = this.workspaceService.loading;
    readonly panelCollapsed = signal(true);

    filter: WorkspaceFilter = { name: '', status: '' };

    readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin/dashboard' };
    readonly breadcrumbItems: MenuItem[] = [
        { label: 'Admin', routerLink: '/admin/dashboard' },
        { label: 'Workspaces' }
    ];

    ngOnInit(): void {
        this.workspaceService.getAll().subscribe();
    }

    togglePanel(): void {
        this.panelCollapsed.set(!this.panelCollapsed());
    }

    onPanelToggle(collapsed: boolean | undefined): void {
        this.panelCollapsed.set(collapsed ?? false);
    }

    buscar(): void {
        this.workspaceService.getAll().subscribe();
    }

    limpiar(): void {
        this.filter = { name: '', status: '' };
        this.workspaceService.getAll().subscribe();
    }

    getStatusLabel(status: WorkspaceStatus): string {
        const map: Record<WorkspaceStatus, string> = {
            ACTIVE: 'Activo', INACTIVE: 'Inactivo', ARCHIVED: 'Archivado'
        };
        return map[status];
    }

    getStatusSeverity(status: WorkspaceStatus): 'success' | 'secondary' | 'warn' {
        const map: Record<WorkspaceStatus, 'success' | 'secondary' | 'warn'> = {
            ACTIVE: 'success', INACTIVE: 'secondary', ARCHIVED: 'warn'
        };
        return map[status];
    }

    confirmDelete(ws: Workspace): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro que querés eliminar el workspace <strong>${ws.name}</strong>?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.workspaceService.delete(ws.id).subscribe({
                    next: () => this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: `Workspace "${ws.name}" eliminado correctamente.`
                    }),
                    error: () => this.messageService.add({
                        severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el workspace.'
                    })
                });
            }
        });
    }
}
