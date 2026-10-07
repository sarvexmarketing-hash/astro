/**
 * Centralized API configuration for Admin Web panel.
 * Strictly prevents silent localhost fallback in production (ADM-01).
 */
export function getApiBaseUrl(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const url = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

  if (isProduction && !url) {
    throw new Error(
      'ADM-01 Production Blocker: Missing NEXT_PUBLIC_API_URL or API_BASE_URL. Silent fallback to localhost is strictly prohibited in production.'
    );
  }

  return url || 'https://astrowavebackend-production.up.railway.app/api';
}
