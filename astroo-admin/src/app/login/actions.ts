'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getApiBaseUrl } from '@/lib/api-config'

const API_BASE = getApiBaseUrl()

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      return { error: data.error || 'Authentication failed' }
    }

    const userRole = data.data?.user?.role?.toLowerCase()
    if (userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'support' && userRole !== 'finance') {
      return { error: 'Access denied: You do not have administrator permissions.' }
    }

    const cookieStore = await cookies()
    cookieStore.set('astro_access_token', data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 60, // 30 minutes
    })

    return { success: true, accessToken: data.data.accessToken }
  } catch (err: any) {
    return { error: err.message || 'Failed to connect to authentication server' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('astro_access_token')
  revalidatePath('/', 'layout')
  redirect('/login')
}
