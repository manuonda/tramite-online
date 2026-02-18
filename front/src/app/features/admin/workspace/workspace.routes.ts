import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/auth/guards/permission.guard';

export const WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/workspace-list/workspace-list.component').then(
        (m) => m.WorkspaceListComponent
      ),
    title: 'Workspaces - Tramite Online',
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/workspace-create/workspace-create.component').then(
        (m) => m.WorkspaceCreateComponent
      ),
    canActivate: [permissionGuard],
    data: { permission: 'workspace:create' },
    title: 'Create Workspace - Tramite Online',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/workspace-detail/workspace-detail.component').then(
        (m) => m.WorkspaceDetailComponent
      ),
    title: 'Workspace Detail - Tramite Online',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/workspace-edit/workspace-edit.component').then(
        (m) => m.WorkspaceEditComponent
      ),
    canActivate: [permissionGuard],
    data: { permission: 'workspace:update' },
    title: 'Edit Workspace - Tramite Online',
  },
];
