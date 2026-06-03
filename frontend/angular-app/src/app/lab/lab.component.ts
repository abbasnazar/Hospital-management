import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Lab {{ isLabTech ? '— Sample Queue' : '' }}</h1>
    <p class="muted">
      {{ isLabTech ? 'Pending orders awaiting sample collection / processing.' :
         isDoctor  ? 'Lab orders you have requested.' :
                     'All lab orders across the hospital.' }}
    </p>

    <div class="card" style="padding: 0; margin-top: 1rem;">
      <table>
        <thead>
          <tr><th>Order #</th><th>Patient</th><th>Test</th><th>Status</th><th>Ordered</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let o of rows()">
            <td>{{ o.id }}</td>
            <td>{{ o.patientId }}</td>
            <td>{{ o.testCode || o.testId }}</td>
            <td><span class="badge" [class.warn]="o.status==='ORDERED'" [class.ok]="o.status==='COMPLETED'">{{ o.status }}</span></td>
            <td>{{ o.createdAt | date:'short' }}</td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="5" class="muted">No lab orders found</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .muted { color: var(--hmis-muted); }
    .badge { padding: 2px 8px; border-radius: 999px; background: #e5e7eb; font-size: 0.75rem; }
    .badge.warn { background: #fef3c7; color: #92400e; }
    .badge.ok   { background: #d1fae5; color: #065f46; }
  `]
})
export class LabComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  rows = signal<any[]>([]);
  isLabTech = this.auth.hasRole('LAB_TECH');
  isDoctor  = this.auth.hasRole('DOCTOR');

  ngOnInit() {
    this.http.get<any>(`${environment.apiBase}/lab/orders`).subscribe({
      next: r => this.rows.set(r.content ?? r ?? []),
      error: () => this.rows.set([])
    });
  }
}
