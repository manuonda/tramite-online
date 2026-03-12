import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-register',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule, ButtonModule],
    template: `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-950 py-8 px-4">
            <div class="max-w-md w-full bg-white dark:bg-surface-900 rounded-2xl shadow-lg border border-gray-100 dark:border-surface-700 p-8 text-center">
                <div class="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-user-plus text-2xl text-sky-600 dark:text-sky-400"></i>
                </div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Registro</h1>
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    La pantalla de registro estará disponible próximamente.
                </p>
                <p-button
                    label="Volver al inicio de sesión"
                    icon="pi pi-arrow-left"
                    routerLink="/auth/login"
                    styleClass="w-full justify-center" />
            </div>
        </div>
    `
})
export class RegisterComponent {
    private readonly router = inject(Router);
}
