import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '@core/auth/services/permission.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);
    const roles = route.data['roles'] as string[] | undefined;

    if (!roles || roles.length === 0) return true;

    if (permissionService.hasAnyRole(roles)) {
        return true;
    }

    return router.createUrlTree(['/access-denied']);
};
