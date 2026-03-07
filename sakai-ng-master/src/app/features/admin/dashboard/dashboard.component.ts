import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { getUserFullName } from '@core/auth/models/user.model';

interface StatCard {
    label: string;
    value: number;
    icon: string;
    color: string;
    bgColor: string;
}

interface QuickAccessCard {
    titulo: string;
    descripcion: string;
    icono: string;
    color: string;
    route: string;
    activo: boolean;
}

@Component({
    selector: 'app-dashboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    template: `
        <!-- Header de bienvenida (Apollo-style) -->
        <div class="mb-8">
            <div class="dashboard-welcome-card">
                <div class="p-6">
                    <div class="flex items-center gap-5">
                        <div class="dashboard-welcome-icon">
                            <i class="pi pi-home text-2xl"></i>
                        </div>
                        <div class="flex-1">
                            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">
                                Bienvenido, {{ userName() }}
                            </h1>
                            <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                Panel de administración — Trámite Online
                            </p>
                        </div>
                        <div class="hidden md:flex dashboard-welcome-badge">
                            <span class="text-sm font-semibold">
                                <i class="pi pi-cog mr-1"></i>
                                Panel de Control
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tarjetas de estadísticas (Apollo-style) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            @for (stat of stats; track stat.label) {
                <div class="dashboard-stat-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-3 rounded-xl {{ stat.bgColor }}">
                            <i class="{{ stat.icon }} text-lg {{ stat.color }}"></i>
                        </div>
                        <span class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{{ stat.value }}</span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">{{ stat.label }}</p>
                </div>
            }
        </div>

        <!-- Accesos rápidos (Apollo-style) -->
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-5">
                <div class="dashboard-section-icon">
                    <i class="pi pi-th-large text-sm"></i>
                </div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Accesos rápidos</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (card of quickAccess; track card.titulo) {
                    <div
                        [routerLink]="card.activo ? card.route : null"
                        class="dashboard-quick-card"
                        [class.dashboard-quick-card--disabled]="!card.activo"
                    >
                        <div class="p-6 flex flex-col h-full">
                            <div class="flex items-start gap-4 mb-4">
                                <div class="dashboard-quick-icon {{ card.color.replace('border-', 'bg-') }}">
                                    <i class="{{ card.icono }} text-lg"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                        {{ card.titulo }}
                                    </h3>
                                </div>
                            </div>
                            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed flex-1 mb-4">
                                {{ card.descripcion }}
                            </p>
                            <div class="flex justify-between items-center mt-auto">
                                @if (card.activo) {
                                    <span class="text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-1">
                                        <i class="pi pi-check-circle text-xs"></i>
                                        Disponible
                                    </span>
                                } @else {
                                    <span class="text-gray-400 text-xs font-semibold flex items-center gap-1">
                                        <i class="pi pi-clock text-xs"></i>
                                        Próximamente
                                    </span>
                                }
                                <i class="pi pi-arrow-right text-gray-400 text-sm"></i>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class DashboardComponent {
    private readonly authService = inject(AuthService);

    readonly userName = () => {
        const user = this.authService.currentUser();
        return user ? getUserFullName(user) : 'Usuario';
    };

    readonly stats: StatCard[] = [
        { label: 'Trámites activos',  value: 0, icon: 'pi pi-file',         color: 'text-blue-600',   bgColor: 'bg-blue-100 dark:bg-blue-950'   },
        { label: 'Pendientes',        value: 0, icon: 'pi pi-clock',         color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-950' },
        { label: 'Completados',       value: 0, icon: 'pi pi-check-circle',  color: 'text-green-600',  bgColor: 'bg-green-100 dark:bg-green-950'  },
        { label: 'Usuarios',          value: 0, icon: 'pi pi-users',         color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-950' }
    ];

    readonly quickAccess: QuickAccessCard[] = [
        {
            titulo: 'Workspaces',
            descripcion: 'Gestioná los espacios de trabajo, formularios, miembros y respuestas.',
            icono: 'pi pi-th-large',
            color: 'border-blue-500',
            route: '/admin/workspaces',
            activo: true
        },
        {
            titulo: 'Nuevo Trámite',
            descripcion: 'Iniciá un nuevo proceso de trámite seleccionando el formulario adecuado.',
            icono: 'pi pi-plus-circle',
            color: 'border-green-500',
            route: '/admin/tramites/nuevo',
            activo: false
        },
        {
            titulo: 'Formularios',
            descripcion: 'Administrá los formularios de solicitudes y habilitaciones disponibles.',
            icono: 'pi pi-inbox',
            color: 'border-purple-500',
            route: '/admin/formularios',
            activo: false
        },
        {
            titulo: 'Usuarios',
            descripcion: 'Gestioná los usuarios del sistema, roles y permisos de acceso.',
            icono: 'pi pi-users',
            color: 'border-orange-500',
            route: '/admin/usuarios',
            activo: false
        },
        {
            titulo: 'Reportes',
            descripcion: 'Visualizá estadísticas y exportá informes del estado de los trámites.',
            icono: 'pi pi-chart-bar',
            color: 'border-teal-500',
            route: '/admin/reportes',
            activo: false
        },
        {
            titulo: 'Configuración',
            descripcion: 'Ajustá los parámetros generales del sistema y preferencias globales.',
            icono: 'pi pi-cog',
            color: 'border-gray-500',
            route: '/admin/configuracion',
            activo: false
        }
    ];
}
