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
import {
    Submission, SubmissionFilter, SubmissionStatus,
    SUBMISSION_STATUS_CONFIG
} from '../../models/submission.model';
import { SubmissionService } from '../../services/submission.service';

@Component({
    selector: 'app-submission-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService],
    imports: [
        RouterModule, FormsModule,
        BreadcrumbModule, ButtonModule, TableModule, TagModule,
        PanelModule, InputTextModule, IconFieldModule, InputIconModule,
        ToastModule, ConfirmDialogModule, TooltipModule,
    ],
    styles: [`
        ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
            padding: 0.9rem 1.25rem;
        }
        ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            padding: 0.875rem 1.25rem;
        }
        ::ng-deep .breadcrumb-custom .p-breadcrumb {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
        }
        ::ng-deep .breadcrumb-custom .p-breadcrumb-item-link {
            color: #6b7280 !important;
            font-weight: 500;
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            transition: all 0.3s ease;
        }
        ::ng-deep .breadcrumb-custom .p-breadcrumb-item-link:hover {
            color: #374151 !important;
            background-color: rgba(139, 92, 246, 0.1);
        }
        ::ng-deep .breadcrumb-custom .p-breadcrumb-item-icon {
            color: #8b5cf6 !important;
        }
        ::ng-deep .breadcrumb-custom .p-breadcrumb-item:last-child .p-breadcrumb-item-link {
            color: #8b5cf6 !important;
            font-weight: 600;
            background-color: rgba(139, 92, 246, 0.1);
            cursor: default;
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
                    [style]="{'background':'transparent','border':'none','padding':'0'}" />
            </div>
        </div>

        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center gap-4">
                <div class="bg-gradient-to-br from-violet-500 to-violet-600 p-3 rounded-full text-white shadow-lg">
                    <i class="pi pi-inbox text-lg"></i>
                </div>
                <div>
                    <span class="text-xl font-bold text-gray-800 dark:text-white">Respuestas de Formularios</span>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Todas las respuestas recibidas —
                        <span class="font-semibold text-amber-600">{{ pendingCount() }} pendientes</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- Stats rápidas -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            @for (stat of statsCards; track stat.status) {
                <div
                    class="bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 p-4 cursor-pointer transition-all hover:shadow-md"
                    [class.ring-2]="filter.status === stat.status"
                    [class.ring-violet-400]="filter.status === stat.status"
                    (click)="toggleStatusFilter(stat.status)">
                    <div class="flex items-center justify-between mb-1">
                        <i [class]="statusConfig[stat.status].icon + ' text-sm'"
                           [style.color]="statusConfig[stat.status].color"></i>
                        @if (filter.status === stat.status) {
                            <i class="pi pi-times text-xs text-gray-400 cursor-pointer"></i>
                        }
                    </div>
                    <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ countByStatus(stat.status) }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{{ stat.label }}</div>
                </div>
            }
        </div>

        <!-- Filtros -->
        <p-panel
            [collapsed]="panelCollapsed()"
            [toggleable]="true"
            class="mb-4"
            (collapsedChange)="onPanelToggle($event)">
            <ng-template pTemplate="header">
                <div class="flex items-center gap-2 cursor-pointer hover:text-violet-700 transition-colors duration-200 w-full"
                    tabindex="0"
                    (click)="togglePanel()"
                    (keydown.enter)="togglePanel()"
                    (keydown.space)="togglePanel()">
                    <i class="pi pi-filter text-violet-600"></i>
                    <span class="font-medium text-gray-800 dark:text-white">Filtros de Búsqueda</span>
                </div>
            </ng-template>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                <div class="field">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workspace</label>
                    <select [(ngModel)]="filter.workspaceId"
                        (ngModelChange)="onWorkspaceChange()"
                        class="p-inputtext w-full text-sm">
                        <option value="">Todos los workspaces</option>
                        @for (ws of workspaceSummary; track ws.id) {
                            <option [value]="ws.id">{{ ws.name }} ({{ ws.count }})</option>
                        }
                    </select>
                </div>
                <div class="field">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Formulario</label>
                    <select [(ngModel)]="filter.formId" class="p-inputtext w-full text-sm">
                        <option value="">Todos los formularios</option>
                        @for (f of availableForms; track f.id) {
                            <option [value]="f.id">{{ f.name }}</option>
                        }
                    </select>
                </div>
                <div class="field">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select [(ngModel)]="filter.status" class="p-inputtext w-full text-sm">
                        <option value="">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="reviewed">Revisada</option>
                        <option value="processed">Procesada</option>
                        <option value="rejected">Rechazada</option>
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
        <div class="card border-l-4 border-violet-500 shadow-lg overflow-hidden">
            <p-table
                [value]="submissions()"
                [loading]="isLoading()"
                [tableStyle]="{'min-width':'60rem'}"
                [paginator]="true" [rows]="10"
                [rowsPerPageOptions]="[10, 25, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} respuestas"
                [globalFilterFields]="['submittedBy','formName','workspaceName','id']"
                #dt>

                <ng-template pTemplate="caption">
                    <div class="p-4 border-b border-gray-200 dark:border-surface-700">
                        <div class="flex items-center justify-between flex-wrap gap-4">
                            <div class="flex items-center gap-3">
                                <div class="bg-gradient-to-br from-violet-500 to-violet-600 p-2 rounded-full text-white shadow-lg">
                                    <i class="pi pi-table text-lg"></i>
                                </div>
                                <h4 class="text-xl font-semibold text-gray-800 dark:text-white m-0">
                                    Listado de Respuestas
                                </h4>
                            </div>
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search" />
                                <input pInputText type="text"
                                    (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                                    placeholder="Buscar..."
                                    class="text-sm shadow-sm border-2 border-gray-200 focus:border-violet-500 transition-all duration-200" />
                            </p-iconfield>
                        </div>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr class="bg-gray-50 dark:bg-surface-800">
                        <th class="font-semibold text-gray-700 dark:text-gray-300" style="min-width:5rem">ID</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300" style="min-width:14rem">Respondido por</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300" style="min-width:13rem">Formulario</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300" style="min-width:11rem">Workspace</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300" style="min-width:11rem">Fecha</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300 text-center" style="min-width:10rem">Estado</th>
                        <th class="font-semibold text-gray-700 dark:text-gray-300 text-center" style="min-width:10rem">
                            <div class="flex items-center justify-center gap-2">
                                <i class="pi pi-cog text-gray-500"></i> Acciones
                            </div>
                        </th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-sub let-rowIndex="rowIndex">
                    <tr class="hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors duration-200"
                        [class.bg-violet-50]="rowIndex % 2 === 0">
                        <td>
                            <span class="bg-gray-100 dark:bg-surface-700 px-2 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
                                {{ sub.id }}
                            </span>
                        </td>
                        <td class="font-medium text-gray-800 dark:text-white">
                            <div class="flex items-center gap-2">
                                <div class="bg-violet-100 dark:bg-violet-950 p-2 rounded-full shrink-0">
                                    <i class="pi pi-user text-violet-600 text-sm"></i>
                                </div>
                                <span>{{ sub.submittedBy }}</span>
                            </div>
                        </td>
                        <td>
                            <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{ sub.formName }}</span>
                        </td>
                        <td>
                            <span class="inline-flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-surface-700 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full">
                                <i class="pi pi-th-large text-xs"></i>
                                {{ sub.workspaceName }}
                            </span>
                        </td>
                        <td>
                            <div class="text-sm text-gray-700 dark:text-gray-300">{{ formatDate(sub.submittedAt) }}</div>
                            <div class="text-xs text-gray-400">{{ formatTime(sub.submittedAt) }}</div>
                        </td>
                        <td class="text-center">
                            <p-tag
                                [value]="getStatusConfig(sub.status).label"
                                [severity]="getStatusConfig(sub.status).severity" />
                        </td>
                        <td class="text-center">
                            <div class="flex gap-2 justify-center">
                                <p-button icon="pi pi-eye" severity="info" [rounded]="true" [outlined]="true"
                                    size="small" pTooltip="Ver respuestas" tooltipPosition="top"
                                    [routerLink]="['/admin/submissions', sub.id]" />
                                <p-button icon="pi pi-pencil" severity="secondary" [rounded]="true" [outlined]="true"
                                    size="small" pTooltip="Editar respuestas" tooltipPosition="top"
                                    [routerLink]="['/admin/submissions', sub.id, 'edit']" />
                                <p-button icon="pi pi-check" severity="success" [rounded]="true" [outlined]="true"
                                    size="small" pTooltip="Marcar procesada" tooltipPosition="top"
                                    (onClick)="markProcessed(sub)"
                                    [disabled]="sub.status === 'processed'" />
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true"
                                    size="small" pTooltip="Eliminar" tooltipPosition="top"
                                    (onClick)="confirmDelete(sub)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="7" class="text-center py-12">
                            <div class="flex flex-col items-center gap-4">
                                <div class="bg-gray-100 dark:bg-surface-700 p-5 rounded-full">
                                    <i class="pi pi-inbox text-gray-400 text-4xl"></i>
                                </div>
                                <div>
                                    <h5 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        No hay respuestas
                                    </h5>
                                    <p class="text-sm text-gray-400">
                                        No se encontraron respuestas con los filtros aplicados.
                                    </p>
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
export class SubmissionListComponent implements OnInit {
    private readonly submissionSvc = inject(SubmissionService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly router = inject(Router);

    readonly submissions = this.submissionSvc.submissions;
    readonly isLoading = this.submissionSvc.loading;
    readonly pendingCount = this.submissionSvc.pendingCount;
    readonly panelCollapsed = signal(true);

    readonly statusConfig = SUBMISSION_STATUS_CONFIG;

    filter: SubmissionFilter = { workspaceId: '', formId: '', status: '', search: '', dateFrom: '', dateTo: '' };

    workspaceSummary = this.submissionSvc.getWorkspaceSummary();
    availableForms: { id: string; name: string }[] = [];

    readonly statsCards = [
        { status: 'pending'   as SubmissionStatus, label: 'Pendientes'  },
        { status: 'reviewed'  as SubmissionStatus, label: 'Revisadas'   },
        { status: 'processed' as SubmissionStatus, label: 'Procesadas'  },
        { status: 'rejected'  as SubmissionStatus, label: 'Rechazadas'  },
    ];

    readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin/dashboard' };
    readonly breadcrumbItems: MenuItem[] = [
        { label: 'Admin', routerLink: '/admin/dashboard' },
        { label: 'Respuestas' }
    ];

    ngOnInit(): void {
        this.load();
    }

    private load(): void {
        this.submissionSvc.getAll(this.filter).subscribe();
    }

    countByStatus(status: SubmissionStatus): number {
        return this.submissions().filter(s => s.status === status).length;
    }

    getStatusConfig(status: string) {
        return this.statusConfig[status as SubmissionStatus] ?? this.statusConfig['pending'];
    }

    toggleStatusFilter(status: SubmissionStatus): void {
        this.filter.status = this.filter.status === status ? '' : status;
        this.load();
    }

    togglePanel(): void {
        this.panelCollapsed.set(!this.panelCollapsed());
    }

    onPanelToggle(collapsed: boolean | undefined): void {
        this.panelCollapsed.set(collapsed ?? false);
    }

    onWorkspaceChange(): void {
        this.filter.formId = '';
        this.availableForms = this.filter.workspaceId
            ? this.submissionSvc.getFormsForWorkspace(this.filter.workspaceId)
            : [];
    }

    buscar(): void {
        this.load();
    }

    limpiar(): void {
        this.filter = { workspaceId: '', formId: '', status: '', search: '', dateFrom: '', dateTo: '' };
        this.availableForms = [];
        this.load();
    }

    formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    formatTime(iso: string): string {
        return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    markProcessed(sub: Submission): void {
        if (sub.status === 'processed') return;
        this.submissionSvc.updateStatus(sub.id, 'processed').subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Procesada', detail: `Respuesta ${sub.id} marcada como procesada.` });
        });
    }

    confirmDelete(sub: Submission): void {
        this.confirmationService.confirm({
            message: `¿Eliminar la respuesta <strong>${sub.id}</strong> de <strong>${sub.submittedBy}</strong>?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.submissionSvc.delete(sub.id).subscribe(() => {
                    this.messageService.add({ severity: 'success', summary: 'Eliminada', detail: 'Respuesta eliminada.' });
                });
            }
        });
    }
}
