/**
 * Authentication Models
 * Request/Response types for authentication flow
 */

import { User } from './user.model';

// Re-export User for convenience
export type { User } from './user.model';

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response from API
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Register response from API
 */
export interface RegisterResponse {
  user: User;
  message: string;
}

/**
 * Token refresh request
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Password reset request
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

/**
 * Auth state for application
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Initial auth state
 */
export const INITIAL_AUTH_STATE: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};
