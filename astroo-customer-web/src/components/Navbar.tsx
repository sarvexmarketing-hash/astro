"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/services/wallet";
import WalletModal from "./WalletModal";
import {
  Menu,
  X,
  Bell,
  User,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletOpen, setWalletOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      walletService
        .getWallet()
        .then((w) => {
          if (w?.balance !== undefined) setWalletBalance(Number(w.balance));
        })
        .catch(() => {});
    }
  }, [user]);

  // Completely hide customer header on /admin and /astrologers routes
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/astrologers")) {
    return null;
  }

  const isHome = pathname === "/";

  const drawerMenuItems = [
    { label: "Book a Pooja", icon: "🕉️", href: "/pooja" },
    { label: "Consultations", icon: "💬", href: "/astrologers?channel=chat" },
    { label: "Horoscope", icon: "☀️", href: "/#horoscope" },
    { label: "Free Services", icon: "⭐", href: "/kundli" },
    { label: "Calculators", icon: "🧮", href: "/kundli" },
    { label: "Panchang", icon: "📅", href: "/muhurat" },
    { label: "Shop", icon: "🛍️", href: "/#shop" },
    { label: "Blog", icon: "📖", href: "/#blog" },
  ];

  const desktopNavLinks = [
    { label: "Chat with Astrologer", href: "/astrologers?channel=chat" },
    { label: "Call Astrologer", href: "/astrologers?channel=call" },
    { label: "Daily Horoscope", href: "/#horoscope" },
    { label: "Free Kundli", href: "/kundli" },
    { label: "Book Muhurtham", href: "/muhurat" },
    { label: "Book Pooja", href: "/pooja" },
  ];

  return (
    <>
      {/* Responsive Header: Phone & Laptop compatible */}
      <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-b border-[#FDE68A]/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Menu / Back + Logo + Title & Telugu Subtitle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isHome ? (
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-1.5 -ml-1.5 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors cursor-pointer"
                aria-label="Open Menu"
                title="Menu Drawer"
              >
                <Menu className="w-6 h-6 text-[#18181B]" />
              </button>
            ) : (
              <button
                onClick={() => router.back()}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-[#FFFBEB] text-[#18181B] transition-colors cursor-pointer"
                aria-label="Go Back"
                title="Go Back"
              >
                <ArrowLeft className="w-6 h-6 text-[#18181B]" />
              </button>
            )}

            <Link href="/" className="flex items-center gap-2.5 select-none group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xs border border-amber-300 flex-shrink-0 bg-[#FFE814] flex items-center justify-center">
                <img
                  src="/images/app_logo.png"
                  alt="Astrowave Logo"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base sm:text-lg font-bold text-[#18181B] tracking-tight">
                  Astrowave
                </span>
                <span className="text-[11px] font-medium text-[#18181B]/70 -mt-0.5">
                  ఆస్ట్రోవేవ్
                </span>
              </div>
            </Link>
          </div>

          {/* Center (Desktop / Laptop): Quick Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {desktopNavLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    active
                      ? "bg-[#FEF08A] text-[#78350F] border border-[#F7C93E]"
                      : "text-[#3F3F46] hover:text-[#18181B] hover:bg-[#FFFBEB]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Language + Wallet + Notifications + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Badge if admin */}
            {user && ["admin", "super_admin"].includes(user.role) && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold border border-purple-300 transition-all shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Admin</span>
              </Link>
            )}

            {/* Language Button: A/आ */}
            <button
              type="button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[12px] font-bold text-[#18181B] hover:bg-[#FEF3C7] transition-colors cursor-pointer shadow-2xs"
              title="Change Language"
            >
              A/आ
            </button>

            {/* Wallet Pill Button: ₹balance */}
            <button
              onClick={() => setWalletOpen(true)}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center gap-1 text-xs font-bold text-[#18181B] transition-colors cursor-pointer shadow-2xs"
            >
              <span>₹{walletBalance.toFixed(0)}</span>
              <span className="text-[11px] text-[#D97706] font-extrabold hover:underline ml-0.5 hidden sm:inline">
                + Add
              </span>
            </button>

            {/* Notification Bell Button */}
            <Link
              href="/notifications"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] flex items-center justify-center text-[#18181B] transition-colors shadow-2xs relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#18181B]" />
            </Link>

            {/* Profile / Login Button */}
            {user ? (
              <Link
                href="/profile"
                className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] flex items-center gap-1.5 text-[#18181B] text-xs font-bold transition-colors shadow-2xs"
                title="Profile"
              >
                <User className="w-4 h-4 text-[#18181B]" />
                <span className="hidden sm:inline max-w-[80px] truncate">{user.fullName || "Profile"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-[#F7C93E] hover:bg-[#FACC15] border border-[#FDE68A] flex items-center gap-1.5 text-[#18181B] text-xs font-bold transition-colors shadow-2xs"
                title="Sign In"
              >
                <User className="w-4 h-4 text-[#18181B]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Desktop More Menu (Drawer trigger on desktop) */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="hidden lg:flex p-2 rounded-full hover:bg-[#FFFBEB] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
              title="All Categories & Menu"
            >
              <Menu className="w-5 h-5 text-[#18181B]" />
            </button>
          </div>
        </div>
      </header>

      {/* 1:1 HomeDrawerSheet matching HomeScreen.kt line 1572-1750 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Sheet (300px width) */}
          <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#FDE68A]/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FDE047] flex items-center justify-center text-sm shadow-2xs">
                  ☸️
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-bold text-[#18181B]">Astrowave</span>
                  <span className="text-[11px] font-medium text-[#18181B]/70 -mt-0.5">
                    ఆస్ట్రోవేవ్
                  </span>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-[#71717A] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Card or Sign In Button (HomeScreen.kt line 1633-1708) */}
            <div className="p-4 border-b border-[#FDE68A]/40">
              {user ? (
                <div
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full p-3 rounded-2xl bg-[#FEF3C7] border border-[#FDE047] flex items-center justify-between cursor-pointer hover:bg-[#FEF08A] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#D97706] text-white flex items-center justify-center font-bold text-sm">
                      {(user.fullName?.slice(0, 2) || user.fullName?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-[#1E1E1E]">
                        {user.fullName || "User"}
                      </span>
                      <span className="text-[10px] text-[#92400E]">
                        {user.phone || user.email || "+91 8886782434"}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-[#FDE047] text-[10px] font-bold text-[#1E1E1E]">
                    Edit
                  </span>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full py-2.5 px-4 rounded-full bg-[#FDE047] hover:bg-[#FACC15] text-center text-xs font-bold text-[#1E1E1E] shadow-2xs transition-colors"
                >
                  Sign In / Profile
                </Link>
              )}
            </div>

            {/* Menu Items (HomeScreen.kt line 1713-1750) */}
            <div className="flex-1 overflow-y-auto py-2">
              {drawerMenuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-[#FFFBEB] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-lg select-none">{item.icon}</span>
                    <span className="text-sm font-semibold text-[#18181B] group-hover:text-[#D97706] transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#D97706] transition-colors" />
                </Link>
              ))}

              {/* Admin Portal link if user is admin */}
              {user && ["admin", "super_admin"].includes(user.role) && (
                <Link
                  href="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between px-6 py-3.5 mt-2 bg-purple-50 hover:bg-purple-100 transition-colors group cursor-pointer border-t border-purple-200"
                >
                  <div className="flex items-center gap-3.5">
                    <ShieldCheck className="w-5 h-5 text-purple-700" />
                    <span className="text-sm font-bold text-purple-900">
                      Admin Portal
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-700" />
                </Link>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#FDE68A]/60 text-center">
              <p className="text-[11px] text-[#71717A]">
                100% Verified Vedic Guidance & Consultations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {walletOpen && (
        <WalletModal
          currentBalance={walletBalance}
          onClose={() => setWalletOpen(false)}
          onSuccess={(newBal) => setWalletBalance(newBal)}
        />
      )}
    </>
  );
}
