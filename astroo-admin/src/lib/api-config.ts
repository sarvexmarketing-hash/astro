/**
 * Centralized API configuration for Admin Web panel.
 * Defaults to the production Railway backend if not explicitly overridden.
 */
export function getApiBaseUrl(): string {
  const url = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  return url || 'https://astrowavebackend-production.up.railway.app/api';
}
