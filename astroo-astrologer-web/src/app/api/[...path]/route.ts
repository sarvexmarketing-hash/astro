import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = (
  process.env.BACKEND_URL
    ? `${process.env.BACKEND_URL}/api`
    : process.env.NEXT_PUBLIC_API_URL || 'https://astrowavebackend-production.up.railway.app/api'
).replace(/\/+$/, '');

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];
  const pathStr = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_BASE}/${pathStr}${search}`;

  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Strip host to prevent mismatch on reverse proxy destination
    if (lowerKey !== 'host') {
      forwardHeaders.set(key, value);
    }
  });

  // Forward origin acceptable to backend CORS/CSRF whitelist
  const trustedOrigin = process.env.TRUSTED_PROXY_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  forwardHeaders.set('origin', trustedOrigin);

  const method = req.method;
  const fetchOptions: RequestInit = {
    method,
    headers: forwardHeaders,
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(method)) {
    const body = await req.arrayBuffer();
    if (body.byteLength > 0) {
      fetchOptions.body = body;
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const responseBody = await response.arrayBuffer();

    const responseHeaders = new Headers();
    response.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lowerKey)) {
        responseHeaders.set(key, val);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`[Astrologer API Proxy Error] Failed to proxy ${method} ${targetUrl}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to backend service',
      },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
export const HEAD = proxyRequest;
