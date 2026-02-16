/**
 * Public Header Component
 * Simple header for public pages (landing, forms)
 */

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center gap-2">
              <i class="pi pi-file text-primary text-2xl"></i>
              <span class="text-xl font-bold text-surface-900 dark:text-surface-0">
                Tramite Online
              </span>
            </a>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <a
              routerLink="/home"
              routerLinkActive="text-primary"
              class="text-surface-700 dark:text-surface-300 hover:text-primary transition-colors"
            >
              Home
            </a>
            <a
              routerLink="/forms"
              routerLinkActive="text-primary"
              class="text-surface-700 dark:text-surface-300 hover:text-primary transition-colors"
            >
              Forms
            </a>
          </nav>

          <!-- Auth Buttons -->
          <div class="flex items-center gap-2">
            @if (!authService.isAuthenticated()) {
              <p-button
                label="Login"
                [text]="true"
                (onClick)="navigateToLogin()"
              />
              <p-button
                label="Sign Up"
                (onClick)="navigateToRegister()"
              />
            } @else {
              <p-button
                label="Dashboard"
                icon="pi pi-th-large"
                (onClick)="navigateToDashboard()"
              />
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class PublicHeaderComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
