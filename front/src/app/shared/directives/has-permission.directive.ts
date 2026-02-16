/**
 * Has Permission Directive
 * Shows/hides elements based on user permissions
 * Usage: <button *hasPermission="'workspace:create'">Create</button>
 */

import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
} from '@angular/core';
import { PermissionService } from '../../core/auth/services/permission.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private hasView = false;

  @Input() set hasPermission(permission: string) {
    this.updateView(permission);
  }

  constructor() {
    // React to permission changes
    effect(() => {
      // Access permissions to trigger effect
      this.permissionService.userPermissions();
      // Re-evaluate on permission changes
      const currentPermission = this.getCurrentPermission();
      if (currentPermission) {
        this.updateView(currentPermission);
      }
    });
  }

  private currentPermission: string | null = null;

  private getCurrentPermission(): string | null {
    return this.currentPermission;
  }

  private updateView(permission: string): void {
    this.currentPermission = permission;

    if (!permission) {
      this.removeView();
      return;
    }

    const [resource, action] = permission.split(':');

    if (!resource || !action) {
      console.warn('Invalid permission format. Use "resource:action"');
      this.removeView();
      return;
    }

    const hasPermission = this.permissionService.hasPermission(resource, action);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.removeView();
    }
  }

  private removeView(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }
}
