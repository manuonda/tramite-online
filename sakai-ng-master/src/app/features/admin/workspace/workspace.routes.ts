import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/guards/permission.guard';

export const WORKSPACE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/workspace-list/workspace-list.component').then(m => m.WorkspaceListComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./pages/workspace-create/workspace-create.component').then(m => m.WorkspaceCreateComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['workspace:create'] }
    },
    {
        path: ':workspaceId',
        loadComponent: () => import('./pages/workspace-detail/workspace-detail.component').then(m => m.WorkspaceDetailComponent),
        children: [
            { path: '', redirectTo: 'forms', pathMatch: 'full' },
            { path: 'submissions', redirectTo: 'forms', pathMatch: 'full' },
            {
                path: 'forms',
                loadChildren: () => import('./features/form-builder/form-builder.routes').then(m => m.FORM_BUILDER_ROUTES),
                canActivate: [permissionGuard],
                data: { permissions: ['form:view'] }
            },
            {
                path: 'domain-values',
                loadChildren: () => import('./features/domain-values/domain-values.routes').then(m => m.DOMAIN_VALUES_ROUTES),
                canActivate: [permissionGuard],
                data: { permissions: ['domain-value:view'] }
            },
            {
                path: 'members',
                loadChildren: () => import('./features/members/members.routes').then(m => m.MEMBERS_ROUTES),
                canActivate: [permissionGuard],
                data: { permissions: ['member:view'] }
            }
        ]
    }
];
