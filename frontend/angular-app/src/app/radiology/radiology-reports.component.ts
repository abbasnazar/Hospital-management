import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-radiology-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Radiology Reports</h1>
      <p>Enter and manage radiology findings and impressions.</p>
      <div class="placeholder">
        <p>Radiology Reports Interface</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; }
    h1 { margin-bottom: 1rem; color: #1a2330; }
    .placeholder { background: #f6f8fb; padding: 2rem; border-radius: 8px; text-align: center; color: #6b7280; }
  `]
})
export class RadiologyReportsComponent {}
