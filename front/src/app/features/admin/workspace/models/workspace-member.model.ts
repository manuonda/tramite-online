import { WorkspaceRole, WORKSPACE_ROLE_LABELS } from './workspace-role.enum';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  role: WorkspaceRole;
  invitedBy?: string;
  joinedAt: Date;
}

export interface WorkspaceMemberDTO {
  id: string;
  workspace_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_avatar?: string;
  role: string;
  invited_by?: string;
  joined_at: string;
}

export function mapDTOToMember(dto: WorkspaceMemberDTO): WorkspaceMember {
  return {
    id: dto.id,
    workspaceId: dto.workspace_id,
    userId: dto.user_id,
    userEmail: dto.user_email,
    userName: dto.user_name,
    userAvatar: dto.user_avatar,
    role: dto.role as WorkspaceRole,
    invitedBy: dto.invited_by,
    joinedAt: new Date(dto.joined_at)
  };
}

export function getRoleLabel(role: WorkspaceRole): string {
  return WORKSPACE_ROLE_LABELS[role] || role;
}

export function canManageMembers(role: WorkspaceRole): boolean {
  return role === WorkspaceRole.OWNER || role === WorkspaceRole.ADMIN;
}
