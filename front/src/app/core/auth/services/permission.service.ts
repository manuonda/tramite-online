/**
 * Permission Service
 * Manages permission checks and validation
 */

import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { Permission, hasPermission } from '../models/permission.model';
import { RoleName, hasRole, hasAnyRole } from '../models/role.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private authService = inject(AuthService);

  // Computed signals for reactive permission checks
  readonly userPermissions = this.authService.permissions;
  readonly userRoles = this.authService.roles;

  /**
   * Check if user has a specific permission
   */
  hasPermission(resource: string, action: string, scope?: string): boolean {
    const permissions = this.userPermissions();
    return hasPermission(
      permissions,
      resource,
      action as any,
      scope as any
    );
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  hasAllPermissions(requiredPermissions: Array<{ resource: string; action: string }>): boolean {
    return requiredPermissions.every((perm) =>
      this.hasPermission(perm.resource, perm.action)
    );
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  hasAnyPermission(requiredPermissions: Array<{ resource: string; action: string }>): boolean {
    return requiredPermissions.some((perm) =>
      this.hasPermission(perm.resource, perm.action)
    );
  }

  /**
   * Check if user has a specific role
   */
  hasRole(roleName: RoleName): boolean {
    const roles = this.userRoles();
    return hasRole(roles, roleName);
  }

  /**
   * Check if user has ANY of the specified roles
   */
  hasAnyRole(roleNames: RoleName[]): boolean {
    const roles = this.userRoles();
    return hasAnyRole(roles, roleNames);
  }

  /**
   * Check if user has ALL of the specified roles
   */
  hasAllRoles(roleNames: RoleName[]): boolean {
    const roles = this.userRoles();
    return roleNames.every((roleName) => hasRole(roles, roleName));
  }

  /**
   * Get all permissions for a specific resource
   */
  getResourcePermissions(resource: string): Permission[] {
    return this.userPermissions().filter((p: Permission) => p.resource === resource);
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is manager or admin
   */
  isManagerOrAdmin(): boolean {
    return this.hasAnyRole(['admin', 'manager']);
  }
}
