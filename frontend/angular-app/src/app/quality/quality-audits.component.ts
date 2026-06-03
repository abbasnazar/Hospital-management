import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quality-audits',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="page-container"><h1>Clinical Audits</h1><p>Conduct and manage clinical audit activities.</p><div class="placeholder"><p>Clinical Audits Interface</p></div></div>`,
  styles: [`.page-container { padding: 2rem; } h1 { margin-bottom: 1rem; color: #1a2330; } .placeholder { background: #f6f8fb; padding: 2rem; border-radius: 8px; text-align: center; color: #6b7280; }`]
})
export class QualityAuditsComponent {}
