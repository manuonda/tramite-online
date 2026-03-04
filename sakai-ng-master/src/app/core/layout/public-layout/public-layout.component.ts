import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-public-layout',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    template: `
        <div class="flex flex-col min-h-screen">
            <!-- Topbar público -->
            <header class="bg-[#24305e] shadow-sm sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <a routerLink="/" class="flex items-center gap-3 no-underline">
                        <div class="flex items-center gap-2 text-white">
                            <i class="pi pi-building text-lg opacity-90"></i>
                        </div>
                        <div>
                            <span class="font-bold text-[1.7rem] text-white block leading-tight">TramiteOnline</span>
                        </div>
                    </a>
                    <div class="flex items-center gap-5">
                        <nav class="hidden md:flex items-center gap-5">
                            <a href="#tramites-disponibles" class="text-white/90 hover:text-white text-sm font-medium no-underline transition-colors">Consultar</a>
                            <a href="#" class="text-white/90 hover:text-white text-sm font-medium no-underline transition-colors">Preguntas Frecuentes</a>
                            <a href="#" class="text-white/90 hover:text-white text-sm font-medium no-underline transition-colors">Contacto</a>
                        </nav>
                        <a
                            routerLink="/auth/login"
                            class="inline-flex items-center px-5 py-2 bg-white hover:bg-gray-100 text-[#2b4a8a] text-sm font-bold rounded-full transition-all duration-200 no-underline"
                        >
                            Ingresar
                        </a>
                    </div>
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
