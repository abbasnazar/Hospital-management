import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

interface Functionality {
  id: number;
  code: string;
  label: string;
  module: string;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  functionalities: Functionality[];
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Permission Groups</h1>
      <p class="muted">Create and manage permission groups by bundling functionalities</p>

      <button class="btn" (click)="toggleNewForm()">
        {{ showNewForm() ? '✕ Cancel' : '+ New Group' }}
      </button>

      <!-- Create form -->
      <div *ngIf="showNewForm()" class="card form-panel">
        <h3>Create New Group</h3>
        <input type="text" placeholder="Group name (e.g., 'Reception Staff')" [(ngModel)]="newForm.name" />
        <textarea placeholder="Description" [(ngModel)]="newForm.description" rows="3"></textarea>
        <h4>Select Functionalities</h4>
        <div class="func-grid">
          <label *ngFor="let func of allFuncs()" class="checkbox-item">
            <input type="checkbox" (change)="toggleNewFunc(func.id)" />
            <span>{{ func.label }} <small>({{ func.code }})</small></span>
          </label>
        </div>
        <button class="btn" (click)="createGroup()">Create Group</button>
      </div>

      <!-- Group list -->
      <div *ngIf="groups().length > 0" style="margin-top: 20px;">
        <div *ngFor="let group of groups()" class="group-card">
          <!-- View mode -->
          <ng-container *ngIf="editingId() !== group.id">
            <h3>{{ group.name }}</h3>
            <p *ngIf="group.description" class="description">{{ group.description }}</p>
            <div class="tags">
              <span *ngFor="let func of group.functionalities" class="tag">{{ func.code }}</span>
            </div>
            <div class="actions">
              <button class="btn small" (click)="startEdit(group)">Edit</button>
              <button class="btn small danger" (click)="deleteGroup(group.id)">Delete</button>
            </div>
          </ng-container>

          <!-- Edit mode -->
          <ng-container *ngIf="editingId() === group.id">
            <h3>Edit Group</h3>
            <input type="text" placeholder="Group name" [(ngModel)]="editForm.name" />
            <textarea placeholder="Description" [(ngModel)]="editForm.description" rows="3"></textarea>
            <h4>Functionalities</h4>
            <div class="func-grid">
              <label *ngFor="let func of allFuncs()" class="checkbox-item">
                <input type="checkbox"
                  [checked]="editForm.functionalityIds.includes(func.id)"
                  (change)="toggleEditFunc(func.id)" />
                <span>{{ func.label }} <small>({{ func.code }})</small></span>
              </label>
            </div>
            <div class="actions">
              <button class="btn" (click)="saveEdit(group.id)">Save</button>
              <button class="btn secondary" (click)="cancelEdit()">Cancel</button>
            </div>
          </ng-container>
        </div>
      </div>

