import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'clients', loadComponent: () => import('./clients/clients.page').then(m => m.ClientsPage) },
  { path: 'accounts', loadComponent: () => import('./accounts/accounts.page').then(m => m.AccountsPage) },
  { path: 'moves', loadComponent: () => import('./moves/moves.page').then(m => m.MovesPage) },
  { path: 'reports/moves', loadComponent: () => import('./reports/moves-report.page').then(m => m.MovesReportPage) },
  { path: '', pathMatch: 'full', redirectTo: 'clients' },
  { path: '**', redirectTo: 'clients' },
];
