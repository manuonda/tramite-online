import { Routes } from '@angular/router';

export const DOMAIN_VALUES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/domain-value-list/domain-value-list.component').then(m => m.DomainValueListComponent)
    }
];
