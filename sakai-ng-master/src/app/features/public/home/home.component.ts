import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-home',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    template: `
        <!-- Hero -->
        <div class="bg-gradient-to-br from-gray-50 via-blue-50 to-white dark:from-surface-950 dark:via-surface-900 dark:to-surface-800 min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-16">
            <div class="max-w-4xl w-full text-center">

                <!-- Icono principal -->
                <div class="flex justify-center mb-6">
                    <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-full shadow-2xl">
                        <i class="pi pi-building text-white" style="font-size: 3.5rem"></i>
                    </div>
                </div>

                <h1 class="text-5xl font-bold text-gray-800 dark:text-white mb-4 leading-tight">
                    Trámite <span class="text-blue-600">Online</span>
                </h1>
                <p class="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Realizá tus trámites de forma simple, rápida y segura desde cualquier lugar, en cualquier momento.
                </p>

                <!-- CTAs -->
                <div class="flex flex-wrap gap-4 justify-center mb-16">
                    <a
                        routerLink="/auth/login"
                        class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 no-underline"
                    >
                        <i class="pi pi-sign-in"></i>
                        Iniciar sesión
                    </a>
                    <a
                        routerLink="/forms"
                        class="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-surface-900 border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold rounded-xl shadow-md hover:shadow-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200 transform hover:-translate-y-0.5 no-underline"
                    >
                        <i class="pi pi-list"></i>
                        Ver trámites
                    </a>
                </div>

                <!-- Feature cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    @for (feature of features; track feature.titulo) {
                        <div class="bg-white dark:bg-surface-900 rounded-xl shadow-md border border-gray-100 dark:border-surface-700 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div class="flex justify-center mb-4">
                                <div class="p-3 rounded-full {{ feature.bgColor }}">
                                    <i class="{{ feature.icono }} text-xl {{ feature.color }}"></i>
                                </div>
                            </div>
                            <h3 class="text-base font-bold text-gray-800 dark:text-white mb-2">{{ feature.titulo }}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ feature.descripcion }}</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class HomeComponent {
    readonly features = [
        {
            titulo: 'Rápido y sencillo',
            descripcion: 'Completá tus trámites en minutos sin filas ni esperas innecesarias.',
            icono: 'pi pi-bolt',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-950'
        },
        {
            titulo: 'Seguro y confiable',
            descripcion: 'Tus datos están protegidos con los más altos estándares de seguridad.',
            icono: 'pi pi-shield',
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-950'
        },
        {
            titulo: 'Seguimiento en tiempo real',
            descripcion: 'Monitoreá el estado de tus trámites en cualquier momento.',
            icono: 'pi pi-search',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-950'
        }
    ];
}
