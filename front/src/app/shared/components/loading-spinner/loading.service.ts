/**
 * Loading Service
 * Manages global loading state with debounce
 */

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingCount = 0;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_TIME = 200; // ms

  // Public signal
  private loadingSignal = signal<boolean>(false);
  readonly isLoading = this.loadingSignal.asReadonly();

  /**
   * Show loading spinner with debounce
   */
  show(): void {
    this.loadingCount++;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Only show spinner if loading takes longer than debounce time
    this.debounceTimer = setTimeout(() => {
      if (this.loadingCount > 0) {
        this.loadingSignal.set(true);
      }
    }, this.DEBOUNCE_TIME);
  }

  /**
   * Hide loading spinner
   */
  hide(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);

    if (this.loadingCount === 0) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      this.loadingSignal.set(false);
    }
  }

  /**
   * Force hide (clear all pending loads)
   */
  forceHide(): void {
    this.loadingCount = 0;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.loadingSignal.set(false);
  }
}
