/**
 * Centralized API configuration for Admin Web panel.
 * Connects to local backend in development, and production Railway in production.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/admin/api';
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:5001/api';
  }
  const url = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  return url || 'https://astrowavebackend-production.up.railway.app/api';
}
