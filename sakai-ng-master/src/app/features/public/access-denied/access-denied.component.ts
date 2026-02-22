import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-access-denied',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    template: `
        <div class="bg-gradient-to-br from-gray-50 via-red-50 to-white dark:from-surface-950 dark:via-surface-900 dark:to-surface-800 flex items-center justify-center min-h-screen px-6">
            <div class="max-w-md w-full">
                <div class="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-surface-700 overflow-hidden">

                    <!-- Header rojo -->
                    <div class="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
                        <div class="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <i class="pi pi-lock text-4xl text-white"></i>
                        </div>
                        <h1 class="text-4xl font-bold text-white mb-1">403</h1>
                        <p class="text-red-100 text-sm">Acceso denegado</p>
                    </div>

                    <!-- Cuerpo -->
                    <div class="p-8 text-center">
                        <div class="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                            <p class="text-red-800 dark:text-red-300 text-sm font-medium">
                                No tenés los permisos necesarios para acceder a esta sección del sistema.
                            </p>
                        </div>
                        <a
                            routerLink="/admin/dashboard"
                            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline"
                        >
                            <i class="pi pi-home"></i>
                            Ir al inicio
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AccessDeniedComponent {}
