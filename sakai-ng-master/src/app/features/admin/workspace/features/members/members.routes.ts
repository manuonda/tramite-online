import { Routes } from '@angular/router';

export const MEMBERS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/member-list/member-list.component').then(m => m.MemberListComponent)
    }
];
