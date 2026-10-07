import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      error: null,
    },
    { status }
  );
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      data: null,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('astro_access_token')?.value;
  if (!token) return null;

  try {
    const { getApiBaseUrl } = await import('./api-config');
    const API_BASE = getApiBaseUrl();
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (e) {
    return null;
  }
}
