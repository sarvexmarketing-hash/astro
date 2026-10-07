'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { astrologerService } from '../services/astrologer';
import { usersService } from '../services/users';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Power, Loader2 } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function AstrologerHeader({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    astrologerService.getMyProfile().then((prof) => {
      if (isMounted && prof && typeof prof.is_online === 'boolean') {
        setIsOnline(prof.is_online);
      }
    }).catch(() => {});

    usersService.getNotifications(10).then((notifs) => {
      if (isMounted) {
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      }
    }).catch(() => {});

    const handleSync = (e: any) => {
      if (typeof e?.detail?.isOnline === 'boolean') {
        setIsOnline(e.detail.isOnline);
      }
    };
    window.addEventListener('astro_online_status_changed', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('astro_online_status_changed', handleSync);
    };
  }, []);

  const handleToggleOnline = async () => {
    try {
      setIsUpdatingStatus(true);
      const nextStatus = !isOnline;
      await astrologerService.updateStatus({
        isOnline: nextStatus,
        isBusy: false,
      });
      setIsOnline(nextStatus);
      window.dispatchEvent(new CustomEvent('astro_online_status_changed', { detail: { isOnline: nextStatus } }));
    } catch (err) {
      console.error('Error toggling online status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <header className="h-16 border-b border-[#FDE68A]/60 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-[#71717A] hover:text-[#18181B]"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-black text-[#D97706] tracking-tight">Astrologer Command Center</h2>
          <p className="text-[10px] text-[#A16207] font-medium">Live consultation dispatch & queue</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Online / Offline Status Button */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#FDE68A] shadow-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                isOnline
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse'
                  : 'bg-zinc-400'
              }`}
            />
            <span className={`text-xs font-bold select-none ${isOnline ? 'text-emerald-700' : 'text-zinc-600'}`}>
              {isOnline ? 'Accepting Consultations' : 'Offline'}
            </span>
          </div>

          <button
            onClick={handleToggleOnline}
            disabled={isUpdatingStatus}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
              isOnline
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isUpdatingStatus ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Power className="h-3 w-3" />
            )}
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-full text-[#71717A] hover:text-[#D97706] hover:bg-[#FEF9C3] transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
