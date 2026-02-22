import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-public-layout',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    template: `
        <div class="flex flex-col min-h-screen">
            <!-- Topbar público -->
            <header class="bg-white dark:bg-surface-900 shadow-sm border-b border-gray-100 dark:border-surface-700 sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <a routerLink="/" class="flex items-center gap-3 no-underline">
                        <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow">
                            <i class="pi pi-building text-white text-xl"></i>
                        </div>
                        <div>
                            <span class="font-bold text-lg text-gray-800 dark:text-white block leading-tight">Trámite Online</span>
                            <span class="text-xs text-gray-400 dark:text-gray-500 leading-tight">Gobierno Digital</span>
                        </div>
                    </a>
                    <a
                        routerLink="/auth/login"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow transition-all duration-200 no-underline"
                    >
                        <i class="pi pi-sign-in"></i>
                        Ingresar
                    </a>
                </div>
            </header>

            <!-- Contenido -->
            <main class="flex-1">
                <router-outlet />
            </main>

            <!-- Footer -->
            <footer class="bg-white dark:bg-surface-900 border-t border-gray-100 dark:border-surface-700 py-4">
                <div class="max-w-7xl mx-auto px-6 text-center">
                    <p class="text-xs text-gray-400 dark:text-gray-500">
                        &copy; {{ year }} Trámite Online — Gobierno Digital
                    </p>
                </div>
            </footer>
        </div>
    `
})
export class PublicLayoutComponent {
    readonly year = new Date().getFullYear();
}
