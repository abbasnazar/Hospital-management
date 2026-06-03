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
  funcs?: string[];
  orgId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _username = signal<string | null>(localStorage.getItem('hmis.username'));
  private _roles    = signal<string[]>(JSON.parse(localStorage.getItem('hmis.roles') ?? '[]'));
  private _funcs    = signal<string[]>(JSON.parse(localStorage.getItem('hmis.funcs') ?? '[]'));
  private _orgId    = signal<number | null>(localStorage.getItem('hmis.orgId') ? Number(localStorage.getItem('hmis.orgId')) : null);

  username() { return this._username(); }
  roles()    { return this._roles(); }
  funcs()    { return this._funcs(); }
  orgId()    { return this._orgId(); }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('hmis.token');
  }

  token(): string | null { return localStorage.getItem('hmis.token'); }

  hasRole(role: string): boolean { return this._roles().includes(role); }
  anyRole(...roles: string[]): boolean { return roles.some(r => this._roles().includes(r)); }

  hasFunc(code: string): boolean { return this._funcs().includes(code); }
  anyFunc(...codes: string[]): boolean { return codes.some(c => this._funcs().includes(c)); }

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiBase}/auth/login`, { username, password })
      .pipe(tap(r => {
        localStorage.setItem('hmis.token',   r.accessToken);
        localStorage.setItem('hmis.refresh', r.refreshToken);
        localStorage.setItem('hmis.username', username);
        localStorage.setItem('hmis.roles',   JSON.stringify(r.roles));
        localStorage.setItem('hmis.funcs',   JSON.stringify(r.funcs ?? []));
        if (r.orgId) localStorage.setItem('hmis.orgId', r.orgId.toString());
        this._username.set(username);
        this._roles.set(r.roles);
        this._funcs.set(r.funcs ?? []);
        this._orgId.set(r.orgId ?? null);
      }));
  }

  logout() {
    localStorage.removeItem('hmis.token');
    localStorage.removeItem('hmis.refresh');
    localStorage.removeItem('hmis.username');
    localStorage.removeItem('hmis.roles');
    localStorage.removeItem('hmis.funcs');
    localStorage.removeItem('hmis.orgId');
    this._username.set(null);
    this._roles.set([]);
    this._funcs.set([]);
    this._orgId.set(null);
  }
}
