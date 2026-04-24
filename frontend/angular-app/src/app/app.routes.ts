import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login',        loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard',    canActivate: [authGuard], loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'patients',     canActivate: [authGuard], loadComponent: () => import('./patient/patient-list.component').then(m => m.PatientListComponent) },
  { path: 'patients/new', canActivate: [authGuard], loadComponent: () => import('./patient/patient-form.component').then(m => m.PatientFormComponent) },
  { path: 'appointments', canActivate: [authGuard], loadComponent: () => import('./appointment/appointment.component').then(m => m.AppointmentComponent) },
  { path: 'billing',      canActivate: [authGuard], loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent) },
  { path: '**', redirectTo: 'dashboard' }
];
