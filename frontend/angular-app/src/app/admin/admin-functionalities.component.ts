import { Component, OnInit, inject, signal } from '@angular/core';
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
  description?: string;
}

@Component({
  selector: 'app-admin-functionalities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Functionalities</h1>
      <p class="muted">Reference guide: all available features you can assign to groups</p>

      <div *ngIf="functionalities().length > 0">
        <div class="filters">
          <select [(ngModel)]="filterModule">
            <option value="">All Modules</option>
            <option *ngFor="let module of modules()">{{ module }}</option>
          </select>
        </div>

        <div class="modules">
          <div *ngFor="let module of groupedByModule() | keyvalue" class="module-section">
            <h3>{{ module.key }}</h3>
            <div class="func-grid">
              <div *ngFor="let func of module.value" class="func-card">
                <div class="code">{{ func.code }}</div>
                <div class="label">{{ func.label }}</div>
                <div class="description" *ngIf="func.description">{{ func.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p *ngIf="functionalities().length === 0" class="muted">Loading functionalities...</p>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .filters { margin: 20px 0; }
    select { padding: 8px; font-size: 14px; }
    .modules { margin: 30px 0; }
    .module-section { margin-bottom: 40px; }
    .module-section h3 { color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px; margin-bottom: 15px; }
    .func-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
    .func-card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; background: #fafafa; }
    .code { font-weight: bold; color: #2196F3; font-family: monospace; font-size: 12px; }
    .label { margin: 5px 0; color: #333; }
    .description { margin-top: 8px; font-size: 12px; color: #666; }
    .muted { color: #666; }
  `]
})
export class AdminFunctionalitiesComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  functionalities = signal<Functionality[]>([]);
  modules = signal<string[]>([]);
  filterModule = '';

  ngOnInit() {
    this.loadFunctionalities();
  }

  loadFunctionalities() {
    const token = this.auth.token();
    if (!token) return;

    this.http.get<Functionality[]>(
      `${environment.apiBase}/auth/admin/functionalities`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: (data) => {
        this.functionalities.set(data);
        const uniqueModules = [...new Set(data.map(f => f.module))].sort();
        this.modules.set(uniqueModules);
      },
      error: (err) => console.error('Failed to load functionalities', err)
    });
  }

  groupedByModule() {
    const grouped: { [key: string]: Functionality[] } = {};
    this.functionalities().forEach(f => {
      if (this.filterModule && f.module !== this.filterModule) return;
      if (!grouped[f.module]) grouped[f.module] = [];
      grouped[f.module].push(f);
    });
    return grouped;
  }
}
