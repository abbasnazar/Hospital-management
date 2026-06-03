import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-triage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Triage</h1>
    <p class="muted">Record vitals and assign urgency before the patient sees a doctor.</p>

    <form class="card" (ngSubmit)="save()" style="max-width: 760px; margin-bottom: 1.2rem;">
      <div class="grid">
        <div><label>Patient ID</label><input type="number" [(ngModel)]="m.patientId" name="pid" required></div>
        <div><label>Temperature (°C)</label><input type="number" step="0.1" [(ngModel)]="m.temperature" name="t"></div>
        <div><label>Pulse (bpm)</label><input type="number" [(ngModel)]="m.pulse" name="pl"></div>
        <div><label>BP Systolic</label><input type="number" [(ngModel)]="m.bpSystolic" name="bps"></div>
        <div><label>BP Diastolic</label><input type="number" [(ngModel)]="m.bpDiastolic" name="bpd"></div>
        <div><label>O₂ Saturation (%)</label><input type="number" [(ngModel)]="m.oxygenSaturation" name="o2"></div>
        <div><label>Weight (kg)</label><input type="number" step="0.1" [(ngModel)]="m.weight" name="w"></div>
        <div><label>Height (cm)</label><input type="number" step="0.1" [(ngModel)]="m.height" name="h"></div>
        <div>
          <label>Priority (auto if blank)</label>
          <select [(ngModel)]="m.priority" name="pr">
            <option value="">— derive from vitals —</option>
            <option value="GREEN">Green — normal OPD</option>
            <option value="YELLOW">Yellow — priority queue</option>
            <option value="RED">Red — casualty</option>
          </select>
        </div>
      </div>
      <label>Chief complaint</label>
      <textarea [(ngModel)]="m.chiefComplaint" name="cc" rows="2"></textarea>
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
      <button class="btn" type="submit" [disabled]="loading()" style="margin-top:.8rem;">{{ loading() ? 'Saving…' : 'Record Triage' }}</button>
    </form>

    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>#</th><th>Patient</th><th>Priority</th><th>Pulse</th><th>O₂</th><th>BP</th><th>Status</th><th>Time</th></tr></thead>
        <tbody>
          <tr *ngFor="let t of rows()">
            <td>{{ t.id }}</td><td>{{ t.patientId }}</td>
            <td><span class="badge" [ngClass]="t.priority">{{ t.priority }}</span></td>
            <td>{{ t.pulse ?? '—' }}</td><td>{{ t.oxygenSaturation ?? '—' }}</td>
            <td>{{ t.bpSystolic ? t.bpSystolic + '/' + (t.bpDiastolic ?? '') : '—' }}</td>
            <td>{{ t.status }}</td><td>{{ t.createdAt | date:'short' }}</td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="8" class="muted">No triage records yet</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.7rem 1rem; }
    .muted { color: var(--hmis-muted); }
    .badge { padding:2px 10px; border-radius:999px; font-size:.75rem; font-weight:600; background:#e5e7eb; }
    .badge.GREEN  { background:#d1fae5; color:#065f46; }
    .badge.YELLOW { background:#fef3c7; color:#92400e; }
    .badge.RED    { background:#fee2e2; color:#991b1b; }
  `]
})
export class TriageComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  m: any = { patientId: null, temperature: null, pulse: null, bpSystolic: null, bpDiastolic: null, oxygenSaturation: null, weight: null, height: null, priority: '', chiefComplaint: '' };

  ngOnInit() { this.load(); }
  load() {
    this.http.get<any>(`${environment.apiBase}/triage`).subscribe({
      next: r => this.rows.set(r.content ?? r ?? []), error: () => this.rows.set([])
    });
  }
  save() {
    this.loading.set(true); this.error.set(null);
    const payload: any = { ...this.m };
    Object.keys(payload).forEach(k => (payload[k] === null || payload[k] === '') && delete payload[k]);
    this.http.post(`${environment.apiBase}/triage`, payload).subscribe({
      next: () => { this.loading.set(false); this.m = { patientId: null, temperature: null, pulse: null, bpSystolic: null, bpDiastolic: null, oxygenSaturation: null, weight: null, height: null, priority: '', chiefComplaint: '' }; this.load(); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.detail ?? 'Could not save triage'); }
    });
  }
}
