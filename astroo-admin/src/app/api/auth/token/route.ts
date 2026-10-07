import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/auth/token
 * Server-side bridge: reads the httpOnly astro_access_token cookie
 * and returns it as JSON so the browser-side api-client can store it
 * in localStorage for Bearer token authentication.
 *
 * This endpoint is only called from the same Next.js origin (localhost:3000),
 * so the httpOnly cookie is accessible server-side via next/headers.
 */
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('astro_access_token')?.value

  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 })
  }

  return NextResponse.json({ token })
}
