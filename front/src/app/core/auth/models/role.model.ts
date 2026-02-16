/**
 * Role Model
 * Represents a user role with associated permissions
 */

import { Permission } from './permission.model';

export type RoleName = 'admin' | 'manager' | 'member' | 'guest';

export interface Role {
  id: string;
  name: RoleName;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean; // System roles cannot be deleted
}

/**
 * Helper to check if user has a specific role
 */
export function hasRole(userRoles: Role[], roleName: RoleName): boolean {
  return userRoles.some((r) => r.name === roleName);
}

/**
 * Helper to check if user has any of the specified roles
 */
export function hasAnyRole(userRoles: Role[], roleNames: RoleName[]): boolean {
  return userRoles.some((r) => roleNames.includes(r.name));
}

/**
 * Predefined system roles (will come from backend in production)
 */
export const SYSTEM_ROLES: Readonly<Record<RoleName, Omit<Role, 'id'>>> = {
  admin: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access',
    permissions: [], // All permissions
    isSystem: true,
  },
  manager: {
    name: 'manager',
    displayName: 'Manager',
    description: 'Can manage workspaces and users',
    permissions: [],
    isSystem: true,
  },
  member: {
    name: 'member',
    displayName: 'Member',
    description: 'Basic workspace member',
    permissions: [],
    isSystem: true,
  },
  guest: {
    name: 'guest',
    displayName: 'Guest',
    description: 'Read-only access',
    permissions: [],
    isSystem: true,
  },
} as const;
