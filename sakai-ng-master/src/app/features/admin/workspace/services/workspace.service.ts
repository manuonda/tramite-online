import { Injectable, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CreateWorkspaceDto, UpdateWorkspaceDto, Workspace } from '../models/workspace.model';

const MOCK_WORKSPACES: Workspace[] = [
    {
        id: '1',
        name: 'Secretaría de Obras',
        slug: 'secretaria-obras',
        description: 'Gestión de trámites de obras y construcción municipal.',
        status: 'ACTIVE',
        membersCount: 5,
        formsCount: 3,
        color: '#0ea5e9',
        icon: 'pi pi-clipboard',
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-02-01T14:30:00Z',
        createdBy: 'admin@tramite.gob.ar'
    },
    {
        id: '2',
        name: 'Habilitaciones Comerciales',
        slug: 'habilitaciones-comerciales',
        description: 'Trámites para habilitación de locales comerciales y emprendimientos.',
        status: 'ACTIVE',
        membersCount: 3,
        formsCount: 7,
        color: '#10b981',
        icon: 'pi pi-file',
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-02-10T11:00:00Z',
        createdBy: 'admin@tramite.gob.ar'
    },
    {
        id: '3',
        name: 'Registro Civil',
        slug: 'registro-civil',
        description: 'Certificados, actas y documentación del registro civil.',
        status: 'ACTIVE',
        membersCount: 8,
        formsCount: 12,
        color: '#f59e0b',
        icon: 'pi pi-users',
        createdAt: '2026-01-20T08:00:00Z',
        updatedAt: '2026-02-15T16:00:00Z',
        createdBy: 'admin@tramite.gob.ar'
    }
];

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
    private readonly _workspaces = signal<Workspace[]>([]);
    private readonly _loading = signal(false);
    private readonly _selected = signal<Workspace | null>(null);

    readonly workspaces = this._workspaces.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly selected = this._selected.asReadonly();

    getAll(): Observable<Workspace[]> {
        this._loading.set(true);
        return of([...MOCK_WORKSPACES]).pipe(
            delay(500),
            tap(list => {
                this._workspaces.set(list);
                this._loading.set(false);
            })
        );
    }

    getById(id: string): Observable<Workspace | undefined> {
        const found = MOCK_WORKSPACES.find(w => w.id === id);
        return of(found).pipe(
            delay(300),
            tap(w => this._selected.set(w ?? null))
        );
    }

    create(data: CreateWorkspaceDto): Observable<Workspace> {
        const newWorkspace: Workspace = {
            ...data,
            id: Date.now().toString(),
            status: 'ACTIVE',
            membersCount: 1,
            formsCount: 0,
            color: data.color || '#0ea5e9',
            icon: data.icon || 'pi pi-folder-open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'admin@tramite.gob.ar'
        };
        MOCK_WORKSPACES.push(newWorkspace);
        return of(newWorkspace).pipe(
            delay(600),
            tap(w => this._workspaces.update(list => [...list, w]))
        );
    }

    update(id: string, data: UpdateWorkspaceDto): Observable<Workspace> {
        const idx = MOCK_WORKSPACES.findIndex(w => w.id === id);
        if (idx !== -1) {
            MOCK_WORKSPACES[idx] = { ...MOCK_WORKSPACES[idx], ...data, updatedAt: new Date().toISOString() };
        }
        const updated = MOCK_WORKSPACES[idx];
        return of(updated).pipe(
            delay(400),
            tap(w => {
                this._workspaces.update(list => list.map(item => item.id === id ? w : item));
                if (this._selected()?.id === id) this._selected.set(w);
            })
        );
    }

    delete(id: string): Observable<void> {
        const idx = MOCK_WORKSPACES.findIndex(w => w.id === id);
        if (idx !== -1) MOCK_WORKSPACES.splice(idx, 1);
        return of(void 0).pipe(
            delay(300),
            tap(() => {
                this._workspaces.update(list => list.filter(w => w.id !== id));
                if (this._selected()?.id === id) this._selected.set(null);
            })
        );
    }
}
