import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { CacheService } from '../../../../core/services/cache.service';
import { Workspace, WorkspaceDTO, mapDTOToWorkspace, generateSlug } from '../models/workspace.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private apiService = inject(ApiService);
  private cacheService = inject(CacheService);

  // State
  private workspacesSignal = signal<Workspace[]>([]);
  readonly workspaces = this.workspacesSignal.asReadonly();

  private selectedWorkspaceSignal = signal<Workspace | null>(null);
  readonly selectedWorkspace = this.selectedWorkspaceSignal.asReadonly();

  // Mock data flag
  private useMock = true; // Cambiar a false cuando backend esté listo

  /**
   * Get all workspaces
   */
  getWorkspaces(): Observable<Workspace[]> {
    if (this.useMock) {
      return this.getMockWorkspaces();
    }

    const cached = this.cacheService.get<Workspace[]>('workspaces');
    if (cached) {
      this.workspacesSignal.set(cached);
      return of(cached);
    }

    return this.apiService.get<WorkspaceDTO[]>('/workspaces').pipe(
      map(dtos => dtos.map(mapDTOToWorkspace)),
      tap(workspaces => {
        this.workspacesSignal.set(workspaces);
        this.cacheService.set('workspaces', workspaces);
      })
    );
  }

  /**
   * Get workspace by ID
   */
  getWorkspace(id: string): Observable<Workspace> {
    if (this.useMock) {
      return this.getMockWorkspace(id);
    }

    return this.apiService.get<WorkspaceDTO>(`/workspaces/${id}`).pipe(
      map(mapDTOToWorkspace),
      tap(workspace => this.selectedWorkspaceSignal.set(workspace))
    );
  }

  /**
   * Create workspace
   */
  createWorkspace(data: Partial<Workspace>): Observable<Workspace> {
    if (this.useMock) {
      return this.mockCreateWorkspace(data);
    }

    return this.apiService.post<WorkspaceDTO>('/workspaces', data).pipe(
      map(mapDTOToWorkspace),
      tap(workspace => {
        this.workspacesSignal.update(ws => [...ws, workspace]);
        this.cacheService.delete('workspaces');
      })
    );
  }

  /**
   * Update workspace
   */
  updateWorkspace(id: string, data: Partial<Workspace>): Observable<Workspace> {
    if (this.useMock) {
      return this.mockUpdateWorkspace(id, data);
    }

    return this.apiService.put<WorkspaceDTO>(`/workspaces/${id}`, data).pipe(
      map(mapDTOToWorkspace),
      tap(workspace => {
        this.workspacesSignal.update(ws =>
          ws.map(w => w.id === id ? workspace : w)
        );
        this.cacheService.delete('workspaces');
      })
    );
  }

  /**
   * Archive workspace (soft delete)
   */
  archiveWorkspace(id: string): Observable<void> {
    if (this.useMock) {
      return this.mockArchiveWorkspace(id);
    }

    return this.apiService.post<void>(`/workspaces/${id}/archive`, {}).pipe(
      tap(() => {
        this.workspacesSignal.update(ws =>
          ws.map(w => w.id === id ? { ...w, isArchived: true } : w)
        );
        this.cacheService.delete('workspaces');
      })
    );
  }

  /**
   * Delete workspace permanently
   */
  deleteWorkspace(id: string): Observable<void> {
    if (this.useMock) {
      return this.mockDeleteWorkspace(id);
    }

    return this.apiService.delete<void>(`/workspaces/${id}`).pipe(
      tap(() => {
        this.workspacesSignal.update(ws => ws.filter(w => w.id !== id));
        this.cacheService.delete('workspaces');
      })
    );
  }

  // ==================== MOCK METHODS ====================

  private mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Marketing Team',
      description: 'All marketing forms and campaigns',
      slug: 'marketing-team',
      color: '#3B82F6',
      icon: 'pi-megaphone',
      ownerId: '1',
      memberCount: 5,
      formCount: 12,
      isArchived: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: '2',
      name: 'HR Department',
      description: 'Human resources forms',
      slug: 'hr-department',
      color: '#10B981',
      icon: 'pi-users',
      ownerId: '1',
      memberCount: 3,
      formCount: 8,
      isArchived: false,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-05')
    },
    {
      id: '3',
      name: 'Customer Support',
      description: 'Support tickets and feedback forms',
      slug: 'customer-support',
      color: '#F59E0B',
      icon: 'pi-headphones',
      ownerId: '1',
      memberCount: 8,
      formCount: 15,
      isArchived: false,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-12')
    }
  ];

  private getMockWorkspaces(): Observable<Workspace[]> {
    return of(this.mockWorkspaces).pipe(
      delay(500),
      tap(ws => this.workspacesSignal.set(ws))
    );
  }

  private getMockWorkspace(id: string): Observable<Workspace> {
    const workspace = this.mockWorkspaces.find(w => w.id === id);
    if (!workspace) {
      return throwError(() => new Error('Workspace not found'));
    }
    return of(workspace).pipe(
      delay(300),
      tap(w => this.selectedWorkspaceSignal.set(w))
    );
  }

  private mockCreateWorkspace(data: Partial<Workspace>): Observable<Workspace> {
    const newWorkspace: Workspace = {
      id: String(Date.now()),
      name: data.name!,
      description: data.description || '',
      slug: generateSlug(data.name!),
      color: data.color || '#3B82F6',
      icon: data.icon || 'pi-briefcase',
      ownerId: '1',
      memberCount: 1,
      formCount: 0,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockWorkspaces.push(newWorkspace);

    return of(newWorkspace).pipe(
      delay(500),
      tap(w => this.workspacesSignal.update(ws => [...ws, w]))
    );
  }

  private mockUpdateWorkspace(id: string, data: Partial<Workspace>): Observable<Workspace> {
    const index = this.mockWorkspaces.findIndex(w => w.id === id);
    if (index === -1) {
      return throwError(() => new Error('Workspace not found'));
    }

    const updated = {
      ...this.mockWorkspaces[index],
      ...data,
      updatedAt: new Date()
    };

    this.mockWorkspaces[index] = updated;

    return of(updated).pipe(
      delay(500),
      tap(w => this.workspacesSignal.update(ws =>
        ws.map(workspace => workspace.id === id ? w : workspace)
      ))
    );
  }

  private mockArchiveWorkspace(id: string): Observable<void> {
    const workspace = this.mockWorkspaces.find(w => w.id === id);
    if (workspace) {
      workspace.isArchived = true;
    }

    return of(undefined).pipe(
      delay(500),
      tap(() => this.workspacesSignal.update(ws =>
        ws.map(w => w.id === id ? { ...w, isArchived: true } : w)
      ))
    );
  }

  private mockDeleteWorkspace(id: string): Observable<void> {
    this.mockWorkspaces = this.mockWorkspaces.filter(w => w.id !== id);

    return of(undefined).pipe(
      delay(500),
      tap(() => this.workspacesSignal.update(ws => ws.filter(w => w.id !== id)))
    );
  }
}
