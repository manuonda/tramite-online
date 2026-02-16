/**
 * Permission Badge Component
 * Displays a permission in a styled badge
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';

type PermissionSeverity = 'success' | 'info' | 'warn' | 'danger';

@Component({
  selector: 'app-permission-badge',
  standalone: true,
  imports: [TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-tag
      [value]="displayValue"
      [severity]="severity"
      [icon]="icon"
      styleClass="text-xs"
    />
  `,
})
export class PermissionBadgeComponent {
  @Input() resource: string = '';
  @Input() action: string = '';

  get displayValue(): string {
    return `${this.resource}:${this.action}`;
  }

  get severity(): PermissionSeverity {
    switch (this.action) {
      case 'create':
        return 'success';
      case 'read':
        return 'info';
      case 'update':
        return 'warn';
      case 'delete':
        return 'danger';
      default:
        return 'info';
    }
  }

  get icon(): string {
    switch (this.action) {
      case 'create':
        return 'pi pi-plus';
      case 'read':
        return 'pi pi-eye';
      case 'update':
        return 'pi pi-pencil';
      case 'delete':
        return 'pi pi-trash';
      default:
        return 'pi pi-shield';
    }
  }
}
