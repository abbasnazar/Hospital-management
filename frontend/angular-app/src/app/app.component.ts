import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell" [class.no-chrome]="isLanding() || isLogin()">
      <aside class="sidebar" *ngIf="auth.isLoggedIn() && !isLanding() && !isLogin()">
        <div class="brand">
          <img src="assets/zyvraa-logo.png" alt="ZYVRAA Healthcare Management" class="logo-img">
        </div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>

          <!-- Patient Management (top-level quick access) -->
          <a *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST') || auth.hasFunc('patients.view')"
             routerLink="/patients"     routerLinkActive="active">Patients</a>
          <a *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT') || auth.hasFunc('appointments.view')"
             routerLink="/appointments" routerLinkActive="active">Appointments</a>
          <a *ngIf="auth.anyRole('ADMIN','RECEPTIONIST','PATIENT') || auth.hasFunc('billing.view')"
             routerLink="/billing"      routerLinkActive="active">Billing</a>

          <!-- Front desk / patient flow section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST') || auth.anyFunc('triage.view','checkin.view','queue.manage','emergency.manage')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('frontdesk')">
              <span class="toggle-icon">{{ isSectionExpanded('frontdesk') ? '▼' : '▶' }}</span>
              <span class="section-label">Front Desk</span>
            </button>
            <div *ngIf="isSectionExpanded('frontdesk')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','RECEPTIONIST','NURSE','DOCTOR') || auth.hasFunc('triage.view')"
                 routerLink="/triage"    routerLinkActive="active">Triage</a>
              <a *ngIf="auth.anyRole('ADMIN','RECEPTIONIST','NURSE') || auth.hasFunc('checkin.view')"
                 routerLink="/checkin"   routerLinkActive="active">Check-In Desk</a>
              <a *ngIf="auth.anyRole('ADMIN','RECEPTIONIST','NURSE','DOCTOR') || auth.hasFunc('queue.manage')"
                 routerLink="/queue"     routerLinkActive="active">Doctor Queue</a>
              <a *ngIf="auth.anyRole('ADMIN','RECEPTIONIST','DOCTOR','NURSE') || auth.hasFunc('emergency.manage')"
                 routerLink="/emergency" routerLinkActive="active">Emergency</a>
            </div>
          </div>

          <!-- In-patient / hospital operations section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE') || auth.anyFunc('ipd.admissions','ipd.beds','ipd.wards','transfer.manage','icu.manage','nursing.notes','ipd.discharge')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('inpatient')">
              <span class="toggle-icon">{{ isSectionExpanded('inpatient') ? '▼' : '▶' }}</span>
              <span class="section-label">In-Patient</span>
            </button>
            <div *ngIf="isSectionExpanded('inpatient')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST') || auth.hasFunc('ipd.admissions')"
                 routerLink="/admissions" routerLinkActive="active">Admissions</a>
              <a *ngIf="auth.anyRole('ADMIN','NURSE','DOCTOR') || auth.hasFunc('ipd.beds')"
                 routerLink="/beds"       routerLinkActive="active">Bed Management</a>
              <a *ngIf="auth.anyRole('ADMIN','NURSE','DOCTOR') || auth.hasFunc('transfer.manage')"
                 routerLink="/transfers"  routerLinkActive="active">Transfers</a>
              <a *ngIf="auth.anyRole('ADMIN','NURSE','DOCTOR') || auth.hasFunc('icu.manage')"
                 routerLink="/icu"        routerLinkActive="active">ICU</a>
              <a *ngIf="auth.anyRole('ADMIN','NURSE','DOCTOR') || auth.hasFunc('ipd.wards')"
                 routerLink="/ward"       routerLinkActive="active">Wards</a>
              <a *ngIf="auth.anyRole('ADMIN','NURSE') || auth.hasFunc('nursing.notes')"
                 routerLink="/nursing"    routerLinkActive="active">Nursing Station</a>
              <a *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE','PHARMACIST','RECEPTIONIST') || auth.hasFunc('ipd.discharge')"
                 routerLink="/discharge"  routerLinkActive="active">Discharge</a>
            </div>
          </div>

          <!-- Laboratory section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','DOCTOR','LAB_TECH') || auth.anyFunc('lab.view','lab.orders.create','lab.results.enter')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('laboratory')">
              <span class="toggle-icon">{{ isSectionExpanded('laboratory') ? '▼' : '▶' }}</span>
              <span class="section-label">Laboratory</span>
            </button>
            <div *ngIf="isSectionExpanded('laboratory')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','DOCTOR','LAB_TECH') || auth.hasFunc('lab.view')"
                 routerLink="/lab"          routerLinkActive="active">Lab Orders</a>
            </div>
          </div>

          <!-- Medical Store (Pharmacy) section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','DOCTOR','PHARMACIST') || auth.anyFunc('pharmacy.view','pharmacy.dispense','pharmacy.medicines')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('medicalstore')">
              <span class="toggle-icon">{{ isSectionExpanded('medicalstore') ? '▼' : '▶' }}</span>
              <span class="section-label">Medical Store</span>
            </button>
            <div *ngIf="isSectionExpanded('medicalstore')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','DOCTOR','PHARMACIST') || auth.hasFunc('pharmacy.view')"
                 routerLink="/pharmacy"     routerLinkActive="active">Pharmacy</a>
            </div>
          </div>

          <!-- Clinical services section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE','PHARMACIST') || auth.anyFunc('prescription.view','medical_records.view','clinical_support.interactions','ipd.admissions')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('clinical')">
              <span class="toggle-icon">{{ isSectionExpanded('clinical') ? '▼' : '▶' }}</span>
              <span class="section-label">Clinical</span>
            </button>
            <div *ngIf="isSectionExpanded('clinical')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','DOCTOR','PHARMACIST') || auth.hasFunc('prescription.view')"
                 routerLink="/prescriptions"    routerLinkActive="active">Prescriptions</a>
              <a *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE','PATIENT') || auth.hasFunc('medical_records.view')"
                 routerLink="/medical-records"  routerLinkActive="active">Medical Records</a>
              <a *ngIf="auth.anyRole('ADMIN','DOCTOR','PHARMACIST') || auth.hasFunc('clinical_support.interactions')"
                 routerLink="/clinical-support" routerLinkActive="active">Clinical Support</a>
              <a *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE') || auth.hasFunc('ipd.admissions')"
                 routerLink="/ipd"              routerLinkActive="active">IPD</a>
            </div>
          </div>

          <!-- Physiotherapy section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','PHYSIOTHERAPIST','DOCTOR','NURSE') || auth.anyFunc('clinical.physio.order','clinical.physio.notes')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('physiotherapy')">
              <span class="toggle-icon">{{ isSectionExpanded('physiotherapy') ? '▼' : '▶' }}</span>
              <span class="section-label">Physiotherapy</span>
            </button>
            <div *ngIf="isSectionExpanded('physiotherapy')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','PHYSIOTHERAPIST','DOCTOR') || auth.hasFunc('clinical.physio.order')"
                 routerLink="/physio-orders"  routerLinkActive="active">Orders</a>
              <a *ngIf="auth.anyRole('ADMIN','PHYSIOTHERAPIST') || auth.hasFunc('clinical.physio.notes')"
                 routerLink="/physio-notes"   routerLinkActive="active">Sessions</a>
            </div>
          </div>

          <!-- Radiology section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','RADIOLOGIST','DOCTOR') || auth.anyFunc('radiology.order.create','radiology.report.enter','radiology.image.upload')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('radiology')">
              <span class="toggle-icon">{{ isSectionExpanded('radiology') ? '▼' : '▶' }}</span>
              <span class="section-label">Radiology</span>
            </button>
            <div *ngIf="isSectionExpanded('radiology')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','RADIOLOGIST','DOCTOR') || auth.hasFunc('radiology.order.view')"
                 routerLink="/radiology-orders"  routerLinkActive="active">Orders</a>
              <a *ngIf="auth.anyRole('ADMIN','RADIOLOGIST') || auth.hasFunc('radiology.report.enter')"
                 routerLink="/radiology-reports" routerLinkActive="active">Reports</a>
            </div>
          </div>

          <!-- HR section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','HR_OFFICER') || auth.anyFunc('hr.staff.view','hr.attendance.view','hr.roster.view','hr.leave.apply','hr.payroll.view')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('hrmanagement')">
              <span class="toggle-icon">{{ isSectionExpanded('hrmanagement') ? '▼' : '▶' }}</span>
              <span class="section-label">HR Management</span>
            </button>
            <div *ngIf="isSectionExpanded('hrmanagement')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','HR_OFFICER') || auth.hasFunc('hr.staff.view')"
                 routerLink="/hr-staff"      routerLinkActive="active">Staff</a>
              <a *ngIf="auth.anyRole('ADMIN','HR_OFFICER') || auth.hasFunc('hr.attendance.view')"
                 routerLink="/hr-attendance" routerLinkActive="active">Attendance</a>
              <a *ngIf="auth.anyRole('ADMIN','HR_OFFICER') || auth.hasFunc('hr.roster.view')"
                 routerLink="/hr-roster"     routerLinkActive="active">Roster</a>
              <a *ngIf="auth.anyRole('ADMIN','HR_OFFICER') || auth.hasFunc('hr.leave.view')"
                 routerLink="/hr-leave"      routerLinkActive="active">Leave</a>
              <a *ngIf="auth.anyRole('ADMIN','HR_OFFICER') || auth.hasFunc('hr.payroll.view')"
                 routerLink="/hr-payroll"    routerLinkActive="active">Payroll</a>
            </div>
          </div>

          <!-- Assets & Maintenance section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','ENGINEER') || auth.anyFunc('assets.register.view','assets.maintenance.manage','assets.ppm.schedule')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('assets')">
              <span class="toggle-icon">{{ isSectionExpanded('assets') ? '▼' : '▶' }}</span>
              <span class="section-label">Assets & Maintenance</span>
            </button>
            <div *ngIf="isSectionExpanded('assets')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','ENGINEER') || auth.hasFunc('assets.register.view')"
                 routerLink="/assets"      routerLinkActive="active">Register</a>
              <a *ngIf="auth.anyRole('ADMIN','ENGINEER') || auth.hasFunc('assets.maintenance.manage')"
                 routerLink="/maintenance" routerLinkActive="active">Maintenance</a>
              <a *ngIf="auth.anyRole('ADMIN','ENGINEER') || auth.hasFunc('assets.ppm.schedule')"
                 routerLink="/preventive-maintenance" routerLinkActive="active">PPM</a>
            </div>
          </div>

          <!-- Quality & Compliance section (collapsible) -->
          <div *ngIf="auth.anyRole('ADMIN','QUALITY_OFFICER','DOCTOR','NURSE') || auth.anyFunc('quality.incident.report','quality.infection.log','quality.audit.clinical')" class="nav-section collapsible">
            <button class="section-toggle" (click)="toggleSection('quality')">
              <span class="toggle-icon">{{ isSectionExpanded('quality') ? '▼' : '▶' }}</span>
              <span class="section-label">Quality & Compliance</span>
            </button>
            <div *ngIf="isSectionExpanded('quality')" class="section-content">
              <a *ngIf="auth.anyRole('ADMIN','QUALITY_OFFICER','DOCTOR','NURSE') || auth.hasFunc('quality.incident.report')"
                 routerLink="/quality-incidents" routerLinkActive="active">Incidents</a>
              <a *ngIf="auth.anyRole('ADMIN','QUALITY_OFFICER','DOCTOR','NURSE') || auth.hasFunc('quality.infection.log')"
                 routerLink="/quality-infection"  routerLinkActive="active">Infection Control</a>
              <a *ngIf="auth.anyRole('ADMIN','QUALITY_OFFICER') || auth.hasFunc('quality.audit.clinical')"
                 routerLink="/quality-audits"    routerLinkActive="active">Audits</a>
            </div>
          </div>

          <!-- Notifications section -->
          <div *ngIf="auth.isLoggedIn()" class="nav-section">
            <a routerLink="/notifications" routerLinkActive="active">Notifications</a>
          </div>

