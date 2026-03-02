// ─── Roles ────────────────────────────────────────────────────────────────────

export type WorkspaceRole = 'admin' | 'editor' | 'operator' | 'viewer';

export interface WorkspaceRoleConfig {
    label: string;
    description: string;
    icon: string;
    color: string;
    bg: string;
    textClass: string;
    bgClass: string;
}

export const WORKSPACE_ROLE_CONFIG: Record<WorkspaceRole, WorkspaceRoleConfig> = {
    admin: {
        label: 'Administrador',
        description: 'Control total: gestiona miembros, formularios y configuración',
        icon: 'pi pi-shield',
        color: '#dc2626',
        bg: '#fef2f2',
        textClass: 'text-red-700 dark:text-red-400',
        bgClass: 'bg-red-100 dark:bg-red-950',
    },
    editor: {
        label: 'Editor',
        description: 'Crea y edita formularios, gestiona dominios y ve respuestas',
        icon: 'pi pi-pencil',
        color: '#2563eb',
        bg: '#eff6ff',
        textClass: 'text-blue-700 dark:text-blue-400',
        bgClass: 'bg-blue-100 dark:bg-blue-950',
    },
    operator: {
        label: 'Operador',
        description: 'Ejecuta formularios presencialmente en nombre de ciudadanos',
        icon: 'pi pi-play',
        color: '#7c3aed',
        bg: '#f5f3ff',
        textClass: 'text-violet-700 dark:text-violet-400',
        bgClass: 'bg-violet-100 dark:bg-violet-950',
    },
    viewer: {
        label: 'Visualizador',
        description: 'Solo lectura: ve formularios y estadísticas sin poder editar',
        icon: 'pi pi-eye',
        color: '#059669',
        bg: '#ecfdf5',
        textClass: 'text-emerald-700 dark:text-emerald-400',
        bgClass: 'bg-emerald-100 dark:bg-emerald-950',
    },
};

// ─── Member ───────────────────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'pending';

export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    name: string;
    email: string;
    role: WorkspaceRole;
    status: MemberStatus;
    avatarInitials: string;
    avatarColor: string;
    joinedAt: string;
}

export interface InviteMemberDto {
    email: string;
    name: string;
    role: WorkspaceRole;
}

export interface UpdateMemberDto {
    email: string;
    name: string;
    role: WorkspaceRole;
    status: MemberStatus;
}

// Avatar color palette for initials
export const AVATAR_COLORS = [
    { bg: '#dbeafe', text: '#1d4ed8' },
    { bg: '#dcfce7', text: '#15803d' },
    { bg: '#fce7f3', text: '#be185d' },
    { bg: '#fef3c7', text: '#b45309' },
    { bg: '#ede9fe', text: '#6d28d9' },
    { bg: '#ffedd5', text: '#c2410c' },
    { bg: '#e0f2fe', text: '#0369a1' },
    { bg: '#f0fdf4', text: '#166534' },
] as const;

export function getAvatarColor(name: string): { bg: string; text: string } {
    const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

export function getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}
