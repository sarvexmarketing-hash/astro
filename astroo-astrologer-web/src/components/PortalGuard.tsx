'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AstrologerSidebar from './AstrologerSidebar';
import AstrologerHeader from './AstrologerHeader';
import GlobalCallListener from './GlobalCallListener';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface PortalGuardProps {
  children: React.ReactNode;
}

export default function PortalGuard({ children }: PortalGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAstrologer, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <Image
            src="/images/app_logo.png"
            alt="Astrowave"
            fill
            className="rounded-2xl shadow-md object-contain"
            priority
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

  // User is fully authenticated as astrologer - render full portal shell
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
