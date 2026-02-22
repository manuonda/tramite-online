import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
    private readonly authService = inject(AuthService);

    can(permission: string): boolean {
        const user = this.authService.currentUser();
        if (!user) return false;
        return user.roles.some(role =>
            role.permissions.some(p => p.name === permission)
        );
    }

    hasRole(role: string): boolean {
        const user = this.authService.currentUser();
        if (!user) return false;
        return user.roles.some(r => r.name === role);
    }

    hasAnyRole(roles: string[]): boolean {
        return roles.some(role => this.hasRole(role));
    }

    hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(p => this.can(p));
    }
}
