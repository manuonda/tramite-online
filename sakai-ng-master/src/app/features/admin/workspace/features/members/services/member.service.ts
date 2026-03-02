import { Injectable, signal, computed } from '@angular/core';
import {
    WorkspaceMember, WorkspaceRole, InviteMemberDto, UpdateMemberDto,
    getAvatarColor, getInitials
} from '../models/member.model';

// ─── Mock Data ────────────────────────────────────────────────────────────────

function makeMember(
    id: string, workspaceId: string, userId: string,
    name: string, email: string, role: WorkspaceRole,
    status: 'active' | 'pending', joinedAt: string
): WorkspaceMember {
    const color = getAvatarColor(name);
    return {
        id, workspaceId, userId, name, email, role, status,
        avatarInitials: getInitials(name),
        avatarColor: color.bg,
        joinedAt,
    };
}

const MOCK_MEMBERS: WorkspaceMember[] = [
    // Workspace 1 — Secretaría de Obras
    makeMember('m1', '1', 'u1', 'Juan García',        'juan.garcia@municipio.gob.ar',    'admin',    'active',  '2025-09-01T08:00:00Z'),
    makeMember('m2', '1', 'u2', 'María López',        'maria.lopez@municipio.gob.ar',    'editor',   'active',  '2025-09-15T09:00:00Z'),
    makeMember('m3', '1', 'u3', 'Carlos Rodríguez',   'c.rodriguez@municipio.gob.ar',   'operator', 'active',  '2025-10-01T10:00:00Z'),
    makeMember('m4', '1', 'u4', 'Ana Martínez',       'ana.martinez@municipio.gob.ar',  'viewer',   'pending', '2026-01-20T11:00:00Z'),
    makeMember('m5', '1', 'u5', 'Roberto Sánchez',    'r.sanchez@municipio.gob.ar',     'editor',   'active',  '2025-11-10T08:30:00Z'),

    // Workspace 2 — Habilitaciones Comerciales
    makeMember('m6', '2', 'u1', 'Juan García',        'juan.garcia@municipio.gob.ar',    'admin',    'active',  '2025-09-01T08:00:00Z'),
    makeMember('m7', '2', 'u6', 'Laura Fernández',    'l.fernandez@municipio.gob.ar',   'editor',   'active',  '2025-12-01T09:00:00Z'),
    makeMember('m8', '2', 'u7', 'Diego Torres',       'diego.torres@municipio.gob.ar',  'viewer',   'pending', '2026-01-10T10:00:00Z'),

    // Workspace 3 — Atención al Ciudadano
    makeMember('m9', '3', 'u1', 'Juan García',        'juan.garcia@municipio.gob.ar',    'admin',    'active',  '2025-09-01T08:00:00Z'),
];

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class MemberService {

    private readonly _members = signal<WorkspaceMember[]>([...MOCK_MEMBERS]);

    getMembersForWorkspace(workspaceId: string): WorkspaceMember[] {
        return this._members().filter(m => m.workspaceId === workspaceId);
    }

    readonly all = computed(() => this._members());

    invite(workspaceId: string, dto: InviteMemberDto): WorkspaceMember {
        const color = getAvatarColor(dto.name);
        const member: WorkspaceMember = {
            id: generateId(),
            workspaceId,
            userId: generateId(),
            name: dto.name,
            email: dto.email,
            role: dto.role,
            status: 'pending',
            avatarInitials: getInitials(dto.name),
            avatarColor: color.bg,
            joinedAt: new Date().toISOString(),
        };
        this._members.update(list => [...list, member]);
        return member;
    }

    changeRole(memberId: string, role: WorkspaceRole): void {
        this._members.update(list =>
            list.map(m => m.id === memberId ? { ...m, role } : m)
        );
    }

    updateMember(memberId: string, dto: UpdateMemberDto): void {
        const color = getAvatarColor(dto.name);
        this._members.update(list =>
            list.map(m => m.id === memberId ? {
                ...m,
                name: dto.name,
                email: dto.email,
                role: dto.role,
                status: dto.status,
                avatarInitials: getInitials(dto.name),
                avatarColor: color.bg,
            } : m)
        );
    }

    removeMember(memberId: string): void {
        this._members.update(list => list.filter(m => m.id !== memberId));
    }

    resendInvitation(memberId: string): void {
        // In production this would call an API endpoint
        // For mock, just update the joinedAt to simulate re-send
        this._members.update(list =>
            list.map(m => m.id === memberId
                ? { ...m, joinedAt: new Date().toISOString() }
                : m
            )
        );
    }
}
