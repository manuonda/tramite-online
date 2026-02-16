/**
 * Register Page Component
 * User registration page
 */

import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/auth/services/auth.service';
import {
  emailValidator,
  passwordStrengthValidator,
  passwordMatchValidator,
} from '../../../../shared/utils/validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-950 px-4 py-8">
      <div class="w-full max-w-md">
        <!-- Card -->
        <div class="bg-surface-0 dark:bg-surface-900 rounded-lg shadow-lg p-8">
          <!-- Logo -->
          <div class="flex flex-col items-center mb-8">
            <i class="pi pi-file text-primary text-5xl mb-3"></i>
            <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0">
              Create Account
            </h1>
            <p class="text-surface-600 dark:text-surface-400 mt-2">
              Sign up for Tramite Online
            </p>
          </div>

          <!-- Register Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="flex flex-col gap-4">
              <!-- First Name -->
              <div class="flex flex-col gap-2">
                <label for="firstName" class="text-surface-900 dark:text-surface-0 font-semibold">
                  First Name
                </label>
                <input
                  pInputText
                  id="firstName"
                  formControlName="firstName"
                  placeholder="Enter your first name"
                  class="w-full"
                />
              </div>

              <!-- Last Name -->
              <div class="flex flex-col gap-2">
                <label for="lastName" class="text-surface-900 dark:text-surface-0 font-semibold">
                  Last Name
                </label>
                <input
                  pInputText
                  id="lastName"
                  formControlName="lastName"
                  placeholder="Enter your last name"
                  class="w-full"
                />
              </div>

              <!-- Email -->
              <div class="flex flex-col gap-2">
                <label for="email" class="text-surface-900 dark:text-surface-0 font-semibold">
                  Email
                </label>
                <input
                  pInputText
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="Enter your email"
                  class="w-full"
                />
                @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                  <small class="text-red-500">Please enter a valid email</small>
                }
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-2">
                <label for="password" class="text-surface-900 dark:text-surface-0 font-semibold">
                  Password
                </label>
                <p-password
                  id="password"
                  formControlName="password"
                  placeholder="Create a password"
                  [toggleMask]="true"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  [strongRegex]="'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})'"
                />
                @if (registerForm.get('password')?.errors && registerForm.get('password')?.touched) {
                  <small class="text-red-500">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </small>
                }
              </div>

              <!-- Confirm Password -->
              <div class="flex flex-col gap-2">
                <label for="confirmPassword" class="text-surface-900 dark:text-surface-0 font-semibold">
                  Confirm Password
                </label>
                <p-password
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  placeholder="Confirm your password"
                  [toggleMask]="true"
                  [feedback]="false"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                />
                @if (registerForm.get('confirmPassword')?.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched) {
                  <small class="text-red-500">Passwords do not match</small>
                }
              </div>

              <!-- Submit Button -->
              <p-button
                label="Create Account"
                type="submit"
                [loading]="loading()"
                [disabled]="registerForm.invalid"
                styleClass="w-full mt-4"
              />

              <!-- Login Link -->
              <div class="text-center">
                <span class="text-surface-600 dark:text-surface-400">
                  Already have an account?
                </span>
                <a routerLink="/auth/login" class="text-primary hover:underline ml-1 font-semibold">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = signal(false);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, emailValidator()]],
    password: ['', [Validators.required, passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required, passwordMatchValidator('password')]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { confirmPassword, ...registrationData } = this.registerForm.value;

    this.authService.register(registrationData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Registration successful! Please login.',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Registration Failed',
          detail: error.error?.message || 'Registration failed. Please try again.',
        });
      },
    });
  }
}
