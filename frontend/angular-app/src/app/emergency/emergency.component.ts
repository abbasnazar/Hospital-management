import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-emergency',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Emergency / Casualty</h1>
    <p class="muted">Register and track casualty cases separately from the OPD flow.</p>

    <form class="card" (ngSubmit)="save()" style="max-width: 760px; margin-bottom: 1.2rem;">
      <div class="grid">
        <div><label>Patient ID (optional)</label><input type="number" [(ngModel)]="m.patientId" name="pid"></div>
        <div><label>Incident type</label><input [(ngModel)]="m.incidentType" name="it"></div>
        <div>
          <label>Severity</label>
          <select [(ngModel)]="m.severity" name="sev">
            <option value="GREEN">Green</option><option value="YELLOW">Yellow</option><option value="RED">Red</option>
          </select>
        </div>
        <div><label>Brought by</label><input [(ngModel)]="m.broughtBy" name="bb"></div>
        <div><label>Ambulance #</label><input [(ngModel)]="m.ambulanceNumber" name="amb"></div>
        <div><label>Emergency doctor ID</label><input type="number" [(ngModel)]="m.emergencyDoctorId" name="edid"></div>
      </div>
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
      <button class="btn" type="submit" [disabled]="loading()" style="margin-top:.8rem;">{{ loading() ? 'Registering…' : 'Register Case' }}</button>
    </form>

    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>Emergency #</th><th>Patient</th><th>Severity</th><th>Incident</th><th>Status</th><th>Arrived</th></tr></thead>
        <tbody>
          <tr *ngFor="let e of rows()">
            <td><strong>{{ e.emergencyNo }}</strong></td><td>{{ e.patientId ?? '—' }}</td>
            <td><span class="badge" [ngClass]="e.severity">{{ e.severity }}</span></td>
            <td>{{ e.incidentType ?? '—' }}</td>
            <td>
              <select [ngModel]="e.status" name="st{{e.id}}" (ngModelChange)="setStatus(e, $event)">
                <option>WAITING</option><option>UNDER_TREATMENT</option><option>OBSERVATION</option><option>ADMITTED</option><option>DISCHARGED</option>
              </select>
            </td>
            <td>{{ e.arrivalTime | date:'short' }}</td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="6" class="muted">No emergency cases</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.7rem 1rem; }
    .muted { color: var(--hmis-muted); }
    .badge { padding:2px 10px; border-radius:999px; font-size:.75rem; font-weight:600; background:#e5e7eb; }
    .badge.GREEN { background:#d1fae5; color:#065f46; }
    .badge.YELLOW { background:#fef3c7; color:#92400e; }
    .badge.RED { background:#fee2e2; color:#991b1b; }
  `]
})
export class EmergencyComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  m: any = { patientId: null, incidentType: '', severity: 'YELLOW', broughtBy: '', ambulanceNumber: '', emergencyDoctorId: null };

  ngOnInit() { this.load(); }
  load() {
    this.http.get<any>(`${environment.apiBase}/emergency`).subscribe({
      next: r => this.rows.set(r.content ?? r ?? []), error: () => this.rows.set([])
    });
  }
  save() {
    this.loading.set(true); this.error.set(null);
    const payload: any = { ...this.m };
    Object.keys(payload).forEach(k => (payload[k] === null || payload[k] === '') && delete payload[k]);
    this.http.post(`${environment.apiBase}/emergency`, payload).subscribe({
      next: () => { this.loading.set(false); this.m = { patientId: null, incidentType: '', severity: 'YELLOW', broughtBy: '', ambulanceNumber: '', emergencyDoctorId: null }; this.load(); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.detail ?? 'Could not register'); }
    });
  }
  setStatus(e: any, status: string) {
    this.http.patch(`${environment.apiBase}/emergency/${e.id}/status`, { status }).subscribe({ next: () => this.load(), error: () => this.load() });
  }
}
