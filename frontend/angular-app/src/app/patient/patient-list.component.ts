import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="header">
      <div>
        <h1>Patients</h1>
        <p class="muted">Search, view and register patients</p>
      </div>
      <a class="btn" routerLink="/patients/new">+ New Patient</a>
    </div>

    <div class="toolbar card">
      <input [(ngModel)]="q" (keyup.enter)="load()" placeholder="Search by name, MRN or phone...">
      <button class="btn" (click)="load()">Search</button>
    </div>

    <div class="card" style="margin-top: 1rem; padding: 0;">
      <table>
        <thead>
          <tr><th>MRN</th><th>Name</th><th>DOB</th><th>Gender</th><th>Phone</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of rows()">
            <td>{{ p.mrn }}</td>
            <td>{{ p.firstName }} {{ p.lastName }}</td>
            <td>{{ p.dob }}</td>
            <td>{{ p.gender }}</td>
            <td>{{ p.phone }}</td>
          </tr>
          <tr *ngIf="rows().length === 0"><td colspan="5" class="muted">No patients found</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; }
    .muted { color: var(--hmis-muted); }
    .toolbar { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .toolbar input { flex: 1; }
  `]
})
export class PatientListComponent implements OnInit {
  private http = inject(HttpClient);
  q = '';
  rows = signal<any[]>([]);

  ngOnInit() { this.load(); }

  load() {
    const qs = this.q ? `?q=${encodeURIComponent(this.q)}` : '';
    this.http.get<any>(`${environment.apiBase}/patients${qs}`).subscribe({
      next: r => this.rows.set(r.content ?? r),
      error: () => this.rows.set([])
    });
  }
}
