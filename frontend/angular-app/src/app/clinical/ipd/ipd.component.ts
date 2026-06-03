import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ipd',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>In-Patient Department (IPD)</h1>
      <div class="grid">
        <div class="stat-card">
          <div class="stat-value">0</div>
          <div class="stat-label">Current Admissions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">0</div>
          <div class="stat-label">Available Beds</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">0</div>
          <div class="stat-label">Occupied Beds</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">0</div>
          <div class="stat-label">Discharges Today</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Ward Management</h2>
          <button class="btn primary">New Admission</button>
        </div>
        <div class="card-content">
          <p>Manage patient admissions, bed assignments, and discharges</p>
          <button class="btn secondary" style="margin-top: 1rem;">View Ward Census</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 1rem; }
    h1 { margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; border-radius: 8px; padding: 1.5rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-value { font-size: 2rem; font-weight: 700; color: #1f2937; }
    .stat-label { font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; }
    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .card-header h2 { margin: 0; font-size: 1.2rem; }
    .card-content { padding: 1.5rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
    .btn.primary { background: #3b82f6; color: white; }
    .btn.primary:hover { background: #2563eb; }
    .btn.secondary { background: #e5e7eb; color: #1f2937; }
    .btn.secondary:hover { background: #d1d5db; }
  `]
})
export class IPDComponent {}
