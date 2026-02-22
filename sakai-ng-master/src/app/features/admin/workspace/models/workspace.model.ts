export type WorkspaceStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    slug: string;
    status: WorkspaceStatus;
    membersCount: number;
    formsCount: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface CreateWorkspaceDto {
    name: string;
    description?: string;
    slug: string;
}

export interface UpdateWorkspaceDto {
    name?: string;
    description?: string;
    status?: WorkspaceStatus;
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
