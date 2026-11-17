const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://astrowavebackend-production.up.railway.app/api'
  : 'http://localhost:5001/api';

const DEFAULT_SOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'https://astrowavebackend-production.up.railway.app'
  : 'http://localhost:5001';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/astrologer/api';
  }
  return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

export function getSocketBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5001';
    }
    return process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin.replace(':3002', ':5001');
  }
  return process.env.NODE_ENV !== 'production' ? 'http://localhost:5001' : (process.env.NEXT_PUBLIC_SOCKET_URL || DEFAULT_SOCKET_URL);
}