      <p *ngIf="groups().length === 0" class="muted">No groups yet. Create one above.</p>
    </div>
  `,
  styles: [`
    .container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    h1 { margin: 0 0 .3rem 0; color: #0f2a4a; }
    h3 { color: #0f2a4a; margin-top: 0; }
    h4 { margin: 18px 0 10px 0; color: #475569; font-size: .9rem; text-transform: uppercase; letter-spacing: .05em; }
    .muted { color: #64748b; margin-top: 0; }
    input[type="text"], input[type="email"], input[type="password"], textarea, select {
      display: block; margin: 10px 0; padding: 10px 12px; width: 100%; box-sizing: border-box;
      border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-family: inherit;
    }
    input[type="text"]:focus, input[type="email"]:focus, textarea:focus, select:focus { outline: none; border-color: #2196F3; box-shadow: 0 0 0 3px rgba(33,150,243,.1); }
    textarea { min-height: 70px; resize: vertical; }
    .btn { background: #0f2a4a; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer; font-size: .88rem; font-weight: 600; transition: all .15s; }
    .btn:hover { background: #1e3a5f; transform: translateY(-1px); }
    .btn.small { padding: 6px 12px; font-size: .78rem; }
    .btn.danger { background: #ef4444; }
    .btn.danger:hover { background: #dc2626; }
    .btn.secondary { background: #e2e8f0; color: #0f2a4a; }
    .btn.secondary:hover { background: #cbd5e1; }
    .form-panel, .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px; margin: 18px 0; box-shadow: 0 1px 3px rgba(15,42,74,.05); }
    .func-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
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
    .checkbox-item:hover { border-color: #2196F3; background: #f0f9ff; }
    .checkbox-item input[type="checkbox"] {
      width: 18px; height: 18px;
      margin: 0; padding: 0;
      flex-shrink: 0;
      cursor: pointer;
      accent-color: #2196F3;
    }
    .checkbox-item:has(input:checked) { border-color: #2196F3; background: #eff6ff; }
    .checkbox-item span { font-size: .9rem; color: #0f2a4a; line-height: 1.3; flex: 1; min-width: 0; }
    .checkbox-item small { display: block; color: #64748b; font-size: .7rem; font-family: monospace; margin-top: 2px; }
    .group-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 22px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(15,42,74,.05); }
    .group-card h3 { margin-bottom: 6px; }
    .description { color: #64748b; font-size: .9rem; margin: 4px 0 12px; }
    .tags { margin: 10px 0 14px; display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { display: inline-block; background: #2196F3; color: white; padding: 4px 10px; border-radius: 12px; font-size: .72rem; font-weight: 500; }
    .actions { display: flex; gap: 8px; }
  `]
})
export class AdminGroupsComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  groups = signal<Group[]>([]);
  allFuncs = signal<Functionality[]>([]);
  showNewForm = signal(false);
  editingId = signal<number | null>(null);

  newForm = { name: '', description: '', functionalityIds: [] as number[] };
  editForm = { name: '', description: '', functionalityIds: [] as number[] };

  ngOnInit() {
    this.loadFunctionalities();
    this.loadGroups();
  }

  private headers() {
    return { 'Authorization': `Bearer ${this.auth.token()}` };
  }

  loadFunctionalities() {
    if (!this.auth.token()) return;
    this.http.get<Functionality[]>(`${environment.apiBase}/auth/admin/functionalities`, { headers: this.headers() })
      .subscribe({ next: d => this.allFuncs.set(d), error: e => console.error(e) });
  }

  loadGroups() {
    if (!this.auth.token()) return;
    this.http.get<Group[]>(`${environment.apiBase}/auth/admin/groups`, { headers: this.headers() })
      .subscribe({ next: d => this.groups.set(d), error: e => console.error(e) });
  }

  toggleNewForm() {
    this.showNewForm.update(v => !v);
    if (!this.showNewForm()) this.newForm = { name: '', description: '', functionalityIds: [] };
  }

  toggleNewFunc(id: number) {
    const idx = this.newForm.functionalityIds.indexOf(id);
    idx > -1 ? this.newForm.functionalityIds.splice(idx, 1) : this.newForm.functionalityIds.push(id);
  }

  createGroup() {
    if (!this.newForm.name) { alert('Group name is required'); return; }
    this.http.post(`${environment.apiBase}/auth/admin/groups`,
      { name: this.newForm.name, description: this.newForm.description, functionalityIds: this.newForm.functionalityIds },
      { headers: this.headers() }
    ).subscribe({
      next: () => { this.loadGroups(); this.toggleNewForm(); },
      error: e => alert('Error: ' + (e.error?.detail || e.message))
    });
  }

  startEdit(group: Group) {
    this.editingId.set(group.id);
    this.editForm = {
      name: group.name,
      description: group.description ?? '',
      functionalityIds: group.functionalities.map(f => f.id)
    };
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  toggleEditFunc(id: number) {
    const idx = this.editForm.functionalityIds.indexOf(id);
    idx > -1 ? this.editForm.functionalityIds.splice(idx, 1) : this.editForm.functionalityIds.push(id);
  }

  saveEdit(id: number) {
    if (!this.editForm.name) { alert('Group name is required'); return; }
    this.http.patch(`${environment.apiBase}/auth/admin/groups/${id}`,
      { name: this.editForm.name, description: this.editForm.description, functionalityIds: this.editForm.functionalityIds },
      { headers: this.headers() }
    ).subscribe({
      next: () => { this.cancelEdit(); this.loadGroups(); },
      error: e => alert('Error: ' + (e.error?.detail || e.message))
    });
  }

  deleteGroup(id: number) {
    if (!confirm('Delete this group?')) return;
    this.http.delete(`${environment.apiBase}/auth/admin/groups/${id}`, { headers: this.headers() })
      .subscribe({ next: () => this.loadGroups(), error: e => alert('Error: ' + (e.error?.detail || e.message)) });
  }
}
