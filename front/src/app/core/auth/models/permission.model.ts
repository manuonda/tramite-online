/**
 * Permission Model
 * Represents a granular permission for RBAC system
 */

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type PermissionScope = 'own' | 'workspace' | 'global';

export interface Permission {
  id: string;
  resource: string;
  action: PermissionAction;
  scope?: PermissionScope;
}

/**
 * Helper to check if a permission matches criteria
 */
export function hasPermission(
  userPermissions: Permission[],
  resource: string,
  action: PermissionAction,
  scope?: PermissionScope
): boolean {
  return userPermissions.some(
    (p) =>
      p.resource === resource &&
      p.action === action &&
      (!scope || p.scope === scope)
  );
}

/**
 * Common permission constants for the application
 */
export const PERMISSIONS = {
  WORKSPACE: {
    CREATE: { resource: 'workspace', action: 'create' as PermissionAction },
    READ: { resource: 'workspace', action: 'read' as PermissionAction },
    UPDATE: { resource: 'workspace', action: 'update' as PermissionAction },
    DELETE: { resource: 'workspace', action: 'delete' as PermissionAction },
  },
  FORM: {
    CREATE: { resource: 'form', action: 'create' as PermissionAction },
    READ: { resource: 'form', action: 'read' as PermissionAction },
    UPDATE: { resource: 'form', action: 'update' as PermissionAction },
    DELETE: { resource: 'form', action: 'delete' as PermissionAction },
  },
  USER: {
    CREATE: { resource: 'user', action: 'create' as PermissionAction },
    READ: { resource: 'user', action: 'read' as PermissionAction },
    UPDATE: { resource: 'user', action: 'update' as PermissionAction },
    DELETE: { resource: 'user', action: 'delete' as PermissionAction },
  },
} as const;
