'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../services/users';
import {
  User as UserIcon,
  Phone,
  Mail,
  Wallet,
  Calendar,
  LogOut,
  ShieldCheck,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);
      await usersService.updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });
      await refreshUser();
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <UserIcon className="h-8 w-8 text-amber-400" />
          <span>My Profile & Account</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage your personal credentials and consultation settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left card: User badge */}
        <div className="glass-panel rounded-3xl p-6 text-center space-y-4">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-1 flex items-center justify-center shadow-xl">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400 text-3xl font-black">
                {fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-white text-lg">{fullName || 'Seeker'}</h3>
            <p className="text-xs text-amber-400 capitalize font-medium">{user?.role || 'Customer'}</p>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
            {user?.phone && (
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>+91 {user.phone}</span>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <Link
              href="/wallet"
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Wallet className="h-4 w-4 text-amber-400" />
              <span>Wallet Passes</span>
            </Link>

            <Link
              href="/bookings"
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Consultation History</span>
            </Link>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right card: Edit Form */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Edit Details</h2>

          {message && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Profile Picture URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Account Protected by End-to-End JWT Session Security</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Save Changes</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
