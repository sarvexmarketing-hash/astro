"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  Search,
  Menu,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  DollarSign,
  UserCheck,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { api, clearToken } from "@/lib/api-client"
import { logout } from "@/app/login/actions"

export interface AdminNotification {
  id: string
  title: string
  message: string
  type: string
  link?: string
  isRead: boolean
  createdAt: string
}

export function TopNavigation({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    clearToken()
    await logout()
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      // Attempt backend admin notifications endpoint
      const res = await api.get('/admin/notifications').catch(() => null)
      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data)
        setUnreadCount(res.unreadCount ?? res.data.filter((n: AdminNotification) => !n.isRead).length)
        return
      }

      // Fallback: Check astrologers endpoint for pending KYC
      const astroRes = await api.get('/admin/astrologers').catch(() => null)
      if (astroRes?.success && Array.isArray(astroRes.data)) {
        const pending = astroRes.data.filter((a: any) =>
          a.verification_status === 'pending' || a.is_verified === false
        )
        const mapped: AdminNotification[] = pending.map((a: any) => ({
          id: `kyc-${a.id}`,
          title: "Astrologer KYC Verification Required",
          message: `${a.display_name || 'Practitioner'} (${a.phone || a.email || 'New'}) submitted KYC application for admin approval.`,
          type: "kyc",
          link: "/astrologers",
          isRead: false,
          createdAt: a.created_at || new Date().toISOString(),
        }))
        setNotifications(mapped)
        setUnreadCount(mapped.length)
      }
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds for live admin updates
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = (notif: AdminNotification) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    setIsNotifOpen(false)
    if (notif.link) {
      router.push(notif.link)
    }
  }

  function formatRelativeTime(dateStr: string) {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      return `${Math.floor(diffHours / 24)}d ago`
    } catch {
      return "Recent"
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 shadow-xs sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className="w-full flex-1">
        <form className="hidden sm:flex max-w-sm items-center relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users, astrologers, transactions..."
            className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Dropdown */}
        <DropdownMenu open={isNotifOpen} onOpenChange={setIsNotifOpen}>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full border border-border inline-flex items-center justify-center cursor-pointer hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Toggle notifications</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-xl border border-border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Admin Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 text-[10px] font-bold">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-foreground">All clear!</p>
                  <p className="mt-0.5">No pending admin notifications or KYC requests.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isKyc = notif.type === 'kyc'
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-muted/60 transition-colors cursor-pointer text-left ${
                        !notif.isRead ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isKyc
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}
                      >
                        {isKyc ? <Clock className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-red-600 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-2 border-t border-border bg-muted/20 text-center">
              <Link
                href="/astrologers"
                onClick={() => setIsNotifOpen(false)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline flex items-center justify-center gap-1 py-1"
              >
                <span>Review Pending Astrologer KYC</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-9 w-9 border border-border cursor-pointer">
              <AvatarFallback className="bg-amber-500/20 text-amber-600 font-bold text-xs">AD</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Platform Administrator</p>
                <p className="text-xs leading-none text-muted-foreground">Authorized Super Admin</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/astrologers')} className="cursor-pointer">
              Astrologers & Pandits
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
