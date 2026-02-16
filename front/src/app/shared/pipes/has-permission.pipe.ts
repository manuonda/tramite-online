/**
 * Has Permission Pipe
 * Check if user has a specific permission in templates
 * Usage: *ngIf="'workspace:create' | hasPermission"
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionService } from '../../core/auth/services/permission.service';

@Pipe({
  name: 'hasPermission',
  standalone: true,
  pure: false, // Make it impure to react to permission changes
})
export class HasPermissionPipe implements PipeTransform {
  private permissionService = inject(PermissionService);

  transform(permission: string): boolean {
    if (!permission) return false;

    const [resource, action] = permission.split(':');

    if (!resource || !action) {
      console.warn('Invalid permission format. Use "resource:action"');
      return false;
    }

    return this.permissionService.hasPermission(resource, action);
  }
}
