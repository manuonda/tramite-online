/**
 * Root App Component
 * Entry point of the application
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoadingSpinnerComponent } from './app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    ToastModule,
    ConfirmDialogModule,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Toast for global notifications -->
    <p-toast position="top-right" />

    <!-- Confirm Dialog for global confirmations -->
    <p-confirmDialog />

    <!-- Global Loading Spinner -->
    <app-loading-spinner />

    <!-- Main Router Outlet -->
    <router-outlet />
  `,
})
export class AppComponent {}
