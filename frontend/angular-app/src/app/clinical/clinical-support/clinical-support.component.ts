import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clinical-support',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>Clinical Support</h1>
      <div class="grid">
        <div class="card">
          <div class="card-header">
            <h2>Drug Interactions Check</h2>
          </div>
          <div class="card-content">
            <p>Check for potential drug-drug interactions</p>
            <button class="btn primary" style="margin-top: 1rem;">Check Interactions</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h2>Contraindications</h2>
          </div>
          <div class="card-content">
            <p>Check medicine contraindications against patient conditions</p>
            <button class="btn primary" style="margin-top: 1rem;">Check Contraindications</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h2>Dosage Guidelines</h2>
          </div>
          <div class="card-content">
            <p>View dosage guidelines for special populations</p>
            <button class="btn primary" style="margin-top: 1rem;">View Guidelines</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h2>Prescribing Audit</h2>
          </div>
          <div class="card-content">
            <p>View prescribing history and decision audit trail</p>
            <button class="btn primary" style="margin-top: 1rem;">View Audit</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 1rem; }
    h1 { margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .card-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
    .card-header h2 { margin: 0; font-size: 1.1rem; }
    .card-content { padding: 1.5rem; }
    .card-content p { margin: 0; color: #6b7280; font-size: 0.875rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
    .btn.primary { background: #3b82f6; color: white; }
    .btn.primary:hover { background: #2563eb; }
  `]
})
export class ClinicalSupportComponent {}
