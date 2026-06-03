import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pharmacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Pharmacy {{ isPharmacist ? '— Dispense Queue' : '' }}</h1>
    <p class="muted">
      {{ isPharmacist ? 'Prescriptions awaiting dispense.' :
         isDoctor     ? 'Your recent prescriptions.' :
                        'Pharmacy operations overview.' }}
    </p>

    <div class="grid" style="margin-bottom: 1rem;">
      <div class="card stat"><div class="label">Stock alerts</div><div class="value">{{ stockAlerts() }}</div></div>
      <div class="card stat"><div class="label">Pending Rx</div>  <div class="value">{{ pendingCount() }}</div></div>
    </div>

    <div class="card" style="padding: 0;">
      <table>
        <thead>
          <tr><th>Rx #</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Issued</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of rows()">
            <td>{{ p.id }}</td>
            <td>{{ p.patientId }}</td>
            <td>{{ p.doctorId }}</td>
            <td><span class="badge" [class.warn]="p.status==='PENDING'" [class.ok]="p.status==='DISPENSED'">{{ p.status }}</span></td>
            <td>{{ p.createdAt | date:'short' }}</td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="5" class="muted">No prescriptions found</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .muted { color: var(--hmis-muted); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .stat .label { color: var(--hmis-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat .value { font-size: 1.8rem; font-weight: 700; }
    .badge { padding: 2px 8px; border-radius: 999px; background: #e5e7eb; font-size: 0.75rem; }
    .badge.warn { background: #fef3c7; color: #92400e; }
    .badge.ok   { background: #d1fae5; color: #065f46; }
  `]
})
export class PharmacyComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  rows = signal<any[]>([]);
  stockAlerts = signal<number | string>('—');
  pendingCount = signal<number | string>('—');
  isPharmacist = this.auth.hasRole('PHARMACIST');
  isDoctor     = this.auth.hasRole('DOCTOR');

  ngOnInit() {
    this.http.get<any>(`${environment.apiBase}/pharmacy/prescriptions`).subscribe({
      next: r => {
        const list = r.content ?? r ?? [];
        this.rows.set(list);
        this.pendingCount.set(list.filter((x: any) => x.status === 'PENDING').length);
      },
      error: () => this.rows.set([])
    });
    this.http.get<any>(`${environment.apiBase}/pharmacy/alerts/stock`).subscribe({
      next: r => this.stockAlerts.set(Array.isArray(r) ? r.length : (r?.count ?? '—')),
      error: () => this.stockAlerts.set('—')
    });
  }
}
