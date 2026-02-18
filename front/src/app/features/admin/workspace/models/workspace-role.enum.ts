export enum WorkspaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  [WorkspaceRole.OWNER]: 'Owner',
  [WorkspaceRole.ADMIN]: 'Administrator',
  [WorkspaceRole.MEMBER]: 'Member',
  [WorkspaceRole.VIEWER]: 'Viewer'
};

export const WORKSPACE_ROLE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  [WorkspaceRole.OWNER]: ['*'], // All permissions
  [WorkspaceRole.ADMIN]: ['workspace:update', 'member:*', 'form:*'],
  [WorkspaceRole.MEMBER]: ['form:create', 'form:read', 'form:update'],
  [WorkspaceRole.VIEWER]: ['form:read']
};
