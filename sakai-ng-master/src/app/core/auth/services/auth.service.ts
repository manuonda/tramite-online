import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthState, LoginRequest, LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';

const MOCK_USER: User = {
    id: 1,
    email: 'admin@tramite.gob.ar',
    firstName: 'Admin',
    lastName: 'Sistema',
    roles: [{
        id: 1, name: 'ADMIN', description: 'Administrador',
        permissions: [
            { id: 1, name: 'workspace:view',       resource: 'workspace',     action: 'view'   },
            { id: 2, name: 'workspace:create',     resource: 'workspace',     action: 'create' },
            { id: 3, name: 'workspace:edit',       resource: 'workspace',     action: 'edit'   },
            { id: 4, name: 'workspace:delete',     resource: 'workspace',     action: 'delete' },
            { id: 5, name: 'form:view',            resource: 'form',          action: 'view'   },
            { id: 6, name: 'form:create',          resource: 'form',          action: 'create' },
            { id: 7, name: 'domain-value:view',    resource: 'domain-value',  action: 'view'   },
            { id: 8, name: 'member:view',          resource: 'member',        action: 'view'   },
            { id: 9, name: 'submission:view',      resource: 'submission',    action: 'view'   }
        ]
    }],
    active: true
};

const MOCK_TOKEN = 'mock-jwt-token-phase1';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly router = inject(Router);

    private readonly _state = signal<AuthState>({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false
    });

    readonly state = this._state.asReadonly();
    readonly isAuthenticated = computed(() => this._state().isAuthenticated);
    readonly currentUser = computed(() => this._state().user);
    readonly isLoading = computed(() => this._state().isLoading);

    constructor() {
        this.restoreSession();
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        this._state.update(s => ({ ...s, isLoading: true }));

        // Phase 1: mock — replace next line with http.post in Phase 2
        const mockResponse: LoginResponse = {
            accessToken: MOCK_TOKEN,
            expiresIn: 3600,
            user: MOCK_USER
        };

        return of(mockResponse).pipe(
            delay(600),
            tap(response => {
                sessionStorage.setItem('accessToken', response.accessToken);
                sessionStorage.setItem('user', JSON.stringify(response.user));
                this._state.set({
                    user: response.user,
                    accessToken: response.accessToken,
                    isAuthenticated: true,
                    isLoading: false
                });
            })
        );
    }

    logout(): void {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        this._state.set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return this._state().accessToken;
    }

    private restoreSession(): void {
        const token = sessionStorage.getItem('accessToken');
        if (!token) return;

        // Mock phase: always use fresh MOCK_USER so permission changes are reflected immediately
        if (token === MOCK_TOKEN) {
            this._state.set({ user: MOCK_USER, accessToken: token, isAuthenticated: true, isLoading: false });
            return;
        }

        const userJson = sessionStorage.getItem('user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson) as User;
                this._state.set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
            } catch {
                sessionStorage.clear();
            }
        }
    }
}
