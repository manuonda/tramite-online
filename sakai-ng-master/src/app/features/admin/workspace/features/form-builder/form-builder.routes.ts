import { Routes } from '@angular/router';

export const FORM_BUILDER_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/form-list/form-list.component').then(m => m.FormListComponent)
    },
    {
        path: ':formId/preview',
        loadComponent: () => import('./pages/form-preview/form-preview.component').then(m => m.FormPreviewComponent)
    },
    {
        path: ':formId',
        loadComponent: () => import('./pages/form-editor/form-editor.component').then(m => m.FormEditorComponent)
    }
];
