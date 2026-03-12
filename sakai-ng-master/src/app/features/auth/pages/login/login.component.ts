import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '@core/auth/services/auth.service';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RouterModule, InputTextModule, ButtonModule, MessageModule, CheckboxModule, AppFloatingConfigurator],
    styles: [`
        .login-bg {
            background: linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 30%, #f8fafc 70%);
        }
        :host-context(.app-dark) .login-bg {
            background: linear-gradient(160deg, #0c1929 0%, #0f172a 50%, #1e293b 100%);
        }
        .login-card {
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 25px -5px rgba(0,0,0,0.08);
        }
        :host-context(.app-dark) .login-card {
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2), 0 10px 25px -5px rgba(0,0,0,0.3);
        }
        .login-header {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        }
        .login-input-wrap {
            position: relative;
        }
        .login-input-wrap .p-inputtext {
            padding-left: 2.75rem;
            border-radius: 10px;
            border: 1.5px solid #e2e8f0;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input-wrap .p-inputtext:focus {
            border-color: #0ea5e9;
            box-shadow: 0 0 0 3px rgba(14,165,233,0.15);
        }
        .login-input-wrap .p-inputtext.ng-invalid.ng-touched {
            border-color: #ef4444;
        }
        :host-context(.app-dark) .login-input-wrap .p-inputtext {
            border-color: var(--surface-600);
            background: var(--surface-800);
        }
        .login-input-wrap .p-inputtext:focus {
            outline: none;
        }
        .login-input-icon {
            position: absolute;
            left: 0.875rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            pointer-events: none;
            z-index: 1;
        }
        :host-context(.app-dark) .login-input-icon {
            color: #64748b;
        }
        .login-btn-primary {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
            border: none !important;
            border-radius: 10px !important;
            padding: 0.75rem 1.5rem !important;
            font-weight: 600 !important;
            font-size: 0.9375rem !important;
            transition: transform 0.15s, box-shadow 0.15s !important;
        }
        .login-btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 14px rgba(14,165,233,0.4) !important;
        }
        .login-btn-secondary {
            background: transparent !important;
            border: 1.5px solid #e2e8f0 !important;
            color: #64748b !important;
            border-radius: 10px !important;
            font-weight: 500 !important;
        }
        .login-btn-secondary:hover {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
        }
        :host-context(.app-dark) .login-btn-secondary {
            border-color: var(--surface-600) !important;
            color: #94a3b8 !important;
        }
        :host-context(.app-dark) .login-btn-secondary:hover {
            background: var(--surface-800) !important;
        }
        .login-error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 10px;
        }
        :host-context(.app-dark) .login-error {
            background: rgba(239,68,68,0.1);
            border-color: rgba(239,68,68,0.3);
        }
        .login-info {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 10px;
        }
        :host-context(.app-dark) .login-info {
            background: rgba(14,165,233,0.1);
            border-color: rgba(14,165,233,0.3);
        }
        .login-btn-google {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 0.625rem 1rem;
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            color: #111827;
            border-radius: 10px;
            font-size: 0.9375rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s;
        }
        .login-btn-google:hover {
            background: #f9fafb;
            border-color: #d1d5db;
        }
        .login-btn-google span {
            color: #111827;
        }
        .login-google-icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }
    `],
    template: `
        <app-floating-configurator />
        <div class="login-bg flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden py-8 px-4">
            <div class="flex flex-col items-center justify-center w-full max-w-[420px]">

                <div class="w-full login-card bg-white dark:bg-surface-900 rounded-2xl border border-gray-100 dark:border-surface-700 overflow-hidden">

                    <!-- Header compacto -->
                    <div class="login-header px-8 py-6 text-center">
                        <div class="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                            <i class="pi pi-building text-3xl text-white"></i>
                        </div>
                        <h1 class="text-xl font-bold text-white tracking-tight">Trámite Online</h1>
                        <p class="text-sky-100 text-sm mt-1">Sistema de gestión de trámites</p>
                    </div>

                    <!-- Formulario -->
                    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 sm:p-8">

                        <!-- Email -->
                        <div class="flex flex-col mb-4 gap-1.5">
                            <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Correo electrónico
                            </label>
                            <div class="login-input-wrap">
                                <i class="pi pi-envelope login-input-icon text-sm"></i>
                                <input
                                    id="email"
                                    pInputText
                                    type="email"
                                    formControlName="email"
                                    placeholder="tu@email.com"
                                    autocomplete="email"
                                    class="w-full"
                                    [class.ng-invalid]="form.controls.email.invalid && form.controls.email.touched"
                                    [class.ng-touched]="form.controls.email.touched"
                                />
                            </div>
                            @if (form.controls.email.invalid && form.controls.email.touched) {
                                <p-message severity="error" variant="simple" size="small">
                                    Ingresá un email válido
                                </p-message>
                            }
                        </div>

                        <!-- Contraseña -->
                        <div class="flex flex-col mb-4 gap-1.5">
                            <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Contraseña
                            </label>
                            <div class="login-input-wrap">
                                <i class="pi pi-lock login-input-icon text-sm"></i>
                                <input
                                    id="password"
                                    pInputText
                                    type="password"
                                    formControlName="password"
                                    placeholder="••••••••"
                                    autocomplete="current-password"
                                    class="w-full"
                                    [class.ng-invalid]="form.controls.password.invalid && form.controls.password.touched"
                                    [class.ng-touched]="form.controls.password.touched"
                                />
                            </div>
                            @if (form.controls.password.invalid && form.controls.password.touched) {
                                <p-message severity="error" variant="simple" size="small">
                                    La contraseña es requerida
                                </p-message>
                            }
                        </div>

                        <!-- Recordarme + Olvidé -->
                        <div class="flex items-center justify-between mb-6 gap-4">
                            <div class="flex items-center gap-2">
                                <p-checkbox formControlName="rememberMe" [binary]="true" inputId="rememberMe" />
                                <label for="rememberMe" class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                    Recordarme
                                </label>
                            </div>
                            <a href="#" class="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors">
                                Olvidé mi contraseña
                            </a>
                        </div>

                        <!-- Error de login -->
                        @if (errorMessage()) {
                            <div class="login-error p-4 mb-5 flex items-start gap-3">
                                <i class="pi pi-times-circle text-red-500 text-lg shrink-0 mt-0.5"></i>
                                <p class="text-red-700 dark:text-red-300 text-sm font-medium">{{ errorMessage() }}</p>
                            </div>
                        }
                        <!-- Info (ej. Google próximamente) -->
                        @if (infoMessage()) {
                            <div class="login-info p-4 mb-5 flex items-start gap-3">
                                <i class="pi pi-info-circle text-sky-500 text-lg shrink-0 mt-0.5"></i>
                                <p class="text-sky-700 dark:text-sky-300 text-sm font-medium">{{ infoMessage() }}</p>
                            </div>
                        }

                        <!-- Botones Ingresar + Limpiar (row 50/50) -->
                        <div class="grid grid-cols-2 gap-3 mb-5">
                            <p-button
                                type="submit"
                                label="Ingresar"
                                icon="pi pi-sign-in"
                                [loading]="isLoading()"
                                [disabled]="form.invalid"
                                styleClass="w-full justify-center login-btn-primary"
                            />
                            <p-button
                                type="button"
                                label="Limpiar"
                                icon="pi pi-refresh"
                                (onClick)="onReset()"
                                styleClass="w-full justify-center login-btn-secondary"
                            />
                        </div>

                        <!-- Divisor -->
                        <div class="flex items-center gap-3 mb-5">
                            <span class="flex-1 h-px bg-gray-200 dark:bg-surface-600"></span>
                            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">o</span>
                            <span class="flex-1 h-px bg-gray-200 dark:bg-surface-600"></span>
                        </div>

                        <!-- Ingresar con Google (logo oficial de Google) -->
                        <button
                            type="button"
                            class="login-btn-google w-full justify-center mb-5"
                            (click)="onGoogleLogin()">
                            <svg class="login-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Ingresar con Google</span>
                        </button>

                        <!-- Registrarse -->
                        <p class="text-center text-sm text-gray-600 dark:text-gray-400">
                            ¿No tenés cuenta?
                            <a routerLink="/auth/registro" class="font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 ml-1 transition-colors">
                                Registrarse
                            </a>
                        </p>
                    </form>

                    <!-- Footer sutil -->
                    <div class="px-6 py-3 border-t border-gray-100 dark:border-surface-700 text-center">
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Acceso seguro
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
    readonly infoMessage = signal<string | null>(null);

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
        this.infoMessage.set(null);
        const { email, password, rememberMe } = this.form.getRawValue();
        this.authService.login({ email, password, rememberMe }).subscribe({
            next: () => this.router.navigate(['/admin/dashboard']),
            error: () => {
                this.infoMessage.set(null);
                this.errorMessage.set('Credenciales inválidas. Intentá de nuevo.');
            }
        });
    }

    onReset(): void {
        this.form.reset();
        this.errorMessage.set(null);
        this.infoMessage.set(null);
    }

    onGoogleLogin(): void {
        // Placeholder: integrar con Google OAuth cuando el backend esté configurado
        this.errorMessage.set(null);
        this.infoMessage.set('Ingreso con Google estará disponible próximamente.');
    }
}
