import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-ward',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Ward Dashboard</h1>
    <p class="muted">Occupancy and available beds across all wards.</p>

    <div class="grid" style="margin-bottom:1.2rem;">
      <div class="card stat"><div class="label">Wards</div><div class="value">{{ wards().length }}</div></div>
      <div class="card stat"><div class="label">Total Beds</div><div class="value">{{ total('totalBeds') }}</div></div>
      <div class="card stat"><div class="label">Occupied</div><div class="value">{{ total('occupied') }}</div></div>
      <div class="card stat"><div class="label">Available</div><div class="value">{{ total('available') }}</div></div>
    </div>

    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>Ward</th><th>Category</th><th>Floor</th><th>Total</th><th>Occupied</th><th>Available</th><th>Occupancy</th></tr></thead>
        <tbody>
          <tr *ngFor="let w of wards()">
            <td>{{ w.name }}</td><td>{{ w.category }}</td><td>{{ w.floor ?? '—' }}</td>
            <td>{{ w.totalBeds }}</td><td>{{ w.occupied }}</td><td>{{ w.available }}</td>
            <td><span class="badge" [class.warn]="w.occupancyRate >= 80">{{ w.occupancyRate }}%</span></td>
          </tr>
          <tr *ngIf="wards().length === 0"><td colspan="7" class="muted">No wards configured</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .muted { color: var(--hmis-muted); }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; }
    .stat .label { color: var(--hmis-muted); font-size:.78rem; text-transform:uppercase; }
    .stat .value { font-size:1.8rem; font-weight:700; }
    .badge { padding:2px 10px; border-radius:999px; font-size:.75rem; background:#d1fae5; color:#065f46; }
    .badge.warn { background:#fee2e2; color:#991b1b; }
  `]
})
export class WardComponent implements OnInit {
  private http = inject(HttpClient);
  wards = signal<any[]>([]);
  ngOnInit() {
    this.http.get<any>(`${environment.apiBase}/ipd/wards`).subscribe({
      next: r => this.wards.set(r.wards ?? []), error: () => this.wards.set([])
    });
  }
  total(k: string) { return this.wards().reduce((s, w) => s + (w[k] || 0), 0); }
}
