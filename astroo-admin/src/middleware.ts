import { NextResponse, type NextRequest } from 'next/server';

function getRoleFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const jsonStr = Buffer.from(parts[1], 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr);
    return payload.role ? String(payload.role).toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  // 1. Inject Standard Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // 2. Check Authentication Cookie and verify Administrator role
  const token = request.cookies.get('astro_access_token')?.value;
  const role = getRoleFromToken(token);
  const isAdmin = Boolean(role && ['admin', 'super_admin', 'support', 'finance'].includes(role));

  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api');

  if (!isAdmin && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    if (token && !isAdmin) {
      url.searchParams.set('error', `Access restricted to administrators. Current role: ${role || 'guest'}`);
    }
    const redirectRes = NextResponse.redirect(url);
    if (token && !isAdmin) {
      redirectRes.cookies.delete('astro_access_token');
    }
    return redirectRes;
  }

  if (isAdmin && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
