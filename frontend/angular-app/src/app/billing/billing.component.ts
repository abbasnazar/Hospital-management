import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Billing</h1>
    <div class="card" style="max-width: 720px;">
      <h3>Create Invoice</h3>
      <label>Patient ID</label>
      <input type="number" [(ngModel)]="patientId">
      <table style="margin-top: .8rem;">
        <thead><tr><th>Type</th><th>Description</th><th>Qty</th><th>Unit</th><th>Tax</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let it of items; let i = index">
            <td><input [(ngModel)]="it.itemType" name="t{{i}}"></td>
            <td><input [(ngModel)]="it.description" name="d{{i}}"></td>
            <td><input type="number" [(ngModel)]="it.qty" name="q{{i}}"></td>
            <td><input type="number" [(ngModel)]="it.unitPrice" name="u{{i}}"></td>
            <td><input type="number" [(ngModel)]="it.tax" name="x{{i}}"></td>
            <td><button class="btn danger" (click)="items.splice(i,1)">×</button></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: .6rem;">
        <button class="btn secondary" type="button" (click)="addRow()">+ Add line</button>
      </div>
      <div style="margin-top: 1rem; display: flex; gap: .6rem;">
        <button class="btn" (click)="create()">Create Invoice</button>
      </div>
      <div class="alert ok"    *ngIf="invoiceId()">Invoice #{{ invoiceId() }} — total {{ total() }}</div>
      <div class="alert error" *ngIf="error()">{{ error() }}</div>
    </div>
  `
})
export class BillingComponent {
  private http = inject(HttpClient);
  patientId: number | null = null;
  items: any[] = [{ itemType: 'CONSULT', description: 'Out-patient consult', qty: 1, unitPrice: 500, tax: 90 }];
  invoiceId = signal<number | null>(null);
  total     = signal<number | null>(null);
  error     = signal<string | null>(null);

  addRow() { this.items.push({ itemType: '', description: '', qty: 1, unitPrice: 0, tax: 0 }); }

  create() {
    this.error.set(null); this.invoiceId.set(null); this.total.set(null);
    this.http.post<any>(`${environment.apiBase}/invoices`, {
      patientId: this.patientId,
      items: this.items
    }).subscribe({
      next: r => { this.invoiceId.set(r.id); this.total.set(r.totalAmount); },
      error: e => this.error.set(e?.error?.detail ?? 'Invoice failed')
    });
  }
}
