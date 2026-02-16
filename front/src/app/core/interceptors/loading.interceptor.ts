/**
 * Loading Interceptor
 * Shows/hides loading spinner during HTTP requests with debounce
 */

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize, delay } from 'rxjs';
import { LoadingService } from '../../shared/components/loading-spinner/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Start loading
  loadingService.show();

  return next(req).pipe(
    // Add small delay to avoid flicker on fast requests
    delay(50),
    finalize(() => {
      // Hide loading when request completes (success or error)
      loadingService.hide();
    })
  );
};
