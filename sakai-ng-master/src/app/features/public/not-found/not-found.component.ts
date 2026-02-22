import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-not-found',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    template: `
        <div class="bg-gradient-to-br from-gray-50 via-yellow-50 to-white dark:from-surface-950 dark:via-surface-900 dark:to-surface-800 flex items-center justify-center min-h-screen px-6">
            <div class="max-w-md w-full">
                <div class="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-surface-700 overflow-hidden">

                    <!-- Header amarillo -->
                    <div class="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-center">
                        <div class="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <i class="pi pi-exclamation-triangle text-4xl text-white"></i>
                        </div>
                        <h1 class="text-4xl font-bold text-white mb-1">404</h1>
                        <p class="text-yellow-100 text-sm">Página no encontrada</p>
                    </div>

                    <!-- Cuerpo -->
                    <div class="p-8 text-center">
                        <div class="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
                            <p class="text-yellow-800 dark:text-yellow-300 text-sm font-medium">
                                La página que buscás no existe o fue movida a otra dirección.
                            </p>
                        </div>
                        <a
                            routerLink="/"
                            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 no-underline"
                        >
                            <i class="pi pi-home"></i>
                            Volver al inicio
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class NotFoundComponent {}
