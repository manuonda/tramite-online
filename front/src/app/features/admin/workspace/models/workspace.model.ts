export interface Workspace {
  id: string;
  name: string;
  description: string;
  slug: string; // URL-friendly name
  color?: string; // Para UI (ej: #3B82F6)
  icon?: string; // PrimeIcons class (ej: pi-briefcase)
  ownerId: string;
  memberCount: number;
  formCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO from API (snake_case)
export interface WorkspaceDTO {
  id: string;
  name: string;
  description: string;
  slug: string;
  color?: string;
  icon?: string;
  owner_id: string;
  member_count: number;
  form_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

// Mapping functions
export function mapDTOToWorkspace(dto: WorkspaceDTO): Workspace {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    slug: dto.slug,
    color: dto.color,
    icon: dto.icon,
    ownerId: dto.owner_id,
    memberCount: dto.member_count,
    formCount: dto.form_count,
    isArchived: dto.is_archived,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at)
  };
}

// Helper functions
export function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getWorkspaceIcon(workspace: Workspace): string {
  return workspace.icon || 'pi-briefcase';
}

export function getWorkspaceColor(workspace: Workspace): string {
  return workspace.color || '#3B82F6';
}
