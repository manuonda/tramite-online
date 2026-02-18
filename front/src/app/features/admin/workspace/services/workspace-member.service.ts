import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { WorkspaceMember, mapDTOToMember } from '../models/workspace-member.model';
import { WorkspaceRole } from '../models/workspace-role.enum';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceMemberService {
  private apiService = inject(ApiService);
  private useMock = true;

  private membersSignal = signal<WorkspaceMember[]>([]);
  readonly members = this.membersSignal.asReadonly();

  /**
   * Get members of a workspace
   */
  getMembers(workspaceId: string): Observable<WorkspaceMember[]> {
    if (this.useMock) {
      return this.getMockMembers(workspaceId);
    }

    return this.apiService.get<any[]>(`/workspaces/${workspaceId}/members`).pipe(
      map(dtos => dtos.map(mapDTOToMember)),
      tap(members => this.membersSignal.set(members))
    );
  }

  /**
   * Add member to workspace
   */
  addMember(workspaceId: string, email: string, role: WorkspaceRole): Observable<WorkspaceMember> {
    if (this.useMock) {
      return this.mockAddMember(workspaceId, email, role);
    }

    return this.apiService.post<any>(`/workspaces/${workspaceId}/members`, { email, role }).pipe(
      map(mapDTOToMember),
      tap(member => this.membersSignal.update(m => [...m, member]))
    );
  }

  /**
   * Update member role
   */
  updateMemberRole(workspaceId: string, memberId: string, role: WorkspaceRole): Observable<WorkspaceMember> {
    if (this.useMock) {
      return this.mockUpdateMemberRole(workspaceId, memberId, role);
    }

    return this.apiService.put<any>(`/workspaces/${workspaceId}/members/${memberId}`, { role }).pipe(
      map(mapDTOToMember),
      tap(member => this.membersSignal.update(m =>
        m.map(mem => mem.id === memberId ? member : mem)
      ))
    );
  }

  /**
   * Remove member from workspace
   */
  removeMember(workspaceId: string, memberId: string): Observable<void> {
    if (this.useMock) {
      return this.mockRemoveMember(memberId);
    }

    return this.apiService.delete<void>(`/workspaces/${workspaceId}/members/${memberId}`).pipe(
      tap(() => this.membersSignal.update(m => m.filter(mem => mem.id !== memberId)))
    );
  }

  // ==================== MOCK METHODS ====================

  private mockMembers: Record<string, WorkspaceMember[]> = {
    '1': [
      {
        id: 'm1',
        workspaceId: '1',
        userId: '1',
        userEmail: 'admin@test.com',
        userName: 'Admin User',
        userAvatar: 'https://ui-avatars.com/api/?name=Admin+User',
        role: WorkspaceRole.OWNER,
        joinedAt: new Date('2024-01-15')
      },
      {
        id: 'm2',
        workspaceId: '1',
        userId: '2',
        userEmail: 'john@test.com',
        userName: 'John Doe',
        role: WorkspaceRole.ADMIN,
        invitedBy: '1',
        joinedAt: new Date('2024-01-20')
      },
      {
        id: 'm3',
        workspaceId: '1',
        userId: '3',
        userEmail: 'jane@test.com',
        userName: 'Jane Smith',
        role: WorkspaceRole.MEMBER,
        invitedBy: '1',
        joinedAt: new Date('2024-01-25')
      }
    ],
    '2': [
      {
        id: 'm4',
        workspaceId: '2',
        userId: '1',
        userEmail: 'admin@test.com',
        userName: 'Admin User',
        role: WorkspaceRole.OWNER,
        joinedAt: new Date('2024-01-20')
      },
      {
        id: 'm5',
        workspaceId: '2',
        userId: '4',
        userEmail: 'mary@test.com',
        userName: 'Mary Johnson',
        role: WorkspaceRole.MEMBER,
        invitedBy: '1',
        joinedAt: new Date('2024-01-22')
      }
    ],
    '3': [
      {
        id: 'm6',
        workspaceId: '3',
        userId: '1',
        userEmail: 'admin@test.com',
        userName: 'Admin User',
        role: WorkspaceRole.OWNER,
        joinedAt: new Date('2024-02-01')
      }
    ]
  };

  private getMockMembers(workspaceId: string): Observable<WorkspaceMember[]> {
    const members = this.mockMembers[workspaceId] || [];
    return of(members).pipe(
      delay(300),
      tap(m => this.membersSignal.set(m))
    );
  }

  private mockAddMember(workspaceId: string, email: string, role: WorkspaceRole): Observable<WorkspaceMember> {
    const newMember: WorkspaceMember = {
      id: 'm' + Date.now(),
      workspaceId,
      userId: String(Date.now()),
      userEmail: email,
      userName: email.split('@')[0],
      role,
      invitedBy: '1',
      joinedAt: new Date()
    };

    if (!this.mockMembers[workspaceId]) {
      this.mockMembers[workspaceId] = [];
    }
    this.mockMembers[workspaceId].push(newMember);

    return of(newMember).pipe(
      delay(500),
      tap(m => this.membersSignal.update(members => [...members, m]))
    );
  }

  private mockUpdateMemberRole(workspaceId: string, memberId: string, role: WorkspaceRole): Observable<WorkspaceMember> {
    const members = this.mockMembers[workspaceId] || [];
    const member = members.find(m => m.id === memberId);

    if (!member) {
      return throwError(() => new Error('Member not found'));
    }

    member.role = role;

    return of(member).pipe(
      delay(300),
      tap(m => this.membersSignal.update(members =>
        members.map(mem => mem.id === memberId ? m : mem)
      ))
    );
  }

  private mockRemoveMember(memberId: string): Observable<void> {
    Object.keys(this.mockMembers).forEach(workspaceId => {
      this.mockMembers[workspaceId] = this.mockMembers[workspaceId].filter(m => m.id !== memberId);
    });

    return of(undefined).pipe(
      delay(300),
      tap(() => this.membersSignal.update(m => m.filter(mem => mem.id !== memberId)))
    );
  }
}
