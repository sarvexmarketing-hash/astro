'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AstrologerSidebar from './AstrologerSidebar';
import AstrologerHeader from './AstrologerHeader';
import GlobalCallListener from './GlobalCallListener';
import {
  Loader2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  User as UserIcon,
  FileText,
  Sparkles,
} from 'lucide-react';

interface PortalGuardProps {
  children: React.ReactNode;
}

export default function PortalGuard({ children }: PortalGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isAuthenticated,
    isAstrologer,
    isVerifiedAstrologer,
    verificationStatus,
    user,
    refreshUser,
    logout,
    isLoading,
  } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isAuthRoute = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!isLoading && !isAuthRoute) {
      if (!isAuthenticated || !isAstrologer) {
        const redirectParam = pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
        router.replace(`/login${redirectParam}`);
      }
    }
  }, [isLoading, isAuthenticated, isAstrologer, isAuthRoute, pathname, router]);

  // If viewing public auth route (Login or Register), render without sidebar/header shell
  if (isAuthRoute) {
    return <div className="min-h-screen bg-[#FFFDF7] text-[#18181B]">{children}</div>;
  }

  // If loading or unauthenticated, show loading splash while redirecting
  if (isLoading || !isAuthenticated || !isAstrologer) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center text-[#18181B]">
        <div className="w-20 h-20 relative mb-4">
          <img
            src="/astrologer/images/app_logo.png"
            alt="Astrowave"
            className="w-full h-full rounded-2xl shadow-md object-contain"
          />
        </div>
        <h2 className="text-lg font-bold text-[#18181B] tracking-tight">ASTROWAVE</h2>
        <p className="text-xs text-[#D97706] font-semibold mt-1">Practitioner Portal</p>
        <div className="flex items-center gap-2 mt-6 text-xs text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span>Verifying astrologer credentials...</span>
        </div>
      </div>
    );
  }

  // If astrologer account is NOT verified (pending admin verification or rejected), show Waiting Room
  if (!isVerifiedAstrologer) {
    const handleCheckStatus = async () => {
      try {
        setIsCheckingStatus(true);
        setStatusMessage(null);
        await refreshUser();
        setStatusMessage("Verification status checked with backend.");
      } catch (err: any) {
        setStatusMessage("Could not refresh status. Please try again.");
      } finally {
        setIsCheckingStatus(false);
      }
    };

    const isRejected = verificationStatus === 'rejected';

    return (
      <div className="min-h-screen bg-[#FFFDF7] text-[#18181B] flex flex-col">
        {/* Verification Top Nav */}
        <header className="h-16 border-b border-[#FDE68A]/60 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <img
              src="/astrologer/images/app_logo.png"
              alt="Astrowave"
              className="w-8 h-8 rounded-lg object-contain shadow-xs"
            />
            <div>
              <span className="font-bold text-sm tracking-tight text-[#18181B]">ASTROWAVE</span>
              <span className="block text-[10px] text-[#D97706] font-semibold uppercase tracking-wider">
                Practitioner Verification
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Verification Body */}
        <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-[#FDE68A] shadow-sm p-6 sm:p-8 space-y-6">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-amber-100">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
                    isRejected
                      ? 'bg-rose-50 border border-rose-200 text-rose-600'
                      : 'bg-amber-50 border border-amber-200 text-amber-600'
                  }`}
                >
                  {isRejected ? (
                    <ShieldAlert className="w-7 h-7" />
                  ) : (
                    <Clock className="w-7 h-7 animate-pulse" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#18181B]">
                    {isRejected ? 'Verification Needs Attention' : 'Application Under Review'}
                  </h1>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {isRejected
                      ? 'Your profile could not be verified by the admin team'
                      : 'Your application has been submitted to the Admin team for KYC verification'}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-center ${
                  isRejected
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isRejected ? 'Verification Rejected' : 'Pending Admin KYC'}
              </span>
            </div>

            {/* Status Message / Notification */}
            {statusMessage && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-center">
                {statusMessage}
              </div>
            )}

            {/* Explanation */}
            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-amber-200/80 text-xs text-zinc-700 leading-relaxed space-y-2">
              <p className="font-semibold text-[#B45309] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Vedic Practitioner Quality & Security Guarantee
              </p>
              <p>
                To maintain authentic Vedic consultations and protect seekers across India, every astrologer, pandit, and tarot master must be verified by the Astrowave Administrative Team before live consultations, chats, and audio calls are activated.
              </p>
              <p>
                Once an administrator reviews your application in the Admin Portal, your dashboard will automatically unlock.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Application Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-medium">Practitioner Name</span>
                    <span className="font-semibold text-zinc-800">
                      {user?.fullName || user?.full_name || 'Astrologer'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-medium">Registered Phone</span>
                    <span className="font-semibold text-zinc-800">{user?.phone || '—'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-medium">Registered Email</span>
                    <span className="font-semibold text-zinc-800">{user?.email || '—'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-medium">Verification Status</span>
                    <span className="font-bold text-amber-700">
                      {isRejected ? 'Rejected' : 'Under Review (Admin KYC)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={isCheckingStatus}
                className="w-full sm:flex-1 h-12 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#1E1E1E] font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isCheckingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Check Verification Status</span>
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full sm:w-auto px-5 h-12 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 text-center">
              Need assistance with your verification? Contact our support desk at{' '}
              <a href="mailto:support@astrowave.com" className="text-amber-700 font-semibold underline">
                support@astrowave.com
              </a>
            </p>
          </div>
        </main>
      </div>
    );
  }

  // User is fully authenticated and verified as astrologer - render full portal shell
  return (
    <div className="min-h-screen flex antialiased bg-[#FFFDF7] text-[#18181B]">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block">
        <AstrologerSidebar />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10">
            <AstrologerSidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Application Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#FFFDF7]">
        <AstrologerHeader onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#FFFDF7] text-[#18181B]">
          {children}
        </main>
      </div>

      <GlobalCallListener />
    </div>
  );
}
