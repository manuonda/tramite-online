/**
 * Authentication Service
 * Manages user authentication state using Signals (Angular 21)
 * ⭐ CRITICAL SERVICE - Foundation of auth system
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { CacheService } from '../../services/cache.service';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../models/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private cacheService = inject(CacheService);

  // Private state signals
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private refreshTokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);

  // Public readonly signals
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly permissions = computed(() => this.userSignal()?.permissions || []);
  readonly roles = computed(() => this.userSignal()?.roles || []);

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize auth state from localStorage
   */
  private initializeAuth(): void {
    const token = this.getStoredToken();
    const refreshToken = this.getStoredRefreshToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.tokenSignal.set(token);
      this.refreshTokenSignal.set(refreshToken);
      this.userSignal.set(user);
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.loadingSignal.set(true);

    // TODO: Remove mock when backend is ready
    return this.mockLogin(credentials).pipe(
      tap((response) => {
        this.setAuthState(response.user, response.access_token, response.refresh_token);
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );

    // Production code (uncomment when backend ready):
    // return this.apiService.post<LoginResponse>('/auth/login', credentials).pipe(
    //   tap((response) => {
    //     this.setAuthState(response.user, response.access_token, response.refresh_token);
    //   }),
    //   catchError((error) => {
    //     this.loadingSignal.set(false);
    //     return throwError(() => error);
    //   })
    // );
  }

  /**
   * Register new user
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    this.loadingSignal.set(true);

    return this.apiService.post<RegisterResponse>('/auth/register', data).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuthState();
    this.cacheService.clear();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.refreshTokenSignal();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refresh_token: refreshToken };

    return this.apiService.post<RefreshTokenResponse>('/auth/refresh', request).pipe(
      tap((response) => {
        this.setTokens(response.access_token, response.refresh_token);
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(resource: string, action: string): boolean {
    const userPermissions = this.permissions();
    return userPermissions.some((p: any) => p.resource === resource && p.action === action);
  }

  /**
   * Check if user has specific role
   */
  hasRole(roleName: string): boolean {
    const userRoles = this.roles();
    return userRoles.some((r: any) => r.name === roleName);
  }

  /**
   * Set authentication state
   */
  private setAuthState(user: User, token: string, refreshToken: string): void {
    this.userSignal.set(user);
    this.tokenSignal.set(token);
    this.refreshTokenSignal.set(refreshToken);

    this.storeToken(token);
    this.storeRefreshToken(refreshToken);
    this.storeUser(user);

    this.loadingSignal.set(false);
  }

  /**
   * Set tokens only (for refresh)
   */
  private setTokens(token: string, refreshToken: string): void {
    this.tokenSignal.set(token);
    this.refreshTokenSignal.set(refreshToken);

    this.storeToken(token);
    this.storeRefreshToken(refreshToken);
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.loadingSignal.set(false);

    this.removeStoredToken();
    this.removeStoredRefreshToken();
    this.removeStoredUser();
  }

  // LocalStorage helpers
  private storeToken(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
  }

  private storeRefreshToken(token: string): void {
    localStorage.setItem(environment.refreshTokenKey, token);
  }

  private storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshTokenKey);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  private removeStoredToken(): void {
    localStorage.removeItem(environment.tokenKey);
  }

  private removeStoredRefreshToken(): void {
    localStorage.removeItem(environment.refreshTokenKey);
  }

  private removeStoredUser(): void {
    localStorage.removeItem('user');
  }

  /**
   * MOCK LOGIN - Remove when backend is ready
   */
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    return new Observable((observer) => {
      setTimeout(() => {
        if (credentials.email === 'admin@test.com' && credentials.password === 'admin') {
          const mockResponse: LoginResponse = {
            access_token: 'mock-jwt-token-' + Date.now(),
            refresh_token: 'mock-refresh-token-' + Date.now(),
            token_type: 'Bearer',
            expires_in: 3600,
            user: {
              id: '1',
              email: 'admin@test.com',
              firstName: 'Admin',
              lastName: 'User',
              avatar: 'https://ui-avatars.com/api/?name=Admin+User',
              roles: [
                {
                  id: '1',
                  name: 'admin',
                  displayName: 'Administrator',
                  description: 'Full system access',
                  permissions: [
                    {
                      id: '1',
                      resource: 'workspace',
                      action: 'create',
                    },
                    {
                      id: '2',
                      resource: 'workspace',
                      action: 'read',
                    },
                    {
                      id: '3',
                      resource: 'workspace',
                      action: 'update',
                    },
                    {
                      id: '4',
                      resource: 'workspace',
                      action: 'delete',
                    },
                  ],
                  isSystem: true,
                },
              ],
              permissions: [
                {
                  id: '1',
                  resource: 'workspace',
                  action: 'create',
                },
                {
                  id: '2',
                  resource: 'workspace',
                  action: 'read',
                },
                {
                  id: '3',
                  resource: 'workspace',
                  action: 'update',
                },
                {
                  id: '4',
                  resource: 'workspace',
                  action: 'delete',
                },
              ],
            },
          };
          observer.next(mockResponse);
          observer.complete();
        } else {
          observer.error({ error: { message: 'Invalid credentials' } });
        }
      }, 1000); // Simulate network delay
    });
  }
}
