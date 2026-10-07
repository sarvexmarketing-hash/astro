"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./Sidebar"
import { TopNavigation } from "./TopNavigation"
import { setToken, getToken } from "@/lib/api-client"

/**
 * On mount, if localStorage has no token (e.g. existing session with only
 * an httpOnly cookie), fetch /api/auth/token to bootstrap the client-side
 * token from the server-side cookie. This fixes existing sessions without
 * requiring re-login.
 */
async function bootstrapToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (getToken()) return true // Already have it
  try {
    const res = await fetch('/api/auth/token')
    if (res.ok) {
      const data = await res.json()
      if (data.token) {
        setToken(data.token)
        return true
      }
    }
  } catch {
    // Silently ignore — user will be redirected to login by middleware
  }
  return false
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [tokenReady, setTokenReady] = useState(false)

  useEffect(() => {
    bootstrapToken().then(() => {
      setTokenReady(true)
      const token = getToken()
      if (!token && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login'
      }
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0">
        <Sidebar className="fixed inset-y-0 w-64 z-40" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-lg animate-in slide-in-from-left">
          <Sidebar isMobileOpen={true} onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content Area — children only mount after token is bootstrapped */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavigation onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden overflow-y-auto">
          {tokenReady ? children : (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
                <p className="text-sm">Loading dashboard...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
