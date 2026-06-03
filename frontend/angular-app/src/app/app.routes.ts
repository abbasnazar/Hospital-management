import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { requireRoles, requireFuncs, requireRolesOrFuncs } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },

  { path: 'dashboard', canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },

  { path: 'patients',
    canActivate: [requireRolesOrFuncs(['ADMIN','DOCTOR','NURSE','RECEPTIONIST'], ['patients.view'])],
    loadComponent: () => import('./patient/patient-list.component').then(m => m.PatientListComponent) },
  { path: 'patients/new',
    canActivate: [requireRolesOrFuncs(['ADMIN','RECEPTIONIST'], ['patients.create'])],
    loadComponent: () => import('./patient/patient-form.component').then(m => m.PatientFormComponent) },

  { path: 'appointments',
    canActivate: [requireRolesOrFuncs(['ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT'], ['appointments.view'])],
    loadComponent: () => import('./appointment/appointment.component').then(m => m.AppointmentComponent) },

  { path: 'lab', canActivate: [requireRoles('ADMIN','DOCTOR','LAB_TECH')],
    loadComponent: () => import('./lab/lab.component').then(m => m.LabComponent) },

  { path: 'pharmacy', canActivate: [requireRoles('ADMIN','DOCTOR','PHARMACIST')],
    loadComponent: () => import('./pharmacy/pharmacy.component').then(m => m.PharmacyComponent) },

  { path: 'billing', canActivate: [requireRoles('ADMIN','RECEPTIONIST','PATIENT')],
    loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent) },

  { path: 'reports', canActivate: [requireRoles('ADMIN')],
    loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) },

  // Clinical services (new)
  { path: 'prescriptions',
    canActivate: [requireRolesOrFuncs(['ADMIN','DOCTOR','PHARMACIST'], ['prescription.view'])],
    loadComponent: () => import('./clinical/prescriptions/prescriptions.component').then(m => m.PrescriptionsComponent) },

  { path: 'medical-records',
    canActivate: [requireRolesOrFuncs(['ADMIN','DOCTOR','NURSE','PATIENT'], ['medical_records.view'])],
    loadComponent: () => import('./clinical/medical-records/medical-records.component').then(m => m.MedicalRecordsComponent) },

  { path: 'clinical-support',
    canActivate: [requireRolesOrFuncs(['ADMIN','DOCTOR','PHARMACIST'], ['clinical_support.interactions'])],
    loadComponent: () => import('./clinical/clinical-support/clinical-support.component').then(m => m.ClinicalSupportComponent) },

  { path: 'ipd',
    canActivate: [requireRolesOrFuncs(['ADMIN','DOCTOR','NURSE'], ['ipd.admissions'])],
    loadComponent: () => import('./clinical/ipd/ipd.component').then(m => m.IPDComponent) },

  { path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./clinical/notifications/notifications.component').then(m => m.NotificationsComponent) },

  // Front desk: patient flow (new)
  { path: 'triage',
    canActivate: [requireRolesOrFuncs(['ADMIN','RECEPTIONIST','NURSE','DOCTOR'], ['triage.view'])],
    loadComponent: () => import('./triage/triage.component').then(m => m.TriageComponent) },
  { path: 'checkin',
    canActivate: [requireRolesOrFuncs(['ADMIN','RECEPTIONIST','NURSE'], ['checkin.view'])],
    loadComponent: () => import('./checkin/checkin.component').then(m => m.CheckinComponent) },
  { path: 'queue',
    canActivate: [requireRolesOrFuncs(['ADMIN','RECEPTIONIST','NURSE','DOCTOR'], ['queue.manage'])],
    loadComponent: () => import('./doctor-queue/doctor-queue.component').then(m => m.DoctorQueueComponent) },
  { path: 'emergency',
    canActivate: [requireRolesOrFuncs(['ADMIN','RECEPTIONIST','DOCTOR','NURSE'], ['emergency.manage'])],
    loadComponent: () => import('./emergency/emergency.component').then(m => m.EmergencyComponent) },

  // In-patient operations (new)
  { path: 'admissions',
    canActivate: [requireRolesOrFuncs(['ADMIN','DOCTOR','NURSE','RECEPTIONIST'], ['ipd.admissions'])],
    loadComponent: () => import('./admissions/admissions.component').then(m => m.AdmissionsComponent) },
  { path: 'beds',
    canActivate: [requireRolesOrFuncs(['ADMIN','NURSE','DOCTOR'], ['ipd.beds'])],
    loadComponent: () => import('./beds/beds.component').then(m => m.BedsComponent) },
  { path: 'transfers',
    canActivate: [requireRolesOrFuncs(['ADMIN','NURSE','DOCTOR'], ['transfer.manage'])],
    loadComponent: () => import('./transfers/transfers.component').then(m => m.TransfersComponent) },
  { path: 'icu',
    canActivate: [requireRolesOrFuncs(['ADMIN','NURSE','DOCTOR'], ['icu.manage'])],
    loadComponent: () => import('./icu/icu.component').then(m => m.IcuComponent) },
  { path: 'ward',
    canActivate: [requireRolesOrFuncs(['ADMIN','NURSE','DOCTOR'], ['ipd.wards'])],
    loadComponent: () => import('./ward/ward.component').then(m => m.WardComponent) },
  { path: 'nursing',
    canActivate: [requireRolesOrFuncs(['ADMIN','NURSE'], ['nursing.notes'])],
    loadComponent: () => import('./nursing/nursing.component').then(m => m.NursingComponent) },
  { path: 'discharge',
    canActivate: [requireRolesOrFuncs(['ADMIN','DOCTOR','NURSE','PHARMACIST','RECEPTIONIST'], ['ipd.discharge'])],
    loadComponent: () => import('./discharge/discharge.component').then(m => m.DischargeComponent) },

  // Physiotherapy (new)
  { path: 'physio-orders',
    canActivate: [requireRolesOrFuncs(['ADMIN','PHYSIOTHERAPIST','DOCTOR'], ['clinical.physio.order'])],
    loadComponent: () => import('./physiotherapy/physio-orders.component').then(m => m.PhysioOrdersComponent) },
  { path: 'physio-notes',
    canActivate: [requireRolesOrFuncs(['ADMIN','PHYSIOTHERAPIST'], ['clinical.physio.notes'])],
    loadComponent: () => import('./physiotherapy/physio-notes.component').then(m => m.PhysioNotesComponent) },

  // Radiology (new)
  { path: 'radiology-orders',
    canActivate: [requireRolesOrFuncs(['ADMIN','RADIOLOGIST','DOCTOR'], ['radiology.order.view'])],
    loadComponent: () => import('./radiology/radiology-orders.component').then(m => m.RadiologyOrdersComponent) },
  { path: 'radiology-reports',
    canActivate: [requireRolesOrFuncs(['ADMIN','RADIOLOGIST'], ['radiology.report.enter'])],
    loadComponent: () => import('./radiology/radiology-reports.component').then(m => m.RadiologyReportsComponent) },

  // HR Management (new)
  { path: 'hr-staff',
    canActivate: [requireRolesOrFuncs(['ADMIN','HR_OFFICER'], ['hr.staff.view'])],
    loadComponent: () => import('./hr/hr-staff.component').then(m => m.HrStaffComponent) },
  { path: 'hr-attendance',
    canActivate: [requireRolesOrFuncs(['ADMIN','HR_OFFICER'], ['hr.attendance.view'])],
    loadComponent: () => import('./hr/hr-attendance.component').then(m => m.HrAttendanceComponent) },
  { path: 'hr-roster',
    canActivate: [requireRolesOrFuncs(['ADMIN','HR_OFFICER'], ['hr.roster.view'])],
    loadComponent: () => import('./hr/hr-roster.component').then(m => m.HrRosterComponent) },
  { path: 'hr-leave',
    canActivate: [requireRolesOrFuncs(['ADMIN','HR_OFFICER'], ['hr.leave.view'])],
    loadComponent: () => import('./hr/hr-leave.component').then(m => m.HrLeaveComponent) },
  { path: 'hr-payroll',
    canActivate: [requireRolesOrFuncs(['ADMIN','HR_OFFICER'], ['hr.payroll.view'])],
    loadComponent: () => import('./hr/hr-payroll.component').then(m => m.HrPayrollComponent) },

  // Assets & Maintenance (new)
  { path: 'assets',
    canActivate: [requireRolesOrFuncs(['ADMIN','ENGINEER'], ['assets.register.view'])],
    loadComponent: () => import('./assets/assets-register.component').then(m => m.AssetsRegisterComponent) },
  { path: 'maintenance',
    canActivate: [requireRolesOrFuncs(['ADMIN','ENGINEER'], ['assets.maintenance.manage'])],
    loadComponent: () => import('./assets/maintenance-requests.component').then(m => m.MaintenanceRequestsComponent) },
  { path: 'preventive-maintenance',
    canActivate: [requireRolesOrFuncs(['ADMIN','ENGINEER'], ['assets.ppm.schedule'])],
    loadComponent: () => import('./assets/preventive-maintenance.component').then(m => m.PreventiveMaintenanceComponent) },

  // Quality & Compliance (new)
  { path: 'quality-incidents',
    canActivate: [requireRolesOrFuncs(['ADMIN','QUALITY_OFFICER','DOCTOR','NURSE'], ['quality.incident.report'])],
    loadComponent: () => import('./quality/quality-incidents.component').then(m => m.QualityIncidentsComponent) },
  { path: 'quality-infection',
    canActivate: [requireRolesOrFuncs(['ADMIN','QUALITY_OFFICER','DOCTOR','NURSE'], ['quality.infection.log'])],
    loadComponent: () => import('./quality/quality-infection.component').then(m => m.QualityInfectionComponent) },
  { path: 'quality-audits',
    canActivate: [requireRolesOrFuncs(['ADMIN','QUALITY_OFFICER'], ['quality.audit.clinical'])],
    loadComponent: () => import('./quality/quality-audits.component').then(m => m.QualityAuditsComponent) },

  // SuperAdmin routes
  { path: 'admin/categories', canActivate: [requireRoles('SUPERADMIN')],
    loadComponent: () => import('./admin/superadmin-categories.component').then(m => m.SuperadminCategoriesComponent) },
  { path: 'admin/admins', canActivate: [requireRoles('SUPERADMIN')],
    loadComponent: () => import('./admin/superadmin-admins.component').then(m => m.SuperadminAdminsComponent) },

  // Admin routes
  { path: 'admin/functionalities', canActivate: [requireRoles('ADMIN')],
    loadComponent: () => import('./admin/admin-functionalities.component').then(m => m.AdminFunctionalitiesComponent) },
  { path: 'admin/groups', canActivate: [requireRoles('ADMIN')],
    loadComponent: () => import('./admin/admin-groups.component').then(m => m.AdminGroupsComponent) },
  { path: 'admin/roles', canActivate: [requireRoles('ADMIN')],
    loadComponent: () => import('./admin/admin-roles.component').then(m => m.AdminRolesComponent) },
  { path: 'admin/users', canActivate: [requireRoles('ADMIN')],
    loadComponent: () => import('./admin/admin-users.component').then(m => m.AdminUsersComponent) },

  { path: '**', redirectTo: '' }
];
