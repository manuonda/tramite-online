import { Routes } from '@angular/router';

export const FORM_BUILDER_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/form-list/form-list.component').then(m => m.FormListComponent)
    }
];
