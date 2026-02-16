/**
 * User Model
 * Represents authenticated user with roles and permissions
 */

import { Role } from './role.model';
import { Permission } from './permission.model';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: Role[];
  permissions: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User display helpers
 */
export function getUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getUserInitials(user: User): string {
  const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
}

/**
 * User DTO for API responses
 */
export interface UserDTO {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  roles: Array<{
    id: string;
    name: string;
    display_name: string;
    description: string;
    permissions: Array<{
      id: string;
      resource: string;
      action: string;
      scope?: string;
    }>;
  }>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Map DTO to User model
 */
export function mapDTOToUser(dto: UserDTO): User {
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.first_name,
    lastName: dto.last_name,
    avatar: dto.avatar,
    roles: dto.roles.map((r) => ({
      id: r.id,
      name: r.name as any,
      displayName: r.display_name,
      description: r.description,
      permissions: r.permissions.map((p) => ({
        id: p.id,
        resource: p.resource,
        action: p.action as any,
        scope: p.scope as any,
      })),
    })),
    permissions: dto.roles.flatMap((r) =>
      r.permissions.map((p) => ({
        id: p.id,
        resource: p.resource,
        action: p.action as any,
        scope: p.scope as any,
      }))
    ),
    createdAt: dto.created_at ? new Date(dto.created_at) : undefined,
    updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
  };
}
