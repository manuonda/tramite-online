/**
 * Loading Spinner Component
 * Global loading overlay with debounce
 */

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [ProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadingService.isLoading()) {
      <div
        class="fixed inset-0 bg-surface-900/70 dark:bg-surface-950/80 z-[9999] flex items-center justify-center backdrop-blur-sm"
      >
        <div class="flex flex-col items-center gap-4">
          <p-progressSpinner
            styleClass="w-16 h-16"
            strokeWidth="4"
            animationDuration="1s"
          />
          <p class="text-surface-0 text-sm font-medium">Loading...</p>
        </div>
      </div>
    }
  `,
})
export class LoadingSpinnerComponent {
  loadingService = inject(LoadingService);
}
