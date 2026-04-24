import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrap">
      <div class="card login-card">
        <h1>HMIS Login</h1>
        <p class="muted">Sign in to access the hospital management system</p>
        <form (ngSubmit)="submit()">
          <label>Username</label>
          <input name="u" [(ngModel)]="username" required autocomplete="username">
          <div style="height: .75rem"></div>
          <label>Password</label>
          <input name="p" [(ngModel)]="password" type="password" required autocomplete="current-password">
          <div class="alert error" *ngIf="error()">{{ error() }}</div>
          <div style="height: 1rem"></div>
          <button class="btn" type="submit" [disabled]="loading()">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrap { min-height: 100vh; display: grid; place-items: center; background: linear-gradient(135deg, #14477a, #0aa57c); }
    .login-card { width: 360px; }
    h1 { margin: 0 0 .3rem; }
    .muted { color: var(--hmis-muted); margin-top: 0; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error   = signal<string | null>(null);

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.username, this.password).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: (err) => { this.loading.set(false); this.error.set(err?.error?.detail ?? 'Login failed'); }
    });
  }
}
