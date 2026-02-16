/**
 * Login Page Component
 * User authentication page
 */

import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { emailValidator } from '../../../../shared/utils/validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-950 px-4">
      <div class="w-full max-w-md">
        <!-- Card -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-lg shadow-lg p-8">
          <!-- Logo -->
          <div class="flex flex-col items-center mb-8">
            <i class="pi pi-file text-primary text-5xl mb-3"></i>
            <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
              Tramite Online
            </h1>
            <p class="text-surface-600 dark:text-surface-400 mt-2">
              Sign in to your account
            </p>
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="flex flex-col gap-6">
              <!-- Email Field -->
              <div class="flex flex-col gap-2">
                <label
                  for="email"
                  class="text-surface-900 dark:text-surface-0 font-semibold"
                >
                  Email
                </label>
                <input
                  pInputText
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="Enter your email"
                  class="w-full"
                  [class.ng-invalid]="
                    loginForm.get('email')?.invalid && loginForm.get('email')?.touched
                  "
                />
                @if (
                  loginForm.get('email')?.invalid && loginForm.get('email')?.touched
                ) {
                  <small class="text-red-500">Please enter a valid email</small>
                }
              </div>

              <!-- Password Field -->
              <div class="flex flex-col gap-2">
                <label
                  for="password"
                  class="text-surface-900 dark:text-surface-0 font-semibold"
                >
                  Password
                </label>
                <p-password
                  id="password"
                  formControlName="password"
                  placeholder="Enter your password"
                  [toggleMask]="true"
                  [feedback]="false"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                />
                @if (
                  loginForm.get('password')?.invalid &&
                  loginForm.get('password')?.touched
                ) {
                  <small class="text-red-500">Password is required</small>
                }
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <p-checkbox
                    formControlName="rememberMe"
                    [binary]="true"
                    inputId="rememberMe"
                  />
                  <label
                    for="rememberMe"
                    class="text-surface-700 dark:text-surface-300"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  class="text-primary hover:underline text-sm"
                >
                  Forgot password?
                </a>
              </div>

              <!-- Submit Button -->
              <p-button
                label="Sign In"
                type="submit"
                [loading]="loading()"
                [disabled]="loginForm.invalid"
                styleClass="w-full"
              />

              <!-- Mock Credentials Info -->
              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <p class="text-sm text-blue-700 dark:text-blue-300 font-semibold mb-1">
                  Demo Credentials:
                </p>
                <p class="text-xs text-blue-600 dark:text-blue-400">
                  Email: admin&#64;test.com<br />
                  Password: admin
                </p>
              </div>

              <!-- Register Link -->
              <div class="text-center">
                <span class="text-surface-600 dark:text-surface-400">
                  Don't have an account?
                </span>
                <a
                  routerLink="/auth/register"
                  class="text-primary hover:underline ml-1 font-semibold"
                >
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  loading = signal(false);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, emailValidator()]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Login successful!',
        });

        // Get return URL from query params or default to dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: error.error?.message || 'Invalid credentials',
        });
      },
    });
  }
}
