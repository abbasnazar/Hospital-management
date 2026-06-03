import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-beds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Bed Management</h1>
    <p class="muted">Allocate, release and update the status of beds across wards.</p>

    <div class="card" style="padding:0;">
      <table>
        <thead><tr><th>Bed</th><th>Ward</th><th>Category</th><th>Floor</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let b of rows()">
            <td><strong>{{ b.bedNumber }}</strong></td><td>{{ b.ward?.name ?? b.wardId }}</td>
            <td>{{ b.ward?.category ?? '—' }}</td><td>{{ b.floor ?? '—' }}</td>
            <td><span class="badge" [ngClass]="b.status">{{ b.status }}</span></td>
            <td style="display:flex; gap:.3rem;">
              <button class="mini" *ngIf="b.status==='AVAILABLE'" (click)="act(b,'allocate')">Allocate</button>
              <button class="mini" *ngIf="b.status==='OCCUPIED'" (click)="act(b,'release')">Release</button>
              <select class="mini" [ngModel]="b.status" name="s{{b.id}}" (ngModelChange)="setStatus(b,$event)">
                <option>AVAILABLE</option><option>OCCUPIED</option><option>RESERVED</option><option>CLEANING</option><option>MAINTENANCE</option>
              </select>
            </td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="6" class="muted">No beds configured</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .muted { color: var(--hmis-muted); }
    .badge { padding:2px 10px; border-radius:999px; font-size:.75rem; background:#e5e7eb; }
    .badge.AVAILABLE { background:#d1fae5; color:#065f46; }
    .badge.OCCUPIED { background:#fee2e2; color:#991b1b; }
    .badge.RESERVED { background:#fef3c7; color:#92400e; }
    .badge.CLEANING, .badge.MAINTENANCE { background:#e0e7ff; color:#3730a3; }
    .mini { padding:3px 8px; font-size:.75rem; border-radius:5px; border:1px solid #cbd5e1; background:#f8fafc; cursor:pointer; }
  `]
})
export class BedsComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<any[]>([]);

  ngOnInit() { this.load(); }
  load() {
    this.http.get<any>(`${environment.apiBase}/ipd/beds`).subscribe({
      next: r => this.rows.set(r.content ?? r ?? []), error: () => this.rows.set([])
    });
  }
  act(b: any, action: string) {
    this.http.post(`${environment.apiBase}/ipd/beds/${b.id}/${action}`, {}).subscribe({ next: () => this.load(), error: () => this.load() });
  }
  setStatus(b: any, status: string) {
    if (status === b.status) return;
    this.http.patch(`${environment.apiBase}/ipd/beds/${b.id}/status`, { status }).subscribe({ next: () => this.load(), error: () => this.load() });
  }
}
