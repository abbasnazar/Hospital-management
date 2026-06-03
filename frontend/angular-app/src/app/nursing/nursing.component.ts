import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-nursing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Nursing Station</h1>
    <p class="muted">Record vitals, medication administration and observations for admitted patients.</p>

    <form class="card" (ngSubmit)="save()" style="max-width: 760px; margin-bottom: 1.2rem;">
      <div class="grid">
        <div><label>Admission ID</label><input type="number" [(ngModel)]="m.admissionId" name="aid" required></div>
        <div><label>Patient ID</label><input type="number" [(ngModel)]="m.patientId" name="pid"></div>
        <div>
          <label>Note type</label>
          <select [(ngModel)]="m.noteType" name="nt">
            <option>OBSERVATION</option><option>VITALS</option><option>MEDICATION</option>
          </select>
        </div>
        <div><label>Medication</label><input [(ngModel)]="m.medication" name="med"></div>
      </div>
      <label>Note</label>
      <textarea [(ngModel)]="m.note" name="note" rows="2"></textarea>
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
      <button class="btn" type="submit" [disabled]="loading()" style="margin-top:.8rem;">{{ loading() ? 'Saving…' : 'Add Note' }}</button>
    </form>

    <div style="margin-bottom:.6rem;">
      <label class="muted">Filter by Admission ID</label>
      <input type="number" [(ngModel)]="filterAdm" name="fa" (change)="load()">
    </div>
    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>#</th><th>Admission</th><th>Type</th><th>Medication</th><th>Note</th><th>Recorded</th></tr></thead>
        <tbody>
          <tr *ngFor="let n of rows()">
            <td>{{ n.id }}</td><td>{{ n.admissionId }}</td><td><span class="badge">{{ n.noteType }}</span></td>
            <td>{{ n.medication ?? '—' }}</td><td>{{ n.note ?? '—' }}</td><td>{{ n.recordedAt | date:'short' }}</td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="6" class="muted">No nursing notes</td></tr>
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
export class NursingComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  filterAdm: number | null = null;
  m: any = { admissionId: null, patientId: null, noteType: 'OBSERVATION', medication: '', note: '' };

  ngOnInit() { this.load(); }
  load() {
    const qs = this.filterAdm ? `?admissionId=${this.filterAdm}` : '';
    this.http.get<any>(`${environment.apiBase}/ipd/nursing/notes${qs}`).subscribe({
      next: r => this.rows.set(r.content ?? r ?? []), error: () => this.rows.set([])
    });
  }
  save() {
    this.loading.set(true); this.error.set(null);
    const payload: any = { ...this.m };
    Object.keys(payload).forEach(k => (payload[k] === null || payload[k] === '') && delete payload[k]);
    this.http.post(`${environment.apiBase}/ipd/nursing/notes`, payload).subscribe({
      next: () => { this.loading.set(false); this.m = { admissionId: null, patientId: null, noteType: 'OBSERVATION', medication: '', note: '' }; this.load(); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.detail ?? 'Could not add note'); }
    });
  }
}
