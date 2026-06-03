import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  orgId: number;
  status: string;
  organization?: { id: number; name: string; category: string };
}

interface Organization {
  id: number;
  name: string;
  category: string;
}

@Component({
  selector: 'app-superadmin-admins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Admin Accounts</h1>
      <p class="muted">Manage admin accounts and their organization assignments</p>

      <button class="btn" (click)="toggleNewForm()">
        {{ showNewForm() ? '✕ Cancel' : '+ Create Admin' }}
      </button>

      <div *ngIf="showNewForm()" class="card" style="margin: 20px 0; padding: 20px;">
        <h3>Create New Admin</h3>
        <input type="text" placeholder="Username" [(ngModel)]="newForm.username" />
        <input type="email" placeholder="Email" [(ngModel)]="newForm.email" />
        <input type="password" placeholder="Password" [(ngModel)]="newForm.password" />
        <select [(ngModel)]="newForm.orgId">
          <option [value]="null">Select Category</option>
          <option *ngFor="let org of categories()" [value]="org.id">{{ org.name }}</option>
        </select>
        <button class="btn" (click)="createAdmin()">Create</button>
      </div>

      <div *ngIf="admins().length > 0" style="margin-top: 20px;">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let admin of admins()">
              <td>{{ admin.username }}</td>
              <td>{{ admin.email }}</td>
              <td>{{ admin.organization?.name || '—' }}</td>
              <td><span class="badge" [class.inactive]="admin.status !== 'ACTIVE'">{{ admin.status }}</span></td>
              <td>
                <button class="btn small" (click)="editAdmin(admin)">Edit</button>
                <button class="btn small danger" (click)="archiveAdmin(admin.id)">
                  {{ admin.status === 'ARCHIVED' ? 'Restore' : 'Archive' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="admins().length === 0" class="muted">No admin accounts yet</p>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    input, select { display: block; margin: 10px 0; padding: 8px; width: 300px; }
    button { margin: 5px 5px 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: bold; }
    .badge { background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; }
    .badge.inactive { background: #9E9E9E; }
    .small { padding: 5px 10px; font-size: 12px; }
    .danger { background: #f44336; color: white; }
    .card { border: 1px solid #ddd; border-radius: 4px; }
    .muted { color: #666; }
  `]
})
export class SuperadminAdminsComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  admins = signal<AdminUser[]>([]);
  categories = signal<Organization[]>([]);
  showNewForm = signal(false);
  newForm = { username: '', email: '', password: '', orgId: null as number | null };

  ngOnInit() {
    this.loadCategories();
    this.loadAdmins();
  }

  loadAdmins() {
    const token = this.auth.token();
    if (!token) return;

    this.http.get<AdminUser[]>(
      `${environment.apiBase}/auth/superadmin/admins`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: (data) => this.admins.set(data),
      error: (err) => console.error('Failed to load admins', err)
    });
  }

  loadCategories() {
    const token = this.auth.token();
    if (!token) return;

    this.http.get<Organization[]>(
      `${environment.apiBase}/auth/superadmin/categories`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  toggleNewForm() {
    this.showNewForm.update(v => !v);
    if (!this.showNewForm()) this.newForm = { username: '', email: '', password: '', orgId: null };
  }

  createAdmin() {
    const { username, email, password, orgId } = this.newForm;
    if (!username || !email || !password || !orgId) {
      alert('Please fill in all fields');
      return;
    }

    const token = this.auth.token();
    if (!token) return;

    this.http.post(
      `${environment.apiBase}/auth/superadmin/admins`,
      { username, email, password, orgId },
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadAdmins();
        this.toggleNewForm();
      },
      error: (err) => alert('Error: ' + (err.error?.detail || err.message))
    });
  }

  editAdmin(admin: AdminUser) {
    const selectedOrg = this.categories().find(c => c.id === admin.orgId);
    const newOrgId = prompt(`Current: ${selectedOrg?.name || 'None'}\n\nSelect new org ID (or leave blank):`, admin.orgId?.toString() || '');
    if (newOrgId === null) return;

    const token = this.auth.token();
    if (!token) return;

    this.http.patch(
      `${environment.apiBase}/auth/superadmin/admins/${admin.id}`,
      newOrgId ? { orgId: parseInt(newOrgId) } : {},
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: () => this.loadAdmins(),
      error: (err) => alert('Error: ' + (err.error?.detail || err.message))
    });
  }

  archiveAdmin(id: number) {
    const admin = this.admins().find(a => a.id === id);
    const newStatus = admin?.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    const msg = newStatus === 'ARCHIVED' ? 'Archive this admin?' : 'Restore this admin?';
    if (!confirm(msg)) return;

    const token = this.auth.token();
    if (!token) return;

    this.http.patch(
      `${environment.apiBase}/auth/superadmin/admins/${id}`,
      { status: newStatus },
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: () => this.loadAdmins(),
      error: (err) => alert('Error: ' + (err.error?.detail || err.message))
    });
  }
}
