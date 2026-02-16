/**
 * Application Routes
 * ⭐ CRITICAL FILE - Defines the complete route structure
 *
 * Structure:
 * - PUBLIC: Routes accessible without authentication (PublicLayout)
 * - ADMIN: Protected routes requiring authentication (AdminLayout)
 * - AUTH: Authentication pages (no layout)
 * - ERROR: Error pages (403, 404)
 */

import { Routes } from '@angular/router';
import { authGuard } from './app/core/auth/guards/auth.guard';

export const appRoutes: Routes = [
  // PUBLIC ROUTES (with PublicLayout)
  {
    path: '',
    loadComponent: () =>
      import('./app/core/layout/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./app/features/public/home/home.component').then((m) => m.HomeComponent),
        title: 'Home - Tramite Online',
      },
      // Forms feature will be added in Phase 3
      // {
      //   path: 'forms',
      //   loadChildren: () =>
      //     import('./app/features/public/form-wizard/form-wizard.routes').then(
      //       (m) => m.FORM_WIZARD_ROUTES
      //     ),
      // },
    ],
  },

  // ADMIN ROUTES (with AdminLayout, protected by authGuard)
  {
    path: 'admin',
    loadComponent: () =>
      import('./app/core/layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./app/features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        title: 'Dashboard - Tramite Online',
      },
      // Workspace routes will be added in Phase 2
      // {
      //   path: 'workspaces',
      //   loadChildren: () =>
      //     import('./app/features/admin/workspace/workspace.routes').then(
      //       (m) => m.WORKSPACE_ROUTES
      //     ),
      //   canActivate: [permissionGuard],
      //   data: { permission: 'workspace:read' },
      // },
    ],
  },

  // AUTH ROUTES (no layout)
  {
    path: 'auth',
    loadChildren: () =>
      import('./app/features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // ERROR PAGES
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./app/features/public/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent
      ),
    title: 'Access Denied - Tramite Online',
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./app/features/public/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: 'Not Found - Tramite Online',
  },

  // LEGACY ROUTES (preserve for backward compatibility)
  // These can be removed once confirmed not in use
  {
    path: 'landing',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'notfound',
    redirectTo: 'not-found',
    pathMatch: 'full',
  },

  // CATCH-ALL (must be last)
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
