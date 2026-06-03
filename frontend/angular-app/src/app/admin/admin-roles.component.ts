import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

interface Group {
  id: number;
  name: string;
}

interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
  groups: Group[];
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Roles</h1>
      <p class="muted">Create and manage custom roles by assigning groups</p>

      <button class="btn" (click)="toggleNewForm()">
        {{ showNewForm() ? '✕ Cancel' : '+ New Role' }}
      </button>

      <div *ngIf="showNewForm()" class="card" style="margin: 20px 0; padding: 20px;">
        <h3>Create New Role</h3>
        <input type="text" placeholder="Role code (e.g., RECEPTION)" [(ngModel)]="newForm.code" />
        <input type="text" placeholder="Role name (e.g., Reception Officer)" [(ngModel)]="newForm.name" />
        <textarea placeholder="Description" [(ngModel)]="newForm.description" rows="3"></textarea>

        <h4>Assign Groups</h4>
        <div class="group-list">
          <label *ngFor="let group of allGroups()" class="checkbox-item">
            <input type="checkbox" (change)="toggleGroup(group.id)" />
            <span>{{ group.name }}</span>
          </label>
        </div>

        <button class="btn" (click)="createRole()">Create Role</button>
      </div>

      <div *ngIf="roles().length > 0" style="margin-top: 20px;">
        <div *ngFor="let role of roles()" class="role-card">
          <div class="header">
            <h3>{{ role.name }}<span class="code">({{ role.code }})</span></h3>
          </div>
          <p *ngIf="role.description" class="description">{{ role.description }}</p>
          <div *ngIf="role.groups.length > 0">
            <strong>Groups:</strong>
            <div class="tags">
              <span *ngFor="let group of role.groups" class="tag">{{ group.name }}</span>
            </div>
          </div>
          <div class="actions">
            <button class="btn small" (click)="editRole(role)">Edit</button>
            <button class="btn small danger" (click)="deleteRole(role.id)">Delete</button>
          </div>
        </div>
      </div>

      <p *ngIf="roles().length === 0" class="muted">No roles yet. Create one above.</p>
    </div>
  `,
  styles: [`
    .container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    h1 { margin: 0 0 .3rem 0; color: #0f2a4a; }
    h3 { color: #0f2a4a; margin-top: 0; }
    h4 { margin: 18px 0 10px 0; color: #475569; font-size: .9rem; text-transform: uppercase; letter-spacing: .05em; }
    .muted { color: #64748b; margin-top: 0; }
    input[type="text"], input[type="email"], input[type="password"], textarea {
      display: block; margin: 10px 0; padding: 10px 12px; width: 100%; box-sizing: border-box;
      border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-family: inherit;
    }
    input:focus, textarea:focus { outline: none; border-color: #2196F3; box-shadow: 0 0 0 3px rgba(33,150,243,.1); }
    textarea { min-height: 70px; resize: vertical; }
    .btn { background: #0f2a4a; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-size: .88rem; font-weight: 600; transition: all .15s; }
    .btn:hover { background: #1e3a5f; transform: translateY(-1px); }
    .btn.small { padding: 6px 12px; font-size: .78rem; }
    .btn.danger { background: #ef4444; }
    .btn.danger:hover { background: #dc2626; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px; margin: 18px 0; box-shadow: 0 1px 3px rgba(15,42,74,.05); }
    .group-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 10px;
      margin: 14px 0 18px;
    }
    .checkbox-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      background: #fff;
      transition: all .15s;
      user-select: none;
    }
    .checkbox-item:hover { border-color: #22C55E; background: #f0fdf4; }
    .checkbox-item input[type="checkbox"] {
      width: 18px; height: 18px;
      margin: 0; padding: 0;
      flex-shrink: 0;
      cursor: pointer;
      accent-color: #22C55E;
    }
    .checkbox-item:has(input:checked) { border-color: #22C55E; background: #ecfdf5; }
    .checkbox-item span { font-size: .9rem; color: #0f2a4a; }
    .role-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 22px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(15,42,74,.05); }
    .header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .header h3 { margin: 0; }
    .code { font-size: .72rem; color: #fff; background: #64748b; padding: 3px 9px; border-radius: 5px; font-family: monospace; }
    .description { color: #64748b; font-size: .9rem; margin: 8px 0 12px; }
    .tags { margin: 10px 0 14px; display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { display: inline-block; background: #22C55E; color: white; padding: 4px 10px; border-radius: 12px; font-size: .72rem; font-weight: 500; }
    .actions { display: flex; gap: 8px; }
  `]
})
export class AdminRolesComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  roles = signal<Role[]>([]);
  allGroups = signal<Group[]>([]);
  showNewForm = signal(false);
  newForm = { code: '', name: '', description: '', groupIds: [] as number[] };

  ngOnInit() {
    this.loadGroups();
    this.loadRoles();
  }

  loadGroups() {
    const token = this.auth.token();
    if (!token) return;

    this.http.get<Group[]>(
      `${environment.apiBase}/auth/admin/groups`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: (data) => this.allGroups.set(data),
      error: (err) => console.error('Failed to load groups', err)
    });
  }

  loadRoles() {
    const token = this.auth.token();
    if (!token) return;

    this.http.get<Role[]>(
      `${environment.apiBase}/auth/admin/roles`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: (data) => this.roles.set(data),
      error: (err) => console.error('Failed to load roles', err)
    });
  }

  toggleGroup(groupId: number) {
    const idx = this.newForm.groupIds.indexOf(groupId);
    if (idx > -1) {
      this.newForm.groupIds.splice(idx, 1);
    } else {
      this.newForm.groupIds.push(groupId);
    }
  }

  toggleNewForm() {
    this.showNewForm.update(v => !v);
    if (!this.showNewForm()) {
      this.newForm = { code: '', name: '', description: '', groupIds: [] };
    }
  }

  createRole() {
    if (!this.newForm.code || !this.newForm.name) {
      alert('Code and name are required');
      return;
    }

    const token = this.auth.token();
    if (!token) return;

    this.http.post(
      `${environment.apiBase}/auth/admin/roles`,
      {
        code: this.newForm.code,
        name: this.newForm.name,
        description: this.newForm.description,
        groupIds: this.newForm.groupIds
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadRoles();
        this.toggleNewForm();
      },
      error: (err) => alert('Error: ' + (err.error?.detail || err.message))
    });
  }

  editRole(role: Role) {
    alert('Edit role: ' + role.name + ' (coming soon)');
  }

  deleteRole(id: number) {
    if (!confirm('Delete this role?')) return;

    const token = this.auth.token();
    if (!token) return;

    this.http.delete(
      `${environment.apiBase}/auth/admin/roles/${id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: () => this.loadRoles(),
      error: (err) => alert('Error: ' + (err.error?.detail || err.message))
    });
  }
}
