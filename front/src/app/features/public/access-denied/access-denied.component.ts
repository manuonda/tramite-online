/**
 * Access Denied Page (403)
 * Shown when user doesn't have permission for a resource
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-950 px-4">
      <div class="text-center max-w-md">
        <div class="mb-8">
          <i class="pi pi-lock text-red-500 text-8xl mb-4"></i>
          <h1 class="text-6xl font-bold text-surface-900 dark:text-surface-0 mb-4">
            403
          </h1>
          <h2 class="text-2xl font-semibold text-surface-700 dark:text-surface-300 mb-4">
            Access Denied
          </h2>
          <p class="text-surface-600 dark:text-surface-400 mb-8">
            You don't have permission to access this resource.
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <p-button
            label="Go Back"
            icon="pi pi-arrow-left"
            [text]="true"
            (onClick)="goBack()"
          />
          <p-button
            label="Go to Dashboard"
            icon="pi pi-home"
            routerLink="/admin/dashboard"
          />
        </div>
      </div>
    </div>
  `,
})
export class AccessDeniedComponent {
  goBack(): void {
    window.history.back();
  }
}
