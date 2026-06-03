import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Register Patient</h1>
    <form class="card" (ngSubmit)="save()" style="max-width: 640px;">
      <div class="grid">
        <div><label>First name</label><input [(ngModel)]="model.firstName" name="fn" required></div>
        <div><label>Last name</label><input [(ngModel)]="model.lastName" name="ln" required></div>
        <div><label>Date of birth</label><input type="date" [(ngModel)]="model.dob" name="dob" required></div>
        <div>
          <label>Gender</label>
          <select [(ngModel)]="model.gender" name="g" required>
            <option value="">— select —</option>
            <option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
          </select>
        </div>
        <div><label>Phone</label><input [(ngModel)]="model.phone" name="p"></div>
        <div><label>Email</label><input type="email" [(ngModel)]="model.email" name="e"></div>
        <div><label>Blood group</label><input [(ngModel)]="model.bloodGroup" name="bg"></div>
        <div><label>Emergency contact</label><input [(ngModel)]="model.emergencyContact" name="ec"></div>
        <div>
          <label>Visit category</label>
          <select [(ngModel)]="model.visitCategory" name="vc" required>
            <option value="OPD">OPD (Out-Patient)</option>
            <option value="CASUALTY">Casualty (Emergency)</option>
          </select>
        </div>
      </div>
      <label>Address</label>
      <textarea [(ngModel)]="model.address" name="a" rows="2"></textarea>
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
      <div class="alert ok"    *ngIf="ok()">Patient registered — MRN {{ ok() }}</div>
      <div style="display:flex; gap: .5rem; margin-top: 1rem;">
        <button class="btn" type="submit" [disabled]="loading()">{{ loading() ? 'Saving...' : 'Save' }}</button>
        <button class="btn secondary" type="button" (click)="router.navigate(['/patients'])">Cancel</button>
      </div>
    </form>
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem 1rem; }
  `]
})
export class PatientFormComponent {
  private http = inject(HttpClient);
  router = inject(Router);

  model = {
    firstName: '', lastName: '', dob: '', gender: '',
    phone: '', email: '', address: '', emergencyContact: '', bloodGroup: '', visitCategory: 'OPD'
  };
  loading = signal(false);
  error   = signal<string | null>(null);
  ok      = signal<string | null>(null);

  save() {
    this.loading.set(true); this.error.set(null); this.ok.set(null);
    this.http.post<any>(`${environment.apiBase}/patients`, this.model).subscribe({
      next: r => { this.loading.set(false); this.ok.set(r.mrn); },
      error: e => { this.loading.set(false); this.error.set(e?.error?.detail ?? 'Could not save'); }
    });
  }
}
