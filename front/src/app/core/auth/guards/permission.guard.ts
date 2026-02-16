/**
 * Permission Guard
 * Protects routes based on specific permissions
 * Usage: Add to route data: { permission: 'workspace:read' }
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Get required permission from route data
  const requiredPermission = route.data['permission'] as string | undefined;

  if (!requiredPermission) {
    console.warn('permissionGuard used but no permission specified in route data');
    return true;
  }

  // Parse permission string (format: "resource:action")
  const [resource, action] = requiredPermission.split(':');

  if (!resource || !action) {
    console.error('Invalid permission format. Use "resource:action"');
    return false;
  }

  // Check if user has the required permission
  if (permissionService.hasPermission(resource, action)) {
    return true;
  }

  // Redirect to access denied page
  router.navigate(['/access-denied']);
  return false;
};

/**
 * Guard for routes requiring ANY of multiple permissions
 * Usage: Add to route data: { permissions: ['workspace:read', 'workspace:update'] }
 */
export const anyPermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredPermissions = route.data['permissions'] as string[] | undefined;

  if (!requiredPermissions || requiredPermissions.length === 0) {
    console.warn('anyPermissionGuard used but no permissions specified in route data');
    return true;
  }

  // Parse and check permissions
  const parsedPermissions = requiredPermissions.map((perm) => {
    const [resource, action] = perm.split(':');
    return { resource, action };
  });

  if (permissionService.hasAnyPermission(parsedPermissions)) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};

/**
 * Guard for routes requiring ALL of multiple permissions
 * Usage: Add to route data: { permissions: ['workspace:read', 'workspace:update'] }
 */
export const allPermissionsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredPermissions = route.data['permissions'] as string[] | undefined;

  if (!requiredPermissions || requiredPermissions.length === 0) {
    console.warn('allPermissionsGuard used but no permissions specified in route data');
    return true;
  }

  const parsedPermissions = requiredPermissions.map((perm) => {
    const [resource, action] = perm.split(':');
    return { resource, action };
  });

  if (permissionService.hasAllPermissions(parsedPermissions)) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};
