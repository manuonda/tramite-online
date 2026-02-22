import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TagModule } from 'primeng/tag';
import { Workspace, WorkspaceStatus } from '../../models/workspace.model';
import { WorkspaceService } from '../../services/workspace.service';

interface TabItem {
    label: string;
    icon: string;
    route: string;
}

@Component({
    selector: 'app-workspace-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule, BreadcrumbModule, TagModule],
    template: `
        <!-- Breadcrumb -->
        <div class="mb-6">
            <div class="bg-gray-50 dark:bg-surface-800 rounded-lg p-3 border border-gray-200 dark:border-surface-700 shadow-sm">
                <p-breadcrumb [model]="breadcrumbItems()" [home]="home"
                    [style]="{'background': 'transparent', 'border': 'none', 'padding': '0'}" />
            </div>
        </div>

        <!-- Header con info del workspace -->
        @if (workspace(); as ws) {
            <div class="mb-6">
                <div class="bg-white dark:bg-surface-900 rounded-xl shadow-lg border-l-4 border-blue-500 overflow-hidden">
                    <div class="p-6">
                        <div class="flex items-start gap-5">
                            <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full text-white shadow-lg shrink-0">
                                <i class="pi pi-th-large text-2xl"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between mb-4 flex-wrap gap-3">
                                    <div>
                                        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-1">{{ ws.name }}</h1>
                                        @if (ws.description) {
                                            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ ws.description }}</p>
                                        }
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <p-tag [value]="getStatusLabel(ws.status)"
                                            [severity]="getStatusSeverity(ws.status)" />
                                        <div class="bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full">
                                            <span class="text-blue-800 dark:text-blue-200 text-sm font-semibold">
                                                <i class="pi pi-cog mr-1"></i>Panel de Workspace
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div class="bg-gray-50 dark:bg-surface-800 rounded-lg p-3">
                                        <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Slug</label>
                                        <span class="font-mono text-sm text-gray-800 dark:text-white">{{ ws.slug }}</span>
                                    </div>
                                    <div class="bg-gray-50 dark:bg-surface-800 rounded-lg p-3">
                                        <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Formularios</label>
                                        <span class="font-bold text-xl text-blue-600">{{ ws.formsCount }}</span>
                                    </div>
                                    <div class="bg-gray-50 dark:bg-surface-800 rounded-lg p-3">
                                        <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Miembros</label>
                                        <span class="font-bold text-xl text-purple-600">{{ ws.membersCount }}</span>
                                    </div>
                                    <div class="bg-gray-50 dark:bg-surface-800 rounded-lg p-3">
                                        <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Creado por</label>
                                        <span class="text-sm text-gray-800 dark:text-white">{{ ws.createdBy }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        } @else if (isLoading()) {
            <div class="mb-6">
                <div class="bg-white dark:bg-surface-900 rounded-xl shadow-lg border-l-4 border-blue-300 p-6 animate-pulse">
                    <div class="h-8 bg-gray-200 dark:bg-surface-700 rounded w-1/3 mb-3"></div>
                    <div class="h-4 bg-gray-100 dark:bg-surface-800 rounded w-2/3"></div>
                </div>
            </div>
        }

        <!-- Navegación por tabs -->
        <div class="bg-white dark:bg-surface-900 rounded-xl shadow-sm border border-gray-100 dark:border-surface-700 mb-4 overflow-hidden">
            <nav class="flex overflow-x-auto">
                @for (tab of tabs; track tab.route) {
                    <a [routerLink]="tab.route" routerLinkActive="active-tab"
                        class="flex items-center gap-2 px-5 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-blue-600 hover:border-blue-300 transition-all duration-200 whitespace-nowrap no-underline">
                        <i class="{{ tab.icon }}"></i>
                        {{ tab.label }}
                    </a>
                }
            </nav>
        </div>

        <!-- Contenido del tab activo -->
        <router-outlet />
    `,
    styles: [`
        :host ::ng-deep a.active-tab {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
            font-weight: 600;
            background-color: #eff6ff;
        }
    `]
})
export class WorkspaceDetailComponent implements OnInit {
    readonly workspaceId = input<string>('');

    private readonly workspaceService = inject(WorkspaceService);

    readonly workspace = this.workspaceService.selected;
    readonly isLoading = this.workspaceService.loading;

    readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin/dashboard' };

    readonly tabs: TabItem[] = [
        { label: 'Formularios',        icon: 'pi pi-file',  route: 'forms'         },
        { label: 'Valores de Dominio', icon: 'pi pi-list',  route: 'domain-values' },
        { label: 'Miembros',           icon: 'pi pi-users', route: 'members'       },
        { label: 'Respuestas',         icon: 'pi pi-inbox', route: 'submissions'   }
    ];

    readonly breadcrumbItems = () => [
        { label: 'Admin',      routerLink: '/admin/dashboard'  },
        { label: 'Workspaces', routerLink: '/admin/workspaces' },
        { label: this.workspace()?.name ?? '...' }
    ];

    ngOnInit(): void {
        const id = this.workspaceId();
        if (id) {
            this.workspaceService.getById(id).subscribe();
        }
    }

    getStatusLabel(status: WorkspaceStatus): string {
        return { ACTIVE: 'Activo', INACTIVE: 'Inactivo', ARCHIVED: 'Archivado' }[status];
    }

    getStatusSeverity(status: WorkspaceStatus): 'success' | 'secondary' | 'warn' {
        return { ACTIVE: 'success', INACTIVE: 'secondary', ARCHIVED: 'warn' }[status] as 'success' | 'secondary' | 'warn';
    }
}
