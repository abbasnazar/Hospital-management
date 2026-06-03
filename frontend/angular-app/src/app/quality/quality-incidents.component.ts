import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quality-incidents',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Incident Reporting</h1><p>Report and manage clinical incidents and adverse events.</p><div class="placeholder"><p>Incident Reporting Interface</p></div></div>`,
  styles: [`.page-container { padding: 2rem; } h1 { margin-bottom: 1rem; color: #1a2330; } .placeholder { background: #f6f8fb; padding: 2rem; border-radius: 8px; text-align: center; color: #6b7280; }`]
})
export class QualityIncidentsComponent {}
