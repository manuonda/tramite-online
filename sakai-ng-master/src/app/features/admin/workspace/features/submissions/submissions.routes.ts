import { Routes } from '@angular/router';

export const SUBMISSIONS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/submission-list/submission-list.component').then(m => m.SubmissionListComponent)
    }
];
