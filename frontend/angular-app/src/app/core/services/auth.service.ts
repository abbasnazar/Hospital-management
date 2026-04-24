import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _username = signal<string | null>(localStorage.getItem('hmis.username'));
  private _roles    = signal<string[]>(JSON.parse(localStorage.getItem('hmis.roles') ?? '[]'));

  username() { return this._username(); }
  roles()    { return this._roles(); }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('hmis.token');
  }

  token(): string | null { return localStorage.getItem('hmis.token'); }

  hasRole(role: string): boolean { return this._roles().includes(role); }

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiBase}/auth/login`, { username, password })
      .pipe(tap(r => {
        localStorage.setItem('hmis.token',   r.accessToken);
        localStorage.setItem('hmis.refresh', r.refreshToken);
        localStorage.setItem('hmis.username', username);
        localStorage.setItem('hmis.roles',   JSON.stringify(r.roles));
        this._username.set(username);
        this._roles.set(r.roles);
      }));
  }

  logout() {
    localStorage.removeItem('hmis.token');
    localStorage.removeItem('hmis.refresh');
    localStorage.removeItem('hmis.username');
    localStorage.removeItem('hmis.roles');
    this._username.set(null);
    this._roles.set([]);
  }
}
