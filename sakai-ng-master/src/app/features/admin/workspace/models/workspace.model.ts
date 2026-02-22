export type WorkspaceStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export const WORKSPACE_COLORS = [
    '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
] as const;

export const WORKSPACE_ICONS = [
    'pi pi-folder-open', 'pi pi-users', 'pi pi-clipboard',
    'pi pi-phone', 'pi pi-file'
] as const;

export type WorkspaceColor = typeof WORKSPACE_COLORS[number];
export type WorkspaceIcon = typeof WORKSPACE_ICONS[number];

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    slug: string;
    status: WorkspaceStatus;
    membersCount: number;
    formsCount: number;
    color: string;
    icon: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface CreateWorkspaceDto {
    name: string;
    description?: string;
    slug: string;
    color: string;
    icon: string;
}

export interface UpdateWorkspaceDto {
    name?: string;
    description?: string;
    status?: WorkspaceStatus;
    color?: string;
    icon?: string;
}

export interface WorkspaceFilter {
    name: string;
    status: WorkspaceStatus | '';
}

export const WORKSPACE_STATUS_LABELS: Record<WorkspaceStatus, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    ARCHIVED: 'Archivado'
};
