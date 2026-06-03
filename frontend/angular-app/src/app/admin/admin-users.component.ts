import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

interface PermRole {
  id: number;
  code: string;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  status: string;
  permRoles: PermRole[];
  organization?: { id: number; name: string };
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Users</h1>
      <p class="muted">Manage user accounts and their role assignments</p>

      <button class="btn" (click)="toggleNewForm()">
        {{ showNewForm() ? '✕ Cancel' : '+ Create User' }}
      </button>

      <!-- Create form -->
      <div *ngIf="showNewForm()" class="form-panel">
        <h3>Create New User</h3>
        <input type="text"     placeholder="Username"  [(ngModel)]="newForm.username" />
        <input type="email"    placeholder="Email"     [(ngModel)]="newForm.email" />
        <input type="password" placeholder="Password"  [(ngModel)]="newForm.password" />
        <label class="field-label">Assign Role</label>
        <select [(ngModel)]="newForm.permRoleId">
          <option [ngValue]="null">— Select Role —</option>
          <option *ngFor="let r of allRoles()" [ngValue]="r.id">{{ r.name }} ({{ r.code }})</option>
        </select>
        <button class="btn" (click)="createUser()">Create User</button>
      </div>

      <!-- User table -->
      <div *ngIf="users().length > 0" style="margin-top: 24px;">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let user of users()">
              <!-- Row view -->
              <tr *ngIf="editingId() !== user.id">
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span *ngFor="let r of user.permRoles" class="role-tag">{{ r.name }}</span>
                  <span *ngIf="user.permRoles.length === 0" class="muted">—</span>
                </td>
                <td>
                  <span class="badge" [class.inactive]="user.status !== 'ACTIVE'">{{ user.status }}</span>
                </td>
                <td>
                  <button class="btn small" (click)="startEdit(user)">Edit Roles</button>
                  <button class="btn small danger" (click)="toggleArchive(user)">
                    {{ user.status === 'ARCHIVED' ? 'Restore' : 'Archive' }}
                  </button>
                </td>
              </tr>

              <!-- Inline edit row -->
              <tr *ngIf="editingId() === user.id" class="edit-row">
                <td colspan="5">
                  <div class="edit-panel">
                    <div class="edit-header">
                      <strong>Assign roles to {{ user.username }}</strong>
                    </div>
                    <div class="role-grid">
                      <label *ngFor="let role of allRoles()" class="checkbox-item">
                        <input type="checkbox"
                          [checked]="editRoleIds().includes(role.id)"
                          (change)="toggleEditRole(role.id)" />
                        <div>
                          <div class="role-name">{{ role.name }}</div>
                          <div class="role-code">{{ role.code }}</div>
                        </div>
                      </label>
                    </div>
                    <div class="edit-actions">
                      <button class="btn" (click)="saveRoles(user.id)">Save</button>
                      <button class="btn secondary" (click)="cancelEdit()">Cancel</button>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>

