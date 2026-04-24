import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Dashboard</h1>
    <p class="muted">Real-time operational KPIs for {{ today }}</p>
    <div class="grid">
      <div class="card stat"><div class="label">Registrations today</div><div class="value">{{ mis()?.registrations ?? '—' }}</div></div>
      <div class="card stat"><div class="label">OPD Visits</div>       <div class="value">{{ mis()?.opdCount      ?? '—' }}</div></div>
      <div class="card stat"><div class="label">Lab Orders</div>       <div class="value">{{ mis()?.labOrders     ?? '—' }}</div></div>
      <div class="card stat"><div class="label">Rx Dispensed</div>     <div class="value">{{ mis()?.rxDispensed   ?? '—' }}</div></div>
      <div class="card stat"><div class="label">Revenue gross (₹)</div><div class="value">{{ (mis()?.revenueGross ?? 0) | number:'1.0-2' }}</div></div>
      <div class="card stat"><div class="label">Revenue net (₹)</div>  <div class="value">{{ (mis()?.revenueNet   ?? 0) | number:'1.0-2' }}</div></div>
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 0.2rem; }
    .muted { color: var(--hmis-muted); margin-top: 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-top: 1.2rem; }
    .stat .label { color: var(--hmis-muted); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat .value { font-size: 2rem; font-weight: 700; margin-top: 0.3rem; }
  `]
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  mis = signal<any>(null);
  today = this.localDate();

  ngOnInit() {
    this.http
      .get(`${environment.apiBase}/reports/mis/daily?site=MAIN&date=${this.today}`)
      .subscribe({ next: (r: any) => this.mis.set(r), error: () => this.mis.set(null) });
  }

  /** YYYY-MM-DD in the browser's local timezone (matches server CURRENT_DATE). */
  private localDate(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
