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
  ArrowLeft,
  Sparkles,
  Trash2,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await usersService.deleteAccount();
      logout();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

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
    <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header with back navigation */}
        <div className="flex items-center justify-between pb-2 border-b border-[#FDE68A]/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-[#18181B]" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-[#FEF08A] text-[#78350F]">
                  <UserIcon className="h-6 w-6" />
                </span>
                <span>My Profile & Account</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#71717A] mt-0.5 font-medium">
                Manage your personal credentials and consultation settings
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Left card: User badge */}
          <div className="bg-white rounded-3xl p-6 text-center space-y-5 border border-[#FDE68A] shadow-xs">
            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#F7C93E] p-1 flex items-center justify-center shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="h-full w-full rounded-full bg-[#FEF08A] flex items-center justify-center text-[#78350F] text-3xl font-black">
                  {fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-[#18181B] text-xl">{fullName || 'Seeker'}</h3>
              <div className="mt-1">
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#FEF08A] text-[#78350F] text-xs font-bold capitalize">
                  {user?.role || 'Customer'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#FDE68A]/60 space-y-2 text-xs">
              {user?.phone && (
                <div className="flex items-center gap-2 text-[#3F3F46] font-medium justify-center">
                  <Phone className="h-4 w-4 text-[#D97706]" />
                  <span>+91 {user.phone}</span>
                </div>
              )}
              {user?.email && (
                <div className="flex items-center gap-2 text-[#3F3F46] font-medium justify-center">
                  <Mail className="h-4 w-4 text-[#D97706]" />
                  <span className="truncate max-w-[200px]">{user.email}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#FDE68A]/60 space-y-2.5">
              <Link
                href="/wallet"
                className="w-full py-2.5 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF08A] border border-[#FDE68A] text-[#78350F] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <Wallet className="h-4 w-4 text-[#D97706]" />
                <span>Wallet Passes</span>
              </Link>

              <Link
                href="/bookings"
                className="w-full py-2.5 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF08A] border border-[#FDE68A] text-[#78350F] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <Calendar className="h-4 w-4 text-[#D97706]" />
                <span>Consultation History</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="w-full py-2.5 rounded-xl bg-[#FEE2E2] hover:bg-rose-100 border border-red-200 text-[#991B1B] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right card: Edit Form */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 space-y-5 border border-[#FDE68A] shadow-xs">
            <h2 className="text-lg font-extrabold text-[#18181B] border-b border-[#FDE68A] pb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#D97706]" />
              <span>Edit Details</span>
            </h2>

            {message && (
              <div className="p-3.5 rounded-2xl bg-[#DCFCE7] border border-emerald-300 text-[#166534] text-xs flex items-center gap-2.5 font-semibold">
                <CheckCircle className="h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-[#FEE2E2] border border-red-300 text-[#991B1B] text-xs flex items-center gap-2.5 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#18181B] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18181B] mb-1.5">Profile Picture URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFDF7] border border-[#FDE68A] text-[#18181B] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#F7C93E] focus:ring-2 focus:ring-[#FEF08A] transition-all"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 text-xs text-[#166534] flex items-center gap-2.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#16A34A] shrink-0" />
                <span>Account Protected by End-to-End JWT Session Security</span>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="py-3 px-8 rounded-full bg-[#F7C93E] hover:bg-[#F59E0B] text-[#18181B] font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-[#18181B]" /> : <span>Save Changes</span>}
              </button>
            </form>

            {/* Danger Zone: Account Deletion */}
            <div className="pt-6 border-t border-red-200 space-y-3">
              <h3 className="text-sm font-extrabold text-[#991B1B] flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-[#DC2626]" />
                <span>Danger Zone</span>
              </h3>
              <p className="text-xs text-[#71717A]">
                Permanently delete your profile, saved charts, and personal data. Transaction logs are retained in anonymized format for legal and regulatory compliance.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="py-2.5 px-5 rounded-full bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#991B1B] text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Delete Account?</h3>
                  <p className="text-xs text-gray-500">This action is permanent and cannot be undone.</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your profile details, birth details, and saved kundlis will be deleted immediately, and your session will be invalidated. Financial transaction history will be anonymized in compliance with regulatory requirements.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
