/**
 * Confirm Dialog Service
 * Wrapper around PrimeNG ConfirmationService with simplified API
 */

import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export interface ConfirmOptions {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private confirmationService = inject(ConfirmationService);

  /**
   * Show confirmation dialog
   */
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: options.message,
        header: options.header || 'Confirmation',
        icon: options.icon || 'pi pi-exclamation-triangle',
        acceptLabel: options.acceptLabel || 'Yes',
        rejectLabel: options.rejectLabel || 'No',
        acceptButtonStyleClass: options.acceptButtonStyleClass || 'p-button-primary',
        rejectButtonStyleClass: options.rejectButtonStyleClass || 'p-button-text',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  /**
   * Delete confirmation (pre-configured)
   */
  confirmDelete(itemName?: string): Promise<boolean> {
    const message = itemName
      ? `Are you sure you want to delete "${itemName}"?`
      : 'Are you sure you want to delete this item?';

    return this.confirm({
      message,
      header: 'Delete Confirmation',
      icon: 'pi pi-trash',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
    });
  }

  /**
   * Discard changes confirmation
   */
  confirmDiscard(): Promise<boolean> {
    return this.confirm({
      message: 'You have unsaved changes. Are you sure you want to discard them?',
      header: 'Unsaved Changes',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Discard',
      rejectLabel: 'Keep Editing',
      acceptButtonStyleClass: 'p-button-warning',
    });
  }

  /**
   * Archive confirmation
   */
  confirmArchive(itemName?: string): Promise<boolean> {
    const message = itemName
      ? `Are you sure you want to archive "${itemName}"?`
      : 'Are you sure you want to archive this item?';

    return this.confirm({
      message,
      header: 'Archive Confirmation',
      icon: 'pi pi-inbox',
      acceptLabel: 'Archive',
      rejectLabel: 'Cancel',
    });
  }
}