<!-- Admin section -->
          <div *ngIf="auth.anyRole('SUPERADMIN','ADMIN')" class="nav-section">
            <div class="section-label">Admin</div>
            <a *ngIf="auth.hasRole('SUPERADMIN')" routerLink="/admin/categories" routerLinkActive="active">Categories</a>
            <a *ngIf="auth.hasRole('SUPERADMIN')" routerLink="/admin/admins"     routerLinkActive="active">Admins</a>
            <a *ngIf="auth.anyRole('SUPERADMIN','ADMIN')" routerLink="/admin/functionalities" routerLinkActive="active">Functionalities</a>
            <a *ngIf="auth.anyRole('SUPERADMIN','ADMIN')" routerLink="/admin/groups"          routerLinkActive="active">Groups</a>
            <a *ngIf="auth.anyRole('SUPERADMIN','ADMIN')" routerLink="/admin/roles"           routerLinkActive="active">Roles</a>
            <a *ngIf="auth.anyRole('SUPERADMIN','ADMIN')" routerLink="/admin/users"           routerLinkActive="active">Users</a>
          </div>
        </nav>
        <div class="foot">
          <span class="user">{{ auth.username() }}</span>
          <span class="role" *ngIf="auth.roles().length">{{ auth.roles().join(', ') }}</span>
          <button class="btn secondary" (click)="logout()">Logout</button>
        </div>
      </aside>
      <main class="content" [class.full]="isLanding() || isLogin()"><router-outlet></router-outlet></main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .sidebar { width: 240px; background: #0f2a4a; color: #fff; display: flex; flex-direction: column; padding: 1.2rem 1rem; overflow-y: auto; }
    .brand { margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; }
    .logo-img { max-width: 100%; height: auto; max-height: 80px; }
    nav { display: flex; flex-direction: column; gap: 0.35rem; }
    nav a { display: block; color: #e2e8f0; padding: 0.55rem 0.85rem; border-radius: 7px; text-decoration: none; font-size: 0.9rem; transition: background 0.15s, color 0.15s; cursor: pointer; }
    nav a:hover { background: rgba(255,255,255,0.12); color: #fff; }
    nav a.active { background: rgba(34,197,94,0.25); color: #fff; font-weight: 600; border-left: 3px solid #22C55E; padding-left: calc(0.85rem - 3px); }
    .nav-section { display: flex; flex-direction: column; gap: 0.35rem; margin-top: 1.2rem; padding-top: 0.9rem; border-top: 1px solid rgba(255,255,255,0.12); }
    .nav-section a { display: block; width: 100%; }
    .nav-section.collapsible { padding-top: 0; margin-top: 0.8rem; border-top: none; }
    .section-label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.3rem; padding: 0 0.85rem; font-weight: 700; }
    .section-toggle { background: none; border: none; color: #e2e8f0; padding: 0.55rem 0.85rem; text-align: left; font-size: 0.9rem; cursor: pointer; width: 100%; display: flex; align-items: center; gap: 0.5rem; border-radius: 7px; transition: background 0.15s; }
    .section-toggle:hover { background: rgba(255,255,255,0.12); }
    .toggle-icon { display: inline-block; min-width: 12px; font-size: 0.7rem; }
    .section-content { display: flex; flex-direction: column; gap: 0.35rem; padding-left: 0.5rem; }
    .foot { margin-top: auto; padding-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
    .user { font-size: 0.85rem; opacity: 0.95; font-weight: 600; color: #fff; }
    .role { font-size: 0.7rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }
    .content { flex: 1; padding: 2rem; overflow-y: auto; }
    .content.full { padding: 0; overflow-y: visible; }
    .shell.no-chrome { display: block; }
    .btn.secondary { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.5rem 0.85rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .btn.secondary:hover { background: rgba(239, 68, 68, 0.3); color: #fff; }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  private currentUrl = signal<string>(this.router.url);

  // Collapsible sections (all collapsed by default for compact sidebar)
  expandedSections = signal<Set<string>>(new Set());

  isLanding = () => this.currentUrl() === '/' || this.currentUrl() === '';
  isLogin = () => this.currentUrl().startsWith('/login');

  toggleSection(section: string) {
    const expanded = new Set(this.expandedSections());
    if (expanded.has(section)) {
      expanded.delete(section);
    } else {
      expanded.add(section);
    }
    this.expandedSections.set(expanded);
  }

  isSectionExpanded(section: string) {
    return this.expandedSections().has(section);
  }

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => this.currentUrl.set((e as NavigationEnd).urlAfterRedirects));
  }

  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
