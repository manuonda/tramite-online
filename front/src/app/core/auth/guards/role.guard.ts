/**
 * Role Guard
 * Protects routes based on user roles
 * Usage: Add to route data: { roles: ['admin', 'manager'] }
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { RoleName } from '../models/role.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as RoleName[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    console.warn('roleGuard used but no roles specified in route data');
    return true;
  }

  // Check if user has ANY of the required roles
  if (permissionService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // Redirect to access denied page
  router.navigate(['/access-denied']);
  return false;
};

/**
 * Guard for routes requiring ALL specified roles
 * Usage: Add to route data: { roles: ['admin', 'manager'] }
 */
export const allRolesGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as RoleName[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    console.warn('allRolesGuard used but no roles specified in route data');
    return true;
  }

  if (permissionService.hasAllRoles(requiredRoles)) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};

/**
 * Admin-only guard (shorthand)
 */
export const adminGuard: CanActivateFn = () => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  if (permissionService.isAdmin()) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};
