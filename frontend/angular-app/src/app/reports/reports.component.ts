import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Reports</h1>
    <p class="muted">Administrative reporting — MIS, revenue, operational counts.</p>

    <div class="card" style="margin-top: 1rem;">
      <h3>Monthly revenue</h3>
      <div style="display:flex; gap:.6rem; align-items: end; margin-bottom: 1rem;">
        <div><label>Year</label><input type="number" [(ngModel)]="year"></div>
        <div><label>Month</label><input type="number" min="1" max="12" [(ngModel)]="month"></div>
        <button class="btn" (click)="loadRevenue()">Run</button>
      </div>
      <pre *ngIf="revenue() as r" style="margin:0; white-space: pre-wrap;">{{ r | json }}</pre>
      <p class="muted" *ngIf="!revenue()">No data yet</p>
    </div>

    <div class="card" style="margin-top: 1rem;">
      <h3>Operational patient counts</h3>
      <button class="btn secondary" (click)="loadCounts()">Refresh</button>
      <pre *ngIf="counts() as c" style="margin-top:.6rem; white-space: pre-wrap;">{{ c | json }}</pre>
    </div>
  `,
  styles: [`
    .muted { color: var(--hmis-muted); }
    label { display: block; font-size: 0.8rem; color: var(--hmis-muted); }
    input { width: 90px; }
  `]
})
export class ReportsComponent implements OnInit {
  private http = inject(HttpClient);
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  revenue = signal<any>(null);
  counts  = signal<any>(null);

  ngOnInit() { this.loadCounts(); this.loadRevenue(); }

  loadRevenue() {
    this.http.get(`${environment.apiBase}/reports/revenue/monthly?year=${this.year}&month=${this.month}`)
      .subscribe({ next: r => this.revenue.set(r), error: () => this.revenue.set(null) });
  }

  loadCounts() {
    this.http.get(`${environment.apiBase}/reports/operational/patient-counts`)
      .subscribe({ next: r => this.counts.set(r), error: () => this.counts.set(null) });
  }
}
