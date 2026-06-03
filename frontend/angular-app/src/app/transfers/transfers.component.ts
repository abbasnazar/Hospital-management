import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Patient Transfers</h1>
    <p class="muted">Move admitted patients between wards, ICU, HDU and OT.</p>

    <form class="card" (ngSubmit)="save()" style="max-width: 820px; margin-bottom: 1.2rem;">
      <div class="grid">
        <div><label>Admission ID</label><input type="number" [(ngModel)]="m.admissionId" name="aid" required></div>
        <div><label>To Bed ID</label><input type="number" [(ngModel)]="m.toBedId" name="tb"></div>
        <div><label>From location</label><input [(ngModel)]="m.fromLocation" name="fl"></div>
        <div><label>To location</label><input [(ngModel)]="m.toLocation" name="tl"></div>
        <div style="display:flex; align-items:center; gap:.4rem; margin-top:1.4rem;">
          <input type="checkbox" [(ngModel)]="m.doctorApproval" name="da" id="da"><label for="da" style="margin:0;">Doctor approved</label>
        </div>
      </div>
      <label>Reason</label>
      <input [(ngModel)]="m.reason" name="rsn">
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
      <button class="btn" type="submit" [disabled]="loading()" style="margin-top:.8rem;">{{ loading() ? 'Saving…' : 'Record Transfer' }}</button>
    </form>

    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>#</th><th>Admission</th><th>Patient</th><th>From → To</th><th>Reason</th><th>Approved</th><th>When</th></tr></thead>
        <tbody>
          <tr *ngFor="let t of rows()">
            <td>{{ t.id }}</td><td>{{ t.admissionId }}</td><td>{{ t.patientId }}</td>
            <td>{{ t.fromLocation ?? t.fromBedId ?? '—' }} → {{ t.toLocation ?? t.toBedId ?? '—' }}</td>
            <td>{{ t.reason ?? '—' }}</td><td>{{ t.doctorApproval ? 'Yes' : 'No' }}</td><td>{{ t.transferredAt | date:'short' }}</td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="7" class="muted">No transfers recorded</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.7rem 1rem; }
    .muted { color: var(--hmis-muted); }
  `]
})
export class TransfersComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  m: any = { admissionId: null, toBedId: null, fromLocation: '', toLocation: '', doctorApproval: false, reason: '' };

  ngOnInit() { this.load(); }
  load() {
    this.http.get<any>(`${environment.apiBase}/ipd/transfers`).subscribe({
      next: r => this.rows.set(r.content ?? r ?? []), error: () => this.rows.set([])
    });
  }
  save() {
    this.loading.set(true); this.error.set(null);
    const payload: any = { ...this.m };
    Object.keys(payload).forEach(k => (payload[k] === null || payload[k] === '') && delete payload[k]);
    this.http.post(`${environment.apiBase}/ipd/transfers`, payload).subscribe({
      next: () => { this.loading.set(false); this.m = { admissionId: null, toBedId: null, fromLocation: '', toLocation: '', doctorApproval: false, reason: '' }; this.load(); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.detail ?? 'Could not record transfer'); }
    });
  }
}
