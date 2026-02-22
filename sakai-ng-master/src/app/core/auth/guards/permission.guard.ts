import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '@core/auth/services/permission.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);
    const permissions = route.data['permissions'] as string[] | undefined;

    if (!permissions || permissions.length === 0) return true;

    if (permissionService.hasAllPermissions(permissions)) {
        return true;
    }

    return router.createUrlTree(['/access-denied']);
};
