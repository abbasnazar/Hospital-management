import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

interface Organization {
  id: number;
  name: string;
  category: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-superadmin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Categories</h1>
      <p class="muted">Manage hospital/clinic categories</p>

      <button class="btn" (click)="toggleNewForm()">
        {{ showNewForm() ? '✕ Cancel' : '+ New Category' }}
      </button>

      <div *ngIf="showNewForm()" class="card" style="margin: 20px 0; padding: 20px;">
        <h3>Create New Category</h3>
        <input type="text" placeholder="Category name" [(ngModel)]="newForm.name" />
        <input type="text" placeholder="Type (Hospital/Clinic/Lab)" [(ngModel)]="newForm.category" />
        <button class="btn" (click)="createCategory()">Create</button>
      </div>

      <div *ngIf="categories().length > 0" style="margin-top: 20px;">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let org of categories()">
              <td>{{ org.name }}</td>
              <td>{{ org.category }}</td>
              <td><span class="badge">{{ org.status }}</span></td>
              <td>{{ org.createdAt | date:'short' }}</td>
              <td>
                <button class="btn small" (click)="editCategory(org)">Edit</button>
                <button class="btn small danger" (click)="deleteCategory(org.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="categories().length === 0" class="muted">No categories yet</p>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    input { display: block; margin: 10px 0; padding: 8px; width: 300px; }
    button { margin: 5px 5px 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: bold; }
    .badge { background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; }
    .small { padding: 5px 10px; font-size: 12px; }
    .danger { background: #f44336; color: white; }
    .card { border: 1px solid #ddd; border-radius: 4px; }
    .muted { color: #666; }
  `]
})
export class SuperadminCategoriesComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);

  categories = signal<Organization[]>([]);
  showNewForm = signal(false);
  newForm = { name: '', category: '' };

  ngOnInit() {
    this.loadCategories();
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
    if (!this.showNewForm()) this.newForm = { name: '', category: '' };
  }

  createCategory() {
    if (!this.newForm.name || !this.newForm.category) {
      alert('Please fill in all fields');
      return;
    }

    const token = this.auth.token();
    if (!token) return;

    this.http.post(
      `${environment.apiBase}/auth/superadmin/categories`,
      this.newForm,
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadCategories();
        this.toggleNewForm();
      },
      error: (err) => alert('Error: ' + err.error?.detail || err.message)
    });
  }

  editCategory(org: Organization) {
    const newName = prompt('Edit name:', org.name);
    if (!newName) return;

    const token = this.auth.token();
    if (!token) return;

    this.http.patch(
      `${environment.apiBase}/auth/superadmin/categories/${org.id}`,
      { name: newName },
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: () => this.loadCategories(),
      error: (err) => alert('Error: ' + err.error?.detail || err.message)
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Are you sure?')) return;

    const token = this.auth.token();
    if (!token) return;

    this.http.delete(
      `${environment.apiBase}/auth/superadmin/categories/${id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).subscribe({
      next: () => this.loadCategories(),
      error: (err) => alert('Error: ' + err.error?.detail || err.message)
    });
  }
}
