const DEFAULT_API_URL =
  process.env.BACKEND_URL
    ? (process.env.BACKEND_URL.endsWith('/api') ? process.env.BACKEND_URL : `${process.env.BACKEND_URL}/api`)
    : process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://astrowavebackend-production.up.railway.app/api';

const DEFAULT_SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.BACKEND_URL ? process.env.BACKEND_URL.replace(/\/api$/, '') : null) ||
  'https://astrowavebackend-production.up.railway.app';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/astrologer/api';
  }
  return DEFAULT_API_URL;
}

export function getSocketBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return DEFAULT_SOCKET_URL;
    }
    return DEFAULT_SOCKET_URL;
  }
  return DEFAULT_SOCKET_URL;
}
