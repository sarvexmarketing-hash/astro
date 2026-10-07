export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
}

export function getSocketBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin.replace(':3002', ':5001');
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
}
