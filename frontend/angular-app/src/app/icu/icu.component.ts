import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-icu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>ICU Dashboard</h1>
    <p class="muted">Live ICU occupancy and critical-patient overview.</p>

    <div class="grid" style="margin-bottom:1.2rem;">
      <div class="card stat"><div class="label">ICU Beds</div><div class="value">{{ d()?.totalBeds ?? '—' }}</div></div>
      <div class="card stat"><div class="label">Occupied</div><div class="value">{{ d()?.occupied ?? '—' }}</div></div>
      <div class="card stat"><div class="label">Available</div><div class="value">{{ d()?.available ?? '—' }}</div></div>
      <div class="card stat"><div class="label">Occupancy</div><div class="value">{{ d()?.occupancyRate ?? '—' }}%</div></div>
      <div class="card stat"><div class="label">Critical Patients</div><div class="value">{{ d()?.criticalPatients ?? '—' }}</div></div>
    </div>

    <h3>ICU Wards</h3>
    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>Ward</th><th>Floor</th><th>Total</th><th>Occupied</th><th>Available</th><th>Occupancy</th></tr></thead>
        <tbody>
          <tr *ngFor="let w of d()?.wards ?? []">
            <td>{{ w.name }}</td><td>{{ w.floor ?? '—' }}</td><td>{{ w.totalBeds }}</td>
            <td>{{ w.occupied }}</td><td>{{ w.available }}</td><td>{{ w.occupancyRate }}%</td>
          </tr>
          <tr *ngIf="(d()?.wards ?? []).length === 0"><td colspan="6" class="muted">No ICU wards configured</td></tr>
        </tbody>
      </table>
    </div>

    <p class="muted" style="margin-top:1rem;">Assigned doctors: {{ (d()?.assignedDoctors ?? []).join(', ') || '—' }}
      &nbsp;|&nbsp; Assigned nurses: {{ (d()?.assignedNurses ?? []).join(', ') || '—' }}</p>
  `,
  styles: [`
    .muted { color: var(--hmis-muted); }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; }
    .stat .label { color: var(--hmis-muted); font-size:.78rem; text-transform:uppercase; }
    .stat .value { font-size:1.8rem; font-weight:700; }
  `]
})
export class IcuComponent implements OnInit {
  private http = inject(HttpClient);
  d = signal<any>(null);
  ngOnInit() {
    this.http.get<any>(`${environment.apiBase}/ipd/icu/dashboard`).subscribe({
      next: r => this.d.set(r), error: () => this.d.set(null)
    });
  }
}
