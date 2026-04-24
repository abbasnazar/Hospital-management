import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Book Appointment</h1>
    <form class="card" (ngSubmit)="book()" style="max-width: 560px;">
      <label>Patient ID</label>
      <input type="number" [(ngModel)]="m.patientId" name="pid" required>
      <label>Doctor ID</label>
      <input type="number" [(ngModel)]="m.doctorId" name="did" required>
      <label>Slot start</label>
      <input type="datetime-local" [(ngModel)]="m.slotStart" name="ss" required>
      <label>Slot end</label>
      <input type="datetime-local" [(ngModel)]="m.slotEnd" name="se" required>
      <label>Reason</label>
      <input [(ngModel)]="m.reason" name="r">
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
      <div class="alert ok"    *ngIf="ok()">Appointment #{{ ok() }} booked</div>
      <div style="margin-top: 1rem;"><button class="btn" type="submit">Book</button></div>
    </form>
  `
})
export class AppointmentComponent {
  private http = inject(HttpClient);
  m: any = { patientId: null, doctorId: null, slotStart: '', slotEnd: '', reason: '' };
  error = signal<string | null>(null);
  ok    = signal<number | null>(null);

  book() {
    this.error.set(null); this.ok.set(null);
    const body = {
      ...this.m,
      slotStart: new Date(this.m.slotStart).toISOString(),
      slotEnd:   new Date(this.m.slotEnd).toISOString()
    };
    this.http.post<any>(`${environment.apiBase}/appointments`, body).subscribe({
      next: r => this.ok.set(r.id),
      error: e => this.error.set(e?.error?.detail ?? 'Could not book')
    });
  }
}
