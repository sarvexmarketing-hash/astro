"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Star,
  MessageSquare,
  Calendar,
  CreditCard,
  ShoppingBag,
  FileText,
  Tag,
  LifeBuoy,
  BarChart3,
  Settings,
  ShieldAlert,
  Menu,
  X,
  HelpCircle
} from "lucide-react"

const SIDEBAR_ITEMS = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Users",
    icon: Users,
    href: "/users",
  },
  {
    title: "Astrologers",
    icon: Star,
    href: "/astrologers",
  },
  {
    title: "Consultations",
    icon: MessageSquare,
    href: "/consultations",
  },
  {
    title: "Bookings",
    icon: Calendar,
    href: "/bookings",
  },
  {
    title: "Payments",
    icon: CreditCard,
    href: "/payments",
  },
  {
    title: "Services & Pooja",
    icon: Calendar,
    href: "/services",
  },
  {
    title: "Shop & Products",
    icon: ShoppingBag,
    href: "/shop",
  },
  {
    title: "Content",
    icon: FileText,
    href: "/content",
  },
  {
    title: "Promotions",
    icon: Tag,
    href: "/promotions",
  },
  {
    title: "Support",
    icon: LifeBuoy,
    href: "/support",
  },
  {
    title: "Reports",
    icon: BarChart3,
    href: "/reports",
  },
  {
    title: "Admin",
    icon: ShieldAlert,
    href: "/admin",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Enquiries",
    icon: HelpCircle,
    href: "/enquiries",
  }
]

export function Sidebar({ className, isMobileOpen, onClose }: { className?: string, isMobileOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 h-screen border-r bg-card flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1 overflow-y-auto">
        <div className="px-3 py-2 flex items-center justify-between lg:justify-start">
          <Link href="/" className="flex items-center gap-2 px-4 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
            <h2 className="text-xl font-bold tracking-tight text-primary">
              ASTROWAVE ADMIN
            </h2>
          </Link>
          {isMobileOpen && onClose && (
            <button onClick={onClose} className="lg:hidden p-2">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="px-3">
          <div className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
