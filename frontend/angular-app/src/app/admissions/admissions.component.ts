import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Admissions</h1>
    <p class="muted">Recommend, approve and track patient admissions.</p>

    <form class="card" (ngSubmit)="save()" style="max-width: 820px; margin-bottom: 1.2rem;">
      <div class="grid">
        <div><label>Patient ID</label><input type="number" [(ngModel)]="m.patientId" name="pid" required></div>
        <div><label>Doctor ID</label><input type="number" [(ngModel)]="m.doctorId" name="did" required></div>
        <div>
          <label>Source</label>
          <select [(ngModel)]="m.admissionSource" name="src">
            <option value="PLANNED">Planned</option>
            <option value="DOCTOR_RECOMMENDATION">Doctor Recommendation</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>
        <div><label>Department</label><input [(ngModel)]="m.department" name="dep"></div>
        <div>
          <label>Bed type</label>
          <select [(ngModel)]="m.bedType" name="bt">
            <option value="">—</option><option>ICU</option><option>HDU</option><option>GENERAL</option><option>PRIVATE</option><option>SEMI_PRIVATE</option>
          </select>
        </div>
        <div><label>Consulting doctor ID</label><input type="number" [(ngModel)]="m.consultingDoctorId" name="cdid"></div>
      </div>
      <label>Reason</label>
      <input [(ngModel)]="m.reason" name="rsn" required>
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
      <button class="btn" type="submit" [disabled]="loading()" style="margin-top:.8rem;">{{ loading() ? 'Saving…' : 'Create Admission' }}</button>
    </form>

    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>Adm #</th><th>Patient</th><th>Source</th><th>Dept</th><th>Bed</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let a of rows()">
            <td><strong>{{ a.admissionNo }}</strong></td><td>{{ a.patientId }}</td><td>{{ a.admissionSource }}</td>
            <td>{{ a.department ?? '—' }}</td><td>{{ a.bed?.bedNumber ?? a.bedId ?? '—' }}</td>
            <td><span class="badge" [ngClass]="a.status">{{ a.status }}</span></td>
            <td>
              <span *ngIf="a.status==='PENDING'" style="display:flex; gap:.3rem; align-items:center;">
                <input type="number" placeholder="bed id" [(ngModel)]="approveBed[a.id]" name="ab{{a.id}}" style="width:80px;">
                <button class="mini" (click)="approve(a)">Approve</button>
              </span>
            </td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="7" class="muted">No admissions</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.7rem 1rem; }
    .muted { color: var(--hmis-muted); }
    .badge { padding:2px 10px; border-radius:999px; font-size:.75rem; background:#e5e7eb; }
    .badge.PENDING { background:#fef3c7; color:#92400e; }
    .badge.ADMITTED, .badge.ACTIVE { background:#d1fae5; color:#065f46; }
    .badge.DISCHARGED { background:#e0e7ff; color:#3730a3; }
    .badge.TRANSFERRED { background:#dbeafe; color:#1e40af; }
    .mini { padding:3px 8px; font-size:.75rem; border-radius:5px; border:1px solid #cbd5e1; background:#f8fafc; cursor:pointer; }
  `]
})
export class AdmissionsComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  approveBed: Record<number, number> = {};
  m: any = { patientId: null, doctorId: null, admissionSource: 'PLANNED', department: '', bedType: '', consultingDoctorId: null, reason: '' };

  ngOnInit() { this.load(); }
  load() {
    this.http.get<any>(`${environment.apiBase}/ipd/admissions`).subscribe({
      next: r => this.rows.set(r.content ?? r ?? []), error: () => this.rows.set([])
    });
  }
  save() {
    this.loading.set(true); this.error.set(null);
    const payload: any = { ...this.m };
    Object.keys(payload).forEach(k => (payload[k] === null || payload[k] === '') && delete payload[k]);
    this.http.post(`${environment.apiBase}/ipd/admissions`, payload).subscribe({
      next: () => { this.loading.set(false); this.m = { patientId: null, doctorId: null, admissionSource: 'PLANNED', department: '', bedType: '', consultingDoctorId: null, reason: '' }; this.load(); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.detail ?? 'Could not create admission'); }
    });
  }
  approve(a: any) {
    const bedId = this.approveBed[a.id];
    this.http.patch(`${environment.apiBase}/ipd/admissions/${a.id}/approve`, bedId ? { bedId } : {}).subscribe({
      next: () => this.load(), error: e => this.error.set(e?.error?.detail ?? 'Approve failed')
    });
  }
}
