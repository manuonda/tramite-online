import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('@core/layout/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            {
                path: 'home',
                loadComponent: () => import('@features/public/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'forms',
                loadComponent: () => import('@features/public/home/home.component').then(m => m.HomeComponent)
            }
        ]
    },
    {
        path: 'admin',
        loadComponent: () => import('@core/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('@features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'workspaces',
                loadChildren: () => import('@features/admin/workspace/workspace.routes').then(m => m.WORKSPACE_ROUTES)
            },
            {
                path: 'submissions',
                loadChildren: () => import('@features/admin/submissions/submissions.routes').then(m => m.SUBMISSIONS_ROUTES)
            }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'access-denied',
        loadComponent: () => import('@features/public/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
    },
    {
        path: '**',
        loadComponent: () => import('@features/public/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
