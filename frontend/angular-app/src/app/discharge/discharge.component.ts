import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-discharge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Discharge</h1>
    <p class="muted">Doctor requests → billing clearance → pharmacy clearance → final approval.</p>

    <form class="card" (ngSubmit)="request()" style="max-width: 640px; margin-bottom: 1.2rem;">
      <div class="grid">
        <div><label>Admission ID</label><input type="number" [(ngModel)]="m.admissionId" name="aid" required></div>
      </div>
      <label>Discharge summary</label>
      <textarea [(ngModel)]="m.dischargeSummary" name="ds" rows="2"></textarea>
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
      <button class="btn" type="submit" [disabled]="loading()" style="margin-top:.8rem;">{{ loading() ? 'Requesting…' : 'Request Discharge' }}</button>
    </form>

    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>#</th><th>Admission</th><th>Status</th><th>Billing</th><th>Pharmacy</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of rows()">
            <td>{{ r.id }}</td><td>{{ r.admissionId }}</td>
            <td><span class="badge" [ngClass]="r.status">{{ r.status }}</span></td>
            <td>{{ r.billingCleared ? '✓' : '—' }}</td><td>{{ r.pharmacyCleared ? '✓' : '—' }}</td>
            <td style="display:flex; gap:.3rem; flex-wrap:wrap;">
              <button class="mini" *ngIf="!r.billingCleared" (click)="step(r,'billing-clear')">Billing Clear</button>
              <button class="mini" *ngIf="!r.pharmacyCleared" (click)="step(r,'pharmacy-clear')">Pharmacy Clear</button>
              <button class="mini ok" *ngIf="r.billingCleared && r.pharmacyCleared && r.status!=='COMPLETED'" (click)="approve(r)">Approve</button>
            </td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="6" class="muted">No discharge requests</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:.7rem 1rem; }
    .muted { color: var(--hmis-muted); }
    .badge { padding:2px 10px; border-radius:999px; font-size:.72rem; background:#e5e7eb; }
    .badge.REQUESTED { background:#fef3c7; color:#92400e; }
    .badge.BILLING_CLEARED, .badge.PHARMACY_CLEARED { background:#dbeafe; color:#1e40af; }
    .badge.COMPLETED, .badge.APPROVED { background:#d1fae5; color:#065f46; }
    .mini { padding:3px 8px; font-size:.75rem; border-radius:5px; border:1px solid #cbd5e1; background:#f8fafc; cursor:pointer; }
    .mini.ok { background:#d1fae5; color:#065f46; border-color:#a7f3d0; }
  `]
})
export class DischargeComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  m: any = { admissionId: null, dischargeSummary: '' };

  ngOnInit() { this.load(); }
  load() {
    this.http.get<any>(`${environment.apiBase}/ipd/discharge/requests`).subscribe({
      next: r => this.rows.set(r.content ?? r ?? []), error: () => this.rows.set([])
    });
  }
  request() {
    this.loading.set(true); this.error.set(null);
    const payload: any = { ...this.m };
    Object.keys(payload).forEach(k => (payload[k] === null || payload[k] === '') && delete payload[k]);
    this.http.post(`${environment.apiBase}/ipd/discharge/requests`, payload).subscribe({
      next: () => { this.loading.set(false); this.m = { admissionId: null, dischargeSummary: '' }; this.load(); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.detail ?? 'Could not request discharge'); }
    });
  }
  step(r: any, s: string) {
    this.http.patch(`${environment.apiBase}/ipd/discharge/requests/${r.id}/${s}`, {}).subscribe({ next: () => this.load(), error: e => this.error.set(e?.error?.detail ?? 'Step failed') });
  }
  approve(r: any) {
    this.http.patch(`${environment.apiBase}/ipd/discharge/requests/${r.id}/approve`, { dischargeType: 'HOME' }).subscribe({ next: () => this.load(), error: e => this.error.set(e?.error?.detail ?? 'Approve failed') });
  }
}
