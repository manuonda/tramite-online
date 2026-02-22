import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '@core/auth/services/auth.service';

@Component({
    selector: 'app-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, InputTextModule, ButtonModule, MessageModule, CheckboxModule],
    template: `
        <div class="bg-gradient-to-br from-gray-50 via-blue-50 to-white dark:from-surface-950 dark:via-surface-900 dark:to-surface-800 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center w-full max-w-md px-6">

                <div class="w-full bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-surface-700 overflow-hidden">

                    <!-- Header azul degradado -->
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-center">
                        <div class="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <i class="pi pi-building text-4xl text-white"></i>
                        </div>
                        <h1 class="text-2xl font-bold text-white mb-1">Trámite Online</h1>
                        <p class="text-blue-100 text-sm">Acceso seguro al sistema</p>
                    </div>

                    <!-- Formulario -->
                    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-8">

                        <!-- Email -->
                        <div class="flex flex-col mb-5 gap-2">
                            <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                pInputText
                                type="email"
                                formControlName="email"
                                placeholder="tu@email.com"
                                autocomplete="email"
                                class="w-full"
                                [class.ng-invalid]="form.controls.email.invalid && form.controls.email.touched"
                                [class.ng-dirty]="form.controls.email.touched"
                            />
                            @if (form.controls.email.invalid && form.controls.email.touched) {
                                <p-message severity="error" variant="simple" size="small">
                                    <i class="pi pi-exclamation-triangle mr-2"></i>
                                    Ingresá un email válido
                                </p-message>
                            }
                        </div>

                        <!-- Contraseña -->
                        <div class="flex flex-col mb-5 gap-2">
                            <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                pInputText
                                type="password"
                                formControlName="password"
                                placeholder="••••••••"
                                autocomplete="current-password"
                                class="w-full"
                                [class.ng-invalid]="form.controls.password.invalid && form.controls.password.touched"
                                [class.ng-dirty]="form.controls.password.touched"
                            />
                            @if (form.controls.password.invalid && form.controls.password.touched) {
                                <p-message severity="error" variant="simple" size="small">
                                    <i class="pi pi-exclamation-triangle mr-2"></i>
                                    La contraseña es requerida
                                </p-message>
                            }
                        </div>

                        <!-- Recordarme -->
                        <div class="flex items-center mb-6 gap-2">
                            <p-checkbox formControlName="rememberMe" [binary]="true" inputId="rememberMe" />
                            <label for="rememberMe" class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                Recordarme
                            </label>
                        </div>

                        <!-- Error de login -->
                        @if (errorMessage()) {
                            <div class="mb-5">
                                <div class="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded-lg">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-times-circle text-red-500 text-lg"></i>
                                        <p class="text-red-800 dark:text-red-300 text-sm font-medium">{{ errorMessage() }}</p>
                                    </div>
                                </div>
                            </div>
                        }

                        <!-- Botones -->
                        <div class="flex gap-3">
                            <p-button
                                type="submit"
                                label="Ingresar"
                                icon="pi pi-sign-in"
                                [loading]="isLoading()"
                                [disabled]="form.invalid"
                                styleClass="flex-1 justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            />
                            <p-button
                                type="button"
                                label="Limpiar"
                                icon="pi pi-refresh"
                                (onClick)="onReset()"
                                styleClass="flex-1 justify-center bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 border-0 font-medium shadow-md hover:shadow-lg transition-all duration-200"
                            />
                        </div>
                    </form>

                    <!-- Footer -->
                    <div class="bg-gray-50 dark:bg-surface-800 px-8 py-4 text-center border-t border-gray-100 dark:border-surface-700">
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Sistema de Gestión — Acceso Autorizado
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly isLoading = this.authService.isLoading;
    readonly errorMessage = signal<string | null>(null);

    readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        rememberMe: [false]
    });

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.errorMessage.set(null);
        const { email, password, rememberMe } = this.form.getRawValue();
        this.authService.login({ email, password, rememberMe }).subscribe({
            next: () => this.router.navigate(['/admin/dashboard']),
            error: () => this.errorMessage.set('Credenciales inválidas. Intentá de nuevo.')
        });
    }

    onReset(): void {
        this.form.reset();
        this.errorMessage.set(null);
    }
}
