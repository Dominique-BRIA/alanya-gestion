import { api } from './api';

/** Connexion du superroot d'alanyaCenter : son identifiant, pas une adresse e-mail. */
export async function adminLogin(username: string, password: string) {
  const res = await api.post('/admin/auth/login', { username, password });
  const { accessToken, refreshToken, user } = res.data;
  localStorage.setItem('admin_token', accessToken);
  if (refreshToken) localStorage.setItem('admin_refresh', refreshToken);
  localStorage.setItem('admin_user', JSON.stringify(user));
  return user;
}

export function adminLogout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_refresh');
  localStorage.removeItem('admin_user');
  if (typeof window !== 'undefined') {
    window.location.href = '/gestion/login';
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_refresh');
}

export function getAdminUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('admin_user');
  return raw ? JSON.parse(raw) : null;
}

export function getAdminRole(): number {
  const u = getAdminUser();
  return u?.typeCompte ?? u?.type_compte ?? 0;
}

export function isSuperAdmin(): boolean {
  return getAdminRole() >= 2;
}

export function isAuthenticated(): boolean {
  return !!getAdminToken();
}
