import { Routes } from '@angular/router';

export const PAYMENT_CONFIG_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/payment-config.component').then(m => m.PaymentConfigComponent)
    }
];
