/**
 * Error Interceptor
 * Handles HTTP errors globally
 */

import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Bad request';
            break;

          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            authService.logout();
            break;

          case 403:
            errorMessage = 'Access forbidden';
            router.navigate(['/access-denied']);
            break;

          case 404:
            errorMessage = error.error?.message || 'Resource not found';
            break;

          case 422:
            errorMessage = error.error?.message || 'Validation error';
            break;

          case 500:
            errorMessage = 'Internal server error';
            break;

          case 503:
            errorMessage = 'Service unavailable';
            break;

          default:
            errorMessage = error.error?.message || `Error: ${error.status}`;
        }
      }

      // Show error toast (except for 401 which triggers logout)
      if (error.status !== 401) {
        messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000,
        });
      }

      return throwError(() => error);
    })
  );
};
