import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const requireRoles = (...allowed: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (allowed.length === 0) return true;
  if (allowed.some(r => auth.hasRole(r))) return true;
  router.navigate(['/dashboard']);
  return false;
};

export const requireFuncs = (...required: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (required.length === 0) return true;
  if (required.some(f => auth.hasFunc(f))) return true;
  router.navigate(['/dashboard']);
  return false;
};

// Allow access if user has ANY of the given system roles OR ANY of the given functionalities.
// Useful when a route must accept both legacy hard-coded roles and the new custom perm-role users.
export const requireRolesOrFuncs = (roles: string[], funcs: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (roles.length === 0 && funcs.length === 0) return true;
  if (roles.some(r => auth.hasRole(r))) return true;
  if (funcs.some(f => auth.hasFunc(f))) return true;
  router.navigate(['/dashboard']);
  return false;
};
