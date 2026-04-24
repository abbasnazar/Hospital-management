import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar" *ngIf="auth.isLoggedIn()">
        <div class="brand">HMIS</div>
        <nav>
          <a routerLink="/dashboard"    routerLinkActive="active">Dashboard</a>
          <a routerLink="/patients"     routerLinkActive="active">Patients</a>
          <a routerLink="/appointments" routerLinkActive="active">Appointments</a>
          <a routerLink="/billing"      routerLinkActive="active">Billing</a>
        </nav>
        <div class="foot">
          <span class="user">{{ auth.username() }}</span>
          <button class="btn secondary" (click)="logout()">Logout</button>
        </div>
      </aside>
      <main class="content"><router-outlet></router-outlet></main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .sidebar { width: 240px; background: #0f2a4a; color: #fff; display: flex; flex-direction: column; padding: 1.2rem 1rem; }
    .brand { font-size: 1.4rem; font-weight: 700; letter-spacing: 2px; margin-bottom: 1.5rem; }
    nav { display: flex; flex-direction: column; gap: 0.35rem; }
    nav a { color: #cfe4ff; padding: 0.55rem 0.85rem; border-radius: 7px; text-decoration: none; }
    nav a:hover { background: rgba(255,255,255,0.08); }
    nav a.active { background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }
    .foot { margin-top: auto; display: flex; flex-direction: column; gap: 0.5rem; }
    .user { font-size: 0.85rem; opacity: 0.75; }
    .content { flex: 1; padding: 2rem; overflow-y: auto; }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
