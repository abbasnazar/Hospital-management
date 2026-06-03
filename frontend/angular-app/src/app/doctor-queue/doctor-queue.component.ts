import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-doctor-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Doctor Queue</h1>
    <div style="display:flex; gap:.8rem; align-items:end; margin-bottom:1rem;">
      <div><label class="muted">Doctor ID</label><br><input type="number" [(ngModel)]="doctorId" name="d" (change)="load()"></div>
      <button class="btn" (click)="callNext()">Call Next</button>
    </div>

    <div class="grid" style="margin-bottom:1rem;">
      <div class="card stat"><div class="label">Waiting</div><div class="value">{{ stats()?.waiting ?? '—' }}</div></div>
      <div class="card stat"><div class="label">In Consultation</div><div class="value">{{ stats()?.inConsultation ?? '—' }}</div></div>
      <div class="card stat"><div class="label">Avg Wait (min)</div><div class="value">{{ stats()?.avgWaitMins ?? '—' }}</div></div>
    </div>

    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>Pos</th><th>Token</th><th>Patient</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let q of rows()">
            <td>{{ q.queuePosition }}</td><td><strong>{{ q.tokenNo }}</strong></td><td>{{ q.patientId }}</td>
            <td><span class="badge" [class.ok]="q.status==='IN_CONSULTATION'">{{ q.status }}</span></td>
            <td style="display:flex; gap:.3rem;">
              <button class="mini" (click)="act(q.id,'complete')" *ngIf="q.status==='IN_CONSULTATION'">Complete</button>
              <button class="mini" (click)="act(q.id,'skip')" *ngIf="q.status==='WAITING'">Skip</button>
              <button class="mini danger" (click)="act(q.id,'no-show')" *ngIf="q.status==='WAITING'">No Show</button>
            </td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="5" class="muted">Queue empty — set a Doctor ID and check patients in.</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .muted { color: var(--hmis-muted); }
    .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
    .stat .label { color: var(--hmis-muted); font-size:.78rem; text-transform:uppercase; }
    .stat .value { font-size:1.8rem; font-weight:700; }
    .badge { padding:2px 10px; border-radius:999px; font-size:.75rem; background:#e5e7eb; }
    .badge.ok { background:#d1fae5; color:#065f46; }
    .mini { padding:3px 8px; font-size:.75rem; border-radius:5px; border:1px solid #cbd5e1; background:#f8fafc; cursor:pointer; }
    .mini.danger { background:#fee2e2; color:#991b1b; border-color:#fecaca; }
  `]
})
export class DoctorQueueComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<any[]>([]);
  stats = signal<any>(null);
  doctorId: number | null = null;

  ngOnInit() { this.load(); }
  private qs() { return this.doctorId ? `?doctorId=${this.doctorId}` : ''; }
  load() {
    this.http.get<any>(`${environment.apiBase}/queue${this.qs()}`).subscribe({
      next: r => this.rows.set(r.content ?? []), error: () => this.rows.set([])
    });
    this.http.get<any>(`${environment.apiBase}/queue/stats${this.qs()}`).subscribe({
      next: r => this.stats.set(r), error: () => this.stats.set(null)
    });
  }
  callNext() {
    if (!this.doctorId) return;
    this.http.post(`${environment.apiBase}/queue/call-next`, { doctorId: this.doctorId }).subscribe({ next: () => this.load(), error: () => this.load() });
  }
  act(id: number, action: string) {
    this.http.post(`${environment.apiBase}/queue/${id}/${action}`, {}).subscribe({ next: () => this.load(), error: () => this.load() });
  }
}
