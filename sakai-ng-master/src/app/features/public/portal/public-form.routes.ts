import { Routes } from '@angular/router';

export const PUBLIC_FORM_ROUTES: Routes = [
    {
        path: ':formId',
        loadComponent: () => import('./pages/public-form/public-form.component')
            .then(m => m.PublicFormComponent)
    },
    {
        path: ':formId/success',
        loadComponent: () => import('./pages/form-success/form-success.component')
            .then(m => m.FormSuccessComponent)
    }
];
