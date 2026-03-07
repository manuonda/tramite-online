import { ChangeDetectionStrategy, Component, inject, computed, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject, takeUntil } from 'rxjs';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

const SEGMENT_LABELS: Record<string, string> = {
    admin: 'Admin',
    dashboard: 'Dashboard',
    workspaces: 'Espacios de Trabajo',
    workspace: 'Espacio',
    create: 'Nuevo',
    submissions: 'Respuestas',
    submission: 'Respuesta',
    forms: 'Formularios',
    'domain-values': 'Valores de dominio',
    members: 'Miembros',
    edit: 'Editar',
    usuarios: 'Usuarios',
    roles: 'Roles y Permisos',
    configuracion: 'Configuración',
    reportes: 'Reportes',
    estadisticas: 'Estadísticas',
    exportar: 'Exportar',
};

@Component({
    selector: 'app-admin-breadcrumb',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [BreadcrumbModule, RouterModule],
    styles: [`
        :host ::ng-deep .p-breadcrumb {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
        }
        :host ::ng-deep .p-breadcrumb-list {
            flex-wrap: wrap;
        }
        :host ::ng-deep .p-breadcrumb-item-link {
            color: var(--text-color-secondary);
            font-weight: 500;
            font-size: 0.875rem;
            padding: 0.35rem 0.5rem;
            border-radius: 6px;
            transition: all 0.2s;
        }
        :host ::ng-deep .p-breadcrumb-item-link:hover {
            color: var(--primary-color);
            background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
        }
        :host ::ng-deep .p-breadcrumb-item:last-child .p-breadcrumb-item-link {
            color: var(--text-color);
            font-weight: 600;
            cursor: default;
        }
        :host ::ng-deep .p-breadcrumb-chevron {
            color: var(--text-color-secondary);
            font-size: 0.75rem;
        }
    `],
    template: `
        <div class="mb-4">
            <div class="bg-gray-50 dark:bg-surface-800 rounded-lg px-3 py-2.5 border border-gray-200 dark:border-surface-700 shadow-sm">
                <p-breadcrumb
                    [model]="breadcrumbItems()"
                    [home]="home"
                    [style]="{ background: 'transparent', border: 'none', padding: 0 }" />
            </div>
        </div>
    `,
})
export class AdminBreadcrumbComponent implements OnInit, OnDestroy {
    private readonly router = inject(Router);
    private readonly breadcrumbSvc = inject(BreadcrumbService);

    readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin/dashboard' };

    /** Trigger para que el computed se actualice al cambiar la ruta */
    private readonly urlTrigger = signal(0);

    readonly breadcrumbItems = computed<MenuItem[]>(() => {
        this.urlTrigger();
        const url = this.router.url.split('?')[0];
        const customLabel = this.breadcrumbSvc.customLabel();
        const customRoute = this.breadcrumbSvc.customRoute();
        return this.buildItems(url, customLabel, customRoute);
    });

    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            takeUntil(this.destroy$)
        ).subscribe((e) => {
            this.breadcrumbSvc.clear();
            this.urlTrigger.update((v) => v + 1);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private buildItems(url: string, customLabel: string | null, customRoute: string[] | null): MenuItem[] {
        const segments = url.split('/').filter(Boolean);
        if (segments.length === 0 || segments[0] !== 'admin') return [];

        const items: MenuItem[] = [];
        let path = '';
        let prevWasId = false;

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const isLast = i === segments.length - 1;
            const isId = /^[a-f0-9-]{36}$/i.test(seg) || /^\d+$/.test(seg);

            if (isId) {
                path = path ? path + '/' + seg : '/' + seg;
                const label = prevWasId ? 'Detalle' : (customLabel ?? 'Detalle');
                const route = customRoute ?? (isLast ? undefined : [path]);
                items.push({ label, ...(route && { routerLink: route }) });
                prevWasId = true;
                continue;
            }

            prevWasId = false;
            path = path ? path + '/' + seg : '/' + seg;

            const label = SEGMENT_LABELS[seg] ?? this.capitalize(seg);
            const routerLink = isLast && !customLabel ? undefined : [path];

            items.push({
                label,
                ...(routerLink && { routerLink }),
            });
        }

        return items;
    }

    private capitalize(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
    }
}
