/**
 * Authentication Interceptor
 * Adds JWT token to HTTP requests
 * ⭐ CRITICAL INTERCEPTOR - Handles authentication headers
 */

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get the auth token
  const token = authService.getToken();

  // Skip adding token for auth endpoints
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  if (token && !isAuthEndpoint) {
    // Clone the request and add the authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(authReq);
  }

  // Pass through requests without token
  return next(req);
};