      <p *ngIf="users().length === 0" class="muted" style="margin-top: 20px;">No users in your organization yet.</p>
    </div>
  `,
  styles: [`
    .container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    h1 { margin: 0 0 .3rem 0; color: #0f2a4a; }
    h3 { color: #0f2a4a; margin-top: 0; }
    .muted { color: #64748b; margin-top: 0; }
    input[type="text"], input[type="email"], input[type="password"], select {
      display: block; margin: 10px 0; padding: 10px 12px; width: 100%; box-sizing: border-box;
      border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-family: inherit;
    }
    input:focus, select:focus { outline: none; border-color: #2196F3; box-shadow: 0 0 0 3px rgba(33,150,243,.1); }
    .field-label { font-size: .8rem; color: #475569; margin-top: 10px; display: block; font-weight: 500; }
    .form-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px; margin: 18px 0; box-shadow: 0 1px 3px rgba(15,42,74,.05); }
    .btn { background: #0f2a4a; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-size: .88rem; font-weight: 600; transition: all .15s; }
    .btn:hover { background: #1e3a5f; transform: translateY(-1px); }
    .btn.small { padding: 6px 12px; font-size: .78rem; }
    .btn.danger { background: #ef4444; }
    .btn.danger:hover { background: #dc2626; }
    .btn.secondary { background: #e2e8f0; color: #0f2a4a; }
    .btn.secondary:hover { background: #cbd5e1; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(15,42,74,.05); }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    th { background: #f8fafc; font-weight: 600; font-size: .78rem; color: #475569; text-transform: uppercase; letter-spacing: .04em; }
    tr:last-child td { border-bottom: none; }
    .badge { background: #22C55E; color: white; padding: 4px 10px; border-radius: 12px; font-size: .72rem; font-weight: 600; }
    .badge.inactive { background: #94a3b8; }
    .role-tag { display: inline-block; background: #2196F3; color: #fff; padding: 3px 10px; border-radius: 12px; font-size: .72rem; margin: 2px 4px 2px 0; font-weight: 500; }
    .edit-row td { padding: 0; background: #f0f9ff; }
    .edit-panel { padding: 20px 22px; }
    .edit-header { margin-bottom: 14px; font-size: .95rem; color: #0f2a4a; }
    .role-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 10px;
      margin-bottom: 16px;
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
    .checkbox-item:hover { border-color: #2196F3; background: #f0f9ff; }
    .checkbox-item input[type="checkbox"] {
      width: 18px; height: 18px;
      margin: 0; padding: 0;
      flex-shrink: 0;
      cursor: pointer;
      accent-color: #2196F3;
    }
    .checkbox-item:has(input:checked) { border-color: #2196F3; background: #eff6ff; }
    .role-name { font-size: .9rem; font-weight: 500; color: #0f2a4a; }
    .role-code { font-size: .7rem; color: #64748b; font-family: monospace; margin-top: 2px; }
    .edit-actions { display: flex; gap: 8px; }
  `]
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  users = signal<User[]>([]);
  allRoles = signal<PermRole[]>([]);
  showNewForm = signal(false);
  editingId = signal<number | null>(null);
  editRoleIds = signal<number[]>([]);

  newForm = { username: '', email: '', password: '', permRoleId: null as number | null };

  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
  }

  private headers() {
    return { 'Authorization': `Bearer ${this.auth.token()}` };
  }

  loadRoles() {
    if (!this.auth.token()) return;
    this.http.get<PermRole[]>(`${environment.apiBase}/auth/admin/roles`, { headers: this.headers() })
      .subscribe({ next: d => this.allRoles.set(d), error: e => console.error(e) });
  }

  loadUsers() {
    if (!this.auth.token()) return;
    this.http.get<User[]>(`${environment.apiBase}/auth/admin/users`, { headers: this.headers() })
      .subscribe({ next: d => this.users.set(d), error: e => console.error(e) });
  }

  toggleNewForm() {
    this.showNewForm.update(v => !v);
    if (!this.showNewForm()) this.newForm = { username: '', email: '', password: '', permRoleId: null };
  }

  createUser() {
    const { username, email, password, permRoleId } = this.newForm;
    if (!username || !email || !password || !permRoleId) { alert('Please fill in all fields'); return; }
    this.http.post(`${environment.apiBase}/auth/admin/users`,
      { username, email, password, permRoleId },
      { headers: this.headers() }
    ).subscribe({
      next: () => { this.loadUsers(); this.toggleNewForm(); },
      error: e => alert('Error: ' + (e.error?.detail || e.message))
    });
  }

  startEdit(user: User) {
    this.editingId.set(user.id);
    this.editRoleIds.set(user.permRoles.map(r => r.id));
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editRoleIds.set([]);
  }

  toggleEditRole(id: number) {
    const current = this.editRoleIds();
    const idx = current.indexOf(id);
    this.editRoleIds.set(idx > -1 ? current.filter(x => x !== id) : [...current, id]);
  }

  saveRoles(userId: number) {
    this.http.patch(`${environment.apiBase}/auth/admin/users/${userId}`,
      { permRoleIds: this.editRoleIds() },
      { headers: this.headers() }
    ).subscribe({
      next: () => { this.cancelEdit(); this.loadUsers(); },
      error: e => alert('Error: ' + (e.error?.detail || e.message))
    });
  }

  toggleArchive(user: User) {
    const newStatus = user.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    if (!confirm(newStatus === 'ARCHIVED' ? 'Archive this user?' : 'Restore this user?')) return;
    this.http.patch(`${environment.apiBase}/auth/admin/users/${user.id}`,
      { status: newStatus },
      { headers: this.headers() }
    ).subscribe({
      next: () => this.loadUsers(),
      error: e => alert('Error: ' + (e.error?.detail || e.message))
    });
  }
}
