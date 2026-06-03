import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Check-In Desk</h1>
    <p class="muted">Mark patients arrived, issue a token and place them in the queue.</p>

    <form class="card" (ngSubmit)="save()" style="max-width: 560px; margin-bottom: 1.2rem;">
      <div class="grid">
        <div><label>Patient ID</label><input type="number" [(ngModel)]="m.patientId" name="pid" required></div>
        <div><label>Appointment ID (optional)</label><input type="number" [(ngModel)]="m.appointmentId" name="aid"></div>
        <div><label>Doctor ID (queue, optional)</label><input type="number" [(ngModel)]="m.doctorId" name="did"></div>
      </div>
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
      <button class="btn" type="submit" [disabled]="loading()" style="margin-top:.8rem;">{{ loading() ? 'Checking in…' : 'Check In' }}</button>
    </form>

    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>Token</th><th>Patient</th><th>Queue Pos</th><th>Status</th><th>Checked In</th></tr></thead>
        <tbody>
          <tr *ngFor="let c of rows()">
            <td><strong>{{ c.tokenNo }}</strong></td><td>{{ c.patientId }}</td><td>{{ c.queuePosition }}</td>
            <td><span class="badge">{{ c.status }}</span></td><td>{{ c.checkedInAt | date:'short' }}</td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="5" class="muted">No check-ins yet</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:.7rem 1rem; }
    .muted { color: var(--hmis-muted); }
    .badge { padding:2px 10px; border-radius:999px; font-size:.75rem; background:#e0e7ff; color:#3730a3; }
  `]
})
export class CheckinComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  m: any = { patientId: null, appointmentId: null, doctorId: null };

  ngOnInit() { this.load(); }
  load() {
    this.http.get<any>(`${environment.apiBase}/checkins`).subscribe({
      next: r => this.rows.set(r.content ?? r ?? []), error: () => this.rows.set([])
    });
  }
  save() {
    this.loading.set(true); this.error.set(null);
    const payload: any = { ...this.m };
    Object.keys(payload).forEach(k => (payload[k] === null || payload[k] === '') && delete payload[k]);
    this.http.post(`${environment.apiBase}/checkins`, payload).subscribe({
      next: () => { this.loading.set(false); this.m = { patientId: null, appointmentId: null, doctorId: null }; this.load(); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.detail ?? 'Could not check in'); }
    });
  }
}
