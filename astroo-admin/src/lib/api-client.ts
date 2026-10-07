import { getApiBaseUrl } from './api-config';
const API_BASE = getApiBaseUrl();

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem('astro_access_token') || sessionStorage.getItem('astro_access_token');
  if (local) return local;
  const match = document.cookie.match(/(^|;)\s*astro_access_token\s*=\s*([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('astro_access_token', token);
    document.cookie = `astro_access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('astro_access_token');
    document.cookie = `astro_access_token=; path=/; max-age=0; SameSite=Lax`;
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    if (typeof window !== 'undefined' && (response.status === 401 || response.status === 403)) {
      clearToken();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = `/admin/login?error=${encodeURIComponent(errorMsg)}`;
      }
    }
    throw new ApiError(response.status, errorMsg);
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
