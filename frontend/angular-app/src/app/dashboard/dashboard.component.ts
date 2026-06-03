import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h1>{{ greeting() }}</h1>
    <p class="muted">{{ subtitle() }} · {{ today }}</p>

    <ng-container *ngIf="is('ADMIN')">
      <div class="grid">
        <div class="card stat"><div class="label">Registrations today</div><div class="value">{{ mis()?.registrations ?? '—' }}</div></div>
        <div class="card stat"><div class="label">OPD Visits</div>        <div class="value">{{ mis()?.opdCount      ?? '—' }}</div></div>
        <div class="card stat"><div class="label">Lab Orders</div>        <div class="value">{{ mis()?.labOrders     ?? '—' }}</div></div>
        <div class="card stat"><div class="label">Rx Dispensed</div>      <div class="value">{{ mis()?.rxDispensed   ?? '—' }}</div></div>
        <div class="card stat"><div class="label">Revenue gross (₹)</div> <div class="value">{{ (mis()?.revenueGross ?? 0) | number:'1.0-2' }}</div></div>
        <div class="card stat"><div class="label">Revenue net (₹)</div>   <div class="value">{{ (mis()?.revenueNet   ?? 0) | number:'1.0-2' }}</div></div>
      </div>
      <div class="actions">
        <a class="btn" routerLink="/reports">Open Reports</a>
        <a class="btn secondary" routerLink="/patients">Manage Patients</a>
      </div>
    </ng-container>

    <ng-container *ngIf="auth.anyRole('ADMIN','DOCTOR','NURSE')">
      <h3 style="margin-top:1.6rem;">Hospital Operations</h3>
      <div class="grid">
        <div class="card stat"><div class="label">ICU Occupancy</div><div class="value">{{ icuOcc() }}</div></div>
        <div class="card stat"><div class="label">Available Beds</div><div class="value">{{ bedsAvail() }}</div></div>
        <div class="card stat"><div class="label">Waiting Emergencies</div><div class="value">{{ emergencyWaiting() }}</div></div>
        <div class="card stat"><div class="label">Active Admissions</div><div class="value">{{ admissionsActive() }}</div></div>
        <div class="card stat"><div class="label">Discharges Today</div><div class="value">{{ dischargesToday() }}</div></div>
      </div>
      <div class="actions">
        <a class="btn secondary" routerLink="/icu">ICU</a>
        <a class="btn secondary" routerLink="/ward">Wards</a>
        <a class="btn secondary" routerLink="/admissions">Admissions</a>
        <a class="btn secondary" routerLink="/emergency">Emergency</a>
      </div>
    </ng-container>

    <ng-container *ngIf="is('DOCTOR')">
      <div class="grid">
        <div class="card stat"><div class="label">OPD visits today</div><div class="value">{{ mis()?.opdCount ?? '—' }}</div></div>
        <div class="card stat"><div class="label">Pending lab orders</div><div class="value">{{ labPending() }}</div></div>
        <div class="card stat"><div class="label">Active Rx</div><div class="value">{{ rxPending() }}</div></div>
      </div>
      <div class="actions">
        <a class="btn" routerLink="/appointments">Today's Appointments</a>
        <a class="btn secondary" routerLink="/lab">Lab Orders</a>
        <a class="btn secondary" routerLink="/pharmacy">Prescriptions</a>
      </div>
    </ng-container>

    <ng-container *ngIf="is('NURSE')">
      <div class="grid">
        <div class="card stat"><div class="label">OPD visits today</div><div class="value">{{ mis()?.opdCount ?? '—' }}</div></div>
        <div class="card stat"><div class="label">Registrations today</div><div class="value">{{ mis()?.registrations ?? '—' }}</div></div>
      </div>
      <div class="actions">
        <a class="btn" routerLink="/patients">Patient Roster</a>
        <a class="btn secondary" routerLink="/appointments">Appointments</a>
      </div>
    </ng-container>

    <ng-container *ngIf="isReceptionist()">
      <div class="grid">
        <div class="card stat"><div class="label">Total Patients</div><div class="value">{{ totalPatients() }}</div></div>
        <div class="card stat"><div class="label">Appointments Today</div><div class="value">{{ apptsToday() }}</div></div>
        <div class="card stat"><div class="label">Upcoming Appointments</div><div class="value">{{ apptsUpcoming() }}</div></div>
        <div class="card stat"><div class="label">Registrations today</div><div class="value">{{ mis()?.registrations ?? '—' }}</div></div>
      </div>

      <div class="card" style="margin-top: 1.2rem;" *ngIf="upcomingList().length > 0">
        <h3 style="margin: 0 0 .8rem 0;">Today's & Upcoming Appointments</h3>
        <table class="appt-table">
          <thead>
            <tr><th>Patient</th><th>Doctor</th><th>Date / Time</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of upcomingList()">
              <td>{{ a.patientName || ('#' + a.patientId) }}</td>
              <td>{{ a.doctorName || ('Dr. #' + a.doctorId) }}</td>
              <td>{{ a.appointmentTime | date:'MMM d, h:mm a' }}</td>
              <td><span class="appt-status" [class]="'s-' + (a.status || 'SCHEDULED').toLowerCase()">{{ a.status || 'SCHEDULED' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card muted" style="margin-top: 1.2rem;" *ngIf="upcomingList().length === 0 && !loadingAppts()">
        <em>No appointments scheduled. Book one to get started.</em>
      </div>

      <div class="actions">
        <a class="btn" routerLink="/patients/new">+ Register Patient</a>
        <a class="btn secondary" routerLink="/appointments">Book Appointment</a>
        <a class="btn secondary" routerLink="/patients">View All Patients</a>
      </div>
    </ng-container>

    <ng-container *ngIf="is('LAB_TECH')">
      <div class="grid">
        <div class="card stat"><div class="label">Pending orders</div><div class="value">{{ labPending() }}</div></div>
        <div class="card stat"><div class="label">Lab orders today</div><div class="value">{{ mis()?.labOrders ?? '—' }}</div></div>
      </div>
      <div class="actions">
        <a class="btn" routerLink="/lab">Open Lab Queue</a>
      </div>
    </ng-container>

    <ng-container *ngIf="is('PHARMACIST')">
      <div class="grid">
        <div class="card stat"><div class="label">Pending Rx</div><div class="value">{{ rxPending() }}</div></div>
        <div class="card stat"><div class="label">Rx dispensed today</div><div class="value">{{ mis()?.rxDispensed ?? '—' }}</div></div>
        <div class="card stat"><div class="label">Stock alerts</div><div class="value">{{ stockAlerts() }}</div></div>
      </div>
      <div class="actions">
        <a class="btn" routerLink="/pharmacy">Open Dispense Queue</a>
      </div>
    </ng-container>

    <ng-container *ngIf="is('PATIENT')">
      <div class="card" style="margin-top: 1rem;">
        <h3>Welcome</h3>
        <p>You can view your upcoming appointments and bills.</p>
        <div class="actions" style="margin-top: 1rem;">
          <a class="btn" routerLink="/appointments">My Appointments</a>
          <a class="btn secondary" routerLink="/billing">My Bills</a>
        </div>
      </div>
    </ng-container>

    <ng-container *ngIf="!hasAnyKnownRole()">
      <div class="card" style="margin-top: 1rem;">
        <p class="muted">No specific role assigned. Contact administrator.</p>
      </div>
    </ng-container>
  `,
  styles: [`
    h1 { margin-bottom: 0.2rem; }
    .muted { color: var(--hmis-muted); margin-top: 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-top: 1.2rem; }
    .stat .label { color: var(--hmis-muted); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat .value { font-size: 2rem; font-weight: 700; margin-top: 0.3rem; }
    .actions { display: flex; gap: .6rem; flex-wrap: wrap; margin-top: 1.2rem; }
    .appt-table { width: 100%; border-collapse: collapse; font-size: .9rem; }
    .appt-table th, .appt-table td { padding: .55rem .6rem; text-align: left; border-bottom: 1px solid #eef2f7; }
    .appt-table th { font-weight: 600; color: #64748b; font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; }
    .appt-status { display: inline-block; padding: 2px 9px; border-radius: 12px; font-size: .72rem; font-weight: 600; }
    .appt-status.s-scheduled { background: #dbeafe; color: #1e40af; }
    .appt-status.s-completed { background: #dcfce7; color: #166534; }
    .appt-status.s-cancelled { background: #fee2e2; color: #991b1b; }
    .appt-status.s-confirmed { background: #d1fae5; color: #065f46; }
  `]
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  mis = signal<any>(null);
  labPending = signal<number | string>('—');
  rxPending = signal<number | string>('—');
  stockAlerts = signal<number | string>('—');
  totalPatients = signal<number | string>('—');
  apptsToday    = signal<number | string>('—');
  apptsUpcoming = signal<number | string>('—');
  upcomingList  = signal<any[]>([]);
  loadingAppts  = signal<boolean>(false);
  icuOcc           = signal<number | string>('—');
  bedsAvail        = signal<number | string>('—');
  emergencyWaiting = signal<number | string>('—');
  admissionsActive = signal<number | string>('—');
  dischargesToday  = signal<number | string>('—');

  today = this.localDate();

  is(role: string): boolean { return this.auth.hasRole(role); }
  hasAnyKnownRole(): boolean {
    return this.auth.anyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST','LAB_TECH','PHARMACIST','PATIENT')
        || this.isReceptionist();
  }

  // Treats either system role RECEPTIONIST or custom perm-role with patient+appt funcs as receptionist.
  isReceptionist(): boolean {
    if (this.auth.hasRole('RECEPTIONIST')) return true;
    // Custom perm-role user (no system role, but has the receptionist functionalities)
    const hasNoSysRole = this.auth.roles().length === 0;
    const f = this.auth.funcs?.() ?? [];
    return hasNoSysRole
      && f.includes('patients.create')
      && f.includes('appointments.view')
      && !f.includes('admin.users')
      && !f.includes('lab.view');
  }

  greeting = computed(() => {
    const u = this.auth.username() ?? 'there';
    const primary = this.auth.roles()[0] ?? '';
    let label =
      primary === 'ADMIN'        ? 'Administrator' :
      primary === 'DOCTOR'       ? 'Doctor' :
      primary === 'NURSE'        ? 'Nurse' :
      primary === 'RECEPTIONIST' ? 'Receptionist' :
      primary === 'LAB_TECH'     ? 'Lab Technician' :
      primary === 'PHARMACIST'   ? 'Pharmacist' :
      primary === 'PATIENT'      ? '' : '';
    if (!label && this.isReceptionist()) label = 'Receptionist';
    return label ? `Welcome, ${label} ${u}` : `Welcome, ${u}`;
  });

  subtitle = computed(() => {
    if (this.auth.hasRole('ADMIN'))        return 'Hospital-wide operational KPIs';
    if (this.auth.hasRole('DOCTOR'))       return 'Your clinical workload';
    if (this.auth.hasRole('NURSE'))        return 'Ward activity for today';
    if (this.isReceptionist())             return 'Front desk overview — patients & appointments';
    if (this.auth.hasRole('LAB_TECH'))     return 'Laboratory sample queue';
    if (this.auth.hasRole('PHARMACIST'))   return 'Pharmacy dispense queue';
    if (this.auth.hasRole('PATIENT'))      return 'Your personal dashboard';
    return '';
  });

  ngOnInit() {
    const base = environment.apiBase;
    const calls: Record<string, any> = {};
    if (this.auth.anyRole('ADMIN','DOCTOR','NURSE','RECEPTIONIST','LAB_TECH','PHARMACIST') || this.isReceptionist()) {
      calls['mis'] = this.http.get(`${base}/reports/mis/daily?site=MAIN&date=${this.today}`).pipe(catchError(() => of(null)));
    }
    if (this.auth.anyRole('LAB_TECH','DOCTOR')) {
      calls['lab'] = this.http.get<any>(`${base}/lab/orders`).pipe(catchError(() => of([])));
    }
    if (this.auth.anyRole('PHARMACIST','DOCTOR')) {
      calls['rx']     = this.http.get<any>(`${base}/pharmacy/prescriptions`).pipe(catchError(() => of([])));
      calls['alerts'] = this.http.get<any>(`${base}/pharmacy/alerts/stock`).pipe(catchError(() => of([])));
    }

    // Hospital operations KPIs (ICU / wards / emergency / admissions)
    if (this.auth.anyRole('ADMIN','DOCTOR','NURSE')) {
      calls['icu']        = this.http.get<any>(`${base}/ipd/icu/dashboard`).pipe(catchError(() => of(null)));
      calls['wards']      = this.http.get<any>(`${base}/ipd/wards`).pipe(catchError(() => of(null)));
      calls['emergency']  = this.http.get<any>(`${base}/emergency`).pipe(catchError(() => of(null)));
      calls['admissions'] = this.http.get<any>(`${base}/ipd/admissions`).pipe(catchError(() => of(null)));
    }

    // Receptionist (system role or custom perm role) → load patients + appointments
    if (this.isReceptionist() || this.auth.hasRole('ADMIN')) {
      this.loadingAppts.set(true);
      calls['patients'] = this.http.get<any>(`${base}/patients?page=0&size=1`).pipe(catchError(() => of(null)));
      calls['appts']    = this.http.get<any>(`${base}/appointments?page=0&size=50`).pipe(catchError(() => of(null)));
    }

    if (Object.keys(calls).length === 0) return;

    forkJoin(calls).subscribe({
      next: (res: any) => {
        if (res.mis) this.mis.set(res.mis);
        if (res.lab) {
          const list = res.lab.content ?? res.lab ?? [];
          this.labPending.set(list.filter((o: any) => o.status === 'ORDERED' || o.status === 'PENDING').length);
        }
        if (res.rx) {
          const list = res.rx.content ?? res.rx ?? [];
          this.rxPending.set(list.filter((p: any) => p.status === 'PENDING').length);
        }
        if (res.alerts) {
          this.stockAlerts.set(Array.isArray(res.alerts) ? res.alerts.length : (res.alerts?.count ?? '—'));
        }
        if (res.patients) {
          const total = res.patients.totalElements ?? res.patients.total ?? (res.patients.content?.length ?? 0);
          this.totalPatients.set(total);
        } else if ('patients' in res) {
          this.totalPatients.set(0);
        }
        if (res.appts) {
          const list = res.appts.content ?? res.appts ?? [];
          const now = new Date(); const tStart = new Date(now); tStart.setHours(0,0,0,0); const tEnd = new Date(now); tEnd.setHours(23,59,59,999);
          const todayAppts = list.filter((a: any) => {
            const d = new Date(a.appointmentTime || a.scheduledFor || a.startsAt);
            return d >= tStart && d <= tEnd;
          });
          const upcoming = list.filter((a: any) => new Date(a.appointmentTime || a.scheduledFor || a.startsAt) >= now)
            .sort((x: any, y: any) => new Date(x.appointmentTime || x.scheduledFor).getTime() - new Date(y.appointmentTime || y.scheduledFor).getTime())
            .slice(0, 10);
          this.apptsToday.set(todayAppts.length);
          this.apptsUpcoming.set(upcoming.length);
          this.upcomingList.set(upcoming);
        } else if ('appts' in res) {
          this.apptsToday.set(0); this.apptsUpcoming.set(0); this.upcomingList.set([]);
        }
        if (res.icu) this.icuOcc.set(`${res.icu.occupied ?? 0}/${res.icu.totalBeds ?? 0}`);
        if (res.wards?.wards) this.bedsAvail.set(res.wards.wards.reduce((s: number, w: any) => s + (w.available || 0), 0));
        if (res.emergency) {
          const list = res.emergency.content ?? res.emergency ?? [];
          this.emergencyWaiting.set(list.filter((e: any) => e.status === 'WAITING').length);
        }
        if (res.admissions) {
          const list = res.admissions.content ?? res.admissions ?? [];
          this.admissionsActive.set(list.filter((a: any) => ['ACTIVE','ADMITTED','TRANSFERRED'].includes(a.status)).length);
          this.dischargesToday.set(list.filter((a: any) => a.status === 'DISCHARGED').length);
        }
        this.loadingAppts.set(false);
      },
      error: () => this.loadingAppts.set(false),
    });
  }

  private localDate(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
}
