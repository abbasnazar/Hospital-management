import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>Prescriptions</h1>
      <div class="card">
        <div class="card-header">
          <h2>Prescription Management</h2>
          <button class="btn primary">New Prescription</button>
        </div>
        <div class="card-content">
          <p>Prescription management system for creating, approving, and dispensing prescriptions.</p>
          <div class="grid">
            <div class="stat">
              <div class="value">0</div>
              <div class="label">Active Prescriptions</div>
            </div>
            <div class="stat">
              <div class="value">0</div>
              <div class="label">Pending Approval</div>
            </div>
            <div class="stat">
              <div class="value">0</div>
              <div class="label">Dispensed Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 1rem; }
    h1 { margin-bottom: 1.5rem; }
    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .card-header h2 { margin: 0; font-size: 1.2rem; }
    .card-content { padding: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 1rem; }
    .stat { background: #f3f4f6; padding: 1.5rem; border-radius: 6px; text-align: center; }
    .stat .value { font-size: 2rem; font-weight: 700; color: #1f2937; }
    .stat .label { font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
    .btn.primary { background: #3b82f6; color: white; }
    .btn.primary:hover { background: #2563eb; }
  `]
})
export class PrescriptionsComponent {}
