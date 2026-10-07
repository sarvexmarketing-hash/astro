'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  History,
  TrendingUp,
  CreditCard,
  Clock,
  User,
  Bell,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export default function AstrologerSidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/requests', label: 'Consultation Requests', icon: MessageSquare },
    { href: '/consultations', label: 'Consultation History', icon: History },
    { href: '/earnings', label: 'Earnings & Ledger', icon: TrendingUp },
    { href: '/payouts', label: 'Bank Payouts', icon: CreditCard },
    { href: '/availability', label: 'Availability & Rates', icon: Clock },
    { href: '/profile', label: 'Profile & Documents', icon: User },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#FDE68A] flex flex-col justify-between p-4 shrink-0 shadow-xs">
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between px-2 py-3 mb-6 border-b border-[#FDE68A]/60">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-400/25">
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <div>
              <span className="text-base font-bold text-[#18181B] tracking-tight flex items-center gap-1">
                ASTRO<span className="text-[#D97706]">WAVE</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-[#B45309] font-bold">
                Practitioner Portal
              </span>
            </div>
          </Link>

          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 text-[#71717A] hover:text-[#18181B]">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/30'
                    : 'text-[#3F3F46] hover:bg-[#FEF9C3] hover:text-[#78350F]'
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-[#D97706]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-[#FDE68A]/60 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-[#FEF08A] border border-[#FDE68A] text-[#78350F] flex items-center justify-center font-bold text-xs shrink-0">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#18181B] truncate">{user?.fullName || 'Astrologer'}</p>
            <p className="text-[10px] text-[#15803D] font-bold">✓ Verified Practitioner</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
